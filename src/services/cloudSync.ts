import { Platform } from 'react-native';

import { getStoreData, setStoreData } from '../utils/localStorageFuncs';

// Cloud sync storage keys
const CLOUD_SYNC_KEY = 'wordle_cloud_sync';
const LAST_SYNC_KEY = 'wordle_last_sync';
const DEVICE_ID_KEY = 'wordle_device_id';
const SYNC_CONFLICT_KEY = 'wordle_sync_conflict';

// Data that gets synced
export interface SyncableData {
  statistics: {
    gamesPlayed: number;
    gamesWon: number;
    currentStreak: number;
    maxStreak: number;
    guessDistribution: Record<string, number>;
    lastPlayedDate: string | null;
  };
  settings: {
    hardMode: boolean;
    highContrastMode: boolean;
    hapticFeedback: boolean;
    soundEnabled: boolean;
  };
  achievements: {
    [achievementId: string]: {
      unlockedAt: string;
    };
  };
  dailyProgress: {
    [dateKey: string]: {
      completed: boolean;
      won: boolean;
      guesses: number;
      word: string;
    };
  };
  lastModified: string;
  deviceId: string;
}

// Sync status
export interface SyncStatus {
  isAvailable: boolean;
  isEnabled: boolean;
  lastSyncTime: string | null;
  pendingChanges: boolean;
  conflictDetected: boolean;
}

// Sync conflict resolution strategy
export type ConflictResolution = 'local' | 'cloud' | 'merge';

// Cloud sync state
let iCloudAvailable = false;
let syncEnabled = false;
let currentDeviceId: string | null = null;

// Generate unique device ID
function generateDeviceId(): string {
  return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get or create device ID
async function getDeviceId(): Promise<string> {
  if (currentDeviceId) return currentDeviceId;

  try {
    const stored = await getStoreData(DEVICE_ID_KEY);
    if (stored) {
      currentDeviceId = stored;
      return stored;
    }
  } catch (error) {
    console.log('Error reading device ID:', error);
  }

  currentDeviceId = generateDeviceId();
  await setStoreData(DEVICE_ID_KEY, currentDeviceId);
  return currentDeviceId;
}

// Initialize iCloud sync
export async function initializeCloudSync(): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    console.log('iCloud sync is only available on iOS');
    return false;
  }

  try {
    // In production, check for iCloud availability using native module
    // For now, simulate availability
    iCloudAvailable = true;
    await getDeviceId();
    console.log('iCloud sync initialized');
    return true;
  } catch (error) {
    console.log('iCloud sync initialization failed:', error);
    return false;
  }
}

// Enable/disable cloud sync
export async function setCloudSyncEnabled(enabled: boolean): Promise<void> {
  syncEnabled = enabled;
  await setStoreData(CLOUD_SYNC_KEY, JSON.stringify({ enabled }));

  if (enabled && iCloudAvailable) {
    // Perform initial sync when enabled
    await syncToCloud();
  }
}

// Check if cloud sync is available
export function isCloudSyncAvailable(): boolean {
  return iCloudAvailable;
}

// Check if cloud sync is enabled
export function isCloudSyncEnabled(): boolean {
  return syncEnabled && iCloudAvailable;
}

// Get current sync status
export async function getSyncStatus(): Promise<SyncStatus> {
  const lastSyncStr = await getStoreData(LAST_SYNC_KEY);
  const conflictStr = await getStoreData(SYNC_CONFLICT_KEY);

  return {
    isAvailable: iCloudAvailable,
    isEnabled: syncEnabled,
    lastSyncTime: lastSyncStr,
    pendingChanges: false, // Would track actual pending changes
    conflictDetected: conflictStr === 'true',
  };
}

