import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { useAppSelector } from '../hooks/storeHooks';
import { colors } from '../utils/constants';
import { HINTS } from '../utils/strings';

interface HintButtonProps {
  hintsUsed: number;
  maxHints: number;
  disabled: boolean;
  onPress: () => void;
}

const HINT_COLORS = {
  active: colors.warning,
  disabled: colors.disabled,
};

export default function HintButton({ hintsUsed, maxHints, disabled, onPress }: HintButtonProps) {
  const { theme } = useAppSelector((state) => state.theme);
  const remaining = maxHints - hintsUsed;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: theme.colors.background2 },
        disabled && styles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={`${HINTS.useHint}. ${remaining} ${HINTS.hintsRemaining}.`}
      accessibilityRole="button"
    >
      <Ionicons
        name="bulb-outline"
        size={16}
        color={disabled ? theme.colors.secondary : HINT_COLORS.active}
      />
      <Text
        style={[
          styles.text,
          { color: disabled ? theme.colors.secondary : theme.colors.text },
        ]}
      >
        {HINTS.hint}
      </Text>
      <View style={[styles.badge, { backgroundColor: disabled ? HINT_COLORS.disabled : HINT_COLORS.active }]}>
        <Text style={styles.badgeText}>{remaining}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 13,
    fontFamily: 'Montserrat_600SemiBold',
  },
  badge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'Montserrat_700Bold',
  },
});
