import { guess, matchStatus } from '../types';

/**
 * Calculate match status for each letter in a guess compared to the solution.
 * Handles duplicate letters correctly according to game rules:
 * - Exact matches (correct position) take priority
 * - Present matches only count if there are remaining unmatched letters in solution
 */
export function calculateMatches(guessWord: string, solution: string): matchStatus[] {
  const matches: matchStatus[] = new Array(5).fill('absent');
  const solutionLetters = solution.split('');
  const guessLetters = guessWord.split('');

  // Track remaining letter counts from solution (for handling duplicates)
  const letterCounts: Record<string, number> = {};
  for (const letter of solutionLetters) {
    letterCounts[letter] = (letterCounts[letter] || 0) + 1;
  }

  // First pass: identify correct matches (green)
  for (let i = 0; i < 5; i++) {
    const guessLetter = guessLetters[i]!;
    const solutionLetter = solutionLetters[i]!;
    if (guessLetter === solutionLetter) {
      matches[i] = 'correct';
      // guessLetter === solutionLetter guarantees letterCounts[guessLetter] exists
      letterCounts[guessLetter] = letterCounts[guessLetter]! - 1;
    }
  }

  // Second pass: identify present matches (yellow) using remaining letter counts
  for (let i = 0; i < 5; i++) {
    if (matches[i] === 'correct') continue;

    const letter = guessLetters[i]!;
    if (letterCounts[letter] && letterCounts[letter] > 0) {
      matches[i] = 'present';
      letterCounts[letter]--;
    }
  }

  return matches;
}

/**
 * Check if a guess is the winning word
 */
export function isWinningGuess(guessWord: string, solution: string): boolean {
  return guessWord === solution;
}

/**
 * Check for hard mode violations
 * Returns error message if violation found, null if valid
 */
export function checkHardModeViolation(
  currentGuess: guess,
  previousGuesses: guess[],
  currentGuessIndex: number
): string | null {
  if (currentGuessIndex === 0) return null;

  const currentWord = currentGuess.letters.join('');
  const completedGuesses = previousGuesses.filter((g) => g.isComplete);

  for (const prevGuess of completedGuesses) {
    // Check that all correct letters are in the same position
    for (let i = 0; i < 5; i++) {
      const prevLetter = prevGuess.letters[i];
      const prevMatch = prevGuess.matches[i];
      if (prevMatch === 'correct' && prevLetter && currentWord[i] !== prevLetter) {
        return `${i + 1}${getOrdinalSuffix(i + 1)} letter must be ${prevLetter.toUpperCase()}`;
      }
    }

    // Check that all present letters are used somewhere
    for (let i = 0; i < 5; i++) {
      const prevLetter = prevGuess.letters[i];
      const prevMatch = prevGuess.matches[i];
      if (prevMatch === 'present' && prevLetter && !currentWord.includes(prevLetter)) {
        return `Guess must contain ${prevLetter.toUpperCase()}`;
      }
    }
  }

  return null;
}

/**
 * Get ordinal suffix for a number (1st, 2nd, 3rd, 4th, etc.)
 */
export function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  if (v >= 11 && v <= 13) return 'th';
  const idx = v % 10;
  return s[idx] || 'th';
}

/**
 * Update used keys state after a guess.
 * Key status precedence: correct > present > absent > '' (unset).
 */
export function updateUsedKeys(
  currentUsedKeys: Record<string, matchStatus>,
  guessResult: guess
): Record<string, matchStatus> {
  const tempUsedKeys = { ...currentUsedKeys };

  // Priority mapping: higher value = higher precedence
  const priority: Record<matchStatus, number> = { correct: 3, present: 2, absent: 1, '': 0 };

  guessResult.letters.forEach((letter: string, idx: number) => {
    const keyValue = tempUsedKeys[letter];
    const matchValue = guessResult.matches[idx];
    if (!matchValue) return;

    // Only update if new status has higher priority than current
    const currentPriority = keyValue ? priority[keyValue] : 0;
    if (priority[matchValue] > currentPriority) {
      tempUsedKeys[letter] = matchValue;
    }
  });

  return tempUsedKeys;
}

/**
 * Check if a word is in the valid word list
 */
export function isValidWord(word: string, wordList: string[]): boolean {
  return wordList.includes(word.toLowerCase());
}

/**
 * Create a guess object with calculated matches
 */
export function createCompletedGuess(
  guessId: number,
  guessWord: string,
  solution: string
): guess {
  const isCorrect = guessWord === solution;
  const matches = isCorrect
    ? (['correct', 'correct', 'correct', 'correct', 'correct'] as matchStatus[])
    : calculateMatches(guessWord, solution);

  return {
    id: guessId,
    letters: guessWord.split(''),
    matches,
    isComplete: true,
    isCorrect,
  };
}
