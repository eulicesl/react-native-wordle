import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';

import { useAppSelector, useAppDispatch } from '../../hooks/storeHooks';
import { setStatistics } from '../../store/slices/statisticsSlice';
import { APP_NAME, colors } from '../../utils/constants';
import { formatTimeUntilNextWord } from '../../utils/dailyWord';
import { loadStatistics } from '../../utils/localStorageFuncs';

export default function Statistics() {
  const { statistics } = useAppSelector((state) => state.statistics);
  const { theme } = useAppSelector((state) => state.theme);
  const dispatch = useAppDispatch();
  const [countdown, setCountdown] = useState(formatTimeUntilNextWord());

  useEffect(() => {
    const loadStats = async () => {
      const saved = await loadStatistics();
      if (saved) {
        dispatch(setStatistics(saved));
      }
    };
    loadStats();
  }, [dispatch]);

  // Update countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(formatTimeUntilNextWord());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const {
    gamesPlayed,
    gamesWon,
    currentStreak,
    maxStreak,
    guessDistribution,
  } = statistics;

  const winPercentage = gamesPlayed > 0
    ? Math.round((gamesWon / gamesPlayed) * 100)
    : 0;

  const maxGuesses = Math.max(...guessDistribution, 1);

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
  };

  return (
    <ScrollView
      style={[styles.container, themedStyles.container]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.title, themedStyles.text]}>Statistics</Text>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <StatBox value={gamesPlayed} label="Played" theme={themedStyles} />
        <StatBox value={winPercentage} label="Win %" theme={themedStyles} />
        <StatBox value={currentStreak} label="Current Streak" theme={themedStyles} />
        <StatBox value={maxStreak} label="Max Streak" theme={themedStyles} />
      </View>

      {/* Guess Distribution */}
      <Text style={[styles.sectionTitle, themedStyles.text]}>Guess Distribution</Text>
      <View style={styles.distributionContainer}>
        {guessDistribution.map((count, index) => (
          <DistributionBar
            key={index}
            guess={index + 1}
            count={count}
            maxCount={maxGuesses}
            theme={themedStyles}
          />
        ))}
      </View>

      {/* Next Daily Countdown */}
      <View style={[styles.countdownCard, themedStyles.card]}>
        <Text style={[styles.countdownLabel, themedStyles.secondaryText]}>
          Next {APP_NAME}
        </Text>
        <Text style={[styles.countdown, themedStyles.text]}>{countdown}</Text>
      </View>
    </ScrollView>
  );
}

interface StatBoxProps {
  value: number;
  label: string;
  theme: {
    text: { color: string };
    secondaryText: { color: string };
  };
}

function StatBox({ value, label, theme }: StatBoxProps) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, theme.text]}>{value}</Text>
      <Text style={[styles.statLabel, theme.secondaryText]}>{label}</Text>
    </View>
  );
}

interface DistributionBarProps {
  guess: number;
  count: number;
  maxCount: number;
  theme: {
    text: { color: string };
    card: { backgroundColor: string };
  };
}

function DistributionBar({ guess, count, maxCount, theme }: DistributionBarProps) {
  const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
  const barWidth = Math.max(percentage, count > 0 ? 15 : 8);

  return (
    <View style={styles.distributionRow}>
      <Text style={[styles.guessNumber, theme.text]}>{guess}</Text>
      <View style={styles.barContainer}>
        <View
          style={[
            styles.bar,
            {
              width: `${barWidth}%`,
              backgroundColor: count > 0 ? colors.correct : theme.card.backgroundColor,
            },
          ]}
        >
          <Text style={[styles.barCount, count === 0 && theme.text]}>{count}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Montserrat_700Bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 32,
    fontFamily: 'Montserrat_700Bold',
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Montserrat_600SemiBold',
    textAlign: 'center',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat_700Bold',
    textAlign: 'center',
    marginBottom: 15,
    textTransform: 'uppercase',
  },
  distributionContainer: {
    marginBottom: 30,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  guessNumber: {
    width: 20,
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
    textAlign: 'center',
  },
  barContainer: {
    flex: 1,
    marginLeft: 8,
  },
  bar: {
    height: 24,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    minWidth: 30,
  },
  barCount: {
    fontSize: 14,
    fontFamily: 'Montserrat_700Bold',
    color: colors.white,
  },
  countdownCard: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  countdownLabel: {
    fontSize: 12,
    fontFamily: 'Montserrat_600SemiBold',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  countdown: {
    fontSize: 36,
    fontFamily: 'Montserrat_700Bold',
    letterSpacing: 2,
  },
});
