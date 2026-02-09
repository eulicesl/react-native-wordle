import { Platform } from 'react-native';

import { APP_NAME } from '../utils/constants';
import { getStoreData, setStoreData } from '../utils/localStorageFuncs';

// Widget data storage key (shared with widget extension via App Groups)
const WIDGET_DATA_KEY = 'wordle_widget_data';

// Widget types
export type WidgetSize = 'small' | 'medium' | 'large';
export type WidgetFamily = 'systemSmall' | 'systemMedium' | 'systemLarge' | 'accessoryCircular' | 'accessoryRectangular' | 'accessoryInline';

// Widget data structure (shared with native widget)
export interface WidgetData {
  // Today's game status
  todayCompleted: boolean;
  todayWon: boolean;
  todayGuesses: number;

  // Statistics
  currentStreak: number;
  maxStreak: number;
  totalGamesPlayed: number;
  totalGamesWon: number;
  winPercentage: number;

  // Last game result (for display)
  lastGameResult: {
    word: string;
    guesses: string[];
    pattern: ('correct' | 'present' | 'absent')[][];
  } | null;

  // Time until next puzzle
  nextPuzzleTime: string; // ISO date string

  // Last updated
  lastUpdated: string;
}

// Widget configuration
export interface WidgetConfig {
  showStreak: boolean;
  showLastGame: boolean;
  showCountdown: boolean;
  colorScheme: 'system' | 'light' | 'dark';
}

const DEFAULT_WIDGET_CONFIG: WidgetConfig = {
  showStreak: true,
  showLastGame: true,
  showCountdown: true,
  colorScheme: 'system',
};

// Check if widgets are supported
export function areWidgetsSupported(): boolean {
  return Platform.OS === 'ios';
}

// Get next puzzle time (midnight in user's timezone)
function getNextPuzzleTime(): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setHours(24, 0, 0, 0);
  return tomorrow.toISOString();
}

// Update widget data (call this after each game)
export async function updateWidgetData(data: {
  todayCompleted: boolean;
  todayWon: boolean;
  todayGuesses: number;
  currentStreak: number;
  maxStreak: number;
  totalGamesPlayed: number;
  totalGamesWon: number;
  lastGameResult?: {
    word: string;
    guesses: string[];
    pattern: ('correct' | 'present' | 'absent')[][];
  };
}): Promise<void> {
  if (!areWidgetsSupported()) return;

  try {
    const widgetData: WidgetData = {
      todayCompleted: data.todayCompleted,
      todayWon: data.todayWon,
      todayGuesses: data.todayGuesses,
      currentStreak: data.currentStreak,
      maxStreak: data.maxStreak,
      totalGamesPlayed: data.totalGamesPlayed,
      totalGamesWon: data.totalGamesWon,
      winPercentage: data.totalGamesPlayed > 0
        ? Math.round((data.totalGamesWon / data.totalGamesPlayed) * 100)
        : 0,
      lastGameResult: data.lastGameResult || null,
      nextPuzzleTime: getNextPuzzleTime(),
      lastUpdated: new Date().toISOString(),
    };

    // Save to shared App Group container
    // In production, use react-native-shared-group-preferences or similar
    await setStoreData(WIDGET_DATA_KEY, JSON.stringify(widgetData));

    // Trigger widget reload
    await reloadWidgets();

    console.log('Widget data updated');
  } catch (_error) {
    console.log('Error updating widget data:', _error);
  }
}

