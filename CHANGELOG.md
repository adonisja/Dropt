# Changelog

All notable changes to the Dropt project will be documented in this file.

## [Unreleased] - 2026-01-07

### Added
- **Semester-Based Deadline Tracking**:
  - Deadline tracker now operates on current semester only
  - Added `totalTasksCompleted`, `totalTasksMissed`, `totalTasksEver` fields to UserSettings schema
  - Created `lib/utils/semester-stats.ts` for managing lifetime task statistics
  - Implemented automatic semester transition detection
  - Lifetime statistics display shows all-time progress across semesters
  - Current semester header shows active semester (e.g., "Spring 2026")
  - Tasks automatically reset each semester while preserving historical data
  
- **Security & Privacy**:
  - Updated `.gitignore` to exclude `.claude/` directory (AI conversation history)
  - Added `.expo-shared/`, `ampx-*`, and AWS credential files to `.gitignore`
  - Added certificate files (`.pem`, `.key`, `.p12`, `.jks`) to `.gitignore`

- **Documentation**:
  - Created `docs/SEMESTER_DEADLINE_IMPLEMENTATION.md` with comprehensive implementation guide
  - Documented semester transition logic and data architecture
  - Added testing checklist and future enhancement roadmap

### Changed
- **Deadline Tracker (`app/(student)/tools/deadline-tracker.tsx`)**:
  - Filters assignments by `currentSemester` and `currentYear` from UserSettings
  - Added state management for lifetime statistics
  - Redesigned UI with current semester stats and lifetime stats sections
  - Improved visual hierarchy with trophy icon for all-time statistics

- **Data Client (`lib/api/data-client.ts`)**:
  - `getOrCreateUserSettings()` now checks for semester transitions
  - Automatically archives old semester data when new semester begins
  - Dynamically imports semester utilities to avoid circular dependencies

### Fixed
- **Type Safety**: Added null checks and type assertions for new UserSettings fields
- **Performance**: Deadline tracker only loads current semester courses (reduced data fetch)

## [Unreleased] - 2025-11-23

### Added
- **Course Management**:
  - Added "Edit Course" functionality (`app/(student)/courses/edit.tsx`).
  - Implemented `getStudentCourse` and `updateStudentCourse` API methods.
- **Project Structure**:
  - Reorganized `app/(student)/` into logical subdirectories:
    - `courses/`: `index.tsx`, `[id].tsx`, `add.tsx`, `assessment.tsx`, `edit.tsx`
    - `assignments/`: `add.tsx`, `edit.tsx`
    - `tools/`: `calculator.tsx`, `analytics.tsx`
  - Reorganized `lib/` into modules: `auth`, `api`, `logic`, `utils`, `theme`.

### Changed
- **Course Details UI**:
  - Centered Course Name and ID in the header.
  - Replaced "Settings" icon navigation to point to "Edit Course" instead of "Edit Assignment".
  - Removed redundant back button from the header.
- **Routing**: Updated all `router.push` paths to reflect the new directory structure.

### Fixed
- **Amplify Configuration**: Fixed import path for `amplify_outputs.json` in `lib/api/amplify-config.ts` to resolve "Auth UserPool not configured" error.
- **Navigation**: Fixed broken links in `student_dashboard.tsx` and `courses/[id].tsx` caused by file moves.

## [0.1.0] - 2025-01-22

### Added
- **Theme System**: Implemented comprehensive light/dark mode support
  - Created `lib/theme/theme-context.tsx` with React Context for theme management
  - Integrated **NativeWind v4** for Tailwind CSS styling with dark mode support
  - Implemented **System Theme Detection** (auto-detects OS preference)
  - Theme preference persists to AsyncStorage
  - Sun/moon toggle button in header of all screens
  - `useTheme()` hook for accessing theme in components

- **Responsive Layout**: StudentDashboard now features responsive grid layouts
  - 3-column grid for Quick Actions on tablet/desktop (≥768px)
  - 2-column grid for Features section on tablet/desktop
  - Single column on mobile devices

### Changed
- **Styling Architecture**:
  - Re-integrated **NativeWind** and **Tailwind CSS** for styling.
  - Updated components to use Tailwind classes (`className`) alongside `StyleSheet` where appropriate.
  - Configured `tailwind.config.js` with custom theme colors (HSL variables).

- **Updated Components** to use theme system:
  - `components/BottomNav.tsx`: Updated to use theme context.
  - `components/SuccessScreen.tsx`: Updated to use theme context.
  - All student screens now respond to theme changes.

- **Improved Header Styling**:
  - Fixed logout button visibility in light mode.
  - Centered page titles in all screen headers.
  - Theme toggle button uses `theme.colors.muted` for better visibility.

- **Package Upgrades**:
  - Upgraded from Expo SDK 51 to SDK 54
  - Upgraded React from 18.2.0 to 19.1.0
  - Upgraded React Native from 0.74.2 to 0.81.5
  - Updated aws-cdk-lib to ^2.227.0

### Fixed
- **TypeScript Errors**:
  - Fixed FormError component prop name (`message` instead of `error`)
  - Resolved type mismatches in PlatformButton and SuccessScreen

- **Theme Toggle Icons**: Corrected inverted sun/moon icons
  - Light mode now shows ☀️ (sun) to indicate "switch to dark"
  - Dark mode now shows 🌙 (moon) to indicate "switch to light"

### Removed
- `lib/tw.ts` Tailwind utility function (replaced by NativeWind)
- `constants/theme.ts` (replaced by `theme/theme.ts`)
- `constants/` directory (no longer needed)

## Technical Debt Addressed
- Standardized styling approach using NativeWind and Tailwind CSS.
- Improved type safety.
- Reduced boilerplate code for styling.

## Documentation Added
- Created `docs/THEME_SYSTEM.md` - Comprehensive theme system guide
- Created `CHANGELOG.md` - Project change history

## Migration Notes

### For Developers
When adding new screens or components:
1. Import and use `useTheme()` hook from `@/lib/theme/theme-context` for logic.
2. Use Tailwind classes (`className`) for styling: `<View className="bg-background p-4">`.
3. Use `theme.colors.*` for dynamic values in inline styles if necessary.
4. Test in both light and dark modes.

### Breaking Changes
- Changed FormError prop from `error` to `message`
- Theme colors now use HSL format instead of hex

## Future Roadmap
- [ ] More granular theme customization options
- [ ] Theme preview in settings
- [ ] Additional color scheme options
- [ ] Animated theme transitions
