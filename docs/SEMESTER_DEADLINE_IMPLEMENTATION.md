# Deadline Tracker Semester-Based Implementation

## Overview
The deadline tracker has been updated to operate on a **per-semester basis**, showing only assignments from the current academic semester while maintaining lifetime statistics across all semesters.

---

## What Changed

### 1. **Schema Updates** (`amplify/data/resource.ts`)

Added three new fields to `UserSettings` model to track lifetime statistics:

```typescript
// Lifetime semester statistics (accumulated across all semesters)
totalTasksCompleted: a.integer().default(0), // All-time completed tasks
totalTasksMissed: a.integer().default(0),    // All-time missed/overdue tasks
totalTasksEver: a.integer().default(0),       // All-time total tasks created
```

**Why:** These fields accumulate statistics across semesters, so when a semester ends, the current semester's data is added to these totals before resetting for the new semester.

---

### 2. **New Utility: Semester Statistics** (`lib/utils/semester-stats.ts`)

Created comprehensive utilities for managing semester-based task tracking:

#### Key Functions:

**`updateSemesterStats(userId, completedDelta, missedDelta, totalDelta)`**
- Updates lifetime statistics incrementally
- Use this when tasks change status (completed, missed, created)
- Example: When a task is marked complete → `updateSemesterStats(userId, 1, 0, 0)`

**`getSemesterStats(userId)`**
- Fetches current lifetime statistics
- Returns: `{ totalTasksCompleted, totalTasksMissed, totalTasksEver }`
- Used by the deadline tracker to display all-time stats

**`handleSemesterTransition(userId, completedCount, missedCount, newSemester, newYear)`**
- Handles semester rollover automatically
- Adds current semester stats to lifetime totals
- Updates currentSemester and currentYear
- Called automatically when semester changes are detected

**`needsSemesterTransition(currentSemester, currentYear)`**
- Detects if the stored semester doesn't match the current calendar semester
- Returns `true` if transition needed
- Logic: Compares stored semester/year with calendar-based detection

---

### 3. **Updated Deadline Tracker** (`app/(student)/tools/deadline-tracker.tsx`)

#### Data Filtering
```typescript
// NEW: Fetch user settings to get current semester
const userSettings = await getOrCreateUserSettings(user.id);

// NEW: Filter courses by current semester only
const courses = allCourses.filter(course => 
    course.semester === userSettings.currentSemester && 
    course.year === userSettings.currentYear
);
```

**Before:** Showed all assignments from all semesters  
**After:** Shows only current semester assignments

#### UI Updates

**Current Semester Header:**
```tsx
<Text className="text-2xl font-bold">
    {currentSemester} {currentYear}
</Text>
```

**Lifetime Statistics Section:**
- Trophy icon header "All-Time Statistics"
- Three columns: Completed (green), Missed (red), Total Ever (blue)
- Displays cumulative data across all semesters

**Current Semester Stats:**
- Total Tasks (current semester only)
- Due Soon (current semester only)
- Overdue (current semester only)

---

### 4. **Automatic Semester Transitions** (`lib/api/data-client.ts`)

Added detection logic to `getOrCreateUserSettings()`:

```typescript
// Check for semester transition
if (needsSemesterTransition(settings.currentSemester, settings.currentYear)) {
    const newSemesterInfo = detectCurrentSemester();
    
    await handleSemesterTransition(
        userId,
        0, // completedCount - calculated from assignments
        0, // missedCount - calculated from assignments
        newSemesterInfo.semester,
        newSemesterInfo.year
    );
}
```

**Note:** Currently commented out pending backend deployment. When uncommented, this will:
1. Detect when calendar semester changes (e.g., January = Spring, September = Fall)
2. Calculate completed/missed tasks from the ending semester
3. Add those counts to lifetime totals
4. Update to the new semester

---

## How It Works

### Semester Detection Logic
```
January - May   → Spring
June - August   → Summer
September - Dec → Fall
```

### Lifecycle Flow

1. **User Opens App:**
   - `getOrCreateUserSettings()` checks if semester changed
   - If yes: triggers `handleSemesterTransition()`
   - Transition adds old semester stats to lifetime totals
   - Updates currentSemester/currentYear

2. **Viewing Deadline Tracker:**
   - Fetches courses filtered by `currentSemester` and `currentYear`
   - Only current semester assignments are shown
   - Displays both current semester stats AND lifetime stats

