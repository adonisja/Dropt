import { describe, it, expect } from "vitest";
import { calculateWorstCase } from "../lib/logic/calculateWorstCase";
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

describe("calculateWorstCase", () => {

    // Test 1: All assignments already graded (no nulls)
    it("should return same as current grade when all assignments are graded", () => {
        const testData = createTestData({
            rubric: {
                rubricID: "RUB_CS101",
                courseID: "CS101",
                categories: [
                    { category: "Homework", weight: 30 },
                    { category: "Quizzes", weight: 20 },
                    { category: "Midterm", weight: 20 },
                    { category: "Final", weight: 30 }
                ]
            },
            grades: {
                studentID: "STU001",
                courseID: "CS101",
                assignments: [
                    // Homework (8 assignments) - all graded
                    { assignmentID: "HW1", assignmentName: "Variables & Types", category: "Homework",
                      scoreEarned: 18, maxScore: 20, dateDue: new Date("2023-09-01") },
                    { assignmentID: "HW2", assignmentName: "Control Flow", category: "Homework",
                      scoreEarned: 17, maxScore: 20, dateDue: new Date("2023-09-08") },
                    { assignmentID: "HW3", assignmentName: "Functions", category: "Homework",
                      scoreEarned: 19, maxScore: 20, dateDue: new Date("2023-09-15") },
                    { assignmentID: "HW4", assignmentName: "Arrays", category: "Homework",
                      scoreEarned: 16, maxScore: 20, dateDue: new Date("2023-09-22") },
                    { assignmentID: "HW5", assignmentName: "Objects", category: "Homework",
                      scoreEarned: 18, maxScore: 20, dateDue: new Date("2023-09-29") },
                    { assignmentID: "HW6", assignmentName: "Classes", category: "Homework",
                      scoreEarned: 17, maxScore: 20, dateDue: new Date("2023-10-06") },
                    { assignmentID: "HW7", assignmentName: "Inheritance", category: "Homework",
                      scoreEarned: 19, maxScore: 20, dateDue: new Date("2023-10-13") },
                    { assignmentID: "HW8", assignmentName: "File I/O", category: "Homework",
                      scoreEarned: 16, maxScore: 20, dateDue: new Date("2023-10-20") },
                    // Quizzes (4 quizzes) - all graded
                    { assignmentID: "Q1", assignmentName: "Quiz 1", category: "Quizzes",
                      scoreEarned: 8, maxScore: 10, dateDue: new Date("2023-09-15") },
                    { assignmentID: "Q2", assignmentName: "Quiz 2", category: "Quizzes",
                      scoreEarned: 9, maxScore: 10, dateDue: new Date("2023-10-01") },
                    { assignmentID: "Q3", assignmentName: "Quiz 3", category: "Quizzes",
                      scoreEarned: 7, maxScore: 10, dateDue: new Date("2023-10-15") },
                    { assignmentID: "Q4", assignmentName: "Quiz 4", category: "Quizzes",
                      scoreEarned: 10, maxScore: 10, dateDue: new Date("2023-11-01") },
                    // Midterm - graded
                    { assignmentID: "MID", assignmentName: "Midterm Exam", category: "Midterm",
                      scoreEarned: 82, maxScore: 100, dateDue: new Date("2023-10-20") },
                    // Final - graded
                    { assignmentID: "FIN", assignmentName: "Final Exam", category: "Final",
                      scoreEarned: 88, maxScore: 100, dateDue: new Date("2023-12-15") }
                ]
            }
        });

        const result = calculateWorstCase(testData);

        // Homework: (18+17+19+16+18+17+19+16)/(20*8) = 140/160 = 87.5%
        // Quizzes: (8+9+7+10)/(10*4) = 34/40 = 85%
        // Midterm: 82/100 = 82%
        // Final: 88/100 = 88%
        // Weighted: (87.5*30 + 85*20 + 82*20 + 88*30) / 100 = 86.05%
        expect(result).toBeCloseTo(86.05, 1);
    });

    // Test 2: Some assignments ungraded (null scores)
    it("should assume 0% on ungraded assignments", () => {
        const testData = createTestData({
            rubric: {
                rubricID: "RUB_CS201",
                courseID: "CS201",
                categories: [
                    { category: "Labs", weight: 25 },
                    { category: "Projects", weight: 35 },
                    { category: "Midterm", weight: 15 },
                    { category: "Final", weight: 25 }
                ]
            },
            grades: {
                studentID: "STU002",
                courseID: "CS201",
                assignments: [
                    // Labs (6 labs) - all graded
                    { assignmentID: "L1", assignmentName: "Lab 1: Setup", category: "Labs",
                      scoreEarned: 10, maxScore: 10, dateDue: new Date("2023-09-05") },
                    { assignmentID: "L2", assignmentName: "Lab 2: Git", category: "Labs",
                      scoreEarned: 9, maxScore: 10, dateDue: new Date("2023-09-12") },
                    { assignmentID: "L3", assignmentName: "Lab 3: Testing", category: "Labs",
                      scoreEarned: 8, maxScore: 10, dateDue: new Date("2023-09-19") },
                    { assignmentID: "L4", assignmentName: "Lab 4: Debugging", category: "Labs",
                      scoreEarned: 10, maxScore: 10, dateDue: new Date("2023-09-26") },
                    { assignmentID: "L5", assignmentName: "Lab 5: Profiling", category: "Labs",
                      scoreEarned: 9, maxScore: 10, dateDue: new Date("2023-10-03") },
                    { assignmentID: "L6", assignmentName: "Lab 6: Deployment", category: "Labs",
                      scoreEarned: 8, maxScore: 10, dateDue: new Date("2023-10-10") },
                    // Projects (3 projects) - 2 graded, 1 ungraded
                    { assignmentID: "P1", assignmentName: "Project 1: CLI Tool", category: "Projects",
                      scoreEarned: 85, maxScore: 100, dateDue: new Date("2023-09-30") },
                    { assignmentID: "P2", assignmentName: "Project 2: Web App", category: "Projects",
                      scoreEarned: 78, maxScore: 100, dateDue: new Date("2023-10-31") },
                    { assignmentID: "P3", assignmentName: "Project 3: API", category: "Projects",
                      scoreEarned: null, maxScore: 100, dateDue: new Date("2023-11-30") }, // Assume 0%
                    // Midterm - graded
                    { assignmentID: "MID", assignmentName: "Midterm Exam", category: "Midterm",
                      scoreEarned: 76, maxScore: 100, dateDue: new Date("2023-10-15") },
                    // Final - ungraded
                    { assignmentID: "FIN", assignmentName: "Final Exam", category: "Final",
                      scoreEarned: null, maxScore: 100, dateDue: new Date("2023-12-15") } // Assume 0%
                ]
            }
        });

        const result = calculateWorstCase(testData);

        // Labs: (10+9+8+10+9+8)/60 = 54/60 = 90%
        // Projects: (85+78+0)/300 = 163/300 = 54.33%
        // Midterm: 76/100 = 76%
        // Final: 0/100 = 0%
        // Weighted: (90*25 + 54.33*35 + 76*15 + 0*25) / 100 = 52.92%
        expect(result).toBeCloseTo(52.92, 1);
    });

    // Test 3: All assignments in category are ungraded
    it("should return 0% when all assignments are ungraded", () => {
        const testData = createTestData({
            rubric: {
                rubricID: "RUB_MATH301",
                courseID: "MATH301",
                categories: [
                    { category: "Homework", weight: 20 },
                    { category: "Quizzes", weight: 20 },
                    { category: "Midterms", weight: 30 },
                    { category: "Final", weight: 30 }
                ]
            },
            grades: {
                studentID: "STU003",
                courseID: "MATH301",
                assignments: [
                    // Homework (8 assignments) - all ungraded
                    { assignmentID: "HW1", assignmentName: "Limits", category: "Homework",
                      scoreEarned: null, maxScore: 25, dateDue: new Date("2023-09-08") },
                    { assignmentID: "HW2", assignmentName: "Derivatives", category: "Homework",
                      scoreEarned: null, maxScore: 25, dateDue: new Date("2023-09-15") },
                    { assignmentID: "HW3", assignmentName: "Chain Rule", category: "Homework",
                      scoreEarned: null, maxScore: 25, dateDue: new Date("2023-09-22") },
                    { assignmentID: "HW4", assignmentName: "Applications", category: "Homework",
                      scoreEarned: null, maxScore: 25, dateDue: new Date("2023-09-29") },
                    { assignmentID: "HW5", assignmentName: "Integrals", category: "Homework",
                      scoreEarned: null, maxScore: 25, dateDue: new Date("2023-10-06") },
                    { assignmentID: "HW6", assignmentName: "Integration Techniques", category: "Homework",
                      scoreEarned: null, maxScore: 25, dateDue: new Date("2023-10-13") },
                    { assignmentID: "HW7", assignmentName: "Series", category: "Homework",
                      scoreEarned: null, maxScore: 25, dateDue: new Date("2023-10-20") },
                    { assignmentID: "HW8", assignmentName: "Convergence", category: "Homework",
                      scoreEarned: null, maxScore: 25, dateDue: new Date("2023-10-27") },
                    // Quizzes (5 quizzes) - all ungraded
                    { assignmentID: "Q1", assignmentName: "Quiz 1", category: "Quizzes",
                      scoreEarned: null, maxScore: 20, dateDue: new Date("2023-09-12") },
                    { assignmentID: "Q2", assignmentName: "Quiz 2", category: "Quizzes",
                      scoreEarned: null, maxScore: 20, dateDue: new Date("2023-09-26") },
                    { assignmentID: "Q3", assignmentName: "Quiz 3", category: "Quizzes",
                      scoreEarned: null, maxScore: 20, dateDue: new Date("2023-10-10") },
                    { assignmentID: "Q4", assignmentName: "Quiz 4", category: "Quizzes",
                      scoreEarned: null, maxScore: 20, dateDue: new Date("2023-10-24") },
                    { assignmentID: "Q5", assignmentName: "Quiz 5", category: "Quizzes",
                      scoreEarned: null, maxScore: 20, dateDue: new Date("2023-11-07") },
                    // Midterms (2 exams) - all ungraded
                    { assignmentID: "M1", assignmentName: "Midterm 1", category: "Midterms",
                      scoreEarned: null, maxScore: 100, dateDue: new Date("2023-10-01") },
                    { assignmentID: "M2", assignmentName: "Midterm 2", category: "Midterms",
                      scoreEarned: null, maxScore: 100, dateDue: new Date("2023-11-01") },
                    // Final - ungraded
                    { assignmentID: "FIN", assignmentName: "Final Exam", category: "Final",
                      scoreEarned: null, maxScore: 200, dateDue: new Date("2023-12-15") }
                ]
            }
        });

        const result = calculateWorstCase(testData);

        // All assignments assume 0% in worst case
        // Homework: 0/200 = 0%
        // Quizzes: 0/100 = 0%
        // Midterms: 0/200 = 0%
        // Final: 0/200 = 0%
        // Weighted: (0*20 + 0*20 + 0*30 + 0*30) / 100 = 0%
        expect(result).toBe(0);
    });

    // Test 4: Multiple categories with mixed grading status
    it("should handle multiple categories correctly", () => {
        const testData = createTestData({
            rubric: {
                rubricID: "RUB_PHYS201",
                courseID: "PHYS201",
                categories: [
                    { category: "Homework", weight: 15 },
                    { category: "Labs", weight: 25 },
                    { category: "Midterms", weight: 30 },
                    { category: "Final", weight: 30 }
                ]
            },
            grades: {
                studentID: "STU004",
                courseID: "PHYS201",
                assignments: [
                    // Homework (6 assignments) - mixed graded/ungraded
                    { assignmentID: "HW1", assignmentName: "Kinematics", category: "Homework",
                      scoreEarned: 18, maxScore: 20, dateDue: new Date("2023-09-08") },
                    { assignmentID: "HW2", assignmentName: "Dynamics", category: "Homework",
                      scoreEarned: 16, maxScore: 20, dateDue: new Date("2023-09-15") },
                    { assignmentID: "HW3", assignmentName: "Energy", category: "Homework",
                      scoreEarned: 19, maxScore: 20, dateDue: new Date("2023-09-22") },
                    { assignmentID: "HW4", assignmentName: "Momentum", category: "Homework",
                      scoreEarned: null, maxScore: 20, dateDue: new Date("2023-09-29") }, // Assume 0%
                    { assignmentID: "HW5", assignmentName: "Rotation", category: "Homework",
                      scoreEarned: null, maxScore: 20, dateDue: new Date("2023-10-06") }, // Assume 0%
                    { assignmentID: "HW6", assignmentName: "Oscillations", category: "Homework",
                      scoreEarned: null, maxScore: 20, dateDue: new Date("2023-10-13") }, // Assume 0%
                    // Labs (8 labs) - all graded
                    { assignmentID: "L1", assignmentName: "Free Fall", category: "Labs",
                      scoreEarned: 23, maxScore: 25, dateDue: new Date("2023-09-10") },
                    { assignmentID: "L2", assignmentName: "Projectile Motion", category: "Labs",
                      scoreEarned: 22, maxScore: 25, dateDue: new Date("2023-09-17") },
                    { assignmentID: "L3", assignmentName: "Friction", category: "Labs",
                      scoreEarned: 24, maxScore: 25, dateDue: new Date("2023-09-24") },
                    { assignmentID: "L4", assignmentName: "Springs", category: "Labs",
                      scoreEarned: 21, maxScore: 25, dateDue: new Date("2023-10-01") },
                    { assignmentID: "L5", assignmentName: "Collisions", category: "Labs",
                      scoreEarned: 23, maxScore: 25, dateDue: new Date("2023-10-08") },
                    { assignmentID: "L6", assignmentName: "Rotational Motion", category: "Labs",
                      scoreEarned: 22, maxScore: 25, dateDue: new Date("2023-10-15") },
                    { assignmentID: "L7", assignmentName: "Pendulum", category: "Labs",
                      scoreEarned: 24, maxScore: 25, dateDue: new Date("2023-10-22") },
                    { assignmentID: "L8", assignmentName: "Waves", category: "Labs",
                      scoreEarned: 23, maxScore: 25, dateDue: new Date("2023-10-29") },
                    // Midterms (2 exams) - 1 graded, 1 ungraded
                    { assignmentID: "M1", assignmentName: "Midterm 1", category: "Midterms",
                      scoreEarned: 78, maxScore: 100, dateDue: new Date("2023-10-01") },
                    { assignmentID: "M2", assignmentName: "Midterm 2", category: "Midterms",
                      scoreEarned: null, maxScore: 100, dateDue: new Date("2023-11-01") }, // Assume 0%
                    // Final - ungraded
                    { assignmentID: "FIN", assignmentName: "Final Exam", category: "Final",
                      scoreEarned: null, maxScore: 150, dateDue: new Date("2023-12-15") } // Assume 0%
                ]
            }
        });

        const result = calculateWorstCase(testData);

        // Homework: (18+16+19+0+0+0)/120 = 53/120 = 44.17%
        // Labs: (23+22+24+21+23+22+24+23)/200 = 182/200 = 91%
        // Midterms: (78+0)/200 = 78/200 = 39%
        // Final: 0/150 = 0%
        // Weighted: (44.17*15 + 91*25 + 39*30 + 0*30) / 100 = 41.03%
        expect(result).toBeCloseTo(41.03, 1);
    });

    // Test 5: No assignments at all
    it("should return 0 when no categories have assignments", () => {
        const testData = createTestData({
            rubric: {
                rubricID: "RUB_CHEM101",
                courseID: "CHEM101",
                categories: [
                    { category: "Homework", weight: 20 },
                    { category: "Labs", weight: 30 },
                    { category: "Midterm", weight: 20 },
                    { category: "Final", weight: 30 }
                ]
            },
            grades: {
                studentID: "STU005",
                courseID: "CHEM101",
                assignments: [] // No assignments at all - early in semester
            }
        });

        const result = calculateWorstCase(testData);

        // No assignments means no weight used, returns 0
        expect(result).toBe(0);
    });

    // Test 6: Drop lowest with ungraded assignments (worst case assumes 0% on ungraded)
    it("should apply drop lowest after assuming 0% on ungraded", () => {
        const testData = createTestData({
            rubric: {
                rubricID: "RUB_ENG201",
                courseID: "ENG201",
                categories: [
                    { category: "Essays", weight: 40, dropLowest: 1 },
                    { category: "Quizzes", weight: 30, dropLowest: 2 },
                    { category: "Final Paper", weight: 30 }
                ]
            },
            grades: {
                studentID: "STU006",
                courseID: "ENG201",
                assignments: [
                    // Essays (4 essays) - 3 graded, 1 ungraded, drop lowest 1
                    { assignmentID: "E1", assignmentName: "Narrative Essay", category: "Essays",
                      scoreEarned: 85, maxScore: 100, dateDue: new Date("2023-09-15") },
                    { assignmentID: "E2", assignmentName: "Argumentative Essay", category: "Essays",
                      scoreEarned: 78, maxScore: 100, dateDue: new Date("2023-10-01") },
                    { assignmentID: "E3", assignmentName: "Research Essay", category: "Essays",
                      scoreEarned: 92, maxScore: 100, dateDue: new Date("2023-10-15") },
                    { assignmentID: "E4", assignmentName: "Synthesis Essay", category: "Essays",
                      scoreEarned: null, maxScore: 100, dateDue: new Date("2023-11-01") }, // Assume 0%
                    // Quizzes (6 quizzes) - 4 graded, 2 ungraded, drop lowest 2
                    { assignmentID: "Q1", assignmentName: "Grammar Quiz", category: "Quizzes",
                      scoreEarned: 18, maxScore: 20, dateDue: new Date("2023-09-08") },
                    { assignmentID: "Q2", assignmentName: "Vocabulary Quiz", category: "Quizzes",
                      scoreEarned: 16, maxScore: 20, dateDue: new Date("2023-09-22") },
                    { assignmentID: "Q3", assignmentName: "Citation Quiz", category: "Quizzes",
                      scoreEarned: 19, maxScore: 20, dateDue: new Date("2023-10-06") },
                    { assignmentID: "Q4", assignmentName: "Style Quiz", category: "Quizzes",
                      scoreEarned: 17, maxScore: 20, dateDue: new Date("2023-10-20") },
                    { assignmentID: "Q5", assignmentName: "Rhetoric Quiz", category: "Quizzes",
                      scoreEarned: null, maxScore: 20, dateDue: new Date("2023-11-03") }, // Assume 0%
                    { assignmentID: "Q6", assignmentName: "Analysis Quiz", category: "Quizzes",
                      scoreEarned: null, maxScore: 20, dateDue: new Date("2023-11-17") }, // Assume 0%
                    // Final Paper - ungraded
                    { assignmentID: "FP", assignmentName: "Final Research Paper", category: "Final Paper",
                      scoreEarned: null, maxScore: 100, dateDue: new Date("2023-12-10") } // Assume 0%
                ]
            }
        });

        const result = calculateWorstCase(testData);

        // Essays: scores [85, 78, 92, 0], drop 1 lowest (0) -> [85, 78, 92] = 255/300 = 85%
        // Quizzes: scores [18, 16, 19, 17, 0, 0], drop 2 lowest (0, 0) -> [18, 16, 19, 17] = 70/80 = 87.5%
        // Final Paper: 0/100 = 0%
        // Weighted: (85*40 + 87.5*30 + 0*30) / 100 = 60.25%
        expect(result).toBeCloseTo(60.25, 1);
    });

    // Test 7: Filter out assignments with null maxScore
    it("should filter out assignments with null maxScore", () => {
        const testData = createTestData({
            rubric: {
                rubricID: "RUB_ART101",
                courseID: "ART101",
                categories: [
                    { category: "Projects", weight: 50 },
                    { category: "Quizzes", weight: 20 },
                    { category: "Final", weight: 30 }
                ]
            },
            grades: {
                studentID: "STU007",
                courseID: "ART101",
                assignments: [
                    // Projects (5 projects) - mixed with some null maxScore
                    { assignmentID: "P1", assignmentName: "Sketch Portfolio", category: "Projects",
                      scoreEarned: 88, maxScore: 100, dateDue: new Date("2023-09-15") },
                    { assignmentID: "P2", assignmentName: "Color Study", category: "Projects",
                      scoreEarned: 92, maxScore: 100, dateDue: new Date("2023-09-29") },
                    { assignmentID: "P3", assignmentName: "Perspective Drawing", category: "Projects",
                      scoreEarned: 85, maxScore: 100, dateDue: new Date("2023-10-13") },
                    { assignmentID: "P4", assignmentName: "Mixed Media", category: "Projects",
                      scoreEarned: null, maxScore: 100, dateDue: new Date("2023-10-27") }, // Assume 0%
                    { assignmentID: "P5", assignmentName: "Final Portfolio", category: "Projects",
                      scoreEarned: null, maxScore: null, dateDue: new Date("2023-11-10") }, // Filter out (null maxScore)
                    // Quizzes - some with null maxScore
                    { assignmentID: "Q1", assignmentName: "Quiz 1", category: "Quizzes",
                      scoreEarned: 8, maxScore: 10, dateDue: new Date("2023-09-10") },
                    { assignmentID: "Q2", assignmentName: "Quiz 2", category: "Quizzes",
                      scoreEarned: null, maxScore: null, dateDue: new Date("2023-09-24") }, // Filter out
                    { assignmentID: "Q3", assignmentName: "Quiz 3", category: "Quizzes",
                      scoreEarned: 9, maxScore: 10, dateDue: new Date("2023-10-08") },
                    { assignmentID: "Q4", assignmentName: "Quiz 4", category: "Quizzes",
                      scoreEarned: null, maxScore: 10, dateDue: new Date("2023-10-22") }, // Assume 0%
                    // Final - graded
                    { assignmentID: "FIN", assignmentName: "Final Exhibition", category: "Final",
                      scoreEarned: 90, maxScore: 100, dateDue: new Date("2023-12-15") }
                ]
            }
        });

        const result = calculateWorstCase(testData);

        // Projects: [88, 92, 85, 0] (P5 filtered out) = 265/400 = 66.25%
        // Quizzes: [8, 9, 0] (Q2 filtered out) = 17/30 = 56.67%
        // Final: 90/100 = 90%
        // Weighted: (66.25*50 + 56.67*20 + 90*30) / 100 = 71.46%
        expect(result).toBeCloseTo(71.46, 1);
    });

    // Test 8: Skipped categories (no assignments in rubric category)
    it("should skip categories with no assignments and normalize weight", () => {
        const testData = createTestData({
            rubric: {
                rubricID: "RUB_HIST101",
                courseID: "HIST101",
                categories: [
                    { category: "Reading Responses", weight: 20 },
                    { category: "Papers", weight: 30 },
                    { category: "Midterm", weight: 20 },
                    { category: "Final", weight: 30 }
                ]
            },
            grades: {
                studentID: "STU008",
                courseID: "HIST101",
                assignments: [
                    // Reading Responses (10 responses) - all graded
                    { assignmentID: "RR1", assignmentName: "Week 1 Response", category: "Reading Responses",
                      scoreEarned: 9, maxScore: 10, dateDue: new Date("2023-09-08") },
                    { assignmentID: "RR2", assignmentName: "Week 2 Response", category: "Reading Responses",
                      scoreEarned: 8, maxScore: 10, dateDue: new Date("2023-09-15") },
                    { assignmentID: "RR3", assignmentName: "Week 3 Response", category: "Reading Responses",
                      scoreEarned: 10, maxScore: 10, dateDue: new Date("2023-09-22") },
                    { assignmentID: "RR4", assignmentName: "Week 4 Response", category: "Reading Responses",
                      scoreEarned: 7, maxScore: 10, dateDue: new Date("2023-09-29") },
                    { assignmentID: "RR5", assignmentName: "Week 5 Response", category: "Reading Responses",
                      scoreEarned: 9, maxScore: 10, dateDue: new Date("2023-10-06") },
                    { assignmentID: "RR6", assignmentName: "Week 6 Response", category: "Reading Responses",
                      scoreEarned: 8, maxScore: 10, dateDue: new Date("2023-10-13") },
                    { assignmentID: "RR7", assignmentName: "Week 7 Response", category: "Reading Responses",
                      scoreEarned: 10, maxScore: 10, dateDue: new Date("2023-10-20") },
                    { assignmentID: "RR8", assignmentName: "Week 8 Response", category: "Reading Responses",
                      scoreEarned: 9, maxScore: 10, dateDue: new Date("2023-10-27") },
                    { assignmentID: "RR9", assignmentName: "Week 9 Response", category: "Reading Responses",
                      scoreEarned: 8, maxScore: 10, dateDue: new Date("2023-11-03") },
                    { assignmentID: "RR10", assignmentName: "Week 10 Response", category: "Reading Responses",
                      scoreEarned: 9, maxScore: 10, dateDue: new Date("2023-11-10") },
                    // Papers - NO ASSIGNMENTS (category skipped)
                    // Midterm - graded
                    { assignmentID: "MID", assignmentName: "Midterm Exam", category: "Midterm",
                      scoreEarned: 82, maxScore: 100, dateDue: new Date("2023-10-15") },
                    // Final - ungraded
                    { assignmentID: "FIN", assignmentName: "Final Exam", category: "Final",
                      scoreEarned: null, maxScore: 100, dateDue: new Date("2023-12-15") } // Assume 0%
                ]
            }
        });

        const result = calculateWorstCase(testData);

        // Reading Responses: (9+8+10+7+9+8+10+9+8+9)/100 = 87/100 = 87%
        // Papers: skipped (no assignments)
        // Midterm: 82/100 = 82%
        // Final: 0/100 = 0%
        // Weight used: 20 + 20 + 30 = 70 (Papers skipped)
        // Weighted: (87*20 + 82*20 + 0*30) / 70 = 48.29%
        expect(result).toBeCloseTo(48.29, 1);
    });

})
