import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import Animated, { FadeInDown, FadeInRight, FadeOutRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { calculateCurrentGrade } from '@/lib/logic/calculateCurrentGrade';
import { calculateBestCase } from '@/lib/logic/calculateBestCase';
import { calculateWorstCase } from '@/lib/logic/calculateWorstCase';

import { useAuth } from '@/lib/auth/auth-context';
import { useTheme } from '@/lib/theme/theme-context';
import {
    fetchStudentCourses,
    fetchCompleteCourseData,
    transformToStudentCourseData,
    CourseWithGrades
} from '@/lib/api/data-client';
import type { Schema } from '@/amplify/data/resource';
import { getOrCreateUserSettings } from '@/lib/api/data-client';
import { detectCurrentSemester } from '@/lib/utils/semester-utils';

interface CourseGradeData {
    course: Schema['StudentCourse']['type'];
    currentGrade: number | null;
    bestCase: number | null;
    worstCase: number | null;
    hasAssignments: boolean;
}

export default function StudentDashboard() {
    const { user } = useAuth();
    const { theme, hexColors, isDark } = useTheme();
    const [courses, setCourses] = useState<CourseGradeData[]>([]);
    const [hasAnyHistoricalCourses, setHasAnyHistoricalCourses] = useState(false);
    const [currentSemester, setCurrentSemester] = useState<string>('');
    const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [fabHovered, setFabHovered] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadCourseData = useCallback(async () => {
        if (!user?.id) {
            setError('User not authenticated');
            setIsLoading(false);
            return;
        }

       
        try {
            setError(null);
            
            // 1. Get current semester from settings
            const { semester, year } = detectCurrentSemester();
            const settings = await getOrCreateUserSettings(user.id, semester, year);

            setCurrentSemester(settings?.currentSemester || semester);
            setCurrentYear(settings?.currentYear || year);

            // 2. Fetch ALL course
            const allCourses = await fetchStudentCourses(user.id);

            // Track if user has any courses (for archive button visibility)
            setHasAnyHistoricalCourses(allCourses.length > 0);

            // 3. Filter for current semester only
            const currentSemesterCourses = allCourses.filter(c =>
                c.semester === (settings?.currentSemester || semester) &&
                c.year === (settings?.currentYear || year)
            );

            if (currentSemesterCourses.length === 0) {
                setCourses([]);
                setIsLoading(false);
                return;
            }

            // 4. Calculate grades for each course
            const courseGrades: CourseGradeData[] = await Promise.all(
                currentSemesterCourses.map(async (course) => {
                    const completeData = await fetchCompleteCourseData(user.id, course.courseId);

                    if (!completeData || completeData.assignments.length === 0) {
                        return {
                            course,
                            currentGrade: null,
                            bestCase: null,
                            worstCase: null,
                            hasAssignments: false
                        };
                    }

                    const studentCourseData = transformToStudentCourseData(completeData);

                    // Check if there are any graded assignments
                    const hasGradedAssignments = completeData.assignments.some(
                        a => a.scoreEarned !== null
                    );

                    if (!hasGradedAssignments) {
                        return {
                            course,
                            currentGrade: null,
                            bestCase: 100,
                            worstCase: 0,
                            hasAssignments: true
                        };
                    }

                    return {
                        course,
                        currentGrade: calculateCurrentGrade(studentCourseData),
                        bestCase: calculateBestCase(studentCourseData),
                        worstCase: calculateWorstCase(studentCourseData),
                        hasAssignments: true
                    };

                })
            );

            setCourses(courseGrades);
        
        } catch (err) {
            console.error('Error loading course data:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            if (errorMessage.includes('Network') || errorMessage.includes('fetch')) {
                setError('Unable to connect. Please check your internet connection and try again.');
            } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
                setError('Session expired. Please log in again.');
            } else {
                setError(`Failed to load courses: ${errorMessage}`);
            }
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [user?.id]);

    useFocusEffect(
        useCallback(() => {
            loadCourseData();
        }, [loadCourseData])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadCourseData();
    };

    const getGradeColor = (grade: number | null): string => {
        if (grade === null) return theme.colors.mutedForeground;
        if (grade >= 90) return '#10B981'; // emerald-500
        if (grade >= 80) return '#84CC16'; // lime-500
        if (grade >= 70) return '#EAB308'; // yellow-500
        if (grade >= 60) return '#F97316'; // orange-500
        return '#EF4444'; // red-500
    };

    const getLetterGrade = (grade: number | null): string => {
        if (grade === null) return '--';
        if (grade >= 93) return 'A';
        if (grade >= 90) return 'A-';
        if (grade >= 87) return 'B+';
        if (grade >= 83) return 'B';
        if (grade >= 80) return 'B-';
        if (grade >= 77) return 'C+';
        if (grade >= 73) return 'C';
        if (grade >= 70) return 'C-';
        if (grade >= 67) return 'D+';
        if (grade >= 63) return 'D';
        if (grade >= 60) return 'D-';
        return 'F';
    };

    if (isLoading) {
        return (
            <View className="flex-1" style={{ backgroundColor: hexColors.background }}>
                <View className="flex-1 justify-center items-center p-6">
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text className="mt-4 text-base font-medium  animate-pulse" style={{ color: hexColors.mutedForeground }}>
                        Loading your academic profile...
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
                    <Text className="text-sm text-center mb-6  leading-5" style={{ color: hexColors.mutedForeground }}>{error}</Text>
                    <TouchableOpacity
                        className="py-3 px-8 rounded-full bg-primary shadow-lg shadow-primary/30"
                        onPress={loadCourseData}
                    >
                        <Text className="text-base font-semibold  -foreground" style={{ color: hexColors.primary }}>
                            Try Again
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1" style={{ backgroundColor: hexColors.background }}>
            <SafeAreaView className="flex-1">
                <View className="px-6 pt-4 pb-2 flex-row justify-between items-center">
                    <View>
                        <Text className="text-sm font-medium  uppercase tracking-wider" style={{ color: hexColors.mutedForeground }}>{currentSemester} {currentYear}</Text>
                        <Text className="text-3xl font-bold " style={{ color: hexColors.foreground }}>My Courses</Text>
                    </View>
                    <TouchableOpacity 
                        className="w-10 h-10 rounded-full bg-secondary items-center justify-center"
                        onPress={() => router.push('/(student)/settings')}
                    >
                        <Ionicons name="person" size={20} color={theme.colors.foreground} />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    className="flex-1 px-4 pt-2"
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={theme.colors.primary}
                        />
                    }
                >
                    {courses.length === 0 ? (
                        <View className="items-center justify-center py-20">
                            <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-6">
                                <Ionicons name="school-outline" size={40} color={theme.colors.primary} />
                            </View>
                            <Text className="text-2xl font-bold mb-2 " style={{ color: hexColors.foreground }}>
                                Welcome to Dropt!
                            </Text>
                            <Text className="text-base text-center mb-8  px-8" style={{ color: hexColors.mutedForeground }}>
                                Start tracking your academic journey by adding your first course.
                            </Text>
                            <TouchableOpacity
                                className="py-4 px-8 rounded-full bg-primary shadow-lg shadow-primary/30 flex-row items-center"
                                onPress={() => router.push('/(student)/courses/add')}
                            >
                                <Ionicons name="add" size={24} color="white" style={{ marginRight: 8 }} />
                                <Text className="text-lg font-semibold  -foreground" style={{ color: hexColors.primary }}>
                                    Add Course
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        courses.map((courseData, index) => (
                            <Animated.View 
                                key={`${courseData.course.studentId}-${courseData.course.courseId}`}
                                entering={FadeInDown.delay(index * 100).springify().damping(15)}
                            >
                                <TouchableOpacity
                                    className="rounded-2xl p-5 mb-4  borderWidth: 1, borderColor: hexColors.border shadow-sm" style={{ backgroundColor: hexColors.card }}
                                    activeOpacity={0.9}
                                    onPress={() => router.push({
                                        pathname: '/(student)/courses/[id]',
                                        params: { id: courseData.course.courseId }
                                    })}
                                >
                                    <View className="flex-row justify-between items-start mb-3">
                                        <View className="flex-1 mr-2">
                                            <Text className="text-xs font-bold  uppercase tracking-wide mb-1" style={{ color: hexColors.primary }}>
                                                {courseData.course.department || 'COURSE'}
                                            </Text>
                                            <Text className="text-xl font-bold text-card-foreground leading-tight">
                                                {courseData.course.courseName}
                                            </Text>
                                        </View>
                                        {courseData.course.isRequired && (
                                            <View className="px-2.5 py-1 rounded-full bg-secondary/80">
                                                <Text className="text-[10px] font-bold text-secondary-foreground uppercase">Required</Text>
                                            </View>
                                        )}
                                    </View>

                                    {!courseData.hasAssignments ? (
                                        <View className="py-4 flex-row items-center justify-center bg-muted/30 rounded-xl border border-dashed border-muted-foreground/20">
                                            <Ionicons name="document-text-outline" size={16} color={theme.colors.mutedForeground} style={{ marginRight: 8 }} />
                                            <Text className="text-sm  font-medium" style={{ color: hexColors.mutedForeground }}>
                                                No assignments yet
                                            </Text>
                                        </View>
                                    ) : (
                                        <View className="mt-1">
                                            <View className="flex-row items-end justify-between mb-2">
                                                <View>
                                                    <Text className="text-xs  font-medium mb-0.5" style={{ color: hexColors.mutedForeground }}>Current Grade</Text>
                                                    <Text className="text-3xl font-bold" style={{ color: getGradeColor(courseData.currentGrade) }}>
                                                        {courseData.currentGrade !== null ? `${courseData.currentGrade.toFixed(1)}%` : '--'}
                                                    </Text>
                                                </View>
                                                <View className="items-end">
                                                    <Text className="text-4xl font-black text-muted/20 absolute -bottom-1 -right-1">
                                                        {getLetterGrade(courseData.currentGrade)}
                                                    </Text>
                                                    <Text className="text-2xl font-bold  /80 z-10" style={{ color: hexColors.foreground }}>
                                                        {getLetterGrade(courseData.currentGrade)}
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* Progress Bar */}
                                            <View className="h-2 bg-secondary rounded-full overflow-hidden mb-4">
                                                <View 
                                                    className="h-full rounded-full" 
                                                    style={{ 
                                                        width: `${Math.min(Math.max(courseData.currentGrade || 0, 0), 100)}%`,
                                                        backgroundColor: getGradeColor(courseData.currentGrade)
                                                    }} 
                                                />
                                            </View>

                                            <View className="flex-row justify-between pt-2 border-t border-border/50">
                                                <View className="flex-row items-center">
                                                    <Ionicons name="trending-up" size={14} color="#10B981" style={{ marginRight: 4 }} />
                                                    <Text className="text-xs " style={{ color: hexColors.mutedForeground }}>
                                                        Best: <Text className="font-bold " style={{ color: hexColors.foreground }}>{courseData.bestCase !== null ? `${courseData.bestCase.toFixed(1)}%` : '--'}</Text>
                                                    </Text>
                                                </View>
                                                <View className="flex-row items-center">
                                                    <Ionicons name="trending-down" size={14} color="#EF4444" style={{ marginRight: 4 }} />
                                                    <Text className="text-xs " style={{ color: hexColors.mutedForeground }}>
                                                        Worst: <Text className="font-bold " style={{ color: hexColors.foreground }}>{courseData.worstCase !== null ? `${courseData.worstCase.toFixed(1)}%` : '--'}</Text>
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </Animated.View>
                        ))
                    )}
                </ScrollView>

                {/* Floating Action Button */}
                {courses.length > 0 && (
                    <Animated.View 
                        entering={FadeInRight.delay(500).springify()}
                        className="absolute bottom-24 right-6 z-50"
                    >
                        <View className="flex-row items-center justify-end">
                            {fabHovered && (
                                <Animated.View 
                                    entering={FadeInRight.springify().damping(15)}
                                    exiting={FadeOutRight.duration(200)}
                                    className="mr-3 bg-foreground/90 px-3 py-1.5 rounded-lg shadow-sm"
                                >
                                    <Text className="text-xs font-bold text-background">Add Course</Text>
                                </Animated.View>
                            )}
                            <Pressable
                                className="w-14 h-14 rounded-full bg-primary items-center justify-center shadow-xl shadow-primary/40"
                                onPress={() => router.push('/(student)/courses/add')}
                                // @ts-ignore
                                onHoverIn={() => setFabHovered(true)}
                                onHoverOut={() => setFabHovered(false)}
                                style={({ pressed }) => ({
                                    transform: [{ scale: pressed ? 0.95 : 1 }]
                                })}
                            >
                                <Ionicons name="add" size={30} color="white" />
                            </Pressable>
                        </View>
                    </Animated.View>
                )}

                {/* Archive Button - Fixed at bottom of screen */}
                {hasAnyHistoricalCourses && (
                    <View className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-2  border-t border-border" style={{ backgroundColor: hexColors.background }}>
                        <TouchableOpacity
                            className="py-4 px-6 rounded-2xl  borderWidth: 1, borderColor: hexColors.border items-center flex-row justify-center" style={{ backgroundColor: hexColors.card }}
                            onPress={() => router.push('/(student)/courses/archive')}
                        >
                            <Ionicons name='archive-outline' size={20} color={theme.colors.foreground} style={{marginRight: 8}} />
                            <Text className="text-base font-semibold " style={{ color: hexColors.foreground }}>View Course Archive</Text>
                            <Ionicons name='chevron-forward' size={20} color={theme.colors.mutedForeground} style={{ marginLeft: 4 }} />
                        </TouchableOpacity>
                    </View>
                )}
            </SafeAreaView>
        </View>
    );
}
