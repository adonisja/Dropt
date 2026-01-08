import { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '@/lib/auth/auth-context';
import {
    fetchGradeCategories,
    fetchAssignments, // Import fetchAssignments
    createAssignment,
} from '@/lib/api/data-client';
import { getNextAssignmentID } from '@/lib/utils/id-generators';
import type { Schema } from '@/amplify/data/resource';
import PlatformButton from '@/components/PlatformButton';
import FormError from '@/components/FormError';
import { logger } from '@/lib/utils/logger';
import SuccessScreen from '@/components/SuccessScreen';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AddAssignment() {
    const { user } = useAuth();
    const { courseId, courseName } = useLocalSearchParams<{ courseId: string; courseName: string }>();

    const [assignmentName, setAssignmentName] = useState('');
    const [category, setCategory] = useState('');
    const [maxScore, setMaxScore] = useState('100');
    const [scoreEarned, setScoreEarned] = useState('');
    const [dateDue, setDateDue] = useState('');
    const [dateSubmitted, setDateSubmitted] = useState('');
    const [description, setDescription] = useState('');

    const [showDueDatePicker, setShowDueDatePicker] = useState(false);
    const [showSubmittedDatePicker, setShowSubmittedDatePicker] = useState(false);

    const [categories, setCategories] = useState<Schema['GradeCategory']['type'][]>([]);
    const [existingAssignmentIds, setExistingAssignmentIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [successData, setSuccessData] = useState<{ name: string; id: string } | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        if (!user?.id || !courseId) {
            setIsLoading(false);
            return;
        }

        try {
            const studentCourseId = `${user.id}#${courseId}`;
            
            // Fetch categories and assignments in parallel
            const [cats, assigns] = await Promise.all([
                fetchGradeCategories(studentCourseId),
                fetchAssignments(studentCourseId)
            ]);
            
            setCategories(cats);
            
            // Extract assignment IDs
            const ids = assigns.map(a => a.assignmentId);
            setExistingAssignmentIds(ids);

            // Default category removed to force user selection
        } catch (err) {
            logger.error('Error loading assignment form data', {
                source: 'assignments.add.loadData',
                userId: user?.id,
                data: { error: err, courseId }
            });
            setFormError('Failed to load course data. Please go back and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const validateForm = (): string | null => {
        if (!assignmentName.trim()) {
            return 'Assignment name is required';
        }
        if (!category) {
            return 'Please select a category';
        }
        const max = parseFloat(maxScore);
        if (isNaN(max) || max <= 0) {
            return 'Max score must be a positive number';
        }
        if (scoreEarned) {
            const earned = parseFloat(scoreEarned);
            if (isNaN(earned) || earned < 0) {
                return 'Score earned must be a non-negative number';
            }
        }
        if (!dateDue) {
            return 'Due date is required';
        }
        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(dateDue)) {
            return 'Due date must be in YYYY-MM-DD format';
        }
        return null;
    };

    const handleSubmit = async () => {
        const error = validateForm();
        if (error) {
            logger.debug('Assignment form validation failed', {
                source: 'assignments.add.handleSubmit',
                data: { error }
            });
            setFormError(error);
            return;
        }

        setFormError(null);

        if (!user?.id || !courseId) {
            setFormError('Missing course information');
            return;
        }

        setIsSubmitting(true);

        try {
            const studentCourseId = `${user.id}#${courseId}`;

            // Generate the next assignment ID for this category
            const assignmentId = getNextAssignmentID(existingAssignmentIds, category);

            const result = await createAssignment(studentCourseId, {
                assignmentId,
                assignmentName: assignmentName.trim(),
                category,
                maxScore: parseFloat(maxScore),
                dateDue,
                dateSubmitted: dateSubmitted || undefined,
                scoreEarned: scoreEarned !== '' ? parseFloat(scoreEarned) : undefined,
                description: description.trim() || undefined,
            });

            if (!result) {
                throw new Error('Failed to create assignment');
            }

            // Update existing IDs for potential next assignment
            setExistingAssignmentIds([...existingAssignmentIds, assignmentId]);

            // Show success screen
            setSuccessData({ name: assignmentName.trim(), id: assignmentId });
        } catch (err) {
            logger.error('Error creating assignment', {
                source: 'assignments.add.handleSubmit',
                userId: user?.id,
                data: { error: err, courseId }
            });
            setFormError('Failed to create assignment. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setAssignmentName('');
        setScoreEarned('');
        setDateDue('');
        setDateSubmitted('');
        setDescription('');
        setMaxScore('100');
        setCategory('');
        setFormError(null);
        setSuccessData(null);
    };

    const onDueDateChange = (event: any, selectedDate?: Date) => {
        setShowDueDatePicker(false);
        if (selectedDate) {
            setDateDue(selectedDate.toISOString().split('T')[0]);
        }
    };

    const onSubmittedDateChange = (event: any, selectedDate?: Date) => {
        setShowSubmittedDatePicker(false);
        if (selectedDate) {
            setDateSubmitted(selectedDate.toISOString().split('T')[0]);
        }
    };

    const setTodayDue = () => {
        setDateDue(new Date().toISOString().split('T')[0]);
    };

    const setTodaySubmitted = () => {
        setDateSubmitted(new Date().toISOString().split('T')[0]);
    };

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading categories...</Text>
            </View>
        );
    }

    if (successData) {
        return (
            <SuccessScreen
                title="Assignment Added!"
                message={`"${successData.name}" (${successData.id}) has been successfully added to ${courseName || 'your course'}.`}
                actions={[
                    {
                        label: 'Add Another Assignment',
                        onPress: resetForm,
                        primary: true,
                    },
                    {
                        label: 'Back to Course Details',
                        onPress: () => router.back(),
                    },
                    {
                        label: 'Go to Dashboard',
                        onPress: () => router.replace('/(student)/student_dashboard'),
                    },
                ]}
            />
        );
    }

    if (categories.length === 0) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>No grade categories found</Text>
                <Text style={styles.errorSubtext}>
                    Please add categories to your course first
                </Text>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <Text style={styles.header}>Add Assignment</Text>
                {courseName && (
                    <Text style={styles.subheader}>{courseName}</Text>
                )}

                <FormError message={formError} />

                <View style={styles.section}>
                    <Text style={styles.label}>Assignment Name *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., Homework 1"
                        placeholderTextColor="#999"
                        value={assignmentName}
                        onChangeText={setAssignmentName}
                    />

                    <Text style={styles.label}>Category *</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={category}
                            onValueChange={setCategory}
                            style={styles.picker}
                        >
                            <Picker.Item label="Select Category..." value="" color="#999" />
                            {categories.map((cat) => (
                                <Picker.Item
                                    key={cat.category}
                                    label={`${cat.category} (${cat.weight}%)`}
                                    value={cat.category}
                                />
                            ))}
                        </Picker>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>Max Score *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="100"
                                placeholderTextColor="#999"
                                value={maxScore}
                                onChangeText={setMaxScore}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>Score Earned</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Leave blank if not graded"
                                placeholderTextColor="#999"
                                value={scoreEarned}
                                onChangeText={setScoreEarned}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    <Text style={styles.label}>Due Date *</Text>
                    <View style={styles.dateRow}>
                        <TouchableOpacity 
                            style={[styles.input, styles.dateInput]} 
                            onPress={() => setShowDueDatePicker(true)}
                        >
                            <Text style={dateDue ? styles.inputText : styles.placeholderText}>
                                {dateDue || 'Select Date'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.todayButton} onPress={setTodayDue}>
                            <Text style={styles.todayButtonText}>Today</Text>
                        </TouchableOpacity>
                    </View>
                    {showDueDatePicker && (
                        <DateTimePicker
                            value={dateDue ? new Date(dateDue) : new Date()}
                            mode="date"
                            display="default"
                            onChange={onDueDateChange}
                        />
                    )}

                    <Text style={styles.label}>Date Submitted</Text>
                    <View style={styles.dateRow}>
                        <TouchableOpacity 
                            style={[styles.input, styles.dateInput]} 
                            onPress={() => setShowSubmittedDatePicker(true)}
                        >
                            <Text style={dateSubmitted ? styles.inputText : styles.placeholderText}>
                                {dateSubmitted || 'Select Date'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.todayButton} onPress={setTodaySubmitted}>
                            <Text style={styles.todayButtonText}>Today</Text>
                        </TouchableOpacity>
                    </View>
                    {showSubmittedDatePicker && (
                        <DateTimePicker
                            value={dateSubmitted ? new Date(dateSubmitted) : new Date()}
                            mode="date"
                            display="default"
                            onChange={onSubmittedDateChange}
                        />
                    )}

                    <Text style={styles.label}>Description (optional)</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Notes about this assignment..."
                        placeholderTextColor="#999"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={3}
                    />
                </View>

                <PlatformButton
                    style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    <Text style={styles.submitButtonText}>
                        {isSubmitting ? 'Adding...' : 'Add Assignment'}
                    </Text>
                </PlatformButton>

                <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <View style={styles.bottomPadding} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollView: {
        flex: 1,
        padding: 16,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#f5f5f5',
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#333',
    },
    subheader: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        fontSize: 18,
        color: '#F44336',
        marginBottom: 8,
    },
    errorSubtext: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
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
    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 12,
        backgroundColor: '#fafafa',
        color: '#333', // Ensure text is dark on light background
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 12,
        backgroundColor: '#fafafa',
        overflow: 'hidden',
    },
    picker: {
        height: 50,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfInput: {
        flex: 1,
    },
    submitButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    submitButtonDisabled: {
        backgroundColor: '#ccc',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    cancelButton: {
        padding: 16,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
    },
    bottomPadding: {
        height: 40,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    dateInput: {
        flex: 1,
        marginBottom: 0,
        justifyContent: 'center',
    },
    inputText: {
        fontSize: 16,
        color: '#333',
    },
    placeholderText: {
        fontSize: 16,
        color: '#999',
    },
    todayButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        marginLeft: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    todayButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
});
