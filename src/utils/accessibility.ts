import { AccessibilityInfo, Platform } from 'react-native';

import { getStoreData, setStoreData } from './localStorageFuncs';

// Accessibility preferences storage
const ACCESSIBILITY_PREFS_KEY = 'wordle_accessibility_prefs';

// Accessibility preferences
export interface AccessibilityPreferences {
  highContrastMode: boolean;
  largerText: boolean;
  reduceMotion: boolean;
  screenReaderOptimized: boolean;
  hapticFeedback: boolean;
  soundEnabled: boolean;
}

const DEFAULT_PREFS: AccessibilityPreferences = {
  highContrastMode: false,
  largerText: false,
  reduceMotion: false,
  screenReaderOptimized: false,
  hapticFeedback: true,
  soundEnabled: true,
};

// Cache for system accessibility state
let cachedReduceMotion = false;
let cachedScreenReader = false;

// Initialize accessibility listeners
export function initializeAccessibility(): () => void {
  const subscriptions: Array<{ remove: () => void }> = [];

  // Listen for reduce motion changes
  AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
    cachedReduceMotion = enabled;
  });

  const reduceMotionSubscription = AccessibilityInfo.addEventListener(
    'reduceMotionChanged',
    (enabled) => {
      cachedReduceMotion = enabled;
    }
  ) as unknown as { remove: () => void } | null;
  if (reduceMotionSubscription) subscriptions.push(reduceMotionSubscription);

  // Listen for screen reader changes
  AccessibilityInfo.isScreenReaderEnabled().then((enabled) => {
    cachedScreenReader = enabled;
  });

  const screenReaderSubscription = AccessibilityInfo.addEventListener(
    'screenReaderChanged',
    (enabled) => {
      cachedScreenReader = enabled;
    }
  ) as unknown as { remove: () => void } | null;
  if (screenReaderSubscription) subscriptions.push(screenReaderSubscription);

  // Return cleanup function
  return () => {
    subscriptions.forEach((sub) => sub.remove());
  };
}

