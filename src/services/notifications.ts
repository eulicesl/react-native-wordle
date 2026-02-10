import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { logError, logInfo, logWarning } from './errorLogging';

import { getStoreData, setStoreData } from '../utils/localStorageFuncs';

// Configure notification handler for foreground notifications
// Note: expo-notifications supports additional platform/version-specific flags in some releases (e.g. iOS banner/list).
// We intentionally stick to the cross-platform baseline fields here for broad compatibility.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Notification settings storage
const NOTIFICATION_SETTINGS_KEY = 'wordvibe_notification_settings';
const NOTIFICATION_HISTORY_KEY = 'wordvibe_notification_history';
const SCHEDULED_IDS_KEY = 'wordvibe_scheduled_notification_ids';

// Notification types
export type NotificationType =
  | 'dailyReminder'
  | 'streakWarning'
  | 'achievementUnlocked'
  | 'weeklyStats'
  | 'newFeature';

// Notification settings
export interface NotificationSettings {
  enabled: boolean;
  dailyReminder: {
    enabled: boolean;
    time: string; // "HH:MM" format
  };
  streakWarning: {
    enabled: boolean;
    warningHours: number; // Hours before midnight to warn
  };
  achievements: boolean;
  weeklyStats: boolean;
}

// Notification content templates
export const NOTIFICATION_TEMPLATES = {
  dailyReminder: {
    title: "Today's WordVibe is ready!",
    messages: [
      'A new word awaits. Can you guess it in 6 tries?',
      'Your daily brain exercise is here. Good luck!',
      'Time to flex those vocabulary muscles!',
      'The daily puzzle is live. How fast can you solve it?',
      "New day, new word. Let's see what you've got!",
    ],
  },
  streakWarning: {
    title: "Don't lose your streak!",
    messages: [
      'Your {streak}-day streak is at risk! Play now to keep it going.',
      'Only a few hours left to maintain your {streak}-day streak!',
      'Hey word master! Your {streak}-day streak needs you.',
    ],
  },
  achievementUnlocked: {
    title: 'Achievement Unlocked! 🏆',
    messages: ["You've earned '{achievement}'! Keep up the great work."],
  },
  weeklyStats: {
    title: 'Your Weekly WordVibe Recap',
    messages: ['You played {games} games this week with a {winRate}% win rate!'],
  },
  newFeature: {
    title: 'New in WordVibe',
    messages: ["Check out what's new in the latest update!"],
  },
};

// Default notification settings
const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  dailyReminder: {
    enabled: true,
    time: '09:00',
  },
  streakWarning: {
    enabled: true,
    warningHours: 4,
  },
  achievements: true,
  weeklyStats: true,
};

// Permission state
let notificationPermissionGranted = false;

// Store scheduled notification IDs
async function storeScheduledId(key: string, id: string): Promise<void> {
  try {
    const stored = await getStoreData(SCHEDULED_IDS_KEY);
    const ids = stored ? JSON.parse(stored) : {};
    ids[key] = id;
    await setStoreData(SCHEDULED_IDS_KEY, JSON.stringify(ids));
  } catch (error) {
    logError('notification', 'Error storing scheduled ID', error);
  }
}

async function getScheduledId(key: string): Promise<string | null> {
  try {
    const stored = await getStoreData(SCHEDULED_IDS_KEY);
    if (stored) {
      const ids = JSON.parse(stored);
      return ids[key] || null;
    }
  } catch (error) {
    logError('notification', 'Error getting scheduled ID', error);
  }
  return null;
}

async function removeScheduledId(key: string): Promise<void> {
  try {
    const stored = await getStoreData(SCHEDULED_IDS_KEY);
    if (stored) {
      const ids = JSON.parse(stored);
      delete ids[key];
      await setStoreData(SCHEDULED_IDS_KEY, JSON.stringify(ids));
    }
  } catch (error) {
    logError('notification', 'Error removing scheduled ID', error);
  }
}

