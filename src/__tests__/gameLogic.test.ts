import {
  calculateMatches,
  isWinningGuess,
  checkHardModeViolation,
  getOrdinalSuffix,
  updateUsedKeys,
  isValidWord,
  createCompletedGuess,
} from '../utils/gameLogic';
import { guess, matchStatus } from '../types';

describe('calculateMatches', () => {
  describe('basic matching', () => {
    it('should return all correct for exact match', () => {
      const result = calculateMatches('apple', 'apple');
      expect(result).toEqual(['correct', 'correct', 'correct', 'correct', 'correct']);
    });

    it('should return all absent when no letters match', () => {
      const result = calculateMatches('brick', 'often');
      expect(result).toEqual(['absent', 'absent', 'absent', 'absent', 'absent']);
    });

    it('should identify correct positions', () => {
      const result = calculateMatches('crane', 'crate');
      expect(result).toEqual(['correct', 'correct', 'correct', 'absent', 'correct']);
    });

    it('should identify present letters in wrong position', () => {
      const result = calculateMatches('arise', 'resin');
      // a: absent (not in resin)
      // r: present (in resin but not at position 1)
      // i: present (in resin but not at position 2)
      // s: present (in resin but not at position 3)
      // e: present (in resin but not at position 4)
      expect(result).toEqual(['absent', 'present', 'present', 'present', 'present']);
    });
  });

  describe('duplicate letter handling', () => {
    it('should handle single letter in guess, single in solution - correct position', () => {
      const result = calculateMatches('speed', 'sheep');
      // s: correct (s at position 0 in sheep)
      // p: present (p is in sheep at position 3, not position 1)
      // e: correct (e at position 2 in sheep)
      // e: correct (e at position 3 in sheep)
      // d: absent (not in sheep)
      expect(result).toEqual(['correct', 'present', 'correct', 'correct', 'absent']);
    });

    it('should handle double letter in guess when solution has only one', () => {
      const result = calculateMatches('geese', 'reeds');
      // g: absent (g not in reeds)
      // e: correct (e at position 1 in reeds)
      // e: correct (e at position 2 in reeds)
      // s: present (s is in reeds but not at position 3)
      // e: absent (only 2 e's in reeds, already matched)
      expect(result).toEqual(['absent', 'correct', 'correct', 'present', 'absent']);
    });

    it('should handle double letter in solution when guess has one', () => {
      const result = calculateMatches('crate', 'creep');
      // c: correct
      // r: correct
      // a: absent
      // t: absent
      // e: present (e is in creep but not at position 4)
      expect(result).toEqual(['correct', 'correct', 'absent', 'absent', 'present']);
    });

    it('should prioritize exact matches for duplicate letters', () => {
      const result = calculateMatches('eerie', 'elder');
      // e: correct (e at position 0 in elder)
      // e: present (second e, e at position 3 in elder is available for present match)
      // r: present (r is in elder at position 4)
      // i: absent (not in elder)
      // e: absent (third e, but only 2 e's in elder and both accounted for)
      expect(result).toEqual(['correct', 'present', 'present', 'absent', 'absent']);
    });

    it('should handle triple letter in guess with double in solution', () => {
      const result = calculateMatches('geese', 'eerie');
      // g: absent
      // e: correct (e at position 1 in eerie)
      // e: present (second e, there are 3 e's in eerie, 1 matched exactly, this one is present)
      // s: absent
      // e: correct (e at position 4 in eerie)
      expect(result).toEqual(['absent', 'correct', 'present', 'absent', 'correct']);
    });

    it('should handle the classic SPEED/ABIDE case', () => {
      const result = calculateMatches('speed', 'abide');
      // s: absent
      // p: absent
      // e: present (e is in abide at position 4)
      // e: absent (only one e in abide, already matched)
      // d: present (d is in abide but not at position 4)
      expect(result).toEqual(['absent', 'absent', 'present', 'absent', 'present']);
    });

    it('should handle all same letters', () => {
      const result = calculateMatches('eeeee', 'geese');
      // Position 0: absent (g in geese)
      // Position 1: correct (e in geese)
      // Position 2: correct (e in geese)
      // Position 3: absent (s in geese)
      // Position 4: correct (e in geese)
      expect(result).toEqual(['absent', 'correct', 'correct', 'absent', 'correct']);
    });
  });

  describe('edge cases', () => {
    it('should handle words with no common letters', () => {
      const result = calculateMatches('quick', 'blame');
      expect(result).toEqual(['absent', 'absent', 'absent', 'absent', 'absent']);
    });

    it('should handle single letter correct at end', () => {
      const result = calculateMatches('grape', 'stake');
      // g: absent
      // r: absent
      // a: correct (a at position 2 in both words)
      // p: absent
      // e: correct (e at position 4)
      expect(result).toEqual(['absent', 'absent', 'correct', 'absent', 'correct']);
    });
  });
});

