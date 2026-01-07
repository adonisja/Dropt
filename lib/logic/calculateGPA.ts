export function convertGradeToGPA(percentage: number): number  {
/**
 * Will check grades from highest to lowest
 * ensuring we catch the correct range
 */

    if (percentage >= 93) return 4.0; // A: 93-100%
    if (percentage >= 90) return 3.7; // A-: 90-92%
    if (percentage >= 87) return 3.3; // B+: 87-89%
    if (percentage >= 83) return 3.0; // B: 83-86%
    if (percentage >= 80) return 2.7; // B-: 80-82%
    if (percentage >= 77) return 2.3; // B-: 77-79%
    if (percentage >= 73) return 2.0; // C+: 73-76%
    if (percentage >= 70) return 1.7; // C: 70-72%
    if (percentage >= 67) return 1.3; // D+: 67-69%
    if (percentage >= 63) return 1.0; // D: 63-66%
    if (percentage >= 60) return 0.7; // D-: 60-62%
    return 0.0                        // F : 0-59%
}

export function calculateSemesterGPA(
    courses: Array<{
        currentGrade: number | null;
        credits: number;
    }>
): number | null {
    // Step 1: Filter to only courses that have been graded
    // currentGrade is null if no assignments graded yet
    const gradedCourses = courses.filter(c => c.currentGrade !== null);

    // Step 2: If no courses have grades, return null
    // Dashboard will show "--" instead of a number
    if (gradedCourses.length === 0) {
        return null;
    }

    // Step 3: Calculate weighted sum
    let totalPoints = 0; // Sum of (GPA x Credits)
    let totalCredits = 0; // Sum of all credits

    gradedCourses.forEach(course => {
        // Convert percentage to GPA (e.g. 87% → 3.3)
        const gpa = convertGradeToGPA(course.currentGrade!);  // ! because we filtered nulls

        // Get credits, defaults to 3 if somehow missing
        const credits = course.credits || 3;

        // Accumulate: GPA x Credits
        totalPoints += gpa * credits;
        totalCredits += credits;
    });

    // Step 4: Avoid division by zero (shouldn't happen but to be safe)
    if (totalCredits === 0) return null;

    // Step 5: Return weighted average
    return totalPoints / totalCredits;
}

export function getLetterGradeFromGPA(gpa: number): string {
    /**
     * Will check GPA from highest to lowest
     * Reverse of convertGradeToGPA
     * Uses midpoints between GPA values
     */
    if (gpa >= 3.85) return 'A';       // 4.0 to 3.85
    if (gpa >= 3.5) return 'A-';       // 3.84 to 3.5
    if (gpa >= 3.15) return 'B+';      // 3.49 to 3.15
    if (gpa >= 2.85) return 'B';       // 3.14 to 2.85
    if (gpa >= 2.5) return 'B-';       // 2.84 to 2.5
    if (gpa >= 2.15) return 'C+';      // 2.49 to 2.15
    if (gpa >= 1.85) return 'C';       // 2.14 to 1.85
    if (gpa >= 1.5) return 'C-';       // 1.84 to 1.5
    if (gpa >= 1.15) return 'D+';      // 1.49 to 1.15
    if (gpa >= 0.85) return 'D';       // 1.14 to 0.85
    if (gpa >= 0.5) return 'D-';       // 0.84 to 0.5
    return 'F';                        // below 0.5
}
