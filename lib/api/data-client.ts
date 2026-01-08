import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { StudentCourseData, GradeCategory, Assignment } from '@/lib/types';
import { logger } from '@/lib/utils/logger';

// Lazy-initialize the client to ensure Amplify is configured first
let _client: ReturnType<typeof generateClient<Schema>> | null = null;

function getClient() {
    if (!_client) {
        logger.info('Initializing GraphQL client with userPool auth mode', { source: 'data-client.getClient' });
        try {
            _client = generateClient<Schema>({
                authMode: 'userPool'
            });
            logger.info('Client initialized successfully', { 
                source: 'data-client.getClient',
                data: { availableModels: Object.keys(_client.models || {}) }
            });
        } catch (error) {
            logger.error('Failed to initialize GraphQL client', {
                source: 'data-client.getClient',
                data: { error }
            });
            throw error;
        }
    }
    return _client;
}

export interface CourseWithGrades {
    studentCourse: Schema['StudentCourse']['type'];
    categories: Schema['GradeCategory']['type'][];
    assignments: Schema['Assignment']['type'][];
}

/**
 * Fetch all courses for the current authenticated user
 */
export async function fetchStudentCourses(studentId: string): Promise<Schema['StudentCourse']['type'][]> {
    try {
        const { data, errors } = await getClient().models.StudentCourse.list({
            filter: {
                studentId: { eq: studentId }
            }
        });

        if (errors) {
            logger.error('GraphQL errors fetching courses', {
                source: 'fetchStudentCourses',
                userId: studentId,
                data: { errors }
            });
        }

        return data || [];
    } catch (error) {
        logger.error('Error fetching student courses', {
            source: 'fetchStudentCourses',
            userId: studentId,
            data: { error }
        });
        return [];
    }
}

/** 
 * ===========================================================================================
 * USER SETTINGS OPERATIONS
 * ===========================================================================================
 * 
*/

/**
 * Fetch user settings for a specific user
 * Returns null if no settings exists yet (first-time user)
 */
export async function fetchUserSettings(userId: string): Promise<Schema['UserSettings']['type'] | null> {
    try {
        const { data, errors } = await getClient().models.UserSettings.get({
            userId: userId
        });

        if (errors) {
            logger.error('Error fetching user settings', {
                source: 'fetchUserSettings',
                userId,
                data: { errors }
            });
            return null;
        }

        return data;
    } catch(error) {
        logger.error('Error fetching user settings', {
            source: 'fetchUserSettings',
            userId,
            data: { error }
        });
        return null;
    }
}

/**
 * Create user settings for a new user
 * Auto-detects current semester if not provided 
 */
export async function createUserSettings(
    userId: string,
    settings?: {
        currentSemester?: string;
        currentYear?: number;
        theme?: string;
        preferredStudyTimes?: string[];
        notificationPreferences?: string;
    }
): Promise<Schema['UserSettings']['type'] | null> {
    try {
        const { data, errors } = await getClient().models.UserSettings.create({
            userId,
            currentSemester: settings?.currentSemester,
            currentYear: settings?.currentYear || new Date().getFullYear(),
            theme: settings?.theme || 'light',
            preferredStudyTimes: settings?.preferredStudyTimes || [],
            notificationPreferences: settings?.notificationPreferences || 'email',
        });

        if (errors) {
            logger.error('Error creating user settings', {
                source: 'createUserSettings',
                userId,
                data: { errors, settings }
            });
            return null;
        }

        return data;
    } catch(error) {
        logger.error('Error creating user settings', {
            source: 'createUserSettings',
            userId,
            data: { error, settings }
        });
        return null;
    }
}

/**
 * Update user settings 
 */
