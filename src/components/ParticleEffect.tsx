import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withSequence,
  withRepeat,
  runOnJS,
  Easing,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Particle configuration
interface ParticleConfig {
  x: number;
  y: number;
  size: number;
  color: string;
  velocity: { x: number; y: number };
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  type: 'confetti' | 'star' | 'circle' | 'square';
}

// Generate random number in range
function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// Victory confetti colors
const CONFETTI_COLORS = [
  '#6aaa64', // Green (correct)
  '#c9b458', // Yellow (present)
  '#FFD700', // Gold
  '#FF6B6B', // Coral
  '#4ECDC4', // Teal
  '#9B59B6', // Purple
  '#3498DB', // Blue
  '#E74C3C', // Red
];

// Single particle component
const Particle: React.FC<{
  config: ParticleConfig;
  duration: number;
  onComplete?: () => void;
}> = ({ config, duration, onComplete }) => {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(config.opacity);

  useEffect(() => {
    progress.value = withTiming(1, { duration, easing: Easing.out(Easing.quad) }, (finished) => {
      if (finished && onComplete) {
        runOnJS(onComplete)();
      }
    });
    opacity.value = withDelay(
      duration * 0.6,
      withTiming(0, { duration: duration * 0.4 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      progress.value,
      [0, 1],
      [config.x, config.x + config.velocity.x],
      Extrapolation.CLAMP
    );

    const translateY = interpolate(
      progress.value,
      [0, 1],
      [config.y, config.y + config.velocity.y + progress.value * progress.value * 200], // Gravity
      Extrapolation.CLAMP
    );

    const rotate = interpolate(
      progress.value,
      [0, 1],
      [config.rotation, config.rotation + config.rotationSpeed * 360],
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      progress.value,
      [0, 0.2, 1],
      [0, 1, 0.5],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX },
        { translateY },
        { rotate: `${rotate}deg` },
        { scale },
      ],
      opacity: opacity.value,
    };
  });

  const getParticleShape = () => {
    switch (config.type) {
      case 'star':
        return {
          width: config.size,
          height: config.size,
          backgroundColor: config.color,
          transform: [{ rotate: '45deg' }],
        };
      case 'circle':
        return {
          width: config.size,
          height: config.size,
          borderRadius: config.size / 2,
          backgroundColor: config.color,
        };
      case 'square':
        return {
          width: config.size,
          height: config.size,
          backgroundColor: config.color,
        };
      case 'confetti':
      default:
        return {
          width: config.size,
          height: config.size * 2,
          backgroundColor: config.color,
          borderRadius: 2,
        };
    }
  };

  return <Animated.View style={[styles.particle, getParticleShape(), animatedStyle]} />;
};

// Confetti explosion effect
export const ConfettiExplosion: React.FC<{
  active: boolean;
  particleCount?: number;
  duration?: number;
  origin?: { x: number; y: number };
  spread?: number;
  onComplete?: () => void;
}> = ({
  active,
  particleCount = 50,
  duration = 2000,
  origin = { x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 3 },
  spread = 150,
  onComplete,
}) => {
  const [particles, setParticles] = React.useState<ParticleConfig[]>([]);
  const completedCount = useRef(0);

  useEffect(() => {
    if (active) {
      completedCount.current = 0;
      const newParticles: ParticleConfig[] = [];

      for (let i = 0; i < particleCount; i++) {
        const angle = randomRange(0, Math.PI * 2);
        const velocity = randomRange(50, spread);

        newParticles.push({
          x: origin.x,
          y: origin.y,
          size: randomRange(6, 14),
          color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)] ?? '#6aaa64',
          velocity: {
            x: Math.cos(angle) * velocity,
            y: Math.sin(angle) * velocity - randomRange(100, 200), // Initial upward velocity
          },
          rotation: randomRange(0, 360),
          rotationSpeed: randomRange(1, 4) * (Math.random() > 0.5 ? 1 : -1),
          opacity: 1,
          type: ['confetti', 'star', 'circle', 'square'][Math.floor(Math.random() * 4)] as ParticleConfig['type'],
        });
      }

      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [active, particleCount, origin.x, origin.y, spread]);

  const handleParticleComplete = () => {
    completedCount.current++;
    if (completedCount.current >= particles.length && onComplete) {
      onComplete();
    }
  };

  if (!active || particles.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((particle, index) => (
        <Particle
          key={index}
          config={particle}
          duration={duration}
          onComplete={index === 0 ? handleParticleComplete : undefined}
        />
      ))}
    </View>
  );
};

