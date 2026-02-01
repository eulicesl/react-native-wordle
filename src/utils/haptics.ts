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
  | 'error';

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
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
        // Play a victory pattern: success + success + success
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await delay(150);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await delay(150);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;

      case 'lose':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;

      case 'error':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;

      default:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
