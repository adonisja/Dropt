# Bugs and Fixes Log
**Project:** Dropt - AI-Powered Course Drop Recommendation System

This document tracks all bugs discovered, fixes implemented, and the rationale behind each fix. Entries are sorted in descending chronological order (latest first).

---

## 2026-01-07 - Security & Logging Infrastructure

### Enhancement #21: Structured Logger Implementation
**Files:** `lib/utils/logger.ts` + 35+ files across codebase
**Severity:** Medium (Security/Maintainability)
**Type:** Security Enhancement

**Issue:**
Application used raw `console.log/error/warn` statements throughout the codebase (200+ instances), which:
1. Exposed sensitive data in production builds (error objects with JSON.stringify)
2. Lacked structured context for debugging (no source function, userId, or timestamps)
3. Had no production safety controls (all logs visible in production)
4. Made error tracking and correlation difficult across distributed systems

**Problem Analysis:**
- **Security Risk**: Console logs in production could expose PII, error stack traces, and system internals
- **GDPR/CCPA Concerns**: Uncontrolled logging might violate privacy regulations
- **Debugging Difficulty**: Logs lacked context about where errors occurred and which user was affected
- **Performance**: Excessive logging in production could impact app performance

**Solution Implemented:**
Created a comprehensive structured logger utility (`lib/utils/logger.ts`) with:

1. **Class-based singleton pattern**:
   ```typescript
   class Logger {
     private isDev: boolean = __DEV__;
     public debug/info/warn/error(message: string, context?: LogContext): void
   }
   ```

2. **Structured LogContext interface**:
   ```typescript
   interface LogContext {
     source?: string;      // Function/component name
     userId?: string;      // User identifier (pseudonymous)
     data?: any;          // Additional context
   }
   ```

3. **Production safety**:
   - Only errors logged when `__DEV__ === false`
   - Debug/info/warn suppressed in production builds
   - No sensitive data exposure

4. **Enhanced developer experience**:
   - ANSI color codes (cyan/blue/yellow/red)
   - Emoji symbols (🔍 ℹ️ ⚠️ ❌)
   - ISO timestamps with milliseconds
   - Performance timing methods (`time()`/`timeEnd()`)

**Migration Completed:**
- ✅ **Core Services** (135 statements): data-client, auth-context, ai-service, seed-data, theme-context, amplify-config, semester-stats
- ✅ **Student Pages** (50+ statements): dashboard, settings, 8 courses pages, 3 assignments pages, 9 tools pages
- ✅ **Auth Pages** (19 statements): login, confirm
- ✅ **Components** (0 statements): Already clean
- ✅ **Zero console statements** remaining in app/ and components/ directories

**Migration Pattern:**
```typescript
// Before:
console.error('Error fetching courses:', JSON.stringify(errors, null, 2));

// After:
logger.error('Error fetching courses', {
  source: 'fetchStudentCourses',
  userId: studentId,
  data: { errors }
});
```

**Security & Privacy Compliance:**
- ✅ **GDPR Article 6** compliance: userId logging permitted for legitimate interest (debugging, security monitoring)
- ✅ **Pseudonymous identifiers**: Cognito UUIDs don't constitute directly identifying PII
- ✅ **CCPA compliant**: Technical identifiers allowed for service provision
- ✅ **No sensitive data**: Passwords, payment info, or sensitive PII never logged
- ✅ **Data minimization**: Only necessary context logged, production logs limited to errors

**Testing:**
- Verified all files compile without TypeScript errors
- Confirmed no console statements remain in production code (excluding logger implementation)
- Validated production mode suppresses debug/info/warn logs

**Key Learnings:**
1. **Structured logging is essential** for production debugging and error correlation
2. **Privacy-first approach**: Always consider GDPR/CCPA when implementing logging
3. **Production safety**: Use feature flags (`__DEV__`) to control log verbosity
4. **Context is key**: Including source, userId, and data makes debugging significantly easier

**Prevention:**
- Add ESLint rule to prevent direct console usage
- Document logging standards in contributing guidelines
- Review PR diffs for accidental console statements

---

## 2026-01-05 - Worklets Version Mismatch (Expo Go Limitation)

### Bug #20: Worklets Mismatch Between JavaScript and Native Code
**Files:** All files using `react-native-reanimated`
**Severity:** Critical (App Crash)
**Discovered by:** iOS Simulator runtime error

