import { Platform } from 'react-native';

import { getStoreData, setStoreData } from '../utils/localStorageFuncs';

// Achievement category types
export type AchievementCategory = 'game' | 'streak' | 'skill' | 'daily';

// Achievement definitions
export const ACHIEVEMENTS = {
  // Game completion achievements
  firstWin: {
    id: 'com.wordle.achievement.first_win',
    title: 'First Victory',
    description: 'Win your first game of Wordle',
    points: 10,
    category: 'game' as AchievementCategory,
  },
  tenWins: {
    id: 'com.wordle.achievement.ten_wins',
    title: 'Getting Started',
    description: 'Win 10 games',
    points: 25,
    category: 'game' as AchievementCategory,
  },
  fiftyWins: {
    id: 'com.wordle.achievement.fifty_wins',
    title: 'Word Master',
    description: 'Win 50 games',
    points: 50,
    category: 'game' as AchievementCategory,
  },
  hundredWins: {
    id: 'com.wordle.achievement.hundred_wins',
    title: 'Lexicon Legend',
    description: 'Win 100 games',
    points: 100,
    category: 'game' as AchievementCategory,
  },

  // Streak achievements
  streak3: {
    id: 'com.wordle.achievement.streak_3',
    title: 'On a Roll',
    description: 'Achieve a 3-day win streak',
    points: 15,
    category: 'streak' as AchievementCategory,
  },
  streak7: {
    id: 'com.wordle.achievement.streak_7',
    title: 'Week Warrior',
    description: 'Achieve a 7-day win streak',
    points: 30,
    category: 'streak' as AchievementCategory,
  },
  streak30: {
    id: 'com.wordle.achievement.streak_30',
    title: 'Monthly Master',
    description: 'Achieve a 30-day win streak',
    points: 75,
    category: 'streak' as AchievementCategory,
  },
  streak100: {
    id: 'com.wordle.achievement.streak_100',
    title: 'Unstoppable',
    description: 'Achieve a 100-day win streak',
    points: 150,
    category: 'streak' as AchievementCategory,
  },

  // Skill achievements
  firstTryWin: {
    id: 'com.wordle.achievement.first_try',
    title: 'Perfect Guess',
    description: 'Win a game on your first try',
    points: 50,
    category: 'skill' as AchievementCategory,
  },
  secondTryWin: {
    id: 'com.wordle.achievement.second_try',
    title: 'Quick Thinker',
    description: 'Win a game in 2 tries',
    points: 25,
    category: 'skill' as AchievementCategory,
  },
  hardModeWin: {
    id: 'com.wordle.achievement.hard_mode',
    title: 'Hard Mode Hero',
    description: 'Win a game in Hard Mode',
    points: 20,
    category: 'skill' as AchievementCategory,
  },
  hardModeMaster: {
    id: 'com.wordle.achievement.hard_mode_master',
    title: 'Hard Mode Master',
    description: 'Win 25 games in Hard Mode',
    points: 75,
    category: 'skill' as AchievementCategory,
  },
  speedDemon: {
    id: 'com.wordle.achievement.speed_demon',
    title: 'Speed Demon',
    description: 'Win a game in under 30 seconds',
    points: 40,
    category: 'skill' as AchievementCategory,
  },

  // Daily challenge achievements
  dailyPlayer: {
    id: 'com.wordle.achievement.daily_player',
    title: 'Daily Devotee',
    description: 'Complete 7 daily challenges',
    points: 20,
    category: 'daily' as AchievementCategory,
  },
  dailyExpert: {
    id: 'com.wordle.achievement.daily_expert',
    title: 'Daily Expert',
    description: 'Complete 30 daily challenges',
    points: 50,
    category: 'daily' as AchievementCategory,
  },
  perfectMonth: {
    id: 'com.wordle.achievement.perfect_month',
    title: 'Perfect Month',
    description: 'Win every daily challenge in a calendar month',
    points: 200,
    category: 'daily' as AchievementCategory,
  },
} as const;

// Leaderboard definitions
export const LEADERBOARDS = {
  totalWins: {
    id: 'com.wordle.leaderboard.total_wins',
    title: 'Total Wins',
  },
  currentStreak: {
    id: 'com.wordle.leaderboard.current_streak',
    title: 'Current Streak',
  },
  maxStreak: {
    id: 'com.wordle.leaderboard.max_streak',
    title: 'Best Streak',
  },
  averageGuesses: {
    id: 'com.wordle.leaderboard.avg_guesses',
    title: 'Average Guesses',
  },
  winPercentage: {
    id: 'com.wordle.leaderboard.win_percentage',
    title: 'Win Rate',
  },
} as const;

