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
  | 'error'
  | 'streak'
  | 'achievement'
  | 'countdown'
  | 'newDay';

// Sound configuration
interface SoundConfig {
  enabled: boolean;
  volume: number;
  musicEnabled: boolean;
  musicVolume: number;
}

let soundConfig: SoundConfig = {
  enabled: true,
  volume: 0.5,
  musicEnabled: true,
  musicVolume: 0.3,
};

// Preloaded sounds cache
const soundCache: Map<SoundType, Audio.Sound> = new Map();

/* Musical scales and chords for professional sound design (reserved for future melodies)
const MUSICAL_SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11, 12], // C Major scale intervals
  pentatonic: [0, 2, 4, 7, 9, 12], // Pentatonic scale
  triumphant: [0, 4, 7, 12, 16, 19], // Major arpeggio extended
} as const;
*/

// Base frequency for middle C
const BASE_FREQ = 261.63;

// Convert semitones to frequency
function semitoneToFreq(semitones: number): number {
  return BASE_FREQ * Math.pow(2, semitones / 12);
}

// Professional sound configurations with musical theory
interface ProfessionalSoundConfig {
  notes: number[]; // Semitones from middle C
  durations: number[]; // Duration for each note in ms
  type: OscillatorType;
  envelope: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
  reverb?: number; // Reverb amount 0-1
  detune?: number; // Slight detuning for richness
}

const PROFESSIONAL_SOUNDS: Record<SoundType, ProfessionalSoundConfig> = {
  keyPress: {
    notes: [7], // G
    durations: [40],
    type: 'sine',
    envelope: { attack: 0.005, decay: 0.02, sustain: 0.1, release: 0.03 },
  },
  keyDelete: {
    notes: [5], // F
    durations: [40],
    type: 'sine',
    envelope: { attack: 0.005, decay: 0.02, sustain: 0.1, release: 0.03 },
  },
  submit: {
    notes: [0, 4, 7], // C major chord stagger
    durations: [80, 80, 80],
    type: 'sine',
    envelope: { attack: 0.01, decay: 0.05, sustain: 0.3, release: 0.1 },
  },
  flipCorrect: {
    notes: [12, 16], // High C to E (bright, happy)
    durations: [100, 150],
    type: 'sine',
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.4, release: 0.2 },
    detune: 5,
  },
  flipPresent: {
    notes: [7, 11], // G to B (hopeful)
    durations: [100, 150],
    type: 'triangle',
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.15 },
  },
  flipAbsent: {
    notes: [0], // Low C (neutral)
    durations: [120],
    type: 'triangle',
    envelope: { attack: 0.01, decay: 0.15, sustain: 0.1, release: 0.1 },
  },
  win: {
    notes: [0, 4, 7, 12, 16, 19, 24], // Ascending C major arpeggio
    durations: [120, 120, 120, 150, 150, 180, 300],
    type: 'sine',
    envelope: { attack: 0.02, decay: 0.1, sustain: 0.5, release: 0.3 },
    reverb: 0.4,
    detune: 3,
  },
  lose: {
    notes: [12, 11, 7, 5, 0], // Descending melancholic
    durations: [200, 200, 200, 200, 400],
    type: 'triangle',
    envelope: { attack: 0.05, decay: 0.2, sustain: 0.3, release: 0.4 },
  },
  error: {
    notes: [1, 0], // C# to C (dissonant drop)
    durations: [80, 120],
    type: 'sawtooth',
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.1 },
  },
  streak: {
    notes: [0, 7, 12, 19, 24], // Power fifth fanfare
    durations: [100, 100, 150, 200, 400],
    type: 'sine',
    envelope: { attack: 0.02, decay: 0.15, sustain: 0.6, release: 0.4 },
    reverb: 0.5,
    detune: 5,
  },
  achievement: {
    notes: [0, 4, 7, 12, 7, 12, 16, 19, 24], // Triumphant fanfare
    durations: [100, 100, 100, 200, 100, 150, 150, 200, 500],
    type: 'sine',
    envelope: { attack: 0.03, decay: 0.15, sustain: 0.7, release: 0.5 },
    reverb: 0.6,
    detune: 8,
  },
  countdown: {
    notes: [7], // Single tick
    durations: [50],
    type: 'sine',
    envelope: { attack: 0.001, decay: 0.02, sustain: 0.1, release: 0.02 },
  },
  newDay: {
    notes: [0, 12, 7, 4, 0, 4, 7, 12, 16, 19, 24], // Sunrise melody
    durations: [200, 200, 150, 150, 200, 150, 150, 200, 200, 200, 400],
    type: 'sine',
    envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 0.3 },
    reverb: 0.5,
  },
};