export async function updateUserSettings(
    userId: string,
    updates: {
        currentSemester?: string,
        currentYear?: number,
        theme?: string,
        preferredStudyTimes?: string[],
        notificationPreferences?: string
    }
): Promise<Schema['UserSettings']['type'] | null> {
    try {
        const { data, errors } = await getClient().models.UserSettings.update({
            userId,
            ...updates
        });

        if (errors) {
            logger.error('Error updating user settings', {
                source: 'updateUserSettings',
                userId,
                data: { errors, updates }
            });
            return null;
        }

        return data
    } catch(error) {
        logger.error('Error updating user settings', {
            source: 'updateUserSettings',
            userId,
            data: { error, updates }
        });
        return null;
    }
}

/**
 * Get or create user settings
 * The main function to be used, ensuring settings always exists
 * Also runs legacy course migration if needed
 */
export async function getOrCreateUserSettings(
    userId: string,
    defaultSemester?: string,
    defaultYear?: number
): Promise<Schema['UserSettings']['type'] | null> {
    // Try to fetch existing settings
    let settings = await fetchUserSettings(userId);

    // If none exist, create with defaults
    if (!settings) {
        settings = await createUserSettings(userId, {
            currentSemester: defaultSemester,
            currentYear: defaultYear,
        });
    }

    // If settings exist BUT currentSemester is missing, update it
    else if (!settings.currentSemester && defaultSemester) {
        settings = await updateUserSettings(userId, {
            currentSemester: defaultSemester,
            currentYear: defaultYear || settings.currentYear
        });
    }

    // Check for semester transition
    if (settings) {
        const { needsSemesterTransition } = await import('@/lib/utils/semester-stats');
        const { detectCurrentSemester } = await import('@/lib/utils/semester-utils');
        
        if (needsSemesterTransition(settings.currentSemester, settings.currentYear)) {
            logger.info('Semester transition detected', {
                source: 'getOrCreateUserSettings',
                userId,
                data: {
                    currentSemester: settings.currentSemester,
                    currentYear: settings.currentYear
                }
            });
            
            // Get the new semester info
            const newSemesterInfo = detectCurrentSemester();
            
            // Calculate current semester completed/missed tasks before transition
            // This would typically be done by analyzing assignments, but for now we'll preserve the counts
            // In a full implementation, you'd fetch all current semester assignments and calculate these
            
            const { handleSemesterTransition } = await import('@/lib/utils/semester-stats');
            
            // For now, we just update the semester without adding to history
            // In production, you'd calculate completedCount and missedCount from actual assignment data
            await handleSemesterTransition(
                userId,
                0, // completedCount - would be calculated from assignments
                0, // missedCount - would be calculated from assignments
                newSemesterInfo.semester,
                newSemesterInfo.year
            );
            
            // Refetch settings after transition
            settings = await fetchUserSettings(userId);
        }
    }

    // Run legacy migration if not done yet
    // TODO: Uncomment after schema deployment completes
    /*
    if (settings && !settings.hasRunLegacyMigration) {
        // Import migration function dynamically to avoid circular deps
        const { migrateLegacyCourses } = await import('@/lib/utils/migrate-legacy-courses');
        
        logger.info('Running legacy course migration', {
            source: 'getOrCreateUserSettings',
            userId
        });
        const result = await migrateLegacyCourses(userId);
        
        if (result.success || result.migratedCount > 0) {
            logger.info('Legacy course migration complete', {
                source: 'getOrCreateUserSettings',
                userId,
                data: { migratedCount: result.migratedCount }
            });
            
            // Mark migration as complete
            settings = await updateUserSettings(userId, {
                hasRunLegacyMigration: true
            });
        } else {
            logger.error('Legacy course migration failed', {
                source: 'getOrCreateUserSettings',
                userId,
                data: { errors: result.errors }
            });
        }
    }
    */

    return settings;
}

//============================================================================================
/**
 * Fetch grade categories for a specific course
 */
export async function fetchGradeCategories(studentCourseId: string): Promise<Schema['GradeCategory']['type'][]> {
    try {
        const { data, errors } = await getClient().models.GradeCategory.list({
            filter: {
                studentCourseId: { eq: studentCourseId }
            }
        });

        if (errors) {
            logger.error('Error fetching grade categories', {
                source: 'fetchGradeCategories',
                data: { errors, studentCourseId }
            });
            return [];
        }

        return data || [];
    } catch (error) {
        logger.error('Error fetching grade categories', {
            source: 'fetchGradeCategories',
            data: { error, studentCourseId }
        });
        return [];
    }
}