describe('isWinningGuess', () => {
  it('should return true for exact match', () => {
    expect(isWinningGuess('apple', 'apple')).toBe(true);
  });

  it('should return false for different words', () => {
    expect(isWinningGuess('apple', 'grape')).toBe(false);
  });

  it('should be case sensitive', () => {
    expect(isWinningGuess('Apple', 'apple')).toBe(false);
  });
});

describe('checkHardModeViolation', () => {
  const createGuess = (letters: string[], matches: matchStatus[], isComplete = true): guess => ({
    id: 0,
    letters,
    matches,
    isComplete,
    isCorrect: false,
  });

  it('should return null for first guess', () => {
    const currentGuess = createGuess(['c', 'r', 'a', 'n', 'e'], ['', '', '', '', '']);
    const result = checkHardModeViolation(currentGuess, [], 0);
    expect(result).toBeNull();
  });

  it('should return error when correct letter not in same position', () => {
    const previousGuess = createGuess(
      ['c', 'r', 'a', 'n', 'e'],
      ['correct', 'absent', 'present', 'absent', 'absent']
    );
    const currentGuess = createGuess(['s', 't', 'a', 'r', 'e'], ['', '', '', '', '']);

    const result = checkHardModeViolation(currentGuess, [previousGuess], 1);
    expect(result).toBe('1st letter must be C');
  });

  it('should return error when present letter not used', () => {
    const previousGuess = createGuess(
      ['c', 'r', 'a', 'n', 'e'],
      ['absent', 'absent', 'present', 'absent', 'absent']
    );
    const currentGuess = createGuess(['s', 't', 'o', 'r', 'e'], ['', '', '', '', '']);

    const result = checkHardModeViolation(currentGuess, [previousGuess], 1);
    expect(result).toBe('Guess must contain A');
  });

  it('should return null when all rules are followed', () => {
    const previousGuess = createGuess(
      ['c', 'r', 'a', 'n', 'e'],
      ['correct', 'absent', 'present', 'absent', 'absent']
    );
    const currentGuess = createGuess(['c', 'l', 'a', 's', 'h'], ['', '', '', '', '']);

    const result = checkHardModeViolation(currentGuess, [previousGuess], 1);
    expect(result).toBeNull();
  });

  it('should check multiple previous guesses', () => {
    const previousGuess1 = createGuess(
      ['c', 'r', 'a', 'n', 'e'],
      ['correct', 'absent', 'present', 'absent', 'absent']
    );
    const previousGuess2 = createGuess(
      ['c', 'l', 'a', 's', 'h'],
      ['correct', 'correct', 'correct', 'absent', 'absent']
    );
    // Current guess doesn't have 'l' in position 1
    const currentGuess = createGuess(['c', 'a', 'a', 'r', 't'], ['', '', '', '', '']);

    const result = checkHardModeViolation(currentGuess, [previousGuess1, previousGuess2], 2);
    expect(result).toBe('2nd letter must be L');
  });
});

describe('getOrdinalSuffix', () => {
  it('should return "st" for 1', () => {
    expect(getOrdinalSuffix(1)).toBe('st');
  });

  it('should return "nd" for 2', () => {
    expect(getOrdinalSuffix(2)).toBe('nd');
  });

  it('should return "rd" for 3', () => {
    expect(getOrdinalSuffix(3)).toBe('rd');
  });

  it('should return "th" for 4-10', () => {
    expect(getOrdinalSuffix(4)).toBe('th');
    expect(getOrdinalSuffix(5)).toBe('th');
  });

  it('should return "th" for 11, 12, 13 (special cases)', () => {
    expect(getOrdinalSuffix(11)).toBe('th');
    expect(getOrdinalSuffix(12)).toBe('th');
    expect(getOrdinalSuffix(13)).toBe('th');
  });

  it('should return correct suffix for 21, 22, 23', () => {
    expect(getOrdinalSuffix(21)).toBe('st');
    expect(getOrdinalSuffix(22)).toBe('nd');
    expect(getOrdinalSuffix(23)).toBe('rd');
  });
});

