import { useCallback, useEffect, useRef } from 'react';

import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import Onboarding from '../../components/Onboarding';
import { useAppSelector, useAppDispatch } from '../../hooks/storeHooks';
import MainNavigator from '../../navigation/mainNavigator';
import { initializeNotifications } from '../../services/notifications';
import { setSettings } from '../../store/slices/settingsSlice';
import { loadSettings } from '../../utils/localStorageFuncs';
import { toggleSounds } from '../../utils/sounds';

// Noop function for onboarding completion (app continues regardless)
const handleOnboardingComplete = () => {
  // Onboarding complete - app state already updated via AsyncStorage
};

export default function MainScreen() {
  const { theme } = useAppSelector((state) => state.theme);
  const { soundEnabled } = useAppSelector((state) => state.settings);
  const dispatch = useAppDispatch();
  const navigationRef = useRef<NavigationContainerRef<Record<string, object | undefined>>>(null);

  // Load persisted sound settings at app startup
  useEffect(() => {
    (async () => {
      const saved = await loadSettings();
      if (saved) {
        dispatch(setSettings(saved));
        toggleSounds(saved.soundEnabled ?? true);
      }
    })();
  }, [dispatch]);

  // Sync sound enabled state with the audio module
  useEffect(() => {
    toggleSounds(soundEnabled);
  }, [soundEnabled]);

  // Initialize push notifications for daily reminders
  useEffect(() => {
    initializeNotifications();
  }, []);

  const handleModeSelect = useCallback((mode: 'daily' | 'unlimited') => {
    navigationRef.current?.navigate('Game', { initialMode: mode });
  }, []);

  return (
    <NavigationContainer ref={navigationRef} theme={theme.dark ? DarkTheme : DefaultTheme}>
      <Onboarding onComplete={handleOnboardingComplete} onModeSelect={handleModeSelect} />
      <MainNavigator />
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
    </NavigationContainer>
  );
}
