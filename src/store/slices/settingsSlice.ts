import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '..';

export interface SettingsState {
  hardMode: boolean;
  highContrastMode: boolean;
  hapticFeedback: boolean;
  soundEnabled: boolean;
  isLoaded: boolean;
}

const initialState: SettingsState = {
  hardMode: false,
  highContrastMode: false,
  hapticFeedback: true,
  soundEnabled: true,
  isLoaded: false,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setHardMode: (state, action: PayloadAction<boolean>) => {
      state.hardMode = action.payload;
    },
    setHighContrastMode: (state, action: PayloadAction<boolean>) => {
      state.highContrastMode = action.payload;
    },
    setHapticFeedback: (state, action: PayloadAction<boolean>) => {
      state.hapticFeedback = action.payload;
    },
    setSoundEnabled: (state, action: PayloadAction<boolean>) => {
      state.soundEnabled = action.payload;
    },
    setSettings: (state, action: PayloadAction<Partial<SettingsState>>) => {
      return { ...state, ...action.payload, isLoaded: true };
    },
    setSettingsLoaded: (state, action: PayloadAction<boolean>) => {
      state.isLoaded = action.payload;
    },
  },
});

export const {
  setHardMode,
  setHighContrastMode,
  setHapticFeedback,
  setSoundEnabled,
  setSettings,
  setSettingsLoaded,
} = settingsSlice.actions;

export const selectHardMode = (state: RootState) => state.settings.hardMode;
export const selectHighContrastMode = (state: RootState) => state.settings.highContrastMode;
export const selectHapticFeedback = (state: RootState) => state.settings.hapticFeedback;
export const selectSoundEnabled = (state: RootState) => state.settings.soundEnabled;
export const selectSettingsLoaded = (state: RootState) => state.settings.isLoaded;

export default settingsSlice.reducer;
