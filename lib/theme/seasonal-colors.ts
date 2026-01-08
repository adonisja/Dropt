import type { Season } from "../utils/semester-utils";

export interface SeasonalColors {
    // Core colors
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    
    popover: string;
    popoverForeground: string;

    // Brand colors
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  
  // UI colors
  muted: string;
  mutedForeground: string;
  border: string;
  input: string;
  ring: string;
  
  // Status colors
  destructive: string;
  destructiveForeground: string;
  warning: string;
  warningForeground: string;
  success: string;
  successForeground: string;
  info: string;
  infoForeground: string;
  
  // Chart colors
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  
  // Gradient colors for hero cards
  gradientStart: string;
  gradientMiddle: string;
  gradientEnd: string;
}

// ============================================
// WINTER PALETTES (December - February)
// Cool blues, teals, icy whites
// ============================================

const winterLight: SeasonalColors = {
  background: 'hsl(200, 30%, 98%)',
  foreground: 'hsl(210, 50%, 10%)',
  card: 'hsl(200, 40%, 99%)',
  cardForeground: 'hsl(210, 50%, 10%)',
  
  popover: 'hsl(200, 30%, 98%)',
  popoverForeground: 'hsl(210, 50%, 10%)',
  
  primary: 'hsl(199, 89%, 48%)',
  primaryForeground: 'hsl(0, 0%, 100%)',
  secondary: 'hsl(187, 71%, 45%)',
  secondaryForeground: 'hsl(0, 0%, 100%)',
  accent: 'hsl(240, 100%, 70%)',
  accentForeground: 'hsl(0, 0%, 100%)',
  
  muted: 'hsl(200, 20%, 90%)',
  mutedForeground: 'hsl(200, 15%, 40%)',
  border: 'hsl(200, 30%, 85%)',
  input: 'hsl(200, 30%, 85%)',
  ring: 'hsl(199, 89%, 48%)',
  
  destructive: 'hsl(0, 84%, 60%)',
  destructiveForeground: 'hsl(0, 0%, 100%)',
  warning: 'hsl(38, 92%, 50%)',
  warningForeground: 'hsl(0, 0%, 100%)',
  success: 'hsl(142, 71%, 45%)',
  successForeground: 'hsl(0, 0%, 100%)',
  info: 'hsl(199, 89%, 48%)',
  infoForeground: 'hsl(0, 0%, 100%)',
  
  chart1: 'hsl(199, 89%, 48%)',
  chart2: 'hsl(187, 71%, 45%)',
  chart3: 'hsl(240, 100%, 70%)',
  chart4: 'hsl(280, 65%, 60%)',
  chart5: 'hsl(320, 80%, 60%)',
  
  gradientStart: '#42A5F5',
  gradientMiddle: '#7C4DFF',
  gradientEnd: '#26A69A',
};

const winterDark: SeasonalColors = {
  background: 'hsl(210, 50%, 5%)',
  foreground: 'hsl(200, 30%, 95%)',
  card: 'hsl(210, 40%, 8%)',
  cardForeground: 'hsl(200, 30%, 95%)',
  
  popover: 'hsl(210, 50%, 5%)',
  popoverForeground: 'hsl(200, 30%, 95%)',
  
  primary: 'hsl(199, 89%, 58%)',
  primaryForeground: 'hsl(210, 50%, 5%)',
  secondary: 'hsl(187, 71%, 55%)',
  secondaryForeground: 'hsl(210, 50%, 5%)',
  accent: 'hsl(240, 100%, 75%)',
  accentForeground: 'hsl(210, 50%, 5%)',
  
  muted: 'hsl(210, 30%, 12%)',
  mutedForeground: 'hsl(200, 20%, 60%)',
  border: 'hsl(210, 30%, 15%)',
  input: 'hsl(210, 30%, 15%)',
  ring: 'hsl(199, 89%, 58%)',
  
  destructive: 'hsl(0, 84%, 65%)',
  destructiveForeground: 'hsl(0, 0%, 100%)',
  warning: 'hsl(38, 92%, 55%)',
  warningForeground: 'hsl(210, 50%, 5%)',
  success: 'hsl(142, 71%, 50%)',
  successForeground: 'hsl(0, 0%, 100%)',
  info: 'hsl(199, 89%, 58%)',
  infoForeground: 'hsl(210, 50%, 5%)',
  
  chart1: 'hsl(199, 89%, 58%)',
  chart2: 'hsl(187, 71%, 55%)',
  chart3: 'hsl(240, 100%, 75%)',
  chart4: 'hsl(280, 65%, 65%)',
  chart5: 'hsl(320, 80%, 65%)',
  
  gradientStart: '#1976D2',
  gradientMiddle: '#5E35B1',
  gradientEnd: '#00897B',
};

