import { matchStatus } from '../types';
import { getStoreData, setStoreData } from './localStorageFuncs';

const HISTORY_KEY = 'wordle_game_history';
const MAX_ENTRIES = 365;

export interface GameHistoryEntry {
  date: string; // ISO string
  solution: string;
  won: boolean;
  guessCount: number;
  matches: matchStatus[][]; // array of match arrays per row
  gameMode: 'daily' | 'unlimited' | 'speed';
  hardMode: boolean;
}

export async function loadGameHistory(): Promise<GameHistoryEntry[]> {
  try {
    const data = await getStoreData(HISTORY_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch {
    // ignore
  }
  return [];
}

export async function saveGameToHistory(entry: GameHistoryEntry): Promise<void> {
  try {
    const history = await loadGameHistory();
    history.unshift(entry); // newest first
    // Cap at MAX_ENTRIES
    if (history.length > MAX_ENTRIES) {
      history.length = MAX_ENTRIES;
    }
    await setStoreData(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // ignore
  }
}
