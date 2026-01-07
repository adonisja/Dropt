// === COURSE METADATA ===
export interface Course {
   courseID: string;
   courseName: string;
   department: string;
   // departmentID: string; // for future extension
}

// === GRADING RUBRIC ===
export interface GradeCategory {
   category: string; // e.g., Homework, Quiz, Test
   weight: number; // percentage weight of this category
   dropLowest?: number | null; // optional to drop lowest N scores or undefined
   description?: string; // optional description
}

export interface GradeRubric {
   rubricID: string;
   courseID: string;
   categories: GradeCategory[];
}

// === STUDENT GRADES ===
export interface Assignment {
   assignmentID: string;
   assignmentName: string;
   category: string; // will match GradeCategory.category
   scoreEarned: number | null;
   maxScore: number | null;
   dateAssigned?: Date;
   dateDue: Date;
   dateSubmitted?: Date; // optional submission date
   description?: string; // optional description
}

export interface StudentGrades {
   studentID: string;
   courseID: string;
   assignments: Assignment[];
}

// === COURSE CONTEXT ===
export interface CourseContext {
   semester: string; // e.g., Fall, Spring
   year: number;
   instructorID: string;
   location: string; // could be physical or virtual
   hoursPerWeek: number;
   stressLevel: number; // 1-10 scale
   totalCreditHours?: number; // Optional info for Academic Planning
}

// === STUDENT COURSE DATA AGGREGATION ===
export interface StudentCourseData {
   courseID: string;
   studentID: string
   isRequired: boolean;
   rubric: GradeRubric;
   grades: StudentGrades;
   passingGrade?: number; // passing mark for the course
   contextData: CourseContext;
   expectedGraduation?: Date;
}