// Get current widget data
export async function getWidgetData(): Promise<WidgetData | null> {
  try {
    const stored = await getStoreData(WIDGET_DATA_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (_error) {
    console.log('Error reading widget data:', _error);
    return null;
  }
}

// Reload all widgets (trigger WidgetKit timeline reload)
export async function reloadWidgets(): Promise<void> {
  if (!areWidgetsSupported()) return;

  try {
    // In production, use native module to call:
    // WidgetCenter.shared.reloadAllTimelines()
    console.log('Widgets reloaded');
  } catch (_error) {
    console.log('Error reloading widgets:', _error);
  }
}

// Reload specific widget kind
export async function reloadWidget(kind: string): Promise<void> {
  if (!areWidgetsSupported()) return;

  try {
    // In production, use native module to call:
    // WidgetCenter.shared.reloadTimelines(ofKind: kind)
    console.log(`Widget ${kind} reloaded`);
  } catch (_error) {
    console.log('Error reloading widget:', _error);
  }
}

// Get widget configuration
export async function getWidgetConfig(): Promise<WidgetConfig> {
  try {
    const stored = await getStoreData('wordle_widget_config');
    return stored ? { ...DEFAULT_WIDGET_CONFIG, ...JSON.parse(stored) } : DEFAULT_WIDGET_CONFIG;
  } catch (_error) {
    return DEFAULT_WIDGET_CONFIG;
  }
}

// Save widget configuration
export async function saveWidgetConfig(config: Partial<WidgetConfig>): Promise<void> {
  try {
    const current = await getWidgetConfig();
    await setStoreData('wordle_widget_config', JSON.stringify({ ...current, ...config }));
    await reloadWidgets();
  } catch (_error) {
    console.log('Error saving widget config:', _error);
  }
}

// Generate widget preview data (for configuration screen)
export function generatePreviewData(): WidgetData {
  return {
    todayCompleted: true,
    todayWon: true,
    todayGuesses: 4,
    currentStreak: 15,
    maxStreak: 23,
    totalGamesPlayed: 47,
    totalGamesWon: 42,
    winPercentage: 89,
    lastGameResult: {
      word: 'CRANE',
      guesses: ['SLATE', 'CRANE'],
      pattern: [
        ['absent', 'absent', 'present', 'absent', 'correct'],
        ['correct', 'correct', 'correct', 'correct', 'correct'],
      ],
    },
    nextPuzzleTime: getNextPuzzleTime(),
    lastUpdated: new Date().toISOString(),
  };
}

// Widget kind identifiers (must match native widget extension)
export const WIDGET_KINDS = {
  stats: 'WordleStatsWidget',
  streak: 'WordleStreakWidget',
  countdown: 'WordleCountdownWidget',
  lastGame: 'WordleLastGameWidget',
} as const;

// Get available widget sizes for each kind
export function getAvailableSizes(kind: keyof typeof WIDGET_KINDS): WidgetFamily[] {
  switch (kind) {
    case 'stats':
      return ['systemSmall', 'systemMedium'];
    case 'streak':
      return ['systemSmall', 'accessoryCircular', 'accessoryRectangular'];
    case 'countdown':
      return ['systemSmall', 'accessoryCircular', 'accessoryInline'];
    case 'lastGame':
      return ['systemMedium', 'systemLarge'];
    default:
      return ['systemSmall'];
  }
}

// Widget Swift code template (for reference/documentation)
export const WIDGET_SWIFT_TEMPLATE = `
// WordleWidget.swift - iOS Widget Extension

import WidgetKit
import SwiftUI

struct WordleEntry: TimelineEntry {
    let date: Date
    let data: WidgetData
}

struct WordleStatsWidget: Widget {
    let kind: String = "WordleStatsWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: WordleProvider()) { entry in
            WordleStatsView(entry: entry)
        }
        .configurationDisplayName("Wordle Stats")
        .description("View your Wordle statistics")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct WordleStatsView: View {
    var entry: WordleEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("WORDLE")
                .font(.headline)
                .fontWeight(.bold)

            HStack {
                StatItem(value: "\\(entry.data.currentStreak)", label: "Streak")
                StatItem(value: "\\(entry.data.winPercentage)%", label: "Win Rate")
            }

            if !entry.data.todayCompleted {
                Text("Today's puzzle awaits!")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
    }
}
`;

// Lock Screen widget data formatter
export function formatLockScreenData(data: WidgetData): {
  circular: string;
  rectangular: { line1: string; line2: string };
  inline: string;
} {
  return {
    circular: `${data.currentStreak}🔥`,
    rectangular: {
      line1: `${data.currentStreak} day streak`,
      line2: data.todayCompleted ? '✓ Completed' : 'Play today!',
    },
    inline: data.todayCompleted
      ? `${APP_NAME} ✓ | ${data.currentStreak}🔥`
      : `${APP_NAME} | ${data.currentStreak}🔥`,
  };
}

// Countdown formatter for widget
export function formatCountdown(nextPuzzleTime: string): {
  hours: number;
  minutes: number;
  seconds: number;
  display: string;
} {
  const now = new Date();
  const next = new Date(nextPuzzleTime);
  const diff = Math.max(0, next.getTime() - now.getTime());

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const display = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return { hours, minutes, seconds, display };
}
