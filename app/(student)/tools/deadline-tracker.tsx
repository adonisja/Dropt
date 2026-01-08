import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth/auth-context';
import { useTheme } from '@/lib/theme/theme-context';
import { fetchStudentCourses, fetchAssignments, getOrCreateUserSettings } from '@/lib/api/data-client';
import { getSemesterStats } from '@/lib/utils/semester-stats';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface AssignmentWithCourse {
    id: string;
    name: string;
    courseName: string;
    courseId: string;
    dateDue: string;
    daysRemaining: number;
    status: 'overdue' | 'due-soon' | 'upcoming' | 'completed';
    score: number | null;
    maxScore: number;
}

const StatsCard = ({ title, value, icon, color, bgColor }: { title: string, value: number, icon: keyof typeof Ionicons.glyphMap, color: string, bgColor: string }) => {
    const { hexColors } = useTheme();
    return (
        <View className="flex-1  p-4 rounded-2xl shadow-sm mx-1.5" style={{ backgroundColor: hexColors.card, borderWidth: 1, borderColor: hexColors.border }}>
            <View className="flex-row items-center gap-3">
                <View className={`w-10 h-10 rounded-xl items-center justify-center ${bgColor}`}>
                    <Ionicons name={icon} size={20} color={color} />
                </View>
                <View>
                    <Text className="text-2xl font-bold " style={{ color: hexColors.foreground }}>{value}</Text>
                    <Text className="text-xs  font-medium" style={{ color: hexColors.mutedForeground }}>{title}</Text>
                </View>
            </View>
        </View>
    );
};

