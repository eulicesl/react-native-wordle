/**
 * Tests that calculateVibeScore and calculatePartialVibeScore are pure
 * functions — identical inputs produce identical outputs. This guarantees
 * correctness of the useMemo wrapper in gameBoard.tsx.
 */

import { guess } from '../types';
import {
  calculateVibeScore,
  calculatePartialVibeScore,
} from '../utils/vibeMeter';

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
  return Array.from({ length: 6 }, (_, i) =>
    makeGuess(i, ['', '', '', '', ''], ['', '', '', '', ''], false),
  );
}

describe('calculateVibeScore purity (useMemo safety)', () => {
  const solution = 'crane';

  it('returns identical results for identical inputs', () => {
    const guesses = [
      makeGuess(0, ['s', 't', 'a', 'r', 'e'], ['absent', 'absent', 'present', 'present', 'correct'], true),
      emptyRow, emptyRow, emptyRow, emptyRow, emptyRow,
    ];

    const a = calculateVibeScore(guesses, solution);
    const b = calculateVibeScore(guesses, solution);

    expect(a).toEqual(b);
  });

  it('returns different results when guesses change', () => {
    const guessesA = [
      makeGuess(0, ['s', 't', 'a', 'r', 'e'], ['absent', 'absent', 'present', 'present', 'correct'], true),
      emptyRow, emptyRow, emptyRow, emptyRow, emptyRow,
    ];
    const guessesB = [
      makeGuess(0, ['s', 't', 'a', 'r', 'e'], ['absent', 'absent', 'present', 'present', 'correct'], true),
      makeGuess(1, ['c', 'r', 'a', 'n', 'e'], ['correct', 'correct', 'correct', 'correct', 'correct'], true, true),
      emptyRow, emptyRow, emptyRow, emptyRow,
    ];

    const a = calculateVibeScore(guessesA, solution);
    const b = calculateVibeScore(guessesB, solution);

    expect(a.score).not.toBe(b.score);
  });

  it('returns zero for an empty board', () => {
    const result = calculateVibeScore(makeEmptyBoard(), solution);
    expect(result.score).toBe(0);
    expect(result.trend).toBe('same');
    expect(result.label).toBe('Start guessing!');
  });

  it('labels match expected thresholds', () => {
    const testCases: Array<{ matches: guess['matches']; expectedLabel: string }> = [
      { matches: ['absent', 'absent', 'absent', 'absent', 'absent'], expectedLabel: 'Keep Trying' },
      { matches: ['correct', 'absent', 'absent', 'absent', 'absent'], expectedLabel: 'Early Days' },
      { matches: ['correct', 'correct', 'absent', 'absent', 'absent'], expectedLabel: 'Building...' },
      { matches: ['correct', 'correct', 'correct', 'absent', 'absent'], expectedLabel: 'Getting Warmer' },
      { matches: ['correct', 'correct', 'correct', 'correct', 'absent'], expectedLabel: 'Strong Vibe' },
      { matches: ['correct', 'correct', 'correct', 'correct', 'correct'], expectedLabel: 'Perfect Vibe!' },
    ];

    for (const tc of testCases) {
      const guesses = [
        makeGuess(0, ['c', 'r', 'a', 'n', 'e'], tc.matches, true),
        emptyRow, emptyRow, emptyRow, emptyRow, emptyRow,
      ];
      const result = calculateVibeScore(guesses, solution);
      expect(result.label).toBe(tc.expectedLabel);
    }
  });
});

describe('calculatePartialVibeScore purity (useMemo safety)', () => {
  const solution = 'crane';

  it('returns identical results for identical inputs', () => {
    const guesses = [
      makeGuess(0, ['c', 'r', 'a', 'n', 'e'], ['correct', 'correct', 'correct', 'correct', 'correct'], true),
      emptyRow, emptyRow, emptyRow, emptyRow, emptyRow,
    ];

    const a = calculatePartialVibeScore(guesses, solution, 0, 3);
    const b = calculatePartialVibeScore(guesses, solution, 0, 3);

    expect(a).toEqual(b);
  });

  it('returns different results when tilesRevealed changes', () => {
    const guesses = [
      makeGuess(0, ['c', 'r', 'a', 'n', 'e'], ['correct', 'correct', 'correct', 'correct', 'correct'], true),
      emptyRow, emptyRow, emptyRow, emptyRow, emptyRow,
    ];

    const a = calculatePartialVibeScore(guesses, solution, 0, 1);
    const b = calculatePartialVibeScore(guesses, solution, 0, 4);

    expect(a.score).toBeLessThan(b.score);
  });

  it('returns different results when revealedRowIdx changes', () => {
    const guesses = [
      makeGuess(0, ['s', 't', 'a', 'r', 'e'], ['absent', 'absent', 'present', 'present', 'correct'], true),
      makeGuess(1, ['c', 'r', 'a', 'n', 'e'], ['correct', 'correct', 'correct', 'correct', 'correct'], true, true),
      emptyRow, emptyRow, emptyRow, emptyRow,
    ];

    // Revealing row 0 with 2 tiles vs row 1 with 2 tiles
    const a = calculatePartialVibeScore(guesses, solution, 0, 2);
    const b = calculatePartialVibeScore(guesses, solution, 1, 2);

    // Both are valid VibeScore objects, but scores differ due to different row content
    expect(a).not.toEqual(b);
  });
});