/**
 * Fetch assignments for a specific course
 */
export async function fetchAssignments(studentCourseId: string): Promise<Schema['Assignment']['type'][]> {
    try {
        const { data, errors } = await getClient().models.Assignment.list({
            filter: {
                studentCourseId: { eq: studentCourseId }
            }
        });

        if (errors) {
            logger.error('Error fetching assignments', {
                source: 'fetchAssignments',
                data: { errors, studentCourseId }
            });
            return [];
        }

        return data || [];
    } catch (error) {
        logger.error('Error fetching assignments', {
            source: 'fetchAssignments',
            data: { error, studentCourseId }
        });
        return [];
    }
}

/**
 * Fetch complete course data including categories and assignments
 */
export async function fetchCompleteCourseData(
    studentId: string,
    courseId: string
): Promise<CourseWithGrades | null> {
    try {
        // Fetch the student course
        const { data: courseData, errors: courseErrors } = await getClient().models.StudentCourse.get({
            studentId,
            courseId
        });

        if (courseErrors || !courseData) {
            logger.error('Error fetching course data', {
                source: 'fetchCompleteCourseData',
                userId: studentId,
                data: { errors: courseErrors, courseId }
            });
            return null;
        }

        const studentCourseId = `${studentId}#${courseId}`;

        // Fetch categories and assignments in parallel
        const [categories, assignments] = await Promise.all([
            fetchGradeCategories(studentCourseId),
            fetchAssignments(studentCourseId)
        ]);

        return {
            studentCourse: courseData,
            categories,
            assignments
        };
    } catch (error) {
        logger.error('Error fetching complete course data', {
            source: 'fetchCompleteCourseData',
            userId: studentId,
            data: { error, courseId }
        });
        return null;
    }
}

/**
 * Transform DynamoDB data to StudentCourseData format for grade calculations
 */
export function transformToStudentCourseData(courseData: CourseWithGrades): StudentCourseData {
    const { studentCourse, categories, assignments } = courseData;

    // Transform categories to GradeCategory interface
    const gradeCategories: GradeCategory[] = categories.map(cat => ({
        category: cat.category,
        weight: cat.weight,
        dropLowest: cat.dropLowest ?? undefined,
        description: cat.description ?? undefined
    }));

    // Transform assignments to Assignment interface
    const gradeAssignments: Assignment[] = assignments.map(assign => ({
        assignmentID: assign.assignmentId,
        assignmentName: assign.assignmentName,
        category: assign.category,
        scoreEarned: assign.scoreEarned ?? null,
        maxScore: assign.maxScore,
        dateAssigned: assign.dateAssigned ? new Date(assign.dateAssigned) : undefined,
        dateDue: new Date(assign.dateDue),
        dateSubmitted: assign.dateSubmitted ? new Date(assign.dateSubmitted) : undefined,
        description: assign.description ?? undefined
    }));

    return {
        courseID: studentCourse.courseId,
        studentID: studentCourse.studentId,
        isRequired: studentCourse.isRequired ?? false,
        passingGrade: studentCourse.passingGrade ?? 60.0,
        rubric: {
            rubricID: `${studentCourse.studentId}#${studentCourse.courseId}`,
            courseID: studentCourse.courseId,
            categories: gradeCategories
        },
        grades: {
            studentID: studentCourse.studentId,
            courseID: studentCourse.courseId,
            assignments: gradeAssignments
        },
        contextData: {
            semester: 'Fall', // Default values - can be extended later
            year: new Date().getFullYear(),
            instructorID: '',
            location: '',
            hoursPerWeek: studentCourse.weeklyTimeInvestment ?? 0,
            stressLevel: 5, // Default - will add to schema later
            totalCreditHours: studentCourse.semesterCreditHours ?? undefined
        },
        expectedGraduation: studentCourse.expectedGraduation
            ? new Date(studentCourse.expectedGraduation)
            : undefined
    };
}

