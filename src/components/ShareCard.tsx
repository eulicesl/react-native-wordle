import React, { forwardRef } from 'react';

import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { guess, matchStatus } from '../types';
import { colors } from '../utils/constants';
import { SHARE_CARD } from '../utils/strings';
import { getArcColor, buildArcPath } from './VibeMeter';

interface ShareCardTheme {
  dark: boolean;
  colors: {
    background: string;
    background2: string;
    background3: string;
    text: string;
    secondary: string;
    correct: string;
    present: string;
    absent: string;
  };
}

export interface ShareCardProps {
  guesses: guess[];
  gameWon: boolean;
  guessCount: number;
  streak: number;
  isDaily: boolean;
  hardMode: boolean;
  vibeScore: number;
  dayNumber: number;
  highContrastMode: boolean;
  theme: ShareCardTheme;
  gameMode: 'daily' | 'unlimited' | 'speed';
}

// High contrast tile colors per project rules
const HIGH_CONTRAST_TILE = {
  correct: '#FF9100',
  present: '#40C4FF',
  absent: '#37474F',
};

function getTileColor(
  match: matchStatus,
  highContrast: boolean,
  isDark: boolean,
): string {
  if (match === 'correct') return highContrast ? HIGH_CONTRAST_TILE.correct : colors.correct;
  if (match === 'present') return highContrast ? HIGH_CONTRAST_TILE.present : colors.present;
  if (highContrast) return HIGH_CONTRAST_TILE.absent;
  return isDark ? '#3a3a3c' : '#78909C';
}

function getModeLabel(isDaily: boolean, dayNumber: number, gameMode: string): string {
  if (isDaily) return `Daily #${dayNumber}`;
  if (gameMode === 'speed') return 'Speed Mode';
  return 'Unlimited';
}

// Static arc meter for the share card (no animation needed)
function StaticVibeArc({ score, trackColor }: { score: number; trackColor: string }) {
  const diameter = 90;
  const strokeWidth = 7;
  const radius = (diameter - strokeWidth) / 2;
  const arcLength = Math.PI * radius;
  const cx = diameter / 2;
  const cy = diameter / 2;
  const arcPath = buildArcPath(cx, cy, radius);
  const arcColor = getArcColor(score);
  const fillOffset = arcLength * (1 - score / 100);
  const svgHeight = diameter / 2 + strokeWidth;

  return (
    <View style={arcStyles.container}>
      <Svg width={diameter} height={svgHeight} viewBox={`0 0 ${diameter} ${svgHeight}`}>
        <Path
          d={arcPath}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d={arcPath}
          stroke={arcColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={arcLength}
          strokeDashoffset={fillOffset}
        />
      </Svg>
      <View style={[arcStyles.scoreContainer, { top: svgHeight * 0.3, width: diameter }]}>
        <Text style={arcStyles.scoreText}>{score}%</Text>
      </View>
      <Text style={[arcStyles.vibeLabel, { color: arcColor }]}>VIBE</Text>
    </View>
  );
}

const arcStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  scoreContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 18,
    fontFamily: 'Montserrat_800ExtraBold',
    color: '#fff',
  },
  vibeLabel: {
    fontSize: 9,
    fontFamily: 'Montserrat_700Bold',
    letterSpacing: 2,
    marginTop: 1,
  },
});

