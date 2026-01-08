import { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Switch,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '@/lib/auth/auth-context';
import { useTheme } from '@/lib/theme/theme-context';
import { getStudentCourse, updateStudentCourse, deleteStudentCourse } from '@/lib/api/data-client';
import SuccessScreen from '@/components/SuccessScreen';

export default function EditCourse() {
    const { user } = useAuth();
    const { theme, hexColors, isDark } = useTheme();
    const { courseId } = useLocalSearchParams<{ courseId: string }>();

    const [courseName, setCourseName] = useState('');
    const [department, setDepartment] = useState('');
    const [isRequired, setIsRequired] = useState(false);
    const [passingGrade, setPassingGrade] = useState('');
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        loadCourseData();
    }, [user?.id, courseId]);

    const loadCourseData = async () => {
        if (!user?.id || !courseId) {
            setFormError('Missing course information');
            setIsLoading(false);
            return;
        }

        try {
            const course = await getStudentCourse(user.id, courseId);
            if (course) {
                setCourseName(course.courseName);
                setDepartment(course.department || '');
                setIsRequired(course.isRequired || false);
                setPassingGrade(course.passingGrade?.toString() || '60');
            } else {
                setFormError('Course not found');
            }
        } catch (err) {
            setFormError('Failed to load course details');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const validateForm = (): string | null => {
        if (!courseName.trim()) {
            return 'Course name is required';
        }
        return null;
    };

    const handleDelete = async () => {
        const performDelete = async () => {
            if (!user?.id || !courseId) return;
            
            setIsSubmitting(true);
            try {
                console.log('Attempting to delete course:', courseId);
                const success = await deleteStudentCourse(user.id, courseId);
                console.log('Delete result:', success);
                if (success) {
                    // Navigate to dashboard and force refresh
                    router.replace('/(student)/student_dashboard');
                } else {
                    setFormError('Failed to delete course. Check console for details.');
                    setIsSubmitting(false);
                }
            } catch (error) {
                console.error('Delete exception:', error);
                setFormError('An error occurred while deleting');
                setIsSubmitting(false);
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm("Are you sure you want to delete this course? This action cannot be undone and all associated data (grades, assignments) will be lost.")) {
                await performDelete();
            }
        } else {
            Alert.alert( "Delete Course", "Are you sure you want to delete this course? This action cannot be undone and all associated data (grades, assignments) will be lost.",
                [
                    {
                        text: "Cancel",
                        style: "cancel"
                    },
                    {
                        text: "Delete",
                        style: "destructive",
                        onPress: performDelete
                    }
                ]
            );
        }
    };

    const handleSubmit = async () => {
        const error = validateForm();
        if (error) {
            setFormError(error);
            return;
        }

        setFormError(null);

        if (!user?.id || !courseId) {
            setFormError('Missing user or course information');
            return;
        }

        setIsSubmitting(true);

        try {
            const updatedCourse = await updateStudentCourse(user.id, courseId, {
                courseName: courseName.trim(),
                department: department.trim() || undefined,
                isRequired,
                passingGrade: parseFloat(passingGrade),
            });

            if (!updatedCourse) {
                throw new Error('Failed to update course');
            }

            setShowSuccess(true);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setFormError(`Failed to update course: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <View className="flex-1  justify-center items-center" style={{ backgroundColor: hexColors.background }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (showSuccess) {
        return (
            <SuccessScreen
                title="Course Updated!"
                message={`"${courseName}" has been successfully updated.`}
                actions={[
                    {
                        label: 'Return to Course',
                        onPress: () => router.back(),
                        primary: true,
                    },
                    {
                        label: 'Go to Dashboard',
                        onPress: () => router.replace('/(student)/student_dashboard'),
                    },
                ]}
            />
        );
    }

    return (
        <View className="flex-1" style={{ backgroundColor: hexColors.background }}>
            <SafeAreaView className="flex-1">
                <View className="px-4 py-2 flex-row items-center border-b border-border/50">
                    <TouchableOpacity 
                        onPress={() => router.back()}
                        className="p-2 -ml-2 mr-2 rounded-full active:bg-secondary"
                    >
                        <Ionicons name="arrow-back" size={24} color={theme.colors.foreground} />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold ml-2">Edit Course Details</Text>
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                >
                    <ScrollView 
                        className="flex-1 px-4 pt-4"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100 }}
                    >
                        {formError && (
                            <Animated.View 
                                entering={FadeInDown}
                                className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl mb-6 flex-row items-center"
                            >
                                <Ionicons name="alert-circle" size={20} color={theme.colors.destructive} />
                                <Text className="text-destructive ml-2 flex-1 font-medium">
                                    {formError}
                                </Text>
                            </Animated.View>
                        )}

                        {/* Course Info Section */}
                        <Animated.View 
                            entering={FadeInDown.delay(100).springify()}
                            className="mb-6"
                        >
                            <Text className="text-sm font-semibold  uppercase tracking-wider mb-3 px-1" style={{ color: hexColors.mutedForeground }}>
                                Course Information
                            </Text>
                            
                            <View className="rounded-xl p-4 shadow-sm space-y-4" style={{ borderWidth: 1, borderColor: hexColors.border }}>
                                <View>
                                    <Text className="text-sm font-medium mb-1.5">
                                        Course Name <Text className="text-destructive">*</Text>
                                    </Text>
                                    <TextInput
                                        className="rounded-lg px-3 py-2.5"
                                        style={{ backgroundColor: hexColors.background, borderWidth: 1, borderColor: hexColors.input, color: hexColors.foreground }}
                                        placeholder="e.g., Data Structures"
                                        placeholderTextColor={theme.colors.mutedForeground}
                                        value={courseName}
                                        onChangeText={setCourseName}
                                    />
                                </View>

                                <View>
                                    <Text className="text-sm font-medium mb-1.5">
                                        Course ID
                                    </Text>
                                    <View className="bg-muted/30 border border-input rounded-lg px-3 py-2.5">
                                        <Text className="text" style={{ color: hexColors.mutedForeground }}>{courseId}</Text>
                                    </View>
                                    <Text className="text-xs  mt-1" style={{ color: hexColors.mutedForeground }}>
                                        Course ID cannot be changed once created.
                                    </Text>
                                </View>

                                <View>
                                    <Text className="text-sm font-medium mb-1.5">
                                        Department
                                    </Text>
                                    <TextInput
                                        className="rounded-lg px-3 py-2.5"
                                        style={{ backgroundColor: hexColors.background, borderWidth: 1, borderColor: hexColors.input, color: hexColors.foreground }}
                                        placeholder="e.g., Computer Science"
                                        placeholderTextColor={theme.colors.mutedForeground}
                                        value={department}
                                        onChangeText={setDepartment}
                                    />
                                </View>

                                <View>
                                    <Text className="text-sm font-medium mb-1.5">
                                        Passing Grade (%)
                                    </Text>
                                    <TextInput
                                        className="rounded-lg px-3 py-2.5"
                                        style={{ backgroundColor: hexColors.background, borderWidth: 1, borderColor: hexColors.input, color: hexColors.foreground }}
                                        placeholder="e.g., 60"
                                        placeholderTextColor={theme.colors.mutedForeground}
                                        value={passingGrade}
                                        onChangeText={setPassingGrade}
                                        keyboardType="numeric"
                                    />
                                </View>

                                <View className="flex-row justify-between items-center pt-2">
                                    <View>
                                        <Text className="text-base font-medium " style={{ color: hexColors.foreground }}>Required for Major</Text>
                                        <Text className="text-xs " style={{ color: hexColors.mutedForeground }}>Is this course required for your degree?</Text>
                                    </View>
                                    <Switch
                                        value={isRequired}
                                        onValueChange={setIsRequired}
                                        trackColor={{ false: theme.colors.muted, true: theme.colors.primary }}
                                        thumbColor={Platform.OS === 'ios' ? '#fff' : isRequired ? theme.colors.primary : '#f4f3f4'}
                                    />
                                </View>
                            </View>
                        </Animated.View>

                        {/* Submit Button */}
                        <Animated.View 
                            entering={FadeInDown.delay(200).springify()}
                            className="mb-4"
                        >
                            <TouchableOpacity
                                onPress={handleSubmit}
                                disabled={isSubmitting}
                                className={`w-full py-4 rounded-xl flex-row items-center justify-center shadow-lg ${
                                    isSubmitting ? 'bg-muted' : 'bg-primary shadow-primary/30'
                                }`}
                            >
                                {isSubmitting ? (
                                    <Text className="font-bold text-lg" style={{ color: hexColors.mutedForeground }}>Updating Course...</Text>
                                ) : (
                                    <>
                                        <Ionicons name="save-outline" size={24} color="white" style={{ marginRight: 8 }} />
                                        <Text className="-foreground font-bold text-lg" style={{ color: hexColors.primary }}>Save Changes</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Delete Button */}
                        <Animated.View 
                            entering={FadeInDown.delay(300).springify()}
                            className="mb-8"
                        >
                            <TouchableOpacity
                                onPress={handleDelete}
                                disabled={isSubmitting}
                                className="w-full py-4 rounded-xl flex-row items-center justify-center border border-red-500 bg-red-50"
                            >
                                <Ionicons name="trash-outline" size={24} color="#ef4444" style={{ marginRight: 8 }} />
                                <Text className="text-red-500 font-bold text-lg">Delete Course</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}
