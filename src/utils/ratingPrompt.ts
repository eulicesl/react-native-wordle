import * as StoreReview from 'expo-store-review';

import { getStoreData, setStoreData } from './localStorageFuncs';

const LAST_PROMPT_KEY = 'wordle_last_rating_prompt';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function maybeRequestReview(
  gamesPlayed: number,
  gamesWon: number,
  didWin: boolean
): Promise<void> {
  // Only prompt after a win
  if (!didWin) return;

  // Need at least 5 games played
  if (gamesPlayed < 5) return;

  // Need >50% win rate
  if (gamesPlayed > 0 && gamesWon / gamesPlayed <= 0.5) return;

  // Check if we prompted recently
  const lastPrompt = await getStoreData(LAST_PROMPT_KEY);
  if (lastPrompt) {
    const lastTime = parseInt(lastPrompt, 10);
    if (Date.now() - lastTime < THIRTY_DAYS_MS) return;
  }

  // Check if the API is available
  const isAvailable = await StoreReview.isAvailableAsync();
  if (!isAvailable) return;

  // Record the prompt time and request review
  await setStoreData(LAST_PROMPT_KEY, Date.now().toString());
  await StoreReview.requestReview();
}
