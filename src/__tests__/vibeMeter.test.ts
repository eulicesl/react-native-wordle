import { getArcColor, buildArcPath } from '../components/VibeMeter';

describe('getArcColor', () => {
  it('returns blue (#40C4FF) for score 0-19', () => {
    expect(getArcColor(0)).toBe('#40C4FF');
    expect(getArcColor(10)).toBe('#40C4FF');
    expect(getArcColor(19)).toBe('#40C4FF');
  });

  it('returns teal (#00BFA5) for score 20-39', () => {
    expect(getArcColor(20)).toBe('#00BFA5');
    expect(getArcColor(30)).toBe('#00BFA5');
    expect(getArcColor(39)).toBe('#00BFA5');
  });

  it('returns yellow (#FFD600) for score 40-59', () => {
    expect(getArcColor(40)).toBe('#FFD600');
    expect(getArcColor(50)).toBe('#FFD600');
    expect(getArcColor(59)).toBe('#FFD600');
  });

  it('returns orange (#FF9100) for score 60-79', () => {
    expect(getArcColor(60)).toBe('#FF9100');
    expect(getArcColor(70)).toBe('#FF9100');
    expect(getArcColor(79)).toBe('#FF9100');
  });

  it('returns purple (#7C4DFF) for score 80-100', () => {
    expect(getArcColor(80)).toBe('#7C4DFF');
    expect(getArcColor(90)).toBe('#7C4DFF');
    expect(getArcColor(100)).toBe('#7C4DFF');
  });
});

describe('buildArcPath', () => {
  it('builds a valid SVG semi-circle arc path', () => {
    const path = buildArcPath(50, 50, 46);
    // Should start at left (cx - r) and end at right (cx + r)
    expect(path).toBe('M 4 50 A 46 46 0 0 1 96 50');
  });

  it('handles different center and radius values', () => {
    const path = buildArcPath(70, 70, 66);
    expect(path).toBe('M 4 70 A 66 66 0 0 1 136 70');
  });

  it('produces start and end points at the same Y coordinate', () => {
    const path = buildArcPath(50, 50, 40);
    // Parse the M and end coordinates
    const parts = path.split(' ');
    const startY = Number(parts[2]);
    const endY = Number(parts[parts.length - 1]);
    expect(startY).toBe(endY);
  });

  it('produces an arc that spans the full diameter', () => {
    const cx = 50;
    const r = 40;
    const path = buildArcPath(cx, cx, r);
    const parts = path.split(' ');
    const startX = Number(parts[1]);
    const endX = Number(parts[parts.length - 2]);
    expect(endX - startX).toBe(2 * r);
  });
});
