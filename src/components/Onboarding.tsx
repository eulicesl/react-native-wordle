import React, { useState, useEffect } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
} from 'react-native';

import { useAppSelector } from '../hooks/storeHooks';
import { colors, SIZE } from '../utils/constants';
import { getStoreData, setStoreData } from '../utils/localStorageFuncs';

const ONBOARDING_COMPLETE_KEY = 'onboarding_complete';

interface OnboardingProps {
  onComplete: () => void;
}

interface OnboardingStep {
  title: string;
  description: string;
  example: {
    letters: string[];
    highlights: ('correct' | 'present' | 'absent' | '')[];
    highlightIndex: number;
  } | null;
}

const STEPS: OnboardingStep[] = [
  {
    title: 'Welcome to Wordle!',
    description: 'Guess the hidden word in 6 tries.\nEach guess must be a valid 5-letter word.',
    example: null,
  },
  {
    title: 'Green = Correct',
    description: 'The letter is in the word and in the correct spot.',
    example: {
      letters: ['W', 'O', 'R', 'D', 'S'],
      highlights: ['correct', '', '', '', ''],
      highlightIndex: 0,
    },
  },
  {
    title: 'Yellow = Close',
    description: 'The letter is in the word but in the wrong spot.',
    example: {
      letters: ['T', 'R', 'A', 'I', 'N'],
      highlights: ['', 'present', '', '', ''],
      highlightIndex: 1,
    },
  },
  {
    title: 'Gray = Not in Word',
    description: 'The letter is not in the word at all.',
    example: {
      letters: ['P', 'L', 'A', 'N', 'E'],
      highlights: ['', '', 'absent', '', ''],
      highlightIndex: 2,
    },
  },
  {
    title: 'Ready to Play!',
    description: 'A new word is available each day.\nCan you find it in 6 guesses?',
    example: null,
  },
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const { theme } = useAppSelector((state) => state.theme);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, currentStep]);

  const checkOnboardingStatus = async () => {
    const completed = await getStoreData(ONBOARDING_COMPLETE_KEY);
    if (!completed) {
      setVisible(true);
    } else {
      onComplete();
    }
  };

  const animateOut = (callback: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      slideAnim.setValue(50);
      callback();
    });
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      animateOut(() => setCurrentStep(currentStep + 1));
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    await setStoreData(ONBOARDING_COMPLETE_KEY, 'true');
    setVisible(false);
    onComplete();
  };

  const step = STEPS[currentStep];

  const themedStyles = {
    overlay: { backgroundColor: theme.dark ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)' },
    text: { color: theme.colors.text },
    secondaryText: { color: theme.colors.secondary },
    card: { backgroundColor: theme.colors.background2 },
  };

  if (!visible || !step) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={[styles.overlay, themedStyles.overlay]}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Progress dots */}
          <View style={styles.progressContainer}>
            {STEPS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index === currentStep && styles.progressDotActive,
                  index < currentStep && styles.progressDotCompleted,
                ]}
              />
            ))}
          </View>

          {/* Title */}
          <Text style={[styles.title, themedStyles.text]}>{step.title}</Text>

          {/* Example tiles */}
          {step.example !== null && (
            <View style={styles.exampleContainer}>
              <View style={styles.tilesRow}>
                {step.example.letters.map((letter, index) => {
                  const currentExample = step.example;
                  if (!currentExample) return null;
                  const highlight = currentExample.highlights[index];
                  const isHighlighted = index === currentExample.highlightIndex;

                  return (
                    <Animated.View
                      key={index}
                      style={[
                        styles.tile,
                        highlight === 'correct' && styles.tileCorrect,
                        highlight === 'present' && styles.tilePresent,
                        highlight === 'absent' && styles.tileAbsent,
                        !highlight && themedStyles.card,
                        isHighlighted && styles.tileHighlighted,
                      ]}
                    >
                      <Text
                        style={[
                          styles.tileLetter,
                          highlight ? styles.tileLetterWhite : themedStyles.text,
                        ]}
                      >
                        {letter}
                      </Text>
                    </Animated.View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Description */}
          <Text style={[styles.description, themedStyles.secondaryText]}>
            {step.description}
          </Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {currentStep < STEPS.length - 1 && (
              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSkip}
                accessibilityLabel="Skip tutorial"
                accessibilityRole="button"
              >
                <Text style={[styles.skipButtonText, themedStyles.secondaryText]}>
                  Skip
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
              accessibilityLabel={currentStep === STEPS.length - 1 ? "Start playing" : "Next step"}
              accessibilityRole="button"
            >
              <Text style={styles.nextButtonText}>
                {currentStep === STEPS.length - 1 ? "Let's Play!" : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const tileSize = Math.min((SIZE - 100) / 6, 56);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: colors.correct,
    width: 24,
  },
  progressDotCompleted: {
    backgroundColor: colors.correct,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Montserrat_800ExtraBold',
    textAlign: 'center',
    marginBottom: 24,
  },
  exampleContainer: {
    marginBottom: 24,
  },
  tilesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tile: {
    width: tileSize,
    height: tileSize,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 3,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
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
  tileHighlighted: {
    borderColor: '#fff',
    transform: [{ scale: 1.1 }],
  },
  tileLetter: {
    fontSize: 24,
    fontFamily: 'Montserrat_800ExtraBold',
  },
  tileLetterWhite: {
    color: '#fff',
  },
  description: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  skipButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginRight: 12,
  },
  skipButtonText: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
  nextButton: {
    backgroundColor: colors.correct,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat_700Bold',
  },
});
