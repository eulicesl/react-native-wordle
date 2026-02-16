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

// All sound types for iteration
const ALL_SOUND_TYPES: SoundType[] = [
  'keyPress', 'keyDelete', 'submit',
  'flipCorrect', 'flipPresent', 'flipAbsent',
  'win', 'lose', 'error',
  'streak', 'achievement', 'countdown', 'newDay',
];

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

// --- WAV synthesis for native platforms ---

const SAMPLE_RATE = 44100;

// Base64 lookup table
const B64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// Encode Uint8Array to base64 string (no external deps)
export function bytesToBase64(bytes: Uint8Array): string {
  let result = '';
  const len = bytes.length;
  for (let i = 0; i < len; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < len ? bytes[i + 1] : 0;
    const b2 = i + 2 < len ? bytes[i + 2] : 0;
    result += B64_CHARS[(b0 >> 2) & 0x3f];
    result += B64_CHARS[((b0 << 4) | (b1 >> 4)) & 0x3f];
    result += i + 1 < len ? B64_CHARS[((b1 << 2) | (b2 >> 6)) & 0x3f] : '=';
    result += i + 2 < len ? B64_CHARS[b2 & 0x3f] : '=';
  }
  return result;
}

// Generate a waveform sample for a given oscillator type
function oscillatorSample(type: OscillatorType, phase: number): number {
  // phase is 0..1 representing one cycle
  switch (type) {
    case 'sine':
      return Math.sin(2 * Math.PI * phase);
    case 'triangle':
      return phase < 0.25
        ? 4 * phase
        : phase < 0.75
          ? 2 - 4 * phase
          : -4 + 4 * phase;
    case 'sawtooth':
      return 2 * phase - 1;
    case 'square':
      return phase < 0.5 ? 1 : -1;
    default:
      return Math.sin(2 * Math.PI * phase);
  }
}

// Compute ADSR envelope amplitude at a given time within a note
function adsrAmplitude(
  time: number,
  duration: number,
  envelope: ProfessionalSoundConfig['envelope'],
): number {
  const { attack, decay, sustain, release } = envelope;
  const durationSec = duration / 1000;
  const releaseStart = Math.max(0, durationSec - release);

  if (time < attack) {
    return time / attack;
  } else if (time < attack + decay) {
    const decayProgress = (time - attack) / decay;
    return 1 - decayProgress * (1 - sustain);
  } else if (time < releaseStart) {
    return sustain;
  } else if (time < durationSec) {
    const releaseProgress = (time - releaseStart) / release;
    return sustain * (1 - releaseProgress);
  }
  return 0;
}

// Generate PCM samples (mono, 16-bit) for a single sound type
export function generateSamples(config: ProfessionalSoundConfig): Float32Array {
  // Calculate total duration with 85% overlap (legato) between notes
  let totalMs = 0;
  const noteStarts: number[] = [];
  for (let i = 0; i < config.notes.length; i++) {
    noteStarts.push(totalMs);
    const dur = config.durations[i] ?? 100;
    totalMs += i < config.notes.length - 1 ? dur * 0.85 : dur;
  }
  const totalSamples = Math.ceil((totalMs / 1000) * SAMPLE_RATE);
  const samples = new Float32Array(totalSamples);

  for (let i = 0; i < config.notes.length; i++) {
    const semitone = config.notes[i];
    const duration = config.durations[i] ?? 100;
    const freq = semitoneToFreq(semitone);
    const startSample = Math.floor((noteStarts[i] / 1000) * SAMPLE_RATE);
    const noteSamples = Math.ceil((duration / 1000) * SAMPLE_RATE);

    for (let s = 0; s < noteSamples; s++) {
      const idx = startSample + s;
      if (idx >= totalSamples) break;

      const t = s / SAMPLE_RATE;
      const amp = adsrAmplitude(t, duration, config.envelope);
      const phase = (freq * s / SAMPLE_RATE) % 1;
      let sample = oscillatorSample(config.type, phase) * amp;

      // Add detuned second oscillator for richness
      if (config.detune && config.detune > 0) {
        const detuneRatio = Math.pow(2, config.detune / 1200);
        const detunedFreq = freq * detuneRatio;
        const detunedPhase = (detunedFreq * s / SAMPLE_RATE) % 1;
        sample += oscillatorSample(config.type, detunedPhase) * amp * 0.5;
        sample /= 1.5; // Normalize
      }

      samples[idx] += sample;
    }
  }

  // Clamp to [-1, 1]
  for (let i = 0; i < totalSamples; i++) {
    samples[i] = Math.max(-1, Math.min(1, samples[i]));
  }

  return samples;
}

