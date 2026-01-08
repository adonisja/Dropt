# Theme Migration Guide

## Overview

This guide explains how to apply the seasonal theme system throughout the entire app (all pages) for both React Native (iOS/Android) and Web platforms.

## The Problem

NativeWind's Tailwind classes like `bg-background`, `bg-card`, `text-foreground` work differently on **Web** vs **React Native**:

- **Web**: CSS variables work (`--background`, `--foreground`, etc.)
- **React Native**: CSS variables don't exist, need actual color values

## The Solution

We've created a **platform-agnostic theme system** that works on both web and mobile:

### 1. Theme Context (`lib/theme/theme-context.tsx`)

The theme context now provides:

```typescript
const { hexColors, themedStyles, isDark, colors } = useTheme();
```

- `hexColors`: Converted hex color values (works everywhere)
- `themedStyles`: Pre-built style objects for common patterns
- `isDark`: Boolean for dark mode detection
- `colors`: Original HSL colors (for gradients)

### 2. Platform-Agnostic Utilities (`lib/theme/theme-styles.ts`)

Converts HSL colors to hex format that works on all platforms:

```typescript
// Automatic conversion
hslToHex('hsl(210, 50%, 5%)') → '#0A0E14'
```

## How to Apply Theme to Any Page

### Step 1: Import useTheme

```tsx
import { useTheme } from '@/lib/theme/theme-context';
```

### Step 2: Destructure Theme Values

```tsx
export default function YourPage() {
    const { hexColors, themedStyles, isDark } = useTheme();
    // ...
}
```

### Step 3: Replace NativeWind Classes with Inline Styles

#### ❌ BEFORE (doesn't work on React Native):
```tsx
<View className="bg-background">
    <View className="bg-card border border-border">
        <Text className="text-foreground">Hello</Text>
        <Text className="text-muted-foreground">Subtitle</Text>
    </View>
</View>
```

#### ✅ AFTER (works everywhere):
```tsx
<View style={{ backgroundColor: hexColors.background }}>
    <View style={{
        backgroundColor: hexColors.card,
        borderWidth: 1,
        borderColor: hexColors.border
    }}>
        <Text style={{ color: hexColors.foreground }}>Hello</Text>
        <Text style={{ color: hexColors.mutedForeground }}>Subtitle</Text>
    </View>
</View>
```

### Step 4: Use Pre-Built Style Objects (Optional)

For common patterns, use `themedStyles`:

```tsx
// Instead of manually writing styles:
<View style={{
    backgroundColor: hexColors.card,
    borderWidth: 1,
    borderColor: hexColors.border
}}>

// Use pre-built:
<View style={themedStyles.cardContainer}>
```

## Available Theme Colors

### Background Colors
```typescript
hexColors.background      // Main app background
hexColors.card           // Card backgrounds
hexColors.popover        // Popover/modal backgrounds
hexColors.primary        // Primary brand color
hexColors.secondary      // Secondary backgrounds
hexColors.accent         // Accent backgrounds
hexColors.muted          // Muted/disabled backgrounds
hexColors.destructive    // Danger/delete backgrounds
```

### Text Colors
```typescript
hexColors.foreground              // Main text
hexColors.cardForeground          // Text on cards
hexColors.mutedForeground         // Secondary/muted text
hexColors.primaryForeground       // Text on primary background
hexColors.secondaryForeground     // Text on secondary background
hexColors.destructiveForeground   // Text on destructive background
```

### Border Colors
```typescript
hexColors.border    // Standard borders
hexColors.input     // Input field borders
hexColors.ring      // Focus ring borders
```

### Status Colors
```typescript
hexColors.warning            // Warning color
hexColors.warningForeground  // Text on warning
hexColors.success            // Success color
hexColors.successForeground  // Text on success
hexColors.info               // Info color
hexColors.infoForeground     // Text on info
```

## Common Patterns

### 1. Main Container
```tsx
<View className="flex-1" style={{ backgroundColor: hexColors.background }}>
    {/* Your content */}
</View>
```

### 2. Card Component
```tsx
<View className="rounded-2xl p-4 shadow-sm" style={themedStyles.cardContainer}>
    <Text style={{ color: hexColors.foreground }}>Card Title</Text>
    <Text style={{ color: hexColors.mutedForeground }}>Card subtitle</Text>
</View>
```

### 3. Input Field
```tsx
<TextInput
    className="rounded-lg px-3 py-2"
    style={themedStyles.input}
    placeholderTextColor={hexColors.mutedForeground}
/>
```

### 4. Icons (Dynamic Color Based on Theme)
```tsx
<Ionicons 
    name="star" 
    size={24} 
    color={isDark ? "#FCD34D" : "#F59E0B"} 
/>
```

### 5. Loading Indicator
```tsx
<ActivityIndicator size="large" color={hexColors.primary} />
```

## Migration Checklist for Each Page

- [ ] Import `useTheme` hook
- [ ] Destructure `hexColors`, `themedStyles`, `isDark`
- [ ] Replace `bg-background` with `style={{ backgroundColor: hexColors.background }}`
- [ ] Replace `bg-card` with `style={{ backgroundColor: hexColors.card }}`
- [ ] Replace `text-foreground` with `style={{ color: hexColors.foreground }}`
- [ ] Replace `text-muted-foreground` with `style={{ color: hexColors.mutedForeground }}`
- [ ] Replace `border-border` with `borderColor: hexColors.border`
- [ ] Update icon colors to use `hexColors` or dynamic isDark checks
- [ ] Test on both light and dark modes
- [ ] Test on both web and mobile (iOS/Android)

## Example: Full Page Migration

### Before:
```tsx
export default function ExamplePage() {
    return (
        <View className="flex-1 bg-background">
            <View className="bg-card p-4 border border-border">
                <Text className="text-foreground text-xl font-bold">Title</Text>
                <Text className="text-muted-foreground">Description</Text>
            </View>
        </View>
    );
}
```

### After:
```tsx
import { useTheme } from '@/lib/theme/theme-context';

export default function ExamplePage() {
    const { hexColors, themedStyles } = useTheme();
    
    return (
        <View className="flex-1" style={{ backgroundColor: hexColors.background }}>
            <View className="p-4" style={themedStyles.cardContainer}>
                <Text className="text-xl font-bold" style={{ color: hexColors.foreground }}>
                    Title
                </Text>
                <Text style={{ color: hexColors.mutedForeground }}>
                    Description
                </Text>
            </View>
        </View>
    );
}
```

## Web vs Mobile Behavior

### Web (Browser)
- CSS variables are updated in `global.css` via `applySeasonalTheme()`
- NativeWind classes *can* work on web
- Inline styles also work

### React Native (iOS/Android)
- No CSS variables available
- **Must use inline styles** with `hexColors`
- NativeWind theme classes won't respond to theme changes

### Recommended Approach
**Always use inline styles with `hexColors`** for consistency across all platforms.

## Dark Mode Auto-Detection

The theme automatically responds to:
1. Manual toggle (light/dark/system)
2. Season changes (winter/spring/summer/fall)
3. System dark mode preference (when set to "system")

All color values update automatically when theme changes!

## Testing Theme Changes

1. **Toggle Dark Mode**: Verify entire screen changes color
2. **Change Season**: Verify gradient colors update
3. **System Dark Mode**: Set to "system" and change OS dark mode
4. **Platform Check**: Test on iOS, Android, and Web

## Performance Tips

- `hexColors` and `themedStyles` are memoized
- No unnecessary re-renders on theme change
- HSL to Hex conversion happens only when colors change

## Complete Reference

See `student_dashboard.tsx` for a fully migrated example with all patterns implemented.
