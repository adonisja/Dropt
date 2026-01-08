// lib/theme/apply-theme.ts

import type { SeasonalColors } from './seasonal-colors';

/**
 * Converts HSL color strings to CSS variable format
 * Example: 'hsl(199, 89%, 48%)' -> '199 89% 48%'
 */
function hslToVar(hslString: string): string {
  const match = hslString.match(/hsl\(([^)]+)\)/);
  if (!match) return hslString;
  return match[1];
}

/**
 * Applies seasonal theme colors by updating CSS variables
 * This allows NativeWind's Tailwind classes to use the seasonal colors
 */
export function applySeasonalTheme(colors: SeasonalColors, isDark: boolean) {
  if (typeof document === 'undefined') return; // Skip on native (web only)

  const root = document.documentElement;
  const themeClass = isDark ? 'dark' : 'light';

  // Remove existing theme classes
  root.classList.remove('light', 'dark');
  root.classList.add(themeClass);

  // Update CSS variables
  root.style.setProperty('--background', hslToVar(colors.background));
  root.style.setProperty('--foreground', hslToVar(colors.foreground));
  root.style.setProperty('--card', hslToVar(colors.card));
  root.style.setProperty('--card-foreground', hslToVar(colors.cardForeground));
  root.style.setProperty('--popover', hslToVar(colors.popover));
  root.style.setProperty('--popover-foreground', hslToVar(colors.popoverForeground));
  root.style.setProperty('--primary', hslToVar(colors.primary));
  root.style.setProperty('--primary-foreground', hslToVar(colors.primaryForeground));
  root.style.setProperty('--secondary', hslToVar(colors.secondary));
  root.style.setProperty('--secondary-foreground', hslToVar(colors.secondaryForeground));
  root.style.setProperty('--accent', hslToVar(colors.accent));
  root.style.setProperty('--accent-foreground', hslToVar(colors.accentForeground));
  root.style.setProperty('--muted', hslToVar(colors.muted));
  root.style.setProperty('--muted-foreground', hslToVar(colors.mutedForeground));
  root.style.setProperty('--border', hslToVar(colors.border));
  root.style.setProperty('--input', hslToVar(colors.input));
  root.style.setProperty('--ring', hslToVar(colors.ring));
  root.style.setProperty('--destructive', hslToVar(colors.destructive));
  root.style.setProperty('--destructive-foreground', hslToVar(colors.destructiveForeground));
}
