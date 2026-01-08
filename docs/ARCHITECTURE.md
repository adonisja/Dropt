# Architecture Documentation
**Project:** Dropt - AI-Powered Course Drop Recommendation System
**Version:** 1.2.0-MVP
**Last Updated:** 2026-01-07

This document describes the architectural decisions, data structures, and design patterns used in Dropt. All decisions are documented with rationales and dated. Changes are sorted in descending chronological order (latest first).

---

## Recent Architectural Changes (2026-01-07)

### Logging & Observability Architecture

**Decision Date:** 2026-01-07
**Component:** `lib/utils/logger.ts`

**Problem:**
- 200+ raw `console.log/error` statements scattered across codebase
- No structured context for debugging (missing source, userId, timestamps)
- Security risks: sensitive data exposure via `JSON.stringify()` on errors
- No production safety controls (all logs visible in production)

**Solution:**
Implemented a structured logger utility with:

1. **Class-based Singleton Pattern:**
   ```typescript
   class Logger {
     private isDev: boolean = __DEV__;
     
     public debug(message: string, context?: LogContext): void
     public info(message: string, context?: LogContext): void
     public warn(message: string, context?: LogContext): void
     public error(message: string, context?: LogContext): void
     public apiError(endpoint: string, error: any, context?: LogContext): void
     public time(label: string): void
     public timeEnd(label: string): void
   }
   ```

2. **Structured Context:**
   ```typescript
   interface LogContext {
     source?: string;   // Function/component name for traceability
     userId?: string;   // Pseudonymous user identifier
     data?: any;        // Additional structured context
   }
   ```

3. **Production Safety:**
   - Only errors logged when `__DEV__ === false`
   - Debug/info/warn suppressed in production builds
   - Privacy-first approach (no PII logging)

**Benefits:**
- **Debuggability:** Every error includes source function and user context
- **Security:** GDPR/CCPA compliant (pseudonymous identifiers only)
- **Performance:** Reduced logging overhead in production
- **Maintainability:** Consistent logging patterns across codebase

**Migration Stats:**
- 200+ console statements migrated
- 35+ files updated (core services, student pages, auth pages)
- Zero TypeScript compilation errors

---

### Platform-Agnostic Theme System

**Decision Date:** 2026-01-07
**Components:** `lib/theme/theme-styles.ts`, `lib/theme/theme-context.tsx`

**Problem:**
- NativeWind v4 CSS variables (`bg-background`) don't work in React Native
- Platform-specific rendering issues with conditional className values
- Inconsistent theme behavior across web, iOS, and Android

**Solution:**
Created HSL-to-Hex color converter for cross-platform compatibility:

```typescript
// theme-styles.ts
function hslToHex(h: number, s: number, l: number): string {
  // Converts HSL to RGB to Hex for React Native compatibility
}

export const hexColors = {
  background: hslToHex(0, 0, isDark ? 10 : 100),
  foreground: hslToHex(0, 0, isDark ? 98 : 10),
  primary: hslToHex(217, 91, isDark ? 60 : 53),
  // ... 20+ theme colors
};
```

**Auto Theme Implementation:**
- **Trigger:** Time-based (6PM-6AM = dark, 6AM-6PM = light)
- **Rationale:** Predictable UX across all platforms vs system detection
- **Trade-off:** Less respect for OS preference, but consistent experience

**Migration:**
- 23 files migrated from NativeWind classes to `hexColors`
- All components now use platform-agnostic theme values
- Seasonal emoji icons added to dashboard (❄️🌸☀️🍂)

---

### Semester-Based Data Lifecycle

**Decision Date:** 2026-01-07
**Components:** `lib/utils/semester-stats.ts`, `lib/utils/semester-utils.ts`

**Problem:**
- Deadline tracker accumulated tasks across all time
- No way to see current semester progress vs lifetime achievement
- Data needed both time-bound (per semester) AND cumulative (all-time) views

**Solution:**
Dual statistics model with automatic semester transitions:

```typescript
interface UserSettings {
  // Current semester context
  currentSemester: string;   // "Spring 2026"
  currentYear: number;        // 2026
  
  // Per-semester stats (reset each semester)
  tasksCompleted: number;
  tasksMissed: number;
  
  // Lifetime stats (never reset)
  totalTasksCompleted: number;
  totalTasksMissed: number;
  totalTasksEver: number;
}
```

**Transition Logic:**
1. Detect semester change: `detectCurrentSemester()` compares current date to stored semester
2. Archive old data: Save per-semester stats to lifetime totals
3. Reset counters: `tasksCompleted = 0`, `tasksMissed = 0`
4. Update context: `currentSemester = "Fall 2026"`, `currentYear = 2026`

**Benefits:**
- **Motivation:** Users see fresh start each semester
- **Achievement:** Lifetime stats show long-term progress
- **Analytics:** Historical data preserved for insights

**Implementation:**
- Client-side detection on app launch (MVP)
- Future: Server-side cron job for automatic transitions
- Dynamic imports to avoid circular dependencies

---

