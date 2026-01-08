# Changelog

All notable changes to the Dropt project will be documented in this file.

## [Unreleased] - 2026-01-07

### Added
- **Enhanced Logger Utility** (`lib/utils/logger.ts`):
  - Class-based singleton logger with structured logging support
  - Log levels: debug (🔍), info (ℹ️), warn (⚠️), error (❌)
  - ANSI color codes for terminal output (cyan/blue/yellow/red)
  - ISO timestamps with milliseconds for precise tracking
  - LogContext interface: `{ source?: string, userId?: string, data?: any }`
  - Production safety: Only errors logged in production (via `__DEV__` flag)
  - Special methods: `apiError()` for API failures, `time()/timeEnd()` for performance monitoring
  
- **Platform-Agnostic Theme System**:
  - Created `lib/theme/theme-styles.ts` with HSL to Hex color converter
  - Added `hexColors` and `themedStyles` to theme context for React Native compatibility
  - Implemented time-based auto theme mode (6PM-6AM = dark, 6AM-6PM = light)
  - Added seasonal emoji icons to dashboard (❄️ Winter, 🌸 Spring, ☀️ Summer, 🍂 Fall)
  
- **Security Enhancements**:
  - Added Amplify-generated files to `.gitignore` (API.ts, mutations.ts, queries.ts, subscriptions.ts, schema.ts)
  - Protected backend schema structure from public exposure
  - Migrated all console statements to structured logger (200+ instances)
  - Implemented GDPR/CCPA-compliant logging practices
  - Added user data controls for privacy compliance (export, delete, clear semester)

- **User Data Controls** (`lib/utils/user-data-controls.ts`):
  - **Export My Data**: GDPR Article 15 compliance - download all user data as JSON
  - **Delete Account**: GDPR Article 17 compliance - permanent account and data deletion
  - **Clear Semester Data**: Reset current semester while preserving lifetime statistics
  - Privacy-first implementation with comprehensive error handling

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
- **Complete Logger Migration** (200+ statements across 35+ files):
  - **Core Services**: data-client.ts (85), auth-context.tsx (20), ai-service.ts (7), seed-data.ts (15)
  - **Student Pages**: Dashboard, settings, all courses pages, all tools pages, assignments
  - **Auth Pages**: login.tsx (5), confirm.tsx (14)
  - Migration pattern: `console.error()` → `logger.error('message', { source, userId, data })`
  - All errors now include contextual information for debugging
  - Production builds only log errors (debug/info suppressed via `__DEV__`)
  
- **Complete Theme Migration** (23 files):
  - Migrated all components from NativeWind CSS classes to platform-agnostic `hexColors`
  - Components: BottomNav, GradeDistributionChart, RecommendationCard, SuccessScreen, HeaderProfileBtn
  - Student pages: student_dashboard, settings, all courses screens, all tools screens, assignments
  - Converted arrow function components to regular functions for `useTheme` hook access
  - Fixed text contrast issues across all theme modes (empty states, form fields, navigation)
  
- **Student Dashboard (`app/(student)/student_dashboard.tsx`)**:
  - Added ScrollView top padding for better header spacing
  - Implemented seasonal icons using `getSeasonLabel()` from semester-utils
  - Changed empty state text color for better dark mode contrast
  - Analytics and Resource Hub now filter by current semester only
  
- **Auto Theme Behavior (`lib/theme/theme-context.tsx`)**:
  - Changed from system-based to time-based detection
  - Automatically switches to dark mode between 6PM-6AM
  - Provides consistent theme experience across all platforms

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
- **Theme Migration Syntax Errors**:
  - Fixed malformed className/style syntax in assessment.tsx, [id].tsx, edit.tsx
  - Corrected TextInput color properties in email-generator.tsx
  - Fixed component structure in drop-analysis.tsx (EmptyAnalysis, RiskSummaryCard)
  - Resolved back button and timer control colors in study-timer.tsx
  - Fixed contrast issues in resource-hub.tsx navigation elements
  
- **NativeWind Compatibility**:
  - Resolved CSS variable limitation in React Native (bg-background, text-foreground)
  - Eliminated platform-specific rendering issues with conditional className values
  - Fixed ternary operator syntax within style attributes

- **Logging & Security**:
  - Eliminated all console statements from app/ and components/ directories
  - Fixed potential data exposure in error messages (no more `JSON.stringify()` on errors)
  - Improved error tracking with structured context (source function, userId, error data)
  
- **Type Safety**: Added null checks and type assertions for new UserSettings fields
- **Performance**: Deadline tracker only loads current semester courses (reduced data fetch)

### Security
- **GDPR/CCPA Compliance**:
  - userId logging permitted under GDPR Article 6 (legitimate interest for debugging/security)
  - Cognito UUIDs are pseudonymous identifiers (not directly identifying PII)
  - No passwords or sensitive data logged in any environment
  - Production logging limited to errors only (privacy-first approach)

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
