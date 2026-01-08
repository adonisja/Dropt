import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/lib/auth/auth-context';
import { useTheme } from '@/lib/theme/theme-context';
import { fetchStudentCourses, fetchCompleteCourseData, transformToStudentCourseData } from '@/lib/api/data-client';
import { logger } from '@/lib/utils/logger';
import { calculateCurrentGrade } from '@/lib/logic/calculateCurrentGrade';
import { convertGradeToGPA, getLetterGradeFromGPA } from '@/lib/logic/calculateGPA';
import { groupCoursesByYearAndSemester } from '@/lib/utils/semester-utils';
import type { Schema } from '@/amplify/data/resource';

interface CourseWithGrade {
    course: Schema['StudentCourse']['type'];
    currentGrade: number | null;
    letterGrade: string | null;
}

export default function CourseArchive() {
    const { user } = useAuth();
    const { theme, hexColors, isDark } = useTheme();
    const [groupedCourses, setGroupedCourses] = useState<Record<number, Record<string, CourseWithGrade[]>>>({});
    const [uncategorizedCourses, setUncategorizedCourses] = useState<CourseWithGrade[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        loadArchiveData();
    }, [user?.id]);

    const loadArchiveData = async () => {
        if (!user?.id) {
            setError('User not authenticated');
            setIsLoading(false);
            return;
        }

        try {
            setError(null);
            
            // Fetch all courses
            const allCourses = await fetchStudentCourses(user.id);

            // Calculate grades for each course
            const coursesWithGrades = await Promise.all(
                allCourses.map(async (course) => {
                    // Fetch complete data (categories + assignments)
                    const completeData = await fetchCompleteCourseData(user.id, course.courseId);

                    let currentGrade: number | null = null;

                    if (completeData && completeData.assignments.length > 0) {
                        const studentCourseData = transformToStudentCourseData(completeData);
                        currentGrade = calculateCurrentGrade(studentCourseData);
                    }

                    // Convert to letter grade
                    const letterGrade = currentGrade !== null
                        ? getLetterGradeFromGPA(convertGradeToGPA(currentGrade))
                        : '--';
                    
                    return {
                        course,
                        currentGrade,
                        letterGrade
                    };
                })
            );

            // Group by year and semester
            const grouped: Record<number, Record<string, CourseWithGrade[]>> = {};
            const uncategorized: CourseWithGrade[] = [];

            coursesWithGrades.forEach(item => {
                const year = item.course.year;
                const semester = item.course.semester;

                if (!year || !semester) {
                    uncategorized.push(item);
                    return;
                }

                if (!grouped[year]) {
                    grouped[year] = {};
                }

                if (!grouped[year][semester]) {
                    grouped[year][semester] = [];
                }

                grouped[year][semester].push(item);
            })

            setGroupedCourses(grouped);
            setUncategorizedCourses(uncategorized);

        } catch (err) {
            logger.error('Error loading course archive', {
                source: 'courses.archive.loadArchive',
                userId: user?.id,
                data: { error: err }
            });
            setError('Failed to load course archive');
        } finally {
            setIsLoading(false);
        }
    };

    // Sort years descending (most recent first)
    const sortedYears = Object.keys(groupedCourses)
        .map(Number)
        .sort((a, b) => b - a);

    // Semester ordering for sorting
    const semesterOrder = { 'Spring': 1, 'Summer': 2, 'Fall': 3, 'Winter': 4 };

    if (isLoading) {
        return (
            <View className="flex-1" style={{ backgroundColor: hexColors.background }}>
                <View className="flex-1 justify-center items-center p-6">
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text className="mt-4 text-base font-medium " style={{ color: hexColors.mutedForeground }}>
                        Loading course archive...
                    </Text>
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1" style={{ backgroundColor: hexColors.background }}>
                <View className="flex-1 justify-center items-center p-8">
                    <View className="w-16 h-16 bg-destructive/10 rounded-full items-center justify-center mb-4">
                        <Ionicons name="alert-circle" size={32} color={theme.colors.destructive} />
                    </View>
                    <Text className="text-lg font-semibold mb-2">Something went wrong</Text>
                    <Text className="text-sm text-center mb-6 " style={{ color: hexColors.mutedForeground }}>{error}</Text>
                    <TouchableOpacity
                        className="py-3 px-8 rounded-full bg-primary"
                        onPress={loadArchiveData}
                    >
                        <Text className="text-base font-semibold  -foreground" style={{ color: hexColors.primary }}>
                            Try Again
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const getGradeColor = (grade: number | null): string => {
        if (grade === null) return theme.colors.mutedForeground;
        if (grade >= 90) return '#10B981'; // emerald-500
        if (grade >= 80) return '#84CC16'; // lime-500
        if (grade >= 70) return '#EAB308'; // yellow-500
        if (grade >= 60) return '#F97316'; // orange-500
        return '#EF4444'; // red-500
    }

    return (
        <View className="flex-1" style={{ backgroundColor: hexColors.background }}>
            <Stack.Screen options={{ title: 'Course Archive' }} />
            <SafeAreaView className="flex-1">
                {/* Header */}
                <View className="px-6 pt-4 pb-2 items-center">
                    <Text className="text-sm font-medium  uppercase tracking-wider" style={{ color: hexColors.mutedForeground }}>Historical</Text>
                    <Text className="text-3xl font-bold " style={{ color: hexColors.foreground }}>Course Archive</Text>
                </View>

                <ScrollView
                    className="flex-1 px-4 pt-2"
                    contentContainerStyle={{ paddingBottom: 32 }}
                    showsVerticalScrollIndicator={false}
                >
                    {sortedYears.length === 0 && uncategorizedCourses.length === 0 ? (
                        <View className="items-center justify-center py-20">
                            <View className="w-20 h-20 bg-muted/30 rounded-full items-center justify-center mb-6">
                                <Ionicons name="archive-outline" size={40} color={theme.colors.mutedForeground} />
                            </View>
                            <Text className="text-xl font-bold mb-2 " style={{ color: hexColors.foreground }}>
                                No Archived Courses
                            </Text>
                            <Text className="text-base text-center  px-8" style={{ color: hexColors.mutedForeground }}>
                                Your course history will appear here as you complete semesters.
                            </Text>
                        </View>
                    ) : (
                        sortedYears.map((year, yearIndex) => {
                            const semesters = groupedCourses[year];
                            const sortedSemesters = Object.keys(semesters).sort(
                                (a, b) => (semesterOrder[a as keyof typeof semesterOrder] || 99) - (semesterOrder[b as keyof typeof semesterOrder] || 99)
                            );

                            return (
                                <Animated.View 
                                    key={year}
                                    entering={FadeInDown.delay(yearIndex * 100).springify().damping(15)}
                                    className="mb-6"
                                >
                                    {/* Year Header */}
                                    <View className="flex-row items-center mb-4">
                                        <View className="flex-1 h-px bg-border" />
                                        <Text className="text-2xl font-black px-4">{year}</Text>
                                        <View className="flex-1 h-px bg-border" />
                                    </View>

                                    {/* Semesters */}
                                    {sortedSemesters.map((semester) => {
                                        const courses = semesters[semester];

                                        return (
                                            <View key={`${year}-${semester}`} className="mb-6">
                                                {/* Semester Header */}
                                                <View className="flex-row items-center mb-3 px-2">
                                                    <Ionicons 
                                                        name="calendar-outline" 
                                                        size={16} 
                                                        color={theme.colors.primary} 
                                                        style={{ marginRight: 8 }}
                                                    />
                                                    <Text className="text-lg font-bold " style={{ color: hexColors.primary }}>
                                                        {semester}
                                                    </Text>
                                                    <Text className="text-sm  ml-2" style={{ color: hexColors.mutedForeground }}>
                                                        ({courses.length} {courses.length === 1 ? 'course' : 'courses'})
                                                    </Text>
                                                </View>

                                                {/* Course List */}
                                                {courses.map((courseWithGrade) => (
                                                    <TouchableOpacity
                                                        key={`${courseWithGrade.course.studentId}-${courseWithGrade.course.courseId}`}
                                                        className="rounded-xl p-4 mb-3  borderWidth: 1, borderColor: hexColors.border" style={{ backgroundColor: hexColors.card }}
                                                        activeOpacity={0.7}
                                                        onPress={() => router.push({
                                                            pathname: '/(student)/courses/[id]',
                                                            params: { id: courseWithGrade.course.courseId }
                                                        })}
                                                    >
                                                        <View className="flex-row justify-between items-start">
                                                            <View className="flex-1 mr-2">
                                                                <Text className="text-xs font-bold  uppercase tracking-wide mb-1" style={{ color: hexColors.primary }}>
                                                                    {courseWithGrade.course.department || 'COURSE'}
                                                                </Text>
                                                                <Text className="text-lg font-bold text-card-foreground">
                                                                    {courseWithGrade.course.courseName}
                                                                </Text>
                                                                <Text className="text-sm  mt-1" style={{ color: hexColors.mutedForeground }}>
                                                                    {courseWithGrade.course.credits || 3} Credits
                                                                </Text>
                                                            </View>
                                                            <View className="items-end">
                                                                {courseWithGrade.course.isRequired && (
                                                                    <View className="px-2 py-1 rounded-full bg-secondary/80 mb-2">
                                                                        <Text className="text-[10px] font-bold text-secondary-foreground uppercase">Required</Text>
                                                                    </View>
                                                                )}
                                                                {/* Grade Display */}
                                                                <View className="items-center">
                                                                    <Text 
                                                                        className="text-2xl font-black"
                                                                        style={{ color: getGradeColor(courseWithGrade.currentGrade) }}
                                                                    >
                                                                        {courseWithGrade.letterGrade}
                                                                    </Text>
                                                                    <Text className="text-xs " style={{ color: hexColors.mutedForeground }}>
                                                                        {courseWithGrade.currentGrade !== null 
                                                                            ? `${courseWithGrade.currentGrade.toFixed(1)}%` 
                                                                            : 'No grade'}
                                                                    </Text>
                                                                </View>
                                                            </View>
                                                        </View>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        );
                                    })}
                                </Animated.View>
                            );
                        })
                    )}

                    {/* Uncategorized/Legacy Courses Section */}
                    {uncategorizedCourses.length > 0 && (
                        <Animated.View 
                            entering={FadeInDown.delay((sortedYears.length) * 100).springify().damping(15)}
                            className="mb-6"
                        >
                            {/* Section Header */}
                            <View className="flex-row items-center mb-4">
                                <View className="flex-1 h-px bg-border" />
                                <Text className="text-2xl font-black  px-4" style={{ color: hexColors.mutedForeground }}>Legacy Courses</Text>
                                <View className="flex-1 h-px bg-border" />
                            </View>

                            <View className="mb-3 px-2">
                                <Text className="text-sm " style={{ color: hexColors.mutedForeground }}>
                                    Courses added before semester tracking was enabled
                                </Text>
                            </View>

                            {/* Course List */}
                            {uncategorizedCourses.map((courseWithGrade) => (
                                <TouchableOpacity
                                    key={`${courseWithGrade.course.studentId}-${courseWithGrade.course.courseId}`}
                                    className="rounded-xl p-4 mb-3  borderWidth: 1, borderColor: hexColors.border" style={{ backgroundColor: hexColors.card }}
                                    activeOpacity={0.7}
                                    onPress={() => router.push({
                                        pathname: '/(student)/courses/[id]',
                                        params: { id: courseWithGrade.course.courseId }
                                    })}
                                >
                                    <View className="flex-row justify-between items-start">
                                        <View className="flex-1 mr-2">
                                            <Text className="text-xs font-bold  uppercase tracking-wide mb-1" style={{ color: hexColors.primary }}>
                                                {courseWithGrade.course.department || 'COURSE'}
                                            </Text>
                                            <Text className="text-lg font-bold text-card-foreground">
                                                {courseWithGrade.course.courseName}
                                            </Text>
                                            <Text className="text-sm  mt-1" style={{ color: hexColors.mutedForeground }}>
                                                {courseWithGrade.course.credits || 3} Credits
                                            </Text>
                                        </View>
                                        <View className="items-end">
                                            {courseWithGrade.course.isRequired && (
                                                <View className="px-2 py-1 rounded-full bg-secondary/80 mb-2">
                                                    <Text className="text-[10px] font-bold text-secondary-foreground uppercase">Required</Text>
                                                </View>
                                            )}
                                            {/* Grade Display */}
                                            <View className="items-center">
                                                <Text 
                                                    className="text-2xl font-black"
                                                    style={{ color: getGradeColor(courseWithGrade.currentGrade) }}
                                                >
                                                    {courseWithGrade.letterGrade}
                                                </Text>
                                                <Text className="text-xs " style={{ color: hexColors.mutedForeground }}>
                                                    {courseWithGrade.currentGrade !== null 
                                                        ? `${courseWithGrade.currentGrade.toFixed(1)}%` 
                                                        : 'No grade'}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </Animated.View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