const ShareCard = forwardRef<View, ShareCardProps>(
  (
    {
      guesses,
      gameWon,
      guessCount,
      streak,
      isDaily,
      hardMode,
      vibeScore,
      dayNumber,
      highContrastMode,
      theme: cardTheme,
      gameMode,
    },
    ref,
  ) => {
    const completedGuesses = guesses.filter((g) => g.isComplete);
    const isDark = cardTheme.dark;
    const bg = isDark ? '#0D0D1A' : '#F5F5FA';
    const cardBg = isDark ? '#1A1A2E' : '#FFFFFF';
    const textColor = isDark ? '#FFFFFF' : '#1A1A2E';
    const subtextColor = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(26,26,46,0.55)';
    const dividerColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(26,26,46,0.08)';
    const trackColor = isDark ? '#252542' : '#E8E8F0';
    const modeLabel = getModeLabel(isDaily, dayNumber, gameMode);

    // Tile sizing: fit within card width with gaps
    const tileSize = 40;
    const tileGap = 5;

    return (
      <View ref={ref} style={[styles.outerCard, { backgroundColor: bg }]} collapsable={false}>
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          {/* Header: Logo + Mode */}
          <Text style={[styles.logo, { color: colors.correct }]}>{SHARE_CARD.appName}</Text>
          <View style={styles.modeBadgeRow}>
            <View style={[styles.modeBadge, { backgroundColor: isDark ? '#252542' : '#E8E8F0' }]}>
              <Text style={[styles.modeBadgeText, { color: subtextColor }]}>{modeLabel}</Text>
            </View>
            {hardMode && (
              <View style={[styles.modeBadge, styles.hardBadge]}>
                <Text style={styles.hardBadgeText}>HARD</Text>
              </View>
            )}
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />

          {/* Main Content: Result + Vibe side by side */}
          <View style={styles.mainRow}>
            {/* Left: Guess Count */}
            <View style={styles.resultSection}>
              <Text style={[styles.resultNumber, { color: textColor }]}>
                {gameWon ? `${guessCount}` : 'X'}
              </Text>
              <Text style={[styles.resultDenom, { color: subtextColor }]}>/6</Text>
            </View>

            {/* Center: Divider */}
            <View style={[styles.verticalDivider, { backgroundColor: dividerColor }]} />

            {/* Right: Vibe Arc */}
            <View style={styles.vibeSection}>
              <StaticVibeArc score={vibeScore} trackColor={trackColor} />
            </View>
          </View>

          {/* Tile Grid */}
          <View style={[styles.grid, { gap: tileGap }]}>
            {completedGuesses.map((guess, rowIdx) => (
              <View key={rowIdx} style={[styles.row, { gap: tileGap }]}>
                {guess.matches.map((match: matchStatus, colIdx: number) => (
                  <View
                    key={colIdx}
                    style={[
                      styles.tile,
                      {
                        width: tileSize,
                        height: tileSize,
                        backgroundColor: getTileColor(match, highContrastMode, isDark),
                      },
                    ]}
                  />
                ))}
              </View>
            ))}
          </View>

          {/* Streak Badge */}
          {streak > 0 && (
            <View style={[styles.streakBadge, { backgroundColor: isDark ? '#252542' : '#F0F0F8' }]}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={[styles.streakText, { color: textColor }]}>
                {streak} day streak
              </Text>
            </View>
          )}

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: dividerColor }]}>
            <Text style={[styles.footerText, { color: subtextColor }]}>wordvibe.app</Text>
          </View>
        </View>
      </View>
    );
  },
);

ShareCard.displayName = 'ShareCard';

export default ShareCard;

const styles = StyleSheet.create({
  outerCard: {
    padding: 16,
    width: 340,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  logo: {
    fontSize: 30,
    fontFamily: 'Montserrat_800ExtraBold',
    letterSpacing: 4,
    marginBottom: 8,
  },
  modeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  modeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modeBadgeText: {
    fontSize: 11,
    fontFamily: 'Montserrat_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  hardBadge: {
    backgroundColor: colors.present,
  },
  hardBadgeText: {
    fontSize: 11,
    fontFamily: 'Montserrat_700Bold',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  divider: {
    width: '80%',
    height: 1,
    marginBottom: 16,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    width: '100%',
    paddingHorizontal: 8,
  },
  resultSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  resultNumber: {
    fontSize: 52,
    fontFamily: 'Montserrat_800ExtraBold',
  },
  resultDenom: {
    fontSize: 24,
    fontFamily: 'Montserrat_600SemiBold',
    marginLeft: 2,
  },
  verticalDivider: {
    width: 1,
    height: 60,
    marginHorizontal: 16,
  },
  vibeSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
  },
  tile: {
    borderRadius: 6,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
    gap: 6,
  },
  streakEmoji: {
    fontSize: 14,
  },
  streakText: {
    fontSize: 13,
    fontFamily: 'Montserrat_700Bold',
  },
  footer: {
    borderTopWidth: 1,
    paddingTop: 12,
    width: '100%',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    fontFamily: 'Montserrat_600SemiBold',
    letterSpacing: 1,
  },
});
