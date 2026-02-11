import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useAppSelector } from '../hooks/storeHooks';
import Game from '../screens/game';
import Help from '../screens/help';
import Settings from '../screens/settings';
import Statistics from '../screens/statistics';

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  const { theme } = useAppSelector((state) => state.theme);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'] =
            'game-controller';

          switch (route.name) {
            case 'Game':
              iconName = focused ? 'game-controller' : 'game-controller-outline';
              break;
            case 'Stats':
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
              break;
            case 'Help':
              iconName = focused ? 'help-circle' : 'help-circle-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6aaa64',
        tabBarInactiveTintColor: theme.dark ? '#808080' : '#a0a0a0',
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.background2,
        },
        animation: 'fade',
      })}
    >
      <Tab.Screen name="Game" component={Game} />
      <Tab.Screen name="Stats" component={Statistics} />
      <Tab.Screen name="Help" component={Help} />
      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  );
}
