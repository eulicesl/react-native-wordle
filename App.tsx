import { useCallback, useEffect } from 'react';
import { View } from 'react-native';

import {
  useFonts,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
} from '@expo-google-fonts/montserrat';
import * as SplashScreen from 'expo-splash-screen';
import { Provider } from 'react-redux';

import ErrorBoundary from './src/components/ErrorBoundary';
import MainScreen from './src/screens/main';
import { store } from './src/store';
import { initializeAccessibility } from './src/utils/accessibility';
import { initializeFontScaleListener } from './src/utils/responsive';
import { initializeAudio } from './src/utils/sounds';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
  });

  // Initialize audio system
  useEffect(() => {
    initializeAudio();
  }, []);

  // Initialize accessibility listeners for reduce motion and font scale
  useEffect(() => {
    const cleanupAccessibility = initializeAccessibility();
    const cleanupFontScale = initializeFontScaleListener();

    return () => {
      cleanupAccessibility();
      cleanupFontScale();
    };
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      // This tells the splash screen to hide immediately
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <ErrorBoundary>
        <Provider store={store}>
          <MainScreen />
        </Provider>
      </ErrorBoundary>
    </View>
  );
}