## Table of Contents
1. [Technology Stack](#technology-stack)
2. [Data Model](#data-model)
3. [Architecture Decisions](#architecture-decisions)
4. [Design Patterns](#design-patterns)
5. [Development Phases](#development-phases)

---

## Technology Stack

### Frontend
- **Framework:** React Native with Expo and Expo Router
- **Language:** TypeScript
- **Styling:** Platform-agnostic theme system (HSL→Hex) + React Native StyleSheet
- **UI Components:** @react-native-community/datetimepicker
- **State Management:** React Context with useReducer
- **Build Tool:** Expo/Metro
- **Theme:** Time-based auto theme (6PM-6AM dark mode)
- **Logging:** Structured logger with production safety (`lib/utils/logger.ts`)

**Decision Date:** 2026-01-07
**Updated From:** NativeWind v4 with CSS variables (2025-11-23)

**Rationale:**
- HSL-to-Hex conversion provides true cross-platform theme support
- Time-based theming offers predictable UX across all platforms
- Structured logger ensures production safety and GDPR compliance
- React Native with Expo enables web, iOS, and Android from single codebase
- Expo Router provides file-based routing similar to Next.js
- TypeScript provides type safety throughout the stack

### Backend & Infrastructure
- **Cloud Provider:** AWS
- **Authentication:** AWS Cognito (via Amplify Gen 2)
- **API:** AWS AppSync (GraphQL)
- **Database:** DynamoDB (via Amplify Data)
- **Functions:** AWS Lambda (for auth triggers)
- **CDN:** CloudFront (planned)

**Decision Date:** 2025-11-18
**Updated From:** Python/FastAPI/PostgreSQL (2025-01-14)

**Rationale:**
- AWS Amplify Gen 2 provides integrated backend-as-a-service
- Cognito handles OAuth, MFA, and multi-tenant auth out of the box
- Serverless architecture reduces operational overhead
- DynamoDB scales automatically for multi-tenant data

### Authentication Architecture
- **Provider:** AWS Cognito User Pools
- **Custom Attributes:** `custom:role`, `custom:tenantId`
- **User Groups:** `students`, `teachers`, `admins`
- **Triggers:** Post-confirmation Lambda for group assignment

**Decision Date:** 2025-11-18
**Rationale:**
- Role-based access control (RBAC) for student/teacher/admin permissions
- Multi-tenant support via tenantId for school/organization isolation
- Post-confirmation Lambda automatically assigns users to Cognito groups
- Custom attributes store role preferences set during registration

---

## Data Model

### Design Philosophy

**Approach:** Normalized relational model with proper separation of concerns
**Decision Date:** 2025-01-14

**Rationale:**
- Demonstrates understanding of database design principles for interviews
- Scalable architecture ready for Phase 2 database integration
- Clear separation between course metadata and student-specific data

---

### Core Interfaces

#### 1. Course Metadata
```typescript
export interface Course {
   courseID: string;
   courseName: string;
   department: string;
}
```

**Decision Date:** 2025-01-14
**Rationale:**
- Represents universal truths about a course
- `courseID` enables foreign key relationships
- Minimal fields for MVP; expandable in Phase 2

**Rejected Alternative:** Including `isRequired` in Course interface
**Reason:** "Required" status depends on student's major, not the course itself

---

#### 2. Grade Category
```typescript
export interface GradeCategory {
   category: string;           // "Homework", "Quizzes", "Midterm", "Final"
   weight: number;            // Percentage weight (e.g., 30 = 30%)
   dropLowest?: number | null; // Number of assignments to drop (0, 1, 2, etc.)
   description?: string;      // Optional description
}
```

**Decision Date:** 2025-01-14
**Change Log:**
- **2025-01-14:** Changed `dropLowest` from `boolean` to `number`
  - **Before:** `dropLowest?: boolean`
  - **After:** `dropLowest?: number | null`
  - **Rationale:** Boolean can't specify HOW MANY to drop; number allows flexible drop policies (drop 1, drop 2, etc.)

**Drop Policy Semantics:**
- `dropLowest: 2` → Drop 2 lowest scores
- `dropLowest: undefined` or `dropLowest: null` → Don't drop any
- `dropLowest: 0` → Explicitly don't drop (equivalent to undefined)

---

#### 3. Assignment
```typescript
export interface Assignment {
   assignmentID: string;
   assignmentName: string;
   category: string;           // Links to GradeCategory.category
   scoreEarned: number | null; // null = not graded yet
   maxScore: number | null;
   dateAssigned?: Date;
   dateDue: Date;
   dateSubmitted?: Date;
   description?: string;
}
```

**Decision Date:** 2025-01-14
**Key Design Decisions:**

**1. Dynamic Assignment Model**
- **Decision:** Only store assignments that have been assigned (not pre-populated)
- **Rationale:**
  - Professors don't always announce all assignments upfront
  - Avoids clutter from future, unassigned work
  - Simpler data entry workflow

**2. Null Handling**
- **Decision:** `scoreEarned: null` means "not graded yet"
- **Rationale:**
  - `null` ≠ `0` (zero points earned)
  - Enables separate best/worst case calculations
  - Prevents penalizing students for incomplete work

**Critical Semantics:**
```typescript
scoreEarned: null  // Assignment assigned but not graded yet → IGNORE in current grade
scoreEarned: 0     // Assignment graded, earned zero points → COUNT as 0%
```

---

#### 4. Student Course Data
```typescript
export interface StudentCourseData {
   courseID: string;
   studentID: string;
   isRequired: boolean;        // For THIS student's degree
   rubric: GradeRubric;
   grades: StudentGrades;
   contextData: CourseContext;
   expectedGraduation?: Date;
}
```

**Decision Date:** 2025-01-14
**Key Decision:** `isRequired` placed in student context, NOT course metadata

**Rationale:**
- CS 360 is required for CS majors but elective for Math majors
- Course requirement status is a property of the student-course relationship
- Enables accurate "Course Importance" scoring (25% of recommendation algorithm)

---

### Data Model Evolution

#### Phase 1 (MVP): In-Memory Objects
```typescript
const akkeemCS360: StudentCourseData = { /* hardcoded data */ };
```

**Decision Date:** 2025-01-14
**Rationale:**
- No database overhead for 2-3 week MVP
- Demonstrates data structure design without infrastructure complexity
- Easy to transition to database later

#### Phase 2 (Current): DynamoDB with Amplify Gen 2

**Decision Date:** 2025-11-19
**Status:** Implemented

The DynamoDB schema is defined in `amplify/data/resource.ts` using Amplify Gen 2's schema builder:

```typescript
// StudentCourse - Core course enrollment data with assessment fields
StudentCourse: a.model({
  studentId: a.string().required(),
  courseId: a.string().required(),
  courseName: a.string().required(),
  department: a.string(),
  isRequired: a.boolean().default(false),
  expectedGraduation: a.date(),

  // Psychological Context (for AI recommendation engine)
  stressLevel: a.integer(),              // 1-10 scale: stress related to this course
  weeklyTimeInvestment: a.integer(),     // Hours per week spent on this course
  impactOnOtherCourses: a.integer(),     // 1-10 scale: impact on other courses
  overallWellbeing: a.integer(),         // 1-10 scale: overall feeling about course

  // Academic Context
  semesterCreditHours: a.integer(),      // Total credits this semester
  otherCoursesCount: a.integer(),        // Number of other courses
  currentGPA: a.float(),                 // Current GPA (optional)
}).identifier(['studentId', 'courseId'])

// GradeCategory - Rubric categories with weights
GradeCategory: a.model({
  studentCourseId: a.string().required(),
  category: a.string().required(),
  weight: a.float().required(),
  dropLowest: a.integer(),
  description: a.string(),
}).identifier(['studentCourseId', 'category'])

// Assignment - Individual assignment scores
Assignment: a.model({
  studentCourseId: a.string().required(),
  assignmentId: a.string().required(),
  assignmentName: a.string().required(),
  category: a.string().required(),
  scoreEarned: a.float(),
  maxScore: a.float().required(),
  dateDue: a.date().required(),
  dateAssigned: a.date(),
  dateSubmitted: a.date(),
  description: a.string(),
}).identifier(['studentCourseId', 'assignmentId'])
```

**Key Design Decisions:**

1. **Composite Identifiers** - Using composite keys for efficient DynamoDB queries
   - `StudentCourse`: `[studentId, courseId]`
   - `GradeCategory`: `[studentCourseId, category]`
   - `Assignment`: `[studentCourseId, assignmentId]`

2. **Authorization Rules** - Group-based access control
   ```typescript
   .authorization((allow) => [
     allow.owner(),
     allow.group('teachers').to(['create', 'read', 'update']),
     allow.group('admins').to(['create', 'read', 'update', 'delete']),
   ])
   ```

3. **Assignment ID Patterns** - Category-based prefixes for readability
   - Homework: `HW001`, `HW002`
   - Quiz: `QZ001`, `QZ002`
   - Midterm: `MID001`
   - Final: `FIN001`
   - Generated via `lib/id-generators.ts`

**Rationale:**
- DynamoDB scales automatically for multi-tenant data
- Composite keys enable efficient range queries
- Owner-based auth ensures students only see their own data
- Group-based auth allows teachers and admins appropriate access

---

## Architecture Decisions

### Decision Log

---

#### AD-001: Interface vs Class for Data Structures
**Date:** 2025-01-14
**Decision:** Use TypeScript `interface` for all data models, NOT `class`

**Context:**
Student initially proposed using classes for data encapsulation.

**Options Considered:**
1. **Classes** - Encapsulation with methods
2. **Interfaces** - Pure data shapes
3. **Types** - Similar to interfaces

**Decision:** Interfaces for data, classes for behavior

**Rationale:**
- Data models have no behavior (no methods needed)
- Interfaces are lightweight (no runtime code)
- Easy to serialize/deserialize for API calls (JSON.stringify)
- TypeScript philosophy: structural typing over nominal typing
- Classes reserved for services with logic (e.g., `GradeCalculator` class)

**Example:**
```typescript
// Data model - interface
interface Assignment {
   assignmentName: string;
   scoreEarned: number;
}

// Service with behavior - class
class GradeCalculator {
   calculateCurrentGrade(data: StudentCourseData): number {
      // ... logic
   }
}
```

---

#### AD-002: Drop Lowest Policy Implementation
**Date:** 2025-01-14
**Decision:** Keep minimum of 2 graded assignments when applying drop policy

**Context:**
Need to define behavior when `dropLowest=2` but only 3 assignments are graded.

**Options Considered:**
1. **Drop as many as policy allows** - drop 2, keep 1
2. **Keep minimum of 1** - drop 2, keep 1
3. **Keep minimum of 2** - drop 1, keep 2 ✅

**Decision:** Option 3 - Keep minimum of 2

**Implementation:**
```typescript
const numToDrop = Math.min(
    category.dropLowest,
    Math.max(0, gradedAssignments.length - 2)  // Ensure at least 2 remain
);
```

**Rationale:**
- Statistical validity requires multiple data points
- Single grade is unrepresentative of performance
- Aligns with educational best practices
- Prevents edge cases where one bad quiz determines entire category

**Test Cases:**
| Graded | dropLowest | Num Dropped | Num Kept |
|--------|------------|-------------|----------|
| 1      | 2          | 0           | 1        |
| 2      | 2          | 0           | 2        |
| 3      | 2          | 1           | 2        |
| 5      | 2          | 2           | 3        |

---

#### AD-003: Grade Normalization Strategy
**Date:** 2025-01-14
**Decision:** Scale current grade to 100% based on graded categories only

**Context:**
If only 70% of course is graded (Final not taken), how do we report current grade?

**Options Considered:**
1. **Raw score** - Report "59 out of 70%" as-is
2. **Scaled to 100** - Report "(59/70) * 100 = 84.3%" ✅

**Decision:** Option 2 - Scale to 100%

**Implementation:**
```typescript
return (totalWeightedScore / totalWeightUsed) * 100;
```

**Rationale:**
- Students understand grades on 0-100 scale
- Easier to interpret: "84%" vs "59 out of 70%"
- Matches how most LMS systems (Canvas, Blackboard) display grades
- Separate best/worst case calculations account for ungraded work

**Example:**
- HW (30%): 88%
- Quiz (20%): 85%
- Midterm (20%): 75%
- Final (30%): Not graded

**Calculation:**
```
Weighted sum: (88*30 + 85*20 + 75*20) = 5050
Weight used: 70%
Current grade: (5050 / 70) * 100 = 84.17% ✅
```

---

#### AD-004: Frontend-Backend Language Split
**Date:** 2025-01-14
**Decision:** TypeScript (frontend) + Python (backend), NOT full-stack TypeScript

**Context:**
Could use Node.js/TypeScript for both frontend and backend.

**Options Considered:**
1. **Full-stack TypeScript** (Next.js + Node.js)
2. **TypeScript + Python** (React + FastAPI) ✅

**Decision:** Option 2 - Separate languages

**Rationale:**
- **Learning goal:** Demonstrate polyglot programming skills
- **Python strengths:** Better AI/ML ecosystem for future OCR integration
- **FastAPI advantages:** Automatic API documentation, Pydantic validation
- **Interview value:** Shows ability to work across language boundaries
- **Reality:** Most companies have polyglot stacks

**Trade-offs:**
- ❌ More context switching between languages
- ✅ Learn two ecosystems instead of one
- ✅ Flexibility to choose best tool for each layer

---

#### AD-005: MVP Scope - No Database
**Date:** 2025-01-14
**Decision:** Defer PostgreSQL integration to Phase 2

**Context:**
2-3 week timeline for MVP demo.

**Decision:** Use hardcoded TypeScript objects in Phase 1

**Rationale:**
- **Time constraint:** Database setup, migrations, ORM learning takes 1+ weeks
- **Core focus:** Algorithm and recommendation logic more important for demo
- **Architecture ready:** Normalized data model ready for database when needed
- **Interview story:** "I designed for scale but prioritized working software"

**Phase 1 (MVP):**
```typescript
const demoData: StudentCourseData = { /* hardcoded */ };
```

**Phase 2 (Production):**
```sql
CREATE TABLE students (...);
CREATE TABLE courses (...);
-- ... full schema
```

---

#### AD-006: Best/Worst Case Calculation for Unknown Categories
**Date:** 2025-11-17
**Decision:** Skip categories with no assignments; display warnings to user (Option D)

**Context:**
When calculating best/worst case scenarios, some grade categories may have zero assignments entered (e.g., early in semester, or ongoing categories like Homework where future assignments are unknown).

**Problem:**
How do we calculate best/worst case for categories with no data?

**Options Considered:**
1. **Average Case** - Use student's current average across other categories
2. **Skip Unknown** - Don't include in calculation; show warning ✅
3. **Configurable Assumption** - Let user choose (100%, 90%, 70%, current avg)
4. **Assume 100%/0%** - Use full category weight with best/worst assumption

**Decision:** Option 2 (Skip Unknown) with clear UI messaging

**Implementation:**
```typescript
// For each category:
if (category has NO assignments at all) {
   Skip from calculation
   Track for UI warning: "⚠️ Homework (40%) - no assignments entered yet"
}

if (category has assignments) {
   For each assignment:
      if (scoreEarned !== null): use actual score
      if (scoreEarned === null):
         Best case: assume maxScore
         Worst case: assume 0
}
```

**Example Output:**
```
Current Grade: 85% (based on 60% of total grade)
Best Case: 92% (if you ace all remaining known assignments)
Worst Case: 78% (if you fail all remaining known assignments)

⚠️ 40% of your grade has no assignments entered yet:
   • Homework (40%)

As you add more assignments, predictions will become more accurate.
```

**Rationale:**
- **Accuracy:** Only makes predictions based on real data
- **Transparency:** Clear messaging about what's unknown
- **User behavior:** Encourages entering syllabus assignments upfront
- **MVP-friendly:** Simpler logic; no complex averaging
- **Honest UX:** Doesn't give false precision

**Future Enhancement (Phase 2):**
Add Option 3 (Configurable Assumption) to allow users to manually set assumptions for unknown categories:
```typescript
interface GradeCategory {
   category: string;
   weight: number;
   dropLowest?: number | null;
   unknownAssumption?: 'optimistic' | 'realistic' | 'conservative' | 'skip'; // NEW
}
```

This would let power users customize how unknowns are treated while keeping simple default (skip).

**Trade-offs:**
- ✅ Honest and accurate
- ✅ Simple to implement
- ✅ Encourages good data entry habits
- ❌ Early semester may show "N/A" for many categories
- ❌ Requires good UI design to communicate limitations

---

#### AD-007: Navigation Architecture
**Date:** 2025-11-20
**Decision:** Bottom tab navigation with modal screens for forms

**Context:**
Need to design navigation structure that allows easy transitions between main sections while keeping form flows focused.

**Options Considered:**
1. **Header-only navigation** - Navigation buttons in header bar
2. **Bottom tabs** - Persistent bottom navigation bar ✅
3. **Drawer navigation** - Slide-out menu
4. **Stack only** - Rely on back button

**Decision:** Bottom tab navigation with smart hiding on modal screens

**Implementation:**
```typescript
// Main tabs (always visible except on modals)
- Home (🏠) → Student Dashboard (overview landing page)
- Courses (📚) → Courses list with grades
- Analytics (📊) → Performance insights
- Settings (⚙️) → Account settings

// Modal screens (hide bottom nav)
- Add Course
- Edit Course
- Add Assignment
- Edit Assignment
- What-If Calculator
```

**Bottom Nav Component:**
```typescript
// components/BottomNav.tsx
export default function BottomNav() {
    const pathname = usePathname();

    // Hide on modal screens
    if (pathname.includes('/add-') || pathname.includes('/edit-')) {
        return null;
    }

    // Render tab bar with active state highlighting
}
```

**Rationale:**
- **Mobile-first:** Bottom tabs are thumb-friendly on mobile devices
- **Persistent access:** Users can switch sections without losing context
- **Platform standard:** Matches iOS and Android navigation patterns
- **Clean form UX:** Modals hide tabs to focus user attention on task
- **Easy discoverability:** All main sections visible at once

**Key Features:**
- Active tab highlighted in blue (#007AFF)
- Smart hiding on modal/form screens
- Consistent across all main screens including course details
- Platform-aware padding for iOS safe area

---

#### AD-008: Dashboard Structure
**Date:** 2025-11-20
**Decision:** Separate overview dashboard from detailed course list

**Context:**
Initial implementation had dashboard showing detailed grades, but users needed a clear landing page with quick actions.

**Problem:**
How should the main dashboard be structured - as a detailed view or an overview?

**Options Considered:**
1. **Detailed grades on dashboard** - Show all courses with calculations
2. **Overview landing page** - Quick stats and navigation cards ✅
3. **Customizable dashboard** - Let users choose layout
4. **Activity feed** - Show recent changes and deadlines

**Decision:** Option 2 - Overview landing page with quick actions

**Implementation:**
```typescript
// Student Dashboard Structure
1. Hero Section
   - Personalized greeting
   - Tagline about AI assistance

2. Quick Stats
   - Active course count card

3. Quick Actions (3 cards)
   - View My Courses → links to detailed course list
   - Add New Course → opens add-course modal
   - View Analytics → links to analytics

4. Features Overview (4 cards)
   - Grade Tracking explanation
   - AI-Powered Recommendations explanation
   - What-If Analysis explanation
   - Time Management explanation

5. CTA for New Users (conditional)
   - Shown when course count = 0
   - Encourages adding first course
```

**Detailed Grades Location:**
Moved to separate "Courses" tab (📚) accessible via bottom navigation

**Rationale:**
- **Clear separation:** Overview vs detailed data
- **Faster navigation:** Quick actions for common tasks
- **Better UX:** Landing page explains value proposition
- **Onboarding:** Feature cards educate new users
- **Scalability:** Can add more widgets without cluttering

**User Flow:**
```
Login → Dashboard (overview) → Quick action "View Courses" → Courses (detailed grades)
                              ↓
                         Bottom nav: Courses tab → Same destination
```

---

#### AD-009: Grade Visualization Strategy
**Date:** 2025-11-20
**Decision:** Multi-level visualization with progressive detail disclosure

**Context:**
Students need to understand their grades at multiple levels: overall course, by category, and by assignment.

**Implementation Levels:**

**Level 1: Course Overview (Courses Screen)**
```typescript
For each course:
- Current grade percentage + letter grade
- Best case scenario
- Worst case scenario
- Color-coded by performance (green A, red F)
```

**Level 2: Category Breakdown (Course Details)**
```typescript
For each category:
- Visual progress bar (color-coded)
- Category weight (e.g., "40% of grade")
- Earned percentage
- Points earned / total points
- Graded count / total count
- Drop lowest indicator
```

**Level 3: Assignment Details (Course Details)**
```typescript
Grouped by category:
- Assignment name
- Score earned / max score
- "Not graded" indicator
- Tap to edit
```

**Level 4: What-If Simulation (What-If Calculator)**
```typescript
Interactive scenario testing:
- Current grade vs simulated grade comparison
- Assignment-level score editing
- Real-time grade recalculation
- Visual difference indicator (green/red)
- Quick action buttons (reset, assume 100%, assume 0%)
```

**Design Patterns Used:**
- **Progressive disclosure:** Show summary first, details on demand
- **Color coding:** Consistent grade-to-color mapping across all screens
- **Visual hierarchy:** Large grades, smaller supporting info
- **Contextual actions:** Edit buttons near relevant data

**Rationale:**
- **Cognitive load:** Don't overwhelm with all data at once
- **Scan-ability:** Color and size make important info jump out
- **Drill-down:** Users can explore deeper as needed
- **Consistency:** Same patterns and colors throughout app

---

## Design Patterns

### 1. Separation of Concerns
**Pattern:** Separate course metadata from student enrollment data

**Example:**
```typescript
// Course (universal facts)
interface Course {
   courseID: string;
   courseName: string;
}

// Student enrollment (personal context)
interface StudentCourseData {
   courseID: string;  // Reference to Course
   isRequired: boolean;  // Personal to student
}
```

**Benefit:** Course reused across students; student-specific data encapsulated

---

### 2. Null Object Pattern
**Pattern:** Use `null` for "not graded yet" instead of magic numbers

**Anti-pattern:**
```typescript
scoreEarned: -1  // Magic number meaning "not graded"
```

**Correct:**
```typescript
scoreEarned: null  // Explicit: not graded yet
```

**Benefit:** Type system enforces null checking; no ambiguity

---

## Development Phases

### Phase 0: Foundation (Completed)
**Dates:** 2025-01-14 - 2025-01-17
**Status:** Complete

**Deliverables:**
- ✅ Data model design (TypeScript interfaces)
- ✅ Grade calculation algorithms (current, best, worst case)
- ✅ Comprehensive unit tests with vitest

---

### Phase 1: Frontend & Auth (Completed)
**Dates:** 2025-11-17 - 2025-11-23
**Status:** Complete

**Deliverables:**
- ✅ Expo with Expo Router setup
- ✅ AWS Amplify Gen 2 integration
- ✅ Cognito authentication with custom attributes
- ✅ Role-based user groups (students, teachers, admins)
- ✅ Post-confirmation Lambda for group assignment
- ✅ Login, Register, Email Confirmation screens with password visibility toggle
- ✅ Auth-aware home page with role-based redirect
- ✅ DynamoDB schema with composite keys
- ✅ Data client with lazy initialization (`lib/api/data-client.ts`)
- ✅ Assignment ID generators (`lib/utils/id-generators.ts`)
- ✅ Student dashboard restructured as overview/landing page
- ✅ Bottom tab navigation (Home, Courses, Analytics, Settings)
- ✅ Grade entry forms (add/edit course, add/edit assignment, delete functionality)
- ✅ Course details screen with grade breakdown visualization
- ✅ What-if calculator for grade scenario simulation
- ✅ Courses screen with current, best case, and worst case grade display
- ✅ Course assessment screen with psychological and academic context collection
- ✅ Analytics placeholder screen
- ✅ Settings screen with logout functionality
- ✅ Comprehensive error handling and validation across all forms
- ✅ NativeWind v4 integration with System Theme Detection
- ✅ Project structure reorganization for scalability

---

### Phase 2: Core Features (In Progress)
**Goal:** Advanced grade calculations and recommendation engine

**Features:**
- Recommendation Engine Logic (Score calculation & Action Plan)
- Recommendation UI (Risk assessment display)
- Average Case Calculation
- Configurable Assumptions for unknown grades
- Analytics Dashboard implementation

**Out of Scope:**
- OCR (Moved to Phase 3)
- LMS integration

---

### Phase 3: Enhanced (4-6 Weeks)
**Goal:** Production-ready features & Automation

**Features:**
- OCR integration (GPT-4 Vision)
- BrightSpace LTI integration
- Multi-tenant school onboarding
- Advanced visualizations

---

### Phase 4: AI Enhancement (Future)
**Goal:** ML-powered recommendations

**Features:**
- Train custom model on historical data
- A/B test ML vs rule-based
- Personalization engine

---

## Appendix

### Naming Conventions
- **Interfaces:** PascalCase (`StudentCourseData`)
- **Properties:** camelCase (`scoreEarned`)
- **Files:** camelCase (`.ts`), PascalCase (`.tsx`)
- **Functions:** camelCase (`calculateCurrentGrade`)

### File Organization
```
Dropt/
├── app/                            # Expo Router app directory
│   ├── _layout.tsx                # Root layout with AuthProvider
│   ├── index.tsx                  # Home screen (auth-aware, redirects by role)
│   ├── (auth)/                    # Auth route group
│   │   ├── _layout.tsx           # Auth stack layout
│   │   ├── login.tsx             # Sign in screen
│   │   ├── register.tsx          # Registration screen
│   │   └── confirm.tsx           # Email confirmation screen
│   └── (student)/                 # Student route group (protected)
│       ├── _layout.tsx           # Student stack with logout buttons
│       ├── student_dashboard.tsx # Overview landing page with quick actions
│       ├── settings.tsx          # Settings with account info
│       ├── courses/              # Course management
│       │   ├── index.tsx         # Course list with grade calculations
│       │   ├── [id].tsx          # Individual course details
│       │   ├── add.tsx           # Add new course form (modal)
│       │   ├── edit.tsx          # Edit course details (modal)
│       │   └── assessment.tsx    # Psychological/academic assessment (modal)
│       ├── assignments/          # Assignment management
│       │   ├── add.tsx           # Add assignment form (modal)
│       │   └── edit.tsx          # Edit/delete assignment form (modal)
│       └── tools/                # Student tools
│           ├── calculator.tsx    # What-If grade scenario simulator
│           └── analytics.tsx     # Analytics dashboard
├── amplify/                        # AWS Amplify Gen 2 backend
│   ├── backend.ts                 # Backend definition
│   ├── auth/                      # Cognito configuration
│   │   ├── resource.ts           # Auth with groups & triggers
│   │   └── post-confirmation/    # Lambda trigger
│   │       ├── resource.ts       # Function definition
│   │       └── handler.ts        # Group assignment logic
│   └── data/                      # AppSync/DynamoDB schema
│       └── resource.ts           # DynamoDB models with authorization
├── components/                     # Reusable UI components
│   ├── BottomNav.tsx             # Bottom tab navigation bar
│   ├── FormError.tsx             # Inline error display component
│   ├── HeaderProfileBtn.tsx      # Profile button for headers
│   ├── PlatformButton.tsx        # Platform-aware button component
│   └── SuccessScreen.tsx         # Reusable success state screen
├── lib/                            # Shared library code
│   ├── types.ts                  # Shared TypeScript interfaces
│   ├── api/                      # API interaction layer
│   │   ├── amplify-config.ts     # Amplify configuration loader
│   │   └── data-client.ts        # DynamoDB client with CRUD operations
│   ├── auth/                     # Authentication logic
│   │   ├── auth-context.tsx      # React Context for auth state
│   │   └── auth-types.ts         # Auth interfaces and types
│   ├── logic/                    # Business logic & calculations
│   │   ├── calculateBestCase.ts
│   │   ├── calculateCurrentGrade.ts
│   │   └── calculateWorstCase.ts
│   ├── theme/                    # Theme system
│   │   └── theme-context.tsx     # Theme context provider
│   └── utils/                    # General utilities
│       └── id-generators.ts      # Assignment ID generation
├── docs/                           # All documentation files
│   ├── ARCHITECTURE.md            # Architecture decisions and data model
│   ├── BUGS_AND_FIXES.md         # Bug tracking and fixes
│   ├── PROJECT_BLUEPRINT.md      # Original project specification
│   ├── PRESENTATION_OUTLINE.md   # Demo presentation structure
│   ├── OCR_IMPLEMENTATION_SPEC.md # OCR technical specification
│   ├── OCR_COST_ANALYSIS.md      # OCR cost breakdown
│   ├── FUTURE_ENHANCEMENTS.md    # Planned features
│   ├── NATIVEWIND_SETUP.md       # NativeWind configuration guide
│   └── THEME_SYSTEM.md           # Theme system documentation
├── tests/                          # Unit tests
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript configuration
├── app.json                        # Expo configuration
├── babel.config.js                # Babel configuration
├── metro.config.js                # Metro bundler configuration
├── tailwind.config.js             # Tailwind CSS configuration
└── amplify_outputs.json           # Generated Amplify outputs (gitignored)
```

**Note:** All documentation should be placed in the `docs/` directory going forward.

### Screen Navigation Map
```
Login/Register → Home (Dashboard Overview)
                   ├─ Bottom Nav: Home (active)
                   ├─ Bottom Nav: Courses → Courses List
                   │                         └─ Tap course → Course Details
                   │                                          ├─ Grade Breakdown (visual)
                   │                                          ├─ Category list
                   │                                          ├─ Assignment list
                   │                                          │   └─ Tap assignment → Edit Assignment
                   │                                          ├─ What-If Calculator button → What-If Calculator
                   │                                          └─ Course Assessment button → Course Assessment
                   ├─ Bottom Nav: Analytics → Analytics (placeholder)
                   └─ Bottom Nav: Settings → Settings
                      └─ Logout → Login
```

---

#### AD-010: Course Assessment Form Design
**Date:** 2025-11-20
**Decision:** Use interactive sliders for psychological assessment with color-coded feedback

**Context:**
Need to collect psychological well-being and academic context data for the AI recommendation engine (Phase 2, Sprint 1 from PROJECT_BLUEPRINT.md).

**Problem:**
How should we collect subjective psychological data (stress level, impact on other courses, overall wellbeing)?

**Options Considered:**
1. **Radio buttons** - Traditional form inputs (1-10)
2. **Dropdown selects** - Compact but hidden options
3. **Interactive sliders** - Visual, intuitive, immediate feedback ✅
4. **Text inputs** - Flexible but error-prone

**Decision:** Option 3 - Interactive sliders with color-coded visual feedback

**Implementation:**

**Form Structure:**
```typescript
// Slider inputs (1-10 scale with middle default of 5)
- Stress Level: "How stressed are you about this course?"
- Impact on Others: "How much does this course affect your other courses?"
- Overall Wellbeing: "How do you feel about this course overall?"

// Numeric text inputs (all start empty for data accuracy)
- Weekly Hours: "How many hours per week do you spend on this course?"
- Total Credits: "What are your total credit hours this semester?"
- Other Courses: "How many other courses are you taking?"
- Current GPA: "What is your current GPA?" (optional)
```

**Custom Slider Component Features:**
```typescript
// Visual feedback based on stress level
function getSliderColor(value: number) {
    if (value <= 3) return '#4CAF50';  // Low stress = Green
    if (value <= 7) return '#FFA726';  // Medium stress = Orange
    return '#EF5350';                  // High stress = Red
}

// Interactive touch anywhere on track
- Tap any point on slider → sets value immediately
- Tap number labels (1-10) → sets exact value
- Visual fill shows progress from left edge
- Active number highlighted in blue
```

**Validation Rules:**
```typescript
// Required fields with realistic bounds
weeklyHours: 0 < hours ≤ 80
totalCredits: 0 < credits ≤ 30 (typical: 12-18)
otherCoursesCount: ≥ 0
currentGPA: 0.0 ≤ gpa ≤ 4.0 (optional, can be empty)

// Error messaging with helpful guidance
"Weekly Hours seems too high. Please enter a realistic number." (if > 80)
"Total credit hours seems too high (typical is 12-18)" (if > 30)
```

**Data Type Architecture:**
```typescript
// Pattern: String state → parse on save
const [weeklyHours, setWeeklyHours] = useState('');  // String for TextInput
const [stressLevel, setStressLevel] = useState(5);   // Number for slider

// On save:
weeklyTimeInvestment: parseInt(weeklyHours)
currentGPA: currentGPA ? parseFloat(currentGPA) : null
```

**Rationale:**
- **Sliders for subjective data:** More intuitive than typing numbers for feelings/stress
- **Color coding:** Immediate visual feedback helps users understand their input
- **Middle defaults (5):** Neutral starting point prevents bias
- **Empty numeric inputs:** Forces conscious input rather than accepting defaults
- **String-then-parse:** Prevents React Native TextInput issues with decimal entry (e.g., typing "1.5" requires intermediate "1.")
- **Realistic bounds:** Prevents data quality issues from typos or unrealistic values
- **Optional GPA:** Some students may not know/want to share, but required for future GPA impact calculations

**Database Integration:**
```typescript
// New function in lib/data-client.ts
export async function updateStudentCourseAssessment(
    studentId: string,
    courseId: string,
    assessmentData: {
        stressLevel?: number;
        weeklyTimeInvestment?: number;
        impactOnOtherCourses?: number;
        overallWellbeing?: number;
        semesterCreditHours?: number;
        otherCoursesCount?: number;
        currentGPA?: number | null;
    }
): Promise<Schema['StudentCourse']['type'] | null>
```

**UI/UX Decisions:**
- **Modal presentation:** Full focus on assessment (hide bottom nav)
- **Green button:** Stands out from blue action buttons
- **Icon:** 📊 suggests data/analytics connection
- **Navigation:** Accessible from course details page
- **Button placement:** Below What-If Calculator for logical flow

**Future Enhancement (Phase 2, Sprint 2):**
Assessment data will feed into the AI recommendation algorithm:
```typescript
RecommendationScore =
  (Academic_Score * 0.40) +
  (Course_Importance * 0.25) +
  (Psychological_Health * 0.20) +  // ← Uses assessment data
  (Academic_Context * 0.15)         // ← Uses assessment data
```

**Trade-offs:**
- ✅ Intuitive touch-based UX
- ✅ Visual feedback reduces cognitive load
- ✅ Data validation ensures quality
- ✅ Extensible for future ML training
- ❌ Requires more screen space than compact dropdowns
- ❌ String-to-number parsing adds complexity

---

**Document Owner:** Development Team
**Review Cycle:** Updated with each architectural decision
**Next Review:** After Phase 1 MVP completion
