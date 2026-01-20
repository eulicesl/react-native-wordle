import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { useAppSelector } from '../../../hooks/storeHooks';
import { adjustTextDisplay } from '../../../utils/adjustLetterDisplay';
import { HEIGHT, SIZE } from '../../../utils/constants';
import Keyboard from './keyboard';
import LetterSquare from './letterSquare';

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

  const themedStyles = {
    background: { backgroundColor: theme.colors.background },
    text: { color: theme.colors.text },
    secondaryText: { color: theme.colors.secondary },
    card: { backgroundColor: theme.colors.background2 },
  };

  return (
    <View style={[styles.board, themedStyles.background]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, themedStyles.text]}>WORDLE</Text>
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

      {/* Message Area */}
      <View style={styles.messageArea}>
        {gameEnded && (
          <View style={styles.gameEndContainer}>
            <Text style={[styles.solutionText, themedStyles.text]}>
              {gameWon ? 'Congratulations!' : `The word was: ${adjustTextDisplay(solution, gameLanguage)}`}
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

      {/* Keyboard */}
      <Keyboard handleGuess={handleGuess} />
    </View>
  );
};

export default GameBoard;

const styles = StyleSheet.create({
  board: {
    width: SIZE,
    height: HEIGHT,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingTop: 10,
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
    backgroundColor: '#6aaa64',
  },
  hardBadge: {
    backgroundColor: '#c9b458',
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
  },
  messageArea: {
    width: SIZE,
    minHeight: 80,
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
  shareButton: {
    backgroundColor: '#6aaa64',
  },
  newGameButton: {
    backgroundColor: '#404040',
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
});
