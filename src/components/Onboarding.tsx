import React, { useState, useEffect, useCallback } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { useAppSelector } from '../hooks/storeHooks';
import { colors } from '../utils/constants';
import { playHaptic } from '../utils/haptics';
import { getStoreData, setStoreData } from '../utils/localStorageFuncs';
import { isReduceMotionEnabled } from '../utils/accessibility';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ONBOARDING_COMPLETE_KEY = 'wordvibe_onboarding_v2_complete';
const TOTAL_STEPS = 4;

interface OnboardingProps {
  onComplete: () => void;
  forceShow?: boolean;
}

// --- Step 1: Welcome ---

function AnimatedLetter({
  letter,
  index,
  active,
  reduceMotion,
}: {
  letter: string;
  index: number;
  active: boolean;
  reduceMotion: boolean;
}) {
  const opacity = useSharedValue(reduceMotion ? 1 : 0);
  const scale = useSharedValue(reduceMotion ? 1 : 0.5);

  useEffect(() => {
    if (!active) return;
    if (reduceMotion) {
      opacity.value = 1;
      scale.value = 1;
      return;
    }
    opacity.value = withDelay(index * 120, withTiming(1, { duration: 350 }));
    scale.value = withDelay(
      index * 120,
      withSpring(1, { damping: 12, stiffness: 150 })
    );
  }, [active, index, reduceMotion, opacity, scale]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.Text
      style={[
        stepStyles.logoLetter,
        { color: index % 2 === 0 ? colors.correct : colors.present },
        animStyle,
      ]}
    >
      {letter}
    </Animated.Text>
  );
}

function WelcomeStep({ active }: { active: boolean }) {
  const { theme } = useAppSelector((state) => state.theme);
  const reduceMotion = isReduceMotionEnabled();
  const letters = 'WORDVIBE'.split('');

  const taglineOpacity = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (!active) return;
    if (reduceMotion) {
      taglineOpacity.value = 1;
      return;
    }
    taglineOpacity.value = withDelay(
      letters.length * 120 + 200,
      withTiming(1, { duration: 500 })
    );
  }, [active, reduceMotion, letters.length, taglineOpacity]);

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  return (
    <View style={stepStyles.welcomeContainer}>
      <View
        style={stepStyles.logoRow}
        accessibilityLabel="WordVibe logo"
        accessibilityRole="header"
      >
        {letters.map((letter, i) => (
          <AnimatedLetter
            key={i}
            letter={letter}
            index={i}
            active={active}
            reduceMotion={reduceMotion}
          />
        ))}
      </View>

      <Animated.Text
        style={[
          stepStyles.tagline,
          { color: theme.colors.secondary },
          taglineStyle,
        ]}
        accessibilityLabel="Feel the word"
      >
        Feel the word.
      </Animated.Text>
    </View>
  );
}

// --- Step 2: How It Works ---

interface TileExampleProps {
  letters: string[];
  statuses: ('correct' | 'present' | 'absent' | '')[];
  label: string;
  delay: number;
  active: boolean;
}

