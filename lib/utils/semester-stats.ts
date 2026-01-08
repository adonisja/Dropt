/**
 * Utility functions for managing semester-based task statistics.
 * Tracks lifetime task completion across semesters while resetting current semester data.
 * 
 * TODO: Remove 'as any' type assertions once backend schema is deployed and types are regenerated.
 * The new fields (totalTasksCompleted, totalTasksMissed, totalTasksEver) will then be 
 * properly typed in the UserSettings model.
 */

import { updateUserSettings, getOrCreateUserSettings } from '../api/data-client';
import { logger } from './logger';

export interface SemesterStats {
    totalTasksCompleted: number;
    totalTasksMissed: number;
    totalTasksEver: number;
}

/**
 * Updates the lifetime task statistics in UserSettings
 * 
 * @param userId - The user's ID
 * @param completedDelta - Number of tasks completed to add (can be negative)
 * @param missedDelta - Number of tasks missed to add (can be negative)
 * @param totalDelta - Number of total tasks to add (can be negative)
 * 
 * @example
 * // When a task is completed
 * await updateSemesterStats(userId, 1, 0, 0);
 * 
 * // When a task becomes overdue
 * await updateSemesterStats(userId, 0, 1, 0);
 * 
 * // When a new task is created
 * await updateSemesterStats(userId, 0, 0, 1);
 */
export async function updateSemesterStats(
    userId: string,
    completedDelta: number = 0,
    missedDelta: number = 0,
    totalDelta: number = 0
): Promise<void> {
    try {
        const settings = await getOrCreateUserSettings(userId);
        
        if (!settings) {
            throw new Error('Failed to fetch or create user settings');
        }
        
        const newCompleted = ((settings as any).totalTasksCompleted || 0) + completedDelta;
        const newMissed = ((settings as any).totalTasksMissed || 0) + missedDelta;
        const newTotal = ((settings as any).totalTasksEver || 0) + totalDelta;

        await updateUserSettings(userId, {
            totalTasksCompleted: Math.max(0, newCompleted),
            totalTasksMissed: Math.max(0, newMissed),
            totalTasksEver: Math.max(0, newTotal),
        } as any);
    } catch (error) {
        logger.error('Error updating semester stats', {
            source: 'updateSemesterStats',
            userId,
            data: { error, completedDelta, missedDelta, totalDelta }
        });
        throw error;
    }
}

/**
 * Gets the current lifetime statistics for a user
 * 
 * @param userId - The user's ID
 * @returns SemesterStats object with lifetime totals
 */
export async function getSemesterStats(userId: string): Promise<SemesterStats> {
    try {
        const settings = await getOrCreateUserSettings(userId);
        
        if (!settings) {
            return {
                totalTasksCompleted: 0,
                totalTasksMissed: 0,
                totalTasksEver: 0,
            };
        }
        
        return {
            totalTasksCompleted: (settings as any).totalTasksCompleted || 0,
            totalTasksMissed: (settings as any).totalTasksMissed || 0,
            totalTasksEver: (settings as any).totalTasksEver || 0,
        };
    } catch (error) {
        logger.error('Error fetching semester stats', {
            source: 'getSemesterStats',
            userId,
            data: { error }
        });
        return {
            totalTasksCompleted: 0,
            totalTasksMissed: 0,
            totalTasksEver: 0,
        };
    }
}

/**
 * Handles semester transition by archiving current semester stats
 * This function should be called when a new semester begins
 * 
 * Logic:
 * 1. Calculate completed/missed from current semester assignments
 * 2. Add to lifetime totals
 * 3. Update currentSemester and currentYear
 * 
 * @param userId - The user's ID
 * @param currentSemesterCompleted - Number of completed tasks in the ending semester
 * @param currentSemesterMissed - Number of missed tasks in the ending semester
 * @param newSemester - The new semester string (e.g., "Spring")
 * @param newYear - The new year (e.g., 2027)
 * 
 * @example
 * // When transitioning from Fall 2026 to Spring 2027
 * await handleSemesterTransition(userId, 45, 3, "Spring", 2027);
 */
export async function handleSemesterTransition(
    userId: string,
    currentSemesterCompleted: number,
    currentSemesterMissed: number,
    newSemester: string,
    newYear: number
): Promise<void> {
    try {
        const settings = await getOrCreateUserSettings(userId);
        
        if (!settings) {
            throw new Error('Failed to fetch or create user settings');
        }
        
        // Add current semester stats to lifetime totals
        const newTotalCompleted = ((settings as any).totalTasksCompleted || 0) + currentSemesterCompleted;
        const newTotalMissed = ((settings as any).totalTasksMissed || 0) + currentSemesterMissed;
        
        // Update to new semester and preserve accumulated stats
        await updateUserSettings(userId, {
            currentSemester: newSemester,
            currentYear: newYear,
            totalTasksCompleted: newTotalCompleted,
            totalTasksMissed: newTotalMissed,
        } as any);
        
        logger.info('Semester transition complete', {
            source: 'handleSemesterTransition',
            userId,
            data: {
                completedAdded: currentSemesterCompleted,
                missedAdded: currentSemesterMissed,
                newSemester,
                newYear
            }
        });
    } catch (error) {
        logger.error('Error handling semester transition', {
            source: 'handleSemesterTransition',
            userId,
            data: { error, newSemester, newYear }
        });
        throw error;
    }
}

/**
 * Checks if a semester transition is needed based on current date
 * 
 * @param currentSemester - The semester stored in UserSettings
 * @param currentYear - The year stored in UserSettings
 * @returns true if a transition is needed
 * 
 * @example
 * // If stored: Fall 2026, but current date is January 2027
 * needsSemesterTransition("Fall", 2026) // returns true
 */
export function needsSemesterTransition(currentSemester: string | null | undefined, currentYear: number): boolean {
    const now = new Date();
    const month = now.getMonth(); // 0-11
    const year = now.getFullYear();
    
    // Detect what semester we should be in
    let expectedSemester: string;
    if (month >= 0 && month <= 4) {
        expectedSemester = "Spring";
    } else if (month > 4 && month <= 7) {
        expectedSemester = "Summer";
    } else {
        expectedSemester = "Fall";
    }
    
    // Check if semester or year has changed
    if (year !== currentYear) {
        return true;
    }
    
    if (currentSemester !== expectedSemester) {
        return true;
    }
    
    return false;
}
