import { useEffect, memo } from 'react';

import { StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  Easing,
  withDelay,
  useDerivedValue,
} from 'react-native-reanimated';

import { useAppSelector } from '../../../hooks/storeHooks';
import { guess } from '../../../types';
import { getTileAccessibilityLabel, isReduceMotionEnabled } from '../../../utils/accessibility';
import { adjustLetterDisplay } from '../../../utils/adjustLetterDisplay';
import {
  TILE_FLIP_STAGGER_MS,
  TILE_FLIP_DURATION_MS,
  TILES_PER_ROW,
  BOUNCE_POST_FLIP_GAP_MS,
  BOUNCE_TILE_STAGGER_MS,
  TILE_ENTRY_SPRING,
  TILE_ENTRY_SCALE,
  TILE_ENTRY_BORDER_FLASH_MS,
} from '../../../utils/animations';
import { colors, SIZE } from '../../../utils/constants';
import { playHaptic } from '../../../utils/haptics';
import interpolateColorBugFix from '../../../utils/interpolateColorFix';
import { playSound } from '../../../utils/sounds';

// High contrast color palette
const highContrastColors = {
  correct: '#FF9100', // High-visibility orange
  present: '#40C4FF', // Bright cyan
  absent: '#37474F',
  keyDefault: '#546E7A',
};

interface LetterSquareProps {
  guess: guess;
  letter: string;
  idx: number;
}

