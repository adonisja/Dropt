import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/theme-context';
import GradeDistributionChart from '@/components/GradeDistributionChart';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { fetchStudentCourses, fetchCompleteCourseData, transformToStudentCourseData } from '@/lib/api/data-client';
import { calculateCurrentGrade } from '@/lib/logic/calculateCurrentGrade';
import { calculateSemesterGPA } from '@/lib/logic/calculateGPA';

// Mock data for the chart
const MOCK_GRADE_DISTRIBUTION = [
    { label: 'A', value: 12 },
    { label: 'B', value: 8 },
    { label: 'C', value: 4 },
    { label: 'D', value: 2 },
    { label: 'F', value: 1 },
];

interface GradeDistribution {
    label: string;
    value: number;
}

export default function Analytics() {
    const { theme } = useTheme();
    const [ gradeData, setGradeData ] = useState<GradeDistribution[]>([]);
    const [ stressData, setStressData ] = useState<{courseName: string, stress: number}[]>([]);
    const [ currentGPA, setCurrentGPA ] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const { user, isLoading: authLoading } = useAuth();

    useEffect(() => {
        const loadAnalyticsData = async () => {
            if (authLoading || !user?.id) return;

            try {
                setIsLoading(true);
                const studentCourses = await fetchStudentCourses(user.id);
                
                if (studentCourses.length === 0) {
                    setGradeData([]);
                    setStressData([]);
                    setCurrentGPA(0);
                    return;
                }

                const courseDataPromises = studentCourses.map(course => fetchCompleteCourseData(user.id, course.courseId));
                const completeCoursesData = await Promise.all(courseDataPromises);

                const gradeDistribution: Record<string, number> = { 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 };
                const coursesForGPA: { grade: number, credits?: number }[] = [];
                const stressList: {courseName: string, stress: number}[] = [];

                completeCoursesData.forEach(courseData => {
                    if (!courseData) return;

                    const studentCourseData = transformToStudentCourseData(courseData);
                    const currentGrade = calculateCurrentGrade(studentCourseData);

                    // GPA
                    coursesForGPA.push({ grade: currentGrade });

                    // Stress
                    if (courseData.studentCourse.stressLevel) {
                        stressList.push({
                            courseName: courseData.studentCourse.courseName,
                            stress: courseData.studentCourse.stressLevel
                        });
                    }

                    if (currentGrade >= 90) gradeDistribution['A']++;
                    else if (currentGrade >= 80) gradeDistribution['B']++;
                    else if (currentGrade >= 70) gradeDistribution['C']++;
                    else if (currentGrade >= 60) gradeDistribution['D']++;
                    else gradeDistribution['F']++;
                })

                const distributionArray = Object.entries(gradeDistribution).map(([label, value]) => ({ label, value }));
                setGradeData(distributionArray);
                setStressData(stressList);
                setCurrentGPA(calculateSemesterGPA(coursesForGPA));

            } catch (error) {
                console.error('Error fetching analytics data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadAnalyticsData();

    }, [user?.id, authLoading]);

    const hasData = gradeData.some(d => d.value > 0);

    return (
        <View className="flex-1 bg-background">
            <SafeAreaView className="flex-1">
                <ScrollView 
                    className="flex-1 px-4 pt-2"
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View className="px-2 pt-4 pb-6">
                        <Text className="text-3xl font-bold text-foreground mb-1">Analytics</Text>
                        <Text className="text-base text-muted-foreground">
                            Performance Overview
                        </Text>
                    </View>

                    {/* GPA Card */}
                    <Animated.View 
                        entering={FadeInDown.delay(100).springify()}
                        className="bg-card rounded-2xl p-6 mb-6 border border-border shadow-sm flex-row items-center justify-between"
                    >
                        <View>
                            <Text className="text-sm text-muted-foreground mb-1">Semester GPA</Text>
                            <Text className="text-4xl font-bold text-primary">{currentGPA.toFixed(2)}</Text>
                        </View>
                        <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center">
                            <Ionicons name="school" size={32} color={theme.colors.primary} />
                        </View>
                    </Animated.View>

                    {/* Grade Distribution Chart */}
                    <Animated.View
                        entering={FadeInDown.delay(200).springify()}
                        className="mb-6"
                    >
                        {isLoading ? (
                            <View className="bg-card rounded-2xl p-4 border border-border shadow-sm h-[200px] items-center justify-center">
                                <Text className="text-muted-foreground">Loading chart...</Text>
                            </View>
                        ) : (
                            <GradeDistributionChart data={hasData ? gradeData : MOCK_GRADE_DISTRIBUTION} />
                        )}
                    </Animated.View>

                    {/* Stress Levels */}
                    <Animated.View 
                        entering={FadeInDown.delay(300).springify()}
                        className="bg-card rounded-2xl p-6 mb-4 border border-border shadow-sm"
                    >
                        <View className="flex-row items-center mb-4">
                            <Ionicons name="pulse" size={24} color="#EF4444" className="mr-2" />
                            <Text className="text-lg font-bold text-foreground ml-2">Stress Levels</Text>
                        </View>
                        
                        {stressData.length > 0 ? (
                            stressData.map((item, index) => (
                                <View key={index} className="mb-4 last:mb-0">
                                    <View className="flex-row justify-between mb-1">
                                        <Text className="text-sm font-medium text-foreground">{item.courseName}</Text>
                                        <Text className="text-sm text-muted-foreground">{item.stress}/10</Text>
                                    </View>
                                    <View className="h-2 bg-secondary rounded-full overflow-hidden">
                                        <View 
                                            className={`h-full rounded-full ${
                                                item.stress >= 8 ? 'bg-red-500' : 
                                                item.stress >= 5 ? 'bg-yellow-500' : 'bg-green-500'
                                            }`}
                                            style={{ width: `${(item.stress / 10) * 100}%` }}
                                        />
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text className="text-muted-foreground text-center py-4">No stress data available yet.</Text>
                        )}
                    </Animated.View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
