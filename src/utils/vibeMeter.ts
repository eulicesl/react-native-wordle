import { guess } from '../types';

export interface VibeScore {
  score: number;
  trend: 'up' | 'down' | 'same';
  label: string;
}

export function calculateVibeScore(guesses: guess[], _solution: string): VibeScore {
  const completedGuesses = guesses.filter((g) => g.isComplete);
  if (completedGuesses.length === 0) {
    return { score: 0, trend: 'same', label: 'Start guessing!' };
  }

  let previousScore = 0;
  let currentScore = 0;
  let bestScore = 0;

  for (let i = 0; i < completedGuesses.length; i++) {
    const g = completedGuesses[i];
    if (!g) continue;
    let guessScore = 0;

    for (let j = 0; j < 5; j++) {
      const match = g.matches[j];
      if (match === 'correct') {
        guessScore += 20;
      } else if (match === 'present') {
        guessScore += 8;
      }
    }

    if (i < completedGuesses.length - 1) {
      previousScore = guessScore;
    }
    currentScore = guessScore;
    bestScore = Math.max(bestScore, guessScore);
  }

  const score = Math.min(Math.round(bestScore), 100);

  const trend: VibeScore['trend'] =
    completedGuesses.length === 1
      ? 'same'
      : currentScore > previousScore
        ? 'up'
        : currentScore < previousScore
          ? 'down'
          : 'same';

  let label: string;
  if (score === 100) label = 'Perfect Vibe!';
  else if (score >= 80) label = 'Strong Vibe';
  else if (score >= 60) label = 'Getting Warmer';
  else if (score >= 40) label = 'Building...';
  else if (score >= 20) label = 'Early Days';
  else label = 'Keep Trying';

  return { score, trend, label };
}
