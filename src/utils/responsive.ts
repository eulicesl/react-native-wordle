import { Dimensions, Platform, PixelRatio, ScaledSize } from 'react-native';

// Device breakpoints
export const BREAKPOINTS = {
  phone: 0,
  phoneLarge: 414,
  tablet: 768,
  tabletLarge: 1024,
  desktop: 1280,
} as const;

export type DeviceType = 'phone' | 'phoneLarge' | 'tablet' | 'tabletLarge' | 'desktop';

// Get current window dimensions
function getWindowDimensions(): ScaledSize {
  return Dimensions.get('window');
}

// Determine device type based on width
export function getDeviceType(): DeviceType {
  const { width } = getWindowDimensions();

  if (width >= BREAKPOINTS.desktop) return 'desktop';
  if (width >= BREAKPOINTS.tabletLarge) return 'tabletLarge';
  if (width >= BREAKPOINTS.tablet) return 'tablet';
  if (width >= BREAKPOINTS.phoneLarge) return 'phoneLarge';
  return 'phone';
}

// Check if device is tablet
export function isTablet(): boolean {
  const deviceType = getDeviceType();
  return deviceType === 'tablet' || deviceType === 'tabletLarge';
}

// Check if device is iPad specifically
export function isIPad(): boolean {
  if (Platform.OS !== 'ios') return false;
  const { width, height } = getWindowDimensions();
  // iPad mini is 768x1024, iPad Pro can be much larger
  return Math.min(width, height) >= 768;
}

// Get responsive value based on device type
export function responsive<T>(values: {
  phone: T;
  phoneLarge?: T;
  tablet?: T;
  tabletLarge?: T;
  desktop?: T;
}): T {
  const deviceType = getDeviceType();

  switch (deviceType) {
    case 'desktop':
      return values.desktop ?? values.tabletLarge ?? values.tablet ?? values.phone;
    case 'tabletLarge':
      return values.tabletLarge ?? values.tablet ?? values.phone;
    case 'tablet':
      return values.tablet ?? values.phone;
    case 'phoneLarge':
      return values.phoneLarge ?? values.phone;
    default:
      return values.phone;
  }
}

// Scale font size based on device
export function scaledFontSize(baseFontSize: number): number {
  const { width } = getWindowDimensions();
  const scale = width / 375; // iPhone 8 as base

  const scaledSize = baseFontSize * Math.min(scale, 1.5);
  return Math.round(PixelRatio.roundToNearestPixel(scaledSize));
}

// Scale spacing/dimensions based on device
export function scaledSize(baseSize: number): number {
  const { width } = getWindowDimensions();
  const scale = width / 375;

  return Math.round(baseSize * Math.min(scale, 2));
}

// Get optimal game board size for current device
export function getGameBoardDimensions(): {
  boardWidth: number;
  boardHeight: number;
  tileSize: number;
  tileGap: number;
  keyboardHeight: number;
} {
  const { width, height } = getWindowDimensions();

  // Calculate optimal tile size based on available space
  const maxBoardWidth = Math.min(width * 0.95, 500);
  const tileGap = responsive({ phone: 5, tablet: 8, tabletLarge: 10 });
  const tileSize = Math.floor((maxBoardWidth - tileGap * 6) / 5);

  // Keyboard height as percentage of screen
  const keyboardHeightPercent = responsive({
    phone: 0.28,
    phoneLarge: 0.26,
    tablet: 0.22,
    tabletLarge: 0.20,
  });

  const keyboardHeight = height * keyboardHeightPercent;

  // Board dimensions
  const boardWidth = tileSize * 5 + tileGap * 6;
  const boardHeight = tileSize * 6 + tileGap * 7;

  return {
    boardWidth,
    boardHeight,
    tileSize,
    tileGap,
    keyboardHeight,
  };
}

