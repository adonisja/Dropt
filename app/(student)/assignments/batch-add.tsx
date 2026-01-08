import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/lib/theme/theme-context';
import PlatformButton from '@/components/PlatformButton';
import { Picker } from '@react-native-picker/picker';
import { fetchStudentCourses, createAssignment, fetchGradeCategories, fetchAssignments } from '@/lib/api/data-client';
import { useAuth } from '@/lib/auth/auth-context';
import { logger } from '@/lib/utils/logger';
import { Ionicons } from '@expo/vector-icons';
import type { Schema } from '@/amplify/data/resource';
import { getNextAssignmentID } from '@/lib/utils/id-generators';

interface AssignmentInput {
    id: string; // Temporary ID for UI
    name: string;
    category: string;
    scoreEarned: string;
    maxScore: string;
    dateDue: string;
}

export default function BatchAddAssignments() {
    const { theme, hexColors, isDark } = useTheme();
    const router = useRouter();
    const { user } = useAuth();
    const params = useLocalSearchParams();
    
    const [courses, setCourses] = useState<Schema['StudentCourse']['type'][]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [categories, setCategories] = useState<Schema['GradeCategory']['type'][]>([]);
    
    const [assignments, setAssignments] = useState<AssignmentInput[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadCourses();
        
        if (params.prefillAssignments) {
            try {
                const parsed = JSON.parse(params.prefillAssignments as string);
                const mapped = parsed.map((a: any, index: number) => ({
                    id: `temp-${index}`,
                    name: a.name,
                    category: a.category, // This might not match existing categories, user needs to map it
                    scoreEarned: a.scoreEarned.toString(),
                    maxScore: a.maxScore.toString(),
                    dateDue: a.dateDue
                }));
                setAssignments(mapped);
            } catch (e) {
                logger.warn('Failed to parse assignments parameter', {
                    source: 'batch-add.useEffect',
                    data: { error: e }
                });
            }
        }
    }, []);

    useEffect(() => {
        if (selectedCourseId && user?.id) {
            loadCategories(selectedCourseId);
        }
    }, [selectedCourseId]);

    const loadCourses = async () => {
        if (!user?.id) return;
        try {
            const data = await fetchStudentCourses(user.id);
            setCourses(data);
            
            // Try to auto-select course based on prefill data
            if (params.prefillCourseId) {
                const prefillId = (params.prefillCourseId as string).toLowerCase().replace(/\s/g, '');
                const match = data.find(c => 
                    c.courseId.toLowerCase().replace(/\s/g, '') === prefillId || 
                    c.courseName.toLowerCase().includes(prefillId)
                );
                
                if (match) {
                    setSelectedCourseId(match.courseId);
                } else if (data.length > 0) {
                    setSelectedCourseId(data[0].courseId);
                }
            } else if (data.length > 0) {
                setSelectedCourseId(data[0].courseId);
            }
        } catch (error) {
            logger.error('Error loading courses for batch add', {
                source: 'batch-add.loadCourses',
                userId: user?.id,
                data: { error }
            });
            Alert.alert("Error", "Failed to load courses.");
        } finally {
            setIsLoading(false);
        }
    };

    const loadCategories = async (courseId: string) => {
        if (!user?.id) return;
        try {
            const studentCourseId = `${user.id}#${courseId}`;
            const cats = await fetchGradeCategories(studentCourseId);
            setCategories(cats);
        } catch (error) {
            logger.error('Error loading categories for batch add', {
                source: 'batch-add.loadCategories',
                userId: user?.id,
                data: { error, courseId }
            });
        }
    };

    const updateAssignment = (id: string, field: keyof AssignmentInput, value: string) => {
        setAssignments(prev => prev.map(a => 
            a.id === id ? { ...a, [field]: value } : a
        ));
    };

    const removeAssignment = (id: string) => {
        setAssignments(prev => prev.filter(a => a.id !== id));
    };

    const handleSaveAll = async () => {
        if (!selectedCourseId || !user?.id) {
            Alert.alert("Error", "Please select a course.");
            return;
        }

        // Validate
        for (const a of assignments) {
            if (!a.name || !a.category || !a.maxScore) {
                Alert.alert("Validation Error", "All assignments must have a name, category, and max score.");
                return;
            }
        }

        setIsSaving(true);
        try {
            const studentCourseId = `${user.id}#${selectedCourseId}`;
            
            // Fetch existing assignments to determine next IDs
            const existingAssignments = await fetchAssignments(studentCourseId);
            const existingIds = existingAssignments.map(a => a.assignmentId);

            const promises = [];
            
            for (const a of assignments) {
                const nextId = getNextAssignmentID(existingIds, a.category);
                existingIds.push(nextId); // Update local list to ensure uniqueness for subsequent items

                promises.push(createAssignment(studentCourseId, {
                    assignmentId: nextId,
                    assignmentName: a.name,
                    category: a.category,
                    maxScore: parseFloat(a.maxScore),
                    scoreEarned: a.scoreEarned ? parseFloat(a.scoreEarned) : undefined,
                    dateDue: a.dateDue,
                    dateAssigned: new Date().toISOString().split('T')[0]
                }));
            }

            await Promise.all(promises);
            
            Alert.alert("Success", "Assignments saved successfully!", [
                { text: "OK", onPress: () => router.push(`/(student)/courses/${selectedCourseId}`) }
            ]);
        } catch (error) {
            logger.error('Error saving batch assignments', {
                source: 'batch-add.handleSaveAll',
                userId: user?.id,
                data: { error, courseId: selectedCourseId }
            });
            Alert.alert("Error", "Failed to save some assignments.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center " style={{ backgroundColor: hexColors.background }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View className="flex-1" style={{ backgroundColor: hexColors.background }}>
            <ScrollView className="flex-1 p-4">
                <Text className="text-2xl font-bold mb-4">Review Assignments</Text>
                
                <Text className="text-sm  mb-2" style={{ color: hexColors.mutedForeground }}>Select Course</Text>
                <View className="borderWidth: 1, borderColor: hexColors.border rounded-lg mb-6" style={{ backgroundColor: hexColors.card }}>
                    <Picker
                        selectedValue={selectedCourseId}
                        onValueChange={(itemValue) => setSelectedCourseId(itemValue)}
                        style={{ color: theme.colors.foreground }}
                    >
                        {courses.map(c => (
                            <Picker.Item key={c.courseId} label={`${c.courseName} (${c.courseId})`} value={c.courseId} />
                        ))}
                    </Picker>
                </View>

                <Text className="text-lg font-semibold mb-4">Assignments ({assignments.length})</Text>

                {assignments.map((item, index) => (
                    <View key={item.id} className="p-4 rounded-xl borderWidth: 1, borderColor: hexColors.border mb-4 shadow-sm" style={{ backgroundColor: hexColors.card }}>
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="font-bold " style={{ color: hexColors.mutedForeground }}>#{index + 1}</Text>
                            <TouchableOpacity onPress={() => removeAssignment(item.id)}>
                                <Ionicons name="trash-outline" size={20} color={theme.colors.destructive} />
                            </TouchableOpacity>
                        </View>

                        <View className="mb-3">
                            <Text className="text-xs mb-1" style={{ color: hexColors.mutedForeground }}>Name</Text>
                            <TextInput
                                className="rounded p-2"
                                style={{ backgroundColor: hexColors.background, borderWidth: 1, borderColor: hexColors.border, color: hexColors.foreground }}
                                value={item.name}
                                onChangeText={(text) => updateAssignment(item.id, 'name', text)}
                            />
                        </View>

                        <View className="flex-row gap-4 mb-3">
                            <View className="flex-1">
                                <Text className="text-xs mb-1" style={{ color: hexColors.mutedForeground }}>Score</Text>
                                <TextInput
                                    className="rounded p-2"
                                    style={{ backgroundColor: hexColors.background, borderWidth: 1, borderColor: hexColors.border, color: hexColors.foreground }}
                                    value={item.scoreEarned}
                                    onChangeText={(text) => updateAssignment(item.id, 'scoreEarned', text)}
                                    keyboardType="numeric"
                                    placeholder="-"
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-xs mb-1" style={{ color: hexColors.mutedForeground }}>Max</Text>
                                <TextInput
                                    className="rounded p-2"
                                    style={{ backgroundColor: hexColors.background, borderWidth: 1, borderColor: hexColors.border, color: hexColors.foreground }}
                                    value={item.maxScore}
                                    onChangeText={(text) => updateAssignment(item.id, 'maxScore', text)}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        <View className="mb-2">
                            <Text className="text-xs mb-1" style={{ color: hexColors.mutedForeground }}>Category</Text>
                            {categories.length > 0 ? (
                                <View className="rounded" style={{ backgroundColor: hexColors.background, borderWidth: 1, borderColor: hexColors.border }}>
                                    <Picker
                                        selectedValue={item.category}
                                        onValueChange={(val) => updateAssignment(item.id, 'category', val)}
                                        style={{ color: hexColors.foreground, height: 50 }}
                                    >
                                        <Picker.Item label="Select Category..." value="" />
                                        {categories.map(cat => (
                                            <Picker.Item key={cat.category} label={cat.category} value={cat.category} />
                                        ))}
                                    </Picker>
                                </View>
                            ) : (
                                <TextInput
                                    className="rounded p-2"
                                    style={{ backgroundColor: hexColors.background, borderWidth: 1, borderColor: hexColors.border, color: hexColors.foreground }}
                                    value={item.category}
                                    onChangeText={(text) => updateAssignment(item.id, 'category', text)}
                                    placeholder="e.g. Homework"
                                />
                            )}
                        </View>
                    </View>
                ))}

                <View className="h-20" /> 
            </ScrollView>

            <View className="p-4 border-t border-border " style={{ backgroundColor: hexColors.background }}>
                <PlatformButton
                    onPress={handleSaveAll}
                    disabled={isSaving}
                    style={{ 
                        backgroundColor: theme.colors.primary, 
                        padding: 16, 
                        borderRadius: 12, 
                        alignItems: 'center' 
                    }}
                >
                    {isSaving ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Save All Assignments</Text>
                    )}
                </PlatformButton>
            </View>
        </View>
    );
}