/**
 * Theme Tests
 *
 * Verifies the OLED dark theme elevation system and color contrast ratios.
 * DarkTheme uses true black (#000000) for OLED screens with layered surfaces.
 */

import { LightTheme, DarkTheme } from '../theme';
import { colors } from '../utils/constants';

/**
 * Parse a hex color string to its RGB components.
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}

/**
 * Calculate relative luminance per WCAG 2.1.
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const [rs, gs, bs] = [r / 255, g / 255, b / 255].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * rs! + 0.7152 * gs! + 0.0722 * bs!;
}

/**
 * Calculate WCAG contrast ratio between two hex colors.
 */
function contrastRatio(fg: string, bg: string): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('DarkTheme OLED elevation system', () => {
  it('uses true black (#000000) as background', () => {
    expect(DarkTheme.colors.background).toBe('#000000');
  });

  it('has surface1 at #0D0D1A for elevated UI areas', () => {
    expect(DarkTheme.colors.surface1).toBe('#0D0D1A');
  });

  it('has background2 at #1A1A2E for cards and modals', () => {
    expect(DarkTheme.colors.background2).toBe('#1A1A2E');
  });

  it('has background3 at #252542 for interactive elements', () => {
    expect(DarkTheme.colors.background3).toBe('#252542');
  });

  it('maintains ascending luminance: background < surface1 < background2 < background3', () => {
    const bgLum = relativeLuminance(DarkTheme.colors.background);
    const s1Lum = relativeLuminance(DarkTheme.colors.surface1);
    const bg2Lum = relativeLuminance(DarkTheme.colors.background2);
    const bg3Lum = relativeLuminance(DarkTheme.colors.background3);

    expect(bgLum).toBeLessThan(s1Lum);
    expect(s1Lum).toBeLessThan(bg2Lum);
    expect(bg2Lum).toBeLessThan(bg3Lum);
  });
});

describe('LightTheme has matching surface1 key', () => {
  it('defines surface1 to maintain type parity with DarkTheme', () => {
    expect(LightTheme.colors.surface1).toBeDefined();
    expect(typeof LightTheme.colors.surface1).toBe('string');
  });
});

describe('constants.colors.bg matches DarkTheme background', () => {
  it('uses true black (#000000)', () => {
    expect(colors.bg).toBe('#000000');
  });
});

describe('text contrast ratios meet WCAG AA (4.5:1 minimum)', () => {
  it('DarkTheme: white text on true black background', () => {
    const ratio = contrastRatio(DarkTheme.colors.text, DarkTheme.colors.background);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('DarkTheme: white text on surface1', () => {
    const ratio = contrastRatio(DarkTheme.colors.text, DarkTheme.colors.surface1);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('DarkTheme: white text on background2 (cards)', () => {
    const ratio = contrastRatio(DarkTheme.colors.text, DarkTheme.colors.background2);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('DarkTheme: white text on background3 (interactive)', () => {
    const ratio = contrastRatio(DarkTheme.colors.text, DarkTheme.colors.background3);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('DarkTheme: secondary text on background has sufficient contrast', () => {
    const ratio = contrastRatio(DarkTheme.colors.secondary, DarkTheme.colors.background);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('LightTheme: dark text on light background', () => {
    const ratio = contrastRatio(LightTheme.colors.text, LightTheme.colors.background);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('LightTheme: dark text on background2', () => {
    const ratio = contrastRatio(LightTheme.colors.text, LightTheme.colors.background2);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});

describe('theme shape parity', () => {
  it('DarkTheme and LightTheme have identical color keys', () => {
    const darkKeys = Object.keys(DarkTheme.colors).sort();
    const lightKeys = Object.keys(LightTheme.colors).sort();
    expect(darkKeys).toEqual(lightKeys);
  });
});