describe('updateUsedKeys', () => {
  it('should add new key with its match status', () => {
    const guessResult: guess = {
      id: 0,
      letters: ['c', 'r', 'a', 'n', 'e'],
      matches: ['correct', 'absent', 'present', 'absent', 'absent'],
      isComplete: true,
      isCorrect: false,
    };

    const result = updateUsedKeys({}, guessResult);
    expect(result).toEqual({
      c: 'correct',
      r: 'absent',
      a: 'present',
      n: 'absent',
      e: 'absent',
    });
  });

  it('should not downgrade correct to present', () => {
    const usedKeys: Record<string, matchStatus> = { c: 'correct' };
    const guessResult: guess = {
      id: 0,
      letters: ['c', 'l', 'a', 's', 'h'],
      matches: ['present', 'absent', 'absent', 'absent', 'absent'],
      isComplete: true,
      isCorrect: false,
    };

    const result = updateUsedKeys(usedKeys, guessResult);
    expect(result.c).toBe('correct');
  });

  it('should upgrade present to correct', () => {
    const usedKeys: Record<string, matchStatus> = { c: 'present' };
    const guessResult: guess = {
      id: 0,
      letters: ['c', 'l', 'a', 's', 'h'],
      matches: ['correct', 'absent', 'absent', 'absent', 'absent'],
      isComplete: true,
      isCorrect: false,
    };

    const result = updateUsedKeys(usedKeys, guessResult);
    expect(result.c).toBe('correct');
  });

  it('should not downgrade present to absent', () => {
    const usedKeys: Record<string, matchStatus> = { a: 'present' };
    const guessResult: guess = {
      id: 0,
      letters: ['c', 'l', 'a', 's', 'h'],
      matches: ['absent', 'absent', 'absent', 'absent', 'absent'],
      isComplete: true,
      isCorrect: false,
    };

    const result = updateUsedKeys(usedKeys, guessResult);
    expect(result.a).toBe('present');
  });
});

describe('isValidWord', () => {
  const wordList = ['apple', 'grape', 'crane', 'slate', 'audio'];

  it('should return true for valid word', () => {
    expect(isValidWord('apple', wordList)).toBe(true);
  });

  it('should return false for invalid word', () => {
    expect(isValidWord('zzzzz', wordList)).toBe(false);
  });

  it('should convert input to lowercase before checking', () => {
    // Word list is lowercase, so any case input should match after toLowerCase
    expect(isValidWord('apple', wordList)).toBe(true);
    // The function converts to lowercase, so APPLE becomes apple and matches
    expect(isValidWord('APPLE', wordList)).toBe(true);
    expect(isValidWord('ApPlE', wordList)).toBe(true);
    // Word not in list
    expect(isValidWord('ZZZZZ', wordList)).toBe(false);
  });
});

describe('createCompletedGuess', () => {
  it('should create winning guess with all correct', () => {
    const result = createCompletedGuess(0, 'apple', 'apple');
    expect(result).toEqual({
      id: 0,
      letters: ['a', 'p', 'p', 'l', 'e'],
      matches: ['correct', 'correct', 'correct', 'correct', 'correct'],
      isComplete: true,
      isCorrect: true,
    });
  });

  it('should create non-winning guess with calculated matches', () => {
    const result = createCompletedGuess(1, 'crane', 'apple');
    expect(result.id).toBe(1);
    expect(result.letters).toEqual(['c', 'r', 'a', 'n', 'e']);
    expect(result.isComplete).toBe(true);
    expect(result.isCorrect).toBe(false);
    // c: absent, r: absent, a: present, n: absent, e: correct (e at position 4 in apple)
    expect(result.matches).toEqual(['absent', 'absent', 'present', 'absent', 'correct']);
  });
});
