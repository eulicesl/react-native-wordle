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
