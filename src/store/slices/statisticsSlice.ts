import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '..';

export interface GameStatistics {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: number[]; // Index 0 = won in 1, Index 5 = won in 6
  lastPlayedDate: string | null;
  lastCompletedDate: string | null;
}

export interface StatisticsState {
  statistics: GameStatistics;
  isLoaded: boolean;
}

const initialStatistics: GameStatistics = {
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: [0, 0, 0, 0, 0, 0],
  lastPlayedDate: null,
  lastCompletedDate: null,
};

const initialState: StatisticsState = {
  statistics: initialStatistics,
  isLoaded: false,
};

export const statisticsSlice = createSlice({
  name: 'statistics',
  initialState,
  reducers: {
    setStatistics: (state, action: PayloadAction<GameStatistics>) => {
      state.statistics = action.payload;
      state.isLoaded = true;
    },
    recordGameWin: (state, action: PayloadAction<{ guessCount: number; date: string; isDaily?: boolean }>) => {
      const { guessCount, date, isDaily = true } = action.payload;
      state.statistics.gamesPlayed += 1;
      state.statistics.gamesWon += 1;
      const distIndex = guessCount - 1;
      if (state.statistics.guessDistribution[distIndex] !== undefined) {
        state.statistics.guessDistribution[distIndex] += 1;
      }

      // Only update streak for daily games
      if (isDaily) {
        const lastDate = state.statistics.lastCompletedDate;
        const isSameDay = lastDate === date;
        const isConsecutiveDay = lastDate ? isNextDay(lastDate, date) : true;

        // If same day, don't change streak (already counted)
        // If consecutive day or no previous date, increment streak
        // Otherwise, reset streak to 1
        if (!isSameDay) {
          if (isConsecutiveDay || !lastDate) {
            state.statistics.currentStreak += 1;
          } else {
            state.statistics.currentStreak = 1;
          }

          if (state.statistics.currentStreak > state.statistics.maxStreak) {
            state.statistics.maxStreak = state.statistics.currentStreak;
          }

          state.statistics.lastCompletedDate = date;
        }
      }

      state.statistics.lastPlayedDate = date;
    },
    recordGameLoss: (state, action: PayloadAction<{ date: string; isDaily?: boolean }>) => {
      const { date, isDaily = true } = action.payload;
      state.statistics.gamesPlayed += 1;
      
      // Only affect streak for daily games
      if (isDaily) {
        state.statistics.currentStreak = 0;
        state.statistics.lastCompletedDate = date;
      }
      
      state.statistics.lastPlayedDate = date;
    },
    resetStatistics: (state) => {
      state.statistics = initialStatistics;
    },
    setStatisticsLoaded: (state, action: PayloadAction<boolean>) => {
      state.isLoaded = action.payload;
    },
  },
});

// Helper function to check if date2 is the next day after date1 (using UTC)
function isNextDay(date1: string, date2: string): boolean {
  // Dates are expected in 'YYYY-MM-DD' format representing UTC calendar days.
  const d1 = new Date(`${date1}T00:00:00Z`);
  const d2 = new Date(`${date2}T00:00:00Z`);

  // If either date is invalid, we cannot reliably determine consecutiveness.
  if (Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime())) {
    return false;
  }

  // Add one day in UTC to the first date.
  d1.setUTCDate(d1.getUTCDate() + 1);

  // Compare the UTC calendar dates (YYYY-MM-DD).
  const nextDayStr = d1.toISOString().slice(0, 10);
  const targetStr = d2.toISOString().slice(0, 10);

  return nextDayStr === targetStr;
}

export const {
  setStatistics,
  recordGameWin,
  recordGameLoss,
  resetStatistics,
  setStatisticsLoaded,
} = statisticsSlice.actions;

export const selectStatistics = (state: RootState) => state.statistics.statistics;
export const selectStatisticsLoaded = (state: RootState) => state.statistics.isLoaded;

export default statisticsSlice.reducer;