// ============================================
// SPRING PALETTES (March - May)
// Fresh greens, pinks, blooming flowers
// ============================================

const springLight: SeasonalColors = {
  background: 'hsl(120, 25%, 98%)',
  foreground: 'hsl(130, 40%, 10%)',
  card: 'hsl(120, 30%, 99%)',
  cardForeground: 'hsl(130, 40%, 10%)',
  
  popover: 'hsl(120, 25%, 98%)',
  popoverForeground: 'hsl(130, 40%, 10%)',
  
  primary: 'hsl(122, 39%, 49%)',
  primaryForeground: 'hsl(0, 0%, 100%)',
  secondary: 'hsl(340, 82%, 52%)',
  secondaryForeground: 'hsl(0, 0%, 100%)',
  accent: 'hsl(88, 50%, 53%)',
  accentForeground: 'hsl(0, 0%, 100%)',
  
  muted: 'hsl(120, 15%, 90%)',
  mutedForeground: 'hsl(120, 10%, 40%)',
  border: 'hsl(120, 20%, 85%)',
  input: 'hsl(120, 20%, 85%)',
  ring: 'hsl(122, 39%, 49%)',
  
  destructive: 'hsl(0, 84%, 60%)',
  destructiveForeground: 'hsl(0, 0%, 100%)',
  warning: 'hsl(38, 92%, 50%)',
  warningForeground: 'hsl(0, 0%, 100%)',
  success: 'hsl(122, 39%, 49%)',
  successForeground: 'hsl(0, 0%, 100%)',
  info: 'hsl(199, 89%, 48%)',
  infoForeground: 'hsl(0, 0%, 100%)',
  
  chart1: 'hsl(122, 39%, 49%)',
  chart2: 'hsl(88, 50%, 53%)',
  chart3: 'hsl(340, 82%, 52%)',
  chart4: 'hsl(280, 65%, 60%)',
  chart5: 'hsl(50, 98%, 60%)',
  
  gradientStart: '#43A047',
  gradientMiddle: '#8BC34A',
  gradientEnd: '#EC407A',
};

const springDark: SeasonalColors = {
  background: 'hsl(130, 30%, 5%)',
  foreground: 'hsl(120, 20%, 95%)',
  card: 'hsl(130, 25%, 8%)',
  cardForeground: 'hsl(120, 20%, 95%)',
  
  popover: 'hsl(130, 30%, 5%)',
  popoverForeground: 'hsl(120, 20%, 95%)',
  
  primary: 'hsl(122, 39%, 55%)',
  primaryForeground: 'hsl(130, 30%, 5%)',
  secondary: 'hsl(340, 82%, 60%)',
  secondaryForeground: 'hsl(130, 30%, 5%)',
  accent: 'hsl(88, 50%, 60%)',
  accentForeground: 'hsl(130, 30%, 5%)',
  
  muted: 'hsl(130, 20%, 12%)',
  mutedForeground: 'hsl(120, 15%, 60%)',
  border: 'hsl(130, 20%, 15%)',
  input: 'hsl(130, 20%, 15%)',
  ring: 'hsl(122, 39%, 55%)',
  
  destructive: 'hsl(0, 84%, 65%)',
  destructiveForeground: 'hsl(0, 0%, 100%)',
  warning: 'hsl(38, 92%, 55%)',
  warningForeground: 'hsl(130, 30%, 5%)',
  success: 'hsl(122, 39%, 55%)',
  successForeground: 'hsl(130, 30%, 5%)',
  info: 'hsl(199, 89%, 58%)',
  infoForeground: 'hsl(130, 30%, 5%)',
  
  chart1: 'hsl(122, 39%, 55%)',
  chart2: 'hsl(88, 50%, 60%)',
  chart3: 'hsl(340, 82%, 60%)',
  chart4: 'hsl(280, 65%, 65%)',
  chart5: 'hsl(50, 98%, 65%)',
  
  gradientStart: '#2E7D32',
  gradientMiddle: '#689F38',
  gradientEnd: '#C2185B',
};

