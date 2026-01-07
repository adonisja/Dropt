import { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/lib/auth/auth-context';
import {
    fetchCompleteCourseData,
    transformToStudentCourseData,
} from '@/lib/api/data-client';
import { calculateCurrentGrade } from '@/lib/logic/calculateCurrentGrade';

interface AssignmentSimulation {
    assignmentId: string;
    assignmentName: string;
    category: string;
    maxScore: number;
    scoreEarned: number | null;
    simulatedScore: number | null;
}

export default function WhatIfCalculator() {
    const { user } = useAuth();
    const { courseId } = useLocalSearchParams<{ courseId: string }>();

    const [assignments, setAssignments] = useState<AssignmentSimulation[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [courseName, setCourseName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentGrade, setCurrentGrade] = useState<number | null>(null);
    const [simulatedGrade, setSimulatedGrade] = useState<number | null>(null);

    useEffect(() => {
        loadCourseData();
    }, [user?.id, courseId]);

    const loadCourseData = async () => {
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
                setIsLoading(false);
                return;
            }

            setCourseName(data.studentCourse.courseName);
            setCategories(data.categories);

            const assignmentSims: AssignmentSimulation[] = data.assignments.map(a => ({
                assignmentId: a.assignmentId,
                assignmentName: a.assignmentName,
                category: a.category,
                maxScore: a.maxScore,
                scoreEarned: a.scoreEarned === undefined ? null : a.scoreEarned,
                simulatedScore: a.scoreEarned === undefined ? null : a.scoreEarned,
            }));

            setAssignments(assignmentSims);

            // Calculate current grade
            const studentCourseData = transformToStudentCourseData(data);
            const gradedAssignments = data.assignments.filter(a => a.scoreEarned !== null);

            if (gradedAssignments.length > 0) {
                const current = calculateCurrentGrade(studentCourseData);
                setCurrentGrade(current);
                setSimulatedGrade(current);
            }

            setIsLoading(false);
        } catch (err) {
            console.error('Error loading course data:', err);
            setError('Failed to load course data');
            setIsLoading(false);
        }
    };

    const updateSimulatedScore = (assignmentId: string, scoreText: string) => {
        const score = scoreText === '' ? null : parseFloat(scoreText);

        setAssignments(prev => prev.map(a =>
            a.assignmentId === assignmentId
                ? { ...a, simulatedScore: score }
                : a
        ));
    };

    const calculateSimulatedGrade = () => {
        if (categories.length === 0 || assignments.length === 0) {
            return;
        }

        // Build data structure for grade calculation
        const categoryData: Record<string, any> = {};

        for (const cat of categories) {
            categoryData[cat.category] = {
                weight: cat.weight,
                dropLowest: cat.dropLowest || 0,
                assignments: [],
            };
        }

        // Add assignments with simulated scores
        for (const assignment of assignments) {
            if (assignment.simulatedScore !== null) {
                categoryData[assignment.category].assignments.push({
                    scoreEarned: assignment.simulatedScore,
                    maxScore: assignment.maxScore,
                });
            }
        }

        // Calculate weighted grade
        let totalWeight = 0;
        let weightedSum = 0;

        for (const category of Object.values(categoryData)) {
            const cat = category as any;
            if (cat.assignments.length === 0) continue;

            // Sort by percentage (ascending) for drop lowest
            const scores = cat.assignments.map((a: any) => ({
                earned: a.scoreEarned,
                max: a.maxScore,
                percentage: (a.scoreEarned / a.maxScore) * 100,
            }));

            scores.sort((a: any, b: any) => a.percentage - b.percentage);

            // Drop lowest if applicable
            const scoresToUse = cat.dropLowest > 0 && scores.length > cat.dropLowest
                ? scores.slice(cat.dropLowest)
                : scores;

            const earnedPoints = scoresToUse.reduce((sum: number, s: any) => sum + s.earned, 0);
            const totalPoints = scoresToUse.reduce((sum: number, s: any) => sum + s.max, 0);

            if (totalPoints > 0) {
                const categoryPercentage = (earnedPoints / totalPoints) * 100;
                weightedSum += categoryPercentage * cat.weight;
                totalWeight += cat.weight;
            }
        }

        const simGrade = totalWeight > 0 ? weightedSum / totalWeight : null;
        setSimulatedGrade(simGrade);
    };

    useEffect(() => {
        calculateSimulatedGrade();
    }, [assignments]);

    const resetSimulation = () => {
        setAssignments(prev => prev.map(a => ({
            ...a,
            simulatedScore: a.scoreEarned,
        })));
    };

    const setAllUngraded = (score: number) => {
        setAssignments(prev => prev.map(a => ({
            ...a,
            simulatedScore: a.scoreEarned !== null ? a.scoreEarned : score,
        })));
    };

    const getGradeColor = (grade: number | null): string => {
        if (grade === null) return '#666';
        if (grade >= 90) return '#4CAF50';
        if (grade >= 80) return '#8BC34A';
        if (grade >= 70) return '#FFC107';
        if (grade >= 60) return '#FF9800';
        return '#F44336';
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1 }}>
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Loading calculator...</Text>
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={{ flex: 1 }}>
                <View style={styles.centered}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // Group assignments by category
    const assignmentsByCategory: Record<string, AssignmentSimulation[]> = {};
    for (const assignment of assignments) {
        if (!assignmentsByCategory[assignment.category]) {
            assignmentsByCategory[assignment.category] = [];
        }
        assignmentsByCategory[assignment.category].push(assignment);
    }

    const gradeDifference = simulatedGrade !== null && currentGrade !== null
        ? simulatedGrade - currentGrade
        : null;

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>What-If Calculator</Text>
                    <Text style={styles.headerSubtitle}>{courseName}</Text>
                </View>

                {/* Grade Comparison */}
                <View style={styles.comparisonCard}>
                    <View style={styles.gradeColumn}>
                        <Text style={styles.gradeLabel}>Current Grade</Text>
                        <Text style={[styles.gradeValue, { color: getGradeColor(currentGrade) }]}>
                            {currentGrade !== null ? `${currentGrade.toFixed(1)}%` : '--'}
                        </Text>
                    </View>

                    <View style={styles.arrowContainer}>
                        <Text style={styles.arrow}>→</Text>
                    </View>

                    <View style={styles.gradeColumn}>
                        <Text style={styles.gradeLabel}>Simulated Grade</Text>
                        <Text style={[styles.gradeValue, { color: getGradeColor(simulatedGrade) }]}>
                            {simulatedGrade !== null ? `${simulatedGrade.toFixed(1)}%` : '--'}
                        </Text>
                    </View>
                </View>

                {gradeDifference !== null && (
                    <View style={[
                        styles.differenceCard,
                        { backgroundColor: gradeDifference >= 0 ? '#E8F5E9' : '#FFEBEE' }
                    ]}>
                        <Text style={[
                            styles.differenceText,
                            { color: gradeDifference >= 0 ? '#2E7D32' : '#C62828' }
                        ]}>
                            {gradeDifference >= 0 ? '+' : ''}{gradeDifference.toFixed(1)}% difference
                        </Text>
                    </View>
                )}

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={resetSimulation}
                    >
                        <Text style={styles.quickActionText}>Reset All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={() => setAllUngraded(100)}
                    >
                        <Text style={styles.quickActionText}>100% Ungraded</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={() => setAllUngraded(0)}
                    >
                        <Text style={styles.quickActionText}>0% Ungraded</Text>
                    </TouchableOpacity>
                </View>

                {/* Instructions */}
                <View style={styles.instructionsCard}>
                    <Text style={styles.instructionsTitle}>How to Use</Text>
                    <Text style={styles.instructionsText}>
                        Adjust the scores below to see how different grades would affect your final grade.
                        Change any assignment score to simulate "what if" scenarios.
                    </Text>
                </View>

                {/* Assignments by Category */}
                {Object.entries(assignmentsByCategory).map(([category, categoryAssignments]) => (
                    <View key={category} style={styles.categorySection}>
                        <Text style={styles.categoryTitle}>{category}</Text>

                        {categoryAssignments.map((assignment) => (
                            <View key={assignment.assignmentId} style={styles.assignmentRow}>
                                <View style={styles.assignmentInfo}>
                                    <Text style={styles.assignmentName}>
                                        {assignment.assignmentName}
                                    </Text>
                                    <Text style={styles.assignmentMax}>
                                        out of {assignment.maxScore}
                                    </Text>
                                </View>

                                <View style={styles.scoreInputContainer}>
                                    {assignment.scoreEarned !== null && (
                                        <Text style={styles.originalScore}>
                                            {assignment.scoreEarned}
                                        </Text>
                                    )}
                                    <TextInput
                                        style={[
                                            styles.scoreInput,
                                            assignment.simulatedScore !== assignment.scoreEarned && styles.scoreInputChanged
                                        ]}
                                        value={assignment.simulatedScore?.toString() || ''}
                                        onChangeText={(text) => updateSimulatedScore(assignment.assignmentId, text)}
                                        keyboardType="numeric"
                                        placeholder={assignment.scoreEarned === null ? 'Enter' : ''}
                                        placeholderTextColor="#999"
                                    />
                                </View>
                            </View>
                        ))}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        fontSize: 16,
        color: '#F44336',
        marginBottom: 16,
        textAlign: 'center',
    },
    backButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 4,
    },
    comparisonCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        margin: 16,
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        alignItems: 'center',
    },
    gradeColumn: {
        flex: 1,
        alignItems: 'center',
    },
    gradeLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
    },
    gradeValue: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    arrowContainer: {
        paddingHorizontal: 16,
    },
    arrow: {
        fontSize: 24,
        color: '#666',
    },
    differenceCard: {
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    differenceText: {
        fontSize: 16,
        fontWeight: '600',
    },
    quickActions: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginBottom: 16,
        gap: 8,
    },
    quickActionButton: {
        flex: 1,
        backgroundColor: '#007AFF',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    quickActionText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    instructionsCard: {
        backgroundColor: '#E3F2FD',
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 16,
        borderRadius: 12,
    },
    instructionsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1976D2',
        marginBottom: 8,
    },
    instructionsText: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    categorySection: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    categoryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    assignmentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    assignmentInfo: {
        flex: 1,
    },
    assignmentName: {
        fontSize: 14,
        color: '#333',
        marginBottom: 2,
    },
    assignmentMax: {
        fontSize: 12,
        color: '#999',
    },
    scoreInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    originalScore: {
        fontSize: 14,
        color: '#999',
        textDecorationLine: 'line-through',
    },
    scoreInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 14,
        color: '#333',
        width: 70,
        textAlign: 'center',
        backgroundColor: '#fff',
    },
    scoreInputChanged: {
        borderColor: '#007AFF',
        borderWidth: 2,
        backgroundColor: '#E3F2FD',
    },
});