// Audio context for web
let audioContext: AudioContext | null = null;

// Get or create audio context
function getAudioContext(): AudioContext | null {
  if (Platform.OS !== 'web') return null;

  if (!audioContext && typeof window !== 'undefined') {
    const AudioContextClass = window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioContext = new AudioContextClass();
    }
  }
  return audioContext;
}

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

// Create ADSR envelope
function applyEnvelope(
  gainNode: GainNode,
  _ctx: AudioContext,
  startTime: number,
  duration: number,
  envelope: ProfessionalSoundConfig['envelope'],
  volume: number
): void {
  const { attack, decay, sustain, release } = envelope;
  const peakTime = startTime + attack;
  const decayEndTime = peakTime + decay;
  const sustainEndTime = startTime + duration / 1000 - release;
  const endTime = startTime + duration / 1000;

  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(volume, peakTime);
  gainNode.gain.linearRampToValueAtTime(volume * sustain, decayEndTime);
  gainNode.gain.setValueAtTime(volume * sustain, sustainEndTime);
  gainNode.gain.linearRampToValueAtTime(0.001, endTime);
}

// Play professional sound with Web Audio API
function playProfessionalWebSound(type: SoundType): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const config = PROFESSIONAL_SOUNDS[type];
  const volume = soundConfig.volume * 0.3;
  let currentTime = ctx.currentTime;

  config.notes.forEach((semitone, index) => {
    const duration = config.durations[index] ?? 100;
    const freq = semitoneToFreq(semitone);

    // Main oscillator
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = config.type;
    oscillator.frequency.setValueAtTime(freq, currentTime);

    // Apply slight detuning for richness
    if (config.detune) {
      oscillator.detune.setValueAtTime(config.detune, currentTime);
    }

    applyEnvelope(gainNode, ctx, currentTime, duration, config.envelope, volume);

    // Add second oscillator for richness on special sounds
    if (config.detune && config.detune > 0) {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();

      osc2.type = config.type;
      osc2.frequency.setValueAtTime(freq, currentTime);
      osc2.detune.setValueAtTime(-config.detune, currentTime);

      applyEnvelope(gain2, ctx, currentTime, duration, config.envelope, volume * 0.5);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(currentTime);
      osc2.stop(currentTime + duration / 1000 + 0.1);
    }

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(currentTime);
    oscillator.stop(currentTime + duration / 1000 + 0.1);

    currentTime += duration / 1000 * 0.85; // Slight overlap for legato effect
  });
}

// Play a sound effect
export async function playSound(type: SoundType): Promise<void> {
  if (!soundConfig.enabled) return;

  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      playProfessionalWebSound(type);
      return;
    }

    await playNativeSound(type);
  } catch (error) {
    // Silently fail - sounds are non-critical
    console.log('Sound playback error:', error);
  }
}

// Native sound implementation using expo-av
async function playNativeSound(_type: SoundType): Promise<void> {
  try {
    // Create a simple beep sound programmatically
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

// Play tile flip sounds in sequence with musical progression
export async function playFlipSounds(
  matches: ('correct' | 'present' | 'absent' | '' | undefined)[]
): Promise<void> {
  if (!soundConfig.enabled) return;

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    if (match) {
      const validMatch = match as 'correct' | 'present' | 'absent';
      setTimeout(() => {
        const soundType: SoundType = validMatch === 'correct'
          ? 'flipCorrect'
          : validMatch === 'present'
            ? 'flipPresent'
            : 'flipAbsent';
        playSound(soundType);
      }, i * 250);
    }
  }
}

// Play victory fanfare based on performance
export async function playVictorySound(
  guessCount: number,
  isStreak: boolean
): Promise<void> {
  if (!soundConfig.enabled) return;

  await playSound('win');

  // Play additional streak sound for streaks
  if (isStreak) {
    setTimeout(() => playSound('streak'), 800);
  }

  // Extra fanfare for first-try wins
  if (guessCount === 1) {
    setTimeout(() => playSound('achievement'), 1200);
  }
}

// Play new day celebration
export async function playNewDaySound(): Promise<void> {
  if (!soundConfig.enabled) return;
  await playSound('newDay');
}

// Play achievement unlock sound
export async function playAchievementSound(): Promise<void> {
  if (!soundConfig.enabled) return;
  await playSound('achievement');
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

  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
}