// ============================================
// SUMMER PALETTES (June - August)
// Warm oranges, yellows, sunny vibes
// ============================================

const summerLight: SeasonalColors = {
  background: 'hsl(30, 40%, 98%)',
  foreground: 'hsl(25, 50%, 10%)',
  card: 'hsl(30, 45%, 99%)',
  cardForeground: 'hsl(25, 50%, 10%)',
  
  popover: 'hsl(30, 40%, 98%)',
  popoverForeground: 'hsl(25, 50%, 10%)',
  
  primary: 'hsl(14, 100%, 57%)',
  primaryForeground: 'hsl(0, 0%, 100%)',
  secondary: 'hsl(45, 100%, 51%)',
  secondaryForeground: 'hsl(25, 50%, 10%)',
  accent: 'hsl(4, 90%, 58%)',
  accentForeground: 'hsl(0, 0%, 100%)',
  
  muted: 'hsl(30, 20%, 90%)',
  mutedForeground: 'hsl(25, 15%, 40%)',
  border: 'hsl(30, 25%, 85%)',
  input: 'hsl(30, 25%, 85%)',
  ring: 'hsl(14, 100%, 57%)',
  
  destructive: 'hsl(0, 84%, 60%)',
  destructiveForeground: 'hsl(0, 0%, 100%)',
  warning: 'hsl(38, 92%, 50%)',
  warningForeground: 'hsl(0, 0%, 100%)',
  success: 'hsl(142, 71%, 45%)',
  successForeground: 'hsl(0, 0%, 100%)',
  info: 'hsl(199, 89%, 48%)',
  infoForeground: 'hsl(0, 0%, 100%)',
  
  chart1: 'hsl(14, 100%, 57%)',
  chart2: 'hsl(45, 100%, 51%)',
  chart3: 'hsl(4, 90%, 58%)',
  chart4: 'hsl(280, 65%, 60%)',
  chart5: 'hsl(350, 80%, 60%)',
  
  gradientStart: '#FF7043',
  gradientMiddle: '#FFD54F',
  gradientEnd: '#FF5722',
};

const summerDark: SeasonalColors = {
  background: 'hsl(25, 35%, 5%)',
  foreground: 'hsl(30, 30%, 95%)',
  card: 'hsl(25, 30%, 8%)',
  cardForeground: 'hsl(30, 30%, 95%)',
  
  popover: 'hsl(25, 35%, 5%)',
  popoverForeground: 'hsl(30, 30%, 95%)',
  
  primary: 'hsl(14, 100%, 62%)',
  primaryForeground: 'hsl(25, 35%, 5%)',
  secondary: 'hsl(45, 100%, 58%)',
  secondaryForeground: 'hsl(25, 35%, 5%)',
  accent: 'hsl(4, 90%, 62%)',
  accentForeground: 'hsl(25, 35%, 5%)',
  
  muted: 'hsl(25, 20%, 12%)',
  mutedForeground: 'hsl(30, 15%, 60%)',
  border: 'hsl(25, 20%, 15%)',
  input: 'hsl(25, 20%, 15%)',
  ring: 'hsl(14, 100%, 62%)',
  
  destructive: 'hsl(0, 84%, 65%)',
  destructiveForeground: 'hsl(0, 0%, 100%)',
  warning: 'hsl(38, 92%, 55%)',
  warningForeground: 'hsl(25, 35%, 5%)',
  success: 'hsl(142, 71%, 50%)',
  successForeground: 'hsl(0, 0%, 100%)',
  info: 'hsl(199, 89%, 58%)',
  infoForeground: 'hsl(25, 35%, 5%)',
  
  chart1: 'hsl(14, 100%, 62%)',
  chart2: 'hsl(45, 100%, 58%)',
  chart3: 'hsl(4, 90%, 62%)',
  chart4: 'hsl(280, 65%, 65%)',
  chart5: 'hsl(350, 80%, 65%)',
  
  gradientStart: '#E64A19',
  gradientMiddle: '#FFC107',
  gradientEnd: '#D84315',
};

// ============================================
// FALL PALETTES (September - November)
// Earthy browns, reds, autumn leaves
// ============================================