// Write a little-endian 32-bit unsigned integer into a buffer
function writeUint32LE(view: DataView, offset: number, value: number): void {
  view.setUint32(offset, value, true);
}

// Write a little-endian 16-bit unsigned integer into a buffer
function writeUint16LE(view: DataView, offset: number, value: number): void {
  view.setUint16(offset, value, true);
}

// Encode Float32Array samples into a WAV data URI
export function samplesToWavDataUri(samples: Float32Array, volume: number): string {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = SAMPLE_RATE * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = samples.length * (bitsPerSample / 8);
  const headerSize = 44;
  const fileSize = headerSize + dataSize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // RIFF header
  view.setUint8(0, 0x52); // R
  view.setUint8(1, 0x49); // I
  view.setUint8(2, 0x46); // F
  view.setUint8(3, 0x46); // F
  writeUint32LE(view, 4, fileSize - 8); // file size - 8
  view.setUint8(8, 0x57);  // W
  view.setUint8(9, 0x41);  // A
  view.setUint8(10, 0x56); // V
  view.setUint8(11, 0x45); // E

  // fmt chunk
  view.setUint8(12, 0x66); // f
  view.setUint8(13, 0x6d); // m
  view.setUint8(14, 0x74); // t
  view.setUint8(15, 0x20); // (space)
  writeUint32LE(view, 16, 16); // chunk size
  writeUint16LE(view, 20, 1);  // PCM format
  writeUint16LE(view, 22, numChannels);
  writeUint32LE(view, 24, SAMPLE_RATE);
  writeUint32LE(view, 28, byteRate);
  writeUint16LE(view, 32, blockAlign);
  writeUint16LE(view, 34, bitsPerSample);

  // data chunk
  view.setUint8(36, 0x64); // d
  view.setUint8(37, 0x61); // a
  view.setUint8(38, 0x74); // t
  view.setUint8(39, 0x61); // a
  writeUint32LE(view, 40, dataSize);

  // Write PCM samples
  const clampedVolume = Math.max(0, Math.min(1, volume));
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i] * clampedVolume));
    const val = s < 0 ? s * 0x8000 : s * 0x7fff;
    view.setInt16(headerSize + i * 2, Math.round(val), true);
  }

  const bytes = new Uint8Array(buffer);
  return 'data:audio/wav;base64,' + bytesToBase64(bytes);
}

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

// Initialize audio settings and preload native sounds
export async function initializeAudio(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: false,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
    await preloadAllSounds();
  } catch (_error) {
    console.log('Audio initialization error:', _error);
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
  } catch (_error) {
    // Silently fail - sounds are non-critical
    console.log('Sound playback error:', _error);
  }
}

// Generate and cache an Audio.Sound for a given SoundType
async function generateAndCacheSound(type: SoundType): Promise<Audio.Sound | null> {
  try {
    const config = PROFESSIONAL_SOUNDS[type];
    const samples = generateSamples(config);
    const wavUri = samplesToWavDataUri(samples, 0.6);

    const { sound } = await Audio.Sound.createAsync(
      { uri: wavUri },
      { volume: soundConfig.volume, shouldPlay: false }
    );
    soundCache.set(type, sound);
    return sound;
  } catch (_error) {
    return null;
  }
}

// Native sound implementation using synthesized WAV tones
async function playNativeSound(type: SoundType): Promise<void> {
  try {
    let sound = soundCache.get(type) ?? null;

    if (!sound) {
      sound = await generateAndCacheSound(type);
    }

    if (!sound) return;

    // Rewind to start before playing (in case it was played before)
    await sound.setPositionAsync(0);
    await sound.setVolumeAsync(soundConfig.volume);
    await sound.playAsync();
  } catch (_error) {
    // Playback failed — remove from cache so next call regenerates
    soundCache.delete(type);
  }
}

// Pre-generate and cache all sound types for instant playback
export async function preloadAllSounds(): Promise<void> {
  if (Platform.OS === 'web') return;

  const promises = ALL_SOUND_TYPES.map(async (type) => {
    if (!soundCache.has(type)) {
      await generateAndCacheSound(type);
    }
  });

  await Promise.allSettled(promises);
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
    } catch (_error) {
      // Ignore cleanup errors
    }
  }
  soundCache.clear();

  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
}
