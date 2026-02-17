/**
 * Tests for the prevVibeScoreRef reset behavior in gameBoard.
 *
 * The gameBoard useEffect tracks completed guesses and maintains a
 * prevVibeScoreRef for haptic threshold crossing detection. When a new
 * game starts (currentCompleted === 0), both prevVibeScoreRef and
 * completedCountRef must reset to 0 to avoid false haptic triggers
 * from stale scores carried over from the previous game.
 *
 * These tests validate the reset logic extracted from the useEffect.
 */

import { guess } from '../types';
import { calculateVibeScore, VIBE_THRESHOLDS } from '../utils/vibeMeter';

function makeGuess(
  id: number,
  letters: string[],
  matches: guess['matches'],
  isComplete: boolean,
  isCorrect = false,
): guess {
  return { id, letters, matches, isComplete, isCorrect };
}

const emptyRow = makeGuess(0, ['', '', '', '', ''], ['', '', '', '', ''], false);

function makeEmptyBoard(): guess[] {
  return Array.from({ length: 6 }, (_, i) => makeGuess(i, ['', '', '', '', ''], ['', '', '', '', ''], false));
}

/**
 * Simulates the ref-tracking logic from gameBoard's useEffect.
 * Returns the prevVibeScore after processing the guesses transition.
 */
function simulateVibeRefLogic(
  guesses: guess[],
  prevVibeScore: number,
  _prevCompletedCount: number,
): { prevVibeScore: number; completedCount: number; didReset: boolean } {
  const currentCompleted = guesses.filter((g) => g.isComplete).length;

  // This mirrors the fix: reset when no completed guesses (new game)
  if (currentCompleted === 0) {
    return { prevVibeScore: 0, completedCount: 0, didReset: true };
  }

  // Normal path: update refs
  return { prevVibeScore, completedCount: currentCompleted, didReset: false };
}

describe('prevVibeScoreRef reset between games', () => {
  it('resets prevVibeScore to 0 when all guesses become incomplete (new game)', () => {
    // Simulate end of a game: player had score 80
    const prevVibeScore = 80;
    const prevCompletedCount = 4;

    // New game starts: all rows are empty
    const freshGuesses = makeEmptyBoard();
    const result = simulateVibeRefLogic(freshGuesses, prevVibeScore, prevCompletedCount);

    expect(result.prevVibeScore).toBe(0);
    expect(result.completedCount).toBe(0);
    expect(result.didReset).toBe(true);
  });

  it('does not reset when guesses have completed rows', () => {
    const prevVibeScore = 40;
    const prevCompletedCount = 1;

    const guesses = [
      makeGuess(0, ['c', 'r', 'a', 'n', 'e'], ['correct', 'correct', 'absent', 'absent', 'correct'], true),
      emptyRow,
      emptyRow,
      emptyRow,
      emptyRow,
      emptyRow,
    ];

    const result = simulateVibeRefLogic(guesses, prevVibeScore, prevCompletedCount);

    expect(result.prevVibeScore).toBe(40);
    expect(result.completedCount).toBe(1);
    expect(result.didReset).toBe(false);
  });

  it('prevents false threshold crossings after game reset', () => {
    const solution = 'crane';

    // End of game 1: high score
    const endOfGame1 = [
      makeGuess(0, ['c', 'r', 'a', 'n', 'e'], ['correct', 'correct', 'correct', 'correct', 'correct'], true, true),
      emptyRow,
      emptyRow,
      emptyRow,
      emptyRow,
      emptyRow,
    ];
    const game1Score = calculateVibeScore(endOfGame1, solution).score;
    expect(game1Score).toBe(100);

    // Game resets — all guesses empty
    const freshBoard = makeEmptyBoard();
    const afterReset = simulateVibeRefLogic(freshBoard, game1Score, 1);
    expect(afterReset.prevVibeScore).toBe(0);

    // Game 2 first guess: modest score
    const game2FirstGuess = [
      makeGuess(0, ['s', 't', 'a', 'r', 'e'], ['absent', 'absent', 'present', 'present', 'correct'], true),
      emptyRow,
      emptyRow,
      emptyRow,
      emptyRow,
      emptyRow,
    ];
    const game2Score = calculateVibeScore(game2FirstGuess, solution).score;
    expect(game2Score).toBe(36);

    // With correct reset: prev=0, new=36 — crosses 20 threshold (correct)
    const crossedFromZero = VIBE_THRESHOLDS.some(
      (t) => afterReset.prevVibeScore < t && game2Score >= t,
    );
    expect(crossedFromZero).toBe(true);

    // Without reset (bug): prev=100, new=36 — would cross 40,60,80 downward (incorrect)
    const falseDownwardCrossings = VIBE_THRESHOLDS.filter(
      (t) => game1Score >= t && game2Score < t,
    );
    // This demonstrates why the bug caused false haptic triggers
    expect(falseDownwardCrossings.length).toBeGreaterThan(0);
  });

  it('handles transition from multi-row game to fresh board', () => {
    // 5 completed rows (lost game)
    const prevVibeScore = 60;
    const prevCompletedCount = 5;

    const freshGuesses = makeEmptyBoard();
    const result = simulateVibeRefLogic(freshGuesses, prevVibeScore, prevCompletedCount);

    expect(result.prevVibeScore).toBe(0);
    expect(result.completedCount).toBe(0);
    expect(result.didReset).toBe(true);
  });
});
