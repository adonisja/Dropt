import { getClient } from './data-client';
import { logger } from '@/lib/utils/logger';

export async function seedTestCourses(studentId: string) {
    logger.info('Starting test data seed', {
        source: 'seed-data.seedTestCourses',
        userId: studentId
    });
    
    try {
        const client = getClient();

        const courses = [
            {
                id: 'CS101',
                name: 'Intro to Computer Science',
                dept: 'CS',
                passing: 70,
                stress: 3,
                time: 5,
                impact: 4,
                wellbeing: 8,
                categories: [
                    { name: 'Homework', weight: 0.3, drop: 1 },
                    { name: 'Midterm', weight: 0.3, drop: 0 },
                    { name: 'Final', weight: 0.4, drop: 0 }
                ],
                assignments: [
                    { name: 'HW 1', cat: 'Homework', max: 100, score: 95 },
                    { name: 'HW 2', cat: 'Homework', max: 100, score: 98 },
                    { name: 'HW 3', cat: 'Homework', max: 100, score: 92 },
                    { name: 'Midterm', cat: 'Midterm', max: 100, score: 88 },
                    { name: 'Final', cat: 'Final', max: 100, score: null } // Not yet taken
                ]
            },
            {
                id: 'MATH201',
                name: 'Calculus II',
                dept: 'MATH',
                passing: 70,
                stress: 9,
                time: 15,
                impact: 9,
                wellbeing: 3,
                categories: [
                    { name: 'Quizzes', weight: 0.2, drop: 2 },
                    { name: 'Exams', weight: 0.8, drop: 0 }
                ],
                assignments: [
                    { name: 'Quiz 1', cat: 'Quizzes', max: 20, score: 12 },
                    { name: 'Quiz 2', cat: 'Quizzes', max: 20, score: 15 },
                    { name: 'Quiz 3', cat: 'Quizzes', max: 20, score: 10 },
                    { name: 'Exam 1', cat: 'Exams', max: 100, score: 65 },
                    { name: 'Exam 2', cat: 'Exams', max: 100, score: null }
                ]
            },
            {
                id: 'HIST105',
                name: 'World History',
                dept: 'HIST',
                passing: 60,
                stress: 2,
                time: 3,
                impact: 2,
                wellbeing: 9,
                categories: [
                    { name: 'Essays', weight: 0.6, drop: 0 },
                    { name: 'Participation', weight: 0.4, drop: 0 }
                ],
                assignments: [
                    { name: 'Essay 1', cat: 'Essays', max: 100, score: 85 },
                    { name: 'Essay 2', cat: 'Essays', max: 100, score: 88 },
                    { name: 'Participation', cat: 'Participation', max: 100, score: 100 }
                ]
            },
            {
                id: 'PHYS101',
                name: 'General Physics',
                dept: 'PHYS',
                passing: 70,
                stress: 10,
                time: 12,
                impact: 8,
                wellbeing: 2,
                categories: [
                    { name: 'Labs', weight: 0.25, drop: 0 },
                    { name: 'Tests', weight: 0.75, drop: 0 }
                ],
                assignments: [
                    { name: 'Lab 1', cat: 'Labs', max: 50, score: 45 },
                    { name: 'Lab 2', cat: 'Labs', max: 50, score: 0 }, // Missed
                    { name: 'Test 1', cat: 'Tests', max: 100, score: 42 },
                    { name: 'Test 2', cat: 'Tests', max: 100, score: 55 }
                ]
            }
        ];

        for (const course of courses) {
            try {
                // 1. Create Course
                logger.debug(`Creating seed course: ${course.name}`, {
                    source: 'seed-data.seedTestCourses',
                    userId: studentId,
                    data: { courseId: course.id }
                });
                const { data: newCourse, errors: courseErrors } = await client.models.StudentCourse.create({
                    studentId,
                    courseId: course.id,
                    courseName: course.name,
                    department: course.dept,
                    passingGrade: course.passing,
                    stressLevel: course.stress,
                    weeklyTimeInvestment: course.time,
                    impactOnOtherCourses: course.impact,
                    overallWellbeing: course.wellbeing,
                    isRequired: true
                });

                if (courseErrors) {
                    logger.error(`Failed to create seed course: ${course.name}`, {
                        source: 'seed-data.seedTestCourses',
                        userId: studentId,
                        data: { errors: courseErrors, courseId: course.id }
                    });
                    throw new Error(`Failed to create course ${course.name}: ${JSON.stringify(courseErrors)}`);
                }

                const studentCourseId = `${studentId}#${course.id}`;

                // 2. Create Categories
                for (const cat of course.categories) {
                    const { errors: catErrors } = await client.models.GradeCategory.create({
                        studentCourseId,
                        category: cat.name,
                        weight: cat.weight,
                        dropLowest: cat.drop
                    });
                    if (catErrors) {
                        logger.warn(`Failed to create seed category: ${cat.name}`, {
                            source: 'seed-data.seedTestCourses',
                            userId: studentId,
                            data: { errors: catErrors, courseId: course.id }
                        });
                    }
                }

                // 3. Create Assignments
                for (const assign of course.assignments) {
                    const { errors: assignErrors } = await client.models.Assignment.create({
                        studentCourseId,
                        assignmentId: assign.name.replace(/\s+/g, '-').toLowerCase(),
                        assignmentName: assign.name,
                        category: assign.cat,
                        maxScore: assign.max,
                        scoreEarned: assign.score,
                        dateDue: new Date().toISOString().split('T')[0], // Due today
                        dateAssigned: new Date().toISOString().split('T')[0]
                    });
                    if (assignErrors) {
                        logger.warn(`Failed to create seed assignment: ${assign.name}`, {
                            source: 'seed-data.seedTestCourses',
                            userId: studentId,
                            data: { errors: assignErrors, courseId: course.id }
                        });
                    }
                }

            } catch (error) {
                logger.error(`Error seeding course: ${course.name}`, {
                    source: 'seed-data.seedTestCourses',
                    userId: studentId,
                    data: { error, courseId: course.id }
                });
                throw error;
            }
        }

        logger.info('Test data seed completed successfully', {
            source: 'seed-data.seedTestCourses',
            userId: studentId,
            data: { coursesSeeded: courses.length }
        });
    } catch (e) {
        logger.error('Fatal error in seed data process', {
            source: 'seed-data.seedTestCourses',
            userId: studentId,
            data: { error: e }
        });
        throw e;
    }
}
