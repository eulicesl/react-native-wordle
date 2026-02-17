import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Haptic feedback types for different game events
export type HapticType =
  | 'keyPress'
  | 'keyDelete'
  | 'submit'
  | 'tileFlip'
  | 'correct'
  | 'present'
  | 'absent'
  | 'win'
  | 'lose'
  | 'error'
  | 'streakMilestone'
  | 'achievementUnlock'
  | 'toggle';

// All haptic types as a runtime array for exhaustiveness testing
export const ALL_HAPTIC_TYPES: HapticType[] = [
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

let hapticsEnabled = true;

// Configure haptics
export function setHapticsEnabled(enabled: boolean): void {
  hapticsEnabled = enabled;
}

// Check if haptics are enabled
export function isHapticsEnabled(): boolean {
  return hapticsEnabled;
}

// Play haptic feedback
export async function playHaptic(type: HapticType): Promise<void> {
  if (!hapticsEnabled) return;
  if (Platform.OS === 'web') return; // Haptics not supported on web

  try {
    switch (type) {
      case 'keyPress':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;

      case 'keyDelete':
        await Haptics.selectionAsync();
        break;

      case 'submit':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;

      case 'tileFlip':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;

      case 'correct':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;

      case 'present':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;

      case 'absent':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;

      case 'win':
        // Ascending triple impact: light → medium → heavy
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await delay(100);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await delay(100);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;

      case 'lose':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;

      case 'error':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;

      case 'streakMilestone':
        // Double success with gap for milestone celebration
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await delay(200);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;

      case 'achievementUnlock':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;

      case 'toggle':
        await Haptics.selectionAsync();
        break;
    }
  } catch (_error) {
    // Silently fail - haptics are non-critical
    console.log('Haptic feedback error:', _error);
  }
}

// Play haptic pattern for tile flip sequence
export async function playFlipHaptics(
  matches: ('correct' | 'present' | 'absent' | '' | undefined)[]
): Promise<void> {
  if (!hapticsEnabled) return;
  if (Platform.OS === 'web') return;

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    if (match) {
      const hapticType = match as 'correct' | 'present' | 'absent';
      setTimeout(async () => {
        try {
          await playHaptic(hapticType);
        } catch (_error) {
          // Silently fail
        }
      }, i * 250); // Match the flip animation timing
    }
  }
}

// Helper function for delays
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Play selection haptic
export async function playSelectionHaptic(): Promise<void> {
  if (!hapticsEnabled) return;
  if (Platform.OS === 'web') return;

  try {
    await Haptics.selectionAsync();
  } catch (_error) {
    // Silently fail
  }
}
