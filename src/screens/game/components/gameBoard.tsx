import { useState, useEffect, useRef, useCallback } from 'react';

import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform, useWindowDimensions } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ViewShot from 'react-native-view-shot';

import Keyboard from './keyboard';
import LetterSquare from './letterSquare';
import ShareCard from '../../../components/ShareCard';
import SolutionReveal from '../../../components/SolutionReveal';
import VibeMeter from '../../../components/VibeMeter';
import { useAppSelector } from '../../../hooks/storeHooks';
import {
  ROW_FLIP_TOTAL_MS,
  WIN_MODAL_EXTRA_DELAY_MS,
  LOSS_MODAL_DELAY_MS,
  TILE_FLIP_INITIAL_DELAY_MS,
  TILE_FLIP_STAGGER_MS,
  TILE_FLIP_DURATION_MS,
  TILES_PER_ROW,
} from '../../../utils/animations';
import { APP_TITLE, colors, SIZE } from '../../../utils/constants';
import { captureAndShare, SHARE_CAPTURE_OPTIONS } from '../../../utils/shareImage';
import { getDayNumber } from '../../../utils/dailyWord';
import { playSound } from '../../../utils/sounds';
import { WIN_MESSAGES, GAME_BOARD, GAME_MODES } from '../../../utils/strings';
import { typography } from '../../../utils/typography';
import { calculateVibeScore, calculatePartialVibeScore, VIBE_THRESHOLDS } from '../../../utils/vibeMeter';
import { playHaptic } from '../../../utils/haptics';
import { isReduceMotionEnabled } from '../../../utils/accessibility';
import { fetchWordDefinition, WordDefinition } from '../../../utils/wordDefinitions';

interface GameBoardProps {
  solution: string;
  handleGuess: (keyPressed: string) => void;
  resetGame: () => void;
  onShare?: () => void;
  gameMode?: 'daily' | 'unlimited' | 'speed';
  errorMessage?: string | null;
}

