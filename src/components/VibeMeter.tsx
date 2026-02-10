import React, { useEffect } from 'react';

import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { useAppSelector } from '../hooks/storeHooks';
import { VibeScore } from '../utils/vibeMeter';
import { isReduceMotionEnabled } from '../utils/accessibility';
import { colors, SIZE } from '../utils/constants';

interface VibeMeterProps {
  vibeScore: VibeScore;
}

export default function VibeMeter({ vibeScore }: VibeMeterProps) {
  const { theme } = useAppSelector((state) => state.theme);
  const reduceMotion = isReduceMotionEnabled();
  const barWidth = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      barWidth.value = vibeScore.score;
    } else {
      barWidth.value = withSpring(vibeScore.score, {
        damping: 15,
        stiffness: 90,
      });
    }
  }, [vibeScore.score, reduceMotion]);

  const animatedBarStyle = useAnimatedStyle(() => ({
    width: `${barWidth.value}%`,
  }));

  const trendArrow =
    vibeScore.trend === 'up' ? ' \u2191' : vibeScore.trend === 'down' ? ' \u2193' : '';

  const barColor =
    vibeScore.score >= 80
      ? colors.correct
      : vibeScore.score >= 40
        ? colors.present
        : colors.absent;

  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: 100,
        now: vibeScore.score,
        text: vibeScore.label,
      }}
    >
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: theme.colors.secondary }]}>
          VIBE{trendArrow}
        </Text>
        <Text style={[styles.percentage, { color: theme.colors.text }]}>
          {vibeScore.score}%
        </Text>
      </View>
      <View
        style={[styles.barTrack, { backgroundColor: theme.colors.background2 }]}
      >
        <Animated.View
          style={[
            styles.barFill,
            animatedBarStyle,
            { backgroundColor: barColor },
          ]}
        />
      </View>
      <Text style={[styles.vibeLabel, { color: theme.colors.secondary }]}>
        {vibeScore.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SIZE * 0.85,
    paddingVertical: 6,
    alignItems: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    fontFamily: 'Montserrat_700Bold',
    letterSpacing: 2,
  },
  percentage: {
    fontSize: 12,
    fontFamily: 'Montserrat_700Bold',
  },
  barTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  vibeLabel: {
    fontSize: 10,
    fontFamily: 'Montserrat_600SemiBold',
    marginTop: 4,
  },
});
