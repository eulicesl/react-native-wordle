/**
 * UI Strings — centralized for consistency and future i18n support.
 * Grouped by screen/feature.
 */

// Game Board
export const WIN_MESSAGES = [
  'Genius!',
  'Magnificent!',
  'Impressive!',
  'Splendid!',
  'Great!',
  'Phew!',
] as const;

export const GAME_BOARD = {
  guessSingular: 'guess',
  guessPlural: 'guesses',
  youGotItIn: 'You got it in',
  betterLuckNextTime: 'Better Luck Next Time',
  theWordWas: 'The word was',
  streak: 'Streak',
  winRate: 'Win Rate',
  played: 'Played',
  share: 'Share',
  newGame: 'New Game',
  daily: 'Daily',
  hard: 'Hard',
} as const;

// Pre-game screen
export const PRE_GAME = {
  subtitle: 'Feel the vibe. Guess the word in 6 tries.',
  dailyComplete: 'Daily Complete',
  dailyChallenge: 'Daily Challenge',
  comeBackTomorrow: 'Come back tomorrow!',
  sameWordForEveryone: 'Same word for everyone',
  unlimited: 'Unlimited',
  practiceWithRandomWords: 'Practice with random words',
  dayStreak: 'Day Streak',
  hardModeEnabled: 'Hard Mode Enabled',
} as const;

// Settings screen
export const SETTINGS = {
  title: 'Settings',
  language: 'Language',
  appearance: 'Appearance',
  gameplay: 'Gameplay',
  data: 'Data',
  darkTheme: 'Dark Theme',
  darkThemeDesc: 'Reduce eye strain in low light',
  highContrastMode: 'High Contrast Mode',
  highContrastDesc: 'Use orange/blue for colorblind accessibility',
  hardMode: 'Hard Mode',
  hardModeDesc: 'Revealed hints must be used',
  hardModeAlert: 'Hard Mode can only be enabled at the start of a round.',
  hapticFeedback: 'Haptic Feedback',
  hapticDesc: 'Vibrate on key press',
  soundEffects: 'Sound Effects',
  soundDesc: 'Play sounds on actions',
  replayTutorial: 'Replay Tutorial',
  resetStatistics: 'Reset Statistics',
  resetStatisticsConfirm: 'Are you sure you want to reset all statistics? This cannot be undone.',
  cancel: 'Cancel',
  reset: 'Reset',
  createdBy: 'Created with ♥ by Eulices Lopez',
} as const;

// Statistics screen
export const STATISTICS = {
  avgGuesses: 'Avg. Guesses',
  stats: 'Stats',
  trophies: 'Trophies',
  history: 'History',
} as const;

// Achievements
export const ACHIEVEMENTS = {
  unlocked: 'Achievement Unlocked!',
} as const;

// Game modes
export const GAME_MODES = {
  speedChallenge: 'Speed Challenge',
  twoMinutes: '2 minutes',
  fiveMinutes: '5 minutes',
  speed: 'Speed',
} as const;

// Hints
export const HINTS = {
  useHint: 'Use hint',
  hint: 'Hint',
  hintsRemaining: 'hints remaining',
} as const;

// Share card
export const SHARE_CARD = {
  appName: 'WordVibe',
  dailyChallenge: 'Daily Challenge',
} as const;

// Timer
export const TIMER_COLORS = {
  critical: '#FF453A',
  warning: '#FF9500',
} as const;
