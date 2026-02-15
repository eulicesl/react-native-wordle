import { useEffect, useRef, useState } from 'react';

import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';

import { useAppSelector } from '../hooks/storeHooks';
import { colors } from '../utils/constants';

interface GameTimerProps {
  durationMs: number;
  active: boolean;
  onExpire: () => void;
}

export default function GameTimer({ durationMs, active, onExpire }: GameTimerProps) {
  const { theme } = useAppSelector((state) => state.theme);
  const [remaining, setRemaining] = useState(durationMs);
  const expiredRef = useRef(false);

  useEffect(() => {
    setRemaining(durationMs);
    expiredRef.current = false;
  }, [durationMs]);

  useEffect(() => {
    if (!active) return;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 1000;
        if (next <= 0 && !expiredRef.current) {
          expiredRef.current = true;
          clearInterval(interval);
          onExpire();
          return 0;
        }
        return Math.max(next, 0);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [active, onExpire]);

  const totalSeconds = Math.ceil(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const isLow = remaining <= 30000;
  const isCritical = remaining <= 10000;

  const timerColor = isCritical ? colors.error : isLow ? colors.warning : theme.colors.text;

  return (
    <View style={styles.container}>
      <Ionicons name="timer-outline" size={16} color={timerColor} />
      <Text style={[styles.time, { color: timerColor }]}>
        {minutes}:{seconds.toString().padStart(2, '0')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  time: {
    fontSize: 16,
    fontFamily: 'Montserrat_700Bold',
    fontVariant: ['tabular-nums'],
  },
});
