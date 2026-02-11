import { generateEmojiGrid, generateShareText, getShareableText } from '../utils/shareResults';
import { guess, matchStatus } from '../types';

// Mock getDayNumber to return consistent value
jest.mock('../utils/dailyWord', () => ({
  ...jest.requireActual('../utils/dailyWord'),
  getDayNumber: jest.fn(() => 1234),
}));

const createGuess = (
  id: number,
  letters: string[],
  matches: matchStatus[],
  isComplete = true,
  isCorrect = false
): guess => ({
  id,
  letters,
  matches,
  isComplete,
  isCorrect,
});

describe('generateEmojiGrid', () => {
  it('should generate correct emoji grid for all correct guess', () => {
    const guesses = [
      createGuess(
        0,
        ['a', 'p', 'p', 'l', 'e'],
        ['correct', 'correct', 'correct', 'correct', 'correct'],
        true,
        true
      ),
    ];

    const result = generateEmojiGrid(guesses);
    expect(result).toBe('🟪🟪🟪🟪🟪');
  });

  it('should generate correct emoji grid for mixed results', () => {
    const guesses = [
      createGuess(
        0,
        ['c', 'r', 'a', 'n', 'e'],
        ['correct', 'absent', 'present', 'absent', 'absent']
      ),
    ];

    const result = generateEmojiGrid(guesses);
    expect(result).toBe('🟪⬛💜⬛⬛');
  });

  it('should generate multiple rows for multiple guesses', () => {
    const guesses = [
      createGuess(0, ['c', 'r', 'a', 'n', 'e'], ['absent', 'absent', 'present', 'absent', 'absent']),
      createGuess(1, ['s', 'l', 'a', 't', 'e'], ['correct', 'absent', 'correct', 'absent', 'correct']),
      createGuess(2, ['s', 'h', 'a', 'k', 'e'], ['correct', 'correct', 'correct', 'correct', 'correct'], true, true),
    ];

    const result = generateEmojiGrid(guesses);
    const lines = result.split('\n');
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe('⬛⬛💜⬛⬛');
    expect(lines[1]).toBe('🟪⬛🟪⬛🟪');
    expect(lines[2]).toBe('🟪🟪🟪🟪🟪');
  });

  it('should only include completed guesses', () => {
    const guesses = [
      createGuess(0, ['c', 'r', 'a', 'n', 'e'], ['correct', 'absent', 'present', 'absent', 'absent'], true),
      createGuess(1, ['s', 'l', '', '', ''], ['', '', '', '', ''], false), // Incomplete
    ];

    const result = generateEmojiGrid(guesses);
    expect(result).toBe('🟪⬛💜⬛⬛');
    expect(result.split('\n')).toHaveLength(1);
  });

  it('should use high contrast colors when enabled', () => {
    const guesses = [
      createGuess(
        0,
        ['c', 'r', 'a', 'n', 'e'],
        ['correct', 'absent', 'present', 'absent', 'absent']
      ),
    ];

    const result = generateEmojiGrid(guesses, true);
    expect(result).toBe('🟧⬛🟦⬛⬛');
  });
});

