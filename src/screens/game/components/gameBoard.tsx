import { useState, useEffect, useRef, useCallback } from 'react';

import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform, Animated as RNAnimated } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Keyboard from './keyboard';
import LetterSquare from './letterSquare';
import VibeMeter from '../../../components/VibeMeter';
import { useAppSelector } from '../../../hooks/storeHooks';
import { adjustTextDisplay } from '../../../utils/adjustLetterDisplay';
import { APP_TITLE, colors, HEIGHT, SIZE } from '../../../utils/constants';
import { calculateVibeScore } from '../../../utils/vibeMeter';

const WIN_MESSAGES = [
  'Genius!',
  'Magnificent!',
  'Impressive!',
  'Splendid!',
  'Great!',
  'Phew!',
];

interface GameBoardProps {
  solution: string;
  handleGuess: (keyPressed: string) => void;
  resetGame: () => void;
  onShare?: () => void;
  gameMode?: 'daily' | 'unlimited';
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
  const { hardMode } = useAppSelector((state) => state.settings);
  const { statistics } = useAppSelector((state) => state.statistics);
  const insets = useSafeAreaInsets();

  const [showModal, setShowModal] = useState(false);
  const fadeAnim = useRef(new RNAnimated.Value(0)).current;
  const scaleAnim = useRef(new RNAnimated.Value(0.85)).current;

