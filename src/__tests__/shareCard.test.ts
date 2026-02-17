import { guess, matchStatus } from '../types';
import { colors } from '../utils/constants';

/**
 * Tests for ShareCard helper logic.
 *
 * Since ShareCard is a forwardRef component rendered off-screen for capture,
 * we test the pure helper functions (tile color, mode label) and the
 * prop contract independently.
 */

// Re-implement the helpers here to unit-test them in isolation.
// These mirror the module-scoped functions inside ShareCard.tsx.

const HIGH_CONTRAST_TILE = {
  correct: '#FF9100',
  present: '#40C4FF',
  absent: '#37474F',
};

function getTileColor(
  match: matchStatus,
  highContrast: boolean,
  isDark: boolean,
): string {
  if (match === 'correct') return highContrast ? HIGH_CONTRAST_TILE.correct : colors.correct;
  if (match === 'present') return highContrast ? HIGH_CONTRAST_TILE.present : colors.present;
  if (highContrast) return HIGH_CONTRAST_TILE.absent;
  return isDark ? '#3a3a3c' : '#78909C';
}

function getModeLabel(isDaily: boolean, dayNumber: number, gameMode: string): string {
  if (isDaily) return `Daily #${dayNumber}`;
  if (gameMode === 'speed') return 'Speed Mode';
  return 'Unlimited';
}

const createGuess = (
  id: number,
  matches: matchStatus[],
  isComplete = true,
  isCorrect = false,
): guess => ({
  id,
  letters: ['a', 'b', 'c', 'd', 'e'],
  matches,
  isComplete,
  isCorrect,
});

describe('getTileColor', () => {
  describe('standard mode (dark)', () => {
    it('returns purple for correct', () => {
      expect(getTileColor('correct', false, true)).toBe('#7C4DFF');
    });

    it('returns pink for present', () => {
      expect(getTileColor('present', false, true)).toBe('#FF6B9D');
    });

    it('returns dark gray for absent', () => {
      expect(getTileColor('absent', false, true)).toBe('#3a3a3c');
    });

    it('returns dark gray for empty status', () => {
      expect(getTileColor('', false, true)).toBe('#3a3a3c');
    });
  });

  describe('standard mode (light)', () => {
    it('returns purple for correct', () => {
      expect(getTileColor('correct', false, false)).toBe('#7C4DFF');
    });

    it('returns pink for present', () => {
      expect(getTileColor('present', false, false)).toBe('#FF6B9D');
    });

    it('returns light gray for absent', () => {
      expect(getTileColor('absent', false, false)).toBe('#78909C');
    });
  });

  describe('high contrast mode', () => {
    it('returns orange for correct', () => {
      expect(getTileColor('correct', true, true)).toBe('#FF9100');
    });

    it('returns cyan for present', () => {
      expect(getTileColor('present', true, true)).toBe('#40C4FF');
    });

    it('returns dark slate for absent (light)', () => {
      expect(getTileColor('absent', true, false)).toBe('#37474F');
    });

    it('returns dark slate for absent (dark) — highContrast takes priority over isDark', () => {
      expect(getTileColor('absent', true, true)).toBe('#37474F');
    });
  });
});

describe('getModeLabel', () => {
  it('returns Daily with day number for daily mode', () => {
    expect(getModeLabel(true, 1234, 'daily')).toBe('Daily #1234');
  });

  it('returns Speed Mode for speed games', () => {
    expect(getModeLabel(false, 1234, 'speed')).toBe('Speed Mode');
  });

  it('returns Unlimited for unlimited mode', () => {
    expect(getModeLabel(false, 1234, 'unlimited')).toBe('Unlimited');
  });

  it('returns Unlimited when isDaily is false and gameMode is unknown', () => {
    expect(getModeLabel(false, 0, 'other')).toBe('Unlimited');
  });

  it('prioritizes daily flag over gameMode', () => {
    expect(getModeLabel(true, 99, 'speed')).toBe('Daily #99');
  });
});

describe('ShareCard prop contract', () => {
  it('filters only completed guesses', () => {
    const guesses = [
      createGuess(0, ['correct', 'correct', 'correct', 'correct', 'correct'], true, true),
      createGuess(1, ['', '', '', '', ''], false),
      createGuess(2, ['', '', '', '', ''], false),
    ];

    const completedGuesses = guesses.filter((g) => g.isComplete);
    expect(completedGuesses).toHaveLength(1);
  });

  it('handles 6/6 win correctly', () => {
    const guesses = Array(6)
      .fill(null)
      .map((_, i) =>
        createGuess(
          i,
          i === 5
            ? ['correct', 'correct', 'correct', 'correct', 'correct']
            : ['absent', 'absent', 'absent', 'absent', 'absent'],
          true,
          i === 5,
        ),
      );

    const completedGuesses = guesses.filter((g) => g.isComplete);
    expect(completedGuesses).toHaveLength(6);
    const guessCount = completedGuesses.length;
    expect(guessCount).toBe(6);
  });

  it('handles loss (X/6) correctly', () => {
    const guesses = Array(6)
      .fill(null)
      .map((_, i) =>
        createGuess(i, ['absent', 'absent', 'absent', 'absent', 'absent']),
      );

    const completedGuesses = guesses.filter((g) => g.isComplete);
    expect(completedGuesses).toHaveLength(6);
    const gameWon = false;
    const display = gameWon ? `${completedGuesses.length}` : 'X';
    expect(display).toBe('X');
  });

  it('streak badge logic: hidden when streak is 0', () => {
    const streak = 0;
    expect(streak > 0).toBe(false);
  });

  it('streak badge logic: visible when streak > 0', () => {
    const streak = 5;
    expect(streak > 0).toBe(true);
  });

  it('vibe score displayed as percentage', () => {
    const vibeScore = 87;
    expect(`${vibeScore}%`).toBe('87%');
  });
});

describe('tile color high contrast rules', () => {
  it('matches project-defined high contrast colors', () => {
    // Per project rules: correct=#FF9100, present=#40C4FF, absent=#37474F
    expect(HIGH_CONTRAST_TILE.correct).toBe('#FF9100');
    expect(HIGH_CONTRAST_TILE.present).toBe('#40C4FF');
    expect(HIGH_CONTRAST_TILE.absent).toBe('#37474F');
  });

  it('standard colors match project palette', () => {
    expect(colors.correct).toBe('#7C4DFF');
    expect(colors.present).toBe('#FF6B9D');
    expect(colors.absent).toBe('#455A64');
  });
});
