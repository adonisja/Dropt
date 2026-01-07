import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/lib/theme/theme-context';
import PlatformButton from '@/components/PlatformButton';
import { Picker } from '@react-native-picker/picker';
import { fetchStudentCourses, createAssignment, fetchGradeCategories, fetchAssignments } from '@/lib/api/data-client';
import { useAuth } from '@/lib/auth/auth-context';
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
    const { theme } = useTheme();
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
                console.error("Failed to parse assignments", e);
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
            console.error("Error fetching courses:", error);
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
            console.error("Error fetching categories:", error);
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
            console.error("Error saving assignments:", error);
            Alert.alert("Error", "Failed to save some assignments.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-background">
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-background">
            <ScrollView className="flex-1 p-4">
                <Text className="text-2xl font-bold text-foreground mb-4">Review Assignments</Text>
                
                <Text className="text-sm text-muted-foreground mb-2">Select Course</Text>
                <View className="bg-card border border-border rounded-lg mb-6">
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

                <Text className="text-lg font-semibold text-foreground mb-4">Assignments ({assignments.length})</Text>

                {assignments.map((item, index) => (
                    <View key={item.id} className="bg-card p-4 rounded-xl border border-border mb-4 shadow-sm">
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="font-bold text-muted-foreground">#{index + 1}</Text>
                            <TouchableOpacity onPress={() => removeAssignment(item.id)}>
                                <Ionicons name="trash-outline" size={20} color={theme.colors.destructive} />
                            </TouchableOpacity>
                        </View>

                        <View className="mb-3">
                            <Text className="text-xs text-muted-foreground mb-1">Name</Text>
                            <TextInput
                                className="bg-background border border-border rounded p-2 text-foreground"
                                value={item.name}
                                onChangeText={(text) => updateAssignment(item.id, 'name', text)}
                            />
                        </View>

                        <View className="flex-row gap-4 mb-3">
                            <View className="flex-1">
                                <Text className="text-xs text-muted-foreground mb-1">Score</Text>
                                <TextInput
                                    className="bg-background border border-border rounded p-2 text-foreground"
                                    value={item.scoreEarned}
                                    onChangeText={(text) => updateAssignment(item.id, 'scoreEarned', text)}
                                    keyboardType="numeric"
                                    placeholder="-"
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-xs text-muted-foreground mb-1">Max</Text>
                                <TextInput
                                    className="bg-background border border-border rounded p-2 text-foreground"
                                    value={item.maxScore}
                                    onChangeText={(text) => updateAssignment(item.id, 'maxScore', text)}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        <View className="mb-2">
                            <Text className="text-xs text-muted-foreground mb-1">Category</Text>
                            {categories.length > 0 ? (
                                <View className="bg-background border border-border rounded">
                                    <Picker
                                        selectedValue={item.category}
                                        onValueChange={(val) => updateAssignment(item.id, 'category', val)}
                                        style={{ color: theme.colors.foreground, height: 50 }}
                                    >
                                        <Picker.Item label="Select Category..." value="" />
                                        {categories.map(cat => (
                                            <Picker.Item key={cat.category} label={cat.category} value={cat.category} />
                                        ))}
                                    </Picker>
                                </View>
                            ) : (
                                <TextInput
                                    className="bg-background border border-border rounded p-2 text-foreground"
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

            <View className="p-4 border-t border-border bg-background">
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