describe('generateShareText', () => {
  it('should generate correct share text for daily win', () => {
    const guesses = [
      createGuess(0, ['c', 'r', 'a', 'n', 'e'], ['absent', 'absent', 'present', 'absent', 'absent']),
      createGuess(1, ['s', 'l', 'a', 't', 'e'], ['correct', 'correct', 'correct', 'correct', 'correct'], true, true),
    ];

    const result = generateShareText(guesses, true, true, false, false);
    expect(result).toContain('WordVibe #1234');
    expect(result).toContain('2/6');
    expect(result).toContain('⬛⬛💜⬛⬛');
    expect(result).toContain('🟪🟪🟪🟪🟪');
  });

  it('should show X/6 for losses', () => {
    const guesses = Array(6).fill(null).map((_, i) =>
      createGuess(i, ['a', 'b', 'c', 'd', 'e'], ['absent', 'absent', 'absent', 'absent', 'absent'])
    );

    const result = generateShareText(guesses, false, true, false, false);
    expect(result).toContain('WordVibe #1234');
    expect(result).toContain('X/6');
  });

  it('should add asterisk for hard mode', () => {
    const guesses = [
      createGuess(0, ['a', 'p', 'p', 'l', 'e'], ['correct', 'correct', 'correct', 'correct', 'correct'], true, true),
    ];

    const result = generateShareText(guesses, true, true, true, false);
    expect(result).toContain('WordVibe #1234');
    expect(result).toContain('1/6*');
  });

  it('should show Free Play label for non-daily games', () => {
    const guesses = [
      createGuess(0, ['a', 'p', 'p', 'l', 'e'], ['correct', 'correct', 'correct', 'correct', 'correct'], true, true),
    ];

    const result = generateShareText(guesses, true, false, false, false);
    expect(result).toContain('WordVibe (Free Play)');
    expect(result).toContain('1/6');
  });

  it('should use high contrast emojis when enabled', () => {
    const guesses = [
      createGuess(0, ['c', 'r', 'a', 'n', 'e'], ['correct', 'absent', 'present', 'absent', 'absent']),
    ];

    const result = generateShareText(guesses, true, true, false, true);
    expect(result).toContain('🟧⬛🟦⬛⬛');
    expect(result).not.toContain('🟪');
    expect(result).not.toContain('💜');
  });

  it('should format with blank line between title and grid', () => {
    const guesses = [
      createGuess(0, ['a', 'p', 'p', 'l', 'e'], ['correct', 'correct', 'correct', 'correct', 'correct'], true, true),
    ];

    const result = generateShareText(guesses, true, true, false, false);
    const parts = result.split('\n\n');
    expect(parts).toHaveLength(2);
    expect(parts[0]).toContain('WordVibe #1234');
    expect(parts[0]).toContain('1/6');
    expect(parts[1]).toBe('🟪🟪🟪🟪🟪');
  });

  it('should include vibe score when provided', () => {
    const guesses = [
      createGuess(0, ['a', 'p', 'p', 'l', 'e'], ['correct', 'correct', 'correct', 'correct', 'correct'], true, true),
    ];

    const result = generateShareText(guesses, true, true, false, false, 87);
    expect(result).toContain('(Vibe: 87%)');
  });
});

describe('getShareableText', () => {
  it('should return same result as generateShareText', () => {
    const guesses = [
      createGuess(0, ['c', 'r', 'a', 'n', 'e'], ['correct', 'absent', 'present', 'absent', 'absent']),
      createGuess(1, ['s', 'h', 'a', 'k', 'e'], ['correct', 'correct', 'correct', 'correct', 'correct'], true, true),
    ];

    const shareText = generateShareText(guesses, true, true, false, false);
    const shareableText = getShareableText(guesses, true, true, false, false);
    expect(shareableText).toBe(shareText);
  });
});

describe('share text edge cases', () => {
  it('should handle empty guesses array', () => {
    const result = generateEmojiGrid([]);
    expect(result).toBe('');
  });

  it('should handle all incomplete guesses', () => {
    const guesses = [
      createGuess(0, ['a', 'b', '', '', ''], ['', '', '', '', ''], false),
      createGuess(1, ['', '', '', '', ''], ['', '', '', '', ''], false),
    ];

    const result = generateEmojiGrid(guesses);
    expect(result).toBe('');
  });

  it('should correctly count guesses in 6/6 win', () => {
    const guesses = Array(6).fill(null).map((_, i) =>
      createGuess(
        i,
        ['a', 'b', 'c', 'd', 'e'],
        i === 5
          ? ['correct', 'correct', 'correct', 'correct', 'correct']
          : ['absent', 'absent', 'absent', 'absent', 'absent'],
        true,
        i === 5
      )
    );

    const result = generateShareText(guesses, true, true, false, false);
    expect(result).toContain('6/6');
  });
});
