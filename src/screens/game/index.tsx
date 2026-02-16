import { useEffect, useState, useCallback, useRef, useMemo } from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ReAnimated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import AchievementToast from '../../components/AchievementToast';
import GameTimer from '../../components/GameTimer';
import HintButton from '../../components/HintButton';
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
  setHintsUsed,
  setHintedPositions,
} from '../../store/slices/gameStateSlice';
import {
  setStatistics,
  recordGameWin,
  recordGameLoss,
} from '../../store/slices/statisticsSlice';
import { guess, matchStatus } from '../../types';
import { APP_TITLE, colors, initialGuesses } from '../../utils/constants';
import { spacing, space3, space5, space10 } from '../../utils/spacing';
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
import { announceGuessResult, announceGameResult } from '../../utils/accessibility';
import { checkAchievements, AchievementCategory } from '../../services/gameCenter';
import { calculateMatches } from '../../utils/gameLogic';
import { saveGameToHistory } from '../../utils/gameHistory';
import { maybeRequestReview } from '../../utils/ratingPrompt';
import { shareResults } from '../../utils/shareResults';
import { playSound, SoundType } from '../../utils/sounds';
import { PRE_GAME, GAME_MODES, GAME_ERRORS, HINTS } from '../../utils/strings';
import { calculateVibeScore } from '../../utils/vibeMeter';
import { answersEN, answersTR, wordsEN, wordsTR } from '../../words';
import GameBoard from './components/gameBoard';

type GameMode = 'daily' | 'unlimited' | 'speed';

