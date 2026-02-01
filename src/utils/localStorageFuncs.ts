import AsyncStorage from '@react-native-async-storage/async-storage';

import { SettingsState } from '../store/slices/settingsSlice';
import { GameStatistics } from '../store/slices/statisticsSlice';
import { guess, matchingUsedKey } from '../types';

// Storage keys
const STORAGE_KEYS = {
  LANGUAGE: 'language',
  STATISTICS: 'statistics',
  SETTINGS: 'settings',
  GAME_STATE: 'gameState',
  THEME: 'theme',
} as const;

export const setStoreData = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (_e) {
    console.log(_e);
  }
};

export const getStoreData = async (key: string): Promise<string | null> => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value;
  } catch (_e) {
    return null;
  }
};

// JSON storage helpers
export const setJsonData = async <T>(key: string, value: T): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (_e) {
    console.log('Error saving JSON data:', _e);
  }
};

export const getJsonData = async <T>(key: string): Promise<T | null> => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      return JSON.parse(value) as T;
    }
    return null;
  } catch (_e) {
    console.log('Error reading JSON data:', _e);
    return null;
  }
};

// Statistics storage
export const saveStatistics = async (statistics: GameStatistics): Promise<void> => {
  await setJsonData(STORAGE_KEYS.STATISTICS, statistics);
};

export const loadStatistics = async (): Promise<GameStatistics | null> => {
  return await getJsonData<GameStatistics>(STORAGE_KEYS.STATISTICS);
};

// Settings storage
export const saveSettings = async (settings: Partial<SettingsState>): Promise<void> => {
  const { isLoaded: _isLoaded, ...settingsToSave } = settings as SettingsState;
  await setJsonData(STORAGE_KEYS.SETTINGS, settingsToSave);
};

export const loadSettings = async (): Promise<Partial<SettingsState> | null> => {
  return await getJsonData<Partial<SettingsState>>(STORAGE_KEYS.SETTINGS);
};

// Game state storage for persistence
export interface PersistedGameState {
  solution: string;
  guesses: guess[];
  currentGuessIndex: number;
  usedKeys: matchingUsedKey;
  gameStarted: boolean;
  gameEnded: boolean;
  gameWon: boolean;
  gameLanguage: string;
  dailyWordDate: string;
  gameMode: 'daily' | 'unlimited';
}

export const saveGameState = async (gameState: PersistedGameState): Promise<void> => {
  await setJsonData(STORAGE_KEYS.GAME_STATE, gameState);
};

export const loadGameState = async (): Promise<PersistedGameState | null> => {
  return await getJsonData<PersistedGameState>(STORAGE_KEYS.GAME_STATE);
};

export const clearGameState = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.GAME_STATE);
  } catch (_e) {
    console.log('Error clearing game state:', _e);
  }
};

// Theme storage
export const saveTheme = async (isDark: boolean): Promise<void> => {
  await setStoreData(STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
};

export const loadTheme = async (): Promise<'dark' | 'light' | null> => {
  const theme = await getStoreData(STORAGE_KEYS.THEME);
  if (theme === 'dark' || theme === 'light') {
    return theme;
  }
  return null;
};

// Clear only statistics data
export const clearStatistics = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.STATISTICS);
  } catch (_e) {
    console.log('Error clearing statistics:', _e);
  }
};

// Clear all data (for reset functionality)
export const clearAllData = async (): Promise<void> => {
  try {
    const keys = Object.values(STORAGE_KEYS);
    await AsyncStorage.multiRemove(keys);
  } catch (_e) {
    console.log('Error clearing all data:', _e);
  }
};