// Initialize notifications
export async function initializeNotifications(): Promise<boolean> {
  try {
    // Request permissions
    const permissionGranted = await requestNotificationPermission();
    if (!permissionGranted) {
      logWarning('notification', 'Notification permission not granted');
      return false;
    }

    // Load settings
    const settings = await getNotificationSettings();

    // Schedule recurring notifications if enabled
    if (settings.enabled && settings.dailyReminder.enabled) {
      await scheduleDailyReminder(settings.dailyReminder.time);
    }

    if (settings.enabled && settings.weeklyStats) {
      await scheduleWeeklyStats();
    }

    logInfo('notification', 'Notifications initialized successfully');
    return true;
  } catch (error) {
    logError('notification', 'Notification initialization failed', error);
    return false;
  }
}

// Request notification permissions
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    // First check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    // Request if not already granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    notificationPermissionGranted = finalStatus === 'granted';

    // For Android, we need to set up the notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Wordle Notifications',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6aaa64',
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('reminders', {
        name: 'Daily Reminders',
        description: 'Daily Wordle puzzle reminders',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('achievements', {
        name: 'Achievements',
        description: 'Achievement unlock notifications',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
      });
    }

    return notificationPermissionGranted;
  } catch (error) {
    logError('notification', 'Permission request failed', error);
    return false;
  }
}

// Check if notifications are permitted
export function hasNotificationPermission(): boolean {
  return notificationPermissionGranted;
}

// Get notification settings
export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const stored = await getStoreData(NOTIFICATION_SETTINGS_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    logError('notification', 'Error reading notification settings', error);
  }
  return DEFAULT_SETTINGS;
}

// Save notification settings
export async function saveNotificationSettings(
  settings: Partial<NotificationSettings>
): Promise<void> {
  try {
    const current = await getNotificationSettings();
    const updated = { ...current, ...settings };
    await setStoreData(NOTIFICATION_SETTINGS_KEY, JSON.stringify(updated));

    // Reschedule notifications based on new settings
    await rescheduleAllNotifications(updated);
  } catch (error) {
    logError('notification', 'Error saving notification settings', error);
  }
}

// Get random message from template
export function getRandomMessage(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)] ?? messages[0] ?? '';
}

// Parse a time string in "HH:MM" 24-hour format.
// Returns null for invalid values (NaN, missing parts, or out-of-range).
export function parseTimeString(time: string): { hour: number; minute: number } | null {
  const parts = time.split(':');
  if (parts.length !== 2) return null;
  const hour = Number(parts[0]);
  const minute = Number(parts[1]);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  if (hour < 0 || hour > 23) return null;
  if (minute < 0 || minute > 59) return null;
  return { hour, minute };
}

// Schedule daily reminder notification
export async function scheduleDailyReminder(time: string): Promise<string | null> {
  if (!notificationPermissionGranted) {
    return null;
  }

  try {
    // Cancel existing daily reminder if any
    const existingId = await getScheduledId('dailyReminder');
    if (existingId) {
      await Notifications.cancelScheduledNotificationAsync(existingId);
      await removeScheduledId('dailyReminder');
    }
    const parsed = parseTimeString(time);

    if (!parsed) {
      logWarning('notification', 'Invalid time format for daily reminder', { time });
      return null;
    }

    const { hour, minute } = parsed;

    // Schedule the notification
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: NOTIFICATION_TEMPLATES.dailyReminder.title,
        body: getRandomMessage(NOTIFICATION_TEMPLATES.dailyReminder.messages),
        sound: true,
        badge: 1,
        data: { type: 'dailyReminder' },
        ...(Platform.OS === 'android' && { channelId: 'reminders' }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hour,
        minute: minute,
      },
    });

    await storeScheduledId('dailyReminder', identifier);
    logInfo('notification', 'Scheduled daily reminder', { time, identifier });
    return identifier;
  } catch (error) {
    logError('notification', 'Error scheduling daily reminder', error, { time });
    return null;
  }
}

