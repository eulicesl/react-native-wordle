import { useEffect, useState, useCallback } from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ConfettiExplosion } from '../../components/ParticleEffect';

import { useAppSelector, useAppDispatch } from '../../hooks/storeHooks';
import {
  setCurrentGuessIndex,
  setGameWon,
  setSolution,
  setGuesses,
  setUsedKeys,
  setGameEnded,
  setWrongGuessShake,
  setGameStarted,
  setGameLanguage,
} from '../../store/slices/gameStateSlice';
import {
  setStatistics,
  recordGameWin,
  recordGameLoss,
} from '../../store/slices/statisticsSlice';
import { guess, matchStatus } from '../../types';
import { APP_NAME, initialGuesses } from '../../utils/constants';
import {
  getTodaysDailyWord,
  getRandomWord,
  getTodayDateString,
  isGameForToday,
} from '../../utils/dailyWord';
import {
  getStoreData,
  loadStatistics,
  saveStatistics,
  loadGameState,
  saveGameState,
  clearGameState,
  PersistedGameState,
} from '../../utils/localStorageFuncs';
import { selectStatisticsLoaded } from '../../store/slices/statisticsSlice';
import { shareResults } from '../../utils/shareResults';
import { answersEN, answersTR, wordsEN, wordsTR } from '../../words';
import GameBoard from './components/gameBoard';

type GameMode = 'daily' | 'unlimited';

