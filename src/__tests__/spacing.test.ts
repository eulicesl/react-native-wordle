import {
  space1,
  space2,
  space3,
  space4,
  space5,
  space6,
  space8,
  space10,
  space12,
  space16,
  spacing,
} from '../utils/spacing';

describe('grid-based spacing scale', () => {
  const gridValues: [string, number, number][] = [
    ['space1', space1, 4],
    ['space2', space2, 8],
    ['space3', space3, 12],
    ['space4', space4, 16],
    ['space5', space5, 20],
    ['space6', space6, 24],
    ['space8', space8, 32],
    ['space10', space10, 40],
    ['space12', space12, 48],
    ['space16', space16, 64],
  ];

  it.each(gridValues)('%s equals %i', (_name, actual, expected) => {
    expect(actual).toBe(expected);
  });

  it.each(gridValues)('%s is a multiple of 4', (_name, actual) => {
    expect(actual % 4).toBe(0);
  });
});

describe('semantic spacing aliases', () => {
  it('maps xs to space1 (4)', () => {
    expect(spacing.xs).toBe(4);
  });

  it('maps sm to space2 (8)', () => {
    expect(spacing.sm).toBe(8);
  });

  it('maps md to space4 (16)', () => {
    expect(spacing.md).toBe(16);
  });

  it('maps lg to space6 (24)', () => {
    expect(spacing.lg).toBe(24);
  });

  it('maps xl to space8 (32)', () => {
    expect(spacing.xl).toBe(32);
  });

  it('maps xxl to space12 (48)', () => {
    expect(spacing.xxl).toBe(48);
  });

  it('exports exactly 6 semantic keys', () => {
    expect(Object.keys(spacing)).toHaveLength(6);
  });
});
