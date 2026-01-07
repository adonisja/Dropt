import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'nativewind';
import { lightTheme, darkTheme, Theme } from '@/theme/theme';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@dropt_theme_mode';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  // Load saved theme preference on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Sync local state with NativeWind
  useEffect(() => {
    // If we are in 'system' mode, we don't force state updates based on colorScheme changes
    // We just let NativeWind handle the styling
  }, [colorScheme]);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'dark' || savedTheme === 'light' || savedTheme === 'system') {
        setThemeModeState(savedTheme as ThemeMode);
        setColorScheme(savedTheme as any);
      } else {
        // Default to system if nothing saved
        setThemeModeState('system');
        setColorScheme('system');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
      setColorScheme(mode as any);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  // We remove toggleTheme because it doesn't make sense with 3 options
  // We calculate the active theme based on the resolved colorScheme
  const activeTheme = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ 
      theme: activeTheme, 
      themeMode, 
      setThemeMode, 
      isDark: colorScheme === 'dark' 
    }}>
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