// Get local syncable data
export async function getLocalSyncData(): Promise<SyncableData> {
  const deviceId = await getDeviceId();

  // Gather all local data
  const statsStr = await getStoreData('wordle_statistics');
  const settingsStr = await getStoreData('wordle_settings');
  const achievementsStr = await getStoreData('wordle_achievements');
  const dailyProgressStr = await getStoreData('wordle_daily_progress');

  const statistics = statsStr
    ? JSON.parse(statsStr)
    : {
        gamesPlayed: 0,
        gamesWon: 0,
        currentStreak: 0,
        maxStreak: 0,
        guessDistribution: {},
        lastPlayedDate: null,
      };

  const settings = settingsStr
    ? JSON.parse(settingsStr)
    : {
        hardMode: false,
        highContrastMode: false,
        hapticFeedback: true,
        soundEnabled: true,
      };

  const achievements = achievementsStr ? JSON.parse(achievementsStr) : {};
  const dailyProgress = dailyProgressStr ? JSON.parse(dailyProgressStr) : {};

  return {
    statistics,
    settings,
    achievements,
    dailyProgress,
    lastModified: new Date().toISOString(),
    deviceId,
  };
}

// Save local sync data
async function saveLocalSyncData(data: SyncableData): Promise<void> {
  await setStoreData('wordle_statistics', JSON.stringify(data.statistics));
  await setStoreData('wordle_settings', JSON.stringify(data.settings));
  await setStoreData('wordle_achievements', JSON.stringify(data.achievements));
  await setStoreData('wordle_daily_progress', JSON.stringify(data.dailyProgress));
}

// Merge two sync data objects (for conflict resolution)
function mergeData(local: SyncableData, cloud: SyncableData): SyncableData {
  const merged: SyncableData = {
    statistics: {
      // Take the higher values for cumulative stats
      gamesPlayed: Math.max(local.statistics.gamesPlayed, cloud.statistics.gamesPlayed),
      gamesWon: Math.max(local.statistics.gamesWon, cloud.statistics.gamesWon),
      // For streak, take the most recent data
      currentStreak:
        new Date(local.lastModified) > new Date(cloud.lastModified)
          ? local.statistics.currentStreak
          : cloud.statistics.currentStreak,
      maxStreak: Math.max(local.statistics.maxStreak, cloud.statistics.maxStreak),
      // Merge guess distribution by taking max for each bucket
      guessDistribution: { ...local.statistics.guessDistribution },
      lastPlayedDate:
        local.statistics.lastPlayedDate && cloud.statistics.lastPlayedDate
          ? local.statistics.lastPlayedDate > cloud.statistics.lastPlayedDate
            ? local.statistics.lastPlayedDate
            : cloud.statistics.lastPlayedDate
          : local.statistics.lastPlayedDate || cloud.statistics.lastPlayedDate,
    },
    // Settings: use most recent
    settings:
      new Date(local.lastModified) > new Date(cloud.lastModified)
        ? local.settings
        : cloud.settings,
    // Achievements: union of both
    achievements: { ...cloud.achievements, ...local.achievements },
    // Daily progress: merge all entries
    dailyProgress: { ...cloud.dailyProgress, ...local.dailyProgress },
    lastModified: new Date().toISOString(),
    deviceId: local.deviceId,
  };

  // Merge guess distribution properly
  Object.keys(cloud.statistics.guessDistribution).forEach((key) => {
    const localVal = merged.statistics.guessDistribution[key] || 0;
    const cloudVal = cloud.statistics.guessDistribution[key] || 0;
    merged.statistics.guessDistribution[key] = Math.max(localVal, cloudVal);
  });

  return merged;
}

// Sync local data to cloud
export async function syncToCloud(): Promise<{ success: boolean; error?: string }> {
  if (!isCloudSyncEnabled()) {
    return { success: false, error: 'Cloud sync not enabled' };
  }

  try {
    const localData = await getLocalSyncData();

    // In production, this would use a native module to:
    // 1. Read current cloud data
    // 2. Check for conflicts
    // 3. Merge if needed
    // 4. Write to iCloud

    console.log('Syncing to iCloud...', localData);

    // Simulate successful sync
    await setStoreData(LAST_SYNC_KEY, new Date().toISOString());
    await setStoreData(SYNC_CONFLICT_KEY, 'false');

    return { success: true };
  } catch (error) {
    console.log('Cloud sync failed:', error);
    return { success: false, error: String(error) };
  }
}