/**
 * Create a new course for a student
 */
export async function createStudentCourse(
    studentId: string,
    courseData: {
        courseId: string;
        courseName: string;
        department?: string;
        instructor?: string;
        instructorEmail?: string;
        officeHours?: string;
        classDays?: string;
        classTime?: string;
        isRequired?: boolean;
        passingGrade?: number;
    }
): Promise<Schema['StudentCourse']['type'] | null> {
    logger.debug('createStudentCourse called', { 
        source: 'createStudentCourse',
        userId: studentId,
        data: { courseId: courseData.courseId }
    });

    const client = getClient();

    if (!client.models) {
        logger.error('GraphQL client models undefined', {
            source: 'createStudentCourse',
            userId: studentId
        });
        throw new Error('GraphQL client models not available');
    }

    if (!client.models.StudentCourse) {
        logger.error('StudentCourse model not found', {
            source: 'createStudentCourse',
            userId: studentId,
            data: { availableModels: Object.keys(client.models) }
        });
        throw new Error('StudentCourse model not available');
    }

    try {
        logger.debug('Creating StudentCourse record', {
            source: 'createStudentCourse',
            userId: studentId,
            data: courseData
        });

        const createPromise = client.models.StudentCourse.create({
            studentId,
            courseId: courseData.courseId,
            courseName: courseData.courseName,
            department: courseData.department,
            instructor: courseData.instructor,
            instructorEmail: courseData.instructorEmail,
            officeHours: courseData.officeHours,
            classDays: courseData.classDays,
            classTime: courseData.classTime,
            isRequired: courseData.isRequired ?? false,
            passingGrade: courseData.passingGrade ?? 60.0
        });

        const result = await createPromise;

        const { data, errors } = result;

        if (errors) {
            logger.error('GraphQL errors creating course', {
                source: 'createStudentCourse',
                userId: studentId,
                data: { errors, courseData }
            });
            return null;
        }

        logger.info('StudentCourse created successfully', {
            source: 'createStudentCourse',
            userId: studentId,
            data: { courseId: courseData.courseId }
        });
        return data;
    } catch (error) {
        logger.error('Exception creating student course', {
            source: 'createStudentCourse',
            userId: studentId,
            data: { error, courseData }
        });
        throw error;
    }
}

/**
 * Get a single student course
 */
export async function getStudentCourse(studentId: string, courseId: string): Promise<Schema['StudentCourse']['type'] | null> {
    try {
        const { data, errors } = await getClient().models.StudentCourse.get({
            studentId,
            courseId
        });

        if (errors) {
            logger.error('Error fetching student course', {
                source: 'getStudentCourse',
                userId: studentId,
                data: { errors, courseId }
            });
            return null;
        }

        return data;
    } catch (error) {
        logger.error('Error fetching student course', {
            source: 'getStudentCourse',
            userId: studentId,
            data: { error, courseId }
        });
        return null;
    }
}

/**
 * Update an existing student course
 */
export async function updateStudentCourse(
    studentId: string,
    courseId: string,
    updates: {
        courseName?: string;
        department?: string;
        isRequired?: boolean;
        passingGrade?: number;
    }
): Promise<Schema['StudentCourse']['type'] | null> {
    try {
        const { data, errors } = await getClient().models.StudentCourse.update({
            studentId,
            courseId,
            ...updates
        });

        if (errors) {
            logger.error('Error updating student course', {
                source: 'updateStudentCourse',
                userId: studentId,
                data: { errors, courseId, updates }
            });
            return null;
        }

        return data;
    } catch (error) {
        logger.error('Error updating student course', {
            source: 'updateStudentCourse',
            userId: studentId,
            data: { error, courseId, updates }
        });
        return null;
    }
}

/**
 * Delete a student course and all related data (Cascading Delete)
 */
