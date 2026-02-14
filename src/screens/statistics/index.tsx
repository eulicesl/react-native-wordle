import React, { useEffect, useState, useCallback, useMemo } from 'react';

import { Ionicons } from '@expo/vector-icons';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';

import { useAppSelector, useAppDispatch } from '../../hooks/storeHooks';
import { dynamicFontSize } from '../../utils/responsive';
import {
  ACHIEVEMENTS,
  getAllAchievements,
  getAchievementProgressDisplay,
} from '../../services/gameCenter';
import { setStatistics } from '../../store/slices/statisticsSlice';
import { colors } from '../../utils/constants';
import { formatTimeUntilNextWord } from '../../utils/dailyWord';
import { STATISTICS as STATISTICS_STRINGS } from '../../utils/strings';
import { loadGameHistory, GameHistoryEntry } from '../../utils/gameHistory';
import { loadStatistics } from '../../utils/localStorageFuncs';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Icon mapping for achievements.
// If you add new achievements, either add an entry here or they will fall back to the default icon (see getAchievementIcon).
const ACHIEVEMENT_ICON_MAP: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  firstWin: 'ribbon',
  tenWins: 'medal',
  fiftyWins: 'medal',
  hundredWins: 'medal',
  streak3: 'flame',
  streak7: 'flame',
  streak30: 'flame',
  streak100: 'flame',
  firstTryWin: 'flash',
  secondTryWin: 'speedometer',
  hardModeWin: 'skull',
  hardModeMaster: 'skull',
  dailyPlayer: 'calendar',
  dailyExpert: 'calendar',
  perfectMonth: 'star',
  speedDemon: 'timer',
};


