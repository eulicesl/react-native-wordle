import { useEffect } from 'react';

import {
  useFonts,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
} from '@expo-google-fonts/montserrat';
import AppLoading from 'expo-app-loading';
import { Provider } from 'react-redux';

import ErrorBoundary from './src/components/ErrorBoundary';
import MainScreen from './src/screens/main';
import { store } from './src/store';
import { initializeAudio } from './src/utils/sounds';

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

  if (!fontsLoaded) return <AppLoading />;

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <MainScreen />
      </Provider>
    </ErrorBoundary>
  );
}
