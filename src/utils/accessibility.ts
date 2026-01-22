import { AccessibilityInfo, Platform } from 'react-native';

// Accessibility announcement for screen readers
export function announceForAccessibility(message: string): void {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    AccessibilityInfo.announceForAccessibility(message);
  }
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

// Check if reduce motion is enabled
export async function isReduceMotionEnabled(): Promise<boolean> {
  try {
    return await AccessibilityInfo.isReduceMotionEnabled();
  } catch {
    return false;
  }
}

// Check if screen reader is enabled
export async function isScreenReaderEnabled(): Promise<boolean> {
  try {
    return await AccessibilityInfo.isScreenReaderEnabled();
  } catch {
    return false;
  }
}
