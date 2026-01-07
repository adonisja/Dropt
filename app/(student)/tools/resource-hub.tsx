import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal, Alert, Linking, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/theme-context';
import { useAuth } from '@/lib/auth/auth-context';
import { fetchStudentCourses, fetchResources, createResource, deleteResource } from '@/lib/api/data-client';
import Animated, { FadeInDown } from 'react-native-reanimated';
import PlatformButton from '@/components/PlatformButton';

interface Course {
    courseId: string;
    courseName: string;
}

interface Resource {
    studentCourseId: string;
    resourceId: string;
    title: string;
    type: 'link' | 'note';
    url?: string | null;
    content?: string | null;
    tags?: string[] | null;
}

export default function ResourceHub() {
    const { theme } = useTheme();
    const { user } = useAuth();
    
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [resources, setResources] = useState<Resource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    
    // Form State
    const [newResourceType, setNewResourceType] = useState<'link' | 'note'>('link');
    const [newTitle, setNewTitle] = useState('');
    const [newUrl, setNewUrl] = useState('');
    const [newContent, setNewContent] = useState('');

    useEffect(() => {
        loadCourses();
    }, [user?.id]);

    useEffect(() => {
        if (selectedCourseId && user?.id) {
            loadResources(selectedCourseId);
        } else {
            setResources([]);
        }
    }, [selectedCourseId, user?.id]);

    const loadCourses = async () => {
        if (!user?.id) return;
        try {
            const data = await fetchStudentCourses(user.id);
            const courseList = data.map(c => ({ courseId: c.courseId, courseName: c.courseName }));
            setCourses(courseList);
            if (courseList.length > 0) {
                setSelectedCourseId(courseList[0].courseId);
            }
        } catch (error) {
            console.error('Error loading courses:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadResources = async (courseId: string) => {
        if (!user?.id) return;
        try {
            const studentCourseId = `${user.id}#${courseId}`;
            const data = await fetchResources(studentCourseId);
            // Cast the type explicitly to match our interface since the schema type might be slightly different (null vs undefined)
            const mappedResources: Resource[] = data.map(r => ({
                studentCourseId: r.studentCourseId,
                resourceId: r.resourceId,
                title: r.title,
                type: r.type as 'link' | 'note',
                url: r.url,
                content: r.content,
                tags: r.tags ? r.tags.filter((t): t is string => t !== null) : null
            }));
            setResources(mappedResources);
        } catch (error) {
            console.error('Error loading resources:', error);
        }
    };

    const handleAddResource = async () => {
        if (!user?.id || !selectedCourseId) return;
        if (!newTitle.trim()) {
            Alert.alert('Error', 'Please enter a title');
            return;
        }
        if (newResourceType === 'link' && !newUrl.trim()) {
            Alert.alert('Error', 'Please enter a URL');
            return;
        }
        if (newResourceType === 'note' && !newContent.trim()) {
            Alert.alert('Error', 'Please enter some content');
            return;
        }

        try {
            const studentCourseId = `${user.id}#${selectedCourseId}`;
            const resourceId = Date.now().toString();
            
            await createResource(studentCourseId, {
                resourceId,
                title: newTitle,
                type: newResourceType,
                url: newResourceType === 'link' ? newUrl : undefined,
                content: newResourceType === 'note' ? newContent : undefined,
                tags: []
            });

            // Reset form
            setNewTitle('');
            setNewUrl('');
            setNewContent('');
            setIsModalVisible(false);
            
            // Reload
            loadResources(selectedCourseId);

        } catch (error) {
            console.error('Error adding resource:', error);
            Alert.alert('Error', 'Failed to add resource');
        }
    };

    const handleDeleteResource = async (resourceId: string) => {
        if (!user?.id || !selectedCourseId) return;
        
        const confirmDelete = async () => {
            const studentCourseId = `${user.id}#${selectedCourseId}`;
            await deleteResource(studentCourseId, resourceId);
            loadResources(selectedCourseId);
        };

        if (Platform.OS === 'web') {
            if (confirm('Are you sure you want to delete this resource?')) {
                confirmDelete();
            }
        } else {
            Alert.alert(
                'Delete Resource',
                'Are you sure you want to delete this resource?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: confirmDelete }
                ]
            );
        }
    };

    const openLink = async (url: string) => {
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert('Error', `Don't know how to open this URL: ${url}`);
            }
        } catch (error) {
            console.error('Error opening link:', error);
        }
    };

    return (
        <View className="flex-1 bg-background">
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView className="flex-1">
                {/* Header */}
                <View className="px-4 py-3 border-b border-border flex-row items-center justify-between">
                    <TouchableOpacity 
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-full bg-secondary items-center justify-center"
                    >
                        <Ionicons name="arrow-back" size={24} color={theme.colors.foreground} />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-foreground">Resource Hub</Text>
                    <TouchableOpacity 
                        onPress={() => setIsModalVisible(true)}
                        className="w-10 h-10 rounded-full bg-primary items-center justify-center"
                    >
                        <Ionicons name="add" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                <View className="flex-1">
                    {/* Course Selector */}
                    <View className="px-4 py-4">
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                            {courses.map((course) => (
                                <TouchableOpacity
                                    key={course.courseId}
                                    onPress={() => setSelectedCourseId(course.courseId)}
                                    className={`mr-3 px-4 py-2 rounded-full border ${
                                        selectedCourseId === course.courseId
                                            ? 'bg-primary border-primary'
                                            : 'bg-card border-border'
                                    }`}
                                >
                                    <Text className={`font-medium ${
                                        selectedCourseId === course.courseId ? 'text-white' : 'text-foreground'
                                    }`}>
                                        {course.courseName}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Resources List */}
                    <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 100 }}>
                        {resources.length === 0 ? (
                            <View className="items-center justify-center py-20">
                                <View className="w-20 h-20 bg-secondary/50 rounded-full items-center justify-center mb-4">
                                    <Ionicons name="library-outline" size={40} color={theme.colors.mutedForeground} />
                                </View>
                                <Text className="text-muted-foreground text-center font-medium">No resources yet</Text>
                                <Text className="text-muted-foreground text-center text-xs mt-1">
                                    Add links or notes for this course
                                </Text>
                            </View>
                        ) : (
                            resources.map((resource, index) => (
                                <Animated.View 
                                    key={resource.resourceId}
                                    entering={FadeInDown.delay(index * 50).springify()}
                                    className="mb-3"
                                >
                                    <TouchableOpacity
                                        className="bg-card p-4 rounded-2xl border border-border shadow-sm"
                                        onPress={() => resource.type === 'link' && resource.url ? openLink(resource.url) : null}
                                        activeOpacity={resource.type === 'link' ? 0.7 : 1}
                                    >
                                        <View className="flex-row justify-between items-start">
                                            <View className="flex-row items-start flex-1 mr-3">
                                                <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${
                                                    resource.type === 'link' ? 'bg-blue-500/10' : 'bg-yellow-500/10'
                                                }`}>
                                                    <Ionicons 
                                                        name={resource.type === 'link' ? 'link' : 'document-text'} 
                                                        size={20} 
                                                        color={resource.type === 'link' ? '#3B82F6' : '#EAB308'} 
                                                    />
                                                </View>
                                                <View className="flex-1">
                                                    <Text className="text-base font-bold text-foreground mb-1">{resource.title}</Text>
                                                    {resource.type === 'link' ? (
                                                        <Text className="text-xs text-blue-500" numberOfLines={1}>{resource.url}</Text>
                                                    ) : (
                                                        <Text className="text-sm text-muted-foreground" numberOfLines={3}>{resource.content}</Text>
                                                    )}
                                                </View>
                                            </View>
                                            
                                            <TouchableOpacity 
                                                onPress={() => handleDeleteResource(resource.resourceId)}
                                                className="p-2 -mr-2"
                                            >
                                                <Ionicons name="trash-outline" size={18} color={theme.colors.destructive} />
                                            </TouchableOpacity>
                                        </View>
                                    </TouchableOpacity>
                                </Animated.View>
                            ))
                        )}
                    </ScrollView>
                </View>

                {/* Add Resource Modal */}
                <Modal
                    visible={isModalVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setIsModalVisible(false)}
                >
                    <KeyboardAvoidingView 
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        className="flex-1 justify-end"
                    >
                        <View className="flex-1 bg-black/50">
                            <TouchableOpacity 
                                className="flex-1" 
                                onPress={() => setIsModalVisible(false)} 
                            />
                            <View className="bg-card rounded-t-3xl p-6 border-t border-border">
                                <View className="flex-row justify-between items-center mb-6">
                                    <Text className="text-xl font-bold text-foreground">Add Resource</Text>
                                    <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                                        <Ionicons name="close" size={24} color={theme.colors.mutedForeground} />
                                    </TouchableOpacity>
                                </View>

                                {/* Type Selector */}
                                <View className="flex-row bg-secondary/30 p-1 rounded-xl mb-4">
                                    <TouchableOpacity 
                                        className={`flex-1 py-2 rounded-lg items-center ${newResourceType === 'link' ? 'bg-background shadow-sm' : ''}`}
                                        onPress={() => setNewResourceType('link')}
                                    >
                                        <Text className={`font-medium ${newResourceType === 'link' ? 'text-foreground' : 'text-muted-foreground'}`}>Link</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        className={`flex-1 py-2 rounded-lg items-center ${newResourceType === 'note' ? 'bg-background shadow-sm' : ''}`}
                                        onPress={() => setNewResourceType('note')}
                                    >
                                        <Text className={`font-medium ${newResourceType === 'note' ? 'text-foreground' : 'text-muted-foreground'}`}>Note</Text>
                                    </TouchableOpacity>
                                </View>

                                <Text className="text-sm font-medium text-muted-foreground mb-2">Title</Text>
                                <TextInput
                                    className="bg-secondary/30 p-4 rounded-xl text-foreground mb-4"
                                    placeholder="e.g. Lecture Slides, Study Guide"
                                    placeholderTextColor={theme.colors.mutedForeground}
                                    value={newTitle}
                                    onChangeText={setNewTitle}
                                />

                                {newResourceType === 'link' ? (
                                    <>
                                        <Text className="text-sm font-medium text-muted-foreground mb-2">URL</Text>
                                        <TextInput
                                            className="bg-secondary/30 p-4 rounded-xl text-foreground mb-6"
                                            placeholder="https://..."
                                            placeholderTextColor={theme.colors.mutedForeground}
                                            value={newUrl}
                                            onChangeText={setNewUrl}
                                            autoCapitalize="none"
                                            keyboardType="url"
                                        />
                                    </>
                                ) : (
                                    <>
                                        <Text className="text-sm font-medium text-muted-foreground mb-2">Content</Text>
                                        <TextInput
                                            className="bg-secondary/30 p-4 rounded-xl text-foreground mb-6 min-h-[100px]"
                                            placeholder="Type your note here..."
                                            placeholderTextColor={theme.colors.mutedForeground}
                                            value={newContent}
                                            onChangeText={setNewContent}
                                            multiline
                                            textAlignVertical="top"
                                        />
                                    </>
                                )}

                                <PlatformButton 
                                    onPress={handleAddResource}
                                    style={{ 
                                        backgroundColor: theme.colors.primary, 
                                        padding: 16, 
                                        borderRadius: 12, 
                                        alignItems: 'center' 
                                    }}
                                >
                                    <Text className="text-white font-bold text-base">Add Resource</Text>
                                </PlatformButton>
                                <View className="h-8" />
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>
            </SafeAreaView>
        </View>
    );
}
