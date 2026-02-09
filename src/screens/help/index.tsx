import React from 'react';

import { View, Text, StyleSheet, ScrollView } from 'react-native';

import { useAppSelector } from '../../hooks/storeHooks';
import { APP_NAME, colors, SIZE } from '../../utils/constants';

export default function Help() {
  const { theme } = useAppSelector((state) => state.theme);

  const themedStyles = {
    container: {
      backgroundColor: theme.colors.background,
    },
    text: {
      color: theme.colors.text,
    },
    secondaryText: {
      color: theme.colors.secondary,
    },
    card: {
      backgroundColor: theme.colors.background2,
    },
    border: {
      borderColor: theme.colors.tertiary,
    },
  };

  return (
    <ScrollView
      style={[styles.container, themedStyles.container]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.title, themedStyles.text]}>How To Play</Text>
      <Text style={[styles.subtitle, themedStyles.secondaryText]}>
        Guess the {APP_NAME} in 6 tries.
      </Text>

      <View style={[styles.section, themedStyles.border]}>
        <Text style={[styles.instruction, themedStyles.text]}>
          • Each guess must be a valid 5-letter word.
        </Text>
        <Text style={[styles.instruction, themedStyles.text]}>
          • The color of the tiles will change to show how close your guess was to the word.
        </Text>
      </View>

      <Text style={[styles.sectionTitle, themedStyles.text]}>Examples</Text>

      {/* Example 1 - Correct */}
      <View style={styles.exampleContainer}>
        <View style={styles.exampleRow}>
          <View style={[styles.tile, styles.tileCorrect]}>
            <Text style={styles.tileLetter}>W</Text>
          </View>
          <View style={[styles.tile, themedStyles.card]}>
            <Text style={[styles.tileLetter, themedStyles.text]}>E</Text>
          </View>
          <View style={[styles.tile, themedStyles.card]}>
            <Text style={[styles.tileLetter, themedStyles.text]}>A</Text>
          </View>
          <View style={[styles.tile, themedStyles.card]}>
            <Text style={[styles.tileLetter, themedStyles.text]}>R</Text>
          </View>
          <View style={[styles.tile, themedStyles.card]}>
            <Text style={[styles.tileLetter, themedStyles.text]}>Y</Text>
          </View>
        </View>
        <Text style={[styles.exampleText, themedStyles.text]}>
          <Text style={styles.bold}>W</Text> is in the word and in the correct spot.
        </Text>
      </View>

      {/* Example 2 - Present */}
      <View style={styles.exampleContainer}>
        <View style={styles.exampleRow}>
          <View style={[styles.tile, themedStyles.card]}>
            <Text style={[styles.tileLetter, themedStyles.text]}>P</Text>
          </View>
          <View style={[styles.tile, styles.tilePresent]}>
            <Text style={styles.tileLetter}>I</Text>
          </View>
          <View style={[styles.tile, themedStyles.card]}>
            <Text style={[styles.tileLetter, themedStyles.text]}>L</Text>
          </View>
          <View style={[styles.tile, themedStyles.card]}>
            <Text style={[styles.tileLetter, themedStyles.text]}>L</Text>
          </View>
          <View style={[styles.tile, themedStyles.card]}>
            <Text style={[styles.tileLetter, themedStyles.text]}>S</Text>
          </View>
        </View>
        <Text style={[styles.exampleText, themedStyles.text]}>
          <Text style={styles.bold}>I</Text> is in the word but in the wrong spot.
        </Text>
      </View>

      {/* Example 3 - Absent */}
      <View style={styles.exampleContainer}>
        <View style={styles.exampleRow}>
          <View style={[styles.tile, themedStyles.card]}>
            <Text style={[styles.tileLetter, themedStyles.text]}>V</Text>
          </View>
          <View style={[styles.tile, themedStyles.card]}>
            <Text style={[styles.tileLetter, themedStyles.text]}>A</Text>
          </View>
          <View style={[styles.tile, themedStyles.card]}>
            <Text style={[styles.tileLetter, themedStyles.text]}>G</Text>
          </View>
          <View style={[styles.tile, styles.tileAbsent]}>
            <Text style={styles.tileLetter}>U</Text>
          </View>
          <View style={[styles.tile, themedStyles.card]}>
            <Text style={[styles.tileLetter, themedStyles.text]}>E</Text>
          </View>
        </View>
        <Text style={[styles.exampleText, themedStyles.text]}>
          <Text style={styles.bold}>U</Text> is not in the word in any spot.
        </Text>
      </View>

      <View style={[styles.divider, themedStyles.border]} />

      {/* Game Modes */}
      <Text style={[styles.sectionTitle, themedStyles.text]}>Game Modes</Text>

      <View style={[styles.modeCard, themedStyles.card]}>
        <Text style={[styles.modeTitle, themedStyles.text]}>Daily Challenge</Text>
        <Text style={[styles.modeDescription, themedStyles.secondaryText]}>
          A new word every day at midnight UTC. Everyone plays the same word!
          Your streak increases when you complete daily challenges on consecutive days.
        </Text>
      </View>

      <View style={[styles.modeCard, themedStyles.card]}>
        <Text style={[styles.modeTitle, themedStyles.text]}>Unlimited Mode</Text>
        <Text style={[styles.modeDescription, themedStyles.secondaryText]}>
          Practice with random words anytime. Play as many games as you want!
        </Text>
      </View>

      <View style={[styles.modeCard, themedStyles.card]}>
        <Text style={[styles.modeTitle, themedStyles.text]}>Hard Mode</Text>
        <Text style={[styles.modeDescription, themedStyles.secondaryText]}>
          Any revealed hints must be used in subsequent guesses.
          Enable in Settings for an extra challenge!
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, themedStyles.secondaryText]}>
          A new {APP_NAME} will be available each day!
        </Text>
      </View>
    </ScrollView>
  );
}

const tileSize = (SIZE - 80) / 7;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Montserrat_700Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  instruction: {
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
    lineHeight: 22,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Montserrat_700Bold',
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  exampleContainer: {
    marginBottom: 20,
  },
  exampleRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tile: {
    width: tileSize,
    height: tileSize,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    borderRadius: 4,
  },
  tileCorrect: {
    backgroundColor: colors.correct,
  },
  tilePresent: {
    backgroundColor: colors.present,
  },
  tileAbsent: {
    backgroundColor: colors.absent,
  },
  tileLetter: {
    fontSize: 20,
    fontFamily: 'Montserrat_800ExtraBold',
    color: colors.white,
  },
  exampleText: {
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
    lineHeight: 20,
  },
  bold: {
    fontFamily: 'Montserrat_800ExtraBold',
  },
  divider: {
    height: 1,
    marginVertical: 20,
  },
  modeCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  modeTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 6,
  },
  modeDescription: {
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
    lineHeight: 20,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
    textAlign: 'center',
  },
});
