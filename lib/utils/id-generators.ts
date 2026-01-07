// Assignment ID prefixes by category
const CATEGORY_PREFIXES: Record<string, string> = {
    "Homework": 'HW',
    "Quiz": 'QZ',
    "Quizzes": 'QZ',
    "Test": 'TEST',
    "Tests": 'TEST',
    "Midterm": 'MID',
    "Final": 'FIN',
    "Project": 'PRJ',
    "Lab": 'LAB',
    "Exam": 'EXM',
    "Other": 'OTH',
    "Participation": 'PAR',
};

/**
 * Generates a unique Assignment ID based on the category and a random component.
 * @param category The category of the assignment (e.g., Homework, Quiz).
 * @param sequenceNumber - The sequence number for the assignment in its category.
 * @returns A unique Assignment ID string like "HW001", "FIN001".
 */

export function generateAssignmentID(category: string, sequenceNumber: number): string {
    const prefix = CATEGORY_PREFIXES[category] || 'ASN'; // Default prefix if category not found
    return `${prefix}${String(sequenceNumber).padStart(3, '0')}`;
}

/**
 * Extract sequence number from assignment ID.
 * @param assignmentID The assignment ID string (e.g., "HW001").
 * @returns The sequence number as a number.
 */
export function getSequenceFromId(assignmentId: string): number {
    const match = assignmentId.match(/\d+$/);
    return match ? parseInt(match[0], 10) : NaN;
}

/**
 * Get the next assignment ID for a category based on existing assignment IDs.
 * @param existingIds - Array of existing assignment IDs for this category.
 * @param category - The category of the assignment (e.g., Homework, Quiz).
 * @returns Next ID in sequence (e.g., if HW001, HW002 exist, returns HW003).
*/
export function getNextAssignmentID(existingIds: string[], category: string): string {
    const prefix = CATEGORY_PREFIXES[category] || 'ASN';
    const categoryIds = existingIds.filter(id => id.startsWith(prefix));

    if (categoryIds.length === 0) {
        return generateAssignmentID(category, 1);
    }

    const maxSequence = Math.max(...categoryIds.map(id => getSequenceFromId(id)));
    return generateAssignmentID(category, maxSequence + 1);
}