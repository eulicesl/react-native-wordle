import React, { forwardRef } from 'react';

import { View, Text, StyleSheet } from 'react-native';

import { guess, matchStatus } from '../types';
import { colors } from '../utils/constants';

interface ShareCardProps {
  guesses: guess[];
  gameWon: boolean;
  guessCount: number;
  streak: number;
  isDaily: boolean;
  hardMode: boolean;
}

const MATCH_COLORS: Record<string, string> = {
  correct: colors.correct,
  present: colors.present,
  absent: '#3a3a3c',
  '': '#3a3a3c',
};

const ShareCard = forwardRef<View, ShareCardProps>(
  ({ guesses, gameWon, guessCount, streak, isDaily, hardMode }, ref) => {
    const completedGuesses = guesses.filter((g) => g.isComplete);

    return (
      <View ref={ref} style={styles.card} collapsable={false}>
        <Text style={styles.title}>WordVibe</Text>
        <Text style={styles.subtitle}>
          {isDaily ? 'Daily Challenge' : 'Free Play'}
          {hardMode ? ' (Hard)' : ''}
        </Text>

        <Text style={styles.result}>
          {gameWon ? `${guessCount}/6` : 'X/6'}
        </Text>

        <View style={styles.grid}>
          {completedGuesses.map((guess, rowIdx) => (
            <View key={rowIdx} style={styles.row}>
              {guess.matches.map((match: matchStatus, colIdx: number) => (
                <View
                  key={colIdx}
                  style={[styles.tile, { backgroundColor: MATCH_COLORS[match] }]}
                />
              ))}
            </View>
          ))}
        </View>

        {streak > 0 && (
          <Text style={styles.streak}>{streak} day streak</Text>
        )}

        <Text style={styles.footer}>wordvibe.app</Text>
      </View>
    );
  }
);

ShareCard.displayName = 'ShareCard';

export default ShareCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a2e',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    width: 300,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontFamily: 'Montserrat_800ExtraBold',
    letterSpacing: 4,
    marginBottom: 4,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 12,
  },
  result: {
    color: '#fff',
    fontSize: 36,
    fontFamily: 'Montserrat_800ExtraBold',
    marginBottom: 16,
  },
  grid: {
    gap: 4,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 4,
  },
  tile: {
    width: 36,
    height: 36,
    borderRadius: 4,
  },
  streak: {
    color: colors.correct,
    fontSize: 14,
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 12,
  },
  footer: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontFamily: 'Montserrat_600SemiBold',
  },
});