function AnimatedTileCell({
  letter,
  status,
  index,
  delay,
  active,
  reduceMotion,
  tileSize,
  textColor,
}: {
  letter: string;
  status: 'correct' | 'present' | 'absent' | '';
  index: number;
  delay: number;
  active: boolean;
  reduceMotion: boolean;
  tileSize: number;
  textColor: string;
}) {
  const flipProgress = useSharedValue(0);

  const bgColor =
    status === 'correct'
      ? colors.correct
      : status === 'present'
        ? colors.present
        : status === 'absent'
          ? colors.absent
          : 'transparent';

  useEffect(() => {
    if (!active) return;
    if (reduceMotion) {
      flipProgress.value = 1;
      return;
    }
    flipProgress.value = withDelay(
      delay + index * 150,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) })
    );
  }, [active, reduceMotion, delay, index, flipProgress]);

  const animStyle = useAnimatedStyle(() => {
    const progress = flipProgress.value;
    const borderColor =
      progress > 0.5 ? 'transparent' : 'rgba(128, 128, 128, 0.3)';
    const backgroundColor = progress > 0.5 ? bgColor : 'transparent';
    const rotateX =
      progress < 0.5
        ? `${progress * 180}deg`
        : `${(1 - progress) * 180}deg`;

    return {
      width: tileSize,
      height: tileSize,
      backgroundColor,
      borderWidth: progress > 0.5 ? 0 : 2,
      borderColor,
      transform: [{ perspective: 400 }, { rotateX }],
      opacity: progress > 0.4 && progress < 0.6 ? 0.3 : 1,
    };
  });

  const textAnimStyle = useAnimatedStyle(() => {
    const progress = flipProgress.value;
    return {
      color: progress > 0.5 && status ? '#fff' : textColor,
    };
  });

  return (
    <Animated.View
      style={[stepStyles.tile, animStyle]}
      accessibilityLabel={`Letter ${letter}, ${status || 'empty'}`}
      accessibilityRole="text"
    >
      <Animated.Text style={[stepStyles.tileLetter, textAnimStyle]}>
        {letter}
      </Animated.Text>
    </Animated.View>
  );
}

function TileExample({ letters, statuses, label, delay, active }: TileExampleProps) {
  const { theme } = useAppSelector((state) => state.theme);
  const reduceMotion = isReduceMotionEnabled();

  const labelOpacity = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (!active) return;
    if (reduceMotion) {
      labelOpacity.value = 1;
      return;
    }
    labelOpacity.value = withDelay(
      delay + letters.length * 150 + 200,
      withTiming(1, { duration: 400 })
    );
  }, [active, reduceMotion, delay, letters.length, labelOpacity]);

  const labelStyle = useAnimatedStyle(() => ({
    opacity: labelOpacity.value,
  }));

  const tileSize = Math.min((SCREEN_WIDTH - 100) / 5, 50);

  return (
    <View style={stepStyles.tileExampleBlock}>
      <View style={stepStyles.tilesRow}>
        {letters.map((letter, i) => (
          <AnimatedTileCell
            key={i}
            letter={letter}
            status={statuses[i]}
            index={i}
            delay={delay}
            active={active}
            reduceMotion={reduceMotion}
            tileSize={tileSize}
            textColor={theme.colors.text}
          />
        ))}
      </View>
      <Animated.Text
        style={[stepStyles.tileLabel, { color: theme.colors.text }, labelStyle]}
      >
        {label}
      </Animated.Text>
    </View>
  );
}

function HowItWorksStep({ active }: { active: boolean }) {
  return (
    <View
      style={stepStyles.howItWorksContainer}
      accessibilityLabel="How it works: learn tile colors"
      accessibilityRole="text"
    >
      <TileExample
        letters={['W', 'E', 'A', 'R', 'Y']}
        statuses={['correct', '', '', '', '']}
        label="Purple = locked in. The letter is exactly right."
        delay={0}
        active={active}
      />
      <TileExample
        letters={['S', 'T', 'O', 'R', 'M']}
        statuses={['', '', 'present', '', '']}
        label="Pink = close vibe. Right letter, wrong spot."
        delay={1200}
        active={active}
      />
      <TileExample
        letters={['G', 'L', 'O', 'W', 'S']}
        statuses={['', '', 'absent', '', '']}
        label="Slate = no vibe. Not in the word."
        delay={2400}
        active={active}
      />
    </View>
  );
}

// --- Step 3: Vibe Meter ---

