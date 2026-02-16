export const MILESTONE_THRESHOLDS = [3, 7, 14, 30, 50, 100, 200, 365] as const;

/**
 * Returns the milestone value if the streak exactly matches a threshold, null otherwise.
 */
export function checkStreakMilestone(streak: number): number | null {
  return (MILESTONE_THRESHOLDS as readonly number[]).includes(streak) ? streak : null;
}
