import { StyleSheet, TextStyle } from 'react-native';

import { dynamicFontSize } from './responsive';

/**
 * Named typography scale for WordVibe.
 *
 * Usage:
 *   <Text style={[typography.heading1, themedStyles.text]}>Title</Text>
 *
 * For accessibility-scaled text:
 *   <Text style={dynamicText(typography.body)}>Content</Text>
 */

const typographyDef = {
  display: {
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 36,
  },
  heading1: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 26,
  },
  heading2: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 20,
  },
  heading3: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 17,
  },
  body: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 15,
    lineHeight: 22,
  },
  bodySmall: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 13,
    lineHeight: 18,
  },
  statNumber: {
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 32,
  },
} as const satisfies Record<string, TextStyle>;

export type TypographyStyle = keyof typeof typographyDef;

export const typography = StyleSheet.create(typographyDef);

/**
 * Wraps a typography style with dynamicFontSize() for accessibility scaling.
 * Returns a new TextStyle with the fontSize adjusted by the user's system text
 * size preference, capped at `maxScale`.
 */
export function dynamicText(style: TextStyle, maxScale = 1.5): TextStyle {
  const { fontSize, ...rest } = style;
  if (fontSize == null) return style;
  return {
    ...rest,
    fontSize: dynamicFontSize(fontSize, maxScale),
  };
}