function VibeMeterStep({ active }: { active: boolean }) {
  const { theme } = useAppSelector((state) => state.theme);
  const reduceMotion = isReduceMotionEnabled();

  const diameter = 140;
  const strokeWidth = 10;
  const radius = (diameter - strokeWidth) / 2;
  const arcLength = Math.PI * radius;
  const cx = diameter / 2;
  const cy = diameter / 2;

  const startX = cx - radius;
  const endX = cx + radius;
  const arcPath = `M ${startX} ${cy} A ${radius} ${radius} 0 0 1 ${endX} ${cy}`;

  const textOpacity = useSharedValue(reduceMotion ? 1 : 0);
  const [displayNum, setDisplayNum] = useState(0);

  useEffect(() => {
    if (!active) return;
    if (reduceMotion) {
      setDisplayNum(75);
      textOpacity.value = 1;
      return;
    }

    textOpacity.value = withDelay(2100, withTiming(1, { duration: 500 }));

    let frame: number;
    const startTime = Date.now();
    const duration = 1500;
    const delayMs = 400;

    const animate = () => {
      const elapsed = Date.now() - startTime - delayMs;
      if (elapsed < 0) {
        frame = requestAnimationFrame(animate);
        return;
      }
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayNum(Math.round(eased * 75));
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [active, reduceMotion]);

  const dashOffset = arcLength * (1 - displayNum / 100);

  const descriptionStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const svgHeight = diameter / 2 + strokeWidth;

  return (
    <View
      style={stepStyles.vibeMeterContainer}
      accessibilityLabel="Vibe Meter demo showing 75% score"
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: displayNum }}
    >
      <View style={[stepStyles.meterWrapper, { width: diameter }]}>
        <Svg width={diameter} height={svgHeight} viewBox={`0 0 ${diameter} ${svgHeight}`}>
          <Path
            d={arcPath}
            stroke={theme.colors.background2}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d={arcPath}
            stroke={getVibeColor(displayNum)}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${arcLength}`}
            strokeDashoffset={`${dashOffset}`}
          />
        </Svg>
        <View style={[stepStyles.meterScore, { top: svgHeight * 0.3, width: diameter }]}>
          <Text style={[stepStyles.meterScoreText, { color: theme.colors.text }]}>
            {displayNum}
          </Text>
        </View>
        <Text style={[stepStyles.meterLabel, { color: theme.colors.secondary }]}>
          VIBE
        </Text>
      </View>

      <Animated.Text
        style={[
          stepStyles.vibeMeterDescription,
          { color: theme.colors.text },
          descriptionStyle,
        ]}
      >
        Watch your vibe rise as you get closer!
      </Animated.Text>
    </View>
  );
}

function getVibeColor(score: number): string {
  if (score >= 80) return '#7C4DFF';
  if (score >= 60) return '#FF9100';
  if (score >= 40) return '#FFD600';
  if (score >= 20) return '#00BFA5';
  return '#40C4FF';
}

// --- Step 4: Ready ---

function ReadyStep({
  active,
  onSelectMode,
}: {
  active: boolean;
  onSelectMode: (mode: 'daily' | 'unlimited') => void;
}) {
  const { theme } = useAppSelector((state) => state.theme);
  const reduceMotion = isReduceMotionEnabled();
  const buttonsOpacity = useSharedValue(reduceMotion ? 1 : 0);
  const buttonsTranslateY = useSharedValue(reduceMotion ? 0 : 30);

  useEffect(() => {
    if (!active) return;
    if (reduceMotion) {
      buttonsOpacity.value = 1;
      buttonsTranslateY.value = 0;
      return;
    }
    buttonsOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
    buttonsTranslateY.value = withDelay(
      300,
      withSpring(0, { damping: 15, stiffness: 120 })
    );
  }, [active]);

  const buttonsStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    transform: [{ translateY: buttonsTranslateY.value }],
  }));

  return (
    <View style={stepStyles.readyContainer}>
      <Ionicons
        name="rocket"
        size={56}
        color={colors.correct}
        style={stepStyles.readyIcon}
      />
      <Text
        style={[stepStyles.readyTitle, { color: theme.colors.text }]}
        accessibilityRole="header"
      >
        Ready?
      </Text>
      <Text style={[stepStyles.readySubtitle, { color: theme.colors.secondary }]}>
        Choose your challenge
      </Text>

      <Animated.View style={[stepStyles.modeButtons, buttonsStyle]}>
        <TouchableOpacity
          style={[stepStyles.modeButton, { backgroundColor: colors.correct }]}
          onPress={() => onSelectMode('daily')}
          accessibilityLabel="Start Daily Challenge"
          accessibilityRole="button"
        >
          <Ionicons name="calendar" size={24} color="#fff" />
          <Text style={stepStyles.modeButtonText}>Daily Challenge</Text>
          <Text style={stepStyles.modeButtonSub}>Same word for everyone</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[stepStyles.modeButton, { backgroundColor: colors.present }]}
          onPress={() => onSelectMode('unlimited')}
          accessibilityLabel="Start Unlimited mode"
          accessibilityRole="button"
        >
          <Ionicons name="infinite" size={24} color="#fff" />
          <Text style={stepStyles.modeButtonText}>Unlimited</Text>
          <Text style={stepStyles.modeButtonSub}>Play as many as you want</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// --- Main Onboarding ---

export default function Onboarding({ onComplete, forceShow = false }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(forceShow);
  const { theme } = useAppSelector((state) => state.theme);
  const reduceMotion = isReduceMotionEnabled();

  const contentOpacity = useSharedValue(1);
  const contentTranslateY = useSharedValue(0);

  useEffect(() => {
    if (!forceShow) {
      checkOnboardingStatus();
    } else {
      setVisible(true);
    }
  }, [forceShow]);

  const checkOnboardingStatus = async () => {
    const completed = await getStoreData(ONBOARDING_COMPLETE_KEY);
    if (!completed) {
      setVisible(true);
    } else {
      onComplete();
    }
  };

  const handleComplete = useCallback(async () => {
    if (!forceShow) {
      await setStoreData(ONBOARDING_COMPLETE_KEY, 'true');
    }
    playHaptic('correct');
    setVisible(false);
    onComplete();
  }, [forceShow, onComplete]);

  const handleSkip = useCallback(() => {
    playHaptic('keyPress');
    handleComplete();
  }, [handleComplete]);

  const handleNext = useCallback(() => {
    playHaptic('keyPress');
    if (currentStep < TOTAL_STEPS - 1) {
      if (reduceMotion) {
        setCurrentStep((s) => s + 1);
        return;
      }
      contentOpacity.value = withTiming(0, { duration: 200 });
      contentTranslateY.value = withTiming(-30, { duration: 200 }, () => {
        runOnJS(setCurrentStep)(currentStep + 1);
        contentTranslateY.value = 30;
        contentOpacity.value = withTiming(1, { duration: 300 });
        contentTranslateY.value = withSpring(0, { damping: 15, stiffness: 120 });
      });
    }
  }, [currentStep, reduceMotion, contentOpacity, contentTranslateY]);

  const handleModeSelect = useCallback(
    (_mode: 'daily' | 'unlimited') => {
      playHaptic('correct');
      handleComplete();
    },
    [handleComplete]
  );

  const contentAnimStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const themedOverlay = {
    backgroundColor: theme.dark ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.98)',
  };

  if (!visible) return null;

  const isLastStep = currentStep === TOTAL_STEPS - 1;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={[styles.overlay, themedOverlay]}>
        {/* Skip button - top right, not on last step */}
        {!isLastStep && (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            accessibilityLabel="Skip tutorial"
            accessibilityRole="button"
          >
            <Text style={[styles.skipText, { color: theme.colors.secondary }]}>Skip</Text>
          </TouchableOpacity>
        )}

        {/* Progress dots */}
        <View
          style={styles.dotsContainer}
          accessibilityLabel={`Step ${currentStep + 1} of ${TOTAL_STEPS}`}
          accessibilityRole="text"
        >
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentStep
                  ? { backgroundColor: colors.correct, width: 24 }
                  : { backgroundColor: theme.colors.background2 },
              ]}
            />
          ))}
        </View>

        {/* Step content */}
        <Animated.View style={[styles.content, contentAnimStyle]}>
          {currentStep === 0 && <WelcomeStep active={currentStep === 0} />}
          {currentStep === 1 && <HowItWorksStep active={currentStep === 1} />}
          {currentStep === 2 && <VibeMeterStep active={currentStep === 2} />}
          {currentStep === 3 && (
            <ReadyStep active={currentStep === 3} onSelectMode={handleModeSelect} />
          )}
        </Animated.View>

        {/* Step title for steps 1 and 2 */}
        {(currentStep === 1 || currentStep === 2) && (
          <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
            {currentStep === 1 ? 'How it works' : 'Your Vibe Meter'}
          </Text>
        )}

        {/* Next button - not on last step (Ready has its own buttons) */}
        {!isLastStep && (
          <View style={styles.bottomContainer}>
            {currentStep === 0 ? (
              <TouchableOpacity
                style={styles.letsPlayButton}
                onPress={handleNext}
                accessibilityLabel="Let's Play - continue to tutorial"
                accessibilityRole="button"
              >
                <Text style={styles.letsPlayText}>Let&apos;s Play</Text>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNext}
                accessibilityLabel="Next step"
                accessibilityRole="button"
              >
                <Text style={styles.nextButtonText}>Next</Text>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        )}
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

// Export for testing
export { ONBOARDING_COMPLETE_KEY, TOTAL_STEPS, getVibeColor, AnimatedLetter, AnimatedTileCell };

// --- Styles ---

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 15,
    fontFamily: 'Montserrat_600SemiBold',
  },
  dotsContainer: {
    position: 'absolute',
    top: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 16,
  },
  bottomContainer: {
    paddingBottom: 48,
    alignItems: 'center',
  },
  letsPlayButton: {
    backgroundColor: colors.correct,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingLeft: 32,
    paddingRight: 24,
    borderRadius: 30,
    gap: 8,
  },
  letsPlayText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Montserrat_700Bold',
  },
  nextButton: {
    backgroundColor: colors.correct,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingLeft: 28,
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

const stepStyles = StyleSheet.create({
  // Welcome
  welcomeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  logoLetter: {
    fontSize: 42,
    fontFamily: 'Montserrat_800ExtraBold',
    marginHorizontal: 2,
  },
  tagline: {
    fontSize: 18,
    fontFamily: 'Montserrat_600SemiBold',
    fontStyle: 'italic',
  },

  // How It Works
  howItWorksContainer: {
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 8,
  },
  tileExampleBlock: {
    alignItems: 'center',
    gap: 8,
  },
  tilesRow: {
    flexDirection: 'row',
    gap: 4,
  },
  tile: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  tileLetter: {
    fontSize: 20,
    fontFamily: 'Montserrat_800ExtraBold',
  },
  tileLabel: {
    fontSize: 13,
    fontFamily: 'Montserrat_600SemiBold',
    textAlign: 'center',
    paddingHorizontal: 8,
  },

  // Vibe Meter
  vibeMeterContainer: {
    alignItems: 'center',
    gap: 24,
  },
  meterWrapper: {
    alignItems: 'center',
  },
  meterScore: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  meterScoreText: {
    fontSize: 32,
    fontFamily: 'Montserrat_800ExtraBold',
  },
  meterLabel: {
    fontSize: 11,
    fontFamily: 'Montserrat_700Bold',
    letterSpacing: 2,
    marginTop: 4,
  },
  vibeMeterDescription: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    textAlign: 'center',
  },

  // Ready
  readyContainer: {
    alignItems: 'center',
    gap: 8,
  },
  readyIcon: {
    marginBottom: 8,
  },
  readyTitle: {
    fontSize: 32,
    fontFamily: 'Montserrat_800ExtraBold',
  },
  readySubtitle: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 24,
  },
  modeButtons: {
    gap: 16,
    width: '100%',
    maxWidth: 300,
  },
  modeButton: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 4,
  },
  modeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Montserrat_700Bold',
  },
  modeButtonSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontFamily: 'Montserrat_600SemiBold',
  },
});
