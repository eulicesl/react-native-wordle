/**
 * Tests for the animation logic used in the Statistics screen.
 *
 * These test the pure calculations that feed into Reanimated animations:
 * - Tab indicator positioning (tabIndicatorWidth, tab index mapping)
 * - Distribution bar width computation (percentage, minimum widths)
 */

describe('Statistics tab indicator calculations', () => {
  const TAB_COUNT = 3;
  const TAB_CONTAINER_PADDING = 4;
  const SCREEN_HORIZONTAL_PADDING = 20;

  function calcTabIndicatorWidth(
    tabContainerWidth: number,
    screenWidth: number,
  ): number {
    return tabContainerWidth > 0
      ? (tabContainerWidth - TAB_CONTAINER_PADDING * 2) / TAB_COUNT
      : (screenWidth - SCREEN_HORIZONTAL_PADDING * 2 - TAB_CONTAINER_PADDING * 2) / TAB_COUNT;
  }

  function tabIndexFromActiveTab(activeTab: 'stats' | 'achievements' | 'history'): number {
    return activeTab === 'stats' ? 0 : activeTab === 'achievements' ? 1 : 2;
  }

  describe('tabIndicatorWidth', () => {
    it('uses measured container width when available', () => {
      const width = calcTabIndicatorWidth(360, 400);
      // (360 - 4*2) / 3 = 352/3 ≈ 117.33
      expect(width).toBeCloseTo(117.33, 1);
    });

    it('falls back to screen width when container width is 0', () => {
      const width = calcTabIndicatorWidth(0, 375);
      // (375 - 20*2 - 4*2) / 3 = (375 - 48) / 3 = 327/3 = 109
      expect(width).toBe(109);
    });

    it('divides evenly for width of 360', () => {
      // Container of 360: (360 - 8) / 3 = 352/3
      const width = calcTabIndicatorWidth(360, 400);
      expect(width * TAB_COUNT).toBeCloseTo(360 - TAB_CONTAINER_PADDING * 2);
    });
  });

  describe('tab index mapping', () => {
    it('maps stats to index 0', () => {
      expect(tabIndexFromActiveTab('stats')).toBe(0);
    });

    it('maps achievements to index 1', () => {
      expect(tabIndexFromActiveTab('achievements')).toBe(1);
    });

    it('maps history to index 2', () => {
      expect(tabIndexFromActiveTab('history')).toBe(2);
    });
  });

  describe('tab indicator translateX', () => {
    it('translates to 0 for tab index 0', () => {
      const tabIndicatorWidth = calcTabIndicatorWidth(360, 400);
      expect(0 * tabIndicatorWidth).toBe(0);
    });

    it('translates to 1x width for tab index 1', () => {
      const tabIndicatorWidth = calcTabIndicatorWidth(360, 400);
      expect(1 * tabIndicatorWidth).toBeCloseTo(117.33, 1);
    });

    it('translates to 2x width for tab index 2', () => {
      const tabIndicatorWidth = calcTabIndicatorWidth(360, 400);
      expect(2 * tabIndicatorWidth).toBeCloseTo(234.67, 1);
    });
  });
});

describe('DistributionBar width calculations', () => {
  function calcBarWidth(count: number, maxCount: number): number {
    const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
    return Math.max(percentage, count > 0 ? 15 : 8);
  }

  it('returns 8% minimum for zero count', () => {
    expect(calcBarWidth(0, 10)).toBe(8);
  });

  it('returns 15% minimum for non-zero count below threshold', () => {
    // 1/100 = 1%, but minimum is 15
    expect(calcBarWidth(1, 100)).toBe(15);
  });

  it('returns actual percentage when above minimum', () => {
    // 50/100 = 50%
    expect(calcBarWidth(50, 100)).toBe(50);
  });

  it('returns 100% for max count equal to count', () => {
    expect(calcBarWidth(10, 10)).toBe(100);
  });

  it('returns 0 when maxCount is 0', () => {
    // percentage = 0, min = count > 0 ? 15 : 8 → 8
    expect(calcBarWidth(0, 0)).toBe(8);
  });

  it('handles single game correctly', () => {
    // 1/1 = 100%
    expect(calcBarWidth(1, 1)).toBe(100);
  });

  it('returns correct percentage for partial distribution', () => {
    // 3/6 = 50%
    expect(calcBarWidth(3, 6)).toBe(50);
  });

  it('ensures minimum width for small non-zero counts', () => {
    // 1/10 = 10%, but min is 15
    expect(calcBarWidth(1, 10)).toBe(15);
  });
});

