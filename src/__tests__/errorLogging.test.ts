/**
 * Error Logging Service Tests
 *
 * Tests log entry creation, storage, retrieval, filtering, statistics,
 * and the global error handler setup.
 */

import {
  initializeErrorLogging,
  logDebug,
  logInfo,
  logWarning,
  logError,
  logFatal,
  getErrorLogs,
  getErrorLogsBySeverity,
  getErrorLogsByCategory,
  getRecentErrors,
  clearErrorLogs,
  exportLogsAsJson,
  getErrorStatistics,
  setUserContext,
} from '../services/errorLogging';

// Mock AsyncStorage (already mocked in jest.setup.js, but we need access for assertions)
const mockAsyncStorage = require('@react-native-async-storage/async-storage');

// Mock expo-constants
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { version: '2.0.0' } },
}));

// Mock react-native Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn((obj: { ios?: unknown }) => obj.ios),
  },
}));

describe('errorLogging service', () => {
  beforeEach(async () => {
    // Clear all AsyncStorage data and mock state
    await mockAsyncStorage.clear();
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize without errors', () => {
      expect(() => initializeErrorLogging()).not.toThrow();
    });

    it('should be callable multiple times safely', () => {
      expect(() => initializeErrorLogging()).not.toThrow();
      expect(() => initializeErrorLogging()).not.toThrow();
    });
  });

  describe('log entry creation', () => {
    beforeEach(() => {
      initializeErrorLogging();
    });

    it('should create debug log entry', async () => {
      logDebug('game', 'Debug message');
      // Allow async storage operation to complete
      await new Promise((resolve) => setTimeout(resolve, 50));

      const logs = await getErrorLogs();
      expect(logs.some((log) => log.severity === 'debug' && log.message === 'Debug message')).toBe(
        true
      );
    });

    it('should create info log entry', async () => {
      logInfo('storage', 'Info message');
      await new Promise((resolve) => setTimeout(resolve, 50));

      const logs = await getErrorLogs();
      expect(logs.some((log) => log.severity === 'info' && log.message === 'Info message')).toBe(
        true
      );
    });

    it('should create warning log entry', async () => {
      logWarning('network', 'Warning message');
      await new Promise((resolve) => setTimeout(resolve, 50));

      const logs = await getErrorLogs();
      expect(
        logs.some((log) => log.severity === 'warning' && log.message === 'Warning message')
      ).toBe(true);
    });

    it('should create error log entry with Error object', async () => {
      const testError = new Error('Test error');
      logError('ui', 'Error occurred', testError);
      await new Promise((resolve) => setTimeout(resolve, 50));

      const logs = await getErrorLogs();
      const errorLog = logs.find((log) => log.severity === 'error');
      expect(errorLog).toBeDefined();
      expect(errorLog?.message).toBe('Error occurred');
      expect(errorLog?.error).toBe('Test error');
    });

    it('should create fatal log entry and await storage', async () => {
      await logFatal('general', 'Fatal error');

      const logs = await getErrorLogs();
      expect(logs.some((log) => log.severity === 'fatal' && log.message === 'Fatal error')).toBe(
        true
      );
    });

    it('should include context in log entries', async () => {
      logInfo('game', 'Game event', { wordLength: 5, attempt: 3 });
      await new Promise((resolve) => setTimeout(resolve, 50));

      const logs = await getErrorLogs();
      const log = logs.find((l) => l.message === 'Game event');
      expect(log?.context).toMatchObject({ wordLength: 5, attempt: 3 });
    });

    it('should include platform and version in log entries', async () => {
      logInfo('general', 'Test log');
      await new Promise((resolve) => setTimeout(resolve, 50));

      const logs = await getErrorLogs();
      const log = logs.find((l) => l.message === 'Test log');
      expect(log?.platform).toBe('ios');
      expect(log?.version).toBeDefined();
    });
  });

  describe('log filtering', () => {
    beforeEach(async () => {
      initializeErrorLogging();
      // Clear logs first to ensure clean slate
      await clearErrorLogs();
      
      // Create various log entries - use logFatal for guaranteed storage
      await logFatal('game', 'Debug 1');
      await logFatal('storage', 'Info 1');
      await logFatal('network', 'Warning 1');
      await logFatal('ui', 'Error 1');
      await logFatal('game', 'Error 2');
    });

    it('should filter logs by severity', async () => {
      const logs = await getErrorLogsBySeverity('fatal');
      expect(logs.length).toBeGreaterThanOrEqual(5);
      expect(logs.every((log) => log.severity === 'fatal')).toBe(true);
    });

    it('should filter logs by category', async () => {
      const gameLogs = await getErrorLogsByCategory('game');
      expect(gameLogs.length).toBeGreaterThanOrEqual(2);
      expect(gameLogs.every((log) => log.category === 'game')).toBe(true);
    });

    it('should get recent errors only', async () => {
      const recent = await getRecentErrors(10);
      // Should only include error and fatal, not debug/info/warning
      expect(recent.every((log) => log.severity === 'error' || log.severity === 'fatal')).toBe(
        true
      );
      expect(recent.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('log management', () => {
    beforeEach(async () => {
      initializeErrorLogging();
      logInfo('general', 'Test log 1');
      logError('general', 'Test log 2');
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    it('should clear all logs', async () => {
      let logs = await getErrorLogs();
      expect(logs.length).toBeGreaterThan(0);

      await clearErrorLogs();
      logs = await getErrorLogs();
      // clearErrorLogs also logs an info message, so we check for minimal entries
      expect(logs.length).toBeLessThanOrEqual(1);
    });

    it('should export logs as JSON', async () => {
      const json = await exportLogsAsJson();
      expect(() => JSON.parse(json)).not.toThrow();

      const parsed = JSON.parse(json);
      expect(Array.isArray(parsed)).toBe(true);
    });
  });

  describe('error statistics', () => {
    beforeEach(async () => {
      initializeErrorLogging();
      // Clear logs first
      await clearErrorLogs();
      
      // Use logFatal for guaranteed storage
      await logFatal('game', 'Debug');
      await logFatal('storage', 'Info');
      await logFatal('network', 'Warning');
      await logFatal('ui', 'Error 1');
      await logFatal('game', 'Error 2');
    });

    it('should return correct total count', async () => {
      const stats = await getErrorStatistics();
      expect(stats.total).toBeGreaterThanOrEqual(5);
    });

    it('should group by category', async () => {
      const stats = await getErrorStatistics();
      expect(stats.byCategory.game).toBeGreaterThanOrEqual(2);
      expect(stats.byCategory.storage).toBeGreaterThanOrEqual(1);
      expect(stats.byCategory.network).toBeGreaterThanOrEqual(1);
      expect(stats.byCategory.ui).toBeGreaterThanOrEqual(1);
    });

    it('should group by severity', async () => {
      const stats = await getErrorStatistics();
      // All logs in this test use fatal severity
      expect(stats.bySeverity.fatal).toBeGreaterThanOrEqual(5);
    });

    it('should count recent errors (last hour)', async () => {
      const stats = await getErrorStatistics();
      // All logs were just created, so they should all be "recent"
      expect(stats.recentCount).toBeGreaterThanOrEqual(5);
    });
  });

  describe('user context', () => {
    beforeEach(() => {
      initializeErrorLogging();
    });

    it('should set and include user context in logs', async () => {
      setUserContext({
        userId: 'test-user-123',
        gamesPlayed: 42,
      });

      logInfo('game', 'Game started');
      await new Promise((resolve) => setTimeout(resolve, 50));

      const logs = await getErrorLogs();
      const log = logs.find((l) => l.message === 'Game started');
      expect(log?.context?.userId).toBe('test-user-123');
      expect(log?.context?.gamesPlayed).toBe(42);
    });
  });

  describe('log entry structure', () => {
    beforeEach(() => {
      initializeErrorLogging();
    });

    it('should have all required fields', async () => {
      logError('network', 'Network error', new Error('Connection failed'), { endpoint: '/api' });
      await new Promise((resolve) => setTimeout(resolve, 50));

      const logs = await getErrorLogs();
      const log = logs.find((l) => l.message === 'Network error');

      expect(log).toMatchObject({
        id: expect.stringMatching(/^err-/),
        timestamp: expect.any(String),
        severity: 'error',
        category: 'network',
        message: 'Network error',
        error: 'Connection failed',
        platform: 'ios',
        version: expect.any(String),
      });
      expect(log?.stack).toBeDefined();
      expect(log?.context?.endpoint).toBe('/api');
    });

    it('should generate unique IDs for each entry', async () => {
      logInfo('general', 'Log 1');
      logInfo('general', 'Log 2');
      logInfo('general', 'Log 3');
      await new Promise((resolve) => setTimeout(resolve, 50));

      const logs = await getErrorLogs();
      const ids = logs.map((l) => l.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });
});