// Sync from cloud to local
export async function syncFromCloud(): Promise<{
  success: boolean;
  data?: SyncableData;
  conflict?: boolean;
  error?: string;
}> {
  if (!isCloudSyncEnabled()) {
    return { success: false, error: 'Cloud sync not enabled' };
  }

  try {
    // In production, this would use a native module to read from iCloud
    // For now, return current local data as if it came from cloud

    const localData = await getLocalSyncData();

    await setStoreData(LAST_SYNC_KEY, new Date().toISOString());

    return { success: true, data: localData, conflict: false };
  } catch (error) {
    console.log('Cloud sync fetch failed:', error);
    return { success: false, error: String(error) };
  }
}

// Resolve sync conflict
export async function resolveConflict(
  resolution: ConflictResolution,
  localData?: SyncableData,
  cloudData?: SyncableData
): Promise<{ success: boolean; error?: string }> {
  if (!localData || !cloudData) {
    return { success: false, error: 'Missing data for conflict resolution' };
  }

  try {
    let resolvedData: SyncableData;

    switch (resolution) {
      case 'local':
        resolvedData = localData;
        break;
      case 'cloud':
        resolvedData = cloudData;
        break;
      case 'merge':
      default:
        resolvedData = mergeData(localData, cloudData);
        break;
    }

    await saveLocalSyncData(resolvedData);
    await setStoreData(SYNC_CONFLICT_KEY, 'false');

    // Push resolved data to cloud
    await syncToCloud();

    return { success: true };
  } catch (error) {
    console.log('Conflict resolution failed:', error);
    return { success: false, error: String(error) };
  }
}

// Register for cloud change notifications
export function registerCloudChangeListener(
  _callback: (data: SyncableData) => void
): () => void {
  // In production, this would register for NSUbiquitousKeyValueStoreDidChangeExternallyNotification
  // and call the callback when cloud data changes

  console.log('Registered for cloud change notifications');

  // Return unsubscribe function
  return () => {
    console.log('Unregistered from cloud change notifications');
  };
}

// Force sync (useful for manual refresh)
export async function forceSync(): Promise<{
  success: boolean;
  direction: 'uploaded' | 'downloaded' | 'merged';
  error?: string;
}> {
  if (!isCloudSyncEnabled()) {
    return { success: false, direction: 'uploaded', error: 'Cloud sync not enabled' };
  }

  try {
    // Fetch cloud data
    const cloudResult = await syncFromCloud();

    if (!cloudResult.success || !cloudResult.data) {
      // If no cloud data, push local
      await syncToCloud();
      return { success: true, direction: 'uploaded' };
    }

    const localData = await getLocalSyncData();

    // Check if data differs
    const localTime = new Date(localData.lastModified).getTime();
    const cloudTime = new Date(cloudResult.data.lastModified).getTime();

    if (Math.abs(localTime - cloudTime) < 1000) {
      // Data is in sync
      return { success: true, direction: 'merged' };
    }

    // Merge and sync
    const merged = mergeData(localData, cloudResult.data);
    await saveLocalSyncData(merged);
    await syncToCloud();

    return { success: true, direction: 'merged' };
  } catch (error) {
    console.log('Force sync failed:', error);
    return { success: false, direction: 'uploaded', error: String(error) };
  }
}

// Export data for backup
export async function exportDataForBackup(): Promise<string> {
  const data = await getLocalSyncData();
  return JSON.stringify(data, null, 2);
}

// Import data from backup
export async function importDataFromBackup(
  jsonData: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const data = JSON.parse(jsonData) as SyncableData;

    // Validate data structure
    if (!data.statistics || !data.settings) {
      return { success: false, error: 'Invalid backup data format' };
    }

    await saveLocalSyncData(data);

    // Sync to cloud if enabled
    if (isCloudSyncEnabled()) {
      await syncToCloud();
    }

    return { success: true };
  } catch (error) {
    console.log('Import failed:', error);
    return { success: false, error: String(error) };
  }
}