const SPEED_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const SPEED_HARD_DURATION_MS = 2 * 60 * 1000; // 2 minutes in hard mode

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
    hintsUsed,
    hintedPositions,
  } = useAppSelector((state) => state.gameState);
  const { hardMode, highContrastMode } = useAppSelector((state) => state.settings);
  const { theme } = useAppSelector((state) => state.theme);
  const { statistics } = useAppSelector((state) => state.statistics);
  const dispatch = useAppDispatch();

  const [gameMode, setGameMode] = useState<GameMode>('daily');
  const [dailyCompleted, setDailyCompleted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);

  // Refs for timeout cleanup on unmount
  const winTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shakeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const usedKeysRef = useRef(usedKeys);
  const [pendingAchievement, setPendingAchievement] = useState<{
    title: string;
    description: string;
    points: number;
    category: AchievementCategory;
  } | null>(null);

  // Keep usedKeys ref in sync to avoid stale closures
  useEffect(() => {
    usedKeysRef.current = usedKeys;
  }, [usedKeys]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (winTimeoutRef.current) clearTimeout(winTimeoutRef.current);
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
      if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    };
  }, []);

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

  const wordList = useMemo(() => {
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
    const tempUsedKeys = { ...usedKeysRef.current };
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

      // Check achievements on loss too
      checkAchievements(false, 0, hardMode, gameMode === 'daily', null).then(
        (newAchievements) => {
          const first = newAchievements[0];
          if (first) {
            setPendingAchievement({
              title: first.achievement.title,
              description: first.achievement.description,
              points: first.achievement.points,
              category: first.achievement.category,
            });
          }
        }
      );

      // Announce for screen readers
      announceGameResult(false, solution, 0);

      // Save to game history
      saveGameToHistory({
        date: new Date().toISOString(),
        solution,
        won: false,
        guessCount: 6,
        matches: guesses.filter((g) => g.isComplete).map((g) => g.matches),
        gameMode,
        hardMode,
      });
    }
  }, [guesses, gameWon, gameEnded, dispatch, gameMode, hardMode, solution]);

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
        shakeTimeoutRef.current = setTimeout(() => {
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
        winTimeoutRef.current = setTimeout(() => {
          setShowConfetti(true);
          dispatch(setGameWon(true));
          dispatch(setGameEnded(true));
          handleFoundKeysOnKeyboard(updatedGuess);

          // Record win - statistics persistence is handled by the central useEffect
          const guessCount = currentGuessIndex + 1;
          const today = getTodayDateString();
          dispatch(recordGameWin({ guessCount, date: today, isDaily: gameMode === 'daily' }));

          // Play tier-based victory sound
          playSound(`winTier${guessCount}` as SoundType);

          // Check achievements and show toast for new unlocks
          const timeTaken = gameStartTime ? Date.now() - gameStartTime : null;
          checkAchievements(true, guessCount, hardMode, gameMode === 'daily', timeTaken).then(
            (newAchievements) => {
              const first = newAchievements[0];
              if (first) {
                setPendingAchievement({
                  title: first.achievement.title,
                  description: first.achievement.description,
                  points: first.achievement.points,
                  category: first.achievement.category,
                });
              }
            }
          );

          // Announce for screen readers
          announceGameResult(true, solution, guessCount);

          // Save to game history
          saveGameToHistory({
            date: new Date().toISOString(),
            solution,
            won: true,
            guessCount,
            matches: updatedGuesses
              .filter((g) => g.isComplete)
              .map((g) => g.matches),
            gameMode,
            hardMode,
          });

          if (gameMode === 'daily') {
            setDailyCompleted(true);
          }

          // Maybe prompt for app store rating after a win
          maybeRequestReview(statistics.gamesPlayed + 1, statistics.gamesWon + 1, true);
        }, 250 * 6);
      } else if (wordList.includes(currentGuessedWord)) {
        const matches = calculateMatches(currentGuessedWord, solution);

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

        // Announce guess result for screen readers
        announceGuessResult(updatedGuess.matches, updatedGuess.letters);
      } else {
        setErrorMessage(GAME_ERRORS.notInWordList);
        dispatch(setWrongGuessShake(true));
        shakeTimeoutRef.current = setTimeout(() => {
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
    setPendingAchievement(null);
    setGameMode(mode);
    setErrorMessage(null);
    setGameStartTime(Date.now());
    dispatch(setGameStarted(true));
    resetGameState();
    dispatch(setCurrentGuessIndex(0));
    dispatch(setUsedKeys({}));
    dispatch(setGameWon(false));
    dispatch(setGameEnded(false));
    dispatch(setHintsUsed(0));
    dispatch(setHintedPositions([]));

    const language = gameLanguage === 'tr' ? 'tr' : 'en';
    if (mode === 'daily') {
      dispatch(setSolution(getTodaysDailyWord(language)));
    } else {
      dispatch(setSolution(getRandomWord(language)));
    }
  };

  const handleTimerExpire = useCallback(() => {
    if (gameEnded) return;
    dispatch(setGameEnded(true));
    const today = getTodayDateString();
    dispatch(recordGameLoss({ date: today, isDaily: false }));
    checkAchievements(false, 0, hardMode, false, null);
    announceGameResult(false, solution, 0);
    saveGameToHistory({
      date: new Date().toISOString(),
      solution,
      won: false,
      guessCount: guesses.filter((g) => g.isComplete).length,
      matches: guesses.filter((g) => g.isComplete).map((g) => g.matches),
      gameMode: 'speed',
      hardMode,
    });
  }, [gameEnded, dispatch, hardMode, solution, guesses]);

  const MAX_HINTS = 2;
  const hintsDisabled = hardMode || gameMode === 'daily' || gameEnded || hintsUsed >= MAX_HINTS;

  const handleHint = useCallback(() => {
    if (hintsDisabled || !solution) return;

    if (hintsUsed === 0) {
      // Hint 1: reveal one correct letter position (not already hinted)
      const unhinted = [0, 1, 2, 3, 4].filter((i) => !hintedPositions.includes(i));
      if (unhinted.length === 0) return;
      const pos = unhinted[Math.floor(Math.random() * unhinted.length)];
      if (pos === undefined) return;
      const letter = solution[pos];
      if (!letter) return;

      // Place the letter in the current guess at the correct position
      const currentGuess = guesses[currentGuessIndex];
      if (currentGuess) {
        const updatedLetters = [...currentGuess.letters];
        updatedLetters[pos] = letter;
        const updatedGuess = { ...currentGuess, letters: updatedLetters };
        const updatedGuesses = guesses.map((g, idx) =>
          idx === currentGuessIndex ? updatedGuess : g
        );
        dispatch(setGuesses(updatedGuesses));
      }

      dispatch(setHintsUsed(1));
      dispatch(setHintedPositions([...hintedPositions, pos]));
    } else if (hintsUsed === 1) {
      // Hint 2: reveal that a letter is present in the word (show it as error message)
      const currentGuess = guesses[currentGuessIndex];
      const usedLetters = currentGuess ? currentGuess.letters.filter((l) => l !== '') : [];
      const solutionLetters = solution.split('');
      const unusedSolutionLetters = solutionLetters.filter(
        (l) => !usedLetters.includes(l) && !hintedPositions.some((p) => solution[p] === l)
      );

      const hintLetter = unusedSolutionLetters[Math.floor(Math.random() * unusedSolutionLetters.length)];
      if (hintLetter) {
        setErrorMessage(HINTS.wordContains(hintLetter.toUpperCase()));
        hintTimeoutRef.current = setTimeout(() => setErrorMessage(null), 3000);
      } else {
        setErrorMessage(GAME_ERRORS.noMoreHints);
        hintTimeoutRef.current = setTimeout(() => setErrorMessage(null), 2000);
      }

      dispatch(setHintsUsed(2));
    }
  }, [hintsDisabled, solution, hintsUsed, hintedPositions, guesses, currentGuessIndex, dispatch]);

  const handleShare = async () => {
    const vibeScore = calculateVibeScore(guesses, solution);
    await shareResults(guesses, gameWon, gameMode === 'daily', hardMode, highContrastMode, vibeScore.score);
  };

  const resetGame = () => {
    if (gameMode === 'speed') {
      startGame('speed');
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
        {/* Decorative mini grid */}
        <ReAnimated.View entering={FadeInDown.delay(100).duration(500)} style={styles.miniGrid}>
          {[colors.correct, colors.present, colors.absent, colors.correct, colors.present].map(
            (color, i) => (
              <ReAnimated.View
                key={i}
                entering={FadeInDown.delay(150 + i * 80).duration(400)}
                style={[styles.miniTile, { backgroundColor: color }]}
              />
            )
          )}
        </ReAnimated.View>

        <ReAnimated.View entering={FadeInDown.delay(200).duration(500)}>
          <Text style={[styles.title, themedStyles.text]}>{APP_TITLE}</Text>
        </ReAnimated.View>
        <ReAnimated.View entering={FadeInDown.delay(300).duration(500)}>
          <Text style={[styles.subtitle, themedStyles.secondaryText]}>
            {PRE_GAME.subtitle}
          </Text>
        </ReAnimated.View>

        <View style={styles.modeContainer}>
          <ReAnimated.View entering={FadeInUp.delay(400).duration(500)}>
            <TouchableOpacity
              style={[styles.modeButton, styles.dailyButton, dailyCompleted && styles.disabledButton]}
              onPress={() => !dailyCompleted && startGame('daily')}
              disabled={dailyCompleted}
            >
              <Text style={styles.modeButtonText}>
                {dailyCompleted ? PRE_GAME.dailyComplete : PRE_GAME.dailyChallenge}
              </Text>
              <Text style={styles.modeButtonSubtext}>
                {dailyCompleted ? PRE_GAME.comeBackTomorrow : PRE_GAME.sameWordForEveryone}
              </Text>
            </TouchableOpacity>
          </ReAnimated.View>

          <ReAnimated.View entering={FadeInUp.delay(500).duration(500)}>
            <TouchableOpacity
              style={[styles.modeButton, styles.unlimitedButton]}
              onPress={() => startGame('unlimited')}
            >
              <Text style={styles.modeButtonText}>{PRE_GAME.unlimited}</Text>
              <Text style={styles.modeButtonSubtext}>{PRE_GAME.practiceWithRandomWords}</Text>
            </TouchableOpacity>
          </ReAnimated.View>

          <ReAnimated.View entering={FadeInUp.delay(600).duration(500)}>
            <TouchableOpacity
              style={[styles.modeButton, styles.speedButton]}
              onPress={() => startGame('speed')}
            >
              <Text style={styles.modeButtonText}>{GAME_MODES.speedChallenge}</Text>
              <Text style={styles.modeButtonSubtext}>
                {hardMode ? GAME_MODES.twoMinutes : GAME_MODES.fiveMinutes} to solve it
              </Text>
            </TouchableOpacity>
          </ReAnimated.View>
        </View>

        {/* Streak Display */}
        {statistics.currentStreak > 0 && (
          <ReAnimated.View entering={FadeInUp.delay(700).duration(500)} style={[styles.streakBadge, themedStyles.card]}>
            <Text style={[styles.streakValue, { color: colors.correct }]}>
              {statistics.currentStreak}
            </Text>
            <Text style={[styles.streakLabel, themedStyles.secondaryText]}>{PRE_GAME.dayStreak}</Text>
          </ReAnimated.View>
        )}

        {hardMode && (
          <ReAnimated.View entering={FadeInUp.delay(800).duration(400)} style={[styles.hardModeBadge, themedStyles.card]}>
            <Text style={[styles.hardModeText, themedStyles.text]}>{PRE_GAME.hardModeEnabled}</Text>
          </ReAnimated.View>
        )}
      </View>
    );
  }

  const speedDuration = hardMode ? SPEED_HARD_DURATION_MS : SPEED_DURATION_MS;

  return (
    <View style={[styles.gameContainer, themedStyles.background]}>
      {gameMode === 'speed' && (
        <View style={styles.timerContainer}>
          <GameTimer
            durationMs={speedDuration}
            active={gameStarted && !gameEnded}
            onExpire={handleTimerExpire}
          />
        </View>
      )}
      {gameMode !== 'daily' && !hardMode && (
        <View style={styles.hintContainer}>
          <HintButton
            hintsUsed={hintsUsed}
            maxHints={MAX_HINTS}
            disabled={hintsDisabled}
            onPress={handleHint}
          />
        </View>
      )}
      <GameBoard
        solution={solution}
        handleGuess={handleGuess}
        resetGame={resetGame}
        onShare={handleShare}
        gameMode={gameMode}
        errorMessage={errorMessage}
      />
      {pendingAchievement && (
        <AchievementToast
          title={pendingAchievement.title}
          description={pendingAchievement.description}
          points={pendingAchievement.points}
          category={pendingAchievement.category}
          onDismiss={() => setPendingAchievement(null)}
        />
      )}
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
    padding: space5,
  },
  title: {
    fontSize: 48,
    fontFamily: 'Montserrat_800ExtraBold',
    letterSpacing: 8,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: space10,
    textAlign: 'center',
  },
  modeContainer: {
    width: '100%',
    maxWidth: 300,
  },
  modeButton: {
    padding: space5,
    borderRadius: space3,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  dailyButton: {
    backgroundColor: '#7C4DFF',
  },
  unlimitedButton: {
    backgroundColor: '#FF6B9D',
  },
  speedButton: {
    backgroundColor: '#FF9500',
  },
  disabledButton: {
    backgroundColor: '#606060',
    opacity: 0.7,
  },
  modeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Montserrat_700Bold',
    marginBottom: spacing.xs,
  },
  modeButtonSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontFamily: 'Montserrat_600SemiBold',
  },
  miniGrid: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: space5,
  },
  miniTile: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: space5,
    paddingHorizontal: space5,
    paddingVertical: 10,
    borderRadius: space5,
    gap: spacing.sm,
  },
  streakValue: {
    fontSize: 20,
    fontFamily: 'Montserrat_800ExtraBold',
  },
  streakLabel: {
    fontSize: 12,
    fontFamily: 'Montserrat_600SemiBold',
  },
  hardModeBadge: {
    marginTop: space3,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: space5,
  },
  hardModeText: {
    fontSize: 12,
    fontFamily: 'Montserrat_600SemiBold',
  },
  timerContainer: {
    position: 'absolute',
    top: space3,
    right: spacing.md,
    zIndex: 10,
  },
  hintContainer: {
    position: 'absolute',
    top: space3,
    left: spacing.md,
    zIndex: 10,
  },
});