// Local achievement tracking (for non-Game Center tracking)
const ACHIEVEMENT_STORAGE_KEY = 'wordle_achievements';
const ACHIEVEMENT_PROGRESS_KEY = 'wordle_achievement_progress';

interface AchievementProgress {
  totalWins: number;
  hardModeWins: number;
  dailyChallengesCompleted: number;
  currentStreak: number;
  maxStreak: number;
  firstTryWins: number;
  secondTryWins: number;
  fastestWinTime: number | null;
  monthlyWins: Record<string, number>; // "YYYY-MM" -> count
}

interface UnlockedAchievements {
  [achievementId: string]: {
    unlockedAt: string;
    reported: boolean;
  };
}

// Game Center state
let isGameCenterAvailable = false;
let isAuthenticated = false;

// Initialize Game Center
export async function initializeGameCenter(): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    console.log('Game Center is only available on iOS');
    return false;
  }

  try {
    // In a production app, you would use a native module here
    // For now, we'll simulate Game Center availability
    isGameCenterAvailable = true;
    console.log('Game Center initialized');
    return true;
  } catch (error) {
    console.log('Game Center initialization failed:', error);
    return false;
  }
}

// Authenticate with Game Center
export async function authenticateGameCenter(): Promise<boolean> {
  if (!isGameCenterAvailable) {
    return false;
  }

  try {
    // In production, this would present the Game Center login UI
    isAuthenticated = true;
    console.log('Game Center authenticated');
    return true;
  } catch (error) {
    console.log('Game Center authentication failed:', error);
    return false;
  }
}

// Check if Game Center is available and authenticated
export function isGameCenterReady(): boolean {
  return isGameCenterAvailable && isAuthenticated;
}