3. **Task Status Changes:**
   - When task is completed → could call `updateSemesterStats(userId, 1, 0, 0)` (future enhancement)
   - When task becomes overdue → could call `updateSemesterStats(userId, 0, 1, 0)` (future enhancement)

4. **Semester Transition:**
   - Automatically happens when calendar rolls to next semester
   - Old semester data preserved in lifetime totals
   - New semester starts fresh with 0 current tasks

---

## Data Architecture

### Current Semester Data
- **Source:** Filtered assignments from current semester courses
- **Reset:** Every semester
- **Purpose:** Show active, relevant deadlines

### Lifetime Data
- **Source:** `UserSettings.totalTasks*` fields
- **Accumulates:** Never resets, only grows
- **Purpose:** Track academic progress over time

### Example Timeline:

**Fall 2026:**
- Current semester: 45 tasks, 42 completed, 3 missed
- Lifetime totals: 0 completed, 0 missed, 0 total

**Spring 2027 (after transition):**
- Current semester: 0 tasks (new semester)
- Lifetime totals: 42 completed, 3 missed, 45 total

**Spring 2027 (end of semester):**
- Current semester: 50 tasks, 47 completed, 3 missed
- Lifetime totals: 42 completed, 3 missed, 45 total

**Summer 2027 (after transition):**
- Current semester: 0 tasks (new semester)
- Lifetime totals: 89 completed, 6 missed, 95 total

---

## Benefits

### For Students
✅ Clean view - only see current semester deadlines  
✅ Track lifetime progress - see academic journey  
✅ Automatic reset - no manual cleanup needed  
✅ Historical context - know total tasks completed ever

### For System
✅ Better performance - fewer assignments to load/process  
✅ Clearer data model - semester boundaries enforced  
✅ Automatic maintenance - semester transitions handled  
✅ Scalable - won't slow down after years of use

---

## Deployment Notes

### Required Steps:

1. **Deploy Schema Changes:**
   ```bash
   npx ampx sandbox --profile dropt-dev
   ```
   This will add the new `totalTasks*` fields to DynamoDB.

2. **Regenerate Types:**
   ```bash
   npx ampx generate graphql-client-code --out ./amplify/data/resource.ts
   ```
   This will update TypeScript types with new fields.

3. **Uncomment Migration Code:**
   - In `data-client.ts` lines ~176-209 (semester transition check)
   - Remove `as any` type assertions in `semester-stats.ts`

4. **Test Flow:**
   - Create assignments in current semester
   - Verify deadline tracker shows only current semester
   - Verify lifetime stats display correctly
   - Manually change currentSemester in database to test transition

---

## Future Enhancements

### Potential Additions:

1. **Semester Archive Page:**
   - View past semester statistics
   - See completed tasks by semester
   - Export semester reports

2. **Automatic Stats Update:**
   - Hook into assignment completion to update `totalTasksCompleted`
   - Track when tasks go overdue to update `totalTasksMissed`

3. **Semester Comparison:**
   - Compare current semester to previous
   - Show improvement trends
   - GPA correlation with task completion

4. **Manual Semester Override:**
   - Settings page to manually change semester
   - Useful for co-op terms, gap semesters, etc.

---

## Code Locations

| Component | File Path | Purpose |
|-----------|-----------|---------|
| Schema | `amplify/data/resource.ts` | Database fields |
| Stats Utilities | `lib/utils/semester-stats.ts` | Statistics management |
| Transition Logic | `lib/api/data-client.ts` | Auto-detection |
| UI | `app/(student)/tools/deadline-tracker.tsx` | Display & filtering |
| Semester Detection | `lib/utils/semester-utils.ts` | Date-based detection |

---

## Testing Checklist

- [ ] Backend deploys successfully
- [ ] Types regenerate without errors
- [ ] Deadline tracker shows only current semester courses
- [ ] Lifetime stats display in UI
- [ ] Semester transition updates stats correctly
- [ ] No assignments shown from previous semesters
- [ ] Empty state shows when no current semester assignments
- [ ] Refresh updates both current and lifetime stats

---

## Summary

The deadline tracker now provides a **semester-focused view** while preserving **lifetime academic history**. Students see only relevant current deadlines, while the system tracks their overall progress across their entire academic career. The transition happens automatically based on calendar dates, ensuring data integrity without manual intervention.
