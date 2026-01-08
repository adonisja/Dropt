import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'nativewind';
import { detectCurrentSemester, type Season } from '../utils/semester-utils';
import { colorPalettes, type SeasonalColors } from './seasonal-colors';
import { applySeasonalTheme } from './apply-theme';
import { getThemeColors, createThemedStyles } from './theme-styles';


type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: {
    colors: SeasonalColors;
  };
  colors: SeasonalColors;
  // Hex color values for direct use in styles (works on all platforms)
  hexColors: ReturnType<typeof getThemeColors>;
  // Pre-built style objects for common patterns
  themedStyles: ReturnType<typeof createThemedStyles>;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
  season: Season;
  setSeason: (season: Season) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEYS = {
  MODE: '@dropt_theme_mode',
  SEASON: '@dropt_theme_season',
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [season, setSeasonState] = useState<Season> (() => detectCurrentSemester().season);
  const [isLoaded, setIsLoaded] = useState(false); 

  // Load saved theme preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const [savedMode, savedSeason] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.MODE),
        AsyncStorage.getItem(STORAGE_KEYS.SEASON),
      ])
      if (savedMode === 'dark' || savedMode === 'light' || savedMode === 'system') {
        setThemeModeState(savedMode as ThemeMode);
        
        // If mode is 'system', determine dark/light based on time of day
        if (savedMode === 'system') {
          const hour = new Date().getHours();
          const isNightTime = hour >= 18 || hour < 6; // 6 PM to 6 AM is dark mode
          setColorScheme(isNightTime ? 'dark' : 'light');
        } else {
          setColorScheme(savedMode as any);
        }
      } else {
        // Default to system if nothing saved
        setThemeModeState('system');
        const hour = new Date().getHours();
        const isNightTime = hour >= 18 || hour < 6;
        setColorScheme(isNightTime ? 'dark' : 'light');
      }

      if (savedSeason && (savedSeason === 'winter' || savedSeason === 'spring' || savedSeason === 'summer' || savedSeason === 'fall')) {
        setSeasonState(savedSeason as Season)
      }
    } catch (error) {
      console.error('Error loading theme preferences:', error);
    } finally {
      setIsLoaded (true);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MODE, mode);
      setThemeModeState(mode);
      
      // If mode is 'system', determine dark/light based on time of day
      if (mode === 'system') {
        const hour = new Date().getHours();
        const isNightTime = hour >= 18 || hour < 6; // 6 PM to 6 AM is dark mode
        setColorScheme(isNightTime ? 'dark' : 'light');
      } else {
        setColorScheme(mode as any);
      }
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const setSeason = async (newSeason: Season) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SEASON, newSeason);
      setSeasonState(newSeason);
    } catch (error) {
      console.error('Error saving season preferences:', error);
    }
  };

  // Determine if dark mode is active
  const isDark = colorScheme === 'dark';

  // Get current season color palette
  const colors = useMemo(() => {
    return colorPalettes[season][isDark ? 'dark' : 'light'];
  }, [season, isDark]);

  // Convert HSL colors to hex for React Native compatibility
  const hexColors = useMemo(() => {
    return getThemeColors(colors);
  }, [colors]);

  // Pre-built style objects for common patterns
  const themedStyles = useMemo(() => {
    return createThemedStyles(colors);
  }, [colors]);

  // Apply seasonal theme to CSS variables (for Web only)
  useEffect(() => {
    if (isLoaded) {
      applySeasonalTheme(colors, isDark);
    }
  }, [colors, isDark, isLoaded]);

  // Prevent rendering until preferences are loaded
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{ 
        theme: {colors},
        colors,
        hexColors,
        themedStyles,
        themeMode, 
        setThemeMode, 
        isDark,
        season,
        setSeason 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