**Issue:**
Application crashed immediately on launch with the error:
```
[WorkletsError: [Worklets] Mismatch between JavaScript part and native part of Worklets (0.7.1 vs 0.5.1)
```

**Problem:**
The project's JavaScript dependencies (`react-native-reanimated@~4.1.1` and `react-native-worklets-core@^1.6.2`) required Worklets version **0.7.1**, but the Expo Go client (version 54.0.6) installed on the iOS Simulator was compiled with Worklets version **0.5.1**. This created a version mismatch between the JavaScript code and the native runtime.

**Root Cause Analysis:**
1. **Expo Go is a pre-compiled app** with fixed native dependencies that cannot be updated without Expo releasing a new version.
2. The official Expo Go 54.0.6 available on Expo's servers was built with an older version of react-native-reanimated.
3. Even after uninstalling and reinstalling Expo Go, the same outdated version (54.0.6) was downloaded.
4. Attempting to downgrade `react-native-reanimated` to 3.16.1 caused different errors (`Cannot find module 'react-native-worklets/plugin'`).

**Attempted Solutions (Failed):**
- ❌ Downgrading `react-native-reanimated` to 3.16.1 → caused Babel plugin errors
- ❌ Installing `react-native-worklets-core` manually → peer dependency conflicts
- ❌ Uninstalling Expo Go from the simulator → same version reinstalled
- ❌ Factory resetting the simulator → same version downloaded again
- ❌ Clearing Metro cache → no effect on native code mismatch

**Final Solution:**
Created a **development build** instead of using Expo Go:
```bash
npx expo prebuild && npx expo run:ios
```

This generates native iOS/Android project files with the exact dependencies required by the project, compiling Worklets 0.7.1 into the app binary.

**Rationale:**
- Expo Go is designed for rapid prototyping with common dependencies, but has limitations when projects require bleeding-edge or specific native library versions.
- Development builds provide full control over native dependencies at the cost of longer build times.
- This is the recommended approach for production apps or projects with specific native module requirements.

**Key Learnings:**
1. **Expo Go Limitations**: Pre-compiled Expo Go clients may lag behind the latest library versions available via npm.
2. **Native vs JavaScript Dependencies**: JavaScript package updates do not automatically update the native code in pre-built apps.
3. **Development Builds**: Essential for projects that need specific native library versions or custom native modules.
4. **Simulator State**: Uninstalling apps from the simulator does not force Expo to download a different version of Expo Go.

**Prevention:**
- Use `npx expo-doctor` to check for compatibility issues before updating dependencies.
- Monitor Expo's release notes for Expo Go updates that include newer native library versions.
- Consider using development builds from the start for projects with complex native dependencies.

---

## 2025-11-23 - Assignment Management & UI Improvements

### Bug #15: Assignment ID Generation Collision
**File:** `app/(student)/add-assignment.tsx`
**Severity:** High
**Discovered by:** User testing

**Issue:**
When adding multiple assignments, the system would sometimes generate duplicate IDs or fail to detect existing IDs, leading to data overwrites or errors.

**Problem:**
The ID generation logic relied on a simple counter or timestamp that wasn't checking against the *current* database state effectively before generation.

**Fix:**
Implemented a pre-fetch of all existing assignments to determine the highest current ID before generating a new one.
```typescript
// Fetch existing assignments first
const existingAssignments = await getAssignments(studentCourseId);
// Generate ID based on existing count + 1 (or similar robust logic)
const newId = generateUniqueId(existingAssignments);
```

**Rationale:**
- Ensures data integrity by preventing primary key collisions.
- Essential for reliable CRUD operations.

### Bug #16: Edit Assignment Data Persistence
**File:** `app/(student)/edit-assignment.tsx`
**Severity:** Medium
**Discovered by:** User testing

**Issue:**
After editing an assignment and returning to the course details screen, the data would sometimes appear stale (unchanged) until a manual refresh.

**Problem:**
The navigation stack was preserving the previous state of the screen, and the data fetch was only triggering on initial mount (`useEffect`), not on screen focus.

**Fix:**
Switched from `useEffect` to `useFocusEffect` (from Expo Router) to trigger a data refresh whenever the screen comes into focus.

