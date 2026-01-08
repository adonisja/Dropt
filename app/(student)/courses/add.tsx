import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, KeyboardAvoidingView,
    Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '@/lib/auth/auth-context';
import { useTheme } from '@/lib/theme/theme-context';
import { createStudentCourse, createGradeCategory } from '@/lib/api/data-client';
import { logger } from '@/lib/utils/logger';
import SuccessScreen from '@/components/SuccessScreen';


interface CategoryInput {
    category: string;
    weight: string;
    dropLowest: string;
}

const DEFAULT_CATEGORIES: CategoryInput[] = [
    { category: 'Homework', weight: '20', dropLowest: '1' },
    { category: 'Quizzes', weight: '15', dropLowest: '1' },
    { category: 'Midterm', weight: '25', dropLowest: '0' },
    { category: 'Final', weight: '40', dropLowest: '0' },
];

export default function AddCourse() {
    const { user } = useAuth();
    const { theme, hexColors, isDark } = useTheme();
    // Parse for pre-filled data from OCR
    const params = useLocalSearchParams<{ 
        prefillCourseName?: string;
        prefillCourseId?: string;
        prefillDepartment?: string;
        prefillInstructor?: string;
        prefillInstructorEmail?: string;
        prefillOfficeHours?: string;
        prefillClassDays?: string;
        prefillClassTime?: string;
        prefillPassingGrade?: string;
        prefillCategories?: string; // JSON string
    }>();

    const [courseName, setCourseName] = useState(params.prefillCourseName || '');
    const [courseId, setCourseId] = useState(params.prefillCourseId || '');
    const [department, setDepartment] = useState(params.prefillDepartment || '');
    const [instructor, setInstructor] = useState(params.prefillInstructor || '');
    const [instructorEmail, setInstructorEmail] = useState(params.prefillInstructorEmail || '');
    const [officeHours, setOfficeHours] = useState(params.prefillOfficeHours || '');
    const [classDays, setClassDays] = useState(params.prefillClassDays || '');
    const [classTime, setClassTime] = useState(params.prefillClassTime || '');
    const [isRequired, setIsRequired] = useState(false);
    const [passingGrade, setPassingGrade] = useState(params.prefillPassingGrade || '60');
    
    // Parse pre-filled categories if they exist, otherwise use defaults
    const getInitialCategories = () => {
        if (params.prefillCategories) {
            try {
                return JSON.parse(params.prefillCategories);
            } catch (e) {
                logger.warn('Failed to parse prefillCategories from params', {
                    source: 'courses.add.initialState',
                    data: { error: e }
                });
                return DEFAULT_CATEGORIES;
            }
        }
        return DEFAULT_CATEGORIES;
    }

    const [categories, setCategories] = useState<CategoryInput[]>(getInitialCategories); // Lazy Initialization
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [successData, setSuccessData] = useState<{ name: string; id: string; categoryCount: number } | null>(null);

    const addCategory = () => {
        setCategories([...categories, { category: '', weight: '', dropLowest: '0' }]);
    };

    const removeCategory = (index: number) => {
        if (categories.length > 1) {
            setCategories(categories.filter((_, i) => i !== index));
        }
    };

    const updateCategory = (index: number, field: keyof CategoryInput, value: string) => {
        const updated = [...categories];
        updated[index] = { ...updated[index], [field]: value };
        setCategories(updated);
    };

    const getTotalWeight = () => {
        return categories.reduce((sum, cat) => {
            const weight = parseFloat(cat.weight) || 0;
            return sum + weight;
        }, 0);
    };

    const validateForm = (): string | null => {
        if (!courseName.trim()) {
            return 'Course name is required';
        }
        if (!courseId.trim()) {
            return 'Course ID is required';
        }

        const totalWeight = getTotalWeight();
        if (Math.abs(totalWeight - 100) > 0.01) {
            return `Category weights must sum to 100% (currently ${totalWeight}%)`;
        }

        if (!passingGrade.trim()) {
            return 'Passing grade is required';
        }

        if (isNaN(Number(passingGrade)) || Number(passingGrade) < 0 || Number(passingGrade) > 100) {
            return 'Passing grade must be a number between 0 and 100';
        }

        for (const cat of categories) {
            if (!cat.category.trim()) {
                return 'All categories must have a name';
            }
            const weight = parseFloat(cat.weight);
            if (isNaN(weight) || weight <= 0) {
                return `Invalid weight for category "${cat.category}"`;
            }
        }

        return null;
    };

    const handleSubmit = async () => {
        const error = validateForm();
        if (error) {
            setFormError(error);
            return;
        }

        setFormError(null);

        if (!user?.id) {
            setFormError('You must be logged in to add a course');
            return;
        }

        setIsSubmitting(true);

        try {
            // Create the course
            const course = await createStudentCourse(user.id, {
                courseId: courseId.trim().toUpperCase(),
                courseName: courseName.trim(),
                department: department.trim() || undefined,
                instructor: instructor.trim() || undefined,
                instructorEmail: instructorEmail.trim() || undefined,
                officeHours: officeHours.trim() || undefined,
                classDays: classDays.trim() || undefined,
                classTime: classTime.trim() || undefined,
                isRequired,
                passingGrade: parseFloat(passingGrade),
            });

            if (!course) {
                throw new Error('Failed to create course - no data returned');
            }

            // Create the grade categories
            const studentCourseId = `${user.id}#${courseId.trim().toUpperCase()}`;
            const categoryResults = [];
            
            for (const cat of categories) {
                const categoryResult = await createGradeCategory(studentCourseId, {
                    category: cat.category.trim(),
                    weight: parseFloat(cat.weight),
                    dropLowest: parseInt(cat.dropLowest) || 0,
                });

                if (categoryResult) {
                    categoryResults.push(categoryResult);
                }
            }

            setSuccessData({
                name: courseName.trim(),
                id: courseId.trim().toUpperCase(),
                categoryCount: categoryResults.length,
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setFormError(`Failed to create course: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setCourseName('');
        setCourseId('');
        setDepartment('');
        setIsRequired(false);
        setCategories(DEFAULT_CATEGORIES);
        setFormError(null);
        setSuccessData(null);
    };

    const totalWeight = getTotalWeight();
    const isWeightValid = Math.abs(totalWeight - 100) <= 0.01;

    // Update state if params change (e.g. coming from OCR)
    useEffect(() => {
        if (params.prefillCourseName) setCourseName(params.prefillCourseName);
        if (params.prefillCourseId) setCourseId(params.prefillCourseId);
        if (params.prefillDepartment) setDepartment(params.prefillDepartment);
        if (params.prefillInstructor) setInstructor(params.prefillInstructor);
        if (params.prefillInstructorEmail) setInstructorEmail(params.prefillInstructorEmail);
        if (params.prefillOfficeHours) setOfficeHours(params.prefillOfficeHours);
        if (params.prefillClassDays) setClassDays(params.prefillClassDays);
        if (params.prefillClassTime) setClassTime(params.prefillClassTime);
        if (params.prefillPassingGrade) setPassingGrade(params.prefillPassingGrade);
        
        if (params.prefillCategories) {
            try {
                setCategories(JSON.parse(params.prefillCategories));
            } catch (e) {
                logger.warn('Failed to parse prefillCategories in useEffect', {
                    source: 'courses.add.useEffect',
                    data: { error: e }
                });
            }
        }
    }, [
        params.prefillCourseName,
        params.prefillCourseId,
        params.prefillDepartment,
        params.prefillInstructor,
        params.prefillInstructorEmail,
        params.prefillOfficeHours,
        params.prefillClassDays,
        params.prefillClassTime,
        params.prefillPassingGrade,
        params.prefillCategories
    ]);

    if (successData) {
        return (
            <SuccessScreen
                title="Course Added!"
                message={`"${successData.name}" (${successData.id}) has been successfully added with ${successData.categoryCount} grade ${successData.categoryCount === 1 ? 'category' : 'categories'}.`}
                actions={[
                    {
                        label: 'Add Another Course',
                        onPress: resetForm,
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
                    <Text className="text-lg font-bold ml-2">Add New Course</Text>
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
                        <View className="mb-6">
                            <Text className="text-sm font-medium  mb-2 ml-1" style={{ color: hexColors.mutedForeground }}>Course Information</Text>
                            <View className="borderWidth: 1, borderColor: hexColors.border rounded-xl overflow-hidden" style={{ backgroundColor: hexColors.card }}>
                                <View className="p-4 border-b border-border">
                                    <Text className="text-xs  mb-1" style={{ color: hexColors.mutedForeground }}>Course Name</Text>
                                    <TextInput
                                        className="text-base font-medium h-6 p-0"
                                        placeholder="e.g. Introduction to Computer Science"
                                        placeholderTextColor={theme.colors.mutedForeground}
                                        value={courseName}
                                        onChangeText={setCourseName}
                                    />
                                </View>
                                <View className="flex-row border-b border-border">
                                    <View className="flex-1 p-4 border-r border-border">
                                        <Text className="text-xs  mb-1" style={{ color: hexColors.mutedForeground }}>Course ID</Text>
                                        <TextInput
                                            className="text-base font-medium h-6 p-0"
                                            placeholder="e.g. CS 101"
                                            placeholderTextColor={theme.colors.mutedForeground}
                                            value={courseId}
                                            onChangeText={setCourseId}
                                            autoCapitalize="characters"
                                        />
                                    </View>
                                    <View className="flex-1 p-4">
                                        <Text className="text-xs  mb-1" style={{ color: hexColors.mutedForeground }}>Department (Optional)</Text>
                                        <TextInput
                                            className="text-base font-medium h-6 p-0"
                                            placeholder="e.g. CS"
                                            placeholderTextColor={theme.colors.mutedForeground}
                                            value={department}
                                            onChangeText={setDepartment}
                                            autoCapitalize="characters"
                                        />
                                    </View>
                                </View>
                                <View className="p-4 flex-row items-center justify-between">
                                    <View>
                                        <Text className="text-base font-medium " style={{ color: hexColors.foreground }}>Required Course</Text>
                                        <Text className="text-xs " style={{ color: hexColors.mutedForeground }}>Is this course required for your major?</Text>
                                    </View>
                                    <Switch
                                        value={isRequired}
                                        onValueChange={setIsRequired}
                                        trackColor={{ false: theme.colors.muted, true: theme.colors.primary }}
                                    />
                                </View>
                                <View className="p-4 border-b border-border">
                                    <Text className="text-xs  mb-1" style={{ color: hexColors.mutedForeground }}>Passing Grade (%)</Text>
                                    <TextInput
                                        className="text-base font-medium h-6 p-0"
                                        style={{ color: hexColors.foreground }}
                                        placeholder="60"
                                        placeholderTextColor={theme.colors.mutedForeground}
                                        value={passingGrade}
                                        onChangeText={setPassingGrade}
                                        keyboardType="numeric"
                                        maxLength={3}
                                    />
                                </View>
                            </View>
                        </View>

                        <View className="mb-6">
                            <Text className="text-sm font-medium  mb-2 ml-1" style={{ color: hexColors.mutedForeground }}>Instructor & Schedule (Optional)</Text>
                            <View className="borderWidth: 1, borderColor: hexColors.border rounded-xl overflow-hidden" style={{ backgroundColor: hexColors.card }}>
                                <View className="p-4 border-b border-border">
                                    <Text className="text-xs  mb-1" style={{ color: hexColors.mutedForeground }}>Instructor Name</Text>
                                    <TextInput
                                        className="text-base font-medium h-6 p-0"
                                        placeholder="e.g. Dr. Smith"
                                        placeholderTextColor={theme.colors.mutedForeground}
                                        value={instructor}
                                        onChangeText={setInstructor}
                                    />
                                </View>
                                <View className="p-4 border-b border-border">
                                    <Text className="text-xs  mb-1" style={{ color: hexColors.mutedForeground }}>Instructor Email</Text>
                                    <TextInput
                                        className="text-base font-medium h-6 p-0"
                                        placeholder="e.g. smith@university.edu"
                                        placeholderTextColor={theme.colors.mutedForeground}
                                        value={instructorEmail}
                                        onChangeText={setInstructorEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>
                                <View className="p-4 border-b border-border">
                                    <Text className="text-xs  mb-1" style={{ color: hexColors.mutedForeground }}>Office Hours</Text>
                                    <TextInput
                                        className="text-base font-medium h-6 p-0"
                                        placeholder="e.g. Mon/Wed 2-4 PM"
                                        placeholderTextColor={theme.colors.mutedForeground}
                                        value={officeHours}
                                        onChangeText={setOfficeHours}
                                    />
                                </View>
                                <View className="flex-row">
                                    <View className="flex-1 p-4 border-r border-border">
                                        <Text className="text-xs  mb-1" style={{ color: hexColors.mutedForeground }}>Class Days</Text>
                                        <TextInput
                                            className="text-base font-medium h-6 p-0"
                                            placeholder="e.g. Mon, Wed"
                                            placeholderTextColor={theme.colors.mutedForeground}
                                            value={classDays}
                                            onChangeText={setClassDays}
                                        />
                                    </View>
                                    <View className="flex-1 p-4">
                                        <Text className="text-xs  mb-1" style={{ color: hexColors.mutedForeground }}>Time</Text>
                                        <TextInput
                                            className="text-base font-medium h-6 p-0"
                                            placeholder="e.g. 10:00 AM"
                                            placeholderTextColor={theme.colors.mutedForeground}
                                            value={classTime}
                                            onChangeText={setClassTime}
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Grade Categories Section */}
                        <Animated.View 
                            entering={FadeInDown.delay(200).springify()}
                            className="mb-8"
                        >
                            <View className="flex-row justify-between items-center mb-3 px-1">
                                <Text className="text-sm font-semibold  uppercase tracking-wider" style={{ color: hexColors.mutedForeground }}>
                                    Grade Categories
                                </Text>
                                <View className={`px-2 py-1 rounded-md ${isWeightValid ? 'bg-green-500/10' : 'bg-destructive/10'}`}>
                                    <Text className={`text-xs font-bold ${isWeightValid ? 'text-green-600' : 'text-destructive'}`}>
                                        Total: {totalWeight}%
                                    </Text>
                                </View>
                            </View>

                            <View className="rounded-xl p-4 borderWidth: 1, borderColor: hexColors.border shadow-sm">
                                <View className="flex-row items-center mb-2 px-1">
                                    <Text className="text-xs font-bold  uppercase flex-1" style={{ color: hexColors.mutedForeground }}>Category Name</Text>
                                    <Text className="text-xs font-bold  uppercase w-20 text-center" style={{ color: hexColors.mutedForeground }}>Weight %</Text>
                                    <Text className="text-xs font-bold  uppercase w-16 text-center" style={{ color: hexColors.mutedForeground }}>Drop</Text>
                                    {categories.length > 1 && <View className="w-8" />}
                                </View>

                                {categories.map((cat, index) => (
                                    <View key={index} className="mb-3 last:mb-0">
                                        <View className="flex-row items-start gap-2">
                                            <TextInput
                                                className="flex-1  border border-input rounded-lg px-3 py-2.5 " style={{ color: hexColors.foreground }}
                                                placeholder="e.g. Homework"
                                                placeholderTextColor={theme.colors.mutedForeground}
                                                value={cat.category}
                                                onChangeText={(value) => updateCategory(index, 'category', value)}
                                            />
                                            <TextInput
                                                className="w-20  border border-input rounded-lg px-3 py-2.5 text-center" style={{ backgroundColor: hexColors.background }}
                                                placeholder="0"
                                                placeholderTextColor={theme.colors.mutedForeground}
                                                value={cat.weight}
                                                onChangeText={(value) => updateCategory(index, 'weight', value)}
                                                keyboardType="numeric"
                                            />
                                            <TextInput
                                                className="w-16  border border-input rounded-lg px-3 py-2.5 text-center" style={{ backgroundColor: hexColors.background }}
                                                placeholder="0"
                                                placeholderTextColor={theme.colors.mutedForeground}
                                                value={cat.dropLowest}
                                                onChangeText={(value) => updateCategory(index, 'dropLowest', value)}
                                                keyboardType="numeric"
                                            />
                                            {categories.length > 1 && (
                                                <TouchableOpacity
                                                    onPress={() => removeCategory(index)}
                                                    className="w-8 h-[42px] items-center justify-center rounded-lg bg-destructive/10 active:bg-destructive/20"
                                                >
                                                    <Ionicons name="trash-outline" size={18} color={theme.colors.destructive} />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                ))}

                                <TouchableOpacity
                                    onPress={addCategory}
                                    className="mt-4 flex-row items-center justify-center py-3 border border-dashed border-primary/50 rounded-lg active:bg-primary/5"
                                >
                                    <Ionicons name="add-circle-outline" size={20} color={theme.colors.primary} />
                                    <Text className="ml-2 font-semibold " style={{ color: hexColors.primary }}>Add Category</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>

                        {/* Submit Button */}
                        <Animated.View 
                            entering={FadeInDown.delay(300).springify()}
                            className="mb-8"
                        >
                            <TouchableOpacity
                                onPress={handleSubmit}
                                disabled={isSubmitting}
                                className={`w-full py-4 rounded-xl flex-row items-center justify-center shadow-lg ${
                                    isSubmitting ? 'bg-muted' : 'bg-primary shadow-primary/30'
                                }`}
                            >
                                {isSubmitting ? (
                                    <Text className="font-bold text-lg" style={{ color: hexColors.mutedForeground }}>Creating Course...</Text>
                                ) : (
                                    <>
                                        <Ionicons name="checkmark-circle" size={24} color="white" style={{ marginRight: 8 }} />
                                        <Text className="-foreground font-bold text-lg" style={{ color: hexColors.primary }}>Create Course</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => router.replace('/(student)/student_dashboard')}
                                disabled={isSubmitting}
                                className="w-full py-4 mt-3 rounded-xl flex-row items-center justify-center active:bg-secondary/50"
                            >
                                <Text className="font-semibold text-lg" style={{ color: hexColors.mutedForeground }}>Cancel</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}