const GameBoard = ({
  solution,
  handleGuess,
  resetGame,
  onShare,
  gameMode = 'unlimited',
  errorMessage,
}: GameBoardProps) => {
  const { guesses, gameEnded, gameWon, wrongGuessShake, gameLanguage } = useAppSelector(
    (state) => state.gameState
  );
  const { theme } = useAppSelector((state) => state.theme);
  const { hardMode, hapticFeedback, highContrastMode } = useAppSelector((state) => state.settings);
  const { statistics } = useAppSelector((state) => state.statistics);
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isLandscapeTablet = windowWidth > windowHeight && Math.min(windowWidth, windowHeight) >= 768;

  const [showModal, setShowModal] = useState(false);
  const [wordDef, setWordDef] = useState<WordDefinition | null>(null);
  const [showLossDefinition, setShowLossDefinition] = useState(false);
  const shareCardRef = useRef<ViewShot>(null);
  const fadeAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(0.85);

  // --- Incremental Vibe Meter reveal ---
  const [revealProgress, setRevealProgress] = useState<number>(-1); // -1 = not revealing
  const [revealingRowIdx, setRevealingRowIdx] = useState<number>(-1);
  const completedCountRef = useRef(guesses.filter((g) => g.isComplete).length);
  const revealTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const prevVibeScoreRef = useRef(0);

  // Detect when a new row completes and start staggered reveal
  useEffect(() => {
    const currentCompleted = guesses.filter((g) => g.isComplete).length;
    const prevCompleted = completedCountRef.current;

    if (currentCompleted > prevCompleted && currentCompleted > 0) {
      const newRowIdx = currentCompleted - 1;
      const reduceMotion = isReduceMotionEnabled();

      if (reduceMotion) {
        // Skip incremental reveal — jump straight to final score
        completedCountRef.current = currentCompleted;
        setRevealProgress(-1);
        setRevealingRowIdx(-1);
        return;
      }

      setRevealingRowIdx(newRowIdx);
      setRevealProgress(0);

      // Clear any previous timers
      revealTimersRef.current.forEach(clearTimeout);
      revealTimersRef.current = [];

      // Schedule reveal increments matching tile flip stagger
      for (let i = 0; i < TILES_PER_ROW; i++) {
        // Each tile's color is visible at its flip midpoint
        const delay = TILE_FLIP_INITIAL_DELAY_MS + TILE_FLIP_STAGGER_MS * i + TILE_FLIP_DURATION_MS / 2;
        const timer = setTimeout(() => {
          setRevealProgress(i + 1);
        }, delay);
        revealTimersRef.current.push(timer);
      }

      // After full row reveal, clear the revealing state
      const finalTimer = setTimeout(() => {
        setRevealProgress(-1);
        setRevealingRowIdx(-1);
        revealTimersRef.current = [];
      }, ROW_FLIP_TOTAL_MS + 50);
      revealTimersRef.current.push(finalTimer);
    }

    completedCountRef.current = currentCompleted;

    return () => {
      revealTimersRef.current.forEach(clearTimeout);
      revealTimersRef.current = [];
    };
  }, [guesses]);

  // Compute the vibe score — incremental during reveal, final otherwise
  const vibeScore = revealProgress >= 0 && revealingRowIdx >= 0
    ? calculatePartialVibeScore(guesses, solution, revealingRowIdx, revealProgress)
    : calculateVibeScore(guesses, solution);

  // Haptic feedback when vibe score crosses threshold boundaries
  useEffect(() => {
    if (!hapticFeedback || revealProgress < 0) return;

    const prevScore = prevVibeScoreRef.current;
    const newScore = vibeScore.score;

    if (prevScore !== newScore) {
      for (const threshold of VIBE_THRESHOLDS) {
        const crossed = (prevScore < threshold && newScore >= threshold) ||
                        (prevScore >= threshold && newScore < threshold);
        if (crossed) {
          playHaptic('tileFlip');
          break; // One haptic per update is enough
        }
      }
    }

    prevVibeScoreRef.current = newScore;
  }, [vibeScore.score, revealProgress, hapticFeedback]);

  // Physical keyboard support (web + external keyboards)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameEnded) return;
    const key = e.key;
    if (key === 'Enter') {
      handleGuess('Enter');
    } else if (key === 'Backspace') {
      handleGuess('<');
    } else if (/^[a-zA-ZçğıöşüÇĞİÖŞÜ]$/.test(key)) {
      handleGuess(gameLanguage === 'tr' ? key.toLocaleLowerCase('tr') : key.toLowerCase());
    }
  }, [handleGuess, gameEnded, gameLanguage]);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
    return undefined;
  }, [handleKeyDown]);

  // Fetch word definition when game ends
  useEffect(() => {
    if (gameEnded && solution) {
      fetchWordDefinition(solution, gameLanguage).then(setWordDef);
    } else {
      setWordDef(null);
    }
  }, [gameEnded, solution, gameLanguage]);

  // Show modal after game ends with a delay for animations to complete
  useEffect(() => {
    if (gameEnded) {
      const delay = gameWon ? ROW_FLIP_TOTAL_MS + WIN_MODAL_EXTRA_DELAY_MS : LOSS_MODAL_DELAY_MS;
      const timer = setTimeout(() => {
        setShowModal(true);
        fadeAnim.value = withTiming(1, { duration: 300 });
        scaleAnim.value = withSpring(1, { damping: 12, stiffness: 120 });
      }, delay);
      return () => clearTimeout(timer);
    }
    setShowModal(false);
    fadeAnim.value = 0;
    scaleAnim.value = 0.85;
    return undefined;
  }, [gameEnded, gameWon, fadeAnim, scaleAnim]);

  const guessCount = guesses.filter((g) => g.isComplete).length;
  const winMessage = gameWon ? WIN_MESSAGES[Math.max(0, Math.min(guessCount - 1, 5))] : '';

  const handleDismissAndReset = () => {
    setShowModal(false);
    setShowLossDefinition(false);
    fadeAnim.value = 0;
    scaleAnim.value = 0.85;
    resetGame();
  };

  const overlayAnimStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
  }));

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  const themedStyles = {
    background: { backgroundColor: theme.colors.background },
    text: { color: theme.colors.text },
    secondaryText: { color: theme.colors.secondary },
    card: { backgroundColor: theme.colors.background2 },
  };

  return (
    <View style={[styles.board, themedStyles.background, isLandscapeTablet && styles.boardLandscape]}>
      <View style={[
        isLandscapeTablet ? styles.landscapeLayout : styles.portraitLayout,
        { paddingTop: insets.top },
      ]}>
        {/* Left side (or top in portrait): Grid area */}
        <View style={[styles.contentArea, isLandscapeTablet && styles.contentAreaLandscape]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, themedStyles.text]}>{APP_TITLE}</Text>
            <View style={styles.headerBadges}>
              {gameMode === 'daily' && (
                <View style={[styles.badge, styles.dailyBadge]}>
                  <Text style={styles.badgeText}>{GAME_BOARD.daily}</Text>
                </View>
              )}
              {gameMode === 'speed' && (
                <View style={[styles.badge, styles.speedBadge]}>
                  <Text style={styles.badgeText}>{GAME_MODES.speed}</Text>
                </View>
              )}
              {hardMode && (
                <View style={[styles.badge, styles.hardBadge]}>
                  <Text style={styles.badgeText}>{GAME_BOARD.hard}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Game Grid */}
          <View style={styles.blocksContainer}>
            {guesses.map((guess, idx) => (
              <View key={idx} style={styles.squareBlock}>
                {guess.letters.map((letter, letterIdx) => {
                  return (
                    <LetterSquare
                      key={letterIdx}
                      idx={letterIdx}
                      letter={letter}
                      guess={guess}
                    />
                  );
                })}
              </View>
            ))}
          </View>

          {/* Vibe Meter */}
          <VibeMeter vibeScore={vibeScore} />

          {/* Message Area */}
          <View style={styles.messageArea}>
            {wrongGuessShake && errorMessage && (
              <Animated.View
                entering={FadeIn}
                exiting={FadeOut}
                style={[styles.errorToast, themedStyles.card]}
              >
                <Text style={[styles.errorText, themedStyles.text]}>
                  {errorMessage}
                </Text>
              </Animated.View>
            )}
          </View>
        </View>

        {/* Right side (or bottom in portrait): Keyboard */}
        <View style={[styles.keyboardWrapper, isLandscapeTablet && styles.keyboardWrapperLandscape]}>
          <Keyboard handleGuess={handleGuess} />
        </View>
      </View>

      {/* Game End Modal */}
      <Modal transparent visible={showModal} animationType="none" onRequestClose={handleDismissAndReset}>
        <Animated.View
          style={[
            styles.modalOverlay,
            overlayAnimStyle,
            { backgroundColor: theme.dark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)' },
          ]}
        >
          <Animated.View
            accessibilityViewIsModal={true}
            style={[
              styles.modalCard,
              themedStyles.card,
              cardAnimStyle,
            ]}
          >
            {gameWon ? (
              <>
                <View style={styles.modalIconContainer}>
                  <Ionicons name="trophy" size={40} color={colors.correct} />
                </View>
                <Text style={[styles.modalTitle, typography.display, themedStyles.text]}>{winMessage}</Text>
                <Text style={[styles.modalSubtitle, themedStyles.secondaryText]}>
                  {GAME_BOARD.youGotItIn} {guessCount} {guessCount === 1 ? GAME_BOARD.guessSingular : GAME_BOARD.guessPlural}
                </Text>
              </>
            ) : (
              <>
                <Text style={[styles.modalSolutionLabel, themedStyles.secondaryText]}>
                  {GAME_BOARD.theWordWas}
                </Text>
                <SolutionReveal
                  word={solution}
                  letterColor={theme.colors.text}
                  onRevealStart={() => playSound('lose')}
                  onRevealComplete={() => setShowLossDefinition(true)}
                />
                <Text style={[styles.lossEncouragement, themedStyles.secondaryText]}>
                  {GAME_BOARD.toughOne}
                </Text>
                <Text style={[styles.lossNextAction, themedStyles.secondaryText]}>
                  {gameMode === 'daily' ? GAME_BOARD.tomorrowAwaits : GAME_BOARD.tryAnother}
                </Text>
              </>
            )}

            {/* Word Definition — on loss, wait for typewriter reveal to complete */}
            {wordDef && (gameWon || showLossDefinition) && (
              <View style={[styles.definitionContainer, { borderTopColor: theme.colors.tertiary }]}>
                <View style={styles.definitionHeader}>
                  <Text style={[styles.definitionWord, themedStyles.text]}>
                    {wordDef.word}
                  </Text>
                  {wordDef.phonetic && (
                    <Text style={[styles.definitionPhonetic, themedStyles.secondaryText]}>
                      {wordDef.phonetic}
                    </Text>
                  )}
                  <Text style={[styles.definitionPos, { color: colors.correct }]}>
                    {wordDef.partOfSpeech}
                  </Text>
                </View>
                <Text style={[styles.definitionText, themedStyles.secondaryText]} numberOfLines={3}>
                  {wordDef.definition}
                </Text>
                {wordDef.example && (
                  <Text style={[styles.definitionExample, themedStyles.secondaryText]} numberOfLines={2}>
                    &ldquo;{wordDef.example}&rdquo;
                  </Text>
                )}
              </View>
            )}

            {/* Stats Summary */}
            <View style={styles.modalStatsRow}>
              <View style={styles.modalStatItem}>
                <Text style={[styles.modalStatValue, themedStyles.text]}>
                  {statistics.currentStreak}
                </Text>
                <Text style={[styles.modalStatLabel, themedStyles.secondaryText]}>{GAME_BOARD.streak}</Text>
              </View>
              <View style={[styles.modalStatDivider, { backgroundColor: theme.colors.tertiary }]} />
              <View style={styles.modalStatItem}>
                <Text style={[styles.modalStatValue, themedStyles.text]}>
                  {statistics.gamesPlayed > 0
                    ? Math.round((statistics.gamesWon / statistics.gamesPlayed) * 100)
                    : 0}%
                </Text>
                <Text style={[styles.modalStatLabel, themedStyles.secondaryText]}>{GAME_BOARD.winRate}</Text>
              </View>
              <View style={[styles.modalStatDivider, { backgroundColor: theme.colors.tertiary }]} />
              <View style={styles.modalStatItem}>
                <Text style={[styles.modalStatValue, themedStyles.text]}>
                  {statistics.gamesPlayed}
                </Text>
                <Text style={[styles.modalStatLabel, themedStyles.secondaryText]}>{GAME_BOARD.played}</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalButtonRow}>
              {onShare && (
                <TouchableOpacity
                  style={[styles.modalButton, styles.shareButton]}
                  onPress={onShare}
                >
                  <Ionicons name="share-social" size={18} color="#fff" />
                  <Text style={styles.modalButtonText}>{GAME_BOARD.share}</Text>
                </TouchableOpacity>
              )}
              {Platform.OS !== 'web' && (
                <TouchableOpacity
                  style={[styles.modalButton, styles.shareImageButton]}
                  onPress={() => {
                    if (shareCardRef.current) {
                      captureAndShare(shareCardRef.current);
                    }
                  }}
                >
                  <Ionicons name="image" size={18} color="#fff" />
                  <Text style={styles.modalButtonText}>{GAME_BOARD.share}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.modalButton, styles.newGameButton]}
                onPress={handleDismissAndReset}
              >
                <Ionicons name="refresh" size={18} color="#fff" />
                <Text style={styles.modalButtonText}>{GAME_BOARD.newGame}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* Hidden share card for image capture */}
      <ViewShot ref={shareCardRef} options={SHARE_CAPTURE_OPTIONS} style={styles.hiddenCard}>
        <ShareCard
          guesses={guesses}
          gameWon={gameWon}
          guessCount={guessCount}
          streak={statistics.currentStreak}
          isDaily={gameMode === 'daily'}
          hardMode={hardMode}
          vibeScore={vibeScore.score}
          dayNumber={getDayNumber()}
          highContrastMode={highContrastMode}
          theme={theme}
          gameMode={gameMode}
        />
      </ViewShot>
    </View>
  );
};

