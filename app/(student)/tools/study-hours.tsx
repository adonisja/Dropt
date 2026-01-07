import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth/auth-context';

import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/theme-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { fetchStudentCourses, getOrCreateUserSettings } from '@/lib/api/data-client';
import { detectCurrentSemester } from '@/lib/utils/semester-utils';
import type { Schema } from '@/amplify/data/resource';

interface CourseStudyData {
    courseName: string;
    department: string;
    weeklyStudyHours: number;
    classDays?: string;
}

export default function StudyHoursBreakdown() {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [courses, setCourses] = useState<CourseStudyData[]>([]);
    const [totalStudyHours, setTotalStudyHours] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStudyData();
    }, [user?.id]);

    const loadStudyData = async () => {
        if (!user?.id) return;

        try {
            // Get current semester
            const { semester, year } = detectCurrentSemester();
            const settings = await getOrCreateUserSettings(user.id, semester, year);

            // Fetch current semester courses
            const allCourses = await fetchStudentCourses(user.id);
            const currentSemesterCourses = allCourses.filter(c => 
                c.semester === settings?.currentSemester && 
                c.year === settings?.currentYear
            );

            // Transform to study data
            const studyData: CourseStudyData[] = currentSemesterCourses.map(course => ({
                courseName: course.courseName,
                department: course.department || 'COURSE',
                weeklyStudyHours: course.weeklyTimeInvestment || 0,
                classDays: course.classDays || undefined
            }));

            // Calculate total
            const total = studyData.reduce((sum, c) => sum + c.weeklyStudyHours, 0);

            setCourses(studyData);
            setTotalStudyHours(total);
        } catch (err) {
            console.error('Error loading study hours:', err);
        } finally {
            setIsLoading(false);
        }
    };
    
    if (isLoading) {
        return (
            <View className="flex-1 bg-background justify-center items-center">
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        )
    }

    return (
        <View className="flex-1 bg-background">
            <Stack.Screen options={{ title: 'Study Hours' }} />
            <SafeAreaView className="flex-1">
                {/* Header */}
                <View className="px-6 pt-4 pb-2">
                    <Text className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Weekly Commitment
                    </Text>
                    <Text className="text-3xl font-bold text-foreground">
                        {totalStudyHours} Hours
                    </Text>
                </View>

                <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                    {courses.length === 0 ? (
                        <View className="items-center justify-center py-20">
                            <Ionicons name="time-outline" size={64} color={theme.colors.mutedForeground} />
                            <Text className="text-lg font-semibold text-foreground mt-4">
                                No Study Hours Tracked
                            </Text>
                            <Text className="text-sm text-muted-foreground text-center mt-2 px-8">
                                Add study hours to your courses to see your weekly breakdown.
                            </Text>
                        </View>
                    ) : (
                        <>
                            <Text className="text-lg font-bold text-foreground mb-4 mt-6">
                                Course Breakdown
                            </Text>

                            {courses.map((course, index) => (
                                <Animated.View
                                    key={`${course.department}-${course.courseName}`}
                                    entering={FadeInDown.delay(index * 100).springify().damping(15)}
                                    className="mb-4"
                                >
                                    <View className="bg-card rounded-2xl p-4 border border-border">
                                        <View className="flex-row justify-between items-start mb-3">
                                            <View className="flex-1">
                                                <Text className="text-xs font-bold text-primary uppercase tracking-wide mb-1">
                                                    {course.department}
                                                </Text>
                                                <Text className="text-lg font-bold text-card-foreground">
                                                    {course.courseName}
                                                </Text>
                                                {course.classDays && (
                                                    <Text className="text-sm text-muted-foreground mt-1">
                                                        {course.classDays}
                                                    </Text>
                                                )}
                                            </View>
                                            <View className="bg-teal-500/10 px-3 py-2 rounded-full">
                                                <Text className="text-lg font-black text-teal-600">
                                                    {course.weeklyStudyHours}h
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Progress bar showing portion of total */}
                                        <View className="h-2 bg-secondary rounded-full overflow-hidden">
                                            <View
                                                className="h-full bg-teal-500 rounded-full"
                                                style={{
                                                    width: `${totalStudyHours > 0 ? (course.weeklyStudyHours / totalStudyHours) * 100 : 0}%`
                                                }}
                                            />
                                        </View>
                                        <Text className="text-xs text-muted-foreground mt-2">
                                            {totalStudyHours > 0 ? ((course.weeklyStudyHours / totalStudyHours) * 100).toFixed(1) : 0}% of weekly study time
                                        </Text>
                                    </View>
                                </Animated.View>
                            ))}

                            {/* Summary Card */}
                            <View className="bg-primary/5 rounded-2xl p-4 border border-primary/20 mt-4 mb-6">
                                <View className="flex-row items-center mb-2">
                                    <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
                                    <Text className="text-sm font-bold text-foreground ml-2">
                                        Study Tip
                                    </Text>
                                </View>
                                <Text className="text-sm text-muted-foreground leading-5">
                                    Most students study 2-3 hours per week for each credit hour. For a 3-credit course, that's 6-9 hours per week.
                                </Text>
                            </View>
                        </>
                    )}
                 </ScrollView>
            </SafeAreaView>
        </View>
    )
}
