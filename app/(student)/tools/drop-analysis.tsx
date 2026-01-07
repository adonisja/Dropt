import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/theme-context';
import { useAuth } from '@/lib/auth/auth-context';
import { fetchStudentCourses, fetchCompleteCourseData, transformToStudentCourseData } from '@/lib/api/data-client';
import { calculateCurrentGrade } from '@/lib/logic/calculateCurrentGrade';
import { calculateRecommendation, RecommendationResult, RecommendationInput, generateAIAdviceForCourse } from '@/lib/logic/recommendation-engine';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CourseAnalysis {
    courseId: string;
    courseName: string;
    currentGrade: number | null;
    recommendation: RecommendationResult;
    input: RecommendationInput;
}

const getRiskColor = (risk: string) => {
    switch (risk) {
        case 'Critical': return '#EF4444';
        case 'At Risk': return '#F59E0B';
        case 'Safe': return '#3B82F6';
        case 'Excellent': return '#10B981';
        default: return '#6B7280';
    }
};

const getRiskBg = (risk: string) => {
    switch (risk) {
        case 'Critical': return 'bg-red-500/10';
        case 'At Risk': return 'bg-amber-500/10';
        case 'Safe': return 'bg-blue-500/10';
        case 'Excellent': return 'bg-emerald-500/10';
        default: return 'bg-gray-500/10';
    }
};

const getRiskIcon = (risk: string): keyof typeof Ionicons.glyphMap => {
    switch (risk) {
        case 'Critical': return 'alert-circle';
        case 'At Risk': return 'time'; // Using time/clock for "Due Soon" equivalent
        case 'Safe': return 'calendar'; // Using calendar for "Upcoming" equivalent
        case 'Excellent': return 'checkmark-circle'; // Using checkmark for "Completed" equivalent
        default: return 'help-circle';
    }
};

const RiskSummaryCard = ({ title, count, icon, color, bgColor }: { title: string, count: number, icon: keyof typeof Ionicons.glyphMap, color: string, bgColor: string }) => (
    <View className="bg-card p-4 rounded-2xl border border-border shadow-sm flex-1 mx-1.5 mb-3">
        <View className="flex-row items-center gap-3">
            <View className={`w-10 h-10 rounded-xl items-center justify-center ${bgColor}`}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <View>
                <Text className="text-2xl font-bold text-foreground">{count}</Text>
                <Text className="text-xs text-muted-foreground font-medium">{title}</Text>
            </View>
        </View>
    </View>
);

