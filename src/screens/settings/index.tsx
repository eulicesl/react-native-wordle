import React, { useEffect, useState } from 'react';

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
  setSettings,
} from '../../store/slices/settingsSlice';
import { resetStatistics } from '../../store/slices/statisticsSlice';
import { setLightTheme, setDarkTheme } from '../../store/slices/themeSlice';
import {
  setStoreData,
  saveSettings,
  saveTheme,
  clearStatistics,
  loadSettings,
} from '../../utils/localStorageFuncs';
import { dynamicFontSize } from '../../utils/responsive';
import { toggleSounds } from '../../utils/sounds';
import { SETTINGS as SETTINGS_STRINGS } from '../../utils/strings';
import Onboarding, { resetOnboarding } from '../../components/Onboarding';

export default function Settings() {
  const [showTutorial, setShowTutorial] = useState(false);
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((state) => state.theme);
  const { gameLanguage, gameStarted } = useAppSelector((state) => state.gameState);
  const { hardMode, highContrastMode, hapticFeedback, soundEnabled } = useAppSelector(
    (state) => state.settings
  );

  useEffect(() => {
    const loadSavedSettings = async () => {
      const saved = await loadSettings();
      if (saved) {
        dispatch(setSettings(saved));
      }
    };
    loadSavedSettings();
  }, [dispatch]);

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
    const newIsDark = !theme.dark;
    if (newIsDark) {
      dispatch(setDarkTheme());
    } else {
      dispatch(setLightTheme());
    }
    saveTheme(newIsDark);
  };

  const handleHardModeToggle = (value: boolean) => {
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
    dispatch(setHighContrastMode(value));
    saveSettings({ hardMode, highContrastMode: value, hapticFeedback, soundEnabled });
  };

  const handleHapticToggle = (value: boolean) => {
    dispatch(setHapticFeedback(value));
    saveSettings({ hardMode, highContrastMode, hapticFeedback: value, soundEnabled });
  };

  const handleSoundToggle = (value: boolean) => {
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
      <Text style={[styles.title, themedStyles.text, { fontSize: dynamicFontSize(24, 1.3) }]} allowFontScaling={false}>{SETTINGS_STRINGS.title}</Text>

      {/* Language Section */}
      <Text style={[styles.sectionTitle, themedStyles.secondaryText]}>
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
      <Text style={[styles.sectionTitle, themedStyles.secondaryText]}>
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
      <Text style={[styles.sectionTitle, themedStyles.secondaryText]}>
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
      <Text style={[styles.sectionTitle, themedStyles.secondaryText]}>
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
          <Ionicons name="trash-outline" size={20} color="#FF453A" />
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
        <Text style={[styles.aboutText, themedStyles.secondaryText, { fontSize: dynamicFontSize(12) }]} allowFontScaling={false}>
          WordVibe v{Constants.expoConfig?.version ?? 'unknown'}
        </Text>
        <Text style={[styles.aboutText, themedStyles.secondaryText, { fontSize: dynamicFontSize(12) }]} allowFontScaling={false}>
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
          <Text style={[styles.settingTitle, themedStyles.text, { fontSize: dynamicFontSize(16) }]} allowFontScaling={false}>{title}</Text>
        </View>
        <Text style={[styles.settingDescription, themedStyles.secondaryText, { fontSize: dynamicFontSize(12) }]} allowFontScaling={false}>
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
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Montserrat_700Bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Montserrat_700Bold',
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 10,
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: 12,
    padding: 4,
    marginBottom: 10,
  },
  languageButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 4,
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
    padding: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
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
    marginTop: 4,
    marginLeft: 30,
  },
  divider: {
    height: 1,
    marginHorizontal: 12,
  },
  dataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  dataButtonText: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    marginLeft: 8,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  dangerButtonText: {
    color: '#FF453A',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    marginLeft: 8,
  },
  aboutSection: {
    marginTop: 30,
    alignItems: 'center',
  },
  aboutText: {
    fontSize: 12,
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 4,
  },
});
