/**
 * User Data Controls
 * GDPR/CCPA compliance utilities for data export and account deletion
 */

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { deleteUser } from 'aws-amplify/auth';
import { getClient } from '@/lib/api/amplify-config';
import { fetchStudentCourses, fetchCompleteCourseData, transformToStudentCourseData } from '@/lib/api/data-client';
import { logger } from './logger';

/**
 * Export all user data as JSON (GDPR Article 15 - Right to Access)
 * Includes: courses, assignments, grades, settings, statistics
 */
export async function exportUserData(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
        logger.info('Starting user data export', {
            source: 'exportUserData',
            userId
        });

        const client = getClient();
        
        // Fetch all user data
        const [courses, settingsResult] = await Promise.all([
            fetchStudentCourses(userId),
            client.models.UserSettings.get({ userId })
        ]);

        // Fetch complete course data with assignments
        const coursesWithDetails = await Promise.all(
            courses.map(async (course) => {
                const fullData = await fetchCompleteCourseData(userId, course.courseId);
                if (!fullData) return null;
                return transformToStudentCourseData(fullData);
            })
        );

        const validCourses = coursesWithDetails.filter(c => c !== null);

        // Compile complete user data export
        const exportData = {
            exportDate: new Date().toISOString(),
            userId,
            userSettings: settingsResult.data,
            courses: validCourses,
            statistics: {
                totalCourses: courses.length,
                activeCourses: courses.filter(c => !c.archived).length,
                archivedCourses: courses.filter(c => c.archived).length,
                totalAssignments: validCourses.reduce((sum, course) => {
                    return sum + (course?.assignments?.length || 0);
                }, 0)
            },
            metadata: {
                appVersion: '1.2.0',
                exportFormat: 'JSON',
                dataProtectionNotice: 'This file contains your personal academic data. Keep it secure.'
            }
        };

        // Save to file
        const fileName = `dropt-data-export-${userId}-${Date.now()}.json`;
        const fileContent = JSON.stringify(exportData, null, 2);

        if (Platform.OS === 'web') {
            // Web: Download as file
            const blob = new Blob([fileContent], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.click();
            URL.revokeObjectURL(url);
        } else {
            // Mobile: Save and share
            const fileUri = `${FileSystem.documentDirectory}${fileName}`;
            await FileSystem.writeAsStringAsync(fileUri, fileContent);
            
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: 'application/json',
                    dialogTitle: 'Save Your Data Export'
                });
            }
        }

        logger.info('User data export completed', {
            source: 'exportUserData',
            userId,
            data: { 
                coursesCount: validCourses.length,
                fileName 
            }
        });

        return { success: true };
    } catch (error) {
        logger.error('User data export failed', {
            source: 'exportUserData',
            userId,
            data: { error }
        });
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to export data' 
        };
    }
}

/**
 * Delete all user data (GDPR Article 17 - Right to Erasure)
 * Deletes: courses, assignments, grade categories, settings, and Cognito account
 */
export async function deleteAllUserData(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
        logger.info('Starting complete user data deletion', {
            source: 'deleteAllUserData',
            userId
        });

        const client = getClient();
        
        // Step 1: Delete all courses (cascades to assignments and grade categories)
        const courses = await fetchStudentCourses(userId);
        
        const deletionPromises = courses.map(async (course) => {
            const studentCourseId = `${userId}#${course.courseId}`;
            
            // Delete all assignments
            const { data: assignments } = await client.models.Assignment.list({
                filter: { studentCourseId: { eq: studentCourseId } }
            });
            await Promise.all(
                (assignments || []).map(assignment => 
                    client.models.Assignment.delete({ 
                        studentCourseId: assignment.studentCourseId,
                        assignmentId: assignment.assignmentId 
                    })
                )
            );

            // Delete all grade categories
            const { data: categories } = await client.models.GradeCategory.list({
                filter: { studentCourseId: { eq: studentCourseId } }
            });
            await Promise.all(
                (categories || []).map(category => 
                    client.models.GradeCategory.delete({ 
                        studentCourseId: category.studentCourseId,
                        category: category.category 
                    })
                )
            );

            // Delete the course
            await client.models.StudentCourse.delete({
                userId,
                courseId: course.courseId
            });
        });

        await Promise.all(deletionPromises);

        // Step 2: Delete user settings
        await client.models.UserSettings.delete({ userId });

        // Step 3: Delete Cognito user account
        await deleteUser();

        logger.info('Complete user data deletion successful', {
            source: 'deleteAllUserData',
            userId,
            data: { coursesDeleted: courses.length }
        });

        return { success: true };
    } catch (error) {
        logger.error('User data deletion failed', {
            source: 'deleteAllUserData',
            userId,
            data: { error }
        });
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to delete account' 
        };
    }
}

/**
 * Clear current semester data only (keep account, reset progress)
 * Deletes: current semester courses and assignments
 * Preserves: lifetime statistics, user settings
 */
export async function clearSemesterData(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
        logger.info('Starting semester data clear', {
            source: 'clearSemesterData',
            userId
        });

        const client = getClient();
        
        // Get current semester info
        const { data: settings } = await client.models.UserSettings.get({ userId });
        if (!settings) {
            return { success: false, error: 'User settings not found' };
        }

        const currentSemester = settings.currentSemester;
        const currentYear = settings.currentYear;

        // Get courses from current semester only
        const courses = await fetchStudentCourses(userId);
        const currentSemesterCourses = courses.filter(course => 
            course.semester === currentSemester && course.year === currentYear
        );

        // Delete current semester courses and their data
        for (const course of currentSemesterCourses) {
            const studentCourseId = `${userId}#${course.courseId}`;
            
            // Delete assignments
            const { data: assignments } = await client.models.Assignment.list({
                filter: { studentCourseId: { eq: studentCourseId } }
            });
            await Promise.all(
                (assignments || []).map(assignment => 
                    client.models.Assignment.delete({ 
                        studentCourseId: assignment.studentCourseId,
                        assignmentId: assignment.assignmentId 
                    })
                )
            );

            // Delete grade categories
            const { data: categories } = await client.models.GradeCategory.list({
                filter: { studentCourseId: { eq: studentCourseId } }
            });
            await Promise.all(
                (categories || []).map(category => 
                    client.models.GradeCategory.delete({ 
                        studentCourseId: category.studentCourseId,
                        category: category.category 
                    })
                )
            );

            // Delete the course
            await client.models.StudentCourse.delete({
                userId,
                courseId: course.courseId
            });
        }

        // Reset per-semester statistics (preserve lifetime stats)
        await client.models.UserSettings.update({
            userId,
            tasksCompleted: 0,
            tasksMissed: 0
        });

        logger.info('Semester data cleared successfully', {
            source: 'clearSemesterData',
            userId,
            data: { coursesDeleted: currentSemesterCourses.length }
        });

        return { success: true };
    } catch (error) {
        logger.error('Semester data clear failed', {
            source: 'clearSemesterData',
            userId,
            data: { error }
        });
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to clear semester data' 
        };
    }
}
