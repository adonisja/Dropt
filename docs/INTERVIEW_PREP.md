# Technical Interview Preparation - Dropt Project

This document captures interview-style questions discussed during the development of the Dropt application, along with user responses and instructor feedback. It serves as a resource for reviewing key software engineering concepts encountered in the project.

---

## Recent Features & Architecture (2026-01-07)

### 6. Security & Logging Infrastructure

**Context:**
We implemented a structured logger utility and migrated 200+ console statements across the codebase to use it, replacing raw `console.log/error` calls.

**Question:**
"Why is it important to have a structured logging system in production applications, and what are the security risks of using raw console.log statements?"

**Expected Answer Points:**
1. **Security Risks of Raw Console Logging:**
   - Exposes sensitive data in production builds (error stack traces, user data)
   - `JSON.stringify()` on error objects can leak system internals
   - No control over what gets logged in different environments
   - Potential GDPR/CCPA violations if PII is logged without controls

2. **Benefits of Structured Logging:**
   - **Contextual Information:** `source`, `userId`, `data` fields make debugging easier
   - **Production Safety:** Use feature flags (`__DEV__`) to suppress logs in production
   - **Privacy Compliance:** Control what data is logged and where
   - **Performance:** Reduce logging overhead in production
   - **Correlation:** Track errors across distributed systems with consistent context

**Implementation Pattern:**
```typescript
// ❌ Bad - Raw console with potential data exposure
console.error('Error fetching courses:', JSON.stringify(errors, null, 2));

// ✅ Good - Structured logger with context
logger.error('Error fetching courses', {
  source: 'fetchStudentCourses',
  userId: studentId,  // Pseudonymous identifier
  data: { errors }    // Structured error context
});
```

**Follow-up Question:**
"How do you ensure GDPR compliance when logging user data?"

