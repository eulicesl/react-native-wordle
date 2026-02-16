import { getWinTier, WinTier } from '../utils/winTiers';

describe('getWinTier', () => {
  it('should return GENIUS tier for guess count 1', () => {
    const tier = getWinTier(1);
    expect(tier).toEqual<WinTier>({
      name: 'GENIUS',
      confettiCount: 100,
      soundType: 'winTier1',
    });
  });

  it('should return MAGNIFICENT tier for guess count 2', () => {
    const tier = getWinTier(2);
    expect(tier).toEqual<WinTier>({
      name: 'MAGNIFICENT',
      confettiCount: 80,
      soundType: 'winTier2',
    });
  });

  it('should return IMPRESSIVE tier for guess count 3', () => {
    const tier = getWinTier(3);
    expect(tier).toEqual<WinTier>({
      name: 'IMPRESSIVE',
      confettiCount: 60,
      soundType: 'winTier3',
    });
  });

  it('should return SPLENDID tier for guess count 4', () => {
    const tier = getWinTier(4);
    expect(tier).toEqual<WinTier>({
      name: 'SPLENDID',
      confettiCount: 50,
      soundType: 'winTier4',
    });
  });

  it('should return GREAT tier for guess count 5', () => {
    const tier = getWinTier(5);
    expect(tier).toEqual<WinTier>({
      name: 'GREAT',
      confettiCount: 40,
      soundType: 'winTier5',
    });
  });

  it('should return PHEW tier for guess count 6', () => {
    const tier = getWinTier(6);
    expect(tier).toEqual<WinTier>({
      name: 'PHEW',
      confettiCount: 20,
      soundType: 'winTier6',
    });
  });

  it('should clamp guess count below 1 to GENIUS tier', () => {
    expect(getWinTier(0).name).toBe('GENIUS');
    expect(getWinTier(-1).name).toBe('GENIUS');
  });

  it('should clamp guess count above 6 to PHEW tier', () => {
    expect(getWinTier(7).name).toBe('PHEW');
    expect(getWinTier(100).name).toBe('PHEW');
  });

  it('should return decreasing confetti counts for higher guess counts', () => {
    const counts = [1, 2, 3, 4, 5, 6].map((n) => getWinTier(n).confettiCount);
    for (let i = 1; i < counts.length; i++) {
      expect(counts[i]).toBeLessThan(counts[i - 1]);
    }
  });
});
