/**
 * Spacing scale for WordVibe, based on a 4px grid.
 *
 * Usage:
 *   import { spacing, space4 } from '../utils/spacing';
 *   { padding: spacing.md }      // semantic — preferred
 *   { marginBottom: space4 }     // numeric — when semantic doesn't fit
 */

// ── Grid-based scale (multiples of 4) ────────────────────────────
export const space1 = 4;
export const space2 = 8;
export const space3 = 12;
export const space4 = 16;
export const space5 = 20;
export const space6 = 24;
export const space8 = 32;
export const space10 = 40;
export const space12 = 48;
export const space16 = 64;

// ── Semantic aliases ─────────────────────────────────────────────
export const spacing = {
  xs: space1,   //  4
  sm: space2,   //  8
  md: space4,   // 16
  lg: space6,   // 24
  xl: space8,   // 32
  xxl: space12, // 48
} as const;