function formatAchievementDate(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

type TabType = 'stats' | 'achievements' | 'history';

interface AchievementData {
  key: string;
  achievement: (typeof ACHIEVEMENTS)[keyof typeof ACHIEVEMENTS];
  unlocked: boolean;
  unlockedAt: string | null;
}

interface AchievementProgress {
  totalAchievements: number;
  unlockedCount: number;
  totalPoints: number;
  earnedPoints: number;
}

export default function Statistics() {
  const { statistics } = useAppSelector((state) => state.statistics);
  const { theme } = useAppSelector((state) => state.theme);
  const dispatch = useAppDispatch();
  const [countdown, setCountdown] = useState(formatTimeUntilNextWord());
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  const [achievements, setAchievements] = useState<AchievementData[]>([]);
  const [achievementProgress, setAchievementProgress] = useState<AchievementProgress | null>(null);
  const [gameHistory, setGameHistory] = useState<GameHistoryEntry[]>([]);

  // Measured width of the tab container for accurate indicator positioning
  const [tabContainerWidth, setTabContainerWidth] = useState(0);

  // Animation for tab indicator
  const tabIndicatorAnim = useSharedValue(0);

  const loadAchievements = useCallback(async () => {
    const allAchievements = await getAllAchievements();
    const progress = await getAchievementProgressDisplay();
    setAchievements(allAchievements);
    setAchievementProgress(progress);
  }, []);

    // Memoize achievements grouped by category to avoid repeated filtering on every render
  const achievementsByCategory = useMemo(() => {
    const grouped = {
      game: [] as AchievementData[],
      streak: [] as AchievementData[],
      skill: [] as AchievementData[],
      daily: [] as AchievementData[],
    };
    achievements.forEach((a) => {
      const category = a.achievement.category;
      if (category in grouped) {
        grouped[category as keyof typeof grouped].push(a);
      }
    });
    return grouped;
  }, [achievements]);

  useEffect(() => {
    const loadStats = async () => {
      const saved = await loadStatistics();
      if (saved) {
        dispatch(setStatistics(saved));
      }
    };
    loadStats();
    loadAchievements();
    loadGameHistory().then(setGameHistory);
  }, [dispatch, loadAchievements]);

  // Update countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(formatTimeUntilNextWord());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Animate tab indicator
  useEffect(() => {
    const tabIndex = activeTab === 'stats' ? 0 : activeTab === 'achievements' ? 1 : 2;
    tabIndicatorAnim.value = withSpring(tabIndex, { damping: 14, stiffness: 120 });
  }, [activeTab, tabIndicatorAnim]);

  const { gamesPlayed, gamesWon, currentStreak, maxStreak, guessDistribution } = statistics;

  const winPercentage = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;

  const averageGuesses = gamesWon > 0
    ? (guessDistribution.reduce((sum, count, i) => sum + count * (i + 1), 0) / gamesWon).toFixed(1)
    : '-';

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

  const TAB_COUNT = 3;
  const TAB_CONTAINER_PADDING = 4;
  const SCREEN_HORIZONTAL_PADDING = 20;

  const tabIndicatorWidth =
    tabContainerWidth > 0
      ? (tabContainerWidth - TAB_CONTAINER_PADDING * 2) / TAB_COUNT
      : (SCREEN_WIDTH - SCREEN_HORIZONTAL_PADDING * 2 - TAB_CONTAINER_PADDING * 2) / TAB_COUNT;

  const tabIndicatorStyle = useAnimatedStyle(() => {
    'worklet';
    // Manual interpolation: map tabIndex [0,1,2] to translateX
    const translateX = tabIndicatorAnim.value * tabIndicatorWidth;
    return { transform: [{ translateX }] };
  });

  const renderStats = () => (
    <>
      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statsRow}>
          <StatBox value={gamesPlayed} label="Played" theme={themedStyles} />
          <StatBox value={winPercentage} label="Win %" theme={themedStyles} />
          <StatBox value={averageGuesses} label={STATISTICS_STRINGS.avgGuesses} theme={themedStyles} />
        </View>
        <View style={styles.statsRow}>
          <StatBox value={currentStreak} label="Current Streak" theme={themedStyles} />
          <StatBox value={maxStreak} label="Max Streak" theme={themedStyles} />
          <StatBox value="" label="" theme={themedStyles} />
        </View>
      </View>

      {/* Guess Distribution */}
      <Text style={[styles.sectionTitle, themedStyles.text, { fontSize: dynamicFontSize(14) }]} allowFontScaling={false}>Guess Distribution</Text>
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

      {/* Next WordVibe Countdown */}
      <View style={[styles.countdownCard, themedStyles.card]}>
        <Text style={[styles.countdownLabel, themedStyles.secondaryText, { fontSize: dynamicFontSize(12) }]} allowFontScaling={false}>
          Next WordVibe
        </Text>
        <Text style={[styles.countdown, themedStyles.text, { fontSize: dynamicFontSize(36, 1.3) }]} allowFontScaling={false}>{countdown}</Text>
      </View>
    </>
  );

  const renderHistory = () => (
    <>
      {gameHistory.length === 0 ? (
        <View style={styles.emptyHistory}>
          <Ionicons name="time-outline" size={48} color={theme.colors.secondary} />
          <Text style={[styles.emptyHistoryText, themedStyles.secondaryText]}>
            No games played yet
          </Text>
        </View>
      ) : (
        gameHistory.map((entry, index) => (
          <HistoryCard key={`${entry.date}-${index}`} entry={entry} theme={themedStyles} />
        ))
      )}
    </>
  );

  const renderAchievements = () => (
    <>
      {/* Achievement Progress Summary */}
      {achievementProgress && (
        <View style={[styles.progressCard, themedStyles.card]}>
          <View style={styles.progressRow}>
            <View style={styles.progressItem}>
              <Text style={[styles.progressValue, themedStyles.text]}>
                {achievementProgress.unlockedCount}/{achievementProgress.totalAchievements}
              </Text>
              <Text style={[styles.progressLabel, themedStyles.secondaryText]}>Unlocked</Text>
            </View>
            <View style={styles.progressDivider} />
            <View style={styles.progressItem}>
              <Text style={[styles.progressValue, themedStyles.text]}>
                {achievementProgress.earnedPoints}
              </Text>
              <Text style={[styles.progressLabel, themedStyles.secondaryText]}>Points Earned</Text>
            </View>
          </View>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${achievementProgress.totalAchievements > 0 ? (achievementProgress.unlockedCount / achievementProgress.totalAchievements) * 100 : 0}%`,
                },
              ]}
            />
          </View>
        </View>
      )}

      {/* Achievement Categories - using memoized grouped achievements */}
      <Text style={[styles.sectionTitle, themedStyles.text]}>Game Achievements</Text>
      <View style={styles.achievementsGrid}>
        {achievementsByCategory.game.map((achievement) => (
          <AchievementCard
            key={achievement.key}
            achievement={achievement}
            theme={themedStyles}
          />
        ))}
      </View>

      <Text style={[styles.sectionTitle, themedStyles.text]}>Streak Achievements</Text>
      <View style={styles.achievementsGrid}>
        {achievementsByCategory.streak.map((achievement) => (
          <AchievementCard
            key={achievement.key}
            achievement={achievement}
            theme={themedStyles}
          />
        ))}
      </View>

      <Text style={[styles.sectionTitle, themedStyles.text]}>Skill Achievements</Text>
      <View style={styles.achievementsGrid}>
        {achievementsByCategory.skill.map((achievement) => (
          <AchievementCard
            key={achievement.key}
            achievement={achievement}
            theme={themedStyles}
          />
        ))}
      </View>

      <Text style={[styles.sectionTitle, themedStyles.text]}>Daily Challenge</Text>
      <View style={styles.achievementsGrid}>
        {achievementsByCategory.daily.map((achievement) => (
          <AchievementCard
            key={achievement.key}
            achievement={achievement}
            theme={themedStyles}
          />
        ))}
      </View>
    </>
  );

  return (
    <ScrollView
      style={[styles.container, themedStyles.container]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.title, themedStyles.text, { fontSize: dynamicFontSize(24, 1.3) }]} allowFontScaling={false}>Statistics</Text>

      {/* Tab Switcher */}
      <View
        style={[styles.tabContainer, themedStyles.card]}
        onLayout={(e) => setTabContainerWidth(e.nativeEvent.layout.width)}
      >
        <Animated.View
          style={[
            styles.tabIndicator,
            { width: tabIndicatorWidth },
            tabIndicatorStyle,
          ]}
        />
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setActiveTab('stats')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'stats' }}
        >
          <Ionicons
            name="stats-chart"
            size={18}
            color={activeTab === 'stats' ? colors.white : theme.colors.secondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'stats' ? styles.activeTabText : themedStyles.secondaryText,
            ]}
          >
            Stats
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setActiveTab('achievements')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'achievements' }}
        >
          <Ionicons
            name="trophy"
            size={18}
            color={activeTab === 'achievements' ? colors.white : theme.colors.secondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'achievements' ? styles.activeTabText : themedStyles.secondaryText,
            ]}
          >
            Trophies
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setActiveTab('history')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'history' }}
        >
          <Ionicons
            name="time"
            size={18}
            color={activeTab === 'history' ? colors.white : theme.colors.secondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'history' ? styles.activeTabText : themedStyles.secondaryText,
            ]}
          >
            History
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'stats' && renderStats()}
      {activeTab === 'achievements' && renderAchievements()}
      {activeTab === 'history' && renderHistory()}
    </ScrollView>
  );
}

interface StatBoxProps {
  value: number | string;
  label: string;
  theme: {
    text: { color: string };
    secondaryText: { color: string };
  };
}

function StatBox({ value, label, theme }: StatBoxProps) {
  if (value === '' && label === '') return <View style={styles.statBox} />;
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, theme.text, { fontSize: dynamicFontSize(32, 1.3) }]} allowFontScaling={false}>{value}</Text>
      <Text style={[styles.statLabel, theme.secondaryText, { fontSize: dynamicFontSize(11) }]} allowFontScaling={false}>{label}</Text>
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
  const widthAnim = useSharedValue(0);

  useEffect(() => {
    widthAnim.value = 0;
    widthAnim.value = withDelay(
      (guess - 1) * 80,
      withTiming(barWidth, { duration: 500 })
    );
  }, [barWidth, guess, widthAnim]);

  const animatedBarStyle = useAnimatedStyle(() => ({
    width: `${widthAnim.value}%`,
  }));

  return (
    <View style={styles.distributionRow}>
      <Text style={[styles.guessNumber, theme.text]}>{guess}</Text>
      <View style={styles.barContainer}>
        <Animated.View
          style={[
            styles.bar,
            { backgroundColor: count > 0 ? colors.correct : theme.card.backgroundColor },
            animatedBarStyle,
          ]}
        >
          <Text style={[styles.barCount, count === 0 && theme.text]}>{count}</Text>
        </Animated.View>
      </View>
    </View>
  );
}

interface AchievementCardProps {
  achievement: AchievementData;
  theme: {
    text: { color: string };
    secondaryText: { color: string };
    card: { backgroundColor: string };
  };
}

function AchievementCard({ achievement, theme }: AchievementCardProps) {
  const { unlocked, achievement: achievementData } = achievement;

  const getAchievementIcon = (key: string): React.ComponentProps<typeof Ionicons>['name'] => {
    return ACHIEVEMENT_ICON_MAP[key] ?? 'trophy';
  };

  return (
    <View
      style={[
        styles.achievementCard,
        theme.card,
        !unlocked && styles.achievementCardLocked,
      ]}
    >
      <View style={[styles.achievementIconContainer, unlocked && styles.achievementIconUnlocked]}>
        <Ionicons
          name={getAchievementIcon(achievement.key)}
          size={28}
          color={unlocked ? colors.white : theme.secondaryText.color}
        />
      </View>
      <View style={styles.achievementContent}>
        <Text
          style={[
            styles.achievementTitle,
            theme.text,
            !unlocked && styles.achievementTitleLocked,
            { fontSize: dynamicFontSize(14) },
          ]}
          numberOfLines={1}
          allowFontScaling={false}
        >
          {achievementData.title}
        </Text>
        <Text
          style={[styles.achievementDescription, theme.secondaryText, { fontSize: dynamicFontSize(12) }]}
          numberOfLines={2}
          allowFontScaling={false}
        >
          {achievementData.description}
        </Text>
        <View style={styles.achievementFooter}>
          <View style={styles.achievementPoints}>
            <Ionicons name="star" size={12} color={unlocked ? colors.present : theme.secondaryText.color} />
            <Text
              style={[
                styles.achievementPointsText,
                { color: unlocked ? colors.present : theme.secondaryText.color },
              ]}
            >
              {achievementData.points} pts
            </Text>
          </View>
          {unlocked && achievement.unlockedAt && (
            <Text style={[styles.achievementDate, theme.secondaryText]}>
              {formatAchievementDate(achievement.unlockedAt)}
            </Text>
          )}
        </View>
      </View>
      {unlocked && (
        <View style={styles.unlockedBadge}>
          <Ionicons name="checkmark-circle" size={20} color={colors.correct} />
        </View>
      )}
    </View>
  );
}

const MATCH_COLORS: Record<string, string> = {
  correct: colors.correct,
  present: colors.present,
  absent: colors.absent,
  '': colors.keyDefault,
};

interface HistoryCardProps {
  entry: GameHistoryEntry;
  theme: {
    text: { color: string };
    secondaryText: { color: string };
    card: { backgroundColor: string };
  };
}

function HistoryCard({ entry, theme }: HistoryCardProps) {
  const date = new Date(entry.date);
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <View style={[styles.historyCard, theme.card]}>
      <View style={styles.historyHeader}>
        <View style={styles.historyMeta}>
          <Ionicons
            name={entry.won ? 'checkmark-circle' : 'close-circle'}
            size={18}
            color={entry.won ? colors.correct : '#FF453A'}
          />
          <Text style={[styles.historyWord, theme.text]}>
            {entry.solution.toUpperCase()}
          </Text>
          {entry.hardMode && (
            <View style={styles.historyHardBadge}>
              <Text style={styles.historyHardText}>H</Text>
            </View>
          )}
          {entry.gameMode === 'daily' && (
            <View style={styles.historyDailyBadge}>
              <Text style={styles.historyDailyText}>D</Text>
            </View>
          )}
        </View>
        <View style={styles.historyRight}>
          <Text style={[styles.historyGuessCount, theme.text]}>
            {entry.won ? `${entry.guessCount}/6` : 'X/6'}
          </Text>
          <Text style={[styles.historyDate, theme.secondaryText]}>{dateStr}</Text>
        </View>
      </View>
      {/* Mini emoji grid */}
      <View style={styles.historyGrid}>
        {entry.matches.map((row, rowIdx) => (
          <View key={rowIdx} style={styles.historyRow}>
            {row.map((match, colIdx) => (
              <View
                key={colIdx}
                style={[styles.historyTile, { backgroundColor: MATCH_COLORS[match] || colors.keyDefault }]}
              />
            ))}
          </View>
        ))}
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
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Montserrat_700Bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    bottom: 4,
    backgroundColor: colors.correct,
    borderRadius: 10,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    zIndex: 1,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
  },
  activeTabText: {
    color: colors.white,
  },
  statsGrid: {
    marginBottom: 24,
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
    fontSize: 14,
    fontFamily: 'Montserrat_700Bold',
    textAlign: 'left',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
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
  progressCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressItem: {
    flex: 1,
    alignItems: 'center',
  },
  progressDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(128, 128, 128, 0.3)',
  },
  progressValue: {
    fontSize: 24,
    fontFamily: 'Montserrat_700Bold',
  },
  progressLabel: {
    fontSize: 11,
    fontFamily: 'Montserrat_600SemiBold',
    marginTop: 4,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.correct,
    borderRadius: 4,
  },
  achievementsGrid: {
    marginBottom: 24,
  },
  achievementCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  achievementCardLocked: {
    opacity: 0.6,
  },
  achievementIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  achievementIconUnlocked: {
    backgroundColor: colors.correct,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 14,
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 2,
  },
  achievementTitleLocked: {
    opacity: 0.7,
  },
  achievementDescription: {
    fontSize: 12,
    fontFamily: 'Montserrat_500Medium',
    lineHeight: 16,
    marginBottom: 4,
  },
  achievementFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  achievementPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  achievementPointsText: {
    fontSize: 11,
    fontFamily: 'Montserrat_600SemiBold',
  },
  achievementDate: {
    fontSize: 10,
    fontFamily: 'Montserrat_500Medium',
  },
  unlockedBadge: {
    marginLeft: 8,
  },
  // History styles
  emptyHistory: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyHistoryText: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
  historyCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  historyWord: {
    fontSize: 16,
    fontFamily: 'Montserrat_700Bold',
    letterSpacing: 2,
  },
  historyHardBadge: {
    backgroundColor: colors.present,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyHardText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: 'Montserrat_700Bold',
  },
  historyDailyBadge: {
    backgroundColor: colors.correct,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyDailyText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: 'Montserrat_700Bold',
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyGuessCount: {
    fontSize: 16,
    fontFamily: 'Montserrat_700Bold',
  },
  historyDate: {
    fontSize: 10,
    fontFamily: 'Montserrat_600SemiBold',
    marginTop: 2,
  },
  historyGrid: {
    gap: 3,
  },
  historyRow: {
    flexDirection: 'row',
    gap: 3,
  },
  historyTile: {
    width: 14,
    height: 14,
    borderRadius: 2,
  },
});