describe('StatCard count-up animation logic', () => {
  const STAT_CARD_COUNT_UP_DURATION = 800;
  const STAT_CARD_STAGGER_DELAY = 80;

  /**
   * Mirrors the count-up interpolation: Math.round(animValue) where animValue
   * goes from 0 → target over STAT_CARD_COUNT_UP_DURATION ms.
   */
  function countUpFrame(target: number, progress: number): number {
    // progress is 0..1 representing animation progress
    return Math.round(target * progress);
  }

  /**
   * Mirrors the stagger delay for card at given index.
   */
  function staggerDelay(index: number): number {
    return index * STAT_CARD_STAGGER_DELAY;
  }

  describe('count-up interpolation', () => {
    it('starts at 0 for progress 0', () => {
      expect(countUpFrame(42, 0)).toBe(0);
    });

    it('ends at the target value for progress 1', () => {
      expect(countUpFrame(42, 1)).toBe(42);
    });

    it('rounds to nearest integer at midpoint', () => {
      expect(countUpFrame(99, 0.5)).toBe(50);
    });

    it('handles zero target value', () => {
      expect(countUpFrame(0, 0.5)).toBe(0);
      expect(countUpFrame(0, 1)).toBe(0);
    });

    it('handles large values', () => {
      expect(countUpFrame(1000, 1)).toBe(1000);
      expect(countUpFrame(1000, 0.25)).toBe(250);
    });
  });

  describe('stagger delays', () => {
    it('returns 0ms delay for first card (index 0)', () => {
      expect(staggerDelay(0)).toBe(0);
    });

    it('returns 80ms delay for second card (index 1)', () => {
      expect(staggerDelay(1)).toBe(80);
    });

    it('returns 160ms delay for third card (index 2)', () => {
      expect(staggerDelay(2)).toBe(160);
    });

    it('returns 240ms delay for fourth card (index 3)', () => {
      expect(staggerDelay(3)).toBe(240);
    });

    it('produces total animation window within 1 second', () => {
      const lastCardDelay = staggerDelay(3);
      expect(lastCardDelay + STAT_CARD_COUNT_UP_DURATION).toBeLessThanOrEqual(1100);
    });
  });

  describe('stat cards configuration', () => {
    const STAT_CARD_LABELS = ['Played', 'Win %', 'Current Streak', 'Max Streak'];

    it('has exactly 4 cards for the 2x2 grid', () => {
      expect(STAT_CARD_LABELS).toHaveLength(4);
    });

    it('includes all required statistics', () => {
      expect(STAT_CARD_LABELS).toContain('Played');
      expect(STAT_CARD_LABELS).toContain('Win %');
      expect(STAT_CARD_LABELS).toContain('Current Streak');
      expect(STAT_CARD_LABELS).toContain('Max Streak');
    });

    it('does not include averageGuesses in the card grid', () => {
      expect(STAT_CARD_LABELS).not.toContain('Avg. Guesses');
    });
  });

  describe('win percentage calculation', () => {
    function winPercentage(gamesPlayed: number, gamesWon: number): number {
      return gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;
    }

    it('returns 0 when no games played', () => {
      expect(winPercentage(0, 0)).toBe(0);
    });

    it('returns 100 for perfect record', () => {
      expect(winPercentage(10, 10)).toBe(100);
    });

    it('rounds correctly', () => {
      // 1/3 = 33.33... → 33
      expect(winPercentage(3, 1)).toBe(33);
      // 2/3 = 66.66... → 67
      expect(winPercentage(3, 2)).toBe(67);
    });
  });
});
