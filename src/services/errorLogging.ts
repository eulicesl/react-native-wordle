/**
 * Error Logging Service
 *
 * A centralized error logging service for the Wordle app.
 * In production, this can be easily integrated with services like:
 * - Sentry (expo-sentry)
 * - LogRocket
 * - Bugsnag
 * - Firebase Crashlytics
 *
 * For now, it provides structured logging with console output
 * and local persistence for debugging.
 */

import { Platform } from 'react-native';

// React Native global error handler type
interface ErrorUtilsType {
  getGlobalHandler: () => ((error: Error, isFatal?: boolean) => void) | undefined;
  setGlobalHandler: (handler: (error: Error, isFatal?: boolean) => void) => void;
}

declare const ErrorUtils: ErrorUtilsType | undefined;

import { getStoreData, setStoreData } from '../utils/localStorageFuncs';

// Error severity levels
export type ErrorSeverity = 'debug' | 'info' | 'warning' | 'error' | 'fatal';

// Error categories
export type ErrorCategory =
  | 'game'
  | 'storage'
  | 'network'
  | 'ui'
  | 'notification'
  | 'gameCenter'
  | 'audio'
  | 'general';

// Error log entry
export interface ErrorLogEntry {
  id: string;
  timestamp: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  message: string;
  error?: string;
  stack?: string;
  context?: Record<string, unknown>;
  platform: string;
  version: string;
}

// User context for error tracking
interface UserContext {
  userId?: string;
  gamesPlayed?: number;
  sessionId?: string;
  language?: string;
}

// Configuration
const ERROR_LOG_KEY = 'wordle_error_log';
const MAX_LOG_ENTRIES = 100;
const APP_VERSION = '1.0.0';

// Session tracking
let sessionId = generateSessionId();
let userContext: UserContext = {};
let isInitialized = false;

// Generate unique session ID
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

