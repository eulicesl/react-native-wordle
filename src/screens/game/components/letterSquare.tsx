import { useEffect } from 'react';

import { StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  withDelay,
  useDerivedValue,
} from 'react-native-reanimated';

import { useAppSelector } from '../../../hooks/storeHooks';
import { guess } from '../../../types';
import { getTileAccessibilityLabel } from '../../../utils/accessibility';
import { adjustLetterDisplay } from '../../../utils/adjustLetterDisplay';
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
  const progress = useDerivedValue(() => {
    return guess.isComplete
      ? withDelay(250 * idx, withTiming(1))
      : withDelay(250 * idx, withTiming(0));
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

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotateY: `${rotateDegree.value}deg` },
        { translateX: shakeX.value },
      ],
    };
  });

  useEffect(() => {
    if (letter !== '' && matchStatus === '') {
      scale.value = withTiming(1.2, {
        duration: 50,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      scale.value = withDelay(50, withTiming(1));
    }
    if (matchStatus !== '' && matchStatus !== undefined) {
      rotateDegree.value = withDelay(
        250 * idx,
        withTiming(90, {
          duration: 250,
        })
      );
      rotateDegree.value = withDelay(
        250 * (idx + 1),
        withTiming(0, {
          duration: 250,
        })
      );

      // Play sound and haptic when tile flips
      setTimeout(() => {
        const soundType = matchStatus === 'correct' ? 'flipCorrect' : matchStatus === 'present' ? 'flipPresent' : 'flipAbsent';
        playSound(soundType);
        if (hapticFeedback) {
          playHaptic(matchStatus);
        }
      }, 250 * idx);
    }
  }, [letter, matchStatus, hapticFeedback, idx]);

  useEffect(() => {
    if (wrongGuessShake && currentGuessIndex === guess.id) {
      playSound('error');
      if (hapticFeedback) {
        playHaptic('error');
      }

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
          borderWidth: guess.isComplete ? 0 : 1,
          borderColor: theme.colors.tertiary,
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
        importantForAccessibility="no"
      >
        {adjustLetterDisplay(letter, gameLanguage)}
      </Text>
    </Animated.View>
  );
};

export default LetterSquare;

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