export default function Game() {
  const {
    guesses,
    usedKeys,
    currentGuessIndex,
    gameStarted,
    gameEnded,
    gameWon,
    solution,
    gameLanguage,
  } = useAppSelector((state) => state.gameState);
  const { hardMode, highContrastMode } = useAppSelector((state) => state.settings);
  const { theme } = useAppSelector((state) => state.theme);
  const { statistics } = useAppSelector((state) => state.statistics);
  const dispatch = useAppDispatch();

  const [gameMode, setGameMode] = useState<GameMode>('daily');
  const [dailyCompleted, setDailyCompleted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Load language preference on mount
  useEffect(() => {
    (async () => {
      const savedLanguage = (await getStoreData('language')) || 'en';
      dispatch(setGameLanguage(savedLanguage));
    })();
  }, [dispatch]);

  // Load statistics on mount
  useEffect(() => {
    (async () => {
      const saved = await loadStatistics();
      if (saved) {
        dispatch(setStatistics(saved));
      }
    })();
  }, [dispatch]);

  // Load saved game state on mount
  useEffect(() => {
    (async () => {
      const savedGame = await loadGameState();
      if (savedGame && savedGame.gameMode === 'daily') {
        if (isGameForToday(savedGame.dailyWordDate)) {
          // Resume the saved daily game
          dispatch(setSolution(savedGame.solution));
          dispatch(setGuesses(savedGame.guesses));
          dispatch(setCurrentGuessIndex(savedGame.currentGuessIndex));
          dispatch(setUsedKeys(savedGame.usedKeys));
          dispatch(setGameStarted(savedGame.gameStarted));
          dispatch(setGameEnded(savedGame.gameEnded));
          dispatch(setGameWon(savedGame.gameWon));
          setGameMode('daily');
          if (savedGame.gameEnded) {
            setDailyCompleted(true);
          }
        } else {
          // Clear old game state
          await clearGameState();
        }
      }
    })();
  }, [dispatch]);

  // Central persistence for statistics - saves whenever Redux statistics state changes
  const statisticsLoaded = useAppSelector(selectStatisticsLoaded);
  useEffect(() => {
    // Only save after initial load to avoid overwriting with default state
    if (statisticsLoaded && statistics) {
      saveStatistics(statistics);
    }
  }, [statistics, statisticsLoaded]);

  // Save game state on guess submit or game end (not on every keystroke)
  // Using currentGuessIndex as trigger since it only changes after a valid guess
  useEffect(() => {
    if (gameStarted && gameMode === 'daily') {
      const gameState: PersistedGameState = {
        solution,
        guesses,
        currentGuessIndex,
        usedKeys,
        gameStarted,
        gameEnded,
        gameWon,
        gameLanguage,
        dailyWordDate: getTodayDateString(),
        gameMode,
      };
      saveGameState(gameState);
    }
  }, [
    solution,
    currentGuessIndex, // Only persist when guess index changes (after valid guess)
    gameStarted,
    gameEnded,
    gameWon,
    gameLanguage,
    gameMode,
  ]);

  const wordList = useCallback(() => {
    switch (gameLanguage) {
      case 'en':
        return wordsEN.concat(answersEN);
      case 'tr':
        return wordsTR.concat(answersTR);
      default:
        return wordsEN.concat(answersEN);
    }
  }, [gameLanguage]);

  const handleFoundKeysOnKeyboard = (guess: guess) => {
    const tempUsedKeys = { ...usedKeys };
    guess.letters.forEach((letter: string, idx: number) => {
      const keyValue = tempUsedKeys[letter];
      const matchValue = guess.matches[idx];
      if (!matchValue) return;

      if (!keyValue) {
        tempUsedKeys[letter] = matchValue;
      } else {
        if (keyValue === 'correct') return;
        else if (keyValue && matchValue === 'correct') {
          tempUsedKeys[letter] = 'correct';
        } else if (keyValue === 'present' && matchValue !== 'correct')
          return;
        else tempUsedKeys[letter] = matchValue;
      }
    });
    dispatch(setUsedKeys(tempUsedKeys));
  };

  // Check for hard mode violations
  const checkHardModeViolation = (currentGuess: guess): string | null => {
    if (!hardMode || currentGuessIndex === 0) return null;

    const currentWord = currentGuess.letters.join('');
    const previousGuesses = guesses.slice(0, currentGuessIndex).filter((g) => g.isComplete);

    for (const prevGuess of previousGuesses) {
      // Check that all correct letters are in the same position
      for (let i = 0; i < 5; i++) {
        const prevLetter = prevGuess.letters[i];
        const prevMatch = prevGuess.matches[i];
        if (prevMatch === 'correct' && prevLetter && currentWord[i] !== prevLetter) {
          return `${i + 1}${getOrdinalSuffix(i + 1)} letter must be ${prevLetter.toUpperCase()}`;
        }
      }

      // Check that all present letters are used somewhere
      for (let i = 0; i < 5; i++) {
        const prevLetter = prevGuess.letters[i];
        const prevMatch = prevGuess.matches[i];
        if (prevMatch === 'present' && prevLetter && !currentWord.includes(prevLetter)) {
          return `Guess must contain ${prevLetter.toUpperCase()}`;
        }
      }
    }

    return null;
  };

  const getOrdinalSuffix = (n: number): string => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    if (v >= 11 && v <= 13) return 'th';
    const idx = v % 10;
    return s[idx] || 'th';
  };

  const checkGameEnd = useCallback(() => {
    // Guard: don't re-run if game already ended
    if (gameEnded) return;

    const attemptsCount = guesses.filter((guess: guess) => guess.isComplete).length;
    if (attemptsCount === 6 && !gameWon) {
      dispatch(setGameEnded(true));
      // Record loss
      if (gameMode === 'daily') {
        setDailyCompleted(true);
      }
      const today = getTodayDateString();
      dispatch(recordGameLoss({ date: today, isDaily: gameMode === 'daily' }));
    }
  }, [guesses, gameWon, gameEnded, dispatch, gameMode]);

  useEffect(() => {
    checkGameEnd();
  }, [currentGuessIndex, checkGameEnd]);

  const updateGuess = (keyPressed: string, currentGuess: guess) => {
    // Clear error message on new input
    if (errorMessage) setErrorMessage(null);

    const currentGuessLetters = [...currentGuess.letters];
    let nextEmptyIndex = currentGuessLetters.findIndex((letter) => letter === '');
    if (nextEmptyIndex === -1) nextEmptyIndex = 5;
    const lastNonEmptyIndex = nextEmptyIndex - 1;

    if (keyPressed !== '<' && keyPressed !== 'Enter' && nextEmptyIndex < 5) {
      currentGuessLetters[nextEmptyIndex] = keyPressed;
      const updatedGuess = { ...currentGuess, letters: currentGuessLetters };
      const updatedGuesses = guesses.map((guess, idx) => {
        if (idx === currentGuessIndex) return updatedGuess;
        else return guess;
      });
      dispatch(setGuesses([...updatedGuesses]));
    } else if (keyPressed === '<') {
      currentGuessLetters[lastNonEmptyIndex] = '';
      const updatedGuess = { ...currentGuess, letters: currentGuessLetters };
      const updatedGuesses = guesses.map((guess, idx) => {
        if (idx === currentGuessIndex) return updatedGuess;
        else return guess;
      });
      dispatch(setGuesses([...updatedGuesses]));
    }
  };

  const checkGuess = (currentGuess: guess) => {
    const currentGuessedWord = currentGuess.letters.join('');
    if (currentGuessedWord.length === 5) {
      // Check hard mode violations first
      const hardModeError = checkHardModeViolation(currentGuess);
      if (hardModeError) {
        setErrorMessage(hardModeError);
        dispatch(setWrongGuessShake(true));
        setTimeout(() => {
          dispatch(setWrongGuessShake(false));
        }, 1000);
        return;
      }

      if (currentGuessedWord === solution) {
        const matches: matchStatus[] = ['correct', 'correct', 'correct', 'correct', 'correct'];
        const updatedGuess = {
          ...currentGuess,
          matches,
          isComplete: true,
          isCorrect: true,
        };
        const updatedGuesses = guesses.map((guess, idx) => {
          if (idx === currentGuessIndex) return updatedGuess;
          else return guess;
        });
        dispatch(setGuesses(updatedGuesses));
        setTimeout(() => {
          setShowConfetti(true);
          dispatch(setGameWon(true));
          dispatch(setGameEnded(true));
          handleFoundKeysOnKeyboard(updatedGuess);

          // Record win - statistics persistence is handled by the central useEffect
          const guessCount = currentGuessIndex + 1;
          const today = getTodayDateString();
          dispatch(recordGameWin({ guessCount, date: today, isDaily: gameMode === 'daily' }));

          if (gameMode === 'daily') {
            setDailyCompleted(true);
          }
        }, 250 * 6);
      } else if (wordList().includes(currentGuessedWord)) {
        const matches: matchStatus[] = [];
        currentGuessedWord.split('').forEach((letter, index) => {
          const leftSlice = currentGuessedWord.slice(0, index + 1);
          const countInLeft = leftSlice.split('').filter((item) => item === letter).length;
          const totalCount = solution.split('').filter((item) => item === letter).length;
          const nonMatchingPairs = solution
            .split('')
            .filter((item, idx) => currentGuessedWord[idx] !== item);

          if (letter === solution[index]) {
            matches.push('correct');
          } else if (solution.includes(letter)) {
            if (countInLeft <= totalCount && nonMatchingPairs.includes(letter)) {
              matches.push('present');
            } else {
              matches.push('absent');
            }
          } else {
            matches.push('absent');
          }
        });

        const updatedGuess = {
          ...currentGuess,
          matches,
          isComplete: true,
          isCorrect: false,
        };

        const updatedGuesses = guesses.map((guess, idx) => {
          if (idx === currentGuessIndex) return updatedGuess;
          else return guess;
        });

        dispatch(setGuesses(updatedGuesses));
        dispatch(setCurrentGuessIndex(currentGuessIndex + 1));
        handleFoundKeysOnKeyboard(updatedGuess);
      } else {
        setErrorMessage('Not in word list');
        dispatch(setWrongGuessShake(true));
        setTimeout(() => {
          dispatch(setWrongGuessShake(false));
          setErrorMessage(null);
        }, 1000);
      }
    }
  };

  const handleGuess = (keyPressed: string) => {
    if (!gameEnded) {
      const currentGuess = guesses[currentGuessIndex];
      if (currentGuess) {
        if (keyPressed !== 'Enter' && !currentGuess.isComplete) {
          updateGuess(keyPressed, currentGuess);
        } else if (keyPressed === 'Enter' && !gameWon) {
          checkGuess(currentGuess);
        }
      }
    }
  };

  const resetGameState = () => {
    dispatch(setGuesses([...initialGuesses]));
  };

  const startGame = (mode: GameMode) => {
    setShowConfetti(false);
    setGameMode(mode);
    setErrorMessage(null);
    dispatch(setGameStarted(true));
    resetGameState();
    dispatch(setCurrentGuessIndex(0));
    dispatch(setUsedKeys({}));
    dispatch(setGameWon(false));
    dispatch(setGameEnded(false));

    const language = gameLanguage === 'tr' ? 'tr' : 'en';
    if (mode === 'daily') {
      dispatch(setSolution(getTodaysDailyWord(language)));
    } else {
      dispatch(setSolution(getRandomWord(language)));
    }
  };

  const handleShare = async () => {
    await shareResults(guesses, gameWon, gameMode === 'daily', hardMode, highContrastMode);
  };

  const resetGame = () => {
    if (gameMode === 'daily') {
      // For daily mode, start a new unlimited game
      startGame('unlimited');
    } else {
      startGame('unlimited');
    }
  };

  const themedStyles = {
    background: { backgroundColor: theme.colors.background },
    text: { color: theme.colors.text },
    secondaryText: { color: theme.colors.secondary },
    card: { backgroundColor: theme.colors.background2 },
  };

  if (!gameStarted) {
    return (
      <View style={[styles.newGameScreen, themedStyles.background]}>
        <Text style={[styles.title, themedStyles.text]}>{APP_NAME.toUpperCase()}</Text>
        <Text style={[styles.subtitle, themedStyles.secondaryText]}>
          Get 6 chances to guess a 5-letter word.
        </Text>

        <View style={styles.modeContainer}>
          <TouchableOpacity
            style={[styles.modeButton, styles.dailyButton, dailyCompleted && styles.disabledButton]}
            onPress={() => !dailyCompleted && startGame('daily')}
            disabled={dailyCompleted}
          >
            <Text style={styles.modeButtonText}>
              {dailyCompleted ? 'Daily Complete' : 'Daily Challenge'}
            </Text>
            <Text style={styles.modeButtonSubtext}>
              {dailyCompleted ? 'Come back tomorrow!' : 'Same word for everyone'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeButton, styles.unlimitedButton]}
            onPress={() => startGame('unlimited')}
          >
            <Text style={styles.modeButtonText}>Unlimited</Text>
            <Text style={styles.modeButtonSubtext}>Practice with random words</Text>
          </TouchableOpacity>
        </View>

        {hardMode && (
          <View style={[styles.hardModeBadge, themedStyles.card]}>
            <Text style={[styles.hardModeText, themedStyles.text]}>Hard Mode Enabled</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.gameContainer, themedStyles.background]}>
      <GameBoard
        solution={solution}
        handleGuess={handleGuess}
        resetGame={resetGame}
        onShare={handleShare}
        gameMode={gameMode}
        errorMessage={errorMessage}
      />
      <ConfettiExplosion
        active={showConfetti}
        particleCount={60}
        duration={2500}
        onComplete={() => setShowConfetti(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  gameContainer: {
    flex: 1,
    position: 'relative',
  },
  newGameScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontFamily: 'Montserrat_800ExtraBold',
    letterSpacing: 8,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 40,
    textAlign: 'center',
  },
  modeContainer: {
    width: '100%',
    maxWidth: 300,
  },
  modeButton: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  dailyButton: {
    backgroundColor: '#6aaa64',
  },
  unlimitedButton: {
    backgroundColor: '#c9b458',
  },
  disabledButton: {
    backgroundColor: '#606060',
    opacity: 0.7,
  },
  modeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 4,
  },
  modeButtonSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontFamily: 'Montserrat_600SemiBold',
  },
  hardModeBadge: {
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  hardModeText: {
    fontSize: 12,
    fontFamily: 'Montserrat_600SemiBold',
  },
});
