import { Audio } from 'expo-av';
import { Platform } from 'react-native';

// Sound effect types
export type SoundType =
  | 'keyPress'
  | 'keyDelete'
  | 'submit'
  | 'flipCorrect'
  | 'flipPresent'
  | 'flipAbsent'
  | 'win'
  | 'lose'
  | 'error';

// Sound configuration
interface SoundConfig {
  enabled: boolean;
  volume: number;
}

let soundConfig: SoundConfig = {
  enabled: true,
  volume: 0.5,
};

// Preloaded sounds cache
const soundCache: Map<SoundType, Audio.Sound> = new Map();

// Sound frequencies for generated tones (fallback when no audio files)
const SOUND_FREQUENCIES: Record<SoundType, { frequency: number; duration: number; type: OscillatorType }> = {
  keyPress: { frequency: 600, duration: 50, type: 'sine' },
  keyDelete: { frequency: 400, duration: 50, type: 'sine' },
  submit: { frequency: 800, duration: 100, type: 'sine' },
  flipCorrect: { frequency: 880, duration: 150, type: 'sine' },
  flipPresent: { frequency: 660, duration: 150, type: 'sine' },
  flipAbsent: { frequency: 330, duration: 150, type: 'triangle' },
  win: { frequency: 1047, duration: 500, type: 'sine' },
  lose: { frequency: 220, duration: 400, type: 'sawtooth' },
  error: { frequency: 200, duration: 200, type: 'square' },
};

// Initialize audio settings
export async function initializeAudio(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: false,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
  } catch (error) {
    console.log('Audio initialization error:', error);
  }
}

// Configure sound settings
export function configureSounds(config: Partial<SoundConfig>): void {
  soundConfig = { ...soundConfig, ...config };
}

// Check if sounds are enabled
export function isSoundEnabled(): boolean {
  return soundConfig.enabled;
}

// Toggle sounds
export function toggleSounds(enabled: boolean): void {
  soundConfig.enabled = enabled;
}

// Set volume
export function setVolume(volume: number): void {
  soundConfig.volume = Math.max(0, Math.min(1, volume));
}

// Play a sound effect using Web Audio API (works on all platforms)
export async function playSound(type: SoundType): Promise<void> {
  if (!soundConfig.enabled) return;

  try {
    // For web, use Web Audio API
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.AudioContext) {
      playWebSound(type);
      return;
    }

    // For native, use expo-av with generated beep
    await playNativeSound(type);
  } catch (error) {
    // Silently fail - sounds are non-critical
    console.log('Sound playback error:', error);
  }
}

// Web Audio API implementation
function playWebSound(type: SoundType): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const audioContext = new AudioContextClass();
    const config = SOUND_FREQUENCIES[type];

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = config.type;
    oscillator.frequency.setValueAtTime(config.frequency, audioContext.currentTime);

    gainNode.gain.setValueAtTime(soundConfig.volume * 0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + config.duration / 1000);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + config.duration / 1000);

    // Play additional tones for win sound
    if (type === 'win') {
      playWinMelody(audioContext);
    }
  } catch (error) {
    // Silently fail
  }
}

// Win melody (ascending notes)
function playWinMelody(audioContext: AudioContext): void {
  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
  const noteDuration = 0.15;

  notes.forEach((freq, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);

    const startTime = audioContext.currentTime + index * noteDuration;
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(soundConfig.volume * 0.2, startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + noteDuration);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + noteDuration);
  });
}

// Native sound implementation using expo-av
async function playNativeSound(_type: SoundType): Promise<void> {
  try {
    // Create a simple beep sound programmatically
    // Since we don't have audio files, we'll use a very short silent approach
    // In production, you'd load actual audio files here

    const { sound } = await Audio.Sound.createAsync(
      { uri: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA' },
      { volume: soundConfig.volume, shouldPlay: false }
    );

    await sound.playAsync();

    // Unload after playing
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (error) {
    // Silently fail - use haptics as fallback
  }
}

// Play tile flip sounds in sequence
export async function playFlipSounds(
  matches: ('correct' | 'present' | 'absent' | '' | undefined)[]
): Promise<void> {
  if (!soundConfig.enabled) return;

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    if (match) {
      const validMatch = match as 'correct' | 'present' | 'absent';
      setTimeout(() => {
        const soundType: SoundType = validMatch === 'correct' ? 'flipCorrect' : validMatch === 'present' ? 'flipPresent' : 'flipAbsent';
        playSound(soundType);
      }, i * 250); // Match the flip animation timing
    }
  }
}

// Cleanup sounds on app unmount
export async function cleanupSounds(): Promise<void> {
  for (const sound of soundCache.values()) {
    try {
      await sound.unloadAsync();
    } catch (error) {
      // Ignore cleanup errors
    }
  }
  soundCache.clear();
}
