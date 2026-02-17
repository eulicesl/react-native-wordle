/**
 * Sound Synthesis Tests
 *
 * Tests the WAV synthesis engine: sample generation, base64 encoding,
 * ADSR envelopes, oscillator waveforms, and WAV data URI creation.
 */

import {
  generateSamples,
  samplesToWavDataUri,
  bytesToBase64,
} from '../utils/sounds';

// Mock expo-av since we only test pure synthesis functions
jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(() =>
        Promise.resolve({
          sound: {
            playAsync: jest.fn(),
            setPositionAsync: jest.fn(),
            setVolumeAsync: jest.fn(),
            unloadAsync: jest.fn(),
            setOnPlaybackStatusUpdate: jest.fn(),
          },
        })
      ),
    },
    setAudioModeAsync: jest.fn(),
  },
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

describe('bytesToBase64', () => {
  it('encodes an empty array', () => {
    expect(bytesToBase64(new Uint8Array([]))).toBe('');
  });

  it('encodes a single byte', () => {
    // 0x41 = 'A' → base64 "QQ=="
    expect(bytesToBase64(new Uint8Array([0x41]))).toBe('QQ==');
  });

  it('encodes two bytes', () => {
    // 0x41, 0x42 = "AB" → base64 "QUI="
    expect(bytesToBase64(new Uint8Array([0x41, 0x42]))).toBe('QUI=');
  });

  it('encodes three bytes (no padding)', () => {
    // 0x41, 0x42, 0x43 = "ABC" → base64 "QUJD"
    expect(bytesToBase64(new Uint8Array([0x41, 0x42, 0x43]))).toBe('QUJD');
  });

  it('encodes multi-byte sequences correctly', () => {
    const input = new Uint8Array([0xff, 0x00, 0xff, 0x00]);
    const result = bytesToBase64(input);
    expect(result.length).toBeGreaterThan(0);
    // No padding needed for 4 bytes: ceil(4/3)*4 = 8 chars, but 4 bytes → 6 chars + 2 pad? No:
    // 4 bytes = 1 full triplet + 1 extra byte → "xxxx" + "xx==" = 8 chars
    expect(result.length).toBe(8);
  });
});

describe('generateSamples', () => {
  it('generates non-empty samples for a single sine note', () => {
    const samples = generateSamples({
      notes: [0],
      durations: [100],
      type: 'sine',
      envelope: { attack: 0.01, decay: 0.05, sustain: 0.3, release: 0.05 },
    });

    expect(samples.length).toBeGreaterThan(0);
    // 100ms at 44100Hz → ~4410 samples
    expect(samples.length).toBe(Math.ceil(0.1 * 44100));
  });

  it('generates longer output for multi-note configs', () => {
    const single = generateSamples({
      notes: [0],
      durations: [100],
      type: 'sine',
      envelope: { attack: 0.01, decay: 0.05, sustain: 0.3, release: 0.05 },
    });

    const multi = generateSamples({
      notes: [0, 4, 7],
      durations: [100, 100, 100],
      type: 'sine',
      envelope: { attack: 0.01, decay: 0.05, sustain: 0.3, release: 0.05 },
    });

    expect(multi.length).toBeGreaterThan(single.length);
  });

  it('produces different waveforms for different oscillator types', () => {
    const sineConfig = {
      notes: [7],
      durations: [50],
      type: 'sine' as OscillatorType,
      envelope: { attack: 0.005, decay: 0.02, sustain: 0.3, release: 0.02 },
    };

    const sawConfig = {
      ...sineConfig,
      type: 'sawtooth' as OscillatorType,
    };

    const sineSamples = generateSamples(sineConfig);
    const sawSamples = generateSamples(sawConfig);

    // Same length (same duration)
    expect(sineSamples.length).toBe(sawSamples.length);

    // Different content
    let different = false;
    for (let i = 0; i < sineSamples.length; i++) {
      if (sineSamples[i] !== sawSamples[i]) {
        different = true;
        break;
      }
    }
    expect(different).toBe(true);
  });

  it('produces different samples for different notes', () => {
    const config = {
      notes: [0],
      durations: [100],
      type: 'sine' as OscillatorType,
      envelope: { attack: 0.01, decay: 0.05, sustain: 0.3, release: 0.05 },
    };

    const lowC = generateSamples({ ...config, notes: [0] });
    const highC = generateSamples({ ...config, notes: [12] });

    let different = false;
    for (let i = 0; i < lowC.length; i++) {
      if (lowC[i] !== highC[i]) {
        different = true;
        break;
      }
    }
    expect(different).toBe(true);
  });

  it('samples are clamped to [-1, 1]', () => {
    const samples = generateSamples({
      notes: [0, 0, 0],
      durations: [50, 50, 50],
      type: 'square',
      envelope: { attack: 0.001, decay: 0.001, sustain: 1.0, release: 0.001 },
    });

    for (let i = 0; i < samples.length; i++) {
      expect(samples[i]).toBeGreaterThanOrEqual(-1);
      expect(samples[i]).toBeLessThanOrEqual(1);
    }
  });

  it('applies detune when configured', () => {
    const withoutDetune = generateSamples({
      notes: [7],
      durations: [100],
      type: 'sine',
      envelope: { attack: 0.01, decay: 0.05, sustain: 0.5, release: 0.05 },
    });

    const withDetune = generateSamples({
      notes: [7],
      durations: [100],
      type: 'sine',
      envelope: { attack: 0.01, decay: 0.05, sustain: 0.5, release: 0.05 },
      detune: 8,
    });

    let different = false;
    for (let i = 0; i < withoutDetune.length; i++) {
      if (withoutDetune[i] !== withDetune[i]) {
        different = true;
        break;
      }
    }
    expect(different).toBe(true);
  });
});