const LetterSquare = ({ guess, letter, idx }: LetterSquareProps) => {
  const { currentGuessIndex, wrongGuessShake, gameLanguage } = useAppSelector(
    (state) => state.gameState
  );
  const { highContrastMode, hapticFeedback } = useAppSelector(
    (state) => state.settings
  );
  const { theme } = useAppSelector((state) => state.theme);

  const scale = useSharedValue(1);
  const rotateDegree = useSharedValue(0);
  const bounceY = useSharedValue(0);
  const borderFlash = useSharedValue(0);
  const progress = useDerivedValue(() => {
    return guess.isComplete
      ? withDelay(TILE_FLIP_STAGGER_MS * idx, withTiming(1))
      : withDelay(TILE_FLIP_STAGGER_MS * idx, withTiming(0));
  }, [guess]);
  const shakeX = useSharedValue(0);
  const matchStatus = guess.matches[idx];

  function matchColor() {
    'worklet';
    switch (matchStatus) {
      case 'correct':
        return highContrastMode ? highContrastColors.correct : colors.correct;
      case 'present':
        return highContrastMode ? highContrastColors.present : colors.present;
      case 'absent':
        return highContrastMode ? highContrastColors.absent : colors.absent;
      case '':
        return highContrastMode ? highContrastColors.keyDefault : colors.keyDefault;
      default:
        return highContrastMode ? highContrastColors.keyDefault : colors.keyDefault;
    }
  }

  const defaultColor = highContrastMode ? highContrastColors.keyDefault : colors.keyDefault;

  const bgStyle = useAnimatedStyle(() => {
    const colorByMatch = matchColor();
    const backgroundColor = interpolateColorBugFix(
      progress.value,
      [0, 1],
      [defaultColor, colorByMatch]
    );

    return { backgroundColor };
  });

  const isActiveRow = currentGuessIndex === guess.id && !guess.isComplete;
  const hasFill = letter !== '';
  const baseBorderColor = isActiveRow
    ? hasFill ? theme.colors.text : theme.colors.secondary
    : theme.colors.tertiary;

  const animatedStyles = useAnimatedStyle(() => {
    const borderColor = interpolateColorBugFix(
      borderFlash.value,
      [0, 1],
      [baseBorderColor, theme.colors.text]
    );
    return {
      borderColor,
      transform: [
        { scale: scale.value },
        { rotateY: `${rotateDegree.value}deg` },
        { translateX: shakeX.value },
        { translateY: bounceY.value },
      ],
    };
  });

  useEffect(() => {
    const reduceMotion = isReduceMotionEnabled();

    if (letter !== '' && matchStatus === '' && !reduceMotion) {
      scale.value = withSpring(TILE_ENTRY_SCALE, TILE_ENTRY_SPRING);
      scale.value = withDelay(
        TILE_ENTRY_BORDER_FLASH_MS,
        withSpring(1, TILE_ENTRY_SPRING)
      );
      borderFlash.value = withSequence(
        withTiming(1, { duration: 0 }),
        withDelay(
          TILE_ENTRY_BORDER_FLASH_MS,
          withTiming(0, { duration: TILE_ENTRY_BORDER_FLASH_MS })
        )
      );
    }
    if (matchStatus !== '' && matchStatus !== undefined) {
      if (!reduceMotion) {
        rotateDegree.value = withDelay(
          TILE_FLIP_STAGGER_MS * idx,
          withTiming(90, {
            duration: TILE_FLIP_DURATION_MS,
          })
        );
        rotateDegree.value = withDelay(
          TILE_FLIP_STAGGER_MS * (idx + 1),
          withTiming(0, {
            duration: TILE_FLIP_DURATION_MS,
          })
        );
      }

      // Play sound and haptic when tile flips
      const soundTimer = setTimeout(() => {
        const soundType = matchStatus === 'correct' ? 'flipCorrect' : matchStatus === 'present' ? 'flipPresent' : 'flipAbsent';
        playSound(soundType);
        if (hapticFeedback) {
          playHaptic(matchStatus);
        }
      }, TILE_FLIP_STAGGER_MS * idx);

      // Winning row bounce: after all flips complete, stagger a bounce on each tile
      if (guess.isCorrect && !reduceMotion) {
        const flipDuration = TILE_FLIP_STAGGER_MS * TILES_PER_ROW;
        const bounceDelay = flipDuration + BOUNCE_POST_FLIP_GAP_MS + idx * BOUNCE_TILE_STAGGER_MS;
        bounceY.value = withDelay(
          bounceDelay,
          withSequence(
            withSpring(-12, { damping: 4, stiffness: 300 }),
            withSpring(0, { damping: 8, stiffness: 200 })
          )
        );
      }

      return () => clearTimeout(soundTimer);
    }
    return undefined;
  }, [letter, matchStatus, hapticFeedback, idx, guess.isComplete, guess.isCorrect]);

  useEffect(() => {
    if (wrongGuessShake && currentGuessIndex === guess.id) {
      playSound('error');
      if (hapticFeedback) {
        playHaptic('error');
      }

      const reduceMotion = isReduceMotionEnabled();
      if (reduceMotion) return;

      for (let i = 1; i < 6; i++) {
        shakeX.value = withDelay(
          10 * i,
          withTiming(-5, {
            duration: 15,
            easing: Easing.linear,
          })
        );
        shakeX.value = withDelay(
          20 * i,
          withTiming(6, {
            duration: 30,
            easing: Easing.linear,
          })
        );
        shakeX.value = withDelay(
          30 * i,
          withTiming(-8, {
            duration: 45,
            easing: Easing.linear,
          })
        );
        shakeX.value = withDelay(
          40 * i,
          withTiming(0, {
            duration: 60,
            easing: Easing.linear,
          })
        );
      }
    }
  }, [wrongGuessShake, hapticFeedback]);

  const rowNumber = guess.id + 1;
  const accessibilityLabel = getTileAccessibilityLabel(letter, idx, matchStatus, rowNumber);

  return (
    <Animated.View
      key={idx}
      style={[
        {
          ...styles.square,
          backgroundColor: matchColor(),
          borderWidth: guess.isComplete ? 0 : isActiveRow && hasFill ? 2 : 1,
        },
        animatedStyles,
        bgStyle,
      ]}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel}
    >
      <Text
        style={{
          ...styles.letter,
          color: colors.white,
        }}
        maxFontSizeMultiplier={1}
        importantForAccessibility="no"
      >
        {adjustLetterDisplay(letter, gameLanguage)}
      </Text>
    </Animated.View>
  );
};

export default memo(LetterSquare);

const styles = StyleSheet.create({
  square: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: SIZE / 6.5,
    height: SIZE / 6.5,
    borderRadius: 10,
  },
  letter: {
    fontSize: SIZE / 12,
    fontWeight: 'bold',
    fontFamily: 'Montserrat_800ExtraBold',
    textTransform: 'uppercase',
  },
});
