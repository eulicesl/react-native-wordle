import { Share, Platform } from 'react-native';

import { guess, matchStatus } from '../types';
import { getDayNumber } from './dailyWord';

// Emoji mappings
const EMOJI_CORRECT = '🟩';
const EMOJI_PRESENT = '🟨';
const EMOJI_ABSENT = '⬛';
const EMOJI_CORRECT_HIGH_CONTRAST = '🟧';
const EMOJI_PRESENT_HIGH_CONTRAST = '🟦';

function getEmoji(status: matchStatus, highContrast: boolean): string {
  switch (status) {
    case 'correct':
      return highContrast ? EMOJI_CORRECT_HIGH_CONTRAST : EMOJI_CORRECT;
    case 'present':
      return highContrast ? EMOJI_PRESENT_HIGH_CONTRAST : EMOJI_PRESENT;
    case 'absent':
      return EMOJI_ABSENT;
    default:
      return '';
  }
}

// Generate the emoji grid from guesses
export function generateEmojiGrid(
  guesses: guess[],
  highContrast = false
): string {
  const completedGuesses = guesses.filter((g) => g.isComplete);

  return completedGuesses
    .map((guess) =>
      guess.matches.map((status) => getEmoji(status, highContrast)).join('')
    )
    .join('\n');
}

// Generate the full share text
export function generateShareText(
  guesses: guess[],
  gameWon: boolean,
  isDaily: boolean,
  hardMode = false,
  highContrast = false
): string {
  const completedGuesses = guesses.filter((g) => g.isComplete);
  const guessCount = gameWon ? completedGuesses.length : 'X';

  const dayNumber = getDayNumber();
  const modeIndicator = hardMode ? '*' : '';
  const title = isDaily
    ? `Wordle ${dayNumber} ${guessCount}/6${modeIndicator}`
    : `Wordle (Unlimited) ${guessCount}/6${modeIndicator}`;

  const emojiGrid = generateEmojiGrid(guesses, highContrast);

  return `${title}\n\n${emojiGrid}`;
}

// Share results using native share dialog
export async function shareResults(
  guesses: guess[],
  gameWon: boolean,
  isDaily: boolean,
  hardMode = false,
  highContrast = false
): Promise<boolean> {
  const shareText = generateShareText(guesses, gameWon, isDaily, hardMode, highContrast);

  try {
    const result = await Share.share(
      {
        message: shareText,
        ...(Platform.OS === 'ios' && { title: 'Wordle Results' }),
      },
      {
        ...(Platform.OS === 'android' && { dialogTitle: 'Share your Wordle results' }),
      }
    );

    if (result.action === Share.sharedAction) {
      return true;
    }
    return false;
  } catch (error) {
    console.log('Error sharing results:', error);
    return false;
  }
}

// Copy to clipboard (for web or manual copy)
export function getShareableText(
  guesses: guess[],
  gameWon: boolean,
  isDaily: boolean,
  hardMode = false,
  highContrast = false
): string {
  return generateShareText(guesses, gameWon, isDaily, hardMode, highContrast);
}