**Rationale:**
- Provides immediate feedback to the user that their changes were saved.
- Standard pattern for mobile navigation where screens are kept in memory.

### Bug #17: Delete Confirmation on Web
**File:** `app/(student)/course-details.tsx`
**Severity:** Medium
**Discovered by:** Cross-platform testing

**Issue:**
The "Delete Assignment" button used `Alert.alert`, which is not supported or behaves poorly on web browsers, causing the delete action to fail or do nothing.

**Problem:**
React Native's `Alert` API is mobile-centric.

**Fix:**
Added a platform check to use `window.confirm` for web and `Alert.alert` for native platforms.
```typescript
if (Platform.OS === 'web') {
    if (window.confirm('Are you sure?')) handleDelete();
} else {
    Alert.alert('Are you sure?', ..., handleDelete);
}
```

**Rationale:**
- Ensures functional parity across Web, iOS, and Android.

### Bug #18: White-on-White Text Visibility
**File:** `app/(student)/add-assignment.tsx`, `app/(student)/edit-assignment.tsx`
**Severity:** Low (UI)
**Discovered by:** Visual inspection

**Issue:**
Input fields had white text on a white background (or very light gray), making them unreadable.

**Problem:**
NativeWind/Tailwind defaults or theme inheritance caused a conflict in text colors for `TextInput` components.

**Fix:**
Explicitly set `color: '#333'` (dark gray) for input text styles.

**Rationale:**
- Basic accessibility and usability requirement.

### Bug #19: TypeScript Property Mismatch
**File:** `lib/data-client.ts`
**Severity:** Low (Build Warning)
**Discovered by:** Compiler check

**Issue:**
TypeScript error `Property 'timeInvestment' does not exist...` when mapping student course data.

**Problem:**
The schema defined the field as `weeklyTimeInvestment`, but the mapping code used `timeInvestment`.

**Fix:**
Updated the property access to `studentCourse.weeklyTimeInvestment`.

**Rationale:**
- Ensures type safety and prevents runtime `undefined` errors.

---

## 2025-11-20 - Course Assessment Implementation

### Bug #12: Schema Field Name Mismatch
**File:** `amplify/data/resource.ts`
**Severity:** Medium
**Discovered by:** Implementation testing

**Issue:**
During course assessment implementation, schema field was named `overallWellbeingImpact` but frontend code used `overallWellbeing`, causing field mismatch.

**Problem:**
Initial schema used verbose naming (`overallWellbeingImpact`) but frontend code used shorter version (`overallWellbeing`). This would cause data to be lost when saving assessment.

**Fix:**
Updated schema to match frontend naming:
```typescript
// Before
overallWellbeingImpact: a.integer(),

// After
overallWellbeing: a.integer(),  // 1-10 scale: overall feeling about course
```

**Rationale:**
- Shorter name is clearer and more concise
- Consistency between frontend and backend critical for data integrity
- "Impact" was redundant given the field already measures wellbeing

---

### Bug #13: Try-Catch Block Placement Error
**File:** `app/(student)/course-assessment.tsx`
**Severity:** **HIGH**
**Discovered by:** Code validation

**Issue:**
During guided implementation, try-catch block was placed outside the `loadCourseData` function, making it unreachable and ineffective.

**Problem:**
```typescript
// Incorrect structure
const loadCourseData = async () => {
    // function body
}

try {
    // error handling code here - UNREACHABLE!
} catch (error) {
    // ...
}
```

**Fix:**
Moved try-catch inside the function:
```typescript
const loadCourseData = async () => {
    try {
        // function body with error handling
    } catch (error) {
        console.error('Error loading course:', error);
        setError('Failed to load course data');
    }
}
```

**Rationale:**
- Try-catch must wrap the code that can throw errors
- Placement outside function makes error handling dead code
- Critical for proper error handling in async operations

---

### Bug #14: Incorrect Default Values
**File:** `app/(student)/course-assessment.tsx`
**Severity:** Medium
**Discovered by:** User requirements review

**Issue:**
Initial implementation had default values (`otherCoursesCount = 0`, `currentGPA = 3.0`) despite user explicitly requesting empty defaults for data accuracy.

**Problem:**
Defaults can bias data collection if user accepts them without conscious input.

