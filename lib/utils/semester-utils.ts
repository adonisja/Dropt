/**
 * Utility functions for semester and academic year operations.
 */

import { StudentCourseData } from '../types';

export interface SemesterInfo {
    semester: string;
    year: number;

}

/**
 *  Auto-detects the current academic semester based on the current date.
 * 
 * Logic:
 * - Jan-May (months 0-4): Spring
 * - Jun-Aug (months 5-7): Summer
 * - Sep-Dec (months 8-11): Fall
 * 
 * @returns SemesterInfo object with current semester and year
 * @example
 * // If todays date is January 5, 2026
 * detectCurrentSemester() // { semester: "Spring", year: 2026 }
 */

export function detectCurrentSemester(): SemesterInfo {
    const now = new Date();
    const month = now.getMonth(); // 0-11
    const year = now.getFullYear();

    if (month >= 0 && month <= 4) {
        return { semester: "Spring", year };
    }
    if (month > 4 && month <=7) {
        return { semester: "Summer", year };
    }
    return { semester: "Fall", year };
} 
    
/**
 * Generates a list of semester options for pickers/dropdowns
 * Shows past 1 year and future 2 years
 * 
 * @returns Array of semester strings 
 * @example
 * generateSemesterOptions()
 * // ["Spring 2025", "Summer 2025", "Fall 2025", "Winter 2025" "Spring 2026", ...]
 */

export function generateSemesterOptions(): string[] {
    const currentYear = new Date().getFullYear();
    const options: string[] = [];

    for (let year = currentYear - 1; year <= currentYear + 2; year++) {
        options.push(`Spring ${year}`);
        options.push(`Summer ${year}`);
        options.push(`Fall ${year}`);
        options.push(`Winter ${year}`);
    }

    return options
}

/**
 * Formats semester and year into a readable string
 * 
 * @param semester - e.g., "Spring", "Fall", "Summer", "Winter"
 * @param year - e.g., 2025, 2026
 * @returns Formatted string
 * @example 
 * formatSemester("Spring", 2026) // "Spring 2026"
 */

export function formatSemester(semester: string, year: number): string {
    return `${semester} ${year}`;
}

/**
 * Parses a semester string into components
 * 
 * @param semesterString - e.g., "Spring 2026"
 * @returns Object with semester and year
 * @example
 * parseSemester("Spring 2026") // { semester: "Spring", year: 2026 }
 */
export function parseSemester(semesterString: string): SemesterInfo | null {
    const parts = semesterString.split(' ');
    if (parts.length !== 2) return null

    const semester = parts[0];
    const year = parseInt(parts[1], 10);

    if (isNaN(year)) return null;

    return { semester, year };
}

/**
 * Groups courses by year and semester for archive view
 * Courses without semester/year data are placed in a special "uncategorized" group
 * 
 * @param courses - Array of StudentCourse objects
 * @returns Nested structure: { year: { semester: Course[] } } + uncategorized array
 * @example
 * groupCoursesByYearAndSemester(courses)
 * // {
 * //   grouped: {
 * //     2025: { "Fall": [...], "Summer": [...] },
 * //     2024: { "Spring": [...] }
 * //   },
 * //   uncategorized: [course1, course2]
 * // }
 */
export function groupCoursesByYearAndSemester<T extends { year?: number | null; semester?: string | null }>(
    courses: T[]
): { grouped: Record<number, Record<string, T[]>>; uncategorized: T[] } {
    const grouped: Record<number, Record<string, T[]>> = {};
    const uncategorized: T[] = [];

    courses.forEach(course => {
        const year = course.year;
        const semester = course.semester;

        // If missing semester/year data, add to uncategorized
        if (!year || !semester) {
            uncategorized.push(course);
            return;
        }

        if (!grouped[year]) {
            grouped[year] = {};
        }

        if (!grouped[year][semester]) {
            grouped[year][semester] = [];
        }

        grouped[year][semester].push(course);
    });

    return { grouped, uncategorized };
}