const EmptyAnalysis = () => (
    <View className="items-center justify-center py-20 px-4 bg-card rounded-3xl border border-dashed border-border">
        <LinearGradient
            colors={['#0D9488', '#0EA5E9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="w-20 h-20 rounded-3xl items-center justify-center mb-6 shadow-sm"
        >
            <Ionicons name="book-outline" size={40} color="white" />
        </LinearGradient>
        <Text className="text-xl font-bold text-foreground mb-2">No Courses Found</Text>
        <Text className="text-sm text-muted-foreground text-center max-w-[250px]">
            Add courses to your profile to start analyzing your academic performance and get personalized recommendations.
        </Text>
    </View>
);

const CourseAnalysisCard = ({ item, index }: { item: CourseAnalysis, index: number }) => {
    const riskColor = getRiskColor(item.recommendation.riskLevel);
    const riskBg = getRiskBg(item.recommendation.riskLevel);
    const riskIcon = getRiskIcon(item.recommendation.riskLevel);
    const { theme } = useTheme();
    
    const [aiAdvice, setAiAdvice] = useState<string | null>(null);
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const cacheKey = `ai_advice_${item.courseId}_${item.currentGrade?.toFixed(1)}_${item.input.stressLevel}_${item.input.weeklyHours}_${item.recommendation.riskLevel}`;

    useEffect(() => {
        checkCache();
    }, []);

    const checkCache = async () => {
        try {
            const cached = await AsyncStorage.getItem(cacheKey);
            if (cached) {
                setAiAdvice(cached);
            }
        } catch (e) {
            // ignore
        }
    };

    const handleGetAIAdvice = async () => {
        if (isExpanded) {
            setIsExpanded(false);
            return;
        }

        if (aiAdvice) {
            setIsExpanded(true);
            return;
        }

        setIsLoadingAI(true);
        try {
            const advice = await generateAIAdviceForCourse(item.input, item.recommendation);
            setAiAdvice(advice);
            setIsExpanded(true);
            await AsyncStorage.setItem(cacheKey, advice);
        } catch (error) {
            Alert.alert("Error", "Failed to generate AI advice.");
        } finally {
            setIsLoadingAI(false);
        }
    };

    return (
        <Animated.View 
            entering={FadeInDown.delay(index * 100).springify()}
            className="mb-4"
        >
            <View className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex-row">
                {/* Left Indicator Bar */}
                <View style={{ backgroundColor: riskColor }} className="w-1.5 h-full" />

                {/* Content */}
                <View className="flex-1 p-5">
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => router.push({
                            pathname: '/(student)/courses/[id]',
                            params: { id: item.courseId }
                        })}
                    >
                        {/* Header */}
                        <View className="flex-row justify-between items-start mb-3">
                            <View className="flex-1 mr-3">
                                <Text className="text-base font-bold text-foreground" numberOfLines={1}>
                                    {item.courseName}
                                </Text>
                                <Text className="text-xs text-muted-foreground font-medium mt-0.5">
                                    {item.courseId}
                                </Text>
                            </View>
                            
                            {/* Risk Pill */}
                            <View className={`px-3 py-1.5 rounded-full flex-row items-center gap-1.5 ${riskBg}`}>
                                <Ionicons 
                                    name={riskIcon} 
                                    size={12} 
                                    color={riskColor} 
                                />
                                <Text style={{ color: riskColor }} className="text-xs font-bold uppercase tracking-wide">
                                    {item.recommendation.riskLevel}
                                </Text>
                            </View>
                        </View>

                        {/* Stats Row */}
                        <View className="flex-row items-center flex-wrap gap-x-4 gap-y-2 mb-3">
                            {/* Grade */}
                            <View className="flex-row items-center gap-1.5">
                                <Ionicons name="school-outline" size={14} color="#6B7280" />
                                <Text className="text-sm text-muted-foreground">
                                    {item.currentGrade !== null ? `${item.currentGrade.toFixed(1)}%` : 'N/A'}
                                </Text>
                            </View>

                            {/* Stress */}
                            <View className="flex-row items-center gap-1.5">
                                <Ionicons name="pulse-outline" size={14} color="#6B7280" />
                                <Text className="text-sm text-muted-foreground">
                                    Stress: {item.input.stressLevel}/10
                                </Text>
                            </View>

                            {/* Workload */}
                            <View className="flex-row items-center gap-1.5">
                                <Ionicons name="time-outline" size={14} color="#6B7280" />
                                <Text className="text-sm text-muted-foreground">
                                    {item.input.weeklyHours}h/wk
                                </Text>
                            </View>
                            
                            {/* Score (Inline) */}
                            <View className="flex-row items-center gap-1.5 ml-auto">
                                <Text className="text-xs text-muted-foreground font-medium uppercase">Score</Text>
                                <Text style={{ color: riskColor }} className="text-sm font-black">
                                    {item.recommendation.score.toFixed(0)}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* Advice Footer */}
                    {item.recommendation.advice.length > 0 && (
                        <View className="pt-3 border-t border-border/50 flex-col gap-2">
                             <View className="flex-row items-start gap-2">
                                 <Ionicons name="bulb-outline" size={14} color={riskColor} style={{marginTop: 2}} />
                                 <Text className="text-xs text-muted-foreground flex-1 leading-relaxed">
                                    {item.recommendation.advice[0]}
                                </Text>
                             </View>
                             
                             {/* AI Advice Section */}
                             {aiAdvice && isExpanded ? (
                                 <View className="mt-2">
                                     <View className="bg-muted/30 p-3 rounded-xl border border-border/50">
                                         <View className="flex-row items-center justify-between mb-2">
                                             <View className="flex-row items-center gap-2">
                                                 <Ionicons name="sparkles" size={14} color="#8B5CF6" />
                                                 <Text className="text-xs font-bold text-foreground">AI Strategic Plan</Text>
                                             </View>
                                             <TouchableOpacity onPress={() => setIsExpanded(false)} hitSlop={8}>
                                                <Ionicons name="chevron-up" size={16} color={theme.colors.mutedForeground} />
                                             </TouchableOpacity>
                                         </View>
                                         <FormattedAIAdvice advice={aiAdvice} riskColor={riskColor} />
                                         
                                         <TouchableOpacity 
                                            onPress={() => setIsExpanded(false)}
                                            className="mt-3 flex-row items-center justify-center gap-1 py-2"
                                         >
                                            <Text className="text-xs font-medium text-muted-foreground">Collapse Strategy</Text>
                                            <Ionicons name="chevron-up" size={12} color={theme.colors.mutedForeground} />
                                         </TouchableOpacity>
                                     </View>
                                 </View>
                             ) : (
                                 <TouchableOpacity 
                                    onPress={handleGetAIAdvice}
                                    disabled={isLoadingAI}
                                    className={`mt-2 flex-row items-center justify-center gap-2 py-2 rounded-xl border ${
                                        aiAdvice 
                                        ? 'bg-secondary/50 border-secondary' 
                                        : 'bg-primary/10 border-primary/20'
                                    }`}
                                 >
                                     {isLoadingAI ? (
                                         <ActivityIndicator size="small" color={theme.colors.primary} />
                                     ) : (
                                         <>
                                            <Ionicons 
                                                name={aiAdvice ? "document-text-outline" : "sparkles-outline"} 
                                                size={14} 
                                                color={aiAdvice ? theme.colors.foreground : theme.colors.primary} 
                                            />
                                            <Text className={`text-xs font-bold ${aiAdvice ? 'text-foreground' : 'text-primary'}`}>
                                                {aiAdvice ? "Show Detailed Strategy" : "Get Detailed AI Strategy"}
                                            </Text>
                                         </>
                                     )}
                                 </TouchableOpacity>
                             )}
                        </View>
                    )}
                </View>
            </View>
        </Animated.View>
    );
};

