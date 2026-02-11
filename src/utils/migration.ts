import { getStoreData, setStoreData } from './localStorageFuncs';

const MIGRATION_KEY = 'wordvibe_migration_v2_complete';

const KEY_MAPPINGS: [string, string][] = [
  ['wordle_accessibility_prefs', 'wordvibe_accessibility_prefs'],
  ['wordle_notification_settings', 'wordvibe_notification_settings'],
  ['wordle_notification_history', 'wordvibe_notification_history'],
  ['wordle_achievements', 'wordvibe_achievements'],
  ['wordle_achievement_progress', 'wordvibe_achievement_progress'],
  ['wordle_cloud_sync', 'wordvibe_cloud_sync'],
  ['wordle_last_sync', 'wordvibe_last_sync'],
  ['wordle_device_id', 'wordvibe_device_id'],
  ['wordle_sync_conflict', 'wordvibe_sync_conflict'],
  ['wordle_statistics', 'wordvibe_statistics'],
  ['wordle_settings', 'wordvibe_settings'],
  ['wordle_daily_progress', 'wordvibe_daily_progress'],
  ['wordle_widget_data', 'wordvibe_widget_data'],
  ['wordle_widget_config', 'wordvibe_widget_config'],
];

export async function runMigrationIfNeeded(): Promise<void> {
  try {
    const migrated = await getStoreData(MIGRATION_KEY);
    if (migrated === 'true') return;

    for (const [oldKey, newKey] of KEY_MAPPINGS) {
      const data = await getStoreData(oldKey);
      if (data) {
        await setStoreData(newKey, data);
      }
    }

    await setStoreData(MIGRATION_KEY, 'true');
  } catch (error) {
    console.log('Migration error:', error);
  }
}
