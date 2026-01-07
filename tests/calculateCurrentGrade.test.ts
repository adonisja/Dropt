import { describe, it, expect } from 'vitest';
import { calculateCurrentGrade } from '../lib/logic/calculateCurrentGrade';
import type { StudentCourseData } from '../lib/types';

describe('calculateCurrentGrade', () => {
  it('should calculate grade correctly with all categories graded', () => {
    // Arrange - Set up test data
    const testData: StudentCourseData = {
      courseID: "TEST101",
      studentID: "TEST001",
      isRequired: true,
      rubric: {
        rubricID: "RUB_TEST",
        courseID: "TEST101",
        categories: [
          { category: "Homework", weight: 50 },
          { category: "Final", weight: 50 }
        ]
      },
      grades: {
        studentID: "TEST001",
        courseID: "TEST101",
        assignments: [
          // Homework: 100% (20/20)
          { 
            assignmentID: "A001", 
            assignmentName: "HW1", 
            category: "Homework",
            scoreEarned: 20, 
            maxScore: 20, 
            dateDue: new Date("2023-09-10") 
          },
          // Final: 80% (80/100)
          { 
            assignmentID: "A002", 
            assignmentName: "Final", 
            category: "Final",
            scoreEarned: 80, 
            maxScore: 100, 
            dateDue: new Date("2023-12-15") 
          }
        ]
      },
      contextData: {
        semester: "Fall",
        year: 2023,
        instructorID: "INS001",
        location: "Online",
        hoursPerWeek: 5,
        stressLevel: 3
      }
    };

    // Act - Run the function
    const result = calculateCurrentGrade(testData);

    // Assert - Check the result
    // Expected: (100 * 50 + 80 * 50) / 100 = 90
    expect(result).toBe(90);
  });

  it('should ignore ungraded assignments (null scores)', () => {
    const testData: StudentCourseData = {
      courseID: "TEST101",
      studentID: "TEST001",
      isRequired: true,
      rubric: {
        rubricID: "RUB_TEST",
        courseID: "TEST101",
        categories: [
          { category: "Homework", weight: 50 },
          { category: "Final", weight: 50 }
        ]
      },
      grades: {
        studentID: "TEST001",
        courseID: "TEST101",
        assignments: [
          { 
            assignmentID: "A001", 
            assignmentName: "HW1", 
            category: "Homework",
            scoreEarned: 20, 
            maxScore: 20, 
            dateDue: new Date("2023-09-10") 
          },
          // Final not graded yet - should be ignored
          { 
            assignmentID: "A002", 
            assignmentName: "Final", 
            category: "Final",
            scoreEarned: null,  // Not graded!
            maxScore: 100, 
            dateDue: new Date("2023-12-15") 
          }
        ]
      },
      contextData: {
        semester: "Fall",
        year: 2023,
        instructorID: "INS001",
        location: "Online",
        hoursPerWeek: 5,
        stressLevel: 3
      }
    };

    const result = calculateCurrentGrade(testData);

    // Expected: Only HW counted (100%), normalized to 100
    expect(result).toBe(100);
  });

  it('should drop lowest scores when dropLowest is specified', () => {
    const testData: StudentCourseData = {
      courseID: "TEST101",
      studentID: "TEST001",
      isRequired: true,
      rubric: {
        rubricID: "RUB_TEST",
        courseID: "TEST101",
        categories: [
          { category: "Homework", weight: 100, dropLowest: 2 }
        ]
      },
      grades: {
        studentID: "TEST001",
        courseID: "TEST101",
        assignments: [
          // 5 homeworks: 60%, 70%, 80%, 90%, 100%
          // Drop 2 lowest (60%, 70%), keep 80%, 90%, 100%
          { assignmentID: "A001", assignmentName: "HW1", category: "Homework",
            scoreEarned: 12, maxScore: 20, dateDue: new Date("2023-09-01") }, // 60%
          { assignmentID: "A002", assignmentName: "HW2", category: "Homework",
            scoreEarned: 14, maxScore: 20, dateDue: new Date("2023-09-08") }, // 70%
          { assignmentID: "A003", assignmentName: "HW3", category: "Homework",
            scoreEarned: 16, maxScore: 20, dateDue: new Date("2023-09-15") }, // 80%
          { assignmentID: "A004", assignmentName: "HW4", category: "Homework",
            scoreEarned: 18, maxScore: 20, dateDue: new Date("2023-09-22") }, // 90%
          { assignmentID: "A005", assignmentName: "HW5", category: "Homework",
            scoreEarned: 20, maxScore: 20, dateDue: new Date("2023-09-29") }  // 100%
        ]
      },
      contextData: {
        semester: "Fall",
        year: 2023,
        instructorID: "INS001",
        location: "Online",
        hoursPerWeek: 5,
        stressLevel: 3
      }
    };

    const result = calculateCurrentGrade(testData);

    // Expected: (16 + 18 + 20) / (20 + 20 + 20) * 100 = 54/60 * 100 = 90%
    expect(result).toBe(90);
  });

  it('should keep minimum of 2 assignments when dropping', () => {
    const testData: StudentCourseData = {
      courseID: "TEST101",
      studentID: "TEST001",
      isRequired: true,
      rubric: {
        rubricID: "RUB_TEST",
        courseID: "TEST101",
        categories: [
          { category: "Homework", weight: 100, dropLowest: 2 }
        ]
      },
      grades: {
        studentID: "TEST001",
        courseID: "TEST101",
        assignments: [
          // Only 3 graded - should drop 1, keep 2
          { assignmentID: "A001", assignmentName: "HW1", category: "Homework",
            scoreEarned: 10, maxScore: 20, dateDue: new Date("2023-09-01") }, // 50% - DROP
          { assignmentID: "A002", assignmentName: "HW2", category: "Homework",
            scoreEarned: 16, maxScore: 20, dateDue: new Date("2023-09-08") }, // 80% - KEEP
          { assignmentID: "A003", assignmentName: "HW3", category: "Homework",
            scoreEarned: 20, maxScore: 20, dateDue: new Date("2023-09-15") }  // 100% - KEEP
        ]
      },
      contextData: {
        semester: "Fall",
        year: 2023,
        instructorID: "INS001",
        location: "Online",
        hoursPerWeek: 5,
        stressLevel: 3
      }
    };

    const result = calculateCurrentGrade(testData);

    // Expected: (16 + 20) / (20 + 20) * 100 = 36/40 * 100 = 90%
    expect(result).toBe(90);
  });

  it('should return 0 when no assignments are graded', () => {
    const testData: StudentCourseData = {
      courseID: "TEST101",
      studentID: "TEST001",
      isRequired: true,
      rubric: {
        rubricID: "RUB_TEST",
        courseID: "TEST101",
        categories: [
          { category: "Homework", weight: 100 }
        ]
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
      }
    };

    const result = calculateCurrentGrade(testData);
    expect(result).toBe(0);
  });
});