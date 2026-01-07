/**
 * Migration utility to assign semester and year to legacy courses based on creation date
 * 
 * This script fetches all StudentCourse records without semester/year info,
 * infers the semester and year from the creation date, and updates the records.
 * 
 * Usage: Run this script once during a migration phase to update legacy data.
 */

import { generateClient } from "aws-amplify/api";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

/**
 * Determines semester and year from a date
 * Uses the same logic as detectCurrentSemester but accepts any date
 */

function detectSemesterFromDate(date: Date): { semester: string; year: number } {
    const month = date.getMonth();
    const year = date.getFullYear();

    if (month >= 0 && month <= 4) {
        return { semester: "Spring", year }
    }
    if (month > 4 && month <= 7 ) {
        return { semester: "Summer", year }
    }
    return { semester: "Fall", year }
}

/**
 * Migrates legacy courses (without semester/year) by auto-assigning
 * semester data based on their creation date
 * 
 * @params userId - The student's user ID
 * @returns Object with migration results
 */

export async function migrateLegacyCourses(userId: string): Promise<{
    success: boolean;
    migratedCount: number;
    errors: string[];
}> {
    const errors: string[] = [];
    let migratedCount = 0;

    try {
        console.log('Starting legacy course migration...');

        // 1. Fetch all courses for user
        const { data:allCourses, errors: fetchErrors } = await client.models.StudentCourse.list({
            filter: { studentId: { eq: userId } }
        });

        if (fetchErrors && fetchErrors.length > 0) {
            throw new Error(`Failed to fetch courses: ${fetchErrors.map(e => e.message).join(', ')}`);
        }

        if (!allCourses || allCourses.length === 0) {
            return { success: true, migratedCount: 0, errors: [] };
        }

        // 2. Filter courses missing semester/year data
        const legacyCourses = allCourses.filter(course => !course.semester || !course.year);

        console.log(`Found ${legacyCourses.length} legacy courses to migrate`);

        if (legacyCourses.length === 0) {
            return{ success: true, migratedCount:0, errors: [] };
        }

        // 3. Update each legacy course
        for (const course of legacyCourses) {
            try {
                // Parse createdAt timestamp
                const createdDate = new Date(course.createdAt);

                // Detect semester from creation date
                const { semester, year } = detectSemesterFromDate(createdDate);

                console.log(`Migrating ${course.courseName}: ${semester} ${year}`);

                // Update the course
                const { data: updated, errors: updateErrors } = await client.models.StudentCourse.update({
                    studentId: course.studentId,
                    courseId: course.courseId,
                    semester,
                    year
                })

                if (updateErrors && updateErrors.length > 0) {
                    const errorMsg = `Failed to update ${course.courseName}: ${updateErrors.map(e => e.message).join(', ')}`;
                    console.error(errorMsg);
                    errors.push(errorMsg);
                } else {
                    migratedCount++;
                }
            } catch (err) {
                const errorMsg = `Error processing ${course.courseName}: ${err instanceof Error ? err.message : 'Unknown error'}`;
                console.error(errorMsg);
                errors.push(errorMsg);
            }
        }

        console.log(`Migration complete: ${migratedCount}/${legacyCourses.length} courses updated`);

        return {
            success:errors.length === 0,
            migratedCount,
            errors
        };
    
    } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown migration error';
        console.error('Migration failed: ', errorMsg);
        return {
            success: false,
            migratedCount,
            errors: [errorMsg]
        };
    }
}

/**
 * Checks if migration is needed (any courses without semester data)
 */
export async function needsMigration(userId: string): Promise<boolean> {
    try {
        const { data:allCourses } = await client.models.StudentCourse.list({
            filter: { studentId: { eq: userId }}
        });

        if (!allCourses) return false;

        return allCourses.some(course => !course.semester || !course.year);
    } catch (err) {
        console.error('Error checking migration status:', err);
        return false;
    }
}