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
    recordGameWin: (state, action: PayloadAction<{ guessCount: number; date: string }>) => {
      const { guessCount, date } = action.payload;
      state.statistics.gamesPlayed += 1;
      state.statistics.gamesWon += 1;
      state.statistics.guessDistribution[guessCount - 1] += 1;

      // Update streak
      const lastDate = state.statistics.lastCompletedDate;
      const isConsecutiveDay = lastDate ? isNextDay(lastDate, date) : true;

      if (isConsecutiveDay || !lastDate) {
        state.statistics.currentStreak += 1;
      } else {
        state.statistics.currentStreak = 1;
      }

      if (state.statistics.currentStreak > state.statistics.maxStreak) {
        state.statistics.maxStreak = state.statistics.currentStreak;
      }

      state.statistics.lastPlayedDate = date;
      state.statistics.lastCompletedDate = date;
    },
    recordGameLoss: (state, action: PayloadAction<{ date: string }>) => {
      const { date } = action.payload;
      state.statistics.gamesPlayed += 1;
      state.statistics.currentStreak = 0;
      state.statistics.lastPlayedDate = date;
      state.statistics.lastCompletedDate = date;
    },
    resetStatistics: (state) => {
      state.statistics = initialStatistics;
    },
    setStatisticsLoaded: (state, action: PayloadAction<boolean>) => {
      state.isLoaded = action.payload;
    },
  },
});

// Helper function to check if date2 is the next day after date1
function isNextDay(date1: string, date2: string): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  d1.setDate(d1.getDate() + 1);
  return d1.toDateString() === d2.toDateString();
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
