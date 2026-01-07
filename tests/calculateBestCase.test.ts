import { describe, it, expect } from "vitest";
import { calculateBestCase } from "../lib/logic/calculateBestCase";
import type { StudentCourseData } from "../lib/types";

// Helper function to create test data with defaults
function createTestData(overrides: Partial<StudentCourseData> = {}): StudentCourseData {
    return {
        courseID: "TEST101",
        studentID: "TEST001",
        isRequired: true,
        rubric: {
            rubricID: "RUB_TEST",
            courseID: "TEST101",
            categories: []
        },
        grades: {
            studentID: "TEST001",
            courseID: "TEST101",
            assignments: []
        },
        contextData: {
            semester: "Fall",
            year: 2023,
            instructorID: "INS001",
            location: "Online",
            hoursPerWeek: 5,
            stressLevel: 3
        },
        ...overrides
    };
}

describe("calculateBestCase", () => {

    // Test 1: All assignments already graded (no nulls) - realistic semester data
    it("should return same as current grade when all assignments are graded", () => {
        const testData = createTestData({
            rubric: {
                rubricID: "RUB_TEST",
                courseID: "TEST101",
                categories: [
                    { category: "Homework", weight: 30 },
                    { category: "Quizzes", weight: 20 },
                    { category: "Midterm", weight: 20 },
                    { category: "Final", weight: 30 }
                ]
            },
            grades: {
                studentID: "TEST001",
                courseID: "TEST101",
                assignments: [
                    // Homework (6 assignments)
                    { assignmentID: "HW1", assignmentName: "HW1", category: "Homework",
                      scoreEarned: 18, maxScore: 20, dateDue: new Date("2023-09-01") }, // 90%
                    { assignmentID: "HW2", assignmentName: "HW2", category: "Homework",
                      scoreEarned: 16, maxScore: 20, dateDue: new Date("2023-09-08") }, // 80%
                    { assignmentID: "HW3", assignmentName: "HW3", category: "Homework",
                      scoreEarned: 19, maxScore: 20, dateDue: new Date("2023-09-15") }, // 95%
                    { assignmentID: "HW4", assignmentName: "HW4", category: "Homework",
                      scoreEarned: 17, maxScore: 20, dateDue: new Date("2023-09-22") }, // 85%
                    { assignmentID: "HW5", assignmentName: "HW5", category: "Homework",
                      scoreEarned: 20, maxScore: 20, dateDue: new Date("2023-09-29") }, // 100%
                    { assignmentID: "HW6", assignmentName: "HW6", category: "Homework",
                      scoreEarned: 15, maxScore: 20, dateDue: new Date("2023-10-06") }, // 75%
                    // Quizzes (4 quizzes)
                    { assignmentID: "Q1", assignmentName: "Quiz 1", category: "Quizzes",
                      scoreEarned: 8, maxScore: 10, dateDue: new Date("2023-09-10") },  // 80%
                    { assignmentID: "Q2", assignmentName: "Quiz 2", category: "Quizzes",
                      scoreEarned: 9, maxScore: 10, dateDue: new Date("2023-09-24") },  // 90%
                    { assignmentID: "Q3", assignmentName: "Quiz 3", category: "Quizzes",
                      scoreEarned: 7, maxScore: 10, dateDue: new Date("2023-10-08") },  // 70%
                    { assignmentID: "Q4", assignmentName: "Quiz 4", category: "Quizzes",
                      scoreEarned: 10, maxScore: 10, dateDue: new Date("2023-10-22") }, // 100%
                    // Midterm
                    { assignmentID: "MT", assignmentName: "Midterm", category: "Midterm",
                      scoreEarned: 82, maxScore: 100, dateDue: new Date("2023-10-15") }, // 82%
                    // Final
                    { assignmentID: "FIN", assignmentName: "Final Exam", category: "Final",
                      scoreEarned: 88, maxScore: 100, dateDue: new Date("2023-12-15") }  // 88%
                ]
            }
        });

        const result = calculateBestCase(testData);

        // HW: (18+16+19+17+20+15)/(20*6) = 105/120 = 87.5%
        // Quizzes: (8+9+7+10)/(10*4) = 34/40 = 85%
        // Midterm: 82/100 = 82%
        // Final: 88/100 = 88%
        // Weighted: (87.5*30 + 85*20 + 82*20 + 88*30) / 100 = 86.05%
        expect(result).toBeCloseTo(86.05, 1);
    });

    // Test 2: Mid-semester scenario with some ungraded assignments
    it("should assume 100% on ungraded assignments", () => {
        const testData = createTestData({
            rubric: {
                rubricID: "RUB_TEST",
                courseID: "TEST101",
                categories: [
                    { category: "Homework", weight: 30 },
                    { category: "Quizzes", weight: 20 },
                    { category: "Midterm", weight: 20 },
                    { category: "Final", weight: 30 }
                ]
            },
            grades: {
                studentID: "TEST001",
                courseID: "TEST101",
                assignments: [
                    // Homework - 4 graded, 2 ungraded
                    { assignmentID: "HW1", assignmentName: "HW1", category: "Homework",
                      scoreEarned: 18, maxScore: 20, dateDue: new Date("2023-09-01") }, // 90%
                    { assignmentID: "HW2", assignmentName: "HW2", category: "Homework",
                      scoreEarned: 16, maxScore: 20, dateDue: new Date("2023-09-08") }, // 80%
                    { assignmentID: "HW3", assignmentName: "HW3", category: "Homework",
                      scoreEarned: 19, maxScore: 20, dateDue: new Date("2023-09-15") }, // 95%
                    { assignmentID: "HW4", assignmentName: "HW4", category: "Homework",
                      scoreEarned: 17, maxScore: 20, dateDue: new Date("2023-09-22") }, // 85%
                    { assignmentID: "HW5", assignmentName: "HW5", category: "Homework",
                      scoreEarned: null, maxScore: 20, dateDue: new Date("2023-09-29") }, // Assume 100%
                    { assignmentID: "HW6", assignmentName: "HW6", category: "Homework",
                      scoreEarned: null, maxScore: 20, dateDue: new Date("2023-10-06") }, // Assume 100%
                    // Quizzes - 3 graded, 1 ungraded
                    { assignmentID: "Q1", assignmentName: "Quiz 1", category: "Quizzes",
                      scoreEarned: 8, maxScore: 10, dateDue: new Date("2023-09-10") },  // 80%
                    { assignmentID: "Q2", assignmentName: "Quiz 2", category: "Quizzes",
                      scoreEarned: 9, maxScore: 10, dateDue: new Date("2023-09-24") },  // 90%
                    { assignmentID: "Q3", assignmentName: "Quiz 3", category: "Quizzes",
                      scoreEarned: 7, maxScore: 10, dateDue: new Date("2023-10-08") },  // 70%
                    { assignmentID: "Q4", assignmentName: "Quiz 4", category: "Quizzes",
                      scoreEarned: null, maxScore: 10, dateDue: new Date("2023-10-22") }, // Assume 100%
                    // Midterm - graded
                    { assignmentID: "MT", assignmentName: "Midterm", category: "Midterm",
                      scoreEarned: 78, maxScore: 100, dateDue: new Date("2023-10-15") }, // 78%
                    // Final - ungraded
                    { assignmentID: "FIN", assignmentName: "Final Exam", category: "Final",
                      scoreEarned: null, maxScore: 100, dateDue: new Date("2023-12-15") } // Assume 100%
                ]
            }
        });

        const result = calculateBestCase(testData);

        // HW: (18+16+19+17+20+20)/(20*6) = 110/120 = 91.67%
        // Quizzes: (8+9+7+10)/(10*4) = 34/40 = 85%
        // Midterm: 78/100 = 78%
        // Final: 100/100 = 100% (assumed)
        // Weighted: (91.67*30 + 85*20 + 78*20 + 100*30) / 100 = 90.1%
        expect(result).toBeCloseTo(90.1, 0);
    });

    // Test 3: Beginning of semester - all assignments ungraded
    it("should return 100% when all assignments are ungraded", () => {
        const testData = createTestData({
            rubric: {
                rubricID: "RUB_TEST",
                courseID: "TEST101",
                categories: [
                    { category: "Homework", weight: 30 },
                    { category: "Quizzes", weight: 20 },
                    { category: "Midterm", weight: 20 },
                    { category: "Final", weight: 30 }
                ]
            },
            grades: {
                studentID: "TEST001",
                courseID: "TEST101",
                assignments: [
                    // All homework ungraded (6 assignments)
                    { assignmentID: "HW1", assignmentName: "HW1", category: "Homework",
                      scoreEarned: null, maxScore: 20, dateDue: new Date("2023-09-01") },
                    { assignmentID: "HW2", assignmentName: "HW2", category: "Homework",
                      scoreEarned: null, maxScore: 20, dateDue: new Date("2023-09-08") },
                    { assignmentID: "HW3", assignmentName: "HW3", category: "Homework",
                      scoreEarned: null, maxScore: 20, dateDue: new Date("2023-09-15") },
                    { assignmentID: "HW4", assignmentName: "HW4", category: "Homework",
                      scoreEarned: null, maxScore: 20, dateDue: new Date("2023-09-22") },
                    { assignmentID: "HW5", assignmentName: "HW5", category: "Homework",
                      scoreEarned: null, maxScore: 20, dateDue: new Date("2023-09-29") },
                    { assignmentID: "HW6", assignmentName: "HW6", category: "Homework",
                      scoreEarned: null, maxScore: 20, dateDue: new Date("2023-10-06") },
                    // All quizzes ungraded (4 quizzes)
                    { assignmentID: "Q1", assignmentName: "Quiz 1", category: "Quizzes",
                      scoreEarned: null, maxScore: 10, dateDue: new Date("2023-09-10") },
                    { assignmentID: "Q2", assignmentName: "Quiz 2", category: "Quizzes",
                      scoreEarned: null, maxScore: 10, dateDue: new Date("2023-09-24") },
                    { assignmentID: "Q3", assignmentName: "Quiz 3", category: "Quizzes",
                      scoreEarned: null, maxScore: 10, dateDue: new Date("2023-10-08") },
                    { assignmentID: "Q4", assignmentName: "Quiz 4", category: "Quizzes",
                      scoreEarned: null, maxScore: 10, dateDue: new Date("2023-10-22") },
                    // Midterm ungraded
                    { assignmentID: "MT", assignmentName: "Midterm", category: "Midterm",
                      scoreEarned: null, maxScore: 100, dateDue: new Date("2023-10-15") },
                    // Final ungraded
                    { assignmentID: "FIN", assignmentName: "Final Exam", category: "Final",
                      scoreEarned: null, maxScore: 100, dateDue: new Date("2023-12-15") }
                ]
            }
        });

        const result = calculateBestCase(testData);

        // All categories assume 100%
        // Weighted: (100*30 + 100*20 + 100*20 + 100*30) / 100 = 100%
        expect(result).toBe(100);
    });

    // Test 4: Early semester - some categories have no assignments yet
    it("should skip categories with no assignments", () => {
        const testData = createTestData({
            rubric: {
                rubricID: "RUB_TEST",
                courseID: "TEST101",
                categories: [
                    { category: "Homework", weight: 30 },
                    { category: "Quizzes", weight: 20 },
                    { category: "Midterm", weight: 20 },
                    { category: "Final", weight: 30 }
                ]
            },
            grades: {
                studentID: "TEST001",
                courseID: "TEST101",
                assignments: [
                    // Only homework has been assigned (4 graded, 2 ungraded)
                    { assignmentID: "HW1", assignmentName: "HW1", category: "Homework",
                      scoreEarned: 18, maxScore: 20, dateDue: new Date("2023-09-01") }, // 90%
                    { assignmentID: "HW2", assignmentName: "HW2", category: "Homework",
                      scoreEarned: 16, maxScore: 20, dateDue: new Date("2023-09-08") }, // 80%
                    { assignmentID: "HW3", assignmentName: "HW3", category: "Homework",
                      scoreEarned: 19, maxScore: 20, dateDue: new Date("2023-09-15") }, // 95%
                    { assignmentID: "HW4", assignmentName: "HW4", category: "Homework",
                      scoreEarned: 17, maxScore: 20, dateDue: new Date("2023-09-22") }, // 85%
                    { assignmentID: "HW5", assignmentName: "HW5", category: "Homework",
                      scoreEarned: null, maxScore: 20, dateDue: new Date("2023-09-29") }, // Assume 100%
                    { assignmentID: "HW6", assignmentName: "HW6", category: "Homework",
                      scoreEarned: null, maxScore: 20, dateDue: new Date("2023-10-06") }, // Assume 100%
                    // Only 2 quizzes assigned so far (both graded)
                    { assignmentID: "Q1", assignmentName: "Quiz 1", category: "Quizzes",
                      scoreEarned: 8, maxScore: 10, dateDue: new Date("2023-09-10") },  // 80%
                    { assignmentID: "Q2", assignmentName: "Quiz 2", category: "Quizzes",
                      scoreEarned: 9, maxScore: 10, dateDue: new Date("2023-09-24") }   // 90%
                    // Midterm: NO ASSIGNMENTS YET - should be skipped
                    // Final: NO ASSIGNMENTS YET - should be skipped
                ]
            }
        });

        const result = calculateBestCase(testData);

        // Only Homework (30%) and Quizzes (20%) have data
        // HW: (18+16+19+17+20+20)/(20*6) = 110/120 = 91.67%
        // Quizzes: (8+9)/(10*2) = 17/20 = 85%
        // Normalize to 50% total weight: (91.67*30 + 85*20) / 50 = (2750 + 1700) / 50 = 89%
        expect(result).toBeCloseTo(89, 0);
    });

    // Test 5: Drop lowest policy with multiple categories and mixed grading
    it("should apply drop lowest policy after assuming best case", () => {
        const testData = createTestData({
            rubric: {
                rubricID: "RUB_TEST",
                courseID: "TEST101",
                categories: [
                    { category: "Homework", weight: 30, dropLowest: 2 },
                    { category: "Quizzes", weight: 20, dropLowest: 1 },
                    { category: "Midterm", weight: 20 },
                    { category: "Final", weight: 30 }
                ]
            },
            grades: {
                studentID: "TEST001",
                courseID: "TEST101",
                assignments: [
                    // Homework (8 assignments) - drop lowest 2
                    { assignmentID: "HW1", assignmentName: "HW1", category: "Homework",
                      scoreEarned: 10, maxScore: 20, dateDue: new Date("2023-09-01") }, // 50% - DROP
                    { assignmentID: "HW2", assignmentName: "HW2", category: "Homework",
                      scoreEarned: 14, maxScore: 20, dateDue: new Date("2023-09-08") }, // 70% - DROP
                    { assignmentID: "HW3", assignmentName: "HW3", category: "Homework",
                      scoreEarned: 16, maxScore: 20, dateDue: new Date("2023-09-15") }, // 80%
                    { assignmentID: "HW4", assignmentName: "HW4", category: "Homework",
                      scoreEarned: 18, maxScore: 20, dateDue: new Date("2023-09-22") }, // 90%
                    { assignmentID: "HW5", assignmentName: "HW5", category: "Homework",
                      scoreEarned: 19, maxScore: 20, dateDue: new Date("2023-09-29") }, // 95%
                    { assignmentID: "HW6", assignmentName: "HW6", category: "Homework",
                      scoreEarned: 17, maxScore: 20, dateDue: new Date("2023-10-06") }, // 85%
                    { assignmentID: "HW7", assignmentName: "HW7", category: "Homework",
                      scoreEarned: null, maxScore: 20, dateDue: new Date("2023-10-13") }, // Assume 100%
                    { assignmentID: "HW8", assignmentName: "HW8", category: "Homework",
                      scoreEarned: null, maxScore: 20, dateDue: new Date("2023-10-20") }, // Assume 100%
                    // Quizzes (5 quizzes) - drop lowest 1
                    { assignmentID: "Q1", assignmentName: "Quiz 1", category: "Quizzes",
                      scoreEarned: 6, maxScore: 10, dateDue: new Date("2023-09-10") },  // 60% - DROP
                    { assignmentID: "Q2", assignmentName: "Quiz 2", category: "Quizzes",
                      scoreEarned: 8, maxScore: 10, dateDue: new Date("2023-09-24") },  // 80%
                    { assignmentID: "Q3", assignmentName: "Quiz 3", category: "Quizzes",
                      scoreEarned: 9, maxScore: 10, dateDue: new Date("2023-10-08") },  // 90%
                    { assignmentID: "Q4", assignmentName: "Quiz 4", category: "Quizzes",
                      scoreEarned: 7, maxScore: 10, dateDue: new Date("2023-10-22") },  // 70%
                    { assignmentID: "Q5", assignmentName: "Quiz 5", category: "Quizzes",
                      scoreEarned: null, maxScore: 10, dateDue: new Date("2023-11-05") }, // Assume 100%
                    // Midterm - graded
                    { assignmentID: "MT", assignmentName: "Midterm", category: "Midterm",
                      scoreEarned: 75, maxScore: 100, dateDue: new Date("2023-10-15") }, // 75%
                    // Final - ungraded
                    { assignmentID: "FIN", assignmentName: "Final Exam", category: "Final",
                      scoreEarned: null, maxScore: 100, dateDue: new Date("2023-12-15") } // Assume 100%
                ]
            }
        });

        const result = calculateBestCase(testData);

        // HW after drop 2: Keep 80%, 85%, 90%, 95%, 100%, 100%
        // (16+17+18+19+20+20)/(20*6) = 110/120 = 91.67%
        // Quizzes after drop 1: Keep 70%, 80%, 90%, 100%
        // (7+8+9+10)/(10*4) = 34/40 = 85%
        // Midterm: 75%
        // Final: 100% (assumed)
        // Weighted: (91.67*30 + 85*20 + 75*20 + 100*30) / 100 = 89.5%
        expect(result).toBeCloseTo(89.5, 0);
    });

    // Test 6: Complex scenario - 5 categories with varied grading states
    it("should handle multiple categories correctly", () => {
        const testData = createTestData({
            rubric: {
                rubricID: "RUB_TEST",
                courseID: "TEST101",
                categories: [
                    { category: "Homework", weight: 25 },
                    { category: "Labs", weight: 15 },
                    { category: "Quizzes", weight: 15 },
                    { category: "Midterm", weight: 20 },
                    { category: "Final", weight: 25 }
                ]
            },
            grades: {
                studentID: "TEST001",
                courseID: "TEST101",
                assignments: [
                    // Homework - all graded (5 assignments)
                    { assignmentID: "HW1", assignmentName: "HW1", category: "Homework",
                      scoreEarned: 18, maxScore: 20, dateDue: new Date("2023-09-01") }, // 90%
                    { assignmentID: "HW2", assignmentName: "HW2", category: "Homework",
                      scoreEarned: 17, maxScore: 20, dateDue: new Date("2023-09-08") }, // 85%
                    { assignmentID: "HW3", assignmentName: "HW3", category: "Homework",
                      scoreEarned: 19, maxScore: 20, dateDue: new Date("2023-09-15") }, // 95%
                    { assignmentID: "HW4", assignmentName: "HW4", category: "Homework",
                      scoreEarned: 16, maxScore: 20, dateDue: new Date("2023-09-22") }, // 80%
                    { assignmentID: "HW5", assignmentName: "HW5", category: "Homework",
                      scoreEarned: 20, maxScore: 20, dateDue: new Date("2023-09-29") }, // 100%
                    // Labs - mixed (3 graded, 2 ungraded)
                    { assignmentID: "L1", assignmentName: "Lab 1", category: "Labs",
                      scoreEarned: 45, maxScore: 50, dateDue: new Date("2023-09-05") },  // 90%
                    { assignmentID: "L2", assignmentName: "Lab 2", category: "Labs",
                      scoreEarned: 40, maxScore: 50, dateDue: new Date("2023-09-12") },  // 80%
                    { assignmentID: "L3", assignmentName: "Lab 3", category: "Labs",
                      scoreEarned: 48, maxScore: 50, dateDue: new Date("2023-09-19") },  // 96%
                    { assignmentID: "L4", assignmentName: "Lab 4", category: "Labs",
                      scoreEarned: null, maxScore: 50, dateDue: new Date("2023-09-26") }, // Assume 100%
                    { assignmentID: "L5", assignmentName: "Lab 5", category: "Labs",
                      scoreEarned: null, maxScore: 50, dateDue: new Date("2023-10-03") }, // Assume 100%
                    // Quizzes - all ungraded (4 quizzes)
                    { assignmentID: "Q1", assignmentName: "Quiz 1", category: "Quizzes",
                      scoreEarned: null, maxScore: 10, dateDue: new Date("2023-09-10") },
                    { assignmentID: "Q2", assignmentName: "Quiz 2", category: "Quizzes",
                      scoreEarned: null, maxScore: 10, dateDue: new Date("2023-09-24") },
                    { assignmentID: "Q3", assignmentName: "Quiz 3", category: "Quizzes",
                      scoreEarned: null, maxScore: 10, dateDue: new Date("2023-10-08") },
                    { assignmentID: "Q4", assignmentName: "Quiz 4", category: "Quizzes",
                      scoreEarned: null, maxScore: 10, dateDue: new Date("2023-10-22") },
                    // Midterm - graded
                    { assignmentID: "MT", assignmentName: "Midterm", category: "Midterm",
                      scoreEarned: 82, maxScore: 100, dateDue: new Date("2023-10-15") }, // 82%
                    // Final - ungraded
                    { assignmentID: "FIN", assignmentName: "Final Exam", category: "Final",
                      scoreEarned: null, maxScore: 100, dateDue: new Date("2023-12-15") } // Assume 100%
                ]
            }
        });

        const result = calculateBestCase(testData);

        // HW: (18+17+19+16+20)/(20*5) = 90/100 = 90%
        // Labs: (45+40+48+50+50)/(50*5) = 233/250 = 93.2%
        // Quizzes: (10+10+10+10)/(10*4) = 40/40 = 100% (all assumed)
        // Midterm: 82/100 = 82%
        // Final: 100/100 = 100% (assumed)
        // Weighted: (90*25 + 93.2*15 + 100*15 + 82*20 + 100*25) / 100 = 92.88%
        expect(result).toBeCloseTo(92.88, 1);
    });

    // Test 7: Filter out assignments with null maxScore across multiple categories
    it("should filter out assignments with null maxScore", () => {
        const testData = createTestData({
            rubric: {
                rubricID: "RUB_TEST",
                courseID: "TEST101",
                categories: [
                    { category: "Homework", weight: 40 },
                    { category: "Quizzes", weight: 30 },
                    { category: "Final", weight: 30 }
                ]
            },
            grades: {
                studentID: "TEST001",
                courseID: "TEST101",
                assignments: [
                    // Homework - some with null maxScore
                    { assignmentID: "HW1", assignmentName: "HW1", category: "Homework",
                      scoreEarned: 18, maxScore: 20, dateDue: new Date("2023-09-01") }, // 90% - valid
                    { assignmentID: "HW2", assignmentName: "HW2", category: "Homework",
                      scoreEarned: 16, maxScore: 20, dateDue: new Date("2023-09-08") }, // 80% - valid
                    { assignmentID: "HW3", assignmentName: "HW3", category: "Homework",
                      scoreEarned: null, maxScore: null, dateDue: new Date("2023-09-15") }, // FILTER OUT
                    { assignmentID: "HW4", assignmentName: "HW4", category: "Homework",
                      scoreEarned: null, maxScore: 20, dateDue: new Date("2023-09-22") }, // Assume 100%
                    { assignmentID: "HW5", assignmentName: "HW5", category: "Homework",
                      scoreEarned: 19, maxScore: null, dateDue: new Date("2023-09-29") }, // FILTER OUT (graded but no max)
                    // Quizzes - one with null maxScore
                    { assignmentID: "Q1", assignmentName: "Quiz 1", category: "Quizzes",
                      scoreEarned: 8, maxScore: 10, dateDue: new Date("2023-09-10") },  // 80% - valid
                    { assignmentID: "Q2", assignmentName: "Quiz 2", category: "Quizzes",
                      scoreEarned: null, maxScore: null, dateDue: new Date("2023-09-24") }, // FILTER OUT
                    { assignmentID: "Q3", assignmentName: "Quiz 3", category: "Quizzes",
                      scoreEarned: 9, maxScore: 10, dateDue: new Date("2023-10-08") },  // 90% - valid
                    { assignmentID: "Q4", assignmentName: "Quiz 4", category: "Quizzes",
                      scoreEarned: null, maxScore: 10, dateDue: new Date("2023-10-22") }, // Assume 100%
                    // Final - valid
                    { assignmentID: "FIN", assignmentName: "Final Exam", category: "Final",
                      scoreEarned: null, maxScore: 100, dateDue: new Date("2023-12-15") } // Assume 100%
                ]
            }
        });

        const result = calculateBestCase(testData);

        // HW valid: HW1(18/20), HW2(16/20), HW4(20/20 assumed)
        // (18+16+20)/(20*3) = 54/60 = 90%
        // Quizzes valid: Q1(8/10), Q3(9/10), Q4(10/10 assumed)
        // (8+9+10)/(10*3) = 27/30 = 90%
        // Final: 100/100 = 100% (assumed)
        // Weighted: (90*40 + 90*30 + 100*30) / 100 = 93%
        expect(result).toBe(93);
    });

    // Test 8: Complete rubric but no assignments at all (beginning of semester)
    it("should return 0 when no categories have assignments", () => {
        const testData = createTestData({
            rubric: {
                rubricID: "RUB_TEST",
                courseID: "TEST101",
                categories: [
                    { category: "Homework", weight: 30, dropLowest: 2 },
                    { category: "Quizzes", weight: 20, dropLowest: 1 },
                    { category: "Participation", weight: 10 },
                    { category: "Midterm", weight: 15 },
                    { category: "Final", weight: 25 }
                ]
            },
            grades: {
                studentID: "TEST001",
                courseID: "TEST101",
                assignments: [] // First day of class - nothing assigned yet
            }
        });

        const result = calculateBestCase(testData);

        // All categories skipped, totalWeightUsed = 0
        expect(result).toBe(0);
    });

})