describe('samplesToWavDataUri', () => {
  it('produces a valid data URI prefix', () => {
    const samples = new Float32Array([0, 0.5, -0.5, 1, -1]);
    const uri = samplesToWavDataUri(samples, 1.0);
    expect(uri.startsWith('data:audio/wav;base64,')).toBe(true);
  });

  it('encodes valid base64 after the prefix', () => {
    const samples = new Float32Array([0, 0.5, -0.5]);
    const uri = samplesToWavDataUri(samples, 1.0);
    const base64Part = uri.replace('data:audio/wav;base64,', '');
    // Valid base64 characters only
    expect(base64Part).toMatch(/^[A-Za-z0-9+/=]+$/);
  });

  it('produces different URIs for different sample content', () => {
    const samplesA = new Float32Array([0.5, 0.5, 0.5]);
    const samplesB = new Float32Array([-0.5, -0.5, -0.5]);
    const uriA = samplesToWavDataUri(samplesA, 1.0);
    const uriB = samplesToWavDataUri(samplesB, 1.0);
    expect(uriA).not.toBe(uriB);
  });

  it('respects volume scaling', () => {
    const samples = new Float32Array([1.0]);
    const loud = samplesToWavDataUri(samples, 1.0);
    const quiet = samplesToWavDataUri(samples, 0.1);
    // Different volume → different PCM data → different base64
    expect(loud).not.toBe(quiet);
  });

  it('contains a valid WAV header (RIFF + WAVE magic bytes)', () => {
    const samples = new Float32Array([0]);
    const uri = samplesToWavDataUri(samples, 1.0);
    const base64Part = uri.replace('data:audio/wav;base64,', '');

    // Decode first 12 bytes to check RIFF...WAVE header
    const raw = atob(base64Part);
    const header = raw.slice(0, 4);
    const format = raw.slice(8, 12);
    expect(header).toBe('RIFF');
    expect(format).toBe('WAVE');
  });
});

describe('sound type distinctness', () => {
  it('generates distinct WAV data for each sound type', () => {
    // Import PROFESSIONAL_SOUNDS indirectly through generateSamples behavior
    // Each sound type should produce unique audio
    const configs: Record<string, { notes: number[]; durations: number[]; type: OscillatorType; envelope: { attack: number; decay: number; sustain: number; release: number }; detune?: number }> = {
      keyPress: {
        notes: [7], durations: [40], type: 'sine',
        envelope: { attack: 0.005, decay: 0.02, sustain: 0.1, release: 0.03 },
      },
      flipCorrect: {
        notes: [12, 16], durations: [100, 150], type: 'sine',
        envelope: { attack: 0.01, decay: 0.1, sustain: 0.4, release: 0.2 },
        detune: 5,
      },
      flipAbsent: {
        notes: [0], durations: [120], type: 'triangle',
        envelope: { attack: 0.01, decay: 0.15, sustain: 0.1, release: 0.1 },
      },
      error: {
        notes: [1, 0], durations: [80, 120], type: 'sawtooth',
        envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.1 },
      },
    };

    const uris = new Map<string, string>();
    for (const [name, config] of Object.entries(configs)) {
      const samples = generateSamples(config);
      const uri = samplesToWavDataUri(samples, 0.6);
      uris.set(name, uri);
    }

    // All URIs should be unique
    const uniqueUris = new Set(uris.values());
    expect(uniqueUris.size).toBe(uris.size);
  });
});