**Fix:**
Changed all numeric inputs to empty strings:
```typescript
// Before
const [otherCoursesCount, setOtherCoursesCount] = useState(0);
const [currentGPA, setCurrentGPA] = useState(3.0);

// After
const [otherCoursesCount, setOtherCoursesCount] = useState('');
const [currentGPA, setCurrentGPA] = useState('');  // Optional
```

**Rationale:**
- Forces conscious input rather than accepting potentially incorrect defaults
- User explicitly chose empty defaults for maximum data accuracy
- String state pattern required for TextInput compatibility

---

### Bug #15: Validation Logic Errors
**File:** `app/(student)/course-assessment.tsx`
**Severity:** **HIGH**
**Discovered by:** Code validation

**Issue:**
Multiple validation logic errors in initial implementation:
1. `totalCredits` treated as optional when it should be required
2. `otherCoursesCount` validated before parsing from string
3. `currentGPA` comparison performed on string instead of number

**Problem:**
```typescript
// Error 1: Missing required field validation
if (totalCredits && totalCredits.trim() !== '') {  // Should always check
    const credits = parseInt(totalCredits);
    // ...
}

// Error 2: Validation before parsing
if (otherCoursesCount < 0) {  // otherCoursesCount is a string!
    // ...
}

// Error 3: String comparison instead of number
if (currentGPA < 0 || currentGPA > 4.0) {  // Comparing strings!
    // ...
}
```

**Fix:**
```typescript
// Fix 1: Required field validation
if (!totalCredits || totalCredits.trim() === '') {
    setError('Please enter your total credit hours this semester');
    return false;
}
const credits = parseInt(totalCredits);
if (isNaN(credits) || credits <= 0) {
    setError('Total credit hours must be a positive number');
    return false;
}

// Fix 2: Parse before validation
const otherCourses = parseInt(otherCoursesCount);
if (isNaN(otherCourses) || otherCourses < 0) {
    setError('Other courses count must be 0 or higher');
    return false;
}

// Fix 3: Parse before comparison
if (currentGPA && currentGPA.trim() !== '') {
    const gpa = parseFloat(currentGPA);
    if (isNaN(gpa) || gpa < 0 || gpa > 4.0) {
        setError('GPA must be between 0.0 and 4.0');
        return false;
    }
}
```

**Rationale:**
- String-to-number conversion must happen before numeric validation
- Required fields must always be validated
- Type-safe comparisons prevent subtle bugs
- Clear error messages guide user to correct input

---

### Bug #16: Missing User Null Check
**File:** `app/(student)/course-assessment.tsx`
**Severity:** Medium
**Discovered by:** TypeScript compilation

**Issue:**
TypeScript error: "'user' is possibly 'null'" in `handleSave` function.

**Problem:**
```typescript
const handleSave = async () => {
    // ... validation

    await updateStudentCourseAssessment(user.id, courseId, { // user might be null!
        // ...
    });
}
```

**Fix:**
Added null check at start of function:
```typescript
const handleSave = async () => {
    if (!validateForm()) {
        return;
    }

    if (!user?.id || !courseId) {
        setError('Missing user or course information');
        return;
    }

    // Safe to use user.id here
    await updateStudentCourseAssessment(user.id, courseId, {
        // ...
    });
}
```

**Rationale:**
- Auth context can return null user during transitions
- Early return pattern prevents runtime errors
- Clear error message helps debug if issue occurs
- TypeScript type safety enforced

---

## 2025-11-19 - Data Client & Dashboard Fixes

### Bug #11: Student Route Group Not Registered
**File:** `app/_layout.tsx`
**Severity:** **HIGH**
**Discovered by:** User testing

**Issue:**
After signing in, user remained on loading screen instead of being redirected to student dashboard.

**Problem:**
The root layout's `Stack` didn't include a `Stack.Screen` entry for the `(student)` route group.

**Fix:**
Added the student route group to the root layout:
```typescript
<Stack.Screen
  name="(student)"
  options={{
    headerShown: false
  }}
/>
```

**Rationale:**
- Expo Router requires explicit registration of route groups in parent layouts
- The `(student)` group is now accessible via `router.replace('/(student)/student_dashboard')`

---

### Bug #10: 401 Unauthorized Error on GraphQL Queries
**File:** `lib/data-client.ts`
**Severity:** **HIGH**
**Discovered by:** User testing

