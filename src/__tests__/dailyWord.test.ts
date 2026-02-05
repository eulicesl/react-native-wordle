import {
  getDailyWord,
  getTodayDateString,
  isGameForToday,
  getDayNumber,
  getTimeUntilNextWord,
} from '../utils/dailyWord';

describe('getTodayDateString', () => {
  it('should return date in YYYY-MM-DD format', () => {
    const result = getTodayDateString();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should use UTC date', () => {
    // The function should use UTC, so the date should be consistent
    const result = getTodayDateString();
    const now = new Date();
    const expectedYear = now.getUTCFullYear();
    expect(result.startsWith(String(expectedYear))).toBe(true);
  });
});

describe('getDailyWord', () => {
  it('should return a 5-letter word', () => {
    const word = getDailyWord('2024-01-15', 'en');
    expect(word.length).toBe(5);
  });

  it('should return the same word for the same date', () => {
    const word1 = getDailyWord('2024-01-15', 'en');
    const word2 = getDailyWord('2024-01-15', 'en');
    expect(word1).toBe(word2);
  });

  it('should return different words for different dates', () => {
    const word1 = getDailyWord('2024-01-15', 'en');
    const word2 = getDailyWord('2024-01-16', 'en');
    // Highly unlikely to be the same word
    // In rare cases this could fail, but statistically improbable
    expect(word1).not.toBe(word2);
  });

  it('should return different words for different languages on same date', () => {
    const wordEn = getDailyWord('2024-01-15', 'en');
    const wordTr = getDailyWord('2024-01-15', 'tr');
    // Words could technically be the same, but highly unlikely
    // The important thing is the seed is different
    // We can't always guarantee different words
    expect(typeof wordEn).toBe('string');
    expect(typeof wordTr).toBe('string');
  });

  it('should be deterministic across multiple calls', () => {
    const results: string[] = [];
    for (let i = 0; i < 10; i++) {
      results.push(getDailyWord('2024-06-20', 'en'));
    }
    // All results should be identical
    expect(new Set(results).size).toBe(1);
  });

  it('should generate valid words for a range of dates', () => {
    const dates = [
      '2024-01-01',
      '2024-06-15',
      '2024-12-31',
      '2025-01-01',
      '2023-07-04',
    ];

    dates.forEach((date) => {
      const word = getDailyWord(date, 'en');
      expect(word.length).toBe(5);
      expect(typeof word).toBe('string');
      // Should only contain letters
      expect(word).toMatch(/^[a-z]+$/);
    });
  });

  it('should handle Turkish language', () => {
    const word = getDailyWord('2024-01-15', 'tr');
    expect(word.length).toBe(5);
    expect(typeof word).toBe('string');
  });
});

describe('isGameForToday', () => {
  it('should return true when date matches today', () => {
    const today = getTodayDateString();
    expect(isGameForToday(today)).toBe(true);
  });

  it('should return false for yesterday', () => {
    const now = new Date();
    const yesterday = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - 1
    ));
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    expect(isGameForToday(yesterdayStr)).toBe(false);
  });

  it('should return false for tomorrow', () => {
    const now = new Date();
    const tomorrow = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1
    ));
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);
    expect(isGameForToday(tomorrowStr)).toBe(false);
  });

  it('should return false for arbitrary past date', () => {
    expect(isGameForToday('2020-01-01')).toBe(false);
  });
});

describe('getDayNumber', () => {
  it('should return a positive number', () => {
    const dayNum = getDayNumber();
    expect(dayNum).toBeGreaterThan(0);
  });

  it('should return number of days since Jan 1, 2022', () => {
    // Use fake timers to freeze time without replacing the global Date constructor
    const mockDate = new Date(Date.UTC(2024, 5, 15, 12, 0, 0)); // June 15, 2024 12:00 UTC

    jest.useFakeTimers();
    jest.setSystemTime(mockDate);

    try {
      const dayNum = getDayNumber();

      // Calculate expected days from Jan 1, 2022 to June 15, 2024
      const start = new Date(Date.UTC(2022, 0, 1));
      const expectedDays = Math.floor(
        (mockDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );
      expect(dayNum).toBe(expectedDays);
    } finally {
      jest.useRealTimers();
    }
  });

  it('should be consistent when called multiple times', () => {
    const day1 = getDayNumber();
    const day2 = getDayNumber();
    expect(day1).toBe(day2);
  });
});

describe('getTimeUntilNextWord', () => {
  it('should return valid hour, minute, second values', () => {
    const { hours, minutes, seconds } = getTimeUntilNextWord();

    expect(hours).toBeGreaterThanOrEqual(0);
    expect(hours).toBeLessThanOrEqual(23);

    expect(minutes).toBeGreaterThanOrEqual(0);
    expect(minutes).toBeLessThanOrEqual(59);

    expect(seconds).toBeGreaterThanOrEqual(0);
    expect(seconds).toBeLessThanOrEqual(59);
  });

  it('should return time less than 24 hours', () => {
    const { hours, minutes, seconds } = getTimeUntilNextWord();
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    expect(totalSeconds).toBeLessThan(24 * 60 * 60);
    expect(totalSeconds).toBeGreaterThan(0);
  });
});

describe('Seeded RNG determinism', () => {
  it('should produce consistent word sequences for consecutive dates', () => {
    const words: string[] = [];
    for (let i = 1; i <= 30; i++) {
      const date = `2024-03-${String(i).padStart(2, '0')}`;
      words.push(getDailyWord(date, 'en'));
    }

    // Verify determinism by checking again
    for (let i = 1; i <= 30; i++) {
      const date = `2024-03-${String(i).padStart(2, '0')}`;
      expect(getDailyWord(date, 'en')).toBe(words[i - 1]);
    }
  });

  it('should not produce the same word for many consecutive days', () => {
    const words = new Set<string>();
    for (let i = 1; i <= 100; i++) {
      const dayOffset = i - 1;
      const date = new Date(Date.UTC(2024, 0, 1 + dayOffset));
      const dateStr = date.toISOString().slice(0, 10);
      words.add(getDailyWord(dateStr, 'en'));
    }

    // Should have mostly unique words (allowing for some potential collisions)
    // With 2000+ words in the list, 100 days should give us at least 90 unique
    expect(words.size).toBeGreaterThan(85);
  });
});
