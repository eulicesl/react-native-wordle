import React, { useState, useEffect, useRef } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';

import { useAppSelector } from '../hooks/storeHooks';
import { colors } from '../utils/constants';
import { playHaptic } from '../utils/haptics';
import { getStoreData, setStoreData } from '../utils/localStorageFuncs';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ONBOARDING_COMPLETE_KEY = 'onboarding_complete';

interface OnboardingProps {
  onComplete: () => void;
  forceShow?: boolean;
}

interface OnboardingStep {
  title: string;
  description: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  example: {
    letters: string[];
    highlights: ('correct' | 'present' | 'absent' | '')[];
    highlightIndex: number;
  } | null;
  tip?: string;
}

const STEPS: OnboardingStep[] = [
  {
    title: 'Welcome to Wordle!',
    description:
      'Guess the hidden 5-letter word in 6 tries.\n\nEach guess must be a valid English word.',
    icon: 'game-controller',
    example: null,
    tip: 'A new puzzle is available every day!',
  },
  {
    title: 'Green = Perfect!',
    description: 'The letter W is in the word and in the correct position.',
    example: {
      letters: ['W', 'E', 'A', 'R', 'Y'],
      highlights: ['correct', '', '', '', ''],
      highlightIndex: 0,
    },
    tip: 'Green letters are locked in place for Hard Mode.',
  },
  {
    title: 'Yellow = Close!',
    description: 'The letter I is in the word but in the wrong position.',
    example: {
      letters: ['P', 'I', 'L', 'L', 'S'],
      highlights: ['', 'present', '', '', ''],
      highlightIndex: 1,
    },
    tip: 'Try moving yellow letters to different spots.',
  },
  {
    title: 'Gray = Not There',
    description: 'The letter U is not in the word at all.',
    example: {
      letters: ['V', 'A', 'G', 'U', 'E'],
      highlights: ['', '', '', 'absent', ''],
      highlightIndex: 3,
    },
    tip: 'Gray letters are removed from the keyboard.',
  },
  {
    title: 'Multiple Letters',
    description:
      'Words can have repeating letters.\nThe hints account for duplicates.',
    example: {
      letters: ['S', 'P', 'E', 'E', 'D'],
      highlights: ['correct', 'present', 'correct', 'correct', 'absent'],
      highlightIndex: -1,
    },
    tip: 'Watch for words like SPEED, GEESE, or VIVID!',
  },
  {
    title: 'Daily Challenge',
    description:
      'Everyone gets the same word each day.\n\nShare your results with friends!',
    icon: 'calendar',
    example: null,
    tip: 'Build your streak by playing every day.',
  },
  {
    title: 'Hard Mode',
    description:
      'Enable Hard Mode in Settings for an extra challenge.\n\nYou must use revealed hints in subsequent guesses.',
    icon: 'skull',
    example: null,
    tip: 'Hard Mode is marked with a * when sharing results.',
  },
  {
    title: "Let's Play!",
    description:
      'Start with a word that has common letters like:\nADIEU, CRANE, or SLATE',
    icon: 'rocket',
    example: null,
    tip: 'Good luck! 🍀',
  },
];