export default GameBoard;

const styles = StyleSheet.create({
  board: {
    flex: 1,
    width: '100%',
    maxWidth: SIZE,
    alignSelf: 'center',
    alignItems: 'center',
  },
  boardLandscape: {
    maxWidth: '100%',
  },
  portraitLayout: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  landscapeLayout: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 24,
  },
  contentArea: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  contentAreaLandscape: {
    flex: 1,
    maxWidth: 500,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Montserrat_800ExtraBold',
    letterSpacing: 4,
  },
  headerBadges: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 6,
  },
  dailyBadge: {
    backgroundColor: '#7C4DFF',
  },
  speedBadge: {
    backgroundColor: colors.warning,
  },
  hardBadge: {
    backgroundColor: '#FF6B9D',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'Montserrat_700Bold',
    textTransform: 'uppercase',
  },
  squareBlock: {
    width: SIZE * 0.9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginBottom: 8,
  },
  blocksContainer: {
    width: SIZE * 0.9,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    flexShrink: 1,
  },
  messageArea: {
    width: SIZE,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorToast: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  errorText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 14,
  },
  keyboardWrapper: {
    width: '100%',
    alignItems: 'center',
    flexShrink: 0,
  },
  keyboardWrapperLandscape: {
    flex: 1,
    maxWidth: 500,
    justifyContent: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${colors.correct}26`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  lossEncouragement: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    textAlign: 'center',
    marginBottom: 4,
  },
  lossNextAction: {
    fontSize: 13,
    fontFamily: 'Montserrat_600SemiBold',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'Montserrat_800ExtraBold',
    marginBottom: 4,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalSolutionLabel: {
    fontSize: 12,
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  definitionContainer: {
    width: '100%',
    borderTopWidth: 1,
    paddingTop: 14,
    marginBottom: 16,
  },
  definitionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  definitionWord: {
    fontSize: 15,
    fontFamily: 'Montserrat_700Bold',
  },
  definitionPhonetic: {
    fontSize: 12,
    fontFamily: 'Montserrat_600SemiBold',
    fontStyle: 'italic',
  },
  definitionPos: {
    fontSize: 11,
    fontFamily: 'Montserrat_700Bold',
    textTransform: 'uppercase',
  },
  definitionText: {
    fontSize: 13,
    fontFamily: 'Montserrat_600SemiBold',
    lineHeight: 18,
  },
  definitionExample: {
    fontSize: 12,
    fontFamily: 'Montserrat_600SemiBold',
    fontStyle: 'italic',
    marginTop: 4,
    lineHeight: 16,
  },
  modalStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 12,
    paddingHorizontal: 8,
    width: '100%',
  },
  modalStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  modalStatValue: {
    fontSize: 22,
    fontFamily: 'Montserrat_700Bold',
  },
  modalStatLabel: {
    fontSize: 10,
    fontFamily: 'Montserrat_600SemiBold',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  modalStatDivider: {
    width: 1,
    height: 32,
    opacity: 0.3,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
  },
  shareButton: {
    backgroundColor: colors.correct,
  },
  shareImageButton: {
    backgroundColor: '#007AFF',
  },
  newGameButton: {
    backgroundColor: '#404040',
  },
  hiddenCard: {
    position: 'absolute',
    left: -1000,
    top: -1000,
  },
  modalButtonText: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 14,
    color: '#fff',
  },
});