// Sparkle effect for achievements
export const SparkleEffect: React.FC<{
  active: boolean;
  color?: string;
  size?: number;
}> = ({ active, color = '#FFD700', size = 20 }) => {
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (active) {
      scale.value = withSequence(
        withSpring(1.2, { damping: 5 }),
        withSpring(1, { damping: 10 })
      );
      rotation.value = withRepeat(
        withTiming(360, { duration: 3000, easing: Easing.linear }),
        -1,
        false
      );
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.sparkle, { width: size, height: size }, animatedStyle]}>
      <View style={[styles.sparkleRay, styles.sparkleHorizontal, { backgroundColor: color }]} />
      <View style={[styles.sparkleRay, styles.sparkleVertical, { backgroundColor: color }]} />
      <View style={[styles.sparkleRay, styles.sparkleDiagonal1, { backgroundColor: color }]} />
      <View style={[styles.sparkleRay, styles.sparkleDiagonal2, { backgroundColor: color }]} />
    </Animated.View>
  );
};

// Pulsing glow effect
export const PulseGlow: React.FC<{
  active: boolean;
  color?: string;
  size?: number;
  children?: React.ReactNode;
}> = ({ active, color = '#6aaa64', size = 100, children }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (active) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        true
      );
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.4, { duration: 800 }),
          withTiming(0.1, { duration: 800 })
        ),
        -1,
        true
      );
    } else {
      scale.value = withTiming(1);
      opacity.value = withTiming(0);
    }
  }, [active]);

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.pulseContainer}>
      <Animated.View
        style={[
          styles.pulseGlow,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
          glowStyle,
        ]}
      />
      {children}
    </View>
  );
};

// Ripple effect for button presses
export const RippleEffect: React.FC<{
  active: boolean;
  color?: string;
  size?: number;
  onComplete?: () => void;
}> = ({ active, color = 'rgba(255,255,255,0.3)', size = 60, onComplete }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (active) {
      scale.value = 0;
      opacity.value = 1;
      scale.value = withTiming(1, { duration: 400 }, (finished) => {
        if (finished && onComplete) {
          runOnJS(onComplete)();
        }
      });
      opacity.value = withTiming(0, { duration: 400 });
    }
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * 2 }],
    opacity: opacity.value,
  }));

  if (!active) return null;

  return (
    <Animated.View
      style={[
        styles.ripple,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
      pointerEvents="none"
    />
  );
};

// Floating animation for UI elements
export const FloatingView: React.FC<{
  children: React.ReactNode;
  amplitude?: number;
  duration?: number;
}> = ({ children, amplitude = 5, duration = 2000 }) => {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-amplitude, { duration: duration / 2, easing: Easing.inOut(Easing.sin) }),
        withTiming(amplitude, { duration: duration / 2, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, [amplitude, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

// Shake animation for errors
export const ShakeView: React.FC<{
  active: boolean;
  children: React.ReactNode;
  intensity?: number;
  onComplete?: () => void;
}> = ({ active, children, intensity = 10, onComplete }) => {
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (active) {
      translateX.value = withSequence(
        withTiming(-intensity, { duration: 50 }),
        withTiming(intensity, { duration: 50 }),
        withTiming(-intensity, { duration: 50 }),
        withTiming(intensity, { duration: 50 }),
        withTiming(0, { duration: 50 }, (finished) => {
          if (finished && onComplete) {
            runOnJS(onComplete)();
          }
        })
      );
    }
  }, [active, intensity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

// Bounce animation for success
export const BounceView: React.FC<{
  active: boolean;
  children: React.ReactNode;
  onComplete?: () => void;
}> = ({ active, children, onComplete }) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (active) {
      scale.value = withSequence(
        withSpring(1.2, { damping: 5 }),
        withSpring(0.9, { damping: 5 }),
        withSpring(1.1, { damping: 5 }),
        withSpring(1, { damping: 10 }, (finished) => {
          if (finished && onComplete) {
            runOnJS(onComplete)();
          }
        })
      );
    }
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  particle: {
    position: 'absolute',
  },
  sparkle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkleRay: {
    position: 'absolute',
    borderRadius: 2,
  },
  sparkleHorizontal: {
    width: '100%',
    height: 4,
  },
  sparkleVertical: {
    width: 4,
    height: '100%',
  },
  sparkleDiagonal1: {
    width: 4,
    height: '70%',
    transform: [{ rotate: '45deg' }],
  },
  sparkleDiagonal2: {
    width: 4,
    height: '70%',
    transform: [{ rotate: '-45deg' }],
  },
  pulseContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseGlow: {
    position: 'absolute',
  },
  ripple: {
    position: 'absolute',
  },
});

export default ConfettiExplosion;
