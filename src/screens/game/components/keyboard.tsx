import React from 'react';

import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

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
  correct: '#f5793a', // Orange
  present: '#85c0f9', // Blue
  absent: '#282828',
  keyDefault: '#606060',
};

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
    if (keyData) {
      if (keyData === 'correct') {
        return colorPalette.correct;
      } else if (keyData === 'present') {
        return colorPalette.present;
      } else if (keyData === 'absent') {
        return colorPalette.absent;
      } else return colorPalette.keyDefault;
    } else return colorPalette.keyDefault;
  };

  const handleKeyPress = (key: string) => {
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
  };

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
              <TouchableOpacity
                key={keyboardKey}
                style={{
                  ...styles.keyContainer,
                  backgroundColor: handleKeyboardKeyColor(keyboardKey),
                  height: SIZE / keyRowCount + 2 + 20,
                  flex: keyboardKey === '<' || keyboardKey === 'Enter' ? 2 : 1,
                }}
                onPress={() => handleKeyPress(keyboardKey)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={getKeyAccessibilityLabel(keyboardKey, keyStatus)}
                accessibilityState={{
                  disabled: false,
                }}
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
              </TouchableOpacity>
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
