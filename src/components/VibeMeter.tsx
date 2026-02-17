import React, { useEffect } from 'react';

import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { useAppSelector } from '../hooks/storeHooks';
import { VibeScore } from '../utils/vibeMeter';
import { isReduceMotionEnabled } from '../utils/accessibility';
import { responsive } from '../utils/responsive';

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** Map score to arc color */
export function getArcColor(score: number): string {
  if (score >= 80) return '#7C4DFF';
  if (score >= 60) return '#FF9100';
  if (score >= 40) return '#FFD600';
  if (score >= 20) return '#00BFA5';
  return '#40C4FF';
}

/** Build an SVG semi-circle path from 180° (left) to 0° (right) */
export function buildArcPath(cx: number, cy: number, r: number): string {
  // Start at left of arc (180°), end at right (0°)
  const startX = cx - r;
  const startY = cy;
  const endX = cx + r;
  const endY = cy;
  return `M ${startX} ${startY} A ${r} ${r} 0 0 1 ${endX} ${endY}`;
}

interface VibeMeterProps {
  vibeScore: VibeScore;
}

export default function VibeMeter({ vibeScore }: VibeMeterProps) {
  const { theme } = useAppSelector((state) => state.theme);
  const reduceMotion = isReduceMotionEnabled();

  const diameter = responsive({ phone: 100, tablet: 140 });
  const strokeWidth = 8;
  const radius = (diameter - strokeWidth) / 2;
  const arcLength = Math.PI * radius;

  // Center of the SVG viewBox
  const cx = diameter / 2;
  const cy = diameter / 2;

  const arcPath = buildArcPath(cx, cy, radius);
  const arcColor = getArcColor(vibeScore.score);

  const animatedScore = useSharedValue(0);

  useEffect(() => {
    const targetValue = vibeScore.score;
    if (reduceMotion) {
      animatedScore.value = targetValue;
    } else {
      animatedScore.value = withSpring(targetValue, {
        damping: 15,
        stiffness: 90,
      });
    }
  }, [vibeScore.score, reduceMotion]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: arcLength * (1 - animatedScore.value / 100),
  }));

  const trendArrow =
    vibeScore.trend === 'up' ? '\u2191' : vibeScore.trend === 'down' ? '\u2193' : '';

  // SVG viewBox height is half the diameter + stroke for the top half of the circle
  const svgHeight = diameter / 2 + strokeWidth;

  return (
    <View
      style={[styles.container, { width: diameter }]}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: 100,
        now: vibeScore.score,
        text: vibeScore.label,
      }}
    >
      <Svg
        width={diameter}
        height={svgHeight}
        viewBox={`0 0 ${diameter} ${svgHeight}`}
      >
        {/* Track */}
        <Path
          d={arcPath}
          stroke={theme.colors.background2}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        {/* Fill */}
        <AnimatedPath
          d={arcPath}
          stroke={arcColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={arcLength}
          animatedProps={animatedProps}
        />
      </Svg>

      {/* Score centered in arc */}
      <View style={[styles.scoreContainer, { top: svgHeight * 0.35, width: diameter }]}>
        <Text style={[styles.scoreText, { color: theme.colors.text }]}>
          {vibeScore.score}
        </Text>
        {trendArrow !== '' && (
          <Text style={[styles.trendArrow, { color: theme.colors.secondary }]}>
            {trendArrow}
          </Text>
        )}
      </View>

      {/* VIBE label below arc */}
      <Text style={[styles.vibeLabel, { color: theme.colors.secondary }]}>
        VIBE
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  scoreContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 24,
    fontFamily: 'Montserrat_800ExtraBold',
  },
  trendArrow: {
    fontSize: 12,
    fontFamily: 'Montserrat_600SemiBold',
    marginTop: -2,
  },
  vibeLabel: {
    fontSize: 10,
    fontFamily: 'Montserrat_700Bold',
    letterSpacing: 2,
    marginTop: 2,
  },
});