// Get achievement progress from storage
async function getAchievementProgress(): Promise<AchievementProgress> {
  try {
    const data = await getStoreData(ACHIEVEMENT_PROGRESS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.log('Error reading achievement progress:', error);
  }

  return {
    totalWins: 0,
    hardModeWins: 0,
    dailyChallengesCompleted: 0,
    currentStreak: 0,
    maxStreak: 0,
    firstTryWins: 0,
    secondTryWins: 0,
    fastestWinTime: null,
    monthlyWins: {},
  };
}

// Save achievement progress
async function saveAchievementProgress(progress: AchievementProgress): Promise<void> {
  try {
    await setStoreData(ACHIEVEMENT_PROGRESS_KEY, JSON.stringify(progress));
  } catch (error) {
    console.log('Error saving achievement progress:', error);
  }
}

// Get unlocked achievements
async function getUnlockedAchievements(): Promise<UnlockedAchievements> {
  try {
    const data = await getStoreData(ACHIEVEMENT_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.log('Error reading achievements:', error);
  }
  return {};
}

// Save unlocked achievements
async function saveUnlockedAchievements(achievements: UnlockedAchievements): Promise<void> {
  try {
    await setStoreData(ACHIEVEMENT_STORAGE_KEY, JSON.stringify(achievements));
  } catch (error) {
    console.log('Error saving achievements:', error);
  }
}

// Unlock an achievement
export async function unlockAchievement(
  achievementKey: keyof typeof ACHIEVEMENTS
): Promise<{ unlocked: boolean; isNew: boolean }> {
  const achievement = ACHIEVEMENTS[achievementKey];
  const unlocked = await getUnlockedAchievements();

  if (unlocked[achievement.id]) {
    return { unlocked: true, isNew: false };
  }

  // Mark as unlocked locally
  unlocked[achievement.id] = {
    unlockedAt: new Date().toISOString(),
    reported: false,
  };
  await saveUnlockedAchievements(unlocked);

  // Report to Game Center if available
  if (isGameCenterReady()) {
    try {
      // In production, use native module to report achievement
      console.log(`Achievement unlocked: ${achievement.title}`);
      const achievementRecord = unlocked[achievement.id];
      if (achievementRecord) {
        achievementRecord.reported = true;
        await saveUnlockedAchievements(unlocked);
      }
    } catch (error) {
      console.log('Error reporting achievement to Game Center:', error);
    }
  }

  return { unlocked: true, isNew: true };
}

// Check and unlock achievements based on game result
export async function checkAchievements(
  won: boolean,
  guessCount: number,
  isHardMode: boolean,
  isDaily: boolean,
  timeTaken: number | null
): Promise<Array<{ key: string; achievement: typeof ACHIEVEMENTS[keyof typeof ACHIEVEMENTS] }>> {
  const newAchievements: Array<{ key: string; achievement: typeof ACHIEVEMENTS[keyof typeof ACHIEVEMENTS] }> = [];
  const progress = await getAchievementProgress();

  if (won) {
    progress.totalWins++;
    progress.currentStreak++;
    progress.maxStreak = Math.max(progress.maxStreak, progress.currentStreak);

    if (isHardMode) {
      progress.hardModeWins++;
    }

    if (isDaily) {
      progress.dailyChallengesCompleted++;
      const monthKey = new Date().toISOString().slice(0, 7);
      progress.monthlyWins[monthKey] = (progress.monthlyWins[monthKey] || 0) + 1;
    }

    if (guessCount === 1) {
      progress.firstTryWins++;
    } else if (guessCount === 2) {
      progress.secondTryWins++;
    }

    if (timeTaken !== null) {
      if (progress.fastestWinTime === null || timeTaken < progress.fastestWinTime) {
        progress.fastestWinTime = timeTaken;
      }
    }

    // Check win count achievements
    if (progress.totalWins === 1) {
      const result = await unlockAchievement('firstWin');
      if (result.isNew) newAchievements.push({ key: 'firstWin', achievement: ACHIEVEMENTS.firstWin });
    }
    if (progress.totalWins === 10) {
      const result = await unlockAchievement('tenWins');
      if (result.isNew) newAchievements.push({ key: 'tenWins', achievement: ACHIEVEMENTS.tenWins });
    }
    if (progress.totalWins === 50) {
      const result = await unlockAchievement('fiftyWins');
      if (result.isNew) newAchievements.push({ key: 'fiftyWins', achievement: ACHIEVEMENTS.fiftyWins });
    }
    if (progress.totalWins === 100) {
      const result = await unlockAchievement('hundredWins');
      if (result.isNew) newAchievements.push({ key: 'hundredWins', achievement: ACHIEVEMENTS.hundredWins });
    }

    // Check streak achievements
    if (progress.currentStreak === 3) {
      const result = await unlockAchievement('streak3');
      if (result.isNew) newAchievements.push({ key: 'streak3', achievement: ACHIEVEMENTS.streak3 });
    }
    if (progress.currentStreak === 7) {
      const result = await unlockAchievement('streak7');
      if (result.isNew) newAchievements.push({ key: 'streak7', achievement: ACHIEVEMENTS.streak7 });
    }
    if (progress.currentStreak === 30) {
      const result = await unlockAchievement('streak30');
      if (result.isNew) newAchievements.push({ key: 'streak30', achievement: ACHIEVEMENTS.streak30 });
    }
    if (progress.currentStreak === 100) {
      const result = await unlockAchievement('streak100');
      if (result.isNew) newAchievements.push({ key: 'streak100', achievement: ACHIEVEMENTS.streak100 });
    }

    // Check skill achievements
    if (guessCount === 1) {
      const result = await unlockAchievement('firstTryWin');
      if (result.isNew) newAchievements.push({ key: 'firstTryWin', achievement: ACHIEVEMENTS.firstTryWin });
    }
    if (guessCount === 2) {
      const result = await unlockAchievement('secondTryWin');
      if (result.isNew) newAchievements.push({ key: 'secondTryWin', achievement: ACHIEVEMENTS.secondTryWin });
    }

    // Check hard mode achievements
    if (isHardMode) {
      if (progress.hardModeWins === 1) {
        const result = await unlockAchievement('hardModeWin');
        if (result.isNew) newAchievements.push({ key: 'hardModeWin', achievement: ACHIEVEMENTS.hardModeWin });
      }
      if (progress.hardModeWins === 25) {
        const result = await unlockAchievement('hardModeMaster');
        if (result.isNew) newAchievements.push({ key: 'hardModeMaster', achievement: ACHIEVEMENTS.hardModeMaster });
      }
    }

    // Check daily achievements
    if (isDaily) {
      if (progress.dailyChallengesCompleted === 7) {
        const result = await unlockAchievement('dailyPlayer');
        if (result.isNew) newAchievements.push({ key: 'dailyPlayer', achievement: ACHIEVEMENTS.dailyPlayer });
      }
      if (progress.dailyChallengesCompleted === 30) {
        const result = await unlockAchievement('dailyExpert');
        if (result.isNew) newAchievements.push({ key: 'dailyExpert', achievement: ACHIEVEMENTS.dailyExpert });
      }
    }

    // Check speed achievement
    if (timeTaken !== null && timeTaken < 30000) {
      const result = await unlockAchievement('speedDemon');
      if (result.isNew) newAchievements.push({ key: 'speedDemon', achievement: ACHIEVEMENTS.speedDemon });
    }
  } else {
    // Reset streak on loss
    progress.currentStreak = 0;
  }

  await saveAchievementProgress(progress);

  return newAchievements;
}

// Submit score to leaderboard
export async function submitLeaderboardScore(
  leaderboardKey: keyof typeof LEADERBOARDS,
  score: number
): Promise<boolean> {
  if (!isGameCenterReady()) {
    console.log('Game Center not ready, score not submitted');
    return false;
  }

  const leaderboard = LEADERBOARDS[leaderboardKey];

  try {
    // In production, use native module to submit score
    console.log(`Score ${score} submitted to ${leaderboard.title}`);
    return true;
  } catch (error) {
    console.log('Error submitting leaderboard score:', error);
    return false;
  }
}

// Update all leaderboards based on current stats
export async function updateLeaderboards(stats: {
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  averageGuesses: number;
  winPercentage: number;
}): Promise<void> {
  await submitLeaderboardScore('totalWins', stats.gamesWon);
  await submitLeaderboardScore('currentStreak', stats.currentStreak);
  await submitLeaderboardScore('maxStreak', stats.maxStreak);
  // Average guesses submitted as inverse (lower is better)
  await submitLeaderboardScore('averageGuesses', Math.round((7 - stats.averageGuesses) * 100));
  await submitLeaderboardScore('winPercentage', Math.round(stats.winPercentage));
}

// Show Game Center leaderboards UI
export async function showLeaderboards(): Promise<void> {
  if (!isGameCenterReady()) {
    console.log('Game Center not available');
    return;
  }

  try {
    // In production, use native module to show leaderboards
    console.log('Showing Game Center leaderboards');
  } catch (error) {
    console.log('Error showing leaderboards:', error);
  }
}

// Show Game Center achievements UI
export async function showAchievements(): Promise<void> {
  if (!isGameCenterReady()) {
    console.log('Game Center not available');
    return;
  }

  try {
    // In production, use native module to show achievements
    console.log('Showing Game Center achievements');
  } catch (error) {
    console.log('Error showing achievements:', error);
  }
}

// Get all achievements with unlock status
export async function getAllAchievements(): Promise<
  Array<{
    key: string;
    achievement: typeof ACHIEVEMENTS[keyof typeof ACHIEVEMENTS];
    unlocked: boolean;
    unlockedAt: string | null;
  }>
> {
  const unlocked = await getUnlockedAchievements();

  return Object.entries(ACHIEVEMENTS).map(([key, achievement]) => ({
    key,
    achievement,
    unlocked: !!unlocked[achievement.id],
    unlockedAt: unlocked[achievement.id]?.unlockedAt ?? null,
  }));
}

// Get achievement progress for display
export async function getAchievementProgressDisplay(): Promise<{
  totalAchievements: number;
  unlockedCount: number;
  totalPoints: number;
  earnedPoints: number;
  progress: AchievementProgress;
}> {
  const unlocked = await getUnlockedAchievements();
  const progress = await getAchievementProgress();

  const allAchievements = Object.values(ACHIEVEMENTS);
  const totalPoints = allAchievements.reduce((sum, a) => sum + a.points, 0);
  const earnedPoints = allAchievements
    .filter((a) => unlocked[a.id])
    .reduce((sum, a) => sum + a.points, 0);

  return {
    totalAchievements: allAchievements.length,
    unlockedCount: Object.keys(unlocked).length,
    totalPoints,
    earnedPoints,
    progress,
  };
}