// Schedule streak warning notification
export async function scheduleStreakWarning(
  currentStreak: number,
  hoursBeforeMidnight = 4
): Promise<string | null> {
  if (!notificationPermissionGranted || currentStreak < 2) {
    return null;
  }

  try {
    // Cancel existing streak warning if any
    const existingId = await getScheduledId('streakWarning');
    if (existingId) {
      await Notifications.cancelScheduledNotificationAsync(existingId);
      await removeScheduledId('streakWarning');
    }

    // Calculate trigger time (hours before midnight)
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);

    const warningTime = new Date(midnight.getTime() - hoursBeforeMidnight * 60 * 60 * 1000);

    // Don't schedule if warning time has passed
    if (warningTime <= now) {
      return null;
    }

    const message = getRandomMessage(NOTIFICATION_TEMPLATES.streakWarning.messages).replace(
      '{streak}',
      String(currentStreak)
    );

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: NOTIFICATION_TEMPLATES.streakWarning.title,
        body: message,
        sound: true,
        badge: 1,
        data: { type: 'streakWarning', streak: currentStreak },
        ...(Platform.OS === 'android' && { channelId: 'reminders' }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: warningTime,
      },
    });

    await storeScheduledId('streakWarning', identifier);
    console.log(
      `Scheduled streak warning for ${warningTime.toISOString()} (streak: ${currentStreak})`
    );
    return identifier;
  } catch (error) {
    logError('notification', 'Error scheduling streak warning', error, { hoursBeforeMidnight, currentStreak });
    return null;
  }
}

// Send immediate notification for achievement
export async function notifyAchievementUnlocked(achievementTitle: string): Promise<void> {
  const settings = await getNotificationSettings();

  if (!notificationPermissionGranted || !settings.achievements) {
    return;
  }

  try {
    const body =
      NOTIFICATION_TEMPLATES.achievementUnlocked.messages[0]?.replace(
        '{achievement}',
        achievementTitle
      ) ?? '';

    await Notifications.scheduleNotificationAsync({
      content: {
        title: NOTIFICATION_TEMPLATES.achievementUnlocked.title,
        body,
        sound: true,
        data: { type: 'achievementUnlocked', achievement: achievementTitle },
        ...(Platform.OS === 'android' && { channelId: 'achievements' }),
      },
      trigger: null, // Immediate
    });

    logInfo('notification', 'Achievement notification sent', { achievementTitle });
    await logNotification('achievementUnlocked', achievementTitle);
  } catch (error) {
    logError('notification', 'Error sending achievement notification', error);
  }
}

// Schedule weekly stats notification (Sunday evening)
export async function scheduleWeeklyStats(): Promise<string | null> {
  if (!notificationPermissionGranted) {
    return null;
  }

  try {
    // Cancel existing weekly stats notification if any
    const existingId = await getScheduledId('weeklyStats');
    if (existingId) {
      await Notifications.cancelScheduledNotificationAsync(existingId);
      await removeScheduledId('weeklyStats');
    }

    // Schedule for Sunday at 6 PM
    // Note: expo-notifications normalizes weekdays to 1-7 where 1 is Sunday across both iOS and Android.
    // Use these values as defined by expo-notifications documentation.
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: NOTIFICATION_TEMPLATES.weeklyStats.title,
        body: 'Check your weekly Wordle statistics!',
        sound: true,
        data: { type: 'weeklyStats' },
        ...(Platform.OS === 'android' && { channelId: 'default' }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: 1, // Sunday (1=Sunday, 2=Monday, ..., 7=Saturday)
        hour: 18,
        minute: 0,
      },
    });

    await storeScheduledId('weeklyStats', identifier);
    logInfo('notification', 'Scheduled weekly stats notification');
    return identifier;
  } catch (error) {
    logError('notification', 'Error scheduling weekly stats', error);
    return null;
  }
}

// Send weekly stats notification (immediate)
export async function sendWeeklyStatsNotification(
  gamesPlayed: number,
  winRate: number
): Promise<void> {
  const settings = await getNotificationSettings();

  if (!notificationPermissionGranted || !settings.weeklyStats) {
    return;
  }

  try {
    const body = NOTIFICATION_TEMPLATES.weeklyStats.messages[0]
      ?.replace('{games}', String(gamesPlayed))
      .replace('{winRate}', String(Math.round(winRate)));

    await Notifications.scheduleNotificationAsync({
      content: {
        title: NOTIFICATION_TEMPLATES.weeklyStats.title,
        body: body ?? '',
        sound: true,
        data: { type: 'weeklyStats', gamesPlayed, winRate },
        ...(Platform.OS === 'android' && { channelId: 'default' }),
      },
      trigger: null, // Immediate
    });

    logInfo('notification', 'Weekly stats notification sent', { gamesPlayed, winRate });
    await logNotification('weeklyStats', `${gamesPlayed} games, ${winRate}% win rate`);
  } catch (error) {
    logError('notification', 'Error sending weekly stats notification', error);
  }
}

