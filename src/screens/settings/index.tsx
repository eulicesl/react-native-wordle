import React, { useState } from 'react';

import { Ionicons } from '@expo/vector-icons';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';

import Constants from 'expo-constants';

import { useAppSelector, useAppDispatch } from '../../hooks/storeHooks';
import {
  setGameLanguage,
  setGameStarted,
} from '../../store/slices/gameStateSlice';
import {
  setHardMode,
  setHighContrastMode,
  setHapticFeedback,
  setSoundEnabled,
} from '../../store/slices/settingsSlice';
import { resetStatistics } from '../../store/slices/statisticsSlice';
import { setLightTheme, setDarkTheme } from '../../store/slices/themeSlice';
import { colors } from '../../utils/constants';
import {
  setStoreData,
  saveSettings,
  saveTheme,
  clearStatistics,
} from '../../utils/localStorageFuncs';
import { spacing, space3, space5, space10 } from '../../utils/spacing';
import { playHaptic } from '../../utils/haptics';
import { toggleSounds } from '../../utils/sounds';
import { SETTINGS as SETTINGS_STRINGS } from '../../utils/strings';
import { typography } from '../../utils/typography';
import Onboarding, { resetOnboarding } from '../../components/Onboarding';

export default function Settings() {
  const [showTutorial, setShowTutorial] = useState(false);
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((state) => state.theme);
  const { gameLanguage, gameStarted } = useAppSelector((state) => state.gameState);
  const { hardMode, highContrastMode, hapticFeedback, soundEnabled } = useAppSelector(
    (state) => state.settings
  );

  // Settings are loaded once at app startup in main/index.tsx.
  // No need to re-load here; trust Redux state.

  const themedStyles = {
    container: {
      backgroundColor: theme.colors.background,
    },
    text: {
      color: theme.colors.text,
    },
    secondaryText: {
      color: theme.colors.secondary,
    },
    card: {
      backgroundColor: theme.colors.background2,
    },
    border: {
      borderColor: theme.colors.tertiary,
    },
  };

  const resetGame = () => {
    dispatch(setGameStarted(false));
  };

  const handleLanguageChange = (lang: 'en' | 'tr') => {
    dispatch(setGameLanguage(lang));
    setStoreData('language', lang);
    resetGame();
  };

  const handleThemeToggle = () => {
    playHaptic('toggle');
    const newIsDark = !theme.dark;
    if (newIsDark) {
      dispatch(setDarkTheme());
    } else {
      dispatch(setLightTheme());
    }
    saveTheme(newIsDark);
  };

  const handleHardModeToggle = (value: boolean) => {
    playHaptic('toggle');
    if (value && gameStarted) {
      Alert.alert(
        SETTINGS_STRINGS.hardMode,
        SETTINGS_STRINGS.hardModeAlert,
        [{ text: 'OK' }]
      );
      return;
    }
    dispatch(setHardMode(value));
    saveSettings({ hardMode: value, highContrastMode, hapticFeedback, soundEnabled });
  };

  const handleHighContrastToggle = (value: boolean) => {
    playHaptic('toggle');
    dispatch(setHighContrastMode(value));
    saveSettings({ hardMode, highContrastMode: value, hapticFeedback, soundEnabled });
  };

  const handleHapticToggle = (value: boolean) => {
    playHaptic('toggle');
    dispatch(setHapticFeedback(value));
    saveSettings({ hardMode, highContrastMode, hapticFeedback: value, soundEnabled });
  };

  const handleSoundToggle = (value: boolean) => {
    playHaptic('toggle');
    dispatch(setSoundEnabled(value));
    toggleSounds(value);
    saveSettings({ hardMode, highContrastMode, hapticFeedback, soundEnabled: value });
  };

  const handleReplayTutorial = async () => {
    await resetOnboarding();
    setShowTutorial(true);
  };

  const handleResetStatistics = () => {
    Alert.alert(
      SETTINGS_STRINGS.resetStatistics,
      SETTINGS_STRINGS.resetStatisticsConfirm,
      [
        { text: SETTINGS_STRINGS.cancel, style: 'cancel' },
        {
          text: SETTINGS_STRINGS.reset,
          style: 'destructive',
          onPress: () => {
            dispatch(resetStatistics());
            clearStatistics();
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, themedStyles.container]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.title, themedStyles.text]}>{SETTINGS_STRINGS.title}</Text>

      {/* Language Section */}
      <Text style={[typography.bodySmall, styles.sectionTitle, themedStyles.secondaryText]}>
        {SETTINGS_STRINGS.language}
      </Text>
      <View style={[styles.card, themedStyles.card]}>
        <TouchableOpacity
          style={[
            styles.languageButton,
            gameLanguage === 'en' && styles.languageButtonActive,
          ]}
          onPress={() => handleLanguageChange('en')}
        >
          <Text
            style={[
              styles.languageButtonText,
              gameLanguage === 'en'
                ? styles.languageButtonTextActive
                : themedStyles.text,
            ]}
          >
            English
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.languageButton,
            gameLanguage === 'tr' && styles.languageButtonActive,
          ]}
          onPress={() => handleLanguageChange('tr')}
        >
          <Text
            style={[
              styles.languageButtonText,
              gameLanguage === 'tr'
                ? styles.languageButtonTextActive
                : themedStyles.text,
            ]}
          >
            Türkçe
          </Text>
        </TouchableOpacity>
      </View>

      {/* Appearance Section */}
      <Text style={[typography.bodySmall, styles.sectionTitle, themedStyles.secondaryText]}>
        {SETTINGS_STRINGS.appearance}
      </Text>
      <View style={[styles.card, themedStyles.card]}>
        <SettingRow
          icon="moon"
          title={SETTINGS_STRINGS.darkTheme}
          description={SETTINGS_STRINGS.darkThemeDesc}
          value={theme.dark}
          onToggle={handleThemeToggle}
          themedStyles={themedStyles}
        />
        <View style={[styles.divider, themedStyles.border]} />
        <SettingRow
          icon="contrast"
          title={SETTINGS_STRINGS.highContrastMode}
          description={SETTINGS_STRINGS.highContrastDesc}
          value={highContrastMode}
          onToggle={handleHighContrastToggle}
          themedStyles={themedStyles}
        />
      </View>

      {/* Gameplay Section */}
      <Text style={[typography.bodySmall, styles.sectionTitle, themedStyles.secondaryText]}>
        {SETTINGS_STRINGS.gameplay}
      </Text>
      <View style={[styles.card, themedStyles.card]}>
        <SettingRow
          icon="flame"
          title={SETTINGS_STRINGS.hardMode}
          description={SETTINGS_STRINGS.hardModeDesc}
          value={hardMode}
          onToggle={handleHardModeToggle}
          themedStyles={themedStyles}
        />
        <View style={[styles.divider, themedStyles.border]} />
        <SettingRow
          icon="phone-portrait"
          title={SETTINGS_STRINGS.hapticFeedback}
          description={SETTINGS_STRINGS.hapticDesc}
          value={hapticFeedback}
          onToggle={handleHapticToggle}
          themedStyles={themedStyles}
        />
        <View style={[styles.divider, themedStyles.border]} />
        <SettingRow
          icon="volume-high"
          title={SETTINGS_STRINGS.soundEffects}
          description={SETTINGS_STRINGS.soundDesc}
          value={soundEnabled}
          onToggle={handleSoundToggle}
          themedStyles={themedStyles}
        />
      </View>

      {/* Data Section */}
      <Text style={[typography.bodySmall, styles.sectionTitle, themedStyles.secondaryText]}>
        {SETTINGS_STRINGS.data}
      </Text>
      <View style={[styles.card, themedStyles.card]}>
        <TouchableOpacity
          style={styles.dataButton}
          onPress={handleReplayTutorial}
        >
          <Ionicons name="book-outline" size={20} color={themedStyles.text.color} />
          <Text style={[styles.dataButtonText, themedStyles.text]}>{SETTINGS_STRINGS.replayTutorial}</Text>
        </TouchableOpacity>
        <View style={[styles.divider, themedStyles.border]} />
        <TouchableOpacity
          style={styles.dangerButton}
          onPress={handleResetStatistics}
        >
          <Ionicons name="trash-outline" size={20} color={colors.error} />
          <Text style={styles.dangerButtonText}>{SETTINGS_STRINGS.resetStatistics}</Text>
        </TouchableOpacity>
      </View>

      {/* Tutorial overlay */}
      {showTutorial && (
        <Onboarding
          onComplete={() => setShowTutorial(false)}
          forceShow={true}
        />
      )}

      {/* About */}
      <View style={styles.aboutSection}>
        <Text style={[styles.aboutText, themedStyles.secondaryText]}>
          WordVibe v{Constants.expoConfig?.version ?? 'unknown'}
        </Text>
        <Text style={[styles.aboutText, themedStyles.secondaryText]}>
          {SETTINGS_STRINGS.createdBy}
        </Text>
      </View>
    </ScrollView>
  );
}

