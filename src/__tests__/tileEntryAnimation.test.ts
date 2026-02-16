import {
  TILE_ENTRY_SPRING,
  TILE_ENTRY_SCALE,
  TILE_ENTRY_BORDER_FLASH_MS,
} from '../utils/animations';

describe('Tile entry animation constants', () => {
  describe('TILE_ENTRY_SPRING', () => {
    it('should use damping of 12 for a satisfying pop', () => {
      expect(TILE_ENTRY_SPRING.damping).toBe(12);
    });

    it('should use stiffness of 350 for a snappy response', () => {
      expect(TILE_ENTRY_SPRING.stiffness).toBe(350);
    });

    it('should use mass of 0.8 for a lightweight feel', () => {
      expect(TILE_ENTRY_SPRING.mass).toBe(0.8);
    });

    it('should produce an underdamped spring (damping ratio < 1)', () => {
      // Damping ratio = damping / (2 * sqrt(stiffness * mass))
      const { damping, stiffness, mass } = TILE_ENTRY_SPRING;
      const criticalDamping = 2 * Math.sqrt(stiffness * mass);
      const dampingRatio = damping / criticalDamping;
      expect(dampingRatio).toBeLessThan(1);
      expect(dampingRatio).toBeGreaterThan(0);
    });
  });

  describe('TILE_ENTRY_SCALE', () => {
    it('should scale to 1.15 (15% larger)', () => {
      expect(TILE_ENTRY_SCALE).toBe(1.15);
    });

    it('should be greater than 1 (expand, not shrink)', () => {
      expect(TILE_ENTRY_SCALE).toBeGreaterThan(1);
    });

    it('should not be too large (max 1.3 for subtle pop)', () => {
      expect(TILE_ENTRY_SCALE).toBeLessThanOrEqual(1.3);
    });
  });

  describe('TILE_ENTRY_BORDER_FLASH_MS', () => {
    it('should be 150ms for a brief border highlight', () => {
      expect(TILE_ENTRY_BORDER_FLASH_MS).toBe(150);
    });

    it('should be short enough to feel snappy (under 300ms)', () => {
      expect(TILE_ENTRY_BORDER_FLASH_MS).toBeLessThan(300);
    });

    it('should be long enough to be perceptible (at least 50ms)', () => {
      expect(TILE_ENTRY_BORDER_FLASH_MS).toBeGreaterThanOrEqual(50);
    });
  });
});
