import { useEffect } from 'react';

import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';

import { useAppSelector } from '../hooks/storeHooks';
import { AchievementCategory } from '../services/gameCenter';
import { announceAchievement } from '../utils/accessibility';
import { colors } from '../utils/constants';
import { playHaptic } from '../utils/haptics';
import { playSound } from '../utils/sounds';
import { ACHIEVEMENTS } from '../utils/strings';

interface AchievementToastProps {
  title: string;
  description: string;
  points: number;
  category: AchievementCategory;
  onDismiss: () => void;
}

const CATEGORY_ICONS: Record<AchievementCategory, React.ComponentProps<typeof Ionicons>['name']> = {
  game: 'game-controller',
  streak: 'flame',
  skill: 'flash',
  daily: 'calendar',
};

const CATEGORY_COLORS: Record<AchievementCategory, string> = {
  game: colors.correct,
  streak: colors.warning,
  skill: '#AF52DE',
  daily: '#007AFF',
};

const SPRING_CONFIG = { damping: 12, stiffness: 80, mass: 1 };

export default function AchievementToast({
  title,
  description,
  points,
  category,
  onDismiss,
}: AchievementToastProps) {
  const { theme } = useAppSelector((state) => state.theme);
  const translateY = useSharedValue(-120);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Play sound and haptic
    playSound('achievement');
    playHaptic('correct');

    // Announce for screen readers
    announceAchievement(title, description);

    // Slide in
    translateY.value = withSpring(0, SPRING_CONFIG);
    opacity.value = withTiming(1, { duration: 200 });

    // Auto-dismiss after 3 seconds
    translateY.value = withSequence(
      withSpring(0, SPRING_CONFIG),
      withDelay(3000, withTiming(-120, { duration: 300 }, (finished) => {
        if (finished) {
          runOnJS(onDismiss)();
        }
      }))
    );
    opacity.value = withSequence(
      withTiming(1, { duration: 200 }),
      withDelay(3000, withTiming(0, { duration: 300 }))
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const accentColor = CATEGORY_COLORS[category];
  const iconName = CATEGORY_ICONS[category];

  return (
    <Animated.View
      style={[
        styles.container,
        animatedStyle,
        {
          backgroundColor: theme.colors.background2,
          borderLeftColor: accentColor,
        },
      ]}
      accessible={true}
      accessibilityRole="alert"
      accessibilityLabel={`Achievement unlocked: ${title}. ${description}. ${points} points.`}
    >
      <View style={[styles.iconContainer, { backgroundColor: accentColor + '20' }]}>
        <Ionicons name={iconName} size={24} color={accentColor} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.label, { color: accentColor }]}>{ACHIEVEMENTS.unlocked}</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        <Text style={[styles.description, { color: theme.colors.secondary }]}>{description}</Text>
      </View>
      <View style={styles.pointsBadge}>
        <Text style={[styles.pointsText, { color: accentColor }]}>+{points}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 12,
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 9,
    fontFamily: 'Montserrat_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  title: {
    fontSize: 15,
    fontFamily: 'Montserrat_700Bold',
  },
  description: {
    fontSize: 11,
    fontFamily: 'Montserrat_600SemiBold',
    marginTop: 1,
  },
  pointsBadge: {
    marginLeft: 8,
  },
  pointsText: {
    fontSize: 16,
    fontFamily: 'Montserrat_800ExtraBold',
  },
});
