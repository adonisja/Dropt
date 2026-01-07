// theme/theme.ts
export const lightTheme = {
  colors: {
    // Primary colors
    background: 'hsl(0, 0%, 100%)', // Pure white for crispness
    foreground: 'hsl(222, 47%, 11%)', // Deep Navy text (easier to read than pure black)
    
    card: 'hsl(210, 40%, 98%)', // Very subtle cool gray for cards
    cardForeground: 'hsl(222, 47%, 11%)',
    
    popover: 'hsl(0, 0%, 100%)',
    popoverForeground: 'hsl(222, 47%, 11%)',
    
    primary: 'hsl(221, 83%, 53%)', // Keep the brand blue
    primaryForeground: 'hsl(210, 40%, 98%)',
    
    secondary: 'hsl(210, 40%, 96.1%)',
    secondaryForeground: 'hsl(222, 47%, 11%)',
    
    muted: 'hsl(215, 16%, 90%)',
    mutedForeground: 'hsl(215, 16%, 40%)', // Darker muted text for better readability
    
    accent: 'hsl(210, 40%, 96.1%)',
    accentForeground: 'hsl(222, 47%, 11%)',
    
    destructive: 'hsl(0, 84%, 60%)',
    destructiveForeground: 'hsl(210, 40%, 98%)',
    
    border: 'hsl(214, 32%, 91%)',
    input: 'hsl(214, 32%, 91%)',
    ring: 'hsl(221, 83%, 53%)',
    
    success: 'hsl(142, 71%, 45%)',
    successForeground: 'hsl(0, 0%, 100%)',
    
    warning: 'hsl(38, 92%, 50%)',
    warningForeground: 'hsl(0, 0%, 100%)',
    
    info: 'hsl(199, 89%, 48%)',
    infoForeground: 'hsl(0, 0%, 100%)',
    
    // Chart colors (unchanged)
    chart1: 'hsl(221, 83%, 53%)',
    chart2: 'hsl(142, 71%, 45%)',
    chart3: 'hsl(38, 92%, 50%)',
    chart4: 'hsl(0, 84%, 60%)',
    chart5: 'hsl(280, 65%, 60%)',
  },
  // ... keep existing gradients/animations/shadows or update below
  shadows: {
    sm: '0 1px 2px 0 hsl(215, 25%, 15%, 0.05)',
    md: '0 4px 6px -1px hsl(215, 25%, 15%, 0.1), 0 2px 4px -1px hsl(215, 25%, 15%, 0.06)',
    lg: '0 10px 15px -3px hsl(215, 25%, 15%, 0.1), 0 4px 6px -2px hsl(215, 25%, 15%, 0.05)',
    xl: '0 20px 25px -5px hsl(215, 25%, 15%, 0.1), 0 10px 10px -5px hsl(215, 25%, 15%, 0.04)',
    elegant: '0 10px 30px -10px hsl(221, 83%, 53%, 0.3)',
    glow: '0 0 40px hsl(221, 83%, 63%, 0.4)',
  },
  borderRadius: { sm: '0.375rem', md: '0.5rem', lg: '0.75rem', xl: '1rem', full: '9999px' },
  spacing: { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem', '2xl': '3rem' },
  breakpoints: { sm: '640px', md: '768px', lg: '1024px', xl: '1280px' },
  // Add missing properties from original file if necessary...
  gradients: {
    primary: 'linear-gradient(135deg, hsl(221, 83%, 53%), hsl(221, 83%, 63%))',
    subtle: 'linear-gradient(180deg, hsl(210, 20%, 98%), hsl(210, 20%, 96%))',
    card: 'linear-gradient(145deg, hsl(0, 0%, 100%), hsl(210, 20%, 99%))',
  },
  animations: {
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    transitionFast: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

export const darkTheme = {
  colors: {
    // --- MODERN "DEEP SPACE" PALETTE ---
    
    // Background: Darker, richer Navy (Fixes the "washed out" gray look)
    background: 'hsl(222, 47%, 6%)', 
    foreground: 'hsl(210, 40%, 98%)', // Crisp White text
    
    // Card: Lighter than background to create hierarchy
    card: 'hsl(222, 47%, 11%)', 
    cardForeground: 'hsl(210, 40%, 98%)',
    
    popover: 'hsl(222, 47%, 11%)',
    popoverForeground: 'hsl(210, 40%, 98%)',
    
    // Primary: Slightly more vibrant/electric to pop against dark bg
    primary: 'hsl(217, 91%, 60%)', 
    primaryForeground: 'hsl(222, 47%, 11%)',
    
    // Secondary: Used for buttons/inputs. Distinct from card background.
    secondary: 'hsl(217, 32%, 17%)', 
    secondaryForeground: 'hsl(210, 40%, 98%)',
    
    muted: 'hsl(217, 32%, 17%)',
    mutedForeground: 'hsl(215, 20%, 65%)', // Readable gray
    
    accent: 'hsl(217, 32%, 17%)',
    accentForeground: 'hsl(210, 40%, 98%)',
    
    destructive: 'hsl(0, 62%, 30%)',
    destructiveForeground: 'hsl(210, 40%, 98%)',
    
    // Border: Subtle but visible to define edges
    border: 'hsl(217, 32%, 22%)', 
    input: 'hsl(217, 32%, 22%)',
    ring: 'hsl(224, 76%, 48%)',
    
    success: 'hsl(142, 70%, 50%)', // Brighter green for dark mode visibility
    successForeground: 'hsl(0, 0%, 100%)',
    
    warning: 'hsl(48, 96%, 89%)',
    warningForeground: 'hsl(0, 0%, 100%)',
    
    info: 'hsl(199, 89%, 48%)',
    infoForeground: 'hsl(0, 0%, 100%)',
    
    chart1: 'hsl(221, 83%, 53%)',
    chart2: 'hsl(142, 71%, 45%)',
    chart3: 'hsl(38, 92%, 50%)',
    chart4: 'hsl(0, 84%, 60%)',
    chart5: 'hsl(280, 65%, 60%)',
  },
  
  gradients: {
    primary: 'linear-gradient(135deg, hsl(217, 91%, 60%), hsl(217, 91%, 70%))',
    subtle: 'linear-gradient(180deg, hsl(222, 47%, 6%), hsl(222, 47%, 8%))',
    card: 'linear-gradient(145deg, hsl(222, 47%, 11%), hsl(222, 47%, 13%))',
  },
  
  // Same structural props as light theme
  shadows: lightTheme.shadows,
  animations: lightTheme.animations,
  borderRadius: lightTheme.borderRadius,
  spacing: lightTheme.spacing,
  breakpoints: lightTheme.breakpoints,
};

// Default to light theme
export const theme = lightTheme;
export type Theme = typeof lightTheme;