**Expected Answer:**
- Log only **pseudonymous identifiers** (UUIDs, not emails/names)
- Use **legitimate interest** basis (Article 6) for security/debugging
- Implement **data minimization** (only log what's necessary)
- **Suppress logs in production** except for critical errors
- Document logging practices in privacy policy

---

### 7. Platform-Agnostic Theme System

**Context:**
We migrated from NativeWind CSS classes to a platform-agnostic theme system using `hexColors` to support both React Native and web platforms.

**Question:**
"Why can't you use CSS variables like `bg-background` or `text-foreground` directly in React Native, and how did you solve this cross-platform challenge?"

**Expected Answer:**
1. **React Native Limitation:**
   - React Native uses JavaScript StyleSheet API, not CSS
   - No support for CSS custom properties (variables)
   - NativeWind v4 can't resolve CSS variables at runtime on mobile

2. **Solution - HSL to Hex Conversion:**
   ```typescript
   // theme-styles.ts
   function hslToHex(h: number, s: number, l: number): string {
     // Convert HSL to RGB to Hex
     // Returns: '#1a1a1a' for dark mode background
   }
   
   const hexColors = {
     background: hslToHex(0, 0, isDark ? 10 : 100),
     foreground: hslToHex(0, 0, isDark ? 98 : 10),
     // ... 20+ theme colors
   };
   ```

3. **Platform Consistency:**
   - Web: Uses CSS variables via Tailwind
   - Mobile: Uses computed hex colors from theme context
   - Single source of truth for color values

**Follow-up Question:**
"What is the advantage of using a time-based auto theme (6PM-6AM dark) versus system theme detection?"

**Expected Answer:**
- **Predictability:** Users get consistent experience regardless of OS settings
- **User Comfort:** Automatic dark mode during evening hours reduces eye strain
- **Cross-platform Consistency:** Web, iOS, Android all behave the same way
- **Trade-off:** Less respect for user's explicit OS preference

---

### 8. Semester-Based Lifecycle Management

**Context:**
We implemented automatic semester transition detection that archives old data and resets per-semester statistics while preserving lifetime totals.

**Question:**
"How do you handle data that needs to be both time-bound (per semester) AND cumulative (all-time), like task completion statistics?"

**Expected Answer:**
1. **Dual Statistics Model:**
   ```typescript
   interface UserSettings {
     // Current semester (resets each semester)
     currentSemester: string;  // "Spring 2026"
     currentYear: number;       // 2026
     
     // Per-semester stats (reset)
     tasksCompleted: number;
     tasksMissed: number;
     
     // Lifetime stats (cumulative)
     totalTasksCompleted: number;
     totalTasksMissed: number;
     totalTasksEver: number;
   }
   ```

2. **Transition Logic:**
   - Detect semester change using `detectCurrentSemester()`
   - Archive current semester data before resetting
   - Update lifetime totals: `totalTasksCompleted += tasksCompleted`
   - Reset per-semester counters to 0

3. **Benefits:**
   - Users see progress within current semester (motivation)
   - Lifetime stats show long-term achievement (gamification)
   - Historical data preserved for analytics

**Follow-up Question:**
"What happens if a user doesn't open the app for an entire semester?"

**Expected Answer:**
- **Challenge:** Data might be lost if transition happens without app launch
- **Solution Options:**
  1. **Server-side cron job** to trigger transitions automatically
  2. **Catch-up logic** to detect missed transitions and archive retroactively
  3. **Grace period** to allow late submission before archiving
- **Current Implementation:** Client-side detection on app launch (MVP)

---

## Original Interview Questions

### 1. Frontend Architecture & Data Modeling

**Context:**
In `app/(student)/tools/calculator.tsx`, we created a local interface `AssignmentSimulation` instead of using the raw backend data type directly.

**Question:**
"In this codebase, we have `AssignmentSimulation` (frontend state) and the raw data from `fetchCompleteCourseData` (backend response). Why is it considered a best practice to create a separate interface like `AssignmentSimulation` instead of just using the backend type directly in your component state?"

**Candidate Response:**
"Creating a new interface prevents unwanted mutation of the data on the backend for front-end operations that does not need to be or should not be stored on the database. It also prevents us needing to call the backend/database every time we need to perform even simple operations, minimizing latency and especially costs."

**Instructor Feedback & Analysis:**
The candidate correctly identified practical benefits regarding data safety and performance. To elevate this to a "Senior Engineer" level answer, focus on **Architecture** and **Decoupling**.

*   **Decoupling:** The Backend API and Frontend UI have different lifecycles. If the backend team renames a field (e.g., `maxScore` to `totalPoints`), a direct dependency would break the entire app. With a separate interface/adapter layer, only the mapping logic needs to change.
*   **UI-Specific State:** The frontend often needs state that doesn't exist in the database. In this case, `simulatedScore` is a "What-If" value that exists purely for the user session and should not be persisted to the database.

**Refined "Senior" Answer:**
"I create a separate interface to **decouple** the frontend from the backend. It allows me to transform raw API data into a shape that is optimized for the UI—like adding the `simulatedScore` field for client-side calculations—without polluting the backend data model. It also acts as an anti-corruption layer; if the API changes, I only have to update my mapping logic, not every component."

---

## 2. React Lifecycle & Performance

**Context:**
In the `WhatIfCalculator` component, we used `useEffect` to recalculate grades whenever the `assignments` state changed.

**Question:**
"If we were to remove the dependency array `[assignments]` entirely (so the code is just `useEffect(() => { ... })`), what would happen to our application, and why is that dangerous?"

**Candidate Response:**
"If we removed the dependency array entirely, then the effect would run after every render."

**Instructor Feedback & Analysis:**
The candidate is correct. The critical danger here is the **Infinite Loop**.

1.  The Effect runs after a render.
2.  The Effect calls `setSimulatedGrade` (a State Update).
3.  State Updates trigger a Re-render.
4.  The Re-render triggers the Effect again.
5.  Repeat forever -> App Crash.

**Key Takeaway:**
Always scrutinize `useEffect` hooks that update state. If the state being updated triggers the effect that updates it, you have created a cycle.

---

## 3. TypeScript & Data Safety (Bonus)

**Context:**
We encountered a type error where `scoreEarned` could be `undefined` from the API, but our interface expected `number | null`.

**Concept:**
**Normalization**. When data enters the application boundary (from an API), it should be normalized into a consistent shape expected by the application.

**Technique:**
Using the **Nullish Coalescing Operator (`??`)** or explicit checks to convert `undefined` (missing) to `null` (empty).

```typescript
// Explicit check (Safe)
scoreEarned: a.scoreEarned === undefined ? null : a.scoreEarned

// Nullish Coalescing (Cleaner)
scoreEarned: a.scoreEarned ?? null
```

---

## 4. Cloud Infrastructure & DevOps

**Context:**
We chose to define our S3 storage bucket using TypeScript code (`amplify/backend.ts`) rather than manually creating it in the AWS Console.

**Question:**
"We are defining our S3 bucket in a TypeScript file (`backend.ts`) instead of clicking buttons in the AWS Console. What are two major benefits of this 'Infrastructure as Code' (IaC) approach for a team of developers?"

**Candidate Response:**
"It provides greater flexibility and control when creating or defining the architecture... able to finetune it as you desire... quick access to certain tools and decisions over what tool or parts of the you want..."

**Instructor Feedback & Analysis:**
The candidate correctly identified flexibility and control. However, the "Senior" answer focuses on **Reproducibility** and **Version Control**.

*   **Reproducibility:** IaC eliminates "it works on my machine" issues. A new developer can spin up an exact replica of the production environment in minutes by running a script, rather than manually configuring settings for days.
*   **Version Control:** Infrastructure changes are tracked in Git. If a deployment breaks the app, you can see exactly what changed in the commit history and revert it instantly. You cannot `git revert` a manual button click in the AWS Console.

**Refined "Senior" Answer:**
"The biggest benefits are **Reproducibility** and **Version Control**. IaC allows us to spin up identical environments (dev, staging, prod) instantly, eliminating configuration drift. It also lets us track infrastructure changes in Git, enabling code reviews and instant rollbacks if something breaks."

---

## 5. JavaScript Modules & Bundling

**Context:**
In `amplify/backend.ts`, we imported the storage resource using a named import (`import { storage } from ...`) rather than a default import.

**Question:**
"If you had exported it as `export default defineStorage(...)` in the resource file, how would the import statement change, and why do many teams prefer named exports over default exports?"

**Candidate Response:**
"Exporting it as a named import requires that you use the same name you defined it as... makes it self-documenting... provides multiple functions from the same file... easy to refactor... Tree Shaking ability that comes with modern bundlers..."

**Instructor Feedback & Analysis:**
The candidate provided an outstanding answer, covering both developer experience (DX) and performance.

*   **Refactoring & Consistency:** Named exports enforce naming consistency across the project. Default exports allow different files to import the same module with different names (e.g., `import User from './user'` vs `import UserProfile from './user'`), which makes searching and refactoring difficult.
*   **Tree Shaking:** Modern bundlers (Webpack, Rollup) can detect unused named exports and remove them from the final bundle ("dead code elimination"). They often cannot do this safely with default exports because the entire object is treated as a single unit.

**Key Takeaway:**
Prefer named exports for libraries and utilities to enable better tooling support and performance optimizations.
