/**
 * Tests for CalendarHeatmap helper functions and DistributionBar
 * lastWinGuess highlighting logic.
 */

import { GameHistoryEntry } from '../utils/gameHistory';

// Import the pure functions from the statistics screen
// These are exported specifically for testing
import { buildDayStatusMap, getLast30Days } from '../screens/statistics/index';

describe('buildDayStatusMap', () => {
  it('returns empty map for empty history', () => {
    const map = buildDayStatusMap([]);
    expect(map.size).toBe(0);
  });

  it('maps a won game correctly', () => {
    const history: GameHistoryEntry[] = [
      {
        date: '2026-02-15T10:00:00.000Z',
        solution: 'hello',
        won: true,
        guessCount: 3,
        matches: [],
        gameMode: 'daily',
        hardMode: false,
      },
    ];
    const map = buildDayStatusMap(history);
    expect(map.get('2026-02-15')).toBe('won');
  });

  it('maps a lost game correctly', () => {
    const history: GameHistoryEntry[] = [
      {
        date: '2026-02-14T10:00:00.000Z',
        solution: 'world',
        won: false,
        guessCount: 6,
        matches: [],
        gameMode: 'daily',
        hardMode: false,
      },
    ];
    const map = buildDayStatusMap(history);
    expect(map.get('2026-02-14')).toBe('lost');
  });

  it('won takes priority over lost for the same date', () => {
    const history: GameHistoryEntry[] = [
      {
        date: '2026-02-15T14:00:00.000Z',
        solution: 'world',
        won: false,
        guessCount: 6,
        matches: [],
        gameMode: 'unlimited',
        hardMode: false,
      },
      {
        date: '2026-02-15T10:00:00.000Z',
        solution: 'hello',
        won: true,
        guessCount: 3,
        matches: [],
        gameMode: 'daily',
        hardMode: false,
      },
    ];
    const map = buildDayStatusMap(history);
    expect(map.get('2026-02-15')).toBe('won');
  });

  it('does not overwrite won with lost', () => {
    // won entry first, then lost — won should stay
    const history: GameHistoryEntry[] = [
      {
        date: '2026-02-15T10:00:00.000Z',
        solution: 'hello',
        won: true,
        guessCount: 3,
        matches: [],
        gameMode: 'daily',
        hardMode: false,
      },
      {
        date: '2026-02-15T14:00:00.000Z',
        solution: 'world',
        won: false,
        guessCount: 6,
        matches: [],
        gameMode: 'unlimited',
        hardMode: false,
      },
    ];
    const map = buildDayStatusMap(history);
    expect(map.get('2026-02-15')).toBe('won');
  });

  it('handles multiple dates correctly', () => {
    const history: GameHistoryEntry[] = [
      {
        date: '2026-02-15T10:00:00.000Z',
        solution: 'hello',
        won: true,
        guessCount: 3,
        matches: [],
        gameMode: 'daily',
        hardMode: false,
      },
      {
        date: '2026-02-14T10:00:00.000Z',
        solution: 'world',
        won: false,
        guessCount: 6,
        matches: [],
        gameMode: 'daily',
        hardMode: false,
      },
      {
        date: '2026-02-13T10:00:00.000Z',
        solution: 'grape',
        won: true,
        guessCount: 4,
        matches: [],
        gameMode: 'daily',
        hardMode: false,
      },
    ];
    const map = buildDayStatusMap(history);
    expect(map.get('2026-02-15')).toBe('won');
    expect(map.get('2026-02-14')).toBe('lost');
    expect(map.get('2026-02-13')).toBe('won');
    expect(map.size).toBe(3);
  });
});

describe('getLast30Days', () => {
  it('returns exactly 30 entries', () => {
    const days = getLast30Days();
    expect(days).toHaveLength(30);
  });

  it('returns dates in YYYY-MM-DD format', () => {
    const days = getLast30Days();
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    days.forEach((d) => {
      expect(d).toMatch(dateRegex);
    });
  });

  it('returns dates in ascending order (oldest first)', () => {
    const days = getLast30Days();
    for (let i = 1; i < days.length; i++) {
      expect(days[i]! > days[i - 1]!).toBe(true);
    }
  });

  it('ends with today', () => {
    const days = getLast30Days();
    const today = new Date().toISOString().slice(0, 10);
    expect(days[days.length - 1]).toBe(today);
  });

  it('starts 29 days before today', () => {
    const days = getLast30Days();
    const start = new Date();
    start.setDate(start.getDate() - 29);
    const expected = start.toISOString().slice(0, 10);
    expect(days[0]).toBe(expected);
  });
});

describe('lastWinGuess derivation', () => {
  function deriveLastWinGuess(history: GameHistoryEntry[]): number | null {
    const lastWin = history.find((entry) => entry.won);
    return lastWin ? lastWin.guessCount : null;
  }

  it('returns null for empty history', () => {
    expect(deriveLastWinGuess([])).toBeNull();
  });

  it('returns null when no wins exist', () => {
    const history: GameHistoryEntry[] = [
      {
        date: '2026-02-15T10:00:00.000Z',
        solution: 'world',
        won: false,
        guessCount: 6,
        matches: [],
        gameMode: 'daily',
        hardMode: false,
      },
    ];
    expect(deriveLastWinGuess(history)).toBeNull();
  });

  it('returns guess count of the first (most recent) win', () => {
    const history: GameHistoryEntry[] = [
      {
        date: '2026-02-16T10:00:00.000Z',
        solution: 'hello',
        won: false,
        guessCount: 6,
        matches: [],
        gameMode: 'daily',
        hardMode: false,
      },
      {
        date: '2026-02-15T10:00:00.000Z',
        solution: 'world',
        won: true,
        guessCount: 4,
        matches: [],
        gameMode: 'daily',
        hardMode: false,
      },
      {
        date: '2026-02-14T10:00:00.000Z',
        solution: 'grape',
        won: true,
        guessCount: 2,
        matches: [],
        gameMode: 'daily',
        hardMode: false,
      },
    ];
    expect(deriveLastWinGuess(history)).toBe(4);
  });

  it('returns guess count when first entry is a win', () => {
    const history: GameHistoryEntry[] = [
      {
        date: '2026-02-16T10:00:00.000Z',
        solution: 'hello',
        won: true,
        guessCount: 1,
        matches: [],
        gameMode: 'daily',
        hardMode: false,
      },
    ];
    expect(deriveLastWinGuess(history)).toBe(1);
  });
});

describe('DistributionBar color logic', () => {
  const CORRECT_COLOR = '#7C4DFF';
  const INACTIVE_COLOR = '#252542';
  const EMPTY_COLOR = '#1A1A2E';

  function getBarColor(count: number, isLastWin: boolean): string {
    if (count > 0) {
      return isLastWin ? CORRECT_COLOR : INACTIVE_COLOR;
    }
    return EMPTY_COLOR;
  }

  it('uses correct color for last-win bar with count > 0', () => {
    expect(getBarColor(5, true)).toBe(CORRECT_COLOR);
  });

  it('uses inactive color for non-last-win bar with count > 0', () => {
    expect(getBarColor(5, false)).toBe(INACTIVE_COLOR);
  });

  it('uses empty color for zero-count bar regardless of isLastWin', () => {
    expect(getBarColor(0, true)).toBe(EMPTY_COLOR);
    expect(getBarColor(0, false)).toBe(EMPTY_COLOR);
  });
});