**Issue:**
```
POST https://...appsync-api.us-east-1.amazonaws.com/graphql 401 (Unauthorized)
GraphQLError: Unauthorized
```

**Problem:**
1. The Amplify data client was being initialized at module load time, before Amplify was configured
2. The client wasn't explicitly using the `userPool` auth mode

**Fix:**
1. Changed to lazy initialization pattern:
```typescript
let _client: ReturnType<typeof generateClient<Schema>> | null = null;

function getClient() {
    if (!_client) {
        _client = generateClient<Schema>({
            authMode: 'userPool'
        });
    }
    return _client;
}
```

2. All database operations now use `getClient()` instead of direct `client` reference

**Rationale:**
- Lazy initialization ensures Amplify is configured before client creation
- Explicit `authMode: 'userPool'` ensures authenticated requests
- Single client instance is reused for performance

---

## 2025-11-18 - Authentication & Navigation Fixes

### Bug #9: Navigation Stuck on Login Page After Successful Sign-in
**File:** `app/(auth)/login.tsx`, `app/index.tsx`
**Severity:** **HIGH**
**Discovered by:** User testing

**Issue:**
After successful Cognito authentication, user remained on login page despite `isAuthenticated: true` in state.

**Problem:**
1. Login screen redirected to `/` (index) after sign-in
2. Index page only showed Sign In/Create Account links regardless of auth state
3. User appeared stuck because home page didn't recognize authenticated users

**Fix:**
Updated `app/index.tsx` to check `isAuthenticated` state and show different content:
```typescript
const { isAuthenticated, isLoading, user, logout } = useAuth();

if (isAuthenticated && user) {
  return (
    <View>
      <Text>Welcome, {user.name}!</Text>
      <Text>You are signed in as a {user.role}</Text>
      <TouchableOpacity onPress={logout}>Sign Out</TouchableOpacity>
    </View>
  );
}
```

**Rationale:**
- Home page must reflect authentication state
- Authenticated users see personalized dashboard
- Unauthenticated users see sign-in/register options

---

### Bug #8: "Already a signed in user" Error on Login
**File:** `lib/auth-context.tsx`
**Severity:** Medium
**Discovered by:** User testing

**Issue:**
When attempting to sign in, Cognito returned error: "There is already a signed in user."

**Problem:**
Amplify's `signIn()` throws if a session already exists, even for the same user.

**Fix:**
```typescript
} catch (error) {
  // Handle the case where a user is already signed in
  if (error instanceof Error && error.message.includes('already a signed in user')) {
    await signOut();
    return login(credentials);  // Retry after sign out
  }
  // ... other error handling
}
```

**Rationale:**
- Sign out existing session before retrying login
- Provides seamless UX without exposing internal state management
- Recursive call ensures user gets signed in on retry

---

### Bug #7: CloudFormation Circular Dependency Error
**File:** `amplify/backend.ts`, `amplify/auth/post-confirmation/resource.ts`
**Severity:** **HIGH**
**Discovered by:** Amplify sandbox deployment

**Issue:**
```
[ERROR] CloudFormation deployment failed due to circular dependency
found between nested stacks [auth, data, function]
```

**Problem:**
Post-confirmation Lambda was added to both auth triggers AND the backend resource list, creating circular references between CloudFormation stacks.

**Fix:**
1. Added `resourceGroupName: 'auth'` to function definition:
```typescript
export const postConfirmation = defineFunction({
  name: 'post-confirmation',
  resourceGroupName: 'auth',  // Assign to auth stack
});
```

2. Removed explicit function and IAM policy from backend.ts:
```typescript
// Simplified - function is now part of auth stack
defineBackend({
  auth,
  data,
});
```

**Rationale:**
- Auth triggers should be in auth stack
- Amplify handles permissions for auth triggers automatically
- Eliminates cross-stack dependencies

---

### Bug #6: Missing AWS SDK Type Declarations
**File:** `amplify/auth/post-confirmation/handler.ts`
**Severity:** Medium
**Discovered by:** TypeScript compilation

**Issue:**
```
error TS2307: Cannot find module '@aws-sdk/client-cognito-identity-provider'
```

**Problem:**
Lambda handler imports AWS SDK v3 for Cognito client, but package wasn't installed locally for type checking.

