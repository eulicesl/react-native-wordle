import { configureStore } from '@reduxjs/toolkit';

import gameStateSlice from './slices/gameStateSlice';
import settingsSlice from './slices/settingsSlice';
import statisticsSlice from './slices/statisticsSlice';
import themeSlice from './slices/themeSlice';

export const store = configureStore({
  reducer: {
    gameState: gameStateSlice,
    theme: themeSlice,
    statistics: statisticsSlice,
    settings: settingsSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
