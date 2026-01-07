# NativeWind v4 Setup & Troubleshooting Guide

## Overview
This document details the steps taken to successfully configure **NativeWind v4** with **Expo SDK 54** and **React Native Reanimated**, specifically addressing build errors and runtime crashes on the Web platform.

## Tech Stack Context
- **Framework**: Expo SDK 54 (React Native 0.76+)
- **Styling**: NativeWind v4.2.1 (Tailwind CSS for React Native)
- **Animation**: React Native Reanimated v4.1.5
- **Bundler**: Metro (Native) / Webpack or Metro (Web)

## 1. Configuration & Setup Steps

### Step 1: Tailwind Configuration (`tailwind.config.js`)
**Goal**: Tell Tailwind where to find our classes and how to map our theme colors.

*   **Action**: Created `tailwind.config.js`.
*   **Key Settings**:
    *   `content`: Pointed to `./app/**/*.{js,jsx,ts,tsx}` and `./components/**/*.{js,jsx,ts,tsx}` to ensure the compiler finds all class names.
    *   `presets`: Added `require("nativewind/preset")`.
    *   `darkMode`: Set to `"class"` to manually control theme switching via our `ThemeContext`.
    *   `theme.extend.colors`: Mapped Tailwind utility classes (e.g., `bg-background`) to CSS variables (e.g., `var(--background)`). This allows dynamic theming without rebuilding styles.

### Step 2: Babel Configuration (`babel.config.js`)
**Goal**: Ensure the Babel compiler processes NativeWind styles and Reanimated worklets.

*   **Action**: Updated `babel.config.js`.
*   **Configuration**:
    ```javascript
    module.exports = function (api) {
      api.cache(true);
      return {
        presets: [
          ["babel-preset-expo", { jsxImportSource: "nativewind" }],
          "nativewind/babel",
        ],
        plugins: ["react-native-reanimated/plugin"],
      };
    };
    ```
*   **Reasoning**: The `jsxImportSource: "nativewind"` option is crucial for v4 to replace the standard React Native `StyleSheet` with NativeWind's compiled styles.

### Step 3: Global CSS & Theming (`global.css`)
**Goal**: Define the CSS variables that drive the theme.

*   **Action**: Created/Updated `global.css`.
*   **Implementation**:
    *   Used `@tailwind base;`, `@tailwind components;`, `@tailwind utilities;`.
    *   Added `@layer base` to define `:root` (light mode) and `.dark` (dark mode) CSS variables using HSL values (e.g., `--primary: 221 83% 53%;`).
    *   **Why HSL?**: It allows for easier opacity modifiers in Tailwind (e.g., `bg-primary/50`).

### Step 4: Metro Configuration (`metro.config.js`)
**Goal**: Ensure Metro (the bundler) can process CSS files.

*   **Action**: Wrapped the default Expo config with `withNativeWind`.
    ```javascript
    const { getDefaultConfig } = require("expo/metro-config");
    const { withNativeWind } = require("nativewind/metro");

    const config = getDefaultConfig(__dirname);
    module.exports = withNativeWind(config, { input: "./global.css" });
    ```

## 2. Troubleshooting & Critical Fixes

### Issue A: "OptionalMemberExpression" Babel Error (Web Build)
**Symptom**: The web build failed with `[Worklets] Babel plugin exception: unknown node of type "OptionalMemberExpression"`.
**Root Cause**: A version mismatch between `react-native-reanimated`'s Babel plugin and the underlying `@babel/core` packages. Reanimated relies on specific AST (Abstract Syntax Tree) node types that were inconsistent across the installed Babel sub-packages.
**Fix**:
*   **Action**: Added `overrides` to `package.json` to force all Babel packages to the same version (`^7.28.5`).
    ```json
    "overrides": {
      "@babel/core": "^7.28.5",
      "@babel/generator": "^7.28.5",
      "@babel/parser": "^7.28.5",
      "@babel/traverse": "^7.28.5",
      "@babel/types": "^7.28.5"
    }
    ```
*   **Reasoning**: This ensures that the parser, generator, and types are all in sync, preventing the AST node type errors during the Reanimated plugin's execution.

### Issue B: "Cannot manually set color scheme" Crash
**Symptom**: The app crashed on the web with `Uncaught Error: Cannot manually set color scheme, as dark mode is type 'media'`.
**Root Cause**: NativeWind v4 defaults to using the system's color scheme (`media` strategy). However, our app manually toggles themes using a context. When we tried to apply a class or style that implied a manual override, NativeWind threw an error because it wasn't configured for manual control.
**Fix**:
*   **Action**: Explicitly set the flag in `app/_layout.tsx` before the app mounts.
    ```typescript
    import { NativeWindStyleSheet } from "nativewind";
    try {
      NativeWindStyleSheet.setFlag("darkMode", "class");
    } catch (e) { ... }
    ```
*   **Reasoning**: This tells NativeWind's runtime that we will handle the dark mode state via the `class` strategy (adding/removing a `dark` class or using the variable approach), suppressing the error.

## Summary
The combination of **Babel Overrides** (for build stability) and **Explicit Runtime Configuration** (for theming stability) was the key to getting this modern stack running.