export async function deleteStudentCourse(studentId: string, courseId: string): Promise<boolean> {
    try {
        logger.info('Starting cascade delete for course', {
            source: 'deleteStudentCourse',
            userId: studentId,
            data: { courseId }
        });
        
        // 1. Construct the studentCourseId used by related models
        // Note: In add.tsx, we construct it as `${user.id}#${courseId}`
        const studentCourseId = `${studentId}#${courseId}`;

        // 2. Delete all assignments
        const assignments = await fetchAssignments(studentCourseId);
        logger.debug(`Deleting ${assignments.length} assignments`, {
            source: 'deleteStudentCourse',
            userId: studentId,
            data: { courseId, count: assignments.length }
        });
        await Promise.all(assignments.map(assignment => 
            getClient().models.Assignment.delete({
                studentCourseId,
                assignmentId: assignment.assignmentId
            })
        ));

        // 3. Delete all categories
        const categories = await fetchGradeCategories(studentCourseId);
        logger.debug(`Deleting ${categories.length} categories`, {
            source: 'deleteStudentCourse',
            userId: studentId,
            data: { courseId, count: categories.length }
        });
        await Promise.all(categories.map(category => 
            getClient().models.GradeCategory.delete({
                studentCourseId,
                category: category.category
            })
        ));

        // 4. Delete all resources
        const resources = await fetchResources(studentCourseId);
        logger.debug(`Deleting ${resources.length} resources`, {
            source: 'deleteStudentCourse',
            userId: studentId,
            data: { courseId, count: resources.length }
        });
        await Promise.all(resources.map(resource => 
            getClient().models.CourseResource.delete({
                studentCourseId,
                resourceId: resource.resourceId
            })
        ));

        // 5. Delete the course itself
        const { errors } = await getClient().models.StudentCourse.delete({
            studentId,
            courseId
        });

        if (errors) {
            logger.error('Error deleting student course', {
                source: 'deleteStudentCourse',
                userId: studentId,
                data: { errors, courseId }
            });
            return false;
        }

        logger.info('Successfully deleted course', {
            source: 'deleteStudentCourse',
            userId: studentId,
            data: { courseId }
        });
        return true;
    } catch (error) {
        logger.error('Error deleting student course', {
            source: 'deleteStudentCourse',
            userId: studentId,
            data: { error, courseId }
        });
        return false;
    }
}

/**
 * Create a new grade category
 */
export async function createGradeCategory(
    studentCourseId: string,
    categoryData: {
        category: string;
        weight: number;
        dropLowest?: number;
        description?: string;
    }
): Promise<Schema['GradeCategory']['type'] | null> {
    try {
        logger.debug('Creating GradeCategory', {
            source: 'createGradeCategory',
            data: { studentCourseId, categoryData }
        });

        const { data, errors } = await getClient().models.GradeCategory.create({
            studentCourseId,
            category: categoryData.category,
            weight: categoryData.weight,
            dropLowest: categoryData.dropLowest,
            description: categoryData.description
        });

        if (errors) {
            logger.error('GraphQL errors creating category', {
                source: 'createGradeCategory',
                data: { errors, studentCourseId, categoryData }
            });
            return null;
        }

        logger.info('GradeCategory created successfully', {
            source: 'createGradeCategory',
            data: { studentCourseId, category: categoryData.category }
        });
        return data;
    } catch (error) {
        logger.error('Exception creating grade category', {
            source: 'createGradeCategory',
            data: { 
                error,
                errorName: error instanceof Error ? error.name : undefined,
                errorMessage: error instanceof Error ? error.message : undefined,
                studentCourseId,
                categoryData
            }
        });
        throw error; // Re-throw so caller can handle
    }
}

/**
 * Create an assignment for a course
 */