**Fix:**
```bash
npm install @aws-sdk/client-cognito-identity-provider
```

**Rationale:**
- Package is available in Lambda runtime, but TypeScript needs local types
- Local install provides IDE support and type checking during development
- Amplify excludes runtime-available packages from Lambda bundle

---

## 2025-01-14 - Grade Calculation Logic Fixes

### Bug #5: Final Exam Example Data - Incorrect Null Handling
**File:** `types.ts` (line 106)
**Severity:** Medium
**Discovered by:** Code review

**Issue:**
```typescript
// Before (incorrect)
{ assignmentID: "A009", assignmentName: "Final", category: "Final",
  scoreEarned: 0, maxScore: 100 }  // Comment said "Not taken yet" but used 0
```

**Problem:**
Using `0` for an ungraded assignment incorrectly represents it as a zero score (F), which would drastically lower the calculated grade. The value `0` means "earned zero points" while `null` means "not graded yet."

**Fix:**
```typescript
// After (correct)
{ assignmentID: "A009", assignmentName: "Final", category: "Final",
  scoreEarned: null, maxScore: 100 }  // Now correctly represents ungraded
```

**Rationale:**
- `null` = not yet graded → should be ignored in current grade calculation
- `0` = graded and earned zero points → should count as 0%
- Proper null handling is critical for accurate best/worst case projections

---

### Bug #4: Unused Variable in Weight Calculation
**File:** `calculateCurrentGrade.tsx` (lines 63-64)
**Severity:** Low
**Discovered by:** Code review

**Issue:**
```typescript
// Before (redundant)
const weightedScore = (categoryPercentage * category.weight) / 100;  // Line 63
totalWeightedScore += categoryPercentage * category.weight;  // Line 64
```

**Problem:**
Variable `weightedScore` was calculated but never used. Line 64 recalculated the same value inline, creating redundancy and potential confusion.

**Fix:**
```typescript
// After (clean)
totalWeightedScore += categoryPercentage * category.weight;
totalWeightUsed += category.weight;
```

**Rationale:**
- Removed unused variable to reduce code complexity
- Direct calculation is clearer and more efficient
- Eliminates potential for bugs if variable and inline calculation diverge

---

### Bug #3: Duplicate Null Check
**File:** `calculateCurrentGrade.tsx` (lines 20-22, 24-27)
**Severity:** Low
**Discovered by:** Code review

**Issue:**
```typescript
// Before (duplicate)
if (gradedAssignments.length === 0) {
    continue;  // Line 21
}

// 3. Skip category if nothing is graded
if (gradedAssignments.length === 0) {
    continue;  // Line 26 - DUPLICATE!
}
```

**Problem:**
Identical check performed twice in sequence, creating dead code and reducing readability.

**Fix:**
```typescript
// After (single check)
// 3. Skip category if nothing is graded
if (gradedAssignments.length === 0) {
    continue;
}
```

**Rationale:**
- Removed redundant check
- Improved code clarity
- Single responsibility: one check, one purpose

---

### Bug #2: Incorrect Drop Policy Implementation
**File:** `calculateCurrentGrade.tsx` (line 36)
**Severity:** **HIGH**
**Discovered by:** Logic analysis

**Issue:**
```typescript
// Before (incorrect)
const numToDrop = Math.min(
    category.dropLowest,
    Math.max(0, gradedAssignments.length - 1)  // Kept only 1 minimum
);
```

**Problem:**
Policy stated: "If dropLowest=2 and only 3 graded assignments exist, drop 1 and keep 2."

However, the code calculated:
- 3 graded, dropLowest=2 → `Math.min(2, Math.max(0, 2)) = 2` → drops 2, keeps 1 ❌

This violated the requirement to keep at least 2 assignments for statistical validity.

**Fix:**
```typescript
// After (correct)
const numToDrop = Math.min(
    category.dropLowest,
    Math.max(0, gradedAssignments.length - 2)  // Ensure at least 2 remain
);
```

**Test cases:**
- 3 graded, dropLowest=2 → `Math.min(2, 1) = 1` → drop 1, keep 2 ✅
- 5 graded, dropLowest=2 → `Math.min(2, 3) = 2` → drop 2, keep 3 ✅
- 2 graded, dropLowest=2 → `Math.min(2, 0) = 0` → drop 0, keep 2 ✅
- 1 graded, dropLowest=2 → `Math.min(2, -1→0) = 0` → drop 0, keep 1 ✅

