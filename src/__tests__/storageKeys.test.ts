/**
 * Storage Key Prefix Tests
 *
 * Verifies that all storage keys use the `wordvibe_` prefix after
 * the rebrand from Wordle → WordVibe. The constants are module-private,
 * so we assert via AsyncStorage call arguments.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock expo-store-review (used by ratingPrompt)
jest.mock('expo-store-review', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  requestReview: jest.fn(() => Promise.resolve()),
}));

// Mock expo-constants (used by errorLogging)
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { version: '2.0.0' } },
}));

// Mock react-native Platform (used by errorLogging)
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn((obj: { ios?: unknown }) => obj.ios),
  },
}));

// Mock global fetch (used by wordDefinitions)
global.fetch = jest.fn();

describe('storage key prefixes', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('wordDefinitions uses wordvibe_ prefix', async () => {
    const mockResponse = {
      ok: true,
      json: () =>
        Promise.resolve([
          {
            word: 'test',
            phonetic: '/tɛst/',
            meanings: [
              {
                partOfSpeech: 'noun',
                definitions: [{ definition: 'A trial', example: 'a test case' }],
              },
            ],
          },
        ]),
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    const { fetchWordDefinition } = require('../utils/wordDefinitions');
    await fetchWordDefinition('test', 'en');

    // Verify it reads from and writes to the wordvibe_ key
    const setItemCalls = (AsyncStorage.setItem as jest.Mock).mock.calls;
    const definitionWrite = setItemCalls.find(
      ([key]: [string]) => key === 'wordvibe_word_definitions'
    );
    expect(definitionWrite).toBeDefined();
  });

  it('errorLogging uses wordvibe_ prefix', async () => {
    const { logFatal, initializeErrorLogging } = require('../services/errorLogging');
    initializeErrorLogging();
    await logFatal('general', 'Test fatal error');

    const setItemCalls = (AsyncStorage.setItem as jest.Mock).mock.calls;
    const errorLogWrite = setItemCalls.find(
      ([key]: [string]) => key === 'wordvibe_error_log'
    );
    expect(errorLogWrite).toBeDefined();
  });

  it('gameHistory uses wordvibe_ prefix', async () => {
    const { saveGameToHistory } = require('../utils/gameHistory');
    await saveGameToHistory({
      date: new Date().toISOString(),
      solution: 'vibes',
      won: true,
      guessCount: 3,
      matches: [['correct', 'correct', 'correct', 'correct', 'correct']],
      gameMode: 'daily',
      hardMode: false,
    });

    const setItemCalls = (AsyncStorage.setItem as jest.Mock).mock.calls;
    const historyWrite = setItemCalls.find(
      ([key]: [string]) => key === 'wordvibe_game_history'
    );
    expect(historyWrite).toBeDefined();
  });

  it('ratingPrompt uses wordvibe_ prefix', async () => {
    const { maybeRequestReview } = require('../utils/ratingPrompt');
    // gamesPlayed=10, gamesWon=8, didWin=true → should attempt review
    await maybeRequestReview(10, 8, true);

    const setItemCalls = (AsyncStorage.setItem as jest.Mock).mock.calls;
    const ratingWrite = setItemCalls.find(
      ([key]: [string]) => key === 'wordvibe_last_rating_prompt'
    );
    expect(ratingWrite).toBeDefined();
  });

  it('no source files outside migration.ts use wordle_ prefix', async () => {
    // This is a static assertion — read the source files and check for stale keys.
    // The actual regex scan is done at lint/CI time via grep, but we document the
    // expectation here for regression safety.
    const fs = require('fs');
    const path = require('path');

    const filesToCheck = [
      path.resolve(__dirname, '../utils/wordDefinitions.ts'),
      path.resolve(__dirname, '../services/errorLogging.ts'),
      path.resolve(__dirname, '../utils/gameHistory.ts'),
      path.resolve(__dirname, '../utils/ratingPrompt.ts'),
    ];

    for (const filePath of filesToCheck) {
      const content = fs.readFileSync(filePath, 'utf8');
      const matches = content.match(/['"]wordle_/g);
      expect(matches).toBeNull();
    }
  });
});
