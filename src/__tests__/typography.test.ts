import { TextStyle } from 'react-native';

import { typography, dynamicText, TypographyStyle } from '../utils/typography';

jest.mock('react-native', () => ({
  StyleSheet: {
    create: <T extends Record<string, unknown>>(styles: T): T => styles,
  },
  Dimensions: {
    get: () => ({ width: 375, height: 812, scale: 2, fontScale: 1 }),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
  PixelRatio: {
    getFontScale: jest.fn(() => 1.0),
    roundToNearestPixel: (size: number) => Math.round(size),
  },
}));

describe('typography', () => {
  const expectedStyles: Record<TypographyStyle, { fontFamily: string; fontSize: number; lineHeight?: number }> = {
    display: { fontFamily: 'Montserrat_800ExtraBold', fontSize: 36 },
    heading1: { fontFamily: 'Montserrat_700Bold', fontSize: 26 },
    heading2: { fontFamily: 'Montserrat_700Bold', fontSize: 20 },
    heading3: { fontFamily: 'Montserrat_700Bold', fontSize: 17 },
    body: { fontFamily: 'Montserrat_600SemiBold', fontSize: 15, lineHeight: 22 },
    bodySmall: { fontFamily: 'Montserrat_600SemiBold', fontSize: 13, lineHeight: 18 },
    statNumber: { fontFamily: 'Montserrat_800ExtraBold', fontSize: 32 },
  };

  it.each(Object.keys(expectedStyles) as TypographyStyle[])('defines %s with correct properties', (key) => {
    const style = typography[key] as TextStyle;
    expect(style.fontFamily).toBe(expectedStyles[key].fontFamily);
    expect(style.fontSize).toBe(expectedStyles[key].fontSize);
    if (expectedStyles[key].lineHeight != null) {
      expect(style.lineHeight).toBe(expectedStyles[key].lineHeight);
    }
  });

  it('exports all 7 named styles', () => {
    expect(Object.keys(typography)).toHaveLength(7);
  });
});

describe('dynamicText', () => {
  it('returns a style with fontSize scaled by dynamicFontSize', () => {
    const result = dynamicText({ fontFamily: 'Montserrat_700Bold', fontSize: 20 });
    // With font scale 1.0, dynamicFontSize(20, 1.5) = 20
    expect(result.fontSize).toBe(20);
    expect(result.fontFamily).toBe('Montserrat_700Bold');
  });

  it('preserves non-fontSize properties', () => {
    const result = dynamicText({
      fontFamily: 'Montserrat_600SemiBold',
      fontSize: 15,
      lineHeight: 22,
      letterSpacing: 1,
    });
    expect(result.lineHeight).toBe(22);
    expect(result.letterSpacing).toBe(1);
    expect(result.fontFamily).toBe('Montserrat_600SemiBold');
  });

  it('returns style unchanged when fontSize is undefined', () => {
    const input: TextStyle = { fontFamily: 'Montserrat_700Bold' };
    const result = dynamicText(input);
    expect(result).toBe(input);
  });

  it('respects custom maxScale parameter', () => {
    const result = dynamicText({ fontSize: 20 }, 1.2);
    // With fontScale 1.0 and maxScale 1.2, result should be same as base
    expect(result.fontSize).toBe(20);
  });

  it('works with typography styles directly', () => {
    const result = dynamicText(typography.body as TextStyle);
    expect(result.fontFamily).toBe('Montserrat_600SemiBold');
    expect(result.fontSize).toBe(15);
    expect(result.lineHeight).toBe(22);
  });
});
