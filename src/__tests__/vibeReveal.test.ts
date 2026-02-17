import { guess } from '../types';
import {
  calculatePartialVibeScore,
  calculateVibeScore,
  VIBE_THRESHOLDS,
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

describe('calculatePartialVibeScore', () => {
  const solution = 'crane';

  const emptyRow = makeGuess(0, ['', '', '', '', ''], ['', '', '', '', ''], false);

  it('returns zero score when no tiles revealed and no prior rows', () => {
    const guesses = [
      makeGuess(0, ['s', 't', 'a', 'r', 'e'], ['absent', 'absent', 'present', 'present', 'correct'], true),
      emptyRow,
      emptyRow,
      emptyRow,
      emptyRow,
      emptyRow,
    ];
    const result = calculatePartialVibeScore(guesses, solution, 0, 0);
    expect(result.score).toBe(0);
  });

  it('incrementally increases score as correct tiles are revealed', () => {
    const guesses = [
      makeGuess(0, ['c', 'r', 'a', 'n', 'e'], ['correct', 'correct', 'correct', 'correct', 'correct'], true),
      emptyRow,
      emptyRow,
      emptyRow,
      emptyRow,
      emptyRow,
    ];

    const scores: number[] = [];
    for (let i = 0; i <= 5; i++) {
      const result = calculatePartialVibeScore(guesses, solution, 0, i);
      scores.push(result.score);
    }

    // Score should monotonically increase (each tile is correct = +20)
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeGreaterThanOrEqual(scores[i - 1]);
    }

    // 5 correct tiles = 100 score
    expect(scores[5]).toBe(100);
    // 0 tiles = 0
    expect(scores[0]).toBe(0);
  });

  it('score after full reveal matches calculateVibeScore', () => {
    const guesses = [
      makeGuess(0, ['s', 't', 'a', 'r', 'e'], ['absent', 'absent', 'present', 'present', 'correct'], true),
      emptyRow,
      emptyRow,
      emptyRow,
      emptyRow,
      emptyRow,
    ];

    const partialFull = calculatePartialVibeScore(guesses, solution, 0, 5);
    const full = calculateVibeScore(guesses, solution);

    expect(partialFull.score).toBe(full.score);
  });

  it('accounts for prior completed rows in the score', () => {
    const guesses = [
      makeGuess(0, ['s', 't', 'a', 'r', 'e'], ['absent', 'absent', 'present', 'present', 'correct'], true),
      makeGuess(1, ['c', 'r', 'a', 'n', 'e'], ['correct', 'correct', 'correct', 'correct', 'correct'], true),
      emptyRow,
      emptyRow,
      emptyRow,
      emptyRow,
    ];

    // Reveal row 1 with 1 tile (correct = 20)
    const result1 = calculatePartialVibeScore(guesses, solution, 1, 1);
    // Prior row best was 36 (present*2 + correct*1), partial row has 20
    // Best score should be max(36, 20) = 36
    expect(result1.score).toBe(36);

    // After 3 tiles (3 correct = 60), best becomes 60
    const result3 = calculatePartialVibeScore(guesses, solution, 1, 3);
    expect(result3.score).toBe(60);
  });

  it('handles absent-only rows correctly', () => {
    const guesses = [
      makeGuess(0, ['x', 'y', 'z', 'q', 'w'], ['absent', 'absent', 'absent', 'absent', 'absent'], true),
      emptyRow,
      emptyRow,
      emptyRow,
      emptyRow,
      emptyRow,
    ];

    for (let i = 0; i <= 5; i++) {
      const result = calculatePartialVibeScore(guesses, solution, 0, i);
      expect(result.score).toBe(0);
    }
  });

  it('handles present-only tiles (8 points each)', () => {
    const guesses = [
      makeGuess(0, ['e', 'n', 'c', 'a', 'r'], ['present', 'present', 'present', 'present', 'present'], true),
      emptyRow,
      emptyRow,
      emptyRow,
      emptyRow,
      emptyRow,
    ];

    // 1 present = 8
    const r1 = calculatePartialVibeScore(guesses, solution, 0, 1);
    expect(r1.score).toBe(8);

    // 3 present = 24
    const r3 = calculatePartialVibeScore(guesses, solution, 0, 3);
    expect(r3.score).toBe(24);

    // 5 present = 40
    const r5 = calculatePartialVibeScore(guesses, solution, 0, 5);
    expect(r5.score).toBe(40);
  });
});

describe('VIBE_THRESHOLDS', () => {
  it('has exactly 4 thresholds at 20, 40, 60, 80', () => {
    expect(VIBE_THRESHOLDS).toEqual([20, 40, 60, 80]);
    expect(VIBE_THRESHOLDS.length).toBe(4);
  });

  it('thresholds are in ascending order', () => {
    for (let i = 1; i < VIBE_THRESHOLDS.length; i++) {
      expect(VIBE_THRESHOLDS[i]).toBeGreaterThan(VIBE_THRESHOLDS[i - 1]);
    }
  });
});
