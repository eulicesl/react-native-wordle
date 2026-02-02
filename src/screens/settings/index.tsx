import React, { useEffect } from 'react';

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

import { useAppSelector, useAppDispatch } from '../../hooks/storeHooks';
import {
  setGameLanguage,
  setGameStarted,
} from '../../store/slices/gameStateSlice';
import {
  setHardMode,
  setHighContrastMode,
  setHapticFeedback,
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

export default function Settings() {
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((state) => state.theme);
  const { gameLanguage, gameStarted } = useAppSelector((state) => state.gameState);
  const { hardMode, highContrastMode, hapticFeedback } = useAppSelector(
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
        'Hard Mode',
        'Hard Mode can only be enabled at the start of a round.',
        [{ text: 'OK' }]
      );
      return;
    }
    dispatch(setHardMode(value));
    saveSettings({ hardMode: value, highContrastMode, hapticFeedback });
  };

  const handleHighContrastToggle = (value: boolean) => {
    dispatch(setHighContrastMode(value));
    saveSettings({ hardMode, highContrastMode: value, hapticFeedback });
  };

  const handleHapticToggle = (value: boolean) => {
    dispatch(setHapticFeedback(value));
    saveSettings({ hardMode, highContrastMode, hapticFeedback: value });
  };

  const handleResetStatistics = () => {
    Alert.alert(
      'Reset Statistics',
      'Are you sure you want to reset all statistics? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
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
      <Text style={[styles.title, themedStyles.text]}>Settings</Text>

      {/* Language Section */}
      <Text style={[styles.sectionTitle, themedStyles.secondaryText]}>
        Language
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
        Appearance
      </Text>
      <View style={[styles.card, themedStyles.card]}>
        <SettingRow
          icon="moon"
          title="Dark Theme"
          description="Reduce eye strain in low light"
          value={theme.dark}
          onToggle={handleThemeToggle}
          themedStyles={themedStyles}
        />
        <View style={[styles.divider, themedStyles.border]} />
        <SettingRow
          icon="contrast"
          title="High Contrast Mode"
          description="Use orange/blue for colorblind accessibility"
          value={highContrastMode}
          onToggle={handleHighContrastToggle}
          themedStyles={themedStyles}
        />
      </View>

      {/* Gameplay Section */}
      <Text style={[styles.sectionTitle, themedStyles.secondaryText]}>
        Gameplay
      </Text>
      <View style={[styles.card, themedStyles.card]}>
        <SettingRow
          icon="flame"
          title="Hard Mode"
          description="Revealed hints must be used"
          value={hardMode}
          onToggle={handleHardModeToggle}
          themedStyles={themedStyles}
        />
        <View style={[styles.divider, themedStyles.border]} />
        <SettingRow
          icon="phone-portrait"
          title="Haptic Feedback"
          description="Vibrate on key press"
          value={hapticFeedback}
          onToggle={handleHapticToggle}
          themedStyles={themedStyles}
        />
      </View>

      {/* Data Section */}
      <Text style={[styles.sectionTitle, themedStyles.secondaryText]}>
        Data
      </Text>
      <View style={[styles.card, themedStyles.card]}>
        <TouchableOpacity
          style={styles.dangerButton}
          onPress={handleResetStatistics}
        >
          <Ionicons name="trash-outline" size={20} color="#FF453A" />
          <Text style={styles.dangerButtonText}>Reset Statistics</Text>
        </TouchableOpacity>
      </View>

      {/* About */}
      <View style={styles.aboutSection}>
        <Text style={[styles.aboutText, themedStyles.secondaryText]}>
          Wordle Clone v1.0.0
        </Text>
        <Text style={[styles.aboutText, themedStyles.secondaryText]}>
          Made with React Native
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
        trackColor={{ false: '#767577', true: '#6aaa64' }}
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
    backgroundColor: '#6aaa64',
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
