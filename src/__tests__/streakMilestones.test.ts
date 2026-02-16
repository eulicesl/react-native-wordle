import { checkStreakMilestone, MILESTONE_THRESHOLDS } from '../utils/streakMilestones';

describe('checkStreakMilestone', () => {
  it.each(
    [...MILESTONE_THRESHOLDS].map((t) => [t])
  )('should return %i for streak %i', (threshold) => {
    expect(checkStreakMilestone(threshold)).toBe(threshold);
  });

  it('should return null for non-milestone streaks', () => {
    const nonMilestones = [0, 1, 2, 4, 5, 6, 8, 10, 13, 15, 20, 29, 31, 49, 51, 99, 101, 199, 201, 364, 366, 500];
    for (const streak of nonMilestones) {
      expect(checkStreakMilestone(streak)).toBeNull();
    }
  });

  it('should return null for negative numbers', () => {
    expect(checkStreakMilestone(-1)).toBeNull();
    expect(checkStreakMilestone(-100)).toBeNull();
  });

  it('should have thresholds in ascending order', () => {
    for (let i = 1; i < MILESTONE_THRESHOLDS.length; i++) {
      expect(MILESTONE_THRESHOLDS[i]).toBeGreaterThan(MILESTONE_THRESHOLDS[i - 1]);
    }
  });

  it('should contain exactly 8 milestone thresholds', () => {
    expect(MILESTONE_THRESHOLDS).toHaveLength(8);
  });
});