// Get accessibility preferences
export async function getAccessibilityPreferences(): Promise<AccessibilityPreferences> {
  try {
    const stored = await getStoreData(ACCESSIBILITY_PREFS_KEY);
    return stored ? { ...DEFAULT_PREFS, ...JSON.parse(stored) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

// Save accessibility preferences
export async function saveAccessibilityPreferences(
  prefs: Partial<AccessibilityPreferences>
): Promise<void> {
  try {
    const current = await getAccessibilityPreferences();
    await setStoreData(ACCESSIBILITY_PREFS_KEY, JSON.stringify({ ...current, ...prefs }));
  } catch (error) {
    console.log('Error saving accessibility preferences:', error);
  }
}

// Accessibility announcement for screen readers
export function announceForAccessibility(message: string): void {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    AccessibilityInfo.announceForAccessibility(message);
  }
}

// Announce with politeness level (iOS 17+)
export function announceForAccessibilityWithPriority(
  message: string,
  _priority: 'polite' | 'assertive' = 'polite'
): void {
  // For now, use standard announcement
  // In production with iOS 17+, use announcement with priority
  announceForAccessibility(message);
}

// Get accessibility label for a letter tile
export function getTileAccessibilityLabel(
  letter: string,
  position: number,
  status: 'correct' | 'present' | 'absent' | '' | undefined,
  rowNumber: number
): string {
  if (!letter) {
    return `Row ${rowNumber}, position ${position + 1}, empty`;
  }

  const statusText = status
    ? status === 'correct'
      ? 'correct position'
      : status === 'present'
      ? 'wrong position'
      : 'not in word'
    : 'not submitted';

  return `Row ${rowNumber}, position ${position + 1}, letter ${letter.toUpperCase()}, ${statusText}`;
}

// Get verbose tile description for detailed mode
export function getTileVerboseDescription(
  letter: string,
  position: number,
  status: 'correct' | 'present' | 'absent' | '' | undefined,
  rowNumber: number,
  totalRows = 6
): string {
  const ordinals = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'];
  const ordinal = ordinals[position] || `position ${position + 1}`;

  if (!letter) {
    return `Empty tile, ${ordinal} position, row ${rowNumber} of ${totalRows}`;
  }

  let statusDescription = '';
  switch (status) {
    case 'correct':
      statusDescription = 'Green tile, correct letter in correct position';
      break;
    case 'present':
      statusDescription = 'Yellow tile, letter is in the word but in wrong position';
      break;
    case 'absent':
      statusDescription = 'Gray tile, letter is not in the word';
      break;
    default:
      statusDescription = 'Pending evaluation';
  }

  return `Letter ${letter.toUpperCase()}, ${ordinal} position, row ${rowNumber}. ${statusDescription}`;
}

// Get accessibility hint for a letter tile
export function getTileAccessibilityHint(isCurrentRow: boolean): string {
  if (isCurrentRow) {
    return 'Current guess row. Use keyboard to enter letters.';
  }
  return '';
}

// Get accessibility label for keyboard key
export function getKeyAccessibilityLabel(
  key: string,
  status: 'correct' | 'present' | 'absent' | '' | undefined
): string {
  if (key === '<') {
    return 'Backspace, delete last letter';
  }
  if (key === 'Enter') {
    return 'Submit guess';
  }

  const statusText = status
    ? status === 'correct'
      ? ', correct in word'
      : status === 'present'
      ? ', in word but wrong position'
      : ', not in word'
    : '';

  return `Letter ${key.toUpperCase()}${statusText}`;
}

// Get accessibility hint for keyboard key
export function getKeyAccessibilityHint(
  key: string,
  status: 'correct' | 'present' | 'absent' | '' | undefined
): string {
  if (key === '<') {
    return 'Double tap to delete';
  }
  if (key === 'Enter') {
    return 'Double tap to submit your guess';
  }

  if (status === 'absent') {
    return 'This letter is not in the word';
  }

  return 'Double tap to add this letter';
}

// Get accessibility label for game status
export function getGameStatusAccessibilityLabel(
  gameEnded: boolean,
  gameWon: boolean,
  solution: string,
  guessCount: number
): string {
  if (!gameEnded) {
    return `Game in progress. ${6 - guessCount} guesses remaining.`;
  }

  if (gameWon) {
    return `Congratulations! You won in ${guessCount} ${guessCount === 1 ? 'guess' : 'guesses'}!`;
  }

  return `Game over. The word was ${solution.toUpperCase()}. Better luck next time!`;
}

// Get accessibility label for statistics
export function getStatisticsAccessibilityLabel(
  gamesPlayed: number,
  winPercentage: number,
  currentStreak: number,
  maxStreak: number
): string {
  return `Statistics: ${gamesPlayed} games played, ${winPercentage}% win rate, current streak ${currentStreak}, maximum streak ${maxStreak}`;
}

// Get accessibility label for distribution bar
export function getDistributionBarAccessibilityLabel(
  guessNumber: number,
  count: number,
  totalWins: number
): string {
  const percentage = totalWins > 0 ? Math.round((count / totalWins) * 100) : 0;
  return `${count} ${count === 1 ? 'win' : 'wins'} in ${guessNumber} ${guessNumber === 1 ? 'guess' : 'guesses'}, ${percentage}% of wins`;
}

// Announce game result for screen readers
export function announceGameResult(
  gameWon: boolean,
  solution: string,
  guessCount: number
): void {
  const message = gameWon
    ? `Congratulations! You found the word ${solution.toUpperCase()} in ${guessCount} ${guessCount === 1 ? 'guess' : 'guesses'}!`
    : `Game over. The word was ${solution.toUpperCase()}.`;

  announceForAccessibility(message);
}

// Announce guess result for screen readers
export function announceGuessResult(
  matches: ('correct' | 'present' | 'absent' | '')[],
  letters: string[]
): void {
  const results = letters.map((letter, index) => {
    const match = matches[index];
    if (match === 'correct') return `${letter.toUpperCase()} correct`;
    if (match === 'present') return `${letter.toUpperCase()} in word`;
    return `${letter.toUpperCase()} not in word`;
  });

  announceForAccessibility(results.join(', '));
}

// Announce current input state
export function announceCurrentInput(letters: string[], maxLength = 5): void {
  if (letters.length === 0) {
    announceForAccessibility('Input cleared');
    return;
  }

  const word = letters.join('').toUpperCase();
  const remaining = maxLength - letters.length;

  if (remaining === 0) {
    announceForAccessibility(`${word}. Ready to submit.`);
  } else {
    announceForAccessibility(`${word}. ${remaining} more letters needed.`);
  }
}

// Announce error message
export function announceError(error: string): void {
  announceForAccessibilityWithPriority(`Error: ${error}`, 'assertive');
}

// Announce achievement unlock
export function announceAchievement(title: string, description: string): void {
  announceForAccessibilityWithPriority(
    `Achievement unlocked! ${title}. ${description}`,
    'assertive'
  );
}

// Check if reduce motion is enabled (cached)
export function isReduceMotionEnabled(): boolean {
  return cachedReduceMotion;
}

// Check if reduce motion is enabled (async)
export async function checkReduceMotionEnabled(): Promise<boolean> {
  try {
    cachedReduceMotion = await AccessibilityInfo.isReduceMotionEnabled();
    return cachedReduceMotion;
  } catch {
    return false;
  }
}

// Check if screen reader is enabled (cached)
export function isScreenReaderActive(): boolean {
  return cachedScreenReader;
}

// Check if screen reader is enabled (async)
export async function checkScreenReaderEnabled(): Promise<boolean> {
  try {
    cachedScreenReader = await AccessibilityInfo.isScreenReaderEnabled();
    return cachedScreenReader;
  } catch {
    return false;
  }
}

// Get animation duration based on reduce motion preference
export function getAnimationDuration(
  normalDuration: number,
  reducedDuration = 0
): number {
  return cachedReduceMotion ? reducedDuration : normalDuration;
}

// High contrast color alternatives
export const HIGH_CONTRAST_COLORS = {
  correct: '#538D4E', // Darker green
  present: '#B59F3B', // Darker yellow
  absent: '#3A3A3C', // Darker gray
  correctAlt: '#F5793A', // Orange (for colorblind mode)
  presentAlt: '#85C0F9', // Blue (for colorblind mode)
};

// Get color based on accessibility preferences
export function getAccessibleColor(
  baseColor: string,
  status: 'correct' | 'present' | 'absent',
  useHighContrast = false,
  useColorblindMode = false
): string {
  if (useColorblindMode) {
    switch (status) {
      case 'correct':
        return HIGH_CONTRAST_COLORS.correctAlt;
      case 'present':
        return HIGH_CONTRAST_COLORS.presentAlt;
      default:
        return baseColor;
    }
  }

  if (useHighContrast) {
    switch (status) {
      case 'correct':
        return HIGH_CONTRAST_COLORS.correct;
      case 'present':
        return HIGH_CONTRAST_COLORS.present;
      case 'absent':
        return HIGH_CONTRAST_COLORS.absent;
      default:
        return baseColor;
    }
  }

  return baseColor;
}

// Semantic accessibility roles
export const ACCESSIBILITY_ROLES = {
  tile: 'button' as const,
  key: 'button' as const,
  gameBoard: 'grid' as const,
  row: 'none' as const,
  header: 'header' as const,
  tab: 'tab' as const,
  tabBar: 'tablist' as const,
  alert: 'alert' as const,
  image: 'image' as const,
  link: 'link' as const,
  menu: 'menu' as const,
  menuItem: 'menuitem' as const,
  progressBar: 'progressbar' as const,
  slider: 'adjustable' as const,
  summary: 'summary' as const,
  timer: 'timer' as const,
  toolbar: 'toolbar' as const,
};

// Focus management helpers
export function setAccessibilityFocus(ref: React.RefObject<unknown>): void {
  if (Platform.OS === 'ios' && ref.current) {
    // On iOS, use setAccessibilityFocus from AccessibilityInfo
    AccessibilityInfo.setAccessibilityFocus(ref.current as number);
  }
}

// Generate accessibility live region props
export function getLiveRegionProps(
  mode: 'polite' | 'assertive' | 'none' = 'polite'
): { accessibilityLiveRegion: 'polite' | 'assertive' | 'none' } {
  return { accessibilityLiveRegion: mode };
}

// Build comprehensive accessibility props for a component
export function buildAccessibilityProps(options: {
  label: string;
  hint?: string;
  role?: keyof typeof ACCESSIBILITY_ROLES;
  state?: {
    selected?: boolean;
    disabled?: boolean;
    checked?: boolean;
    expanded?: boolean;
    busy?: boolean;
  };
  value?: {
    min?: number;
    max?: number;
    now?: number;
    text?: string;
  };
  liveRegion?: 'polite' | 'assertive' | 'none';
}): Record<string, unknown> {
  const props: Record<string, unknown> = {
    accessible: true,
    accessibilityLabel: options.label,
  };

  if (options.hint) {
    props.accessibilityHint = options.hint;
  }

  if (options.role) {
    props.accessibilityRole = ACCESSIBILITY_ROLES[options.role];
  }

  if (options.state) {
    props.accessibilityState = options.state;
  }

  if (options.value) {
    props.accessibilityValue = options.value;
  }

  if (options.liveRegion) {
    props.accessibilityLiveRegion = options.liveRegion;
  }

  return props;
}
