import { useEffect } from 'react';

import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

import { isReduceMotionEnabled } from '../utils/accessibility';

/** Delay between each letter appearing (ms) */
export const LETTER_STAGGER_MS = 100;

interface SolutionRevealProps {
  word: string;
  letterColor: string;
  onRevealStart?: () => void;
  onRevealComplete?: () => void;
}

/**
 * Typewriter-style reveal of the solution word.
 * Each letter fades in with a staggered delay.
 */
const SolutionReveal = ({
  word,
  letterColor,
  onRevealStart,
  onRevealComplete,
}: SolutionRevealProps) => {
  const letters = word.toUpperCase().split('');
  const reduceMotion = isReduceMotionEnabled();

  useEffect(() => {
    onRevealStart?.();

    if (reduceMotion) {
      onRevealComplete?.();
      return;
    }

    const totalDuration = letters.length * LETTER_STAGGER_MS + 200;
    const timer = setTimeout(() => {
      onRevealComplete?.();
    }, totalDuration);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {letters.map((letter, index) => (
        <RevealLetter
          key={index}
          letter={letter}
          delay={index * LETTER_STAGGER_MS}
          color={letterColor}
          skipAnimation={reduceMotion}
        />
      ))}
    </View>
  );
};

interface RevealLetterProps {
  letter: string;
  delay: number;
  color: string;
  skipAnimation: boolean;
}

const RevealLetter = ({ letter, delay, color, skipAnimation }: RevealLetterProps) => {
  const opacity = useSharedValue(skipAnimation ? 1 : 0);
  const translateY = useSharedValue(skipAnimation ? 0 : 8);

  useEffect(() => {
    if (skipAnimation) return;
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) })
    );
    translateY.value = withDelay(
      delay,
      withTiming(0, { duration: 200, easing: Easing.out(Easing.ease) })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.Text style={[styles.letter, { color }, animatedStyle]}>
      {letter}
    </Animated.Text>
  );
};

export default SolutionReveal;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  letter: {
    fontSize: 28,
    fontFamily: 'Montserrat_800ExtraBold',
    letterSpacing: 4,
  },
});
