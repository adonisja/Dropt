// lib/theme/theme-styles.ts
/**
 * Platform-agnostic theme style utilities
 * Works on both React Native (iOS/Android) and Web
 * 
 * This provides a way to use semantic color names while getting actual color values
 * that work across all platforms.
 */

import type { SeasonalColors } from './seasonal-colors';

/**
 * Converts HSL string to hex color for React Native compatibility
 * Example: 'hsl(210, 50%, 5%)' -> '#0A0E14'
 */
function hslToHex(hsl: string): string {
  const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return hsl; // Return as-is if not HSL format
  
  const h = parseInt(match[1]) / 360;
  const s = parseInt(match[2]) / 100;
  const l = parseInt(match[3]) / 100;
  
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Creates style objects for backgrounds, text, and borders using theme colors
 * This works on both React Native and Web
 */
export function createThemedStyles(colors: SeasonalColors) {
  return {
    // Backgrounds
    backgroundStyle: { backgroundColor: hslToHex(colors.background) },
    cardStyle: { backgroundColor: hslToHex(colors.card) },
    popoverStyle: { backgroundColor: hslToHex(colors.popover) },
    primaryStyle: { backgroundColor: hslToHex(colors.primary) },
    secondaryStyle: { backgroundColor: hslToHex(colors.secondary) },
    accentStyle: { backgroundColor: hslToHex(colors.accent) },
    mutedStyle: { backgroundColor: hslToHex(colors.muted) },
    destructiveStyle: { backgroundColor: hslToHex(colors.destructive) },
    
    // Text colors
    foregroundText: { color: hslToHex(colors.foreground) },
    cardForegroundText: { color: hslToHex(colors.cardForeground) },
    popoverForegroundText: { color: hslToHex(colors.popoverForeground) },
    primaryForegroundText: { color: hslToHex(colors.primaryForeground) },
    secondaryForegroundText: { color: hslToHex(colors.secondaryForeground) },
    accentForegroundText: { color: hslToHex(colors.accentForeground) },
    mutedForegroundText: { color: hslToHex(colors.mutedForeground) },
    destructiveForegroundText: { color: hslToHex(colors.destructiveForeground) },
    
    // Borders
    borderStyle: { borderColor: hslToHex(colors.border) },
    inputBorderStyle: { borderColor: hslToHex(colors.input) },
    ringBorderStyle: { borderColor: hslToHex(colors.ring) },
    
    // Common combinations
    cardContainer: {
      backgroundColor: hslToHex(colors.card),
      borderWidth: 1,
      borderColor: hslToHex(colors.border),
    },
    input: {
      backgroundColor: hslToHex(colors.background),
      borderWidth: 1,
      borderColor: hslToHex(colors.input),
      color: hslToHex(colors.foreground),
    },
  };
}

/**
 * Get individual color values as hex strings
 */
export function getThemeColors(colors: SeasonalColors) {
  return {
    background: hslToHex(colors.background),
    foreground: hslToHex(colors.foreground),
    card: hslToHex(colors.card),
    cardForeground: hslToHex(colors.cardForeground),
    popover: hslToHex(colors.popover),
    popoverForeground: hslToHex(colors.popoverForeground),
    primary: hslToHex(colors.primary),
    primaryForeground: hslToHex(colors.primaryForeground),
    secondary: hslToHex(colors.secondary),
    secondaryForeground: hslToHex(colors.secondaryForeground),
    accent: hslToHex(colors.accent),
    accentForeground: hslToHex(colors.accentForeground),
    muted: hslToHex(colors.muted),
    mutedForeground: hslToHex(colors.mutedForeground),
    border: hslToHex(colors.border),
    input: hslToHex(colors.input),
    ring: hslToHex(colors.ring),
    destructive: hslToHex(colors.destructive),
    destructiveForeground: hslToHex(colors.destructiveForeground),
    warning: hslToHex(colors.warning),
    warningForeground: hslToHex(colors.warningForeground),
    success: hslToHex(colors.success),
    successForeground: hslToHex(colors.successForeground),
    info: hslToHex(colors.info),
    infoForeground: hslToHex(colors.infoForeground),
    gradientStart: colors.gradientStart,
    gradientMiddle: colors.gradientMiddle,
    gradientEnd: colors.gradientEnd,
  };
}
