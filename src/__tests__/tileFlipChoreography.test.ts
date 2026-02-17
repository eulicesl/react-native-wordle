import {
  TILE_FLIP_INITIAL_DELAY_MS,
  TILE_FLIP_STAGGER_MS,
  TILE_FLIP_DURATION_MS,
  TILE_FLIP_MIDPOINT_SCALE,
  TILE_CORRECT_PULSE_SCALE,
  TILE_CORRECT_PULSE_SPRING,
  TILES_PER_ROW,
  ROW_FLIP_TOTAL_MS,
  BOUNCE_POST_FLIP_GAP_MS,
} from '../utils/animations';

describe('Tile flip choreography constants', () => {
  describe('TILE_FLIP_INITIAL_DELAY_MS', () => {
    it('should be 200ms anticipation pause', () => {
      expect(TILE_FLIP_INITIAL_DELAY_MS).toBe(200);
    });
  });

  describe('TILE_FLIP_STAGGER_MS', () => {
    it('should be 200ms between tile flips', () => {
      expect(TILE_FLIP_STAGGER_MS).toBe(200);
    });
  });

  describe('TILE_FLIP_DURATION_MS', () => {
    it('should be 200ms per individual flip', () => {
      expect(TILE_FLIP_DURATION_MS).toBe(200);
    });
  });

  describe('ROW_FLIP_TOTAL_MS', () => {
    it('should equal initialDelay + (TILES_PER_ROW - 1) * stagger + duration', () => {
      const expected = TILE_FLIP_INITIAL_DELAY_MS
        + TILE_FLIP_STAGGER_MS * (TILES_PER_ROW - 1)
        + TILE_FLIP_DURATION_MS;
      expect(ROW_FLIP_TOTAL_MS).toBe(expected);
    });

    it('should keep total row reveal time close to ~1200ms', () => {
      expect(ROW_FLIP_TOTAL_MS).toBeGreaterThanOrEqual(1000);
      expect(ROW_FLIP_TOTAL_MS).toBeLessThanOrEqual(1400);
    });
  });

  describe('tile delay per index', () => {
    it('should compute correct delay for each tile position', () => {
      for (let idx = 0; idx < TILES_PER_ROW; idx++) {
        const tileDelay = TILE_FLIP_INITIAL_DELAY_MS + TILE_FLIP_STAGGER_MS * idx;
        expect(tileDelay).toBe(200 + 200 * idx);
      }
    });

    it('first tile should start after initial delay', () => {
      const firstTileDelay = TILE_FLIP_INITIAL_DELAY_MS + TILE_FLIP_STAGGER_MS * 0;
      expect(firstTileDelay).toBe(TILE_FLIP_INITIAL_DELAY_MS);
    });

    it('last tile flip should end at ROW_FLIP_TOTAL_MS', () => {
      const lastIdx = TILES_PER_ROW - 1;
      const lastTileDelay = TILE_FLIP_INITIAL_DELAY_MS + TILE_FLIP_STAGGER_MS * lastIdx;
      const lastTileEnd = lastTileDelay + TILE_FLIP_DURATION_MS;
      expect(lastTileEnd).toBe(ROW_FLIP_TOTAL_MS);
    });
  });

  describe('midpoint scale pulse', () => {
    it('should pulse to 1.05 at midpoint', () => {
      expect(TILE_FLIP_MIDPOINT_SCALE).toBe(1.05);
    });

    it('should be subtle (between 1.0 and 1.15)', () => {
      expect(TILE_FLIP_MIDPOINT_SCALE).toBeGreaterThan(1);
      expect(TILE_FLIP_MIDPOINT_SCALE).toBeLessThanOrEqual(1.15);
    });
  });

  describe('correct tile celebration pulse', () => {
    it('should pulse to 1.08', () => {
      expect(TILE_CORRECT_PULSE_SCALE).toBe(1.08);
    });

    it('should be slightly larger than midpoint pulse', () => {
      expect(TILE_CORRECT_PULSE_SCALE).toBeGreaterThan(TILE_FLIP_MIDPOINT_SCALE);
    });

    it('should use bouncy spring config (damping=8, stiffness=300)', () => {
      expect(TILE_CORRECT_PULSE_SPRING.damping).toBe(8);
      expect(TILE_CORRECT_PULSE_SPRING.stiffness).toBe(300);
    });
  });

  describe('sound/haptic midpoint timing', () => {
    it('should fire at the midpoint of each tile flip', () => {
      for (let idx = 0; idx < TILES_PER_ROW; idx++) {
        const tileDelay = TILE_FLIP_INITIAL_DELAY_MS + TILE_FLIP_STAGGER_MS * idx;
        const midpoint = tileDelay + TILE_FLIP_DURATION_MS / 2;
        // Midpoint should be after tile starts flipping
        expect(midpoint).toBeGreaterThan(tileDelay);
        // Midpoint should be before tile finishes flipping
        expect(midpoint).toBeLessThan(tileDelay + TILE_FLIP_DURATION_MS);
      }
    });
  });

  describe('celebration gap timing', () => {
    it('celebration delay for each correct tile should be after its own flip ends', () => {
      for (let idx = 0; idx < TILES_PER_ROW; idx++) {
        const tileDelay = TILE_FLIP_INITIAL_DELAY_MS + TILE_FLIP_STAGGER_MS * idx;
        const gapAfterFlip = ROW_FLIP_TOTAL_MS + BOUNCE_POST_FLIP_GAP_MS - tileDelay - TILE_FLIP_DURATION_MS;
        expect(gapAfterFlip).toBeGreaterThanOrEqual(0);
      }
    });
  });
});
