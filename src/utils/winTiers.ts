import { SoundType } from './sounds';

export interface WinTier {
  name: string;
  confettiCount: number;
  soundType: SoundType;
}

const WIN_TIERS: readonly WinTier[] = [
  { name: 'GENIUS', confettiCount: 100, soundType: 'winTier1' },
  { name: 'MAGNIFICENT', confettiCount: 80, soundType: 'winTier2' },
  { name: 'IMPRESSIVE', confettiCount: 60, soundType: 'winTier3' },
  { name: 'SPLENDID', confettiCount: 50, soundType: 'winTier4' },
  { name: 'GREAT', confettiCount: 40, soundType: 'winTier5' },
  { name: 'PHEW', confettiCount: 20, soundType: 'winTier6' },
] as const;

/**
 * Returns the win tier for a given guess count (1-6).
 * Clamps out-of-range values to the nearest valid tier.
 */
export function getWinTier(guessCount: number): WinTier {
  const index = Math.max(0, Math.min(5, guessCount - 1));
  return WIN_TIERS[index]!;
}
