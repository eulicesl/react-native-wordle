import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import Onboarding from '../../components/Onboarding';
import { useAppSelector } from '../../hooks/storeHooks';
import MainNavigator from '../../navigation/mainNavigator';

export default function MainScreen() {
  const { theme } = useAppSelector((state) => state.theme);

  return (
    <NavigationContainer theme={theme.dark ? DarkTheme : DefaultTheme}>
      <Onboarding onComplete={() => {}} />
      <MainNavigator />
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
    </NavigationContainer>
  );
}
