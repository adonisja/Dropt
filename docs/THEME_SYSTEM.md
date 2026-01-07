# Theme System Documentation

## Overview

Dropt uses a custom theme system built with React Context and TypeScript to provide consistent light/dark mode support throughout the application.

## Architecture

### Theme Provider (`lib/theme-context.tsx`)

The theme system is centralized in a React Context provider that:
- Manages light and dark theme objects
- Persists user's theme preference to AsyncStorage
- Provides a `useTheme()` hook for accessing theme and toggle function

### Theme Definition (`theme/theme.ts`)

Two theme objects are defined:
- `lightTheme` - Light mode color scheme
- `darkTheme` - Dark mode color scheme

Each theme includes:
- **Colors**: HSL-based color palette (background, foreground, primary, secondary, etc.)
- **Gradients**: CSS gradient definitions (web-only)
- **Shadows**: Platform-compatible shadow definitions
- **Animations**: Transition timing functions
- **Border Radius**: Consistent border radius values
- **Spacing**: Standard spacing scale
- **Breakpoints**: Responsive design breakpoints

## Usage

### In Components

```typescript
import { useTheme } from '@/lib/theme-context';

export default function MyComponent() {
    const { theme, themeMode, toggleTheme } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.text, { color: theme.colors.foreground }]}>
                Current theme: {themeMode}
            </Text>
            <TouchableOpacity onPress={toggleTheme}>
                <Text>Toggle Theme</Text>
            </TouchableOpacity>
        </View>
    );
}
```

### StyleSheet Pattern

The recommended pattern is to define static styles in StyleSheet.create() and apply dynamic colors inline:

```typescript
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    text: {
        fontSize: 16,
        fontWeight: '500',
    },
});

// In component
<View style={[styles.container, { backgroundColor: theme.colors.background }]}>
    <Text style={[styles.text, { color: theme.colors.foreground }]}>
        Content
    </Text>
</View>
```

## Theme Toggle UI

The app provides a sun/moon toggle button in the header of all screens:
- **Light Mode**: Shows ☀️ sun icon → tap to switch to dark mode
- **Dark Mode**: Shows 🌙 moon icon → tap to switch to light mode

The toggle is consistently positioned in the top-right corner of every screen.

## Updated Components

The following components have been updated to use the theme system:

### Screens
- `app/(student)/student_dashboard.tsx`
- `app/(student)/courses.tsx`
- `app/(student)/analytics.tsx`
- `app/(student)/settings.tsx`

### Components
- `components/BottomNav.tsx`
- `components/SuccessScreen.tsx`

### Layout
- `app/(student)/_layout.tsx` - Header styling and theme toggle buttons

## Migration from NativeWind

The app previously used NativeWind/Tailwind CSS but has been migrated to React Native StyleSheet with the custom theme system:

### Removed Dependencies
- `nativewind`
- `tailwindcss`
- `lib/tw.ts` (custom Tailwind utility)
- `nativewind-env.d.ts`

### Migration Pattern

**Before (NativeWind):**
```typescript
<View className="flex-1 bg-white p-4">
    <Text className="text-xl font-bold text-gray-900">
        Hello
    </Text>
</View>
```

**After (Theme System):**
```typescript
const { theme } = useTheme();

<View style={[styles.container, { backgroundColor: theme.colors.card }]}>
    <Text style={[styles.title, { color: theme.colors.foreground }]}>
        Hello
    </Text>
</View>

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
});
```

## Color Palette

### Light Theme
- Background: `hsl(210, 20%, 98%)` - Very light gray
- Foreground: `hsl(215, 25%, 15%)` - Dark gray
- Primary: `hsl(221, 83%, 53%)` - Blue
- Card: `hsl(0, 0%, 100%)` - White

### Dark Theme
- Background: `hsl(215, 25%, 10%)` - Very dark blue-gray
- Foreground: `hsl(210, 20%, 98%)` - Very light gray
- Primary: `hsl(221, 83%, 53%)` - Blue (same as light)
- Card: `hsl(215, 25%, 14%)` - Dark blue-gray

## Best Practices

1. **Always use the theme context** - Don't hardcode colors
2. **Separate static and dynamic styles** - StyleSheet for layout, inline for colors
3. **Test both themes** - Ensure components work in light and dark mode
4. **Use semantic color names** - Use `theme.colors.foreground` not `theme.colors.black`
5. **Avoid CSS gradients** - They're web-only; use solid colors or expo-linear-gradient

## Future Enhancements

Potential improvements to the theme system:
- System theme detection (auto-detect OS dark mode preference)
- Custom color schemes beyond light/dark
- Theme-specific assets/icons
- Animation when switching themes
