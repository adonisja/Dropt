// app/(student)/student_dashboard.tsx
import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router'; // Import Stack to modify header
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/lib/auth/auth-context';
import { useTheme } from '@/lib/theme/theme-context';
import { fetchStudentCourses, fetchAssignments } from '@/lib/api/data-client';
import { detectCurrentSemester, getSeasonLabel } from '@/lib/utils/semester-utils';
import { getOrCreateUserSettings, fetchCompleteCourseData, transformToStudentCourseData } from '@/lib/api/data-client';
import { calculateCurrentGrade } from '@/lib/logic/calculateCurrentGrade';
import { calculateSemesterGPA } from '@/lib/logic/calculateGPA';

interface DashboardAssignment {
    id: string;
    name: string;
    courseName: string;
    dateDue: string;
    daysRemaining: number;
}

export default function StudentDashboard() {
    const { user } = useAuth();
    const { theme, isDark, colors, hexColors } = useTheme();
    const { width } = useWindowDimensions();
    const isWideScreen = width > 768;

    const [courseCount, setCourseCount] = useState(0);
    const [weeklyStudyHours, setWeeklyStudyHours] = useState(0);
    const [semesterGPA, setSemesterGPA] = useState<number | null>(null);
    const [completedTasks, setCompletedTasks] = useState(0);
    const [totalTasks, setTotalTasks] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [recentActivity, setRecentActivity] = useState<DashboardAssignment[]>([]);
    const [seasonLabel, setSeasonLabel] = useState<string>('🌸 Spring');
    const [currentSemesterLabel, setCurrentSemesterLabel] = useState(() => {
        const { semester, year } = detectCurrentSemester();
        return `${semester} ${year}`;
    });

    useEffect(() => {
        const loadDashboardData = async () => {
            if (!user?.id) { setIsLoading(false); return; }
            try {

                // 1. Get current semester info
                const {semester, year, season} = detectCurrentSemester();

                // 2. fetch or create user settings
                const settings = await getOrCreateUserSettings(
                    user.id,
                    semester,
                    year
                );

                // Set the season label for display
                setSeasonLabel(getSeasonLabel(season));
                setCurrentSemesterLabel(`${settings?.currentSemester} ${settings?.currentYear}`);

                // 3. Fetch courses filtered by current semester
                const allCourses = await fetchStudentCourses(user.id);
                const currentSemesterCourses = allCourses.filter( c =>
                    c.semester === settings?.currentSemester &&
                    c.year === settings?.currentYear
                );

                const totalStudyHours = currentSemesterCourses.reduce((sum, course) => {
                    return sum + ( course.weeklyTimeInvestment || 0);
                }, 0);

                setWeeklyStudyHours(totalStudyHours);

                setCourseCount(currentSemesterCourses.length);

                // 3.A Calculate grades and GPA for current semester courses
                const courseGradesData = await Promise.all(
                    currentSemesterCourses.map(async (course) => {
                        // Fetch complete data (categories + assignments)
                        const completeData = await fetchCompleteCourseData(user.id, course.courseId);

                        // If no data, return null grade
                        if (!completeData || completeData.assignments.length === 0) {
                            return {
                                currentGrade: null,
                                credits: course.credits || 3
                            };
                        }

                        // Transform and calculate grade
                        const studentCourseData = transformToStudentCourseData(completeData);
                        const grade = calculateCurrentGrade(studentCourseData);

                        return {
                            currentGrade: grade,
                            credits: course.credits || 3
                        };
                    })
                );

                // 3.B Calculate semester GPA
                const gpa = calculateSemesterGPA(courseGradesData);
                setSemesterGPA(gpa);

                // 4. Fetch Assignments for Recent Activity
                const assignmentsPromises = currentSemesterCourses.map(async (course) => {
                    const courseAssignments = await fetchAssignments(`${user.id}#${course.courseId}`);
                    return courseAssignments.map(a => ({
                        id: a.assignmentId,
                        name: a.assignmentName,
                        courseName: course.courseName,
                        dateDue: a.dateDue,
                        score: a.scoreEarned
                    }));
                });

                const results = await Promise.all(assignmentsPromises);
                const allAssignments = results.flat();

                // Calculate task completion
                const completed = allAssignments.filter(a => a.score !== null && a.score !== undefined).length;
                const total = allAssignments.length;

                setCompletedTasks(completed);
                setTotalTasks(total);

                // Filter for incomplete and upcoming/overdue
                const pending = allAssignments.filter(a => a.score === null || a.score === undefined);
                
                // Sort by due date
                pending.sort((a, b) => new Date(a.dateDue).getTime() - new Date(b.dateDue).getTime());

                // Process top 3 for display
                const top3 = pending.slice(0, 3).map(a => {
                    const today = new Date();
                    today.setHours(0,0,0,0);
                    const due = new Date(a.dateDue);
                    due.setHours(0,0,0,0);
                    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    
                    return {
                        id: a.id,
                        name: a.name,
                        courseName: a.courseName,
                        dateDue: a.dateDue,
                        daysRemaining: diff
                    };
                });

                setRecentActivity(top3);

            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        loadDashboardData();
    }, [user?.id]);

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center" style={{ backgroundColor: hexColors.background }}>
                <ActivityIndicator size="large" color={hexColors.primary} />
            </View>
        );
    }

    // Updated QuickAction Component with Better Proportions
    const QuickAction = ({ icon, color, label, sub, route, delay }: { icon: any, color: string, label: string, sub: string, route: any, delay: number }) => (
        <Animated.View 
            entering={FadeInDown.delay(delay).springify()}
            style={{ width: isWideScreen ? '23%' : '48%' }}
        >
            <TouchableOpacity
                className="rounded-2xl shadow-sm items-center justify-center"
                style={{ 
                    aspectRatio: 1.2,
                    backgroundColor: hexColors.card,
                    borderWidth: 1,
                    borderColor: hexColors.border
                }}
                onPress={() => router.push(route)}
                activeOpacity={0.7}
            >
                {/* Icon background with color-coded styling */}
                <View 
                    style={{ backgroundColor: isDark ? `${color}20` : `${color}15` }}
                    className="w-12 h-12 rounded-full items-center justify-center mb-3"
                >
                    <Ionicons name={icon} size={22} color={color} />
                </View>
                <Text className="text-sm font-bold text-center px-2" style={{ color: hexColors.foreground }}>{label}</Text>
                <Text className="text-[10px] text-center mt-1 uppercase tracking-wide" style={{ color: hexColors.mutedForeground }}>{sub}</Text>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <View className="flex-1" style={{ backgroundColor: hexColors.background }}>
            <SafeAreaView className="flex-1" edges={['left', 'right', 'bottom']}>
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ 
                        paddingBottom: 100,
                        paddingHorizontal: isWideScreen ? 40 : 16,
                        paddingTop: 20
                    }}
                    showsVerticalScrollIndicator={false}
                >
                    <View className={`w-full mx-auto ${isWideScreen ? 'max-w-6xl' : 'max-w-md'}`}>
                        
                        {/* Full Width Header Section */}
                        <View className="mb-3">
                            <View className="flex-row items-center justify-between">
                                <View>
                                    <Text className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: hexColors.mutedForeground }}>
                                        Student Dashboard
                                    </Text>
                                    <Text className="text-3xl font-extrabold" style={{ color: hexColors.foreground }}>
                                        Welcome, {user?.name?.split(' ')[0] || 'Student'} 
                                    </Text>
                                    <Text className="mt-1" style={{ color: hexColors.mutedForeground }}>
                                        Here is what's happening today.
                                    </Text>
                                </View>
                                <TouchableOpacity 
                                    onPress={() => router.push('/(student)/tools/deadline-tracker')}
                                    className="p-3 rounded-full"
                                    style={{
                                        backgroundColor: hexColors.card,
                                        borderWidth: 1,
                                        borderColor: hexColors.border
                                    }}
                                >
                                    <Ionicons name="notifications-outline" size={24} color={hexColors.foreground} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* 1. FIXED ALIGNMENT: Flex Row Container */}
                        <View className={isWideScreen ? "flex-row gap-8 items-start" : "flex-col"}>
                            
                            {/* LEFT COLUMN: Main Stats & Grid */}
                            <View className={isWideScreen ? "flex-[2]" : "w-full"}>
                                {/* Hero Card with Enhanced Design */}
                                <Animated.View entering={FadeInDown.delay(100).springify()} className="mb-6">
                                    <LinearGradient
                                        colors={[colors.gradientStart, colors.gradientMiddle, colors.gradientEnd]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        className="rounded-2xl p-6 sm:p-8 shadow-lg overflow-hidden"
                                        style={{ position: 'relative' }}
                                    >
                                        {/* Decorative Blur Circles with Vibrant Colors */}
                                        <View 
                                            style={{
                                                position: 'absolute',
                                                right: -32,
                                                top: -32,
                                                width: 128,
                                                height: 128,
                                                borderRadius: 64,
                                                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                                shadowColor: '#FFFFFF',
                                                shadowOffset: { width: 0, height: 0 },
                                                shadowOpacity: 0.3,
                                                shadowRadius: 20,
                                            }}
                                        />
                                        <View 
                                            style={{
                                                position: 'absolute',
                                                bottom: -16,
                                                left: -16,
                                                width: 96,
                                                height: 96,
                                                borderRadius: 48,
                                                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                                shadowColor: '#FFFFFF',
                                                shadowOffset: { width: 0, height: 0 },
                                                shadowOpacity: 0.3,
                                                shadowRadius: 15,
                                            }}
                                        />
                                        <View 
                                            style={{
                                                position: 'absolute',
                                                right: 48,
                                                top: 48,
                                                width: 64,
                                                height: 64,
                                                borderRadius: 32,
                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                shadowColor: '#FFFFFF',
                                                shadowOffset: { width: 0, height: 0 },
                                                shadowOpacity: 0.2,
                                                shadowRadius: 10,
                                            }}
                                        />
                                        
                                        {/* Icon at top with glow effect */}
                                        <View className="mb-4 inline-flex">
                                            <View 
                                                className="bg-white/25 p-3 rounded-xl"
                                                style={{
                                                    shadowColor: '#FFFFFF',
                                                    shadowOffset: { width: 0, height: 0 },
                                                    shadowOpacity: 0.5,
                                                    shadowRadius: 12,
                                                    elevation: 8,
                                                }}
                                            >
                                                <Ionicons name="school" size={24} color="white" />
                                            </View>
                                        </View>
                                        
                                        {/* Content with enhanced text shadow */}
                                        <View className="relative z-10 items-center px-4">
                                            {/* Semester label with season emoji */}
                                            <View className="flex-row items-center gap-2 mb-1">
                                                <Text 
                                                    className="text-base"
                                                    style={{
                                                        textShadowColor: 'rgba(0, 0, 0, 0.3)',
                                                        textShadowOffset: { width: 0, height: 1 },
                                                        textShadowRadius: 3,
                                                    }}
                                                >
                                                    {seasonLabel.split(' ')[0]}
                                                </Text>
                                                <Text 
                                                    className="text-sm font-medium uppercase tracking-wide text-center"
                                                    style={{
                                                        color: 'rgba(255, 255, 255, 0.95)',
                                                        textShadowColor: 'rgba(0, 0, 0, 0.3)',
                                                        textShadowOffset: { width: 0, height: 1 },
                                                        textShadowRadius: 3,
                                                    }}
                                                >
                                                    {currentSemesterLabel}
                                                </Text>
                                            </View>
                                            <Text 
                                                className="mt-2 text-5xl font-bold text-center"
                                                style={{
                                                    color: '#FFFFFF',
                                                    textShadowColor: 'rgba(0, 0, 0, 0.2)',
                                                    textShadowOffset: { width: 0, height: 2 },
                                                    textShadowRadius: 4,
                                                }}
                                            >
                                                {courseCount}
                                            </Text>
                                            <Text 
                                                className="mt-1 text-lg text-center"
                                                style={{
                                                    color: 'rgba(255, 255, 255, 0.95)',
                                                    textShadowColor: 'rgba(0, 0, 0, 0.2)',
                                                    textShadowOffset: { width: 0, height: 1 },
                                                    textShadowRadius: 2,
                                                }}
                                            >
                                                Active Courses Enrolled
                                            </Text>
                                        </View>
                                        
                                        {/* View All Button with enhanced styling */}
                                        <TouchableOpacity 
                                            onPress={() => router.push('/(student)/courses')}
                                            className="mt-6 mb-2 inline-flex flex-row items-center gap-2 rounded-full px-4 py-2"
                                            style={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                                                shadowColor: '#FFFFFF',
                                                shadowOffset: { width: 0, height: 2 },
                                                shadowOpacity: 0.3,
                                                shadowRadius: 8,
                                                elevation: 5,
                                            }}
                                            activeOpacity={0.8}
                                        >
                                            <Text className="text-sm font-medium text-white">View All</Text>
                                            <Ionicons name="arrow-forward" size={16} color="white" />
                                        </TouchableOpacity>
                                    </LinearGradient>
                                </Animated.View>

                                {/* Quick Stats Row */}
                                <Animated.View 
                                    entering={FadeInDown.delay(200).springify()} 
                                    className="flex-row justify-between mb-6 gap-3"
                                >
                                    {/* GPA Card */}
                                    <View className="flex-1 rounded-2xl p-4 shadow-sm" style={{
                                        backgroundColor: hexColors.card,
                                        borderWidth: 1,
                                        borderColor: hexColors.border
                                    }}>
                                        <View className="bg-emerald-500/10 w-10 h-10 rounded-full items-center justify-center mb-3">
                                            <Ionicons name="trending-up" size={20} color={isDark ? "#34D399" : "#10B981"} />
                                        </View>
                                        <Text className="text-2xl font-black" style={{ color: hexColors.foreground }}>
                                            {semesterGPA !== null ? semesterGPA.toFixed(2) : '--'}
                                        </Text>
                                        <Text className="text-xs mt-1" style={{ color: hexColors.mutedForeground }}>GPA</Text>
                                    </View>

                                    {/* Study Hours Card */}
                                    <TouchableOpacity
                                        className="flex-1 rounded-2xl p-4 shadow-sm"
                                        style={{
                                            backgroundColor: hexColors.card,
                                            borderWidth: 1,
                                            borderColor: hexColors.border
                                        }}
                                        onPress={() => router.push('/(student)/tools/study-hours')}
                                        activeOpacity={0.7}
                                    >
                                        <View className="bg-teal-500/10 w-10 h-10 rounded-full items-center justify-center mb-3">
                                            <Ionicons name="time" size={20} color={isDark ? "#5EEAD4" : "#14B8A6"} />
                                        </View>
                                        <Text className="text-2xl font-black" style={{ color: hexColors.foreground }}>
                                            {weeklyStudyHours}
                                        
                                        </Text>
                                        <Text className="text-xs mt-1" style={{ color: hexColors.mutedForeground }}>Weekly Hours</Text>
                                    </TouchableOpacity>

                                    {/* Tasks Done Card */}
                                    <TouchableOpacity
                                        className="flex-1 rounded-2xl p-4 shadow-sm"
                                        style={{
                                            backgroundColor: hexColors.card,
                                            borderWidth: 1,
                                            borderColor: hexColors.border
                                        }}
                                        onPress={() => router.push('/(student)/tools/deadline-tracker')}
                                        activeOpacity={0.7}
                                    >
                                        <View className="bg-green-500/10 w-10 h-10 rounded-full items-center justify-center mb-3">
                                            <Ionicons name="checkmark-circle" size={20} color={isDark ? "#4ADE80" : "#22C55E"} />
                                        </View>
                                        <Text className="text-2xl font-black" style={{ color: hexColors.foreground }}>
                                            {totalTasks > 0 ? `${completedTasks}/${totalTasks}` : '--'}
                                        </Text>
                                        <Text className="text-xs mt-1" style={{ color: hexColors.mutedForeground }}>Tasks Done</Text>
                                    </TouchableOpacity>
                                </Animated.View>

                                <Text className="text-lg font-bold mb-4" style={{ color: hexColors.foreground }}>
                                    Tools & Utilities
                                </Text>
                                
                                <View className="flex-row flex-wrap gap-3">
                                    <QuickAction icon="alert-circle" color="#EF4444" label="Drop Analysis" sub="Recommendation" route="/(student)/tools/drop-analysis" delay={100} />
                                    <QuickAction icon="calendar" color="#F59E0B" label="Deadlines" sub="Tracker" route="/(student)/tools/deadline-tracker" delay={200} />
                                    <QuickAction icon="add" color="#3B82F6" label="Add Course" sub="New Class" route="/(student)/courses/add" delay={300} />
                                    <QuickAction icon="scan" color="#8B5CF6" label="OCR Scanner" sub="Upload" route="/(student)/tools/ocr" delay={400} />
                                    <QuickAction icon="stats-chart" color="#10B981" label="Analytics" sub="Insights" route="/(student)/tools/analytics" delay={500} />
                                    <QuickAction icon="timer" color="#F59E0B" label="Study Timer" sub="Focus" route="/(student)/tools/study-timer" delay={600} />
                                    <QuickAction icon="library" color="#8B5CF6" label="Resources" sub="Hub" route="/(student)/tools/resource-hub" delay={700} />
                                    <QuickAction icon="settings" color="#64748B" label="Settings" sub="Preferences" route="/(student)/settings" delay={800} />
                                </View>
                            </View>

                            {/* RIGHT COLUMN: Recent Activity */}
                            {/* On Desktop: This now acts as a sidebar that is visually flush with the left column */}
                            <Animated.View 
                                entering={FadeInDown.delay(600).springify()}
                                className={isWideScreen ? "flex-1 h-full" : "mt-6"}
                            >
                                {/* Title placed here to match "Tools & Utilities" alignment if needed, 
                                    OR we treat the whole right side as a card. 
                                    Here we make the card start exactly at the top line of the Left Column's blue card */}
                                
                                <View className={`rounded-3xl p-6 shadow-sm ${isWideScreen ? 'min-h-[500px]' : 'min-h-[200px]'}`} style={{
                                    backgroundColor: hexColors.card,
                                    borderWidth: 1,
                                    borderColor: hexColors.border
                                }}>
                                    <View className="flex-row justify-between items-center mb-6">
                                        <Text className="text-lg font-bold" style={{ color: hexColors.foreground }}>Recent Activity</Text>
                                        <Ionicons name="notifications-outline" size={20} color={hexColors.mutedForeground} />
                                    </View>

                                    {/* Recent Activity List */}
                                    {recentActivity.length > 0 ? (
                                        <View>
                                            {recentActivity.map((item) => (
                                                <TouchableOpacity 
                                                    key={item.id}
                                                    className="flex-row items-center mb-4 last:mb-0"
                                                    onPress={() => router.push('/(student)/tools/deadline-tracker')}
                                                >
                                                    {/* Circular Icon Container */}
                                                    <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
                                                        item.daysRemaining < 0 ? 'bg-red-100' :
                                                        item.daysRemaining <= 3 ? 'bg-yellow-100' :
                                                        'bg-blue-100'
                                                    }`} style={{
                                                        backgroundColor: isDark 
                                                            ? (item.daysRemaining < 0 ? 'rgba(239, 68, 68, 0.2)' : 
                                                               item.daysRemaining <= 3 ? 'rgba(245, 158, 11, 0.2)' : 
                                                               'rgba(59, 130, 246, 0.2)')
                                                            : (item.daysRemaining < 0 ? '#FEE2E2' : 
                                                               item.daysRemaining <= 3 ? '#FEF3C7' : 
                                                               '#DBEAFE')
                                                    }}>
                                                        <Ionicons 
                                                            name={item.daysRemaining < 0 ? "alert-circle" : "time"} 
                                                            size={20} 
                                                            color={
                                                                item.daysRemaining < 0 ? '#EF4444' :
                                                                item.daysRemaining <= 3 ? '#F59E0B' :
                                                                '#3B82F6'
                                                            } 
                                                        />
                                                    </View>
                                                    <View className="flex-1">
                                                        <Text className="text-base font-semibold" numberOfLines={1} style={{ color: hexColors.foreground }}>
                                                            {item.name}
                                                        </Text>
                                                        <Text className="text-sm" style={{ color: hexColors.mutedForeground }}>
                                                            {item.courseName} • {
                                                                item.daysRemaining < 0 ? 'Overdue' :
                                                                item.daysRemaining === 0 ? 'Due Today' :
                                                                item.daysRemaining === 1 ? 'Due Tomorrow' :
                                                                `Due in ${item.daysRemaining} days`
                                                            }
                                                        </Text>
                                                    </View>
                                                    <Ionicons name="chevron-forward" size={20} color={hexColors.mutedForeground} />
                                                </TouchableOpacity>
                                            ))}
                                            <TouchableOpacity 
                                                className="mt-4 py-2 items-center"
                                                onPress={() => router.push('/(student)/tools/deadline-tracker')}
                                            >
                                                <Text className="font-semibold" style={{ color: hexColors.primary }}>View All Deadlines</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <View className="flex-1 items-center justify-center border-2 border-dashed rounded-2xl p-4" style={{
                                            borderColor: `${colors.border}80`,
                                            backgroundColor: `${colors.secondary}30`
                                        }}>
                                            <View className="w-14 h-14 rounded-full items-center justify-center mb-3 shadow-sm" style={{ backgroundColor: hexColors.background }}>
                                                <Ionicons name="hourglass-outline" size={24} color={hexColors.mutedForeground} />
                                            </View>
                                            <Text className="font-medium text-center" style={{ color: hexColors.foreground }}>All caught up!</Text>
                                            <Text className="text-xs text-center mt-2 leading-5" style={{ color: hexColors.secondaryForeground }}>
                                                When your grades change or assignments are due, they will appear here.
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </Animated.View>

                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}