// Cancel all scheduled notifications
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    // Clear stored IDs
    await setStoreData(SCHEDULED_IDS_KEY, JSON.stringify({}));
    logInfo('notification', 'All notifications cancelled');
  } catch (error) {
    logError('notification', 'Error cancelling notifications', error);
  }
}

// Cancel specific notification
export async function cancelNotification(identifier: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
    logInfo('notification', 'Notification cancelled', { identifier });
  } catch (error) {
    logError('notification', 'Error cancelling notification', error);
  }
}

// Reschedule all notifications based on settings
async function rescheduleAllNotifications(settings: NotificationSettings): Promise<void> {
  // Cancel existing notifications
  await cancelAllNotifications();

  if (!settings.enabled || !notificationPermissionGranted) {
    return;
  }

  // Reschedule based on settings
  if (settings.dailyReminder.enabled) {
    await scheduleDailyReminder(settings.dailyReminder.time);
  }

  if (settings.weeklyStats) {
    await scheduleWeeklyStats();
  }
}

// Log notification to history
async function logNotification(type: NotificationType, details: string): Promise<void> {
  try {
    const historyStr = await getStoreData(NOTIFICATION_HISTORY_KEY);
    const history = historyStr ? JSON.parse(historyStr) : [];

    history.unshift({
      type,
      details,
      timestamp: new Date().toISOString(),
    });

    // Keep only last 50 notifications
    const trimmed = history.slice(0, 50);
    await setStoreData(NOTIFICATION_HISTORY_KEY, JSON.stringify(trimmed));
  } catch (error) {
    logError('notification', 'Error logging notification', error);
  }
}

// Get notification history
export async function getNotificationHistory(): Promise<
  Array<{ type: NotificationType; details: string; timestamp: string }>
> {
  try {
    const historyStr = await getStoreData(NOTIFICATION_HISTORY_KEY);
    return historyStr ? JSON.parse(historyStr) : [];
  } catch (error) {
    logError('notification', 'Error reading notification history', error);
    return [];
  }
}

// Handle notification tap (app opened from notification)
export function handleNotificationTap(notification: {
  type?: NotificationType;
  data?: Record<string, unknown>;
}): { screen: string; params?: Record<string, unknown> } {
  // Determine which screen to navigate to based on notification type
  switch (notification.type) {
    case 'dailyReminder':
    case 'streakWarning':
      return { screen: 'Game', params: { mode: 'daily' } };
    case 'achievementUnlocked':
      return { screen: 'Statistics' };
    case 'weeklyStats':
      return { screen: 'Statistics' };
    default:
      return { screen: 'Main' };
  }
}

// Set app badge count (iOS)
export async function setBadgeCount(count: number): Promise<void> {
  // iOS supports badges reliably. Android badge behavior depends on launcher/OEM support.
  if (Platform.OS !== 'ios') {
    return;
  }

  try {
    await Notifications.setBadgeCountAsync(count);
    logInfo('notification', 'Badge count set', { count });
  } catch (error) {
    logError('notification', 'Error setting badge count', error);
  }
}

// Clear app badge
export async function clearBadge(): Promise<void> {
  await setBadgeCount(0);
}

// Get all scheduled notifications (for debugging)
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    logError('notification', 'Error getting scheduled notifications', error);
    return [];
  }
}

// Add notification listeners
export function addNotificationListeners(
  onReceived?: (notification: Notifications.Notification) => void,
  onResponse?: (response: Notifications.NotificationResponse) => void
): { remove: () => void } {
  const receivedSubscription = onReceived
    ? Notifications.addNotificationReceivedListener(onReceived)
    : null;

  const responseSubscription = onResponse
    ? Notifications.addNotificationResponseReceivedListener(onResponse)
    : null;

  return {
    remove: () => {
      receivedSubscription?.remove();
      responseSubscription?.remove();
    },
  };
}
