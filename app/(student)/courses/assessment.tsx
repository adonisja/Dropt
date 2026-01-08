import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Dimensions } from "react-native";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/lib/theme/theme-context";
import { fetchCompleteCourseData, updateStudentCourseAssessment } from "@/lib/api/data-client";
import FormError from "@/components/FormError";
import { logger } from '@/lib/utils/logger';
import Animated, { FadeIn, FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';

// AsyncStorage keys for shared semester context
const SHARED_CONTEXT_KEYS = {
    totalCredits: '@semester_shared_totalCredits',
    otherCoursesCount: '@semester_shared_otherCoursesCount',
    currentGPA: '@semester_shared_currentGPA',
    sleepAnswer: '@semester_shared_sleepAnswer',
    symptomsAnswer: '@semester_shared_symptomsAnswer'
};

const QUESTIONS = [
    {
        id: 'sleep',
        category: 'wellbeing',
        question: "How many hours of sleep are you getting on average?",
        options: [
            { label: "Less than 4 hours", score: 10 },
            { label: "4-6 hours", score: 7 },
            { label: "6-8 hours", score: 3 },
            { label: "8+ hours", score: 1 }
        ]
    },
    {
        id: 'symptoms',
        category: 'wellbeing',
        question: "Are you experiencing physical symptoms of stress? (Headaches, fatigue, etc.)",
        options: [
            { label: "Frequently", score: 10 },
            { label: "Sometimes", score: 6 },
            { label: "Rarely", score: 3 },
            { label: "Never", score: 1 }
        ]
    },
    {
        id: 'behind',
        category: 'impact',
        question: "Are you falling behind in other classes because of this one?",
        options: [
            { label: "Yes, significantly", score: 10 },
            { label: "Yes, a little", score: 7 },
            { label: "No, but it's close", score: 4 },
            { label: "No, I'm managing", score: 1 }
        ]
    },
    {
        id: 'confidence',
        category: 'academic',
        question: "How confident do you feel about passing this course?",
        options: [
            { label: "Not at all confident", score: 10 },
            { label: "Somewhat worried", score: 7 },
            { label: "Reasonably confident", score: 3 },
            { label: "Very confident", score: 1 }
        ]
    },
    {
        id: 'interest',
        category: 'academic',
        question: "How interested are you in the subject matter?",
        options: [
            { label: "I hate it", score: 10 },
            { label: "It's boring", score: 7 },
            { label: "It's okay", score: 4 },
            { label: "I love it", score: 1 }
        ]
    }
];

export default function CourseAssessmentPage() {
    const { user } = useAuth();
    const { theme, hexColors, isDark } = useTheme();
    const router = useRouter();
    const params = useLocalSearchParams<{ courseId: string }>();
    const courseId = typeof params.courseId === 'string' ? params.courseId : params.courseId?.[0];

    // Course info
    const [ courseName, setCourseName ] = useState<string>('');
    const [ isLoading, setIsLoading ] = useState<boolean>(true);

    // Wizard State
    const [ step, setStep ] = useState(1);
    const TOTAL_STEPS = 3;

    // Form Data
    const [ answers, setAnswers ] = useState<Record<string, number>>({});
    const [ weeklyHours, setWeeklyHours ] = useState('');
    const [ totalCredits, setTotalCredits ] = useState('');
    const [ otherCoursesCount, setOtherCoursesCount ] = useState('');
    const [ currentGPA, setCurrentGPA ] = useState('');

    // UI state
    const [ error, setError ] = useState<string | null>(null);
    const [ isSaving, setIsSaving ] = useState(false);

    useEffect(() => {
        if (user?.id && courseId) {
            loadCourseData();
        }
    }, [courseId, user?.id]);

    const loadCourseData = async () => {
        if (!user?.id || !courseId) {
            setError('Missing user or course information');
            setIsLoading(false);
            return;
        }

        try {
            setError(null);
            const data = await fetchCompleteCourseData(user.id, courseId);

            if (!data) {
                setError('Course not found');
                setIsLoading(false);
                return;
            }

            setCourseName(data.studentCourse.courseName);

            // Pre-fill course-specific data
            if (data.studentCourse.weeklyTimeInvestment) {
                setWeeklyHours(data.studentCourse.weeklyTimeInvestment.toString());
            }

            // Pre-fill semester-wide shared data from database first (if exists)
            let hasDbSharedData = false;
            if (data.studentCourse.semesterCreditHours) {
                setTotalCredits(data.studentCourse.semesterCreditHours.toString());
                hasDbSharedData = true;
            }
            if (data.studentCourse.otherCoursesCount !== null) {
                setOtherCoursesCount(data.studentCourse.otherCoursesCount.toString());
                hasDbSharedData = true;
            }
            if (data.studentCourse.currentGPA) {
                setCurrentGPA(data.studentCourse.currentGPA.toString());
                hasDbSharedData = true;
            }

            // Pre-fill sleep and symptoms scores from database (priority over AsyncStorage)
            const restoredAnswers: Record<string, number> = {};
            if (data.studentCourse.sleepScore) {
                restoredAnswers['sleep'] = data.studentCourse.sleepScore;
            }
            if (data.studentCourse.symptomsScore) {
                restoredAnswers['symptoms'] = data.studentCourse.symptomsScore;
            }

            // If no database data, try loading shared context from AsyncStorage
            if (!hasDbSharedData) {
                const [storedCredits, storedCoursesCount, storedGPA, storedSleep, storedSymptoms] = await Promise.all([
                    AsyncStorage.getItem(SHARED_CONTEXT_KEYS.totalCredits),
                    AsyncStorage.getItem(SHARED_CONTEXT_KEYS.otherCoursesCount),
                    AsyncStorage.getItem(SHARED_CONTEXT_KEYS.currentGPA),
                    AsyncStorage.getItem(SHARED_CONTEXT_KEYS.sleepAnswer),
                    AsyncStorage.getItem(SHARED_CONTEXT_KEYS.symptomsAnswer)
                ]);

                if (storedCredits) setTotalCredits(storedCredits);
                if (storedCoursesCount) setOtherCoursesCount(storedCoursesCount);
                if (storedGPA) setCurrentGPA(storedGPA);

                // Only restore from AsyncStorage if not already in database
                if (storedSleep && !restoredAnswers['sleep']) restoredAnswers['sleep'] = parseInt(storedSleep);
                if (storedSymptoms && !restoredAnswers['symptoms']) restoredAnswers['symptoms'] = parseInt(storedSymptoms);
            }

            // Apply all restored answers
            if (Object.keys(restoredAnswers).length > 0) {
                setAnswers(prev => ({ ...prev, ...restoredAnswers }));
            }

            setIsLoading(false);
        } catch (err) {
            logger.error('Error loading course for assessment', {
                source: 'assessment.loadCourseData',
                userId: user?.id,
                data: { error: err, courseId }
            });
            setError(`Failed to load course data.`);
            setIsLoading(false);
        }
    }

    const handleAnswer = (questionId: string, score: number) => {
        setAnswers(prev => ({ ...prev, [questionId]: score }));
    };

    const calculateCompositeScores = () => {
        // 1. Stress Level (1-10)
        // Derived from Sleep (30%), Symptoms (30%), Confidence (40%)
        const sleepScore = answers['sleep'] || 5;
        const symptomScore = answers['symptoms'] || 5;
        const confidenceScore = answers['confidence'] || 5;
        
        const calculatedStress = Math.round(
            (sleepScore * 0.3) + (symptomScore * 0.3) + (confidenceScore * 0.4)
        );

        // 2. Impact on Others (1-10)
        // Derived directly from the 'behind' question
        const impactScore = answers['behind'] || 5;

        // 3. Overall Wellbeing (1-10)
        // Derived from Interest (50%) and Confidence (50%)
        // Note: High score in our questions means BAD (high stress). 
        // But 'Overall Wellbeing' usually means GOOD (high wellbeing).
        // Let's assume the schema expects a "Health Score" where 10 is good?
        // Checking previous code: "How do you feel... Very confident (low score) vs Very concerned (high score)"
        // The previous slider was "Overall Feeling" where high = concerned.
        // So we will keep 10 = BAD/Stressed to be consistent with Stress Level.
        const interestScore = answers['interest'] || 5;
        const calculatedWellbeing = Math.round(
            (interestScore * 0.5) + (confidenceScore * 0.5)
        );

        return {
            stressLevel: calculatedStress,
            impactOnOtherCourses: impactScore,
            overallWellbeing: calculatedWellbeing
        };
    };

    const validateStep1 = () => {
        if (!weeklyHours || isNaN(parseFloat(weeklyHours))) return "Please enter valid weekly hours.";
        if (!totalCredits || isNaN(parseInt(totalCredits))) return "Please enter valid credit hours.";
        if (!otherCoursesCount || isNaN(parseInt(otherCoursesCount))) return "Please enter valid course count.";
        return null;
    };

    const validateStep2 = () => {
        if (!answers['sleep'] || !answers['symptoms']) return "Please answer all questions.";
        return null;
    };

    const validateStep3 = () => {
        if (!answers['behind'] || !answers['confidence'] || !answers['interest']) return "Please answer all questions.";
        return null;
    };

    const handleNext = () => {
        let err = null;
        if (step === 1) err = validateStep1();
        if (step === 2) err = validateStep2();
        
        if (err) {
            setError(err);
            return;
        }
        
        setError(null);
        setStep(prev => prev + 1);
    };

    const handleSave = async () => {
        const err = validateStep3();
        if (err) {
            setError(err);
            return;
        }

        if (!user?.id || !courseId) return;

        setIsSaving(true);
        const scores = calculateCompositeScores();

        try {
            await updateStudentCourseAssessment(user.id, courseId, {
                stressLevel: scores.stressLevel,
                sleepScore: answers['sleep'] || null,
                symptomsScore: answers['symptoms'] || null,
                weeklyTimeInvestment: parseInt(weeklyHours),
                impactOnOtherCourses: scores.impactOnOtherCourses,
                overallWellbeing: scores.overallWellbeing,
                semesterCreditHours: parseInt(totalCredits),
                otherCoursesCount: parseInt(otherCoursesCount),
                currentGPA: currentGPA ? parseFloat(currentGPA) : null,
            });

            // Save shared context to AsyncStorage for future assessments
            await Promise.all([
                AsyncStorage.setItem(SHARED_CONTEXT_KEYS.totalCredits, totalCredits),
                AsyncStorage.setItem(SHARED_CONTEXT_KEYS.otherCoursesCount, otherCoursesCount),
                currentGPA ? AsyncStorage.setItem(SHARED_CONTEXT_KEYS.currentGPA, currentGPA) : AsyncStorage.removeItem(SHARED_CONTEXT_KEYS.currentGPA),
                answers['sleep'] ? AsyncStorage.setItem(SHARED_CONTEXT_KEYS.sleepAnswer, answers['sleep'].toString()) : Promise.resolve(),
                answers['symptoms'] ? AsyncStorage.setItem(SHARED_CONTEXT_KEYS.symptomsAnswer, answers['symptoms'].toString()) : Promise.resolve()
            ]);

            router.back();
        } catch (err) {
            logger.error('Error saving assessment', {
                source: 'assessment.handleSave',
                userId: user?.id,
                data: { error: err, courseId }
            });
            setError('Failed to save assessment.');
            setIsSaving(false);
        }
    };

    const renderQuestion = (q: typeof QUESTIONS[0]) => {
        const isSharedQuestion = q.id === 'sleep' || q.id === 'symptoms';
        const hasAnswer = answers[q.id] !== undefined;

        return (
            <View key={q.id} className="mb-6">
                <View className="flex-row items-center mb-3">
                    <Text className="text-base font-medium flex-1">{q.question}</Text>
                    {isSharedQuestion && hasAnswer && (
                        <View className="ml-2 px-2 py-0.5 bg-blue-500/10 rounded-md">
                            <Text className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Shared</Text>
                        </View>
                    )}
                </View>
                <View className="gap-2">
                    {q.options.map((opt) => (
                        <TouchableOpacity
                            key={opt.label}
                            onPress={() => handleAnswer(q.id, opt.score)}
                            className="p-4 rounded-xl flex-row items-center justify-between"
                            style={{
                                backgroundColor: answers[q.id] === opt.score 
                                    ? `${hexColors.primary}10` 
                                    : hexColors.card,
                                borderWidth: 1,
                                borderColor: answers[q.id] === opt.score 
                                    ? hexColors.primary 
                                    : hexColors.border
                            }}
                        >
                            <Text 
                                className="font-medium"
                                style={{ 
                                    color: answers[q.id] === opt.score 
                                        ? hexColors.primary 
                                        : hexColors.foreground 
                                }}
                            >
                                {opt.label}
                            </Text>
                            {answers[q.id] === opt.score && (
                                <Ionicons name="checkmark-circle" size={20} color={hexColors.primary} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    };

    if (isLoading) {
        return (
            <View className="flex-1  justify-center items-center" style={{ backgroundColor: hexColors.background }}>
                <Text className="text" style={{ color: hexColors.foreground }}>Loading...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1" style={{ backgroundColor: hexColors.background }}>
            {/* Header */}
            <View className="px-4 py-3 border-b border-border flex-row items-center justify-between safe-top">
                <TouchableOpacity 
                    onPress={() => step > 1 ? setStep(step - 1) : router.back()}
                    className="w-10 h-10 rounded-full bg-secondary items-center justify-center"
                >
                    <Ionicons name="arrow-back" size={24} color={theme.colors.foreground} />
                </TouchableOpacity>
                <View className="items-center">
                    <Text className="text-lg font-bold " style={{ color: hexColors.foreground }}>Assessment</Text>
                    <Text className="text-xs " style={{ color: hexColors.mutedForeground }}>Step {step} of {TOTAL_STEPS}</Text>
                </View>
                <View className="w-10" />
            </View>

            {/* Progress Bar */}
            <View className="h-1 bg-secondary w-full">
                <View 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                />
            </View>

            <ScrollView className="flex-1 px-4 pt-6">
                <Text className="text-2xl font-bold mb-2">
                    {step === 1 ? "Workload & Context" : 
                     step === 2 ? "Wellbeing Check" : "Course Feelings"}
                </Text>
                <Text className="mb-6" style={{ color: hexColors.mutedForeground }}>
                    {step === 1 ? "Let's start with the numbers." : 
                     step === 2 ? "How is this affecting you physically and mentally?" : "Your personal connection to the material."}
                </Text>

                {error && (
                    <View className="mb-6">
                        <FormError message={error} />
                    </View>
                )}

                <Animated.View 
                    key={step}
                    entering={FadeInRight}
                    exiting={FadeOutLeft}
                >
                    {step === 1 && (
                        <View className="gap-4">
                            <View>
                                <Text className="text-sm font-medium mb-2 " style={{ color: hexColors.foreground }}>Hours per week spent on this course</Text>
                                <TextInput
                                    className="border border-input rounded-xl p-4 text-base " style={{ backgroundColor: hexColors.card }}
                                    value={weeklyHours}
                                    onChangeText={setWeeklyHours}
                                    keyboardType="numeric"
                                    placeholder="e.g. 10"
                                    placeholderTextColor={theme.colors.mutedForeground}
                                />
                            </View>

                            {/* Shared Context Hint */}
                            {(totalCredits || otherCoursesCount || currentGPA) && (
                                <View className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex-row items-start">
                                    <Ionicons name="information-circle" size={18} color="#3B82F6" style={{ marginRight: 8, marginTop: 2 }} />
                                    <Text className="text-xs text-blue-600 flex-1 leading-5">
                                        Semester-wide fields below are auto-filled from your previous assessments. You can still edit them if needed.
                                    </Text>
                                </View>
                            )}

                            <View>
                                <View className="flex-row items-center mb-2">
                                    <Text className="text-sm font-medium " style={{ color: hexColors.foreground }}>Total credit hours this semester</Text>
                                    {totalCredits && (
                                        <View className="ml-2 px-2 py-0.5 bg-blue-500/10 rounded-md">
                                            <Text className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Shared</Text>
                                        </View>
                                    )}
                                </View>
                                <TextInput
                                    className="border border-input rounded-xl p-4 text-base " style={{ backgroundColor: hexColors.card }}
                                    value={totalCredits}
                                    onChangeText={setTotalCredits}
                                    keyboardType="numeric"
                                    placeholder="e.g. 15"
                                    placeholderTextColor={theme.colors.mutedForeground}
                                />
                            </View>
                            <View>
                                <View className="flex-row items-center mb-2">
                                    <Text className="text-sm font-medium " style={{ color: hexColors.foreground }}>Number of other courses</Text>
                                    {otherCoursesCount && (
                                        <View className="ml-2 px-2 py-0.5 bg-blue-500/10 rounded-md">
                                            <Text className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Shared</Text>
                                        </View>
                                    )}
                                </View>
                                <TextInput
                                    className="border border-input rounded-xl p-4 text-base " style={{ backgroundColor: hexColors.card }}
                                    value={otherCoursesCount}
                                    onChangeText={setOtherCoursesCount}
                                    keyboardType="numeric"
                                    placeholder="e.g. 4"
                                    placeholderTextColor={theme.colors.mutedForeground}
                                />
                            </View>
                            <View>
                                <View className="flex-row items-center mb-2">
                                    <Text className="text-sm font-medium " style={{ color: hexColors.foreground }}>Current GPA (Optional)</Text>
                                    {currentGPA && (
                                        <View className="ml-2 px-2 py-0.5 bg-blue-500/10 rounded-md">
                                            <Text className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Shared</Text>
                                        </View>
                                    )}
                                </View>
                                <TextInput
                                    className="border border-input rounded-xl p-4 text-base " style={{ backgroundColor: hexColors.card }}
                                    value={currentGPA}
                                    onChangeText={setCurrentGPA}
                                    keyboardType="numeric"
                                    placeholder="e.g. 3.5"
                                    placeholderTextColor={theme.colors.mutedForeground}
                                />
                            </View>
                        </View>
                    )}

                    {step === 2 && (
                        <View>
                            {/* Shared Context Hint for Wellbeing */}
                            {(answers['sleep'] || answers['symptoms']) && (
                                <View className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex-row items-start mb-6">
                                    <Ionicons name="information-circle" size={18} color="#3B82F6" style={{ marginRight: 8, marginTop: 2 }} />
                                    <Text className="text-xs text-blue-600 flex-1 leading-5">
                                        These wellness questions are auto-filled from your previous assessments since they reflect your overall semester health, not just this course.
                                    </Text>
                                </View>
                            )}
                            {QUESTIONS.filter(q => q.category === 'wellbeing').map(renderQuestion)}
                        </View>
                    )}

                    {step === 3 && (
                        <View>
                            {QUESTIONS.filter(q => q.category === 'impact' || q.category === 'academic').map(renderQuestion)}
                        </View>
                    )}
                </Animated.View>

                <View className="h-24" />
            </ScrollView>

            <View className="p-4 border-t border-border " style={{ backgroundColor: hexColors.background }}>
                <TouchableOpacity
                    onPress={step === TOTAL_STEPS ? handleSave : handleNext}
                    disabled={isSaving}
                    className={`w-full py-4 rounded-xl items-center ${
                        isSaving ? 'bg-muted' : 'bg-primary'
                    }`}
                >
                    <Text className="-foreground font-bold text-lg" style={{ color: hexColors.primary }}>
                        {isSaving ? 'Saving...' : step === TOTAL_STEPS ? 'Complete Assessment' : 'Next Step'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}