export async function createAssignment(
    studentCourseId: string,
    assignmentData: {
        assignmentId: string;
        assignmentName: string;
        category: string;
        maxScore: number;
        dateDue: string;
        scoreEarned?: number;
        dateAssigned?: string;
        dateSubmitted?: string;
        description?: string;
    }
): Promise<Schema['Assignment']['type'] | null> {
    try {
        const { data, errors } = await getClient().models.Assignment.create({
            studentCourseId,
            assignmentId: assignmentData.assignmentId,
            assignmentName: assignmentData.assignmentName,
            category: assignmentData.category,
            maxScore: assignmentData.maxScore,
            dateDue: assignmentData.dateDue,
            scoreEarned: assignmentData.scoreEarned,
            dateAssigned: assignmentData.dateAssigned,
            dateSubmitted: assignmentData.dateSubmitted,
            description: assignmentData.description
        });

        if (errors) {
            logger.error('Error creating assignment', {
                source: 'createAssignment',
                data: { errors, studentCourseId, assignmentData }
            });
            return null;
        }

        return data;
    } catch (error) {
        logger.error('Error creating assignment', {
            source: 'createAssignment',
            data: { error, studentCourseId, assignmentData }
        });
        return null;
    }
}

/**
 * Update an existing assignment
 */
export async function updateAssignment(
    studentCourseId: string,
    assignmentId: string,
    updates: {
        assignmentName?: string;
        category?: string;
        maxScore?: number;
        scoreEarned?: number | null;
        dateDue?: string;
        dateSubmitted?: string | null;
        description?: string | null;
    }
): Promise<Schema['Assignment']['type'] | null> {
    const client = getClient();

    try {
        logger.debug('Updating assignment', {
            source: 'updateAssignment',
            data: { studentCourseId, assignmentId, updates }
        });

        const { data, errors } = await client.models.Assignment.update({
            studentCourseId,
            assignmentId,
            ...updates
        });

        if (errors) {
            logger.error('Error updating assignment', {
                source: 'updateAssignment',
                data: { errors, studentCourseId, assignmentId, updates }
            });
            return null;
        }

        logger.info('Assignment updated successfully', {
            source: 'updateAssignment',
            data: { studentCourseId, assignmentId }
        });
        return data;
    } catch (error) {
        logger.error('Error updating assignment', {
            source: 'updateAssignment',
            data: { error, studentCourseId, assignmentId, updates }
        });
        return null;
    }
}

/**
 * Delete an assignment
 */
export async function deleteAssignment(
    studentCourseId: string,
    assignmentId: string
): Promise<boolean> {
    const client = getClient();

    try {
        logger.debug('Deleting assignment', {
            source: 'deleteAssignment',
            data: { studentCourseId, assignmentId }
        });

        const { data, errors } = await client.models.Assignment.delete({
            studentCourseId,
            assignmentId
        });

        if (errors) {
            logger.error('Error deleting assignment', {
                source: 'deleteAssignment',
                data: { errors, studentCourseId, assignmentId }
            });
            return false;
        }

        logger.info('Assignment deleted successfully', {
            source: 'deleteAssignment',
            data: { studentCourseId, assignmentId }
        });
        return true;
    } catch (error) {
        logger.error('Error deleting assignment', {
            source: 'deleteAssignment',
            data: { error, studentCourseId, assignmentId }
        });
        return false;
    }
}

/**
 * Fetch a single assignment by ID
 */
export async function getAssignment(
    studentCourseId: string,
    assignmentId: string
): Promise<Schema['Assignment']['type'] | null> {
    try {
        const { data, errors } = await getClient().models.Assignment.get({
            studentCourseId,
            assignmentId
        });

        if (errors) {
            logger.error('Error fetching assignment', {
                source: 'getAssignment',
                data: { errors, studentCourseId, assignmentId }
            });
            return null;
        }

        return data;
    } catch (error) {
        logger.error('Error fetching assignment', {
            source: 'getAssignment',
            data: { error, studentCourseId, assignmentId }
        });
        return null;
    }
}

/**
 * Update assessment data for a student course
 */
