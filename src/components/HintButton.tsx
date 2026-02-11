import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { useAppSelector } from '../hooks/storeHooks';

interface HintButtonProps {
  hintsUsed: number;
  maxHints: number;
  disabled: boolean;
  onPress: () => void;
}

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
      accessibilityLabel={`Use hint. ${remaining} remaining.`}
      accessibilityRole="button"
    >
      <Ionicons
        name="bulb-outline"
        size={16}
        color={disabled ? theme.colors.secondary : '#FF9500'}
      />
      <Text
        style={[
          styles.text,
          { color: disabled ? theme.colors.secondary : theme.colors.text },
        ]}
      >
        Hint
      </Text>
      <View style={[styles.badge, disabled && styles.badgeDisabled]}>
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
    backgroundColor: '#FF9500',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDisabled: {
    backgroundColor: '#606060',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'Montserrat_700Bold',
  },
});