**Rationale:**
- Maintains statistical validity by requiring minimum 2 grades for averaging
- Prevents edge case where only 1 grade determines entire category score
- Aligns with stated business logic and educational best practices

---

### Bug #1: Function Name Typo
**File:** `calculateCurrentGrade.tsx` (line 3)
**Severity:** Medium
**Discovered by:** Code review

**Issue:**
```typescript
// Before (typo)
export function calulateCurrentGrade(data: StudentCourseData): number {
//                 ^^^ Missing 'c'
```

**Problem:**
Typo in function name would cause import errors and failed function calls.

**Fix:**
```typescript
// After (correct)
export function calculateCurrentGrade(data: StudentCourseData): number {
```

**Rationale:**
- Corrects spelling error
- Ensures function can be imported and called correctly
- Maintains consistency with naming conventions

---

## Future Bugs

*This section will be updated as new bugs are discovered and fixed.*

---

## Bug Categories

### By Severity
- **High:** 7 (Drop policy logic, navigation stuck, circular dependency, route not registered, 401 unauthorized, try-catch placement, validation logic)
- **Medium:** 7 (Function typo, null handling, already signed in, missing types, schema field mismatch, incorrect defaults, user null check)
- **Low:** 2 (Duplicate check, unused variable)

### By Type
- **Logic errors:** 5 (Drop policy, null handling, already signed in, incorrect defaults, validation logic)
- **Infrastructure:** 3 (Circular dependency, missing types, 401 unauthorized)
- **UX/Navigation:** 2 (Navigation stuck on login, route not registered)
- **Code quality:** 4 (Duplicate check, unused variable, try-catch placement, user null check)
- **Data integrity:** 1 (Schema field mismatch)
- **Typos:** 1 (Function name)

---

## Lessons Learned

1. **Test edge cases thoroughly** - The drop policy bug would have been caught with test cases for 1, 2, 3 graded assignments
2. **Null vs Zero matters** - In grading systems, the difference between "not graded" and "zero points" is critical
3. **Code reviews catch typos** - Automated testing wouldn't catch a correctly-functioning but incorrectly-named function
4. **Remove dead code immediately** - Duplicate checks and unused variables create technical debt
5. **Schema-frontend naming must match** - Field name mismatches cause silent data loss
6. **Validate code structure before implementation** - Try-catch block placement errors waste time
7. **Parse strings before numeric validation** - Type mismatches in validation logic cause subtle bugs
8. **Empty defaults prevent bias** - Forcing conscious input improves data quality
9. **TypeScript null checks are critical** - Auth context transitions can cause null pointer errors

---

## Implementation Notes

### Course Assessment Feature (2025-11-20)

**Files Modified:**
- `amplify/data/resource.ts` - Added psychological and academic context fields to StudentCourse model
- `lib/data-client.ts` - Added `updateStudentCourseAssessment()` function (line 269)
- `app/(student)/course-assessment.tsx` - New 487-line implementation with custom slider component
- `app/(student)/_layout.tsx` - Registered course-assessment route (line 135)
- `app/(student)/course-details.tsx` - Added assessment button (line 190)

**Key Design Patterns:**
1. **String State Pattern** - TextInput uses strings, parse to numbers on save
2. **Slider Component** - Custom 1-10 interactive slider with color-coded feedback (green/yellow/red)
3. **Empty Defaults** - All numeric inputs start empty for data accuracy
4. **Comprehensive Validation** - Realistic bounds with helpful error messages
5. **Modal Presentation** - Assessment screen hides bottom nav for focus

**Validation Rules:**
- Weekly hours: 0 < hours ≤ 80
- Total credits: 0 < credits ≤ 30 (typical: 12-18)
- Other courses: ≥ 0
- Current GPA: 0.0 ≤ gpa ≤ 4.0 (optional)

**Future Integration:**
Assessment data will feed into Phase 2 AI recommendation algorithm:
- Psychological Health (20% weight): uses stressLevel, overallWellbeing, impactOnOtherCourses
- Academic Context (15% weight): uses semesterCreditHours, otherCoursesCount, currentGPA

---

**Last Updated:** 2025-11-20
**Maintained By:** Development Team