export interface AssessmentUpdateData {
    stressLevel?: number | null;
    sleepScore?: number | null;
    symptomsScore?: number | null;
    weeklyTimeInvestment?: number | null;
    impactOnOtherCourses?: number | null;
    overallWellbeing?: number | null;
    semesterCreditHours?: number | null;
    otherCoursesCount?: number | null;
    currentGPA?: number | null;
    passingGrade?: number;
}

export async function updateStudentCourseAssessment(
    studentId: string,
    courseId: string,
    updates: AssessmentUpdateData
): Promise<Schema['StudentCourse']['type'] | null> {
    try {
        const { data, errors } = await getClient().models.StudentCourse.update({
            studentId,
            courseId,
            ...updates
        });

        if (errors) {
            logger.error('Error updating assessment', {
                source: 'updateStudentCourseAssessment',
                userId: studentId,
                data: { errors, courseId, updates }
            });
            return null;
        }

        return data;
    } catch (error) {
        logger.error('Error updating assessment', {
            source: 'updateStudentCourseAssessment',
            userId: studentId,
            data: { error, courseId, updates }
        });
        return null;
    }
}

/**
 * Delete assessment data for a student course
 */
export async function deleteStudentCourseAssessment(
    studentId: string,
    courseId: string
): Promise<Schema['StudentCourse']['type'] | null> {
    try {
        const { data, errors } = await getClient().models.StudentCourse.update({
            studentId,
            courseId,
            stressLevel: null,
            weeklyTimeInvestment: null,
            impactOnOtherCourses: null,
            overallWellbeing: null,
            semesterCreditHours: null,
            otherCoursesCount: null,
            currentGPA: null
        });

        if (errors) {
            logger.error('Error deleting assessment', {
                source: 'deleteStudentCourseAssessment',
                userId: studentId,
                data: { errors, courseId }
            });
            return null;
        }

        return data;
    } catch (error) {
        logger.error('Error deleting assessment', {
            source: 'deleteStudentCourseAssessment',
            userId: studentId,
            data: { error, courseId }
        });
        return null;
    }
}

/**
 * Create a new course resource
 */
export async function createResource(
    studentCourseId: string,
    resourceData: {
        resourceId: string;
        title: string;
        type: 'link' | 'note';
        url?: string;
        content?: string;
        tags?: string[];
    }
): Promise<Schema['CourseResource']['type'] | null> {
    try {
        const { data, errors } = await getClient().models.CourseResource.create({
            studentCourseId,
            ...resourceData
        });

        if (errors) {
            logger.error('Error creating resource', {
                source: 'createResource',
                data: { errors, studentCourseId, resourceData }
            });
            return null;
        }

        return data;
    } catch (error) {
        logger.error('Error creating resource', {
            source: 'createResource',
            data: { error, studentCourseId, resourceData }
        });
        return null;
    }
}

/**
 * Fetch resources for a specific course
 */
export async function fetchResources(studentCourseId: string): Promise<Schema['CourseResource']['type'][]> {
    try {
        const { data, errors } = await getClient().models.CourseResource.list({
            filter: {
                studentCourseId: { eq: studentCourseId }
            }
        });

        if (errors) {
            logger.error('Error fetching resources', {
                source: 'fetchResources',
                data: { errors, studentCourseId }
            });
            return [];
        }

        return data || [];
    } catch (error) {
        logger.error('Error fetching resources', {
            source: 'fetchResources',
            data: { error, studentCourseId }
        });
        return [];
    }
}

/**
 * Delete a resource
 */
export async function deleteResource(
    studentCourseId: string,
    resourceId: string
): Promise<boolean> {
    try {
        const { errors } = await getClient().models.CourseResource.delete({
            studentCourseId,
            resourceId
        });

        if (errors) {
            logger.error('Error deleting resource', {
                source: 'deleteResource',
                data: { errors, studentCourseId, resourceId }
            });
            return false;
        }

        return true;
    } catch (error) {
        logger.error('Error deleting resource', {
            source: 'deleteResource',
            data: { error, studentCourseId, resourceId }
        });
        return false;
    }
}

export { getClient };
