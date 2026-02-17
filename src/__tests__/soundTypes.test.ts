/**
 * Sound Type Coverage Tests
 *
 * Verifies that every SoundType value has a corresponding entry
 * in PROFESSIONAL_SOUNDS, and that win tier sounds exist with
 * decreasing complexity.
 */

import {
  ALL_SOUND_TYPES,
  PROFESSIONAL_SOUNDS,
  generateSamples,
  samplesToWavDataUri,
} from '../utils/sounds';

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

describe('SoundType coverage', () => {
  it('every SoundType in ALL_SOUND_TYPES has a PROFESSIONAL_SOUNDS entry', () => {
    for (const type of ALL_SOUND_TYPES) {
      expect(PROFESSIONAL_SOUNDS).toHaveProperty(type);
    }
  });

  it('PROFESSIONAL_SOUNDS has no extra keys beyond ALL_SOUND_TYPES', () => {
    const soundKeys = Object.keys(PROFESSIONAL_SOUNDS);
    for (const key of soundKeys) {
      expect(ALL_SOUND_TYPES).toContain(key);
    }
  });

  it('ALL_SOUND_TYPES count matches PROFESSIONAL_SOUNDS key count', () => {
    expect(ALL_SOUND_TYPES.length).toBe(Object.keys(PROFESSIONAL_SOUNDS).length);
  });
});

describe('win tier sounds', () => {
  const tierTypes = [
    'winTier1',
    'winTier2',
    'winTier3',
    'winTier4',
    'winTier5',
    'winTier6',
  ] as const;

  it('all six win tiers exist in ALL_SOUND_TYPES', () => {
    for (const tier of tierTypes) {
      expect(ALL_SOUND_TYPES).toContain(tier);
    }
  });

  it('win tiers have decreasing note counts (tier 1 most elaborate)', () => {
    const noteCounts = tierTypes.map(
      (tier) => PROFESSIONAL_SOUNDS[tier].notes.length
    );

    // Tier 1 should have the most notes
    expect(noteCounts[0]!).toBeGreaterThanOrEqual(noteCounts[5]!);

    // Each tier should have >= notes as the next tier (non-strictly decreasing)
    for (let i = 0; i < noteCounts.length - 1; i++) {
      expect(noteCounts[i]!).toBeGreaterThanOrEqual(noteCounts[i + 1]!);
    }
  });

  it('each win tier generates valid audio samples', () => {
    for (const tier of tierTypes) {
      const config = PROFESSIONAL_SOUNDS[tier];
      const samples = generateSamples(config);
      expect(samples.length).toBeGreaterThan(0);

      const uri = samplesToWavDataUri(samples, 0.6);
      expect(uri.startsWith('data:audio/wav;base64,')).toBe(true);
    }
  });

  it('each win tier produces distinct audio', () => {
    const uris = tierTypes.map((tier) => {
      const config = PROFESSIONAL_SOUNDS[tier];
      const samples = generateSamples(config);
      return samplesToWavDataUri(samples, 0.6);
    });

    const uniqueUris = new Set(uris);
    expect(uniqueUris.size).toBe(tierTypes.length);
  });
});
