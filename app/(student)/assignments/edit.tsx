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
    getAssignment, // Import getAssignment
    updateAssignment,
} from '@/lib/api/data-client';
import type { Schema } from '@/amplify/data/resource';
import PlatformButton from '@/components/PlatformButton';
import FormError from '@/components/FormError';
import SuccessScreen from '@/components/SuccessScreen';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function EditAssignment() {
    const { user } = useAuth();
    const params = useLocalSearchParams<{
        courseId: string;
        courseName: string;
        assignmentId: string;
        assignmentName: string;
        category: string;
        maxScore: string;
        scoreEarned: string;
        dateDue: string;
        description: string;
    }>();

    const [assignmentName, setAssignmentName] = useState(params.assignmentName || '');
    const [category, setCategory] = useState(params.category || '');
    const [maxScore, setMaxScore] = useState(params.maxScore || '100');
    const [scoreEarned, setScoreEarned] = useState(params.scoreEarned || '');
    const [dateDue, setDateDue] = useState(params.dateDue || '');
    const [dateSubmitted, setDateSubmitted] = useState('');
    const [description, setDescription] = useState(params.description || '');

    const [showDueDatePicker, setShowDueDatePicker] = useState(false);
    const [showSubmittedDatePicker, setShowSubmittedDatePicker] = useState(false);

    const [categories, setCategories] = useState<Schema['GradeCategory']['type'][]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [successData, setSuccessData] = useState<{ type: 'update' | 'delete'; name: string } | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        if (!user?.id || !params.courseId || !params.assignmentId) {
            setIsLoading(false);
            return;
        }

        try {
            const studentCourseId = `${user.id}#${params.courseId}`;
            
            // Fetch categories
            const cats = await fetchGradeCategories(studentCourseId);
            setCategories(cats);

            // If params are missing (which they are when coming from course-details), fetch the assignment
            if (!params.assignmentName) {
                const assignment = await getAssignment(studentCourseId, params.assignmentId);
                if (assignment) {
                    setAssignmentName(assignment.assignmentName);
                    setCategory(assignment.category);
                    setMaxScore(assignment.maxScore.toString());
                    setScoreEarned(assignment.scoreEarned !== null && assignment.scoreEarned !== undefined ? assignment.scoreEarned.toString() : '');
                    setDateDue(assignment.dateDue);
                    setDateSubmitted(assignment.dateSubmitted || '');
                    setDescription(assignment.description || '');
                } else {
                    setFormError('Assignment not found');
                }
            }
        } catch (err) {
            console.error('Error loading data:', err);
            setFormError('Failed to load assignment data.');
        } finally {
            setIsLoading(false);
        }
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

    const validateForm = (): string | null => {
        if (!assignmentName.trim()) {
            return 'Assignment name is required';
        }
        if (!category) {
            return 'Please select a category';
        }
        const max = parseFloat(maxScore);
        if (isNaN(max) || max < 0) {
            return 'Max score must be a positive number';
        }
        if (scoreEarned) {
            const score = parseFloat(scoreEarned);
            if (isNaN(score) || score < 0) {
                return 'Score earned must be a positive number';
            }
        }
        if (!dateDue) {
            return 'Due date is required';
        }
        // Simple date validation YYYY-MM-DD
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(dateDue)) {
            return 'Due date must be in YYYY-MM-DD format';
        }
        if (dateSubmitted && !dateRegex.test(dateSubmitted)) {
            return 'Date submitted must be in YYYY-MM-DD format';
        }
        return null;
    };

    const handleUpdate = async () => {
        const error = validateForm();
        if (error) {
            setFormError(error);
            return;
        }

        setIsSubmitting(true);
        setFormError(null);

        try {
            const studentCourseId = `${user?.id}#${params.courseId}`;
            const updated = await updateAssignment(studentCourseId, params.assignmentId, {
                assignmentName,
                category,
                maxScore: parseFloat(maxScore),
                scoreEarned: scoreEarned ? parseFloat(scoreEarned) : null,
                dateDue,
                dateSubmitted: dateSubmitted || null,
                description: description || null,
            });

            if (updated) {
                setSuccessData({ type: 'update', name: assignmentName });
            } else {
                setFormError('Failed to update assignment. Please try again.');
            }
        } catch (err) {
            console.error('Error updating assignment:', err);
            setFormError('An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleClearForm = () => {
        Alert.alert(
            'Clear Form',
            'Are you sure you want to clear all fields?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: () => {
                        setAssignmentName('');
                        setCategory(categories.length > 0 ? categories[0].category : '');
                        setMaxScore('100');
                        setScoreEarned('');
                        setDateDue('');
                        setDescription('');
                    }
                }
            ]
        );
    };

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    if (successData) {
        return (
            <SuccessScreen
                title={successData.type === 'update' ? 'Assignment Updated!' : 'Assignment Deleted!'}
                message={
                    successData.type === 'update'
                        ? `"${successData.name}" has been successfully updated.`
                        : `"${successData.name}" has been successfully deleted.`
                }
                actions={[
                    {
                        label: 'Back to Course Details',
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
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <Text style={styles.header}>Edit Assignment</Text>
                {params.courseName && (
                    <Text style={styles.subheader}>{params.courseName}</Text>
                )}
                <Text style={styles.idText}>ID: {params.assignmentId}</Text>

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
                    style={[styles.updateButton, isSubmitting && styles.buttonDisabled]}
                    onPress={handleUpdate}
                    disabled={isSubmitting}
                >
                    <Text style={styles.updateButtonText}>
                        {isSubmitting ? 'Updating...' : 'Update Assignment'}
                    </Text>
                </PlatformButton>

                <PlatformButton
                    style={[styles.deleteButton, { backgroundColor: '#888' }]}
                    onPress={handleClearForm}
                    disabled={isSubmitting}
                >
                    <Text style={styles.deleteButtonText}>
                        Clear Form
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
        marginBottom: 4,
    },
    idText: {
        fontSize: 14,
        color: '#999',
        marginBottom: 20,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
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
        color: '#333', // Ensure text is dark
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
    updateButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    deleteButton: {
        backgroundColor: '#F44336',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    updateButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    deleteButtonText: {
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
    bottomPadding: {
        height: 40,
    },
});