interface SettingRowProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  description: string;
  value: boolean;
  onToggle: (value: boolean) => void;
  themedStyles: {
    text: { color: string };
    secondaryText: { color: string };
  };
}

function SettingRow({
  icon,
  title,
  description,
  value,
  onToggle,
  themedStyles,
}: SettingRowProps) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <View style={styles.settingTitleRow}>
          <Ionicons
            name={icon}
            size={20}
            color={themedStyles.text.color}
            style={styles.settingIcon}
          />
          <Text style={[styles.settingTitle, themedStyles.text]}>{title}</Text>
        </View>
        <Text style={[styles.settingDescription, themedStyles.secondaryText]}>
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#767577', true: '#7C4DFF' }}
        thumbColor={value ? '#fff' : '#f4f3f4'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: space5,
    paddingTop: 60,
    paddingBottom: space10,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Montserrat_700Bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  sectionTitle: {
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 10,
    marginTop: 10,
    paddingHorizontal: spacing.xs,
  },
  card: {
    borderRadius: space3,
    padding: spacing.xs,
    marginBottom: 10,
  },
  languageButton: {
    padding: spacing.md,
    borderRadius: spacing.sm,
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  languageButtonActive: {
    backgroundColor: '#7C4DFF',
  },
  languageButtonText: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
  languageButtonTextActive: {
    color: '#fff',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: space3,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 10,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
  settingDescription: {
    fontSize: 12,
    fontFamily: 'Montserrat_600SemiBold',
    marginTop: spacing.xs,
    marginLeft: 30,
  },
  divider: {
    height: 1,
    marginHorizontal: space3,
  },
  dataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  dataButtonText: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    marginLeft: spacing.sm,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  dangerButtonText: {
    color: colors.error,
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    marginLeft: spacing.sm,
  },
  aboutSection: {
    marginTop: 30,
    alignItems: 'center',
  },
  aboutText: {
    fontSize: 12,
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: spacing.xs,
  },
});
