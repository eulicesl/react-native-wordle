import { guess } from '../types';

export interface VibeScore {
  score: number;
  trend: 'up' | 'down' | 'same';
  label: string;
}

export function calculateVibeScore(guesses: guess[], _solution: string): VibeScore {
  const completedGuesses = guesses.filter((g) => g.isComplete);
  if (completedGuesses.length === 0) {
    return { score: 0, trend: 'same', label: 'Start guessing!' };
  }

  let previousScore = 0;
  let currentScore = 0;
  let bestScore = 0;

  for (let i = 0; i < completedGuesses.length; i++) {
    const g = completedGuesses[i];
    if (!g) continue;
    let guessScore = 0;

    for (let j = 0; j < 5; j++) {
      const match = g.matches[j];
      if (match === 'correct') {
        guessScore += 20;
      } else if (match === 'present') {
        guessScore += 8;
      }
    }

    if (i < completedGuesses.length - 1) {
      previousScore = guessScore;
    }
    currentScore = guessScore;
    bestScore = Math.max(bestScore, guessScore);
  }

  const score = Math.min(Math.round(bestScore), 100);

  const trend: VibeScore['trend'] =
    completedGuesses.length === 1
      ? 'same'
      : currentScore > previousScore
        ? 'up'
        : currentScore < previousScore
          ? 'down'
          : 'same';

  let label: string;
  if (score === 100) label = 'Perfect Vibe!';
  else if (score >= 80) label = 'Strong Vibe';
  else if (score >= 60) label = 'Getting Warmer';
  else if (score >= 40) label = 'Building...';
  else if (score >= 20) label = 'Early Days';
  else label = 'Keep Trying';

  return { score, trend, label };
}

/**
 * Calculate vibe score with only a partial reveal of the current row.
 * Used to animate the Vibe Meter in sync with tile flip stagger.
 *
 * @param guesses - Full guesses array from Redux state
 * @param solution - Current solution word (unused, kept for API symmetry)
 * @param revealedRowIdx - Index of the row currently being revealed
 * @param tilesRevealed - Number of tiles revealed so far in that row (0-5)
 */
export function calculatePartialVibeScore(
  guesses: guess[],
  solution: string,
  revealedRowIdx: number,
  tilesRevealed: number,
): VibeScore {
  if (tilesRevealed <= 0) {
    // Nothing revealed yet in this row — score from all prior completed rows
    const priorGuesses = guesses.filter((g, i) => g.isComplete && i < revealedRowIdx);
    if (priorGuesses.length === 0) {
      return { score: 0, trend: 'same', label: 'Start guessing!' };
    }
    return calculateVibeScore(
      [...priorGuesses, ...guesses.filter((g, i) => !g.isComplete || i >= revealedRowIdx)],
      solution,
    );
  }

  // Build a modified guesses array where the current row is partially revealed
  const modified: guess[] = guesses.map((g, i) => {
    if (i !== revealedRowIdx) return g;
    // Partial reveal: only include matches for revealed tiles
    const partialMatches = g.matches.map((m, j) => (j < tilesRevealed ? m : '')) as guess['matches'];
    return { ...g, matches: partialMatches, isComplete: true };
  });

  return calculateVibeScore(modified, solution);
}

/** Vibe score threshold boundaries for haptic feedback */
export const VIBE_THRESHOLDS = [20, 40, 60, 80] as const;