// iPad-specific layout adjustments
export interface IPadLayout {
  useSplitView: boolean;
  sidebarWidth: number;
  contentMaxWidth: number;
  gridColumns: number;
  padding: {
    horizontal: number;
    vertical: number;
  };
}

export function getIPadLayout(): IPadLayout {
  const { width } = getWindowDimensions();
  const deviceType = getDeviceType();

  if (deviceType === 'tabletLarge' || (deviceType === 'tablet' && width > 900)) {
    // iPad Pro in landscape or large iPads
    return {
      useSplitView: true,
      sidebarWidth: 320,
      contentMaxWidth: 600,
      gridColumns: 3,
      padding: { horizontal: 40, vertical: 30 },
    };
  }

  if (deviceType === 'tablet') {
    // iPad in portrait
    return {
      useSplitView: false,
      sidebarWidth: 0,
      contentMaxWidth: 500,
      gridColumns: 2,
      padding: { horizontal: 32, vertical: 24 },
    };
  }

  // Phone layout
  return {
    useSplitView: false,
    sidebarWidth: 0,
    contentMaxWidth: width,
    gridColumns: 1,
    padding: { horizontal: 16, vertical: 16 },
  };
}

// Get keyboard key sizes for current device
export function getKeyboardSizes(): {
  keyWidth: number;
  keyHeight: number;
  keyGap: number;
  fontSize: number;
  wideKeyMultiplier: number;
} {
  const { width } = getWindowDimensions();

  const baseKeyWidth = responsive({
    phone: Math.floor((width - 60) / 10),
    phoneLarge: Math.floor((width - 70) / 10),
    tablet: 50,
    tabletLarge: 56,
  });

  return {
    keyWidth: baseKeyWidth,
    keyHeight: responsive({ phone: 50, phoneLarge: 54, tablet: 60, tabletLarge: 66 }),
    keyGap: responsive({ phone: 4, tablet: 6, tabletLarge: 8 }),
    fontSize: responsive({ phone: 14, phoneLarge: 15, tablet: 18, tabletLarge: 20 }),
    wideKeyMultiplier: responsive({ phone: 1.5, tablet: 1.6 }),
  };
}

// Statistics card layout for iPad
export function getStatisticsLayout(): {
  cardWidth: number;
  chartHeight: number;
  columns: number;
  gap: number;
} {
  const { width } = getWindowDimensions();

  return {
    cardWidth: responsive({
      phone: width - 32,
      tablet: Math.min(width * 0.45, 350),
      tabletLarge: 320,
    }),
    chartHeight: responsive({ phone: 200, tablet: 250, tabletLarge: 280 }),
    columns: responsive({ phone: 1, tablet: 2, tabletLarge: 2 }),
    gap: responsive({ phone: 16, tablet: 24, tabletLarge: 32 }),
  };
}

// Add dimension change listener
export function addDimensionListener(
  callback: (dimensions: { window: ScaledSize; screen: ScaledSize }) => void
): { remove: () => void } {
  const subscription = Dimensions.addEventListener('change', callback);
  return subscription as unknown as { remove: () => void };
}

// Dynamic Type scale factors (iOS accessibility)
export const DYNAMIC_TYPE_SCALES = {
  xSmall: 0.82,
  small: 0.88,
  medium: 0.94,
  large: 1.0, // Default
  xLarge: 1.12,
  xxLarge: 1.24,
  xxxLarge: 1.36,
  accessibility1: 1.53,
  accessibility2: 1.76,
  accessibility3: 2.0,
  accessibility4: 2.35,
  accessibility5: 2.76,
} as const;

// Get user's preferred text size multiplier
export function getTextSizeMultiplier(): number {
  // In a full implementation, this would read from AccessibilityInfo
  // For now, return default
  return 1.0;
}

// Apply Dynamic Type scaling to font size
export function dynamicFontSize(baseFontSize: number): number {
  const multiplier = getTextSizeMultiplier();
  return Math.round(baseFontSize * multiplier);
}
