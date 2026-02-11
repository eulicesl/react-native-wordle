import React, { useCallback } from 'react';

import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { useAppSelector } from '../../../hooks/storeHooks';
import { getKeyAccessibilityLabel } from '../../../utils/accessibility';
import { adjustLetterDisplay } from '../../../utils/adjustLetterDisplay';
import { colors, SIZE } from '../../../utils/constants';
import { playHaptic } from '../../../utils/haptics';
import { playSound } from '../../../utils/sounds';

const keysEN: string[][] = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['Enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '<'],
];

const keysTR: string[][] = [
  ['e', 'r', 't', 'y', 'u', 'ı', 'o', 'p', 'ğ', 'ü'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ş', 'i'],
  ['Enter', 'z', 'c', 'v', 'b', 'n', 'm', 'ö', 'ç', '<'],
];

// High contrast color palette
const highContrastColors = {
  correct: '#FF9100', // High-visibility orange
  present: '#40C4FF', // Bright cyan
  absent: '#37474F',
  keyDefault: '#546E7A',
};

const SPRING_CONFIG = { damping: 15, stiffness: 300, mass: 0.5 };

interface AnimatedKeyProps {
  keyboardKey: string;
  backgroundColor: string;
  height: number;
  flex: number;
  onPress: () => void;
  accessibilityLabel: string;
  gameLanguage: string;
}

function AnimatedKey({
  keyboardKey,
  backgroundColor,
  height,
  flex,
  onPress,
  accessibilityLabel,
  gameLanguage,
}: AnimatedKeyProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.92, SPRING_CONFIG);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING_CONFIG);
  }, [scale]);

  return (
    <Animated.View style={[{ flex }, animatedStyle]}>
      <Pressable
        style={{
          ...styles.keyContainer,
          backgroundColor,
          height,
        }}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled: false }}
      >
        {keyboardKey === '<' ? (
          <Ionicons
            name="backspace-outline"
            style={{ ...styles.keyboardKey, fontSize: 28 }}
          />
        ) : (
          <Text
            style={{
              ...styles.keyboardKey,
              fontSize: keyboardKey === 'Enter' ? 12 : 18,
            }}
          >
            {adjustLetterDisplay(keyboardKey, gameLanguage)}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

interface KeyboardProps {
  handleGuess: (keyPressed: string) => void;
}

export default function Keyboard({ handleGuess }: KeyboardProps) {
  const { usedKeys, gameLanguage } = useAppSelector((state) => state.gameState);
  const { highContrastMode, hapticFeedback } = useAppSelector((state) => state.settings);

  const keyboard = gameLanguage === 'en' ? keysEN : keysTR;
  const colorPalette = highContrastMode ? highContrastColors : colors;

  const handleKeyboardKeyColor = (key: string) => {
    const keyData = usedKeys[key];
    switch (keyData) {
      case 'correct':
      case 'present':
      case 'absent':
        return colorPalette[keyData];
      default:
        return colorPalette.keyDefault;
    }
  };

  const handleKeyPress = useCallback((key: string) => {
    // Play sound and haptic feedback
    if (key === '<') {
      playSound('keyDelete');
      if (hapticFeedback) playHaptic('keyDelete');
    } else if (key === 'Enter') {
      playSound('submit');
      if (hapticFeedback) playHaptic('submit');
    } else {
      playSound('keyPress');
      if (hapticFeedback) playHaptic('keyPress');
    }

    handleGuess(key);
  }, [hapticFeedback, handleGuess]);

  return (
    <View
      style={styles.keyboardContainer}
      accessibilityRole="none"
      accessibilityLabel="Game keyboard"
    >
      {keyboard.map((keysRow, rowIdx) => (
        <View
          key={rowIdx}
          style={{
            ...styles.keyboardRow,
            width: rowIdx === 1 ? SIZE * 0.95 : SIZE,
          }}
        >
          {keysRow.map((keyboardKey) => {
            const keyRowCount = keysRow.length + 2;
            const keyStatus = usedKeys[keyboardKey];

            return (
              <AnimatedKey
                key={keyboardKey}
                keyboardKey={keyboardKey}
                backgroundColor={handleKeyboardKeyColor(keyboardKey)}
                height={SIZE / keyRowCount + 2 + 20}
                flex={keyboardKey === '<' || keyboardKey === 'Enter' ? 2 : 1}
                onPress={() => handleKeyPress(keyboardKey)}
                accessibilityLabel={getKeyAccessibilityLabel(keyboardKey, keyStatus)}
                gameLanguage={gameLanguage}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  keyboardRow: {
    width: SIZE,
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
    borderRadius: 5,
  },
  keyboardKey: {
    textTransform: 'uppercase',
    color: 'white',
    fontFamily: 'Montserrat_800ExtraBold',
  },
});
