import { Platform } from 'react-native';

import { APP_NAME } from '../utils/constants';
import { getStoreData, setStoreData } from '../utils/localStorageFuncs';

// Notification settings storage
const NOTIFICATION_SETTINGS_KEY = 'wordle_notification_settings';
const NOTIFICATION_HISTORY_KEY = 'wordle_notification_history';

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

// Notification content templates (exported for production use with expo-notifications)
export const NOTIFICATION_TEMPLATES = {
  dailyReminder: {
    title: `Today's ${APP_NAME} is ready!`,
    messages: [
      "A new word awaits. Can you guess it in 6 tries?",
      "Your daily brain exercise is here. Good luck!",
      "Time to flex those vocabulary muscles!",
      "The daily puzzle is live. How fast can you solve it?",
      "New day, new word. Let's see what you've got!",
    ],
  },
  streakWarning: {
    title: "Don't lose your streak!",
    messages: [
      "Your {streak}-day streak is at risk! Play now to keep it going.",
      "Only a few hours left to maintain your {streak}-day streak!",
      "Hey word master! Your {streak}-day streak needs you.",
    ],
  },
  achievementUnlocked: {
    title: "Achievement Unlocked! 🏆",
    messages: [
      "You've earned '{achievement}'! Keep up the great work.",
    ],
  },
  weeklyStats: {
    title: `Your Weekly ${APP_NAME} Recap`,
    messages: [
      "You played {games} games this week with a {winRate}% win rate!",
    ],
  },
  newFeature: {
    title: `New in ${APP_NAME}`,
    messages: [
      "Check out what's new in the latest update!",
    ],
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

// Initialize notifications
export async function initializeNotifications(): Promise<boolean> {
  try {
    // In production, use expo-notifications to request permissions
    // For now, simulate permission request
    notificationPermissionGranted = true;

    // Load settings
    const settings = await getNotificationSettings();

    // Schedule recurring notifications if enabled
    if (settings.enabled && settings.dailyReminder.enabled) {
      await scheduleDailyReminder(settings.dailyReminder.time);
    }

    console.log('Notifications initialized');
    return true;
  } catch (error) {
    console.log('Notification initialization failed:', error);
    return false;
  }
}

// Request notification permissions
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    // In production, use expo-notifications:
    // const { status } = await Notifications.requestPermissionsAsync();
    // notificationPermissionGranted = status === 'granted';

    notificationPermissionGranted = true;
    return notificationPermissionGranted;
  } catch (error) {
    console.log('Permission request failed:', error);
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
    console.log('Error reading notification settings:', error);
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
    console.log('Error saving notification settings:', error);
  }
}

// Get random message from template (exported for production use)
export function getRandomMessage(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)] ?? messages[0] ?? '';
}

// Schedule daily reminder notification
export async function scheduleDailyReminder(time: string): Promise<string | null> {
  if (!notificationPermissionGranted) {
    return null;
  }

  try {
    // Parse time
    const [hours, minutes] = time.split(':').map(Number);

    // In production, use expo-notifications:
    // const identifier = await Notifications.scheduleNotificationAsync({
    //   content: {
    //     title: NOTIFICATION_TEMPLATES.dailyReminder.title,
    //     body: getRandomMessage(NOTIFICATION_TEMPLATES.dailyReminder.messages),
    //     sound: true,
    //     badge: 1,
    //   },
    //   trigger: {
    //     hour: hours,
    //     minute: minutes,
    //     repeats: true,
    //   },
    // });

    const identifier = `daily_reminder_${hours}_${minutes}`;
    console.log(`Scheduled daily reminder at ${time}`);
    return identifier;
  } catch (error) {
    console.log('Error scheduling daily reminder:', error);
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
    // Calculate trigger time (hours before midnight)
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);

    const warningTime = new Date(midnight.getTime() - hoursBeforeMidnight * 60 * 60 * 1000);

    // Don't schedule if warning time has passed
    if (warningTime <= now) {
      return null;
    }

    // In production, schedule with expo-notifications using message template
    // const message = getRandomMessage(NOTIFICATION_TEMPLATES.streakWarning.messages).replace('{streak}', String(currentStreak));
    const identifier = `streak_warning_${now.toISOString().split('T')[0]}`;
    console.log(`Scheduled streak warning for ${warningTime.toISOString()} (streak: ${currentStreak})`);
    return identifier;
  } catch (error) {
    console.log('Error scheduling streak warning:', error);
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
    // In production, use expo-notifications:
    // await Notifications.scheduleNotificationAsync({
    //   content: {
    //     title: NOTIFICATION_TEMPLATES.achievementUnlocked.title,
    //     body: NOTIFICATION_TEMPLATES.achievementUnlocked.messages[0]?.replace('{achievement}', achievementTitle),
    //     sound: true,
    //   },
    //   trigger: null, // Immediate
    // });

    console.log(`Achievement notification: ${achievementTitle}`);
    await logNotification('achievementUnlocked', achievementTitle);
  } catch (error) {
    console.log('Error sending achievement notification:', error);
  }
}

// Schedule weekly stats notification (Sunday evening)
export async function scheduleWeeklyStats(): Promise<string | null> {
  if (!notificationPermissionGranted) {
    return null;
  }

  try {
    // Schedule for Sunday at 6 PM
    // In production, use expo-notifications with weekly trigger
    const identifier = 'weekly_stats';
    console.log('Scheduled weekly stats notification');
    return identifier;
  } catch (error) {
    console.log('Error scheduling weekly stats:', error);
    return null;
  }
}

// Send weekly stats notification
export async function sendWeeklyStatsNotification(
  gamesPlayed: number,
  winRate: number
): Promise<void> {
  const settings = await getNotificationSettings();

  if (!notificationPermissionGranted || !settings.weeklyStats) {
    return;
  }

  try {
    // In production, use expo-notifications
    console.log(`Weekly stats: ${gamesPlayed} games, ${winRate}% win rate`);
    await logNotification('weeklyStats', `${gamesPlayed} games, ${winRate}% win rate`);
  } catch (error) {
    console.log('Error sending weekly stats notification:', error);
  }
}

// Cancel all scheduled notifications
export async function cancelAllNotifications(): Promise<void> {
  try {
    // In production, use expo-notifications:
    // await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications cancelled');
  } catch (error) {
    console.log('Error cancelling notifications:', error);
  }
}

// Cancel specific notification
export async function cancelNotification(identifier: string): Promise<void> {
  try {
    // In production, use expo-notifications:
    // await Notifications.cancelScheduledNotificationAsync(identifier);
    console.log(`Notification ${identifier} cancelled`);
  } catch (error) {
    console.log('Error cancelling notification:', error);
  }
}

// Reschedule all notifications based on settings
async function rescheduleAllNotifications(settings: NotificationSettings): Promise<void> {
  // Cancel existing notifications
  await cancelAllNotifications();

  if (!settings.enabled) {
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
    console.log('Error logging notification:', error);
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
    console.log('Error reading notification history:', error);
    return [];
  }
}

// Handle notification received while app is in foreground
export function handleForegroundNotification(notification: {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}): void {
  // In production, show an in-app notification toast
  console.log('Foreground notification:', notification.title);
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
  if (Platform.OS !== 'ios') return;

  try {
    // In production, use expo-notifications:
    // await Notifications.setBadgeCountAsync(count);
    console.log(`Badge count set to ${count}`);
  } catch (error) {
    console.log('Error setting badge count:', error);
  }
}

// Clear app badge
export async function clearBadge(): Promise<void> {
  await setBadgeCount(0);
}