const FormattedAIAdvice = ({ advice, riskColor }: { advice: string, riskColor: string }) => {
    // Split into sections based on ### headers
    const sections = advice.split('###').filter(s => s.trim().length > 0);

    const renderTextWithBold = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return (
            <Text className="text-xs text-muted-foreground leading-relaxed">
                {parts.map((part, i) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return (
                            <Text key={i} className="font-bold text-foreground">
                                {part.slice(2, -2)}
                            </Text>
                        );
                    }
                    return part;
                })}
            </Text>
        );
    };

    return (
        <View className="mt-3 gap-3">
            {sections.map((section, index) => {
                const lines = section.trim().split('\n');
                const title = lines[0].replace(/^\d+\.\s*/, '').trim(); // Remove "1. " numbering
                const content = lines.slice(1);

                return (
                    <View key={index} className="bg-muted/30 rounded-xl p-3 border border-border/50">
                        <Text className="text-xs font-bold text-primary mb-2 uppercase tracking-wider">
                            {title}
                        </Text>
                        
                        <View className="gap-1.5">
                            {content.map((line, lineIndex) => {
                                const trimmed = line.trim();
                                if (!trimmed) return null;

                                // Check for bullet points
                                if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('[ ]')) {
                                    const isCheckbox = trimmed.startsWith('[ ]');
                                    const cleanLine = trimmed.replace(/^[-*\[\]\s]+/, '');
                                    
                                    return (
                                        <View key={lineIndex} className="flex-row items-start gap-2 pl-1">
                                            <View className="mt-1.5 w-1 h-1 rounded-full bg-muted-foreground/50" />
                                            <View className="flex-1">
                                                {renderTextWithBold(cleanLine)}
                                            </View>
                                        </View>
                                    );
                                }

                                return (
                                    <View key={lineIndex}>
                                        {renderTextWithBold(trimmed)}
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                );
            })}
        </View>
    );
};

export default function DropAnalysis() {
    const { theme } = useTheme();
    const { user } = useAuth();
    const [analyses, setAnalyses] = useState<CourseAnalysis[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [user?.id]);

    const loadData = async () => {
        if (!user?.id) return;
        try {
            const courses = await fetchStudentCourses(user.id);
            const results: CourseAnalysis[] = [];

            for (const course of courses) {
                const fullData = await fetchCompleteCourseData(user.id, course.courseId);
                if (!fullData) continue;

                const studentCourseData = transformToStudentCourseData(fullData);
                const currentGrade = calculateCurrentGrade(studentCourseData);

                const input: RecommendationInput = {
                    courseName: course.courseName,
                    currentGrade: currentGrade ?? 100,
                    isRequired: course.isRequired ?? true,
                    stressLevel: course.stressLevel ?? 5,
                    weeklyHours: course.weeklyTimeInvestment ?? 5,
                    passingGrade: course.passingGrade ?? 60
                };

                const recommendation = calculateRecommendation(input);

                results.push({
                    courseId: course.courseId,
                    courseName: course.courseName,
                    currentGrade,
                    recommendation,
                    input
                });
            }

            results.sort((a, b) => a.recommendation.score - b.recommendation.score);

            setAnalyses(results);
        } catch (error) {
            console.error('Error loading drop analysis:', error);
            Alert.alert('Error', 'Failed to load analysis data');
        } finally {
            setIsLoading(false);
        }
    };

    const riskCounts = {
        critical: analyses.filter(a => a.recommendation.riskLevel === 'Critical').length,
        atRisk: analyses.filter(a => a.recommendation.riskLevel === 'At Risk').length,
        safe: analyses.filter(a => a.recommendation.riskLevel === 'Safe').length,
        excellent: analyses.filter(a => a.recommendation.riskLevel === 'Excellent').length
    };

    return (
        <View className="flex-1 bg-background">
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView className="flex-1">
                {/* Header */}
                <View className="px-4 py-3 border-b border-border/50 flex-row items-center justify-between bg-background/80">
                    <TouchableOpacity 
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-full bg-secondary/50 items-center justify-center"
                    >
                        <Ionicons name="arrow-back" size={20} color={theme.colors.foreground} />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-foreground">Drop Analysis</Text>
                    <View className="w-10" />
                </View>

                {isLoading ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text className="mt-4 text-muted-foreground">Analyzing your courses...</Text>
                    </View>
                ) : (
                    <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
                        {/* Risk Summary Grid */}
                        <View className="flex-row flex-wrap -mx-1.5 mb-6">
                            <View className="w-1/2 px-1.5">
                                <RiskSummaryCard 
                                    title="Critical" 
                                    count={riskCounts.critical} 
                                    icon="alert-circle" 
                                    color="#EF4444" 
                                    bgColor="bg-red-500/10"
                                />
                            </View>
                            <View className="w-1/2 px-1.5">
                                <RiskSummaryCard 
                                    title="At Risk" 
                                    count={riskCounts.atRisk} 
                                    icon="time" 
                                    color="#F59E0B" 
                                    bgColor="bg-amber-500/10"
                                />
                            </View>
                            <View className="w-1/2 px-1.5">
                                <RiskSummaryCard 
                                    title="Safe" 
                                    count={riskCounts.safe} 
                                    icon="calendar" 
                                    color="#3B82F6" 
                                    bgColor="bg-blue-500/10"
                                />
                            </View>
                            <View className="w-1/2 px-1.5">
                                <RiskSummaryCard 
                                    title="Excellent" 
                                    count={riskCounts.excellent} 
                                    icon="checkmark-circle" 
                                    color="#10B981" 
                                    bgColor="bg-emerald-500/10"
                                />
                            </View>
                        </View>

                        <Text className="text-xl font-bold text-foreground mb-4">Course Recommendations</Text>

                        {analyses.length === 0 ? (
                            <EmptyAnalysis />
                        ) : (
                            analyses.map((item, index) => (
                                <CourseAnalysisCard key={item.courseId} item={item} index={index} />
                            ))
                        )}
                    </ScrollView>
                )}
            </SafeAreaView>
        </View>
    );
}
