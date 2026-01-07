# Future Enhancements

**Project:** Dropt - AI-Powered Course Drop Recommendation System
**Last Updated:** 2025-11-17

This document tracks potential features and enhancements for future development phases. Items are prioritized by impact and feasibility.

---

## Table of Contents
1. [Phase 2 Enhancements](#phase-2-enhancements)
2. [Phase 3+ Ideas](#phase-3-ideas)
3. [Enhancement Details](#enhancement-details)

---

## Phase 2 Enhancements

### High Priority

#### FE-001: Configurable Assumptions for Unknown Categories
**Added:** 2025-11-17
**Priority:** High
**Effort:** Medium
**Related Decision:** AD-006

**Current State:**
Best/worst case calculations skip categories with no assignments and show warnings.

**Proposed Enhancement:**
Allow users to configure how unknown categories are handled:

```typescript
interface GradeCategory {
   category: string;
   weight: number;
   dropLowest?: number | null;
   unknownAssumption?: 'optimistic' | 'realistic' | 'conservative' | 'skip'; // NEW
}
```

**User Flow:**
```
User sees warning: "⚠️ Homework (40%) - no assignments entered yet"
User clicks "Configure assumption"
Modal appears with options:
  ○ Skip this category (default)
  ○ Assume 100% (optimistic)
  ○ Assume 90% (realistic A- average)
  ○ Assume 70% (conservative C average)
  ○ Use my current average across other categories
```

**Implementation Notes:**
- Add `unknownAssumption` field to GradeCategory interface
- Update calculateBestCase/calculateWorstCase to respect this setting
- Create UI component for assumption configuration
- Store user preferences (localStorage for MVP, database for production)

**Benefits:**
- Power users get more control
- Addresses "too many N/A categories" early semester problem
- Still defaults to honest "skip" approach
- Educational: forces students to think about assumptions

**Risks:**
- Could give false precision if user picks bad assumptions
- More complex UX
- Requires clear documentation/tooltips

---

#### FE-002: Average Case Calculation
**Added:** 2025-11-17
**Priority:** Medium
**Effort:** Low
**Related Decision:** AD-006

**Current State:**
Only current, best, and worst case calculations exist.

**Proposed Enhancement:**
Add `calculateAverageCase()` function that assumes student's current average for all ungraded assignments.

**Example:**
```typescript
Current categories:
- Homework: 85%
- Quizzes: 90%
- Ungraded: Test (null), Final (null)

Average case for Test/Final: (85 + 90) / 2 = 87.5%
```

**Benefits:**
- More realistic than best/worst extremes
- Good middle-ground estimate
- Familiar to students ("if I keep doing what I'm doing")

**Implementation:**
```typescript
export function calculateAverageCase(data: StudentCourseData): number {
   // 1. Calculate current average across graded categories
   const currentAverage = calculateCurrentGrade(data);

   // 2. For ungraded assignments, assume currentAverage percentage
   // 3. Return weighted result
}
```

**UI Display:**
```
Current: 85%
Average Case: 83% (if you maintain current performance)
Best Case: 92%
Worst Case: 78%
```

---

### Medium Priority

#### FE-003: PostgreSQL Database Integration
**Added:** 2025-11-17
**Priority:** High (for production)
**Effort:** High

**Current State:**
Hardcoded data in TypeScript objects.

**Proposed Enhancement:**
Full database schema with multi-user support.

**Deferred to:** Phase 2 (AD-005)

---

#### FE-004: OCR Integration
**Added:** 2025-11-17
**Priority:** Medium
**Effort:** High

**Current State:**
Manual data entry only.

**Proposed Enhancement:**
Upload syllabus/grade screenshots for automatic parsing.

**Implementation Details:**
See `docs/OCR_IMPLEMENTATION_SPEC.md` and `docs/OCR_COST_ANALYSIS.md`

**Deferred to:** Phase 2

---

## Phase 3+ Ideas

### Low Priority / Experimental

#### FE-005: Grade Trend Analysis
**Added:** 2025-11-17
**Priority:** Low
**Effort:** Medium

Show grade trajectory over time:
- "You started at 78%, now at 85% (+7%)"
- Chart showing grade improvement/decline
- Predict final grade based on trend

---

#### FE-006: Study Time Optimizer
**Added:** 2025-11-17
**Priority:** Low
**Effort:** High

Given limited study time, recommend where to focus:
- "Spending 5 more hours on Test 2 could raise grade from 78% to 85%"
- ROI analysis: time investment vs grade impact

**Requires:**
- User input: hours available to study
- Historical data: effort-to-grade correlation
- ML model (future)

---

#### FE-007: Course Difficulty Crowdsourcing
**Added:** 2025-11-17
**Priority:** Low
**Effort:** High

Allow students to rate course difficulty anonymously:
- "CS 360 with Prof. Smith: 4.2/5 difficulty"
- "85% of students reported high stress levels"
- Use in recommendation algorithm

**Privacy concerns:**
- FERPA compliance required
- Anonymous aggregation only
- Opt-in participation

---

## Enhancement Details

### How to Propose Enhancements

1. Add entry to this file with format:
   ```markdown
   #### FE-XXX: Title
   **Added:** YYYY-MM-DD
   **Priority:** High/Medium/Low
   **Effort:** Low/Medium/High
   **Related Decision:** AD-XXX (if applicable)

   **Current State:** ...
   **Proposed Enhancement:** ...
   **Benefits:** ...
   **Risks:** ...
   ```

2. Number sequentially (FE-001, FE-002, etc.)

3. Update Table of Contents

4. Link to relevant architecture decisions (AD-XXX)

---

### Priority Definitions

- **High:** Critical for production readiness or high user value
- **Medium:** Nice to have, improves UX significantly
- **Low:** Experimental, niche use case, or future vision

### Effort Estimates

- **Low:** 1-3 days
- **Medium:** 1-2 weeks
- **High:** 2-4+ weeks

---

**Document Owner:** Development Team
**Review Cycle:** Monthly during active development
**Next Review:** After Phase 1 MVP completion
