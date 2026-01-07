import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { StudentCourseData, GradeCategory, Assignment } from '@/lib/types';

// Lazy-initialize the client to ensure Amplify is configured first
let _client: ReturnType<typeof generateClient<Schema>> | null = null;

function getClient() {
    if (!_client) {
        console.log('[data-client] Initializing GraphQL client with userPool auth mode');
        try {
            _client = generateClient<Schema>({
                authMode: 'userPool'
            });
            console.log('[data-client] Client initialized successfully');
            console.log('[data-client] Available models:', Object.keys(_client.models || {}));
        } catch (error) {
            console.error('[data-client] Failed to initialize client:', error);
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
            console.error('Error fetching courses:', JSON.stringify(errors, null, 2));
        }

        return data || [];
    } catch (error) {
        console.error('Error fetching student courses:', error);
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
            console.error(`Error fetching user settings: ${errors}}`);
            return null;
        }

        return data;
    } catch(error) {
        console.error(`Error fetching user settings: ${error}}`);
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
            console.error(`Error creating user settings: ${errors}`)
            return null;
        }

        return data;
    } catch(error) {
        console.error(`Error creating user settings: ${error}`)
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
            console.error(`Error updating user settings: ${errors}`)
            return null;
        }

        return data
    } catch(error) {
        console.error(`Error updating user settings: ${error}`)
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
            console.log('Semester transition detected');
            
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
        
        console.log('Running legacy course migration...');
        const result = await migrateLegacyCourses(userId);
        
        if (result.success || result.migratedCount > 0) {
            console.log(`Migration complete: ${result.migratedCount} courses updated`);
            
            // Mark migration as complete
            settings = await updateUserSettings(userId, {
                hasRunLegacyMigration: true
            });
        } else {
            console.error('Migration failed:', result.errors);
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
            console.error('Error fetching categories:', errors);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error fetching grade categories:', error);
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
            console.error('Error fetching assignments:', errors);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error fetching assignments:', error);
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
            console.error('Error fetching course:', courseErrors);
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
        console.error('Error fetching complete course data:', error);
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
    console.log('[data-client] createStudentCourse called');

    const client = getClient();
    console.log('[data-client] Got client, checking models...');

    if (!client.models) {
        console.error('[data-client] ERROR: client.models is undefined!');
        throw new Error('GraphQL client models not available');
    }

    if (!client.models.StudentCourse) {
        console.error('[data-client] ERROR: StudentCourse model not found!');
        console.error('[data-client] Available models:', Object.keys(client.models));
        throw new Error('StudentCourse model not available');
    }

    console.log('[data-client] StudentCourse model found, creating record...');

    try {
        console.log('[data-client] Creating StudentCourse:', {
            studentId,
            ...courseData
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

        console.log('[data-client] Create promise returned:', createPromise);

        const result = await createPromise;
        console.log('[data-client] Create result:', result);

        const { data, errors } = result;

        if (errors) {
            console.error('[data-client] GraphQL errors creating course:', JSON.stringify(errors, null, 2));
            return null;
        }

        return data;
    } catch (error) {
        console.error('[data-client] Exception creating student course:', error);
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
            console.error('Error fetching student course:', errors);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error fetching student course:', error);
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
            console.error('Error updating student course:', errors);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error updating student course:', error);
        return null;
    }
}

/**
 * Delete a student course and all related data (Cascading Delete)
 */
export async function deleteStudentCourse(studentId: string, courseId: string): Promise<boolean> {
    try {
        console.log(`[deleteStudentCourse] Starting delete for ${courseId}`);
        
        // 1. Construct the studentCourseId used by related models
        // Note: In add.tsx, we construct it as `${user.id}#${courseId}`
        const studentCourseId = `${studentId}#${courseId}`;

        // 2. Delete all assignments
        const assignments = await fetchAssignments(studentCourseId);
        console.log(`[deleteStudentCourse] Deleting ${assignments.length} assignments`);
        await Promise.all(assignments.map(assignment => 
            getClient().models.Assignment.delete({
                studentCourseId,
                assignmentId: assignment.assignmentId
            })
        ));

        // 3. Delete all categories
        const categories = await fetchGradeCategories(studentCourseId);
        console.log(`[deleteStudentCourse] Deleting ${categories.length} categories`);
        await Promise.all(categories.map(category => 
            getClient().models.GradeCategory.delete({
                studentCourseId,
                category: category.category
            })
        ));

        // 4. Delete all resources
        const resources = await fetchResources(studentCourseId);
        console.log(`[deleteStudentCourse] Deleting ${resources.length} resources`);
        await Promise.all(resources.map(resource => 
            getClient().models.CourseResource.delete({
                studentCourseId,
                resourceId: resource.resourceId
            })
        ));

        // 5. Delete the course itself
        console.log(`[deleteStudentCourse] Deleting course record for studentId: ${studentId}, courseId: ${courseId}`);
        const { errors } = await getClient().models.StudentCourse.delete({
            studentId,
            courseId
        });

        if (errors) {
            console.error('Error deleting student course:', JSON.stringify(errors, null, 2));
            return false;
        }

        console.log(`[deleteStudentCourse] Successfully deleted course ${courseId}`);
        return true;
    } catch (error) {
        console.error('Error deleting student course:', error);
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
        console.log('[data-client] Creating GradeCategory:', {
            studentCourseId,
            category: categoryData.category,
            weight: categoryData.weight,
            dropLowest: categoryData.dropLowest,
            description: categoryData.description
        });

        const { data, errors } = await getClient().models.GradeCategory.create({
            studentCourseId,
            category: categoryData.category,
            weight: categoryData.weight,
            dropLowest: categoryData.dropLowest,
            description: categoryData.description
        });

        if (errors) {
            console.error('[data-client] GraphQL errors creating category:', JSON.stringify(errors, null, 2));
            return null;
        }

        console.log('[data-client] GradeCategory created successfully:', data);
        return data;
    } catch (error) {
        console.error('[data-client] Exception creating grade category:', error);
        if (error instanceof Error) {
            console.error('[data-client] Error name:', error.name);
            console.error('[data-client] Error message:', error.message);
        }
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
            console.error('Error creating assignment:', JSON.stringify(errors, null, 2));
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error creating assignment:', error);
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
        console.log(`[data-client] Updating assignment ${assignmentId} for course ${studentCourseId}`);
        console.log('[data-client] Updates:', JSON.stringify(updates, null, 2));

        const { data, errors } = await client.models.Assignment.update({
            studentCourseId,
            assignmentId,
            ...updates
        });

        if (errors) {
            console.error('Error updating assignment:', JSON.stringify(errors, null, 2));
            return null;
        }

        console.log('[data-client] Assignment updated successfully:', data);
        return data;
    } catch (error) {
        console.error('Error updating assignment:', error);
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
        console.log(`[data-client] Deleting assignment ${assignmentId} from course ${studentCourseId}`);

        const { data, errors } = await client.models.Assignment.delete({
            studentCourseId,
            assignmentId
        });

        if (errors) {
            console.error('Error deleting assignment:', JSON.stringify(errors, null, 2));
            return false;
        }

        console.log('[data-client] Assignment deleted successfully:', data);
        return true;
    } catch (error) {
        console.error('Error deleting assignment:', error);
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
            console.error('Error fetching assignment:', errors);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error fetching assignment:', error);
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
            console.error('Error updating assessment:', errors);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error updating assessment:', error);
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
            console.error('Error deleting assessment:', errors);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error deleting assessment:', error);
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
            console.error('Error creating resource:', errors);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error creating resource:', error);
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
            console.error('Error fetching resources:', errors);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error fetching resources:', error);
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
            console.error('Error deleting resource:', errors);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error deleting resource:', error);
        return false;
    }
}

export { getClient };