// Generate unique error ID
function generateErrorId(): string {
  return `err-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Initialize the error logging service
 */
export function initializeErrorLogging(): void {
  if (isInitialized) return;

  sessionId = generateSessionId();
  isInitialized = true;

  // Log session start
  logInfo('general', 'Error logging initialized', {
    sessionId,
    platform: Platform.OS,
    version: APP_VERSION,
  });

  // Set up global error handler for unhandled promises
  if (typeof ErrorUtils !== 'undefined' && ErrorUtils) {
    const originalHandler = ErrorUtils.getGlobalHandler?.();

    ErrorUtils.setGlobalHandler?.((error: Error, isFatal?: boolean) => {
      logError(
        'general',
        isFatal ? 'Unhandled fatal error' : 'Unhandled error',
        error,
        { isFatal }
      );

      // Call original handler
      originalHandler?.(error, isFatal);
    });
  }

  console.log('[ErrorLogging] Service initialized');
}

/**
 * Set user context for error tracking
 */
export function setUserContext(context: Partial<UserContext>): void {
  userContext = { ...userContext, ...context, sessionId };
}

/**
 * Clear user context (e.g., on logout)
 */
export function clearUserContext(): void {
  userContext = { sessionId };
}

/**
 * Log a debug message
 */
export function logDebug(
  category: ErrorCategory,
  message: string,
  context?: Record<string, unknown>
): void {
  createLogEntry('debug', category, message, undefined, context);
}

/**
 * Log an info message
 */
export function logInfo(
  category: ErrorCategory,
  message: string,
  context?: Record<string, unknown>
): void {
  createLogEntry('info', category, message, undefined, context);
}

/**
 * Log a warning
 */
export function logWarning(
  category: ErrorCategory,
  message: string,
  context?: Record<string, unknown>
): void {
  createLogEntry('warning', category, message, undefined, context);
}

/**
 * Log an error
 */
export function logError(
  category: ErrorCategory,
  message: string,
  error?: Error | unknown,
  context?: Record<string, unknown>
): void {
  createLogEntry('error', category, message, error, context);
}

/**
 * Log a fatal error
 */
export function logFatal(
  category: ErrorCategory,
  message: string,
  error?: Error | unknown,
  context?: Record<string, unknown>
): void {
  createLogEntry('fatal', category, message, error, context);
}

/**
 * Create and store a log entry
 */
async function createLogEntry(
  severity: ErrorSeverity,
  category: ErrorCategory,
  message: string,
  error?: Error | unknown,
  context?: Record<string, unknown>
): Promise<void> {
  const entry: ErrorLogEntry = {
    id: generateErrorId(),
    timestamp: new Date().toISOString(),
    severity,
    category,
    message,
    error: error instanceof Error ? error.message : error ? String(error) : undefined,
    stack: error instanceof Error ? error.stack : (error as { stack?: string })?.stack,
    context: {
      ...userContext,
      ...context,
    },
    platform: Platform.OS,
    version: APP_VERSION,
  };

  // Console output with color coding
  const consoleMethod = getConsoleMethod(severity);
  const prefix = `[${severity.toUpperCase()}][${category}]`;
  consoleMethod(`${prefix} ${message}`, entry.context);

  if (error) {
    consoleMethod(`${prefix} Error:`, error);
  }

  // Store locally
  await storeLogEntry(entry);

  // In production, send to external service
  // await sendToExternalService(entry);
}

/**
 * Get appropriate console method for severity
 */
function getConsoleMethod(
  severity: ErrorSeverity
): (...args: unknown[]) => void {
  switch (severity) {
    case 'debug':
      return console.debug;
    case 'info':
      return console.info;
    case 'warning':
      return console.warn;
    case 'error':
    case 'fatal':
      return console.error;
    default:
      return console.log;
  }
}

/**
 * Store log entry locally
 */
async function storeLogEntry(entry: ErrorLogEntry): Promise<void> {
  try {
    const existingData = await getStoreData(ERROR_LOG_KEY);
    const logs: ErrorLogEntry[] = existingData ? JSON.parse(existingData) : [];

    // Add new entry at the beginning
    logs.unshift(entry);

    // Keep only the most recent entries
    const trimmed = logs.slice(0, MAX_LOG_ENTRIES);

    await setStoreData(ERROR_LOG_KEY, JSON.stringify(trimmed));
  } catch (err) {
    // Avoid recursive error logging
    console.error('[ErrorLogging] Failed to store log entry:', err);
  }
}

/**
 * Get all stored log entries
 */
export async function getErrorLogs(): Promise<ErrorLogEntry[]> {
  try {
    const data = await getStoreData(ERROR_LOG_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('[ErrorLogging] Failed to read error logs:', err);
    return [];
  }
}

/**
 * Get error logs filtered by severity
 */
export async function getErrorLogsBySeverity(
  severity: ErrorSeverity
): Promise<ErrorLogEntry[]> {
  const logs = await getErrorLogs();
  return logs.filter((log) => log.severity === severity);
}

/**
 * Get error logs filtered by category
 */
export async function getErrorLogsByCategory(
  category: ErrorCategory
): Promise<ErrorLogEntry[]> {
  const logs = await getErrorLogs();
  return logs.filter((log) => log.category === category);
}

/**
 * Get recent errors (last N entries)
 */
export async function getRecentErrors(count = 10): Promise<ErrorLogEntry[]> {
  const logs = await getErrorLogs();
  return logs.filter((log) => log.severity === 'error' || log.severity === 'fatal').slice(0, count);
}

/**
 * Clear all stored logs
 */
export async function clearErrorLogs(): Promise<void> {
  try {
    await setStoreData(ERROR_LOG_KEY, JSON.stringify([]));
    logInfo('general', 'Error logs cleared');
  } catch (err) {
    console.error('[ErrorLogging] Failed to clear error logs:', err);
  }
}

/**
 * Export logs as JSON string (for debugging/support)
 */
export async function exportLogsAsJson(): Promise<string> {
  const logs = await getErrorLogs();
  return JSON.stringify(logs, null, 2);
}

/**
 * Get error statistics
 */
export async function getErrorStatistics(): Promise<{
  total: number;
  byCategory: Record<ErrorCategory, number>;
  bySeverity: Record<ErrorSeverity, number>;
  recentCount: number;
}> {
  const logs = await getErrorLogs();

  const byCategory = {} as Record<ErrorCategory, number>;
  const bySeverity = {} as Record<ErrorSeverity, number>;

  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  let recentCount = 0;

  logs.forEach((log) => {
    byCategory[log.category] = (byCategory[log.category] || 0) + 1;
    bySeverity[log.severity] = (bySeverity[log.severity] || 0) + 1;

    if (new Date(log.timestamp).getTime() > oneHourAgo) {
      recentCount++;
    }
  });

  return {
    total: logs.length,
    byCategory,
    bySeverity,
    recentCount,
  };
}

// =============================================================================
// Production Integration Placeholders
// =============================================================================

/**
 * Send error to external service (Sentry, etc.)
 * Uncomment and configure for production
 */
// async function sendToExternalService(entry: ErrorLogEntry): Promise<void> {
//   // Example Sentry integration:
//   // import * as Sentry from '@sentry/react-native';
//   //
//   // if (entry.severity === 'error' || entry.severity === 'fatal') {
//   //   Sentry.captureException(new Error(entry.message), {
//   //     tags: {
//   //       category: entry.category,
//   //       severity: entry.severity,
//   //     },
//   //     extra: entry.context,
//   //   });
//   // } else {
//   //   Sentry.addBreadcrumb({
//   //     category: entry.category,
//   //     message: entry.message,
//   //     level: entry.severity,
//   //     data: entry.context,
//   //   });
//   // }
// }

/**
 * Initialize Sentry (call in app entry point)
 * Uncomment and configure for production
 */
// export function initializeSentry(): void {
//   // import * as Sentry from '@sentry/react-native';
//   //
//   // Sentry.init({
//   //   dsn: 'YOUR_SENTRY_DSN',
//   //   environment: __DEV__ ? 'development' : 'production',
//   //   enableAutoSessionTracking: true,
//   //   sessionTrackingIntervalMillis: 30000,
//   //   attachStacktrace: true,
//   // });
// }

// =============================================================================
// Convenience Wrappers for Common Error Scenarios
// =============================================================================

/**
 * Log game-related errors
 */
export function logGameError(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
  logError('game', message, error, context);
}

/**
 * Log storage-related errors
 */
export function logStorageError(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
  logError('storage', message, error, context);
}

/**
 * Log network-related errors
 */
export function logNetworkError(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
  logError('network', message, error, context);
}

/**
 * Log UI-related errors
 */
export function logUIError(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
  logError('ui', message, error, context);
}

/**
 * Log notification-related errors
 */
export function logNotificationError(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
  logError('notification', message, error, context);
}

/**
 * Log Game Center errors
 */
export function logGameCenterError(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
  logError('gameCenter', message, error, context);
}

/**
 * Log audio-related errors
 */
export function logAudioError(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
  logError('audio', message, error, context);
}

/**
 * Wrap async function with error logging
 */
export function withErrorLogging<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  category: ErrorCategory,
  context?: Record<string, unknown>
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(category, `Error in ${fn.name || 'anonymous function'}`, error, {
        ...context,
        args: args.map((arg) => (typeof arg === 'object' ? '[object]' : arg)),
      });
      throw error;
    }
  }) as T;
}

/**
 * Performance tracking
 */
export function startPerformanceTrace(name: string): () => void {
  const startTime = Date.now();

  return () => {
    const duration = Date.now() - startTime;
    logDebug('general', `Performance: ${name}`, { duration, unit: 'ms' });
  };
}