const fallLight: SeasonalColors = {
  background: 'hsl(30, 15%, 98%)',
  foreground: 'hsl(25, 30%, 10%)',
  card: 'hsl(30, 20%, 99%)',
  cardForeground: 'hsl(25, 30%, 10%)',
  
  popover: 'hsl(30, 15%, 98%)',
  popoverForeground: 'hsl(25, 30%, 10%)',
  
  primary: 'hsl(14, 80%, 50%)',
  primaryForeground: 'hsl(0, 0%, 100%)',
  secondary: 'hsl(16, 25%, 50%)',
  secondaryForeground: 'hsl(0, 0%, 100%)',
  accent: 'hsl(4, 71%, 50%)',
  accentForeground: 'hsl(0, 0%, 100%)',
  
  muted: 'hsl(30, 10%, 90%)',
  mutedForeground: 'hsl(25, 10%, 40%)',
  border: 'hsl(30, 15%, 85%)',
  input: 'hsl(30, 15%, 85%)',
  ring: 'hsl(14, 80%, 50%)',
  
  destructive: 'hsl(0, 84%, 60%)',
  destructiveForeground: 'hsl(0, 0%, 100%)',
  warning: 'hsl(38, 92%, 50%)',
  warningForeground: 'hsl(0, 0%, 100%)',
  success: 'hsl(142, 71%, 45%)',
  successForeground: 'hsl(0, 0%, 100%)',
  info: 'hsl(199, 89%, 48%)',
  infoForeground: 'hsl(0, 0%, 100%)',
  
  chart1: 'hsl(14, 80%, 50%)',
  chart2: 'hsl(16, 25%, 50%)',
  chart3: 'hsl(4, 71%, 50%)',
  chart4: 'hsl(30, 70%, 50%)',
  chart5: 'hsl(350, 80%, 55%)',
  
  gradientStart: '#E64A19',
  gradientMiddle: '#A1887F',
  gradientEnd: '#D32F2F',
};

const fallDark: SeasonalColors = {
  background: 'hsl(25, 25%, 5%)',
  foreground: 'hsl(30, 20%, 95%)',
  card: 'hsl(25, 20%, 8%)',
  cardForeground: 'hsl(30, 20%, 95%)',
  
  popover: 'hsl(25, 25%, 5%)',
  popoverForeground: 'hsl(30, 20%, 95%)',
  
  primary: 'hsl(14, 80%, 58%)',
  primaryForeground: 'hsl(25, 25%, 5%)',
  secondary: 'hsl(16, 25%, 60%)',
  secondaryForeground: 'hsl(25, 25%, 5%)',
  accent: 'hsl(4, 71%, 60%)',
  accentForeground: 'hsl(25, 25%, 5%)',
  
  muted: 'hsl(25, 15%, 12%)',
  mutedForeground: 'hsl(30, 10%, 60%)',
  border: 'hsl(25, 15%, 15%)',
  input: 'hsl(25, 15%, 15%)',
  ring: 'hsl(14, 80%, 58%)',
  
  destructive: 'hsl(0, 84%, 65%)',
  destructiveForeground: 'hsl(0, 0%, 100%)',
  warning: 'hsl(38, 92%, 55%)',
  warningForeground: 'hsl(25, 25%, 5%)',
  success: 'hsl(142, 71%, 50%)',
  successForeground: 'hsl(0, 0%, 100%)',
  info: 'hsl(199, 89%, 58%)',
  infoForeground: 'hsl(25, 25%, 5%)',
  
  chart1: 'hsl(14, 80%, 58%)',
  chart2: 'hsl(16, 25%, 60%)',
  chart3: 'hsl(4, 71%, 60%)',
  chart4: 'hsl(30, 70%, 58%)',
  chart5: 'hsl(350, 80%, 60%)',
  
  gradientStart: '#BF360C',
  gradientMiddle: '#6D4C41',
  gradientEnd: '#B71C1C',
};

// ============================================
// COLOR PALETTE LOOKUP
// ============================================

export const colorPalettes: Record<Season, { light: SeasonalColors; dark: SeasonalColors }> = {
  winter: { light: winterLight, dark: winterDark },
  spring: { light: springLight, dark: springDark },
  summer: { light: summerLight, dark: summerDark },
  fall: { light: fallLight, dark: fallDark },
};