  // Physical keyboard support (web + external keyboards)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameEnded) return;
    const key = e.key;
    if (key === 'Enter') {
      handleGuess('Enter');
    } else if (key === 'Backspace') {
      handleGuess('<');
    } else if (/^[a-zA-ZçğıöşüÇĞİÖŞÜ]$/.test(key)) {
      handleGuess(key.toLowerCase());
    }
  }, [handleGuess, gameEnded]);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown]);

  // Show modal after game ends with a delay for animations to complete
  useEffect(() => {
    if (gameEnded) {
      const delay = gameWon ? 250 * 5 + 800 : 1500;
      const timer = setTimeout(() => {
        setShowModal(true);
        RNAnimated.parallel([
          RNAnimated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          RNAnimated.spring(scaleAnim, {
            toValue: 1,
            tension: 65,
            friction: 10,
            useNativeDriver: true,
          }),
        ]).start();
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setShowModal(false);
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.85);
    }
  }, [gameEnded, gameWon, fadeAnim, scaleAnim]);

  const guessCount = guesses.filter((g) => g.isComplete).length;
  const winMessage = gameWon ? WIN_MESSAGES[Math.min(guessCount - 1, 5)] : '';

  const handleDismissAndReset = () => {
    setShowModal(false);
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.85);
    resetGame();
  };

  const themedStyles = {
    background: { backgroundColor: theme.colors.background },
    text: { color: theme.colors.text },
    secondaryText: { color: theme.colors.secondary },
    card: { backgroundColor: theme.colors.background2 },
  };

  return (
    <View style={[styles.board, themedStyles.background]}>
      <View style={[styles.contentArea, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, themedStyles.text]}>{APP_TITLE}</Text>
          <View style={styles.headerBadges}>
            {gameMode === 'daily' && (
              <View style={[styles.badge, styles.dailyBadge]}>
                <Text style={styles.badgeText}>Daily</Text>
              </View>
            )}
            {hardMode && (
              <View style={[styles.badge, styles.hardBadge]}>
                <Text style={styles.badgeText}>Hard</Text>
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
        <VibeMeter vibeScore={calculateVibeScore(guesses, solution)} />

        {/* Message Area */}
        <View style={styles.messageArea}>
          {gameEnded && (
            <View style={styles.gameEndContainer}>
              <Text style={[styles.solutionText, themedStyles.text]}>
                {gameWon
                  ? 'Congratulations!'
                  : `The word was: ${adjustTextDisplay(solution, gameLanguage)}`}
              </Text>
              <View style={styles.buttonRow}>
                {onShare && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.shareButton]}
                    onPress={onShare}
                  >
                    <Ionicons name="share-social" size={18} color="#fff" />
                    <Text style={styles.actionButtonText}>Share</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.actionButton, styles.newGameButton]}
                  onPress={resetGame}
                >
                  <Ionicons name="refresh" size={18} color="#fff" />
                  <Text style={styles.actionButtonText}>New Game</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
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

      <View style={styles.keyboardWrapper}>
        {/* Keyboard */}
        <Keyboard handleGuess={handleGuess} />
      </View>

      {/* Game End Modal */}
      <Modal transparent visible={showModal} animationType="none">
        <RNAnimated.View
          style={[
            styles.modalOverlay,
            { opacity: fadeAnim },
            { backgroundColor: theme.dark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)' },
          ]}
        >
          <RNAnimated.View
            style={[
              styles.modalCard,
              themedStyles.card,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            {gameWon ? (
              <>
                <View style={styles.modalIconContainer}>
                  <Ionicons name="trophy" size={40} color={colors.correct} />
                </View>
                <Text style={[styles.modalTitle, themedStyles.text]}>{winMessage}</Text>
                <Text style={[styles.modalSubtitle, themedStyles.secondaryText]}>
                  You got it in {guessCount} {guessCount === 1 ? 'guess' : 'guesses'}
                </Text>
              </>
            ) : (
              <>
                <View style={[styles.modalIconContainer, styles.modalIconLoss]}>
                  <Ionicons name="close-circle" size={40} color="#FF453A" />
                </View>
                <Text style={[styles.modalTitle, themedStyles.text]}>Better Luck Next Time</Text>
                <Text style={[styles.modalSolutionLabel, themedStyles.secondaryText]}>
                  The word was
                </Text>
                <Text style={[styles.modalSolutionWord, themedStyles.text]}>
                  {adjustTextDisplay(solution, gameLanguage)}
                </Text>
              </>
            )}

            {/* Stats Summary */}
            <View style={styles.modalStatsRow}>
              <View style={styles.modalStatItem}>
                <Text style={[styles.modalStatValue, themedStyles.text]}>
                  {statistics.currentStreak}
                </Text>
                <Text style={[styles.modalStatLabel, themedStyles.secondaryText]}>Streak</Text>
              </View>
              <View style={[styles.modalStatDivider, { backgroundColor: theme.colors.tertiary }]} />
              <View style={styles.modalStatItem}>
                <Text style={[styles.modalStatValue, themedStyles.text]}>
                  {statistics.gamesPlayed > 0
                    ? Math.round((statistics.gamesWon / statistics.gamesPlayed) * 100)
                    : 0}%
                </Text>
                <Text style={[styles.modalStatLabel, themedStyles.secondaryText]}>Win Rate</Text>
              </View>
              <View style={[styles.modalStatDivider, { backgroundColor: theme.colors.tertiary }]} />
              <View style={styles.modalStatItem}>
                <Text style={[styles.modalStatValue, themedStyles.text]}>
                  {statistics.gamesPlayed}
                </Text>
                <Text style={[styles.modalStatLabel, themedStyles.secondaryText]}>Played</Text>
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
                  <Text style={styles.modalButtonText}>Share</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.modalButton, styles.newGameButton]}
                onPress={handleDismissAndReset}
              >
                <Ionicons name="refresh" size={18} color="#fff" />
                <Text style={styles.modalButtonText}>New Game</Text>
              </TouchableOpacity>
            </View>
          </RNAnimated.View>
        </RNAnimated.View>
      </Modal>
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
  contentArea: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-evenly',
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
  gameEndContainer: {
    alignItems: 'center',
  },
  solutionText: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  actionButtonText: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 14,
    color: '#fff',
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
    backgroundColor: 'rgba(106, 170, 100, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalIconLoss: {
    backgroundColor: 'rgba(255, 69, 58, 0.15)',
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
  modalSolutionWord: {
    fontSize: 28,
    fontFamily: 'Montserrat_800ExtraBold',
    textTransform: 'uppercase',
    letterSpacing: 4,
    marginBottom: 20,
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
    backgroundColor: '#6aaa64',
  },
  newGameButton: {
    backgroundColor: '#404040',
  },
  modalButtonText: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 14,
    color: '#fff',
  },
});
