/**
 * Haptic Type Coverage Tests
 *
 * Verifies that every HapticType value has a corresponding case
 * in the playHaptic switch statement, and that ALL_HAPTIC_TYPES
 * stays in sync.
 */

import { ALL_HAPTIC_TYPES, playHaptic, setHapticsEnabled } from '../utils/haptics';
import type { HapticType } from '../utils/haptics';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: {
    Light: 'Light',
    Medium: 'Medium',
    Heavy: 'Heavy',
  },
  NotificationFeedbackType: {
    Success: 'Success',
    Warning: 'Warning',
    Error: 'Error',
  },
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

const Haptics = require('expo-haptics');

beforeEach(() => {
  jest.clearAllMocks();
  setHapticsEnabled(true);
});

describe('HapticType coverage', () => {
  it('ALL_HAPTIC_TYPES contains every expected type', () => {
    const expectedTypes: HapticType[] = [
      'keyPress',
      'keyDelete',
      'submit',
      'tileFlip',
      'correct',
      'present',
      'absent',
      'win',
      'lose',
      'error',
      'streakMilestone',
      'achievementUnlock',
      'toggle',
    ];

    expect(ALL_HAPTIC_TYPES).toEqual(expect.arrayContaining(expectedTypes));
    expect(ALL_HAPTIC_TYPES.length).toBe(expectedTypes.length);
  });

  it('every HapticType in ALL_HAPTIC_TYPES triggers a haptic call without throwing', async () => {
    for (const type of ALL_HAPTIC_TYPES) {
      jest.clearAllMocks();
      await playHaptic(type);

      const totalCalls =
        (Haptics.impactAsync as jest.Mock).mock.calls.length +
        (Haptics.notificationAsync as jest.Mock).mock.calls.length +
        (Haptics.selectionAsync as jest.Mock).mock.calls.length;

      expect(totalCalls).toBeGreaterThan(0);
    }
  });

  it('ALL_HAPTIC_TYPES has no duplicates', () => {
    const unique = new Set(ALL_HAPTIC_TYPES);
    expect(unique.size).toBe(ALL_HAPTIC_TYPES.length);
  });
});

describe('haptic pattern specifics', () => {
  it('keyPress uses impactLight', async () => {
    await playHaptic('keyPress');
    expect(Haptics.impactAsync).toHaveBeenCalledWith('Light');
  });

  it('keyDelete uses selectionAsync', async () => {
    await playHaptic('keyDelete');
    expect(Haptics.selectionAsync).toHaveBeenCalled();
  });

  it('submit uses impactMedium', async () => {
    await playHaptic('submit');
    expect(Haptics.impactAsync).toHaveBeenCalledWith('Medium');
  });

  it('correct uses notificationSuccess', async () => {
    await playHaptic('correct');
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('Success');
  });

  it('present uses impactMedium', async () => {
    await playHaptic('present');
    expect(Haptics.impactAsync).toHaveBeenCalledWith('Medium');
  });

  it('absent uses impactLight', async () => {
    await playHaptic('absent');
    expect(Haptics.impactAsync).toHaveBeenCalledWith('Light');
  });

  it('win plays ascending triple impact (light → medium → heavy)', async () => {
    await playHaptic('win');
    const calls = (Haptics.impactAsync as jest.Mock).mock.calls;
    expect(calls.length).toBe(3);
    expect(calls[0][0]).toBe('Light');
    expect(calls[1][0]).toBe('Medium');
    expect(calls[2][0]).toBe('Heavy');
  });

  it('lose uses notificationWarning', async () => {
    await playHaptic('lose');
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('Warning');
  });

  it('error uses notificationError', async () => {
    await playHaptic('error');
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('Error');
  });

  it('streakMilestone plays double notificationSuccess', async () => {
    await playHaptic('streakMilestone');
    const calls = (Haptics.notificationAsync as jest.Mock).mock.calls;
    expect(calls.length).toBe(2);
    expect(calls[0][0]).toBe('Success');
    expect(calls[1][0]).toBe('Success');
  });

  it('achievementUnlock uses notificationSuccess', async () => {
    await playHaptic('achievementUnlock');
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('Success');
  });

  it('toggle uses selectionAsync', async () => {
    await playHaptic('toggle');
    expect(Haptics.selectionAsync).toHaveBeenCalled();
  });
});

describe('haptics disabled', () => {
  it('does not fire any haptic when disabled', async () => {
    setHapticsEnabled(false);

    for (const type of ALL_HAPTIC_TYPES) {
      await playHaptic(type);
    }

    expect(Haptics.impactAsync).not.toHaveBeenCalled();
    expect(Haptics.notificationAsync).not.toHaveBeenCalled();
    expect(Haptics.selectionAsync).not.toHaveBeenCalled();
  });
});