const EmptyState = () => {
    const { hexColors } = useTheme();
    return (
        <View className="items-center justify-center py-20 px-4">
            <LinearGradient
                colors={['#0D9488', '#0EA5E9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-20 h-20 rounded-3xl items-center justify-center mb-6 shadow-sm"
            >
                <Ionicons name="calendar-outline" size={40} color="white" />
            </LinearGradient>
            <Text className="text-xl font-bold mb-2" style={{ color: hexColors.foreground }}>No Assignments Yet</Text>
            <Text className="text-sm  text-center max-w-[250px]" style={{ color: hexColors.mutedForeground }}>
                Add courses or assignments to start tracking your deadlines and stay on top of your work.
            </Text>
        </View>
    );
};

export default function DeadlineTracker() {
    const { user } = useAuth();
    const { theme, hexColors, isDark } = useTheme();
    const [isLoading, setIsLoading] = useState(true);
    const [assignments, setAssignments] = useState<AssignmentWithCourse[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [lifetimeStats, setLifetimeStats] = useState({ totalTasksCompleted: 0, totalTasksMissed: 0, totalTasksEver: 0 });
    const [currentSemester, setCurrentSemester] = useState<string>('');
    const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());

    const loadData = async () => {
        if (!user?.id) return;
        
        try {
            // Fetch user settings to get current semester
            const userSettings = await getOrCreateUserSettings(user.id);
            setCurrentSemester(userSettings.currentSemester || 'Spring');
            setCurrentYear(userSettings.currentYear);
            
            // Fetch lifetime statistics
            const stats = await getSemesterStats(user.id);
            setLifetimeStats(stats);
            
            // Fetch all courses and filter by current semester
            const allCourses = await fetchStudentCourses(user.id);
            const courses = allCourses.filter(course => 
                course.semester === userSettings.currentSemester && 
                course.year === userSettings.currentYear
            );
            
            const assignmentsPromises = courses.map(async (course) => {
                const courseAssignments = await fetchAssignments(`${user.id}#${course.courseId}`);
                return courseAssignments.map(a => ({
                    ...a,
                    courseName: course.courseName,
                    courseId: course.courseId
                }));
            });

            const results = await Promise.all(assignmentsPromises);
            const allAssignments = results.flat();

            const processed = allAssignments.map(a => {
                const dueDate = new Date(a.dateDue);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const dueDay = new Date(dueDate);
                dueDay.setHours(0, 0, 0, 0);

                const diffTime = dueDay.getTime() - today.getTime();
                const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                let status: AssignmentWithCourse['status'] = 'upcoming';
                if (a.scoreEarned !== null && a.scoreEarned !== undefined) {
                    status = 'completed';
                } else if (daysRemaining < 0) {
                    status = 'overdue';
                } else if (daysRemaining <= 3) {
                    status = 'due-soon';
                }

                return {
                    id: a.assignmentId,
                    name: a.assignmentName,
                    courseName: a.courseName,
                    courseId: a.courseId,
                    dateDue: a.dateDue,
                    daysRemaining,
                    status,
                    score: a.scoreEarned ?? null,
                    maxScore: a.maxScore
                };
            });

            // Initial sort just in case, but we will filter later
            processed.sort((a, b) => a.daysRemaining - b.daysRemaining);

            setAssignments(processed);
        } catch (error) {
            logger.error('Error loading deadline data', {
                source: 'deadline-tracker.loadData',
                userId: user?.id,
                data: { error }
            });
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [user?.id]);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const stats = {
        total: assignments.length,
        dueSoon: assignments.filter(a => a.status === 'due-soon').length,
        overdue: assignments.filter(a => a.status === 'overdue').length
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'overdue': return '#EF4444';
            case 'due-soon': return '#F59E0B';
            case 'completed': return '#10B981';
            default: return '#3B82F6';
        }
    };

    const getStatusBg = (status: string) => {
        switch (status) {
            case 'overdue': return 'bg-red-500/10';
            case 'due-soon': return 'bg-amber-500/10';
            case 'completed': return 'bg-emerald-500/10';
            default: return 'bg-blue-500/10';
        }
    };

    const getStatusIcon = (status: string): keyof typeof Ionicons.glyphMap => {
        switch (status) {
            case 'overdue': return 'alert-circle';
            case 'due-soon': return 'time';
            case 'completed': return 'checkmark';
            default: return 'calendar';
        }
    };

    const getStatusLabel = (item: AssignmentWithCourse) => {
        if (item.status === 'completed') return 'Completed';
        if (item.daysRemaining < 0) return `${Math.abs(item.daysRemaining)}d Overdue`;
        if (item.daysRemaining === 0) return 'Due Today';
        if (item.daysRemaining === 1) return 'Due Tomorrow';
        return `Due in ${item.daysRemaining} days`;
    };

    const formatDueDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const renderAssignmentCard = (item: AssignmentWithCourse, index: number) => (
        <Animated.View 
            key={`${item.courseId}-${item.id}`}
            entering={FadeInDown.delay(index * 50).springify()}
            className="mb-3"
        >
            <TouchableOpacity 
                className="rounded-2xl borderWidth: 1, borderColor: hexColors.border shadow-sm overflow-hidden flex-row"
                activeOpacity={0.7}
            >
                {/* Status Bar Edge */}
                <View 
                    className="w-1.5 h-full" 
                    style={{ backgroundColor: getStatusColor(item.status) }} 
                />
                
                <View className="flex-1 p-5">
                    {/* Card Header */}
                    <View className="flex-row justify-between items-start mb-3">
                        <View className="flex-1 mr-4">
                            <Text className="text-base font-semibold " style={{ color: hexColors.foreground }} numberOfLines={1}>
                                {item.name}
                            </Text>
                            <Text className="text-sm  font-medium mt-0.5" style={{ color: hexColors.mutedForeground }}>
                                {item.courseName}
                            </Text>
                        </View>
                        
                        <View className={`px-3 py-1.5 rounded-full flex-row items-center ${getStatusBg(item.status)}`}>
                            <Ionicons 
                                name={getStatusIcon(item.status)} 
                                size={14} 
                                color={getStatusColor(item.status)} 
                            />
                            <Text style={{ color: getStatusColor(item.status) }} className="text-xs font-semibold ml-1.5">
                                {getStatusLabel(item)}
                            </Text>
                        </View>
                    </View>
                    
                    {/* Card Footer */}
                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                            <Ionicons name="calendar-outline" size={16} color={theme.colors.mutedForeground} />
                            <Text className="text-sm  ml-2 font-medium" style={{ color: hexColors.mutedForeground }}>
                                {formatDueDate(item.dateDue)}
                            </Text>
                        </View>
                        
                        {item.status === 'completed' && item.score !== null && (
                            <View className="flex-row items-center bg-emerald-500/10 px-2 py-1 rounded-lg">
                                <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                                <Text className="text-sm font-bold text-emerald-500 ml-1.5">
                                    {item.score}/{item.maxScore}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );

    const overdueAssignments = assignments.filter(a => a.status === 'overdue').sort((a, b) => a.daysRemaining - b.daysRemaining);
    const upcomingAssignments = assignments.filter(a => a.status === 'upcoming' || a.status === 'due-soon').sort((a, b) => a.daysRemaining - b.daysRemaining);
    const completedAssignments = assignments.filter(a => a.status === 'completed');

    const completedByCourse = completedAssignments.reduce((acc, curr) => {
        if (!acc[curr.courseName]) acc[curr.courseName] = [];
        acc[curr.courseName].push(curr);
        return acc;
    }, {} as Record<string, AssignmentWithCourse[]>);

    return (
        <View className="flex-1" style={{ backgroundColor: hexColors.background }}>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView className="flex-1">
                {/* Header */}
                <View className="px-4 py-3 border-b border-border/50 flex-row items-center justify-between /80" style={{ backgroundColor: hexColors.background }}>
                    <TouchableOpacity 
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-full bg-secondary/50 items-center justify-center"
                    >
                        <Ionicons name="arrow-back" size={20} color={theme.colors.foreground} />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold " style={{ color: hexColors.foreground }}>Deadline Tracker</Text>
                    <TouchableOpacity 
                        onPress={onRefresh}
                        className="w-10 h-10 rounded-full bg-secondary/50 items-center justify-center"
                    >
                        <Ionicons name="refresh" size={20} color={theme.colors.foreground} />
                    </TouchableOpacity>
                </View>

                {isLoading ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                    </View>
                ) : (
                    <ScrollView 
                        className="flex-1"
                        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                    >
                        {/* Current Semester Header */}
                        <View className="mb-4">
                            <Text className="text-sm font-semibold  uppercase tracking-wider" style={{ color: hexColors.mutedForeground }}>
                                Current Semester
                            </Text>
                            <Text className="text-2xl font-bold " style={{ color: hexColors.foreground }}>
                                {currentSemester} {currentYear}
                            </Text>
                        </View>

                        {/* Current Semester Stats Bar */}
                        <View className="flex-row mb-6 -mx-1.5">
                            <StatsCard 
                                title="Total Tasks" 
                                value={stats.total} 
                                icon="layers-outline" 
                                color="#3B82F6" 
                                bgColor="bg-blue-500/10"
                            />
                            <StatsCard 
                                title="Due Soon" 
                                value={stats.dueSoon} 
                                icon="time-outline" 
                                color="#F59E0B" 
                                bgColor="bg-amber-500/10"
                            />
                            <StatsCard 
                                title="Overdue" 
                                value={stats.overdue} 
                                icon="alert-circle-outline" 
                                color="#EF4444" 
                                bgColor="bg-red-500/10"
                            />
                        </View>

                        {/* Lifetime Stats Section */}
                        <View className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-4 mb-6 borderWidth: 1, borderColor: hexColors.border">
                            <View className="flex-row items-center gap-2 mb-3">
                                <Ionicons name="trophy" size={18} color={theme.colors.primary} />
                                <Text className="text-sm font-bold uppercase tracking-wider">
                                    All-Time Statistics
                                </Text>
                            </View>
                            <View className="flex-row justify-between">
                                <View className="flex-1 items-center">
                                    <Text className="text-2xl font-bold text-emerald-500">
                                        {lifetimeStats.totalTasksCompleted}
                                    </Text>
                                    <Text className="text-xs  mt-1" style={{ color: hexColors.mutedForeground }}>Completed</Text>
                                </View>
                                <View className="flex-1 items-center border-x border-border">
                                    <Text className="text-2xl font-bold text-red-500">
                                        {lifetimeStats.totalTasksMissed}
                                    </Text>
                                    <Text className="text-xs  mt-1" style={{ color: hexColors.mutedForeground }}>Missed</Text>
                                </View>
                                <View className="flex-1 items-center">
                                    <Text className="text-2xl font-bold " style={{ color: hexColors.primary }}>
                                        {lifetimeStats.totalTasksEver}
                                    </Text>
                                    <Text className="text-xs  mt-1" style={{ color: hexColors.mutedForeground }}>Total Ever</Text>
                                </View>
                            </View>
                        </View>

                        {assignments.length === 0 ? (
                            <EmptyState />
                        ) : (
                            <View>
                                {/* Overdue Section */}
                                {overdueAssignments.length > 0 && (
                                    <View className="mb-6">
                                        <View className="flex-row items-center gap-2 mb-3 px-1">
                                            <Ionicons name="alert-circle" size={20} color="#EF4444" />
                                            <Text className="text-lg font-bold text-red-500">Overdue</Text>
                                        </View>
                                        {overdueAssignments.map((item, index) => renderAssignmentCard(item, index))}
                                    </View>
                                )}

                                {/* Upcoming Section */}
                                {upcomingAssignments.length > 0 && (
                                    <View className="mb-6">
                                        <View className="flex-row items-center gap-2 mb-3 px-1">
                                            <Ionicons name="calendar" size={20} color={theme.colors.foreground} />
                                            <Text className="text-lg font-bold " style={{ color: hexColors.foreground }}>Upcoming Deadlines</Text>
                                        </View>
                                        {upcomingAssignments.map((item, index) => renderAssignmentCard(item, index))}
                                    </View>
                                )}

                                {/* Completed Section Button */}
                                {completedAssignments.length > 0 && (
                                    <TouchableOpacity 
                                        onPress={() => setModalVisible(true)}
                                        className="p-4 rounded-2xl borderWidth: 1, borderColor: hexColors.border shadow-sm flex-row items-center justify-between mt-2" style={{ backgroundColor: hexColors.card }}
                                    >
                                        <View className="flex-row items-center gap-3">
                                            <View className="w-10 h-10 rounded-xl bg-emerald-500/10 items-center justify-center">
                                                <Ionicons name="checkmark-done" size={20} color="#10B981" />
                                            </View>
                                            <View>
                                                <Text className="text-base font-bold " style={{ color: hexColors.foreground }}>Completed Assignments</Text>
                                                <Text className="text-xs " style={{ color: hexColors.mutedForeground }}>{completedAssignments.length} tasks finished</Text>
                                            </View>
                                        </View>
                                        <Ionicons name="chevron-forward" size={20} color={theme.colors.mutedForeground} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </ScrollView>
                )}
            </SafeAreaView>

            {/* Completed Assignments Modal */}
            <Modal
                animationType="slide"
                presentationStyle="pageSheet"
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1" style={{ backgroundColor: hexColors.background }}>
                    {/* Modal Header */}
                    <View className="px-4 py-4 border-b border-border/50 flex-row items-center justify-between " style={{ backgroundColor: hexColors.card, borderWidth: 1, borderColor: hexColors.border }}>
                        <Text className="text-lg font-bold " style={{ color: hexColors.foreground }}>Completed Tasks</Text>
                        <TouchableOpacity 
                            onPress={() => setModalVisible(false)} 
                            className="w-8 h-8 rounded-full bg-secondary items-center justify-center"
                        >
                            <Ionicons name="close" size={20} color={theme.colors.foreground} />
                        </TouchableOpacity>
                    </View>
                    
                    <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 40 }}>
                        {Object.entries(completedByCourse).map(([courseName, courseAssignments]) => (
                            <View key={courseName} className="mb-6">
                                <View className="flex-row items-center gap-2 mb-3 px-1">
                                    <View className="w-1 h-4 bg-emerald-500 rounded-full" />
                                    <Text className="text-sm font-bold  uppercase tracking-wider" style={{ color: hexColors.mutedForeground }}>
                                        {courseName}
                                    </Text>
                                </View>
                                {courseAssignments.map((item, index) => renderAssignmentCard(item, index))}
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}
