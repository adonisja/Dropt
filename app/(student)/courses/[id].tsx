import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
    SafeAreaView,
    Alert,
    Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth/auth-context';
import { useTheme } from '@/lib/theme/theme-context';
import {
    fetchStudentCourses,
    fetchCompleteCourseData,
    transformToStudentCourseData,
    CourseWithGrades,
    deleteStudentCourseAssessment,
    deleteAssignment,
} from '@/lib/api/data-client';
import { calculateCurrentGrade } from '@/lib/logic/calculateCurrentGrade';
import { calculateBestCase } from '@/lib/logic/calculateBestCase';
import { calculateAverageCase, AssumptionMode } from '@/lib/logic/calculateAverageCase';
import { calculateWorstCase } from '@/lib/logic/calculateWorstCase';
import { calculateRecommendation, RecommendationInput, RecommendationResult, generateAIAdviceForCourse } from '@/lib/logic/recommendation-engine';
import RecommendationCard from '@/components/RecommendationCard';

interface CategoryBreakdown {
    category: string;
    weight: number;
    earnedPercentage: number | null;
    earnedPoints: number;
    totalPoints: number;
    gradedCount: number;
    totalCount: number;
    dropLowest?: number | null;
}

export default function CourseDetails() {
    const { user } = useAuth();
    const { theme, hexColors, isDark } = useTheme();
    const { id: courseId } = useLocalSearchParams<{ id: string }>();

    const [courseData, setCourseData] = useState<CourseWithGrades | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recommendationScore, setRecommendationScore] = useState<RecommendationResult | null>(null);
    const [aiAdvice, setAiAdvice] = useState<string | null>(null);
    const [assumptionMode, setAssumptionMode] = useState<AssumptionMode>('maintain');

    const loadCourseData = useCallback(async () => {
        if (!user?.id || !courseId) {
            setError('Missing course information');
            setIsLoading(false);
            return;
        }

        try {
            setError(null);
            const data = await fetchCompleteCourseData(user.id, courseId);

            if (!data) {
                setError('Course not found');
            } else {
                setCourseData(data);
            }
        } catch (err) {
            console.error('Error loading course data:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            if (errorMessage.includes('Network') || errorMessage.includes('fetch')) {
                setError('Unable to connect. Please check your internet connection.');
            } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
                setError('Session expired. Please log in again.');
            } else {
                setError(`Failed to load course: ${errorMessage}`);
            }
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [user?.id, courseId]);

    useFocusEffect(
        useCallback(() => {
            loadCourseData();
        }, [loadCourseData])
    );

    // Calculate derived data (grades, projections)
    const derivedData = useMemo(() => {
        if (!courseData) return { currentGrade: null, bestCase: null, worstCase: null, averageCase: null };
        
        const { categories, assignments } = courseData;
        const gradedAssignments = assignments.filter(a => a.scoreEarned !== null);
        
        let currentGrade: number | null = null;
        let bestCase: number | null = null;
        let worstCase: number | null = null;
        let averageCase: number | null = null;

        if (categories.length > 0 && assignments.length > 0) {
            const studentCourseDataFormat = transformToStudentCourseData(courseData);

            if (gradedAssignments.length > 0) {
                currentGrade = calculateCurrentGrade(studentCourseDataFormat);
                averageCase = calculateAverageCase(studentCourseDataFormat, assumptionMode);
            }

            bestCase = calculateBestCase(studentCourseDataFormat);
            worstCase = calculateWorstCase(studentCourseDataFormat);
        }
        return { currentGrade, bestCase, worstCase, averageCase };
    }, [courseData, assumptionMode]);

    const { currentGrade, bestCase, worstCase, averageCase } = derivedData;

    // Calculate Recommendation Score
    useEffect(() => {
        if (currentGrade !== null && courseData) {
            const recommendationInput: RecommendationInput = {
                courseName: courseData.studentCourse.courseName,
                currentGrade: currentGrade,
                isRequired: courseData.studentCourse.isRequired ?? false,
                stressLevel: courseData.studentCourse.stressLevel ?? 5,
                weeklyHours: courseData.studentCourse.weeklyTimeInvestment ?? 0,
                passingGrade: courseData.studentCourse.passingGrade ?? 60,
            };
            const result = calculateRecommendation(recommendationInput);
            setRecommendationScore(result);
        }
    }, [currentGrade, courseData]);

    useEffect(() => {
        const fetchAdvice = async () => {
            if (courseData && recommendationScore && currentGrade !== null) {
                const input: RecommendationInput = {
                    courseName: courseData.studentCourse.courseName,
                    currentGrade: currentGrade,
                    isRequired: courseData.studentCourse.isRequired ?? false,
                    stressLevel: courseData.studentCourse.stressLevel ?? 5,
                    weeklyHours: courseData.studentCourse.weeklyTimeInvestment ?? 0,
                    passingGrade: courseData.studentCourse.passingGrade ?? 60,
                };

                // Create a cache key based on the input data
                // We include courseId and the specific values that affect advice
                const cacheKey = `ai_advice_${courseId}_${input.currentGrade.toFixed(1)}_${input.stressLevel}_${input.weeklyHours}_${input.passingGrade}_${recommendationScore.riskLevel}`;
                
                try {
                    const cachedAdvice = await AsyncStorage.getItem(cacheKey);
                    if (cachedAdvice) {
                        console.log('Using cached AI advice');
                        setAiAdvice(cachedAdvice);
                        return;
                    }
                } catch (e) {
                    console.log('Error reading cache', e);
                }

                // If not in cache, generate new advice
                try {
                    console.log('Generating new AI advice for:', courseData.studentCourse.courseName);
                    const advice = await generateAIAdviceForCourse(input, recommendationScore);
                    if (advice) {
                        setAiAdvice(advice);
                        await AsyncStorage.setItem(cacheKey, advice);
                    } else {
                        console.warn('AI returned empty advice for:', courseData.studentCourse.courseName);
                        setAiAdvice('Unable to generate personalized advice at this time. Please try again later.');
                    }
                } catch (e) {
                    console.error('Error generating advice for', courseData.studentCourse.courseName, ':', e);
                    // Set a fallback message so user knows there was an issue
                    setAiAdvice('Unable to generate personalized advice at this time. Please check your connection and try again.');
                }
            }
        };
        
        fetchAdvice();
    }, [courseData, recommendationScore, currentGrade, courseId]);

    const onRefresh = () => {
        setRefreshing(true);
        loadCourseData();
    };

    const getGradeColor = (grade: number): string => {
        if (grade >= 90) return '#10B981'; // emerald-500
        if (grade >= 80) return '#84CC16'; // lime-500
        if (grade >= 70) return '#EAB308'; // yellow-500
        if (grade >= 60) return '#F97316'; // orange-500
        return '#EF4444'; // red-500
    };

    if (isLoading) {
        return (
            <View className="flex-1" style={{ backgroundColor: hexColors.background }}>
                <View className="flex-1 justify-center items-center p-6">
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text className="mt-4 text-base font-medium  animate-pulse" style={{ color: hexColors.mutedForeground }}>
                        Loading course details...
                    </Text>
                </View>
            </View>
        );
    }

    if (error || !courseData) {
        return (
            <View className="flex-1" style={{ backgroundColor: hexColors.background }}>
                <View className="flex-1 justify-center items-center p-8">
                    <View className="w-16 h-16 bg-destructive/10 rounded-full items-center justify-center mb-4">
                        <Ionicons name="alert-circle" size={32} color={theme.colors.destructive} />
                    </View>
                    <Text className="text-lg font-semibold mb-2">Course Not Found</Text>
                    <Text className="text-sm text-center mb-6  leading-5" style={{ color: hexColors.mutedForeground }}>{error || 'Could not load course data.'}</Text>
                    <TouchableOpacity
                        className="py-3 px-8 rounded-full bg-primary shadow-lg shadow-primary/30"
                        onPress={() => router.back()}
                    >
                        <Text className="text-base font-semibold  -foreground" style={{ color: hexColors.primary }}>
                            Go Back
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const { studentCourse, categories, assignments } = courseData;

    // Calculate category breakdowns
    const categoryBreakdowns: CategoryBreakdown[] = categories.map(cat => {
        const categoryAssignments = assignments.filter(a => a.category === cat.category);
        const gradedInCategory = categoryAssignments.filter(a => a.scoreEarned !== null);

        let earnedPoints = 0;
        let totalPoints = 0;
        let earnedPercentage: number | null = null;

        if (gradedInCategory.length > 0) {
            // Calculate raw scores for this category
            const scores = gradedInCategory.map(a => ({
                earned: a.scoreEarned!,
                max: a.maxScore,
                percentage: (a.scoreEarned! / a.maxScore) * 100
            }));

            // Sort by percentage (ascending) to handle dropLowest
            scores.sort((a, b) => a.percentage - b.percentage);

            // Drop lowest if applicable
            const scoresToUse = cat.dropLowest && cat.dropLowest > 0 && scores.length > cat.dropLowest
                ? scores.slice(cat.dropLowest)
                : scores;

            earnedPoints = scoresToUse.reduce((sum, s) => sum + s.earned, 0);
            totalPoints = scoresToUse.reduce((sum, s) => sum + s.max, 0);
            earnedPercentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : null;
        }

        return {
            category: cat.category,
            weight: cat.weight,
            earnedPercentage,
            earnedPoints,
            totalPoints,
            gradedCount: gradedInCategory.length,
            totalCount: categoryAssignments.length,
            dropLowest: cat.dropLowest,
        };
    });

    // Group assignments by category
    const assignmentsByCategory: Record<string, typeof assignments> = {};
    for (const assignment of assignments) {
        if (!assignmentsByCategory[assignment.category]) {
            assignmentsByCategory[assignment.category] = [];
        }
        assignmentsByCategory[assignment.category].push(assignment);
    }

    // Check if assessment data exists
    const hasAssessment = () => {
        return studentCourse.stressLevel !== null ||
               studentCourse.weeklyTimeInvestment !== null ||
               studentCourse.impactOnOtherCourses !== null ||
               studentCourse.overallWellbeing !== null ||
               studentCourse.semesterCreditHours !== null ||
               studentCourse.otherCoursesCount !== null ||
               studentCourse.currentGPA !== null;
    };

    // Get color based on stress level (1-10)
    const getStressColor = (value: number): string => {
        if (value <= 3) return '#10B981';  // Green (low stress)
        if (value <= 7) return '#EAB308';  // Yellow/Orange (medium)
        return '#EF4444';  // Red (high stress)
    };

    // Handle delete assessment
    const handleDeleteAssessment = async () => {
        Alert.alert(
            'Delete Assessment',
            'Are you sure you want to delete this course assessment? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        if (!user?.id) return;
                        await deleteStudentCourseAssessment(user.id, courseId);
                        loadCourseData(); // Refresh to show updated state
                    }
                }
            ]
        );
    };

    // Handle delete assignment
    const handleDeleteAssignment = async (assignmentId: string, assignmentName: string) => {
        console.log('Delete requested for:', assignmentId);
        
        const performDelete = async () => {
            if (!user?.id || !courseId) return;
            const studentCourseId = `${user.id}#${courseId}`;
            await deleteAssignment(studentCourseId, assignmentId);
            loadCourseData(); 
        };

        if (Platform.OS === 'web') {
            if (window.confirm(`Are you sure you want to delete "${assignmentName}"? This action cannot be undone.`)) {
                await performDelete();
            }
        } else {
            Alert.alert(
                'Delete Assignment',
                `Are you sure you want to delete "${assignmentName}"? This action cannot be undone.`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: performDelete
                    }
                ]
            );
        }
    };

    return (
        <View className="flex-1" style={{ backgroundColor: hexColors.background }}>
            <SafeAreaView className="flex-1">
                <View className="relative py-2 flex-row justify-center items-center border-b border-border/50">
                    <View className="items-center px-12">
                        <Text className="text-lg font-bold text-center" numberOfLines={1}>
                            {studentCourse.courseName}
                        </Text>
                        <Text className="text-xs  text-center" style={{ color: hexColors.mutedForeground }}>
                            {studentCourse.courseId}
                        </Text>
                    </View>
                    <TouchableOpacity 
                        className="absolute right-4 p-2 rounded-full active:bg-secondary"
                        onPress={() => router.push({
                            pathname: '/(student)/courses/edit',
                            params: { courseId: studentCourse.courseId }
                        })}
                    >
                        <Ionicons name="pencil-outline" size={20} color={theme.colors.foreground} />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    className="flex-1 px-4 pt-4"
                    refreshControl={
                        <RefreshControl 
                            refreshing={refreshing} 
                            onRefresh={onRefresh}
                            tintColor={theme.colors.primary}
                        />
                    }
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Current Grade Card */}
                    <Animated.View 
                        entering={FadeInDown.delay(100).springify()}
                        className="rounded-2xl p-6 mb-6 borderWidth: 1, borderColor: hexColors.border shadow-sm"
                    >
                        <View className="flex-row justify-between items-start mb-4">
                            <View>
                                <Text className="text-sm font-medium  uppercase tracking-wider mb-1" style={{ color: hexColors.mutedForeground }}>
                                    Current Grade
                                </Text>
                                {currentGrade !== null ? (
                                    <Text className="text-4xl font-bold" style={{ color: getGradeColor(currentGrade) }}>
                                        {currentGrade.toFixed(1)}%
                                    </Text>
                                ) : (
                                    <Text className="text-2xl font-bold " style={{ color: hexColors.mutedForeground }}>
                                        No grades yet
                                    </Text>
                                )}
                            </View>
                            <View className="w-12 h-12 rounded-full bg-secondary items-center justify-center">
                                <Ionicons name="school" size={24} color={theme.colors.primary} />
                            </View>
                        </View>

                        {/* Grade Projections */}
                        {(bestCase !== null || worstCase !== null) && (
                            <View className="pt-4 border-t border-border/50">
                                {/* Assumption Toggles */}
                                <View className="flex-row justify-between mb-3 bg-secondary/30 p-1 rounded-lg">
                                    {(['maintain', 'optimistic', 'realistic', 'conservative', 'pessimistic'] as AssumptionMode[]).map((mode) => (
                                        <TouchableOpacity
                                            key={mode}
                                            onPress={() => setAssumptionMode(mode)}
                                            className="flex-1 py-1.5 px-2 rounded-md items-center"
                                            style={{
                                                backgroundColor: assumptionMode === mode 
                                                    ? hexColors.primary 
                                                    : hexColors.background,
                                                shadowOpacity: assumptionMode === mode ? 0.1 : 0,
                                                shadowRadius: assumptionMode === mode ? 2 : 0
                                            }}
                                        >
                                            <Text 
                                                className="text-[10px] font-medium capitalize"
                                                style={{ 
                                                    color: assumptionMode === mode 
                                                        ? hexColors.primaryForeground 
                                                        : hexColors.mutedForeground 
                                                }}
                                            >
                                                {mode}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <View className="flex-row gap-4">
                                    {bestCase !== null && (
                                        <View className="flex-1 bg-green-500/10 rounded-xl p-3">
                                            <View className="flex-row items-center mb-1">
                                                <Ionicons name="trending-up" size={14} color="#10B981" style={{ marginRight: 4 }} />
                                                <Text className="text-xs font-bold text-green-600 dark:text-green-400 uppercase">Best Case</Text>
                                            </View>
                                            <Text className="text-lg font-bold text-green-700 dark:text-green-300">
                                                {bestCase.toFixed(1)}%
                                            </Text>
                                        </View>
                                    )}
                                    
                                    {averageCase !== null && (
                                        <View className="flex-1 bg-blue-500/10 rounded-xl p-3">
                                            <View className="flex-row items-center mb-1">
                                                <Ionicons name="analytics" size={14} color="#3B82F6" style={{ marginRight: 4 }} />
                                                <Text className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">Projected</Text>
                                            </View>
                                            <Text className="text-lg font-bold text-blue-700 dark:text-blue-300">
                                                {averageCase.toFixed(1)}%
                                            </Text>
                                        </View>
                                    )}

                                    {worstCase !== null && (
                                        <View className="flex-1 bg-red-500/10 rounded-xl p-3">
                                            <View className="flex-row items-center mb-1">
                                                <Ionicons name="trending-down" size={14} color="#EF4444" style={{ marginRight: 4 }} />
                                                <Text className="text-xs font-bold text-red-600 dark:text-red-400 uppercase">Worst Case</Text>
                                            </View>
                                            <Text className="text-lg font-bold text-red-700 dark:text-red-300">
                                                {worstCase.toFixed(1)}%
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        )}

                        {/* Action Buttons */}
                        <View className="flex-row gap-3 mt-4">
                            {assignments.length > 0 && (
                                <TouchableOpacity
                                    className="flex-1 bg-primary py-3 rounded-xl flex-row items-center justify-center shadow-sm"
                                    onPress={() => router.push({
                                        pathname: '/(student)/tools/calculator',
                                        params: { courseId: studentCourse.courseId }
                                    })}
                                >
                                    <Ionicons name="calculator-outline" size={18} color="white" style={{ marginRight: 6 }} />
                                    <Text className="text-white font-semibold text-sm">What-If</Text>
                                </TouchableOpacity>
                            )}
                            
                            <TouchableOpacity
                                className={`flex-1 py-3 rounded-xl flex-row items-center justify-center shadow-sm ${hasAssessment() ? 'bg-secondary' : 'bg-green-600'}`}
                                onPress={() => router.push({
                                    pathname: '/(student)/courses/assessment',
                                    params: { courseId: studentCourse.courseId }
                                })}
                            >
                                <Ionicons 
                                    name={hasAssessment() ? "create-outline" : "add-circle-outline"} 
                                    size={18} 
                                    color={hasAssessment() ? theme.colors.foreground : "white"} 
                                    style={{ marginRight: 6 }} 
                                />
                                <Text className={`font-semibold text-sm ${hasAssessment() ? 'text-foreground' : 'text-white'}`}>
                                    {hasAssessment() ? 'Edit Assessment' : 'Add Assessment'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Email Generator Button */}
                        <TouchableOpacity
                            className="mt-3 bg-secondary py-3 rounded-xl flex-row items-center justify-center shadow-sm borderWidth: 1, borderColor: hexColors.border"
                            onPress={() => router.push({
                                pathname: '/(student)/tools/email-generator',
                                params: { 
                                    courseName: studentCourse.courseName,
                                    professorName: studentCourse.instructor,
                                    currentGrade: currentGrade?.toFixed(1)
                                }
                            })}
                        >
                            <Ionicons name="mail-outline" size={18} color={theme.colors.foreground} style={{ marginRight: 6 }} />
                            <Text className="font-semibold text-sm" style={{ color: hexColors.foreground }}>Email Professor</Text>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Category Breakdown */}
                    <Animated.View 
                        entering={FadeInDown.delay(200).springify()}
                        className="mb-6"
                    >
                        <Text className="text-sm font-semibold  uppercase tracking-wider mb-3 px-1" style={{ color: hexColors.mutedForeground }}>
                            Grade Breakdown
                        </Text>
                        
                        {categoryBreakdowns.map((cat, index) => (
                            <View 
                                key={index}
                                className="rounded-xl p-4 mb-3 borderWidth: 1, borderColor: hexColors.border shadow-sm"
                            >
                                <View className="flex-row justify-between items-center mb-2">
                                    <View className="flex-row items-center">
                                        <View className="w-2 h-8 rounded-full bg-primary mr-3" />
                                        <View>
                                            <Text className="text-base font-bold " style={{ color: hexColors.foreground }}>
                                                {cat.category}
                                            </Text>
                                            <Text className="text-xs " style={{ color: hexColors.mutedForeground }}>
                                                Weight: {cat.weight}% {cat.dropLowest ? `• Drop Lowest: ${cat.dropLowest}` : ''}
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="items-end">
                                        <Text className="text-lg font-bold " style={{ color: hexColors.foreground }}>
                                            {cat.earnedPercentage !== null ? `${cat.earnedPercentage.toFixed(1)}%` : '--'}
                                        </Text>
                                        <Text className="text-xs " style={{ color: hexColors.mutedForeground }}>
                                            {cat.earnedPoints.toFixed(1)} / {cat.totalPoints} pts
                                        </Text>
                                    </View>
                                </View>
                                
                                {/* Progress Bar */}
                                <View className="h-1.5 bg-secondary rounded-full overflow-hidden mt-1">
                                    <View 
                                        className="h-full rounded-full bg-primary" 
                                        style={{ 
                                            width: `${Math.min(Math.max(cat.earnedPercentage || 0, 0), 100)}%`,
                                            opacity: cat.earnedPercentage === null ? 0 : 1
                                        }} 
                                    />
                                </View>
                            </View>
                        ))}
                    </Animated.View>

                    {/* Assignments List */}
                    <Animated.View 
                        entering={FadeInDown.delay(300).springify()}
                        className="mb-8"
                    >
                        <View className="flex-row justify-between items-center mb-3 px-1">
                            <Text className="text-sm font-semibold  uppercase tracking-wider" style={{ color: hexColors.mutedForeground }}>
                                Assignments
                            </Text>
                            <TouchableOpacity 
                                onPress={() => router.push({
                                    pathname: '/(student)/assignments/add',
                                    params: { courseId: studentCourse.courseId }
                                })}
                                className="flex-row items-center"
                            >
                                <Ionicons name="add" size={16} color={theme.colors.primary} />
                                <Text className="text-sm font-bold  ml-1" style={{ color: hexColors.primary }}>Add New</Text>
                            </TouchableOpacity>
                        </View>

                        {assignments.length === 0 ? (
                            <View className="rounded-xl p-8 items-center border border-dashed border-border">
                                <Ionicons name="document-text-outline" size={32} color={theme.colors.mutedForeground} />
                                <Text className="mt-2 text-center" style={{ color: hexColors.mutedForeground }}>
                                    No assignments added yet.
                                </Text>
                            </View>
                        ) : (
                            Object.entries(assignmentsByCategory).map(([category, categoryAssignments]) => (
                                <View key={category} className="mb-4">
                                    <Text className="text-xs font-bold  mb-2 ml-1 uppercase" style={{ color: hexColors.primary }}>
                                        {category}
                                    </Text>
                                    {categoryAssignments.map((assignment, idx) => (
                                        <View 
                                            key={idx}
                                            className="rounded-xl mb-2 borderWidth: 1, borderColor: hexColors.border flex-row items-center overflow-hidden"
                                        >
                                            <TouchableOpacity
                                                className="flex-1 p-4 flex-row justify-between items-center"
                                                onPress={() => router.push({
                                                    pathname: '/(student)/assignments/edit',
                                                    params: { 
                                                        courseId: studentCourse.courseId,
                                                        assignmentId: assignment.assignmentId
                                                    }
                                                })}
                                            >
                                                <View className="flex-1 mr-4">
                                                    <Text className="text-base font-medium mb-1">
                                                        {assignment.assignmentName}
                                                    </Text>
                                                    <Text className="text-xs " style={{ color: hexColors.mutedForeground }}>
                                                        Max Score: {assignment.maxScore}
                                                    </Text>
                                                </View>
                                                <View className="items-end">
                                                    {assignment.scoreEarned != null ? (
                                                        <>
                                                            <Text className="text-lg font-bold " style={{ color: hexColors.foreground }}>
                                                                {assignment.scoreEarned}
                                                            </Text>
                                                            <Text className="text-xs " style={{ color: hexColors.mutedForeground }}>
                                                                {((assignment.scoreEarned / assignment.maxScore) * 100).toFixed(0)}%
                                                            </Text>
                                                        </>
                                                    ) : (
                                                        <Text className="text-sm  italic" style={{ color: hexColors.mutedForeground }}>
                                                            --
                                                        </Text>
                                                    )}
                                                </View>
                                            </TouchableOpacity>
                                            
                                            <TouchableOpacity
                                                className="p-4 justify-center border-l border-border/50 active:bg-destructive/10"
                                                onPress={() => handleDeleteAssignment(assignment.assignmentId, assignment.assignmentName)}
                                            >
                                                <Ionicons name="trash-outline" size={20} color={theme.colors.destructive} />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            ))
                        )}
                    </Animated.View>

                    {/* Assessment Details (if exists) */}
                    {hasAssessment() && (
                        <Animated.View 
                            entering={FadeInDown.delay(400).springify()}
                            className="mb-8"
                        >
                            <View className="flex-row justify-between items-center mb-3 px-1">
                                <Text className="text-sm font-semibold  uppercase tracking-wider" style={{ color: hexColors.mutedForeground }}>
                                    Course Assessment
                                </Text>
                                <TouchableOpacity onPress={handleDeleteAssessment}>
                                    <Text className="text-xs font-bold text-destructive">Delete</Text>
                                </TouchableOpacity>
                            </View>
                            
                            <View className="rounded-xl p-4 borderWidth: 1, borderColor: hexColors.border shadow-sm">
                                {studentCourse.stressLevel != null && (
                                    <View className="flex-row justify-between items-center py-3 border-b border-border/50">
                                        <View className="flex-row items-center">
                                            <Ionicons name="pulse" size={18} color={theme.colors.mutedForeground} style={{ marginRight: 8 }} />
                                            <Text className="text" style={{ color: hexColors.foreground }}>Stress Level</Text>
                                        </View>
                                        <View className="flex-row items-center">
                                            <View 
                                                className="w-3 h-3 rounded-full mr-2" 
                                                style={{ backgroundColor: getStressColor(studentCourse.stressLevel) }} 
                                            />
                                            <Text className="font-bold " style={{ color: hexColors.foreground }}>{studentCourse.stressLevel}/10</Text>
                                        </View>
                                    </View>
                                )}
                                
                                {studentCourse.weeklyTimeInvestment !== null && (
                                    <View className="flex-row justify-between items-center py-3 border-b border-border/50">
                                        <View className="flex-row items-center">
                                            <Ionicons name="time-outline" size={18} color={theme.colors.mutedForeground} style={{ marginRight: 8 }} />
                                            <Text className="text" style={{ color: hexColors.foreground }}>Weekly Time</Text>
                                        </View>
                                        <Text className="font-bold " style={{ color: hexColors.foreground }}>{studentCourse.weeklyTimeInvestment} hours</Text>
                                    </View>
                                )}

                                {studentCourse.overallWellbeing !== null && (
                                    <View className="flex-row justify-between items-center py-3">
                                        <View className="flex-row items-center">
                                            <Ionicons name="happy-outline" size={18} color={theme.colors.mutedForeground} style={{ marginRight: 8 }} />
                                            <Text className="text" style={{ color: hexColors.foreground }}>Wellbeing Impact</Text>
                                        </View>
                                        <Text className="font-bold " style={{ color: hexColors.foreground }}>{studentCourse.overallWellbeing}/10</Text>
                                    </View>
                                )}
                            </View>
                        </Animated.View>
                    )}

                    {/* Recommendation Score Card */}
                    {recommendationScore !== null && (
                        <RecommendationCard result={recommendationScore} aiAdvice={aiAdvice} />
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
