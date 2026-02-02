import statisticsReducer, {
  setStatistics,
  recordGameWin,
  recordGameLoss,
  resetStatistics,
  setStatisticsLoaded,
  GameStatistics,
  StatisticsState,
} from '../store/slices/statisticsSlice';

const initialStatistics: GameStatistics = {
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: [0, 0, 0, 0, 0, 0],
  lastPlayedDate: null,
  lastCompletedDate: null,
};

const initialState: StatisticsState = {
  statistics: initialStatistics,
  isLoaded: false,
};

describe('statisticsSlice', () => {
  describe('setStatistics', () => {
    it('should set statistics and mark as loaded', () => {
      const newStats: GameStatistics = {
        gamesPlayed: 10,
        gamesWon: 8,
        currentStreak: 3,
        maxStreak: 5,
        guessDistribution: [1, 2, 2, 2, 1, 0],
        lastPlayedDate: '2024-01-15',
        lastCompletedDate: '2024-01-15',
      };

      const state = statisticsReducer(initialState, setStatistics(newStats));
      expect(state.statistics).toEqual(newStats);
      expect(state.isLoaded).toBe(true);
    });
  });

  describe('recordGameWin', () => {
    it('should increment games played and won', () => {
      const state = statisticsReducer(
        initialState,
        recordGameWin({ guessCount: 3, date: '2024-01-15', isDaily: true })
      );

      expect(state.statistics.gamesPlayed).toBe(1);
      expect(state.statistics.gamesWon).toBe(1);
    });

    it('should update guess distribution correctly', () => {
      const state = statisticsReducer(
        initialState,
        recordGameWin({ guessCount: 3, date: '2024-01-15', isDaily: true })
      );

      expect(state.statistics.guessDistribution).toEqual([0, 0, 1, 0, 0, 0]);
    });

    it('should handle win in 1 guess', () => {
      const state = statisticsReducer(
        initialState,
        recordGameWin({ guessCount: 1, date: '2024-01-15', isDaily: true })
      );

      expect(state.statistics.guessDistribution).toEqual([1, 0, 0, 0, 0, 0]);
    });

    it('should handle win in 6 guesses', () => {
      const state = statisticsReducer(
        initialState,
        recordGameWin({ guessCount: 6, date: '2024-01-15', isDaily: true })
      );

      expect(state.statistics.guessDistribution).toEqual([0, 0, 0, 0, 0, 1]);
    });

    it('should start streak at 1 for first win', () => {
      const state = statisticsReducer(
        initialState,
        recordGameWin({ guessCount: 3, date: '2024-01-15', isDaily: true })
      );

      expect(state.statistics.currentStreak).toBe(1);
      expect(state.statistics.maxStreak).toBe(1);
    });

    it('should increment streak on consecutive days', () => {
      let state = statisticsReducer(
        initialState,
        recordGameWin({ guessCount: 3, date: '2024-01-15', isDaily: true })
      );

      state = statisticsReducer(
        state,
        recordGameWin({ guessCount: 4, date: '2024-01-16', isDaily: true })
      );

      expect(state.statistics.currentStreak).toBe(2);
      expect(state.statistics.maxStreak).toBe(2);
    });

    it('should reset streak when days are not consecutive', () => {
      let state = statisticsReducer(
        initialState,
        recordGameWin({ guessCount: 3, date: '2024-01-15', isDaily: true })
      );

      state = statisticsReducer(
        state,
        recordGameWin({ guessCount: 4, date: '2024-01-17', isDaily: true }) // Skipped a day
      );

      expect(state.statistics.currentStreak).toBe(1);
      expect(state.statistics.maxStreak).toBe(1);
    });

    it('should not increment streak for same day wins', () => {
      let state = statisticsReducer(
        initialState,
        recordGameWin({ guessCount: 3, date: '2024-01-15', isDaily: true })
      );

      state = statisticsReducer(
        state,
        recordGameWin({ guessCount: 4, date: '2024-01-15', isDaily: true }) // Same day
      );

      expect(state.statistics.currentStreak).toBe(1);
      expect(state.statistics.gamesPlayed).toBe(2);
      expect(state.statistics.gamesWon).toBe(2);
    });

    it('should preserve max streak when current streak resets', () => {
      let state = statisticsReducer(
        initialState,
        recordGameWin({ guessCount: 3, date: '2024-01-15', isDaily: true })
      );
      state = statisticsReducer(
        state,
        recordGameWin({ guessCount: 3, date: '2024-01-16', isDaily: true })
      );
      state = statisticsReducer(
        state,
        recordGameWin({ guessCount: 3, date: '2024-01-17', isDaily: true })
      );

      expect(state.statistics.currentStreak).toBe(3);
      expect(state.statistics.maxStreak).toBe(3);

      // Skip a day
      state = statisticsReducer(
        state,
        recordGameWin({ guessCount: 3, date: '2024-01-19', isDaily: true })
      );

      expect(state.statistics.currentStreak).toBe(1);
      expect(state.statistics.maxStreak).toBe(3); // Max preserved
    });

    it('should not affect streak for unlimited mode wins', () => {
      const state = statisticsReducer(
        initialState,
        recordGameWin({ guessCount: 3, date: '2024-01-15', isDaily: false })
      );

      expect(state.statistics.gamesPlayed).toBe(1);
      expect(state.statistics.gamesWon).toBe(1);
      expect(state.statistics.currentStreak).toBe(0); // No streak for unlimited
      expect(state.statistics.lastCompletedDate).toBeNull(); // Not updated for unlimited
    });

    it('should update lastPlayedDate and lastCompletedDate', () => {
      const state = statisticsReducer(
        initialState,
        recordGameWin({ guessCount: 3, date: '2024-01-15', isDaily: true })
      );

      expect(state.statistics.lastPlayedDate).toBe('2024-01-15');
      expect(state.statistics.lastCompletedDate).toBe('2024-01-15');
    });
  });

  describe('recordGameLoss', () => {
    it('should increment games played but not won', () => {
      const state = statisticsReducer(
        initialState,
        recordGameLoss({ date: '2024-01-15', isDaily: true })
      );

      expect(state.statistics.gamesPlayed).toBe(1);
      expect(state.statistics.gamesWon).toBe(0);
    });

    it('should reset current streak to 0 for daily games', () => {
      let state = statisticsReducer(
        initialState,
        recordGameWin({ guessCount: 3, date: '2024-01-15', isDaily: true })
      );
      state = statisticsReducer(
        state,
        recordGameWin({ guessCount: 3, date: '2024-01-16', isDaily: true })
      );

      expect(state.statistics.currentStreak).toBe(2);

      state = statisticsReducer(
        state,
        recordGameLoss({ date: '2024-01-17', isDaily: true })
      );

      expect(state.statistics.currentStreak).toBe(0);
      expect(state.statistics.maxStreak).toBe(2); // Max preserved
    });

    it('should not affect streak for unlimited mode losses', () => {
      let state = statisticsReducer(
        initialState,
        recordGameWin({ guessCount: 3, date: '2024-01-15', isDaily: true })
      );

      state = statisticsReducer(
        state,
        recordGameLoss({ date: '2024-01-15', isDaily: false })
      );

      expect(state.statistics.currentStreak).toBe(1); // Preserved
      expect(state.statistics.gamesPlayed).toBe(2);
    });

    it('should not update lastCompletedDate for unlimited mode', () => {
      let state = statisticsReducer(
        initialState,
        recordGameWin({ guessCount: 3, date: '2024-01-15', isDaily: true })
      );

      state = statisticsReducer(
        state,
        recordGameLoss({ date: '2024-01-16', isDaily: false })
      );

      expect(state.statistics.lastCompletedDate).toBe('2024-01-15');
      expect(state.statistics.lastPlayedDate).toBe('2024-01-16');
    });
  });

  describe('resetStatistics', () => {
    it('should reset all statistics to initial values', () => {
      let state = statisticsReducer(
        initialState,
        recordGameWin({ guessCount: 3, date: '2024-01-15', isDaily: true })
      );
      state = statisticsReducer(
        state,
        recordGameWin({ guessCount: 4, date: '2024-01-16', isDaily: true })
      );

      state = statisticsReducer(state, resetStatistics());

      expect(state.statistics).toEqual(initialStatistics);
    });
  });

  describe('setStatisticsLoaded', () => {
    it('should set the loaded flag', () => {
      const state = statisticsReducer(initialState, setStatisticsLoaded(true));
      expect(state.isLoaded).toBe(true);
    });
  });

  describe('streak edge cases', () => {
    it('should handle month boundary correctly', () => {
      let state = statisticsReducer(
        initialState,
        recordGameWin({ guessCount: 3, date: '2024-01-31', isDaily: true })
      );

      state = statisticsReducer(
        state,
        recordGameWin({ guessCount: 3, date: '2024-02-01', isDaily: true })
      );

      expect(state.statistics.currentStreak).toBe(2);
    });

    it('should handle year boundary correctly', () => {
      let state = statisticsReducer(
        initialState,
        recordGameWin({ guessCount: 3, date: '2023-12-31', isDaily: true })
      );

      state = statisticsReducer(
        state,
        recordGameWin({ guessCount: 3, date: '2024-01-01', isDaily: true })
      );

      expect(state.statistics.currentStreak).toBe(2);
    });

    it('should handle leap year correctly', () => {
      let state = statisticsReducer(
        initialState,
        recordGameWin({ guessCount: 3, date: '2024-02-28', isDaily: true })
      );

      state = statisticsReducer(
        state,
        recordGameWin({ guessCount: 3, date: '2024-02-29', isDaily: true })
      );

      state = statisticsReducer(
        state,
        recordGameWin({ guessCount: 3, date: '2024-03-01', isDaily: true })
      );

      expect(state.statistics.currentStreak).toBe(3);
    });

    it('should handle non-leap year correctly', () => {
      let state = statisticsReducer(
        initialState,
        recordGameWin({ guessCount: 3, date: '2023-02-28', isDaily: true })
      );

      state = statisticsReducer(
        state,
        recordGameWin({ guessCount: 3, date: '2023-03-01', isDaily: true })
      );

      expect(state.statistics.currentStreak).toBe(2);
    });
  });

  describe('win percentage calculation', () => {
    it('should allow calculating correct win percentage', () => {
      let state = initialState;

      // Win 3 games
      state = statisticsReducer(state, recordGameWin({ guessCount: 3, date: '2024-01-15', isDaily: true }));
      state = statisticsReducer(state, recordGameWin({ guessCount: 3, date: '2024-01-16', isDaily: true }));
      state = statisticsReducer(state, recordGameWin({ guessCount: 3, date: '2024-01-17', isDaily: true }));

      // Lose 1 game
      state = statisticsReducer(state, recordGameLoss({ date: '2024-01-18', isDaily: true }));

      const winPercentage = (state.statistics.gamesWon / state.statistics.gamesPlayed) * 100;
      expect(winPercentage).toBe(75);
    });
  });
});