export default function Onboarding({ onComplete, forceShow = false }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(forceShow);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const { theme } = useAppSelector((state) => state.theme);

  useEffect(() => {
    if (!forceShow) {
      checkOnboardingStatus();
    } else {
      setVisible(true);
    }
  }, [forceShow]);

  useEffect(() => {
    if (visible) {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      scaleAnim.setValue(0.9);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 65,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, currentStep, fadeAnim, slideAnim, scaleAnim]);

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
    playHaptic('keyPress');
    if (currentStep < STEPS.length - 1) {
      animateOut(() => setCurrentStep(currentStep + 1));
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    playHaptic('keyPress');
    if (currentStep > 0) {
      animateOut(() => setCurrentStep(currentStep - 1));
    }
  };

  const handleSkip = () => {
    playHaptic('keyPress');
    handleComplete();
  };

  const handleComplete = async () => {
    if (!forceShow) {
      await setStoreData(ONBOARDING_COMPLETE_KEY, 'true');
    }
    playHaptic('correct');
    setVisible(false);
    onComplete();
  };

  const step = STEPS[currentStep];

  const themedStyles = {
    overlay: {
      backgroundColor: theme.dark ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.98)',
    },
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
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBackground, themedStyles.card]}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${((currentStep + 1) / STEPS.length) * 100}%` },
                ]}
              />
            </View>
            <Text style={[styles.progressText, themedStyles.secondaryText]}>
              {currentStep + 1} / {STEPS.length}
            </Text>
          </View>

          {/* Icon or Example tiles */}
          {step.icon && !step.example && (
            <View style={[styles.iconContainer, themedStyles.card]}>
              <Ionicons name={step.icon} size={48} color={colors.correct} />
            </View>
          )}

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
                        !highlight && [styles.tileBorder, themedStyles.card],
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

          {/* Title */}
          <Text style={[styles.title, themedStyles.text]}>{step.title}</Text>

          {/* Description */}
          <Text style={[styles.description, themedStyles.secondaryText]}>{step.description}</Text>

          {/* Tip */}
          {step.tip && (
            <View style={[styles.tipContainer, themedStyles.card]}>
              <Ionicons
                name="bulb"
                size={16}
                color={colors.present}
                style={styles.tipIcon}
              />
              <Text style={[styles.tipText, themedStyles.secondaryText]}>{step.tip}</Text>
            </View>
          )}

          {/* Navigation Buttons */}
          <View style={styles.buttonContainer}>
            {currentStep > 0 && (
              <TouchableOpacity
                style={[styles.navButton, themedStyles.card]}
                onPress={handlePrevious}
                accessibilityLabel="Previous step"
                accessibilityRole="button"
              >
                <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            )}

            <View style={styles.buttonSpacer} />

            {currentStep < STEPS.length - 1 && (
              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSkip}
                accessibilityLabel="Skip tutorial"
                accessibilityRole="button"
              >
                <Text style={[styles.skipButtonText, themedStyles.secondaryText]}>Skip</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
              accessibilityLabel={currentStep === STEPS.length - 1 ? 'Start playing' : 'Next step'}
              accessibilityRole="button"
            >
              <Text style={styles.nextButtonText}>
                {currentStep === STEPS.length - 1 ? "Let's Play!" : 'Next'}
              </Text>
              {currentStep < STEPS.length - 1 && (
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

// Reset onboarding (for testing or re-viewing)
export async function resetOnboarding(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY);
  } catch (error) {
    console.log('Error resetting onboarding:', error);
  }
}

const tileSize = Math.min((SCREEN_WIDTH - 120) / 5, 56);

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
    width: '100%',
    marginBottom: 32,
    alignItems: 'center',
  },
  progressBackground: {
    width: '80%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.correct,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Montserrat_600SemiBold',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Montserrat_800ExtraBold',
    textAlign: 'center',
    marginBottom: 16,
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
  },
  tileBorder: {
    borderWidth: 2,
    borderColor: 'rgba(128, 128, 128, 0.3)',
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
    borderWidth: 3,
    borderColor: '#fff',
    transform: [{ scale: 1.1 }],
  },
  tileLetter: {
    fontSize: 22,
    fontFamily: 'Montserrat_800ExtraBold',
  },
  tileLetterWhite: {
    color: '#fff',
  },
  description: {
    fontSize: 16,
    fontFamily: 'Montserrat_500Medium',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
    maxWidth: '95%',
  },
  tipIcon: {
    marginRight: 8,
  },
  tipText: {
    fontSize: 13,
    fontFamily: 'Montserrat_500Medium',
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 16,
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonSpacer: {
    flex: 1,
  },
  skipButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginRight: 8,
  },
  skipButtonText: {
    fontSize: 15,
    fontFamily: 'Montserrat_600SemiBold',
  },
  nextButton: {
    backgroundColor: colors.correct,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingLeft: 24,
    paddingRight: 20,
    borderRadius: 25,
    gap: 4,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat_700Bold',
  },
});
