import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Modal, Linking } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '@/lib/theme/theme-context';
import { AIService } from '@/lib/api/ai-service';
import PlatformButton from '@/components/PlatformButton';

const TOPICS = [
    "Request Meeting",
    "Ask for Extra Credit",
    "Discuss Grade",
    "Extension Request",
    "Explain Absence",
    "Clarify Assignment",
    "Drop Course Inquiry"
];

const TONES = [
    { id: 'professional', label: 'Professional', icon: 'briefcase-outline' },
    { id: 'urgent', label: 'Urgent', icon: 'alert-circle-outline' },
    { id: 'apologetic', label: 'Apologetic', icon: 'sad-outline' },
];

export default function EmailGenerator() {
    const { theme } = useTheme();
    const router = useRouter();
    const params = useLocalSearchParams<{ 
        courseName?: string; 
        professorName?: string;
        currentGrade?: string;
    }>();

    const [courseName, setCourseName] = useState(params.courseName || '');
    const [professorName, setProfessorName] = useState(params.professorName || '');
    const [topic, setTopic] = useState('');
    const [customTopic, setCustomTopic] = useState('');
    const [tone, setTone] = useState<'professional' | 'urgent' | 'apologetic'>('professional');
    const [generatedEmail, setGeneratedEmail] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleGenerate = async () => {
        if (!courseName.trim()) {
            Alert.alert("Missing Info", "Please enter the course name.");
            return;
        }
        
        const selectedTopic = topic === 'Other' ? customTopic : topic;
        if (!selectedTopic.trim()) {
            Alert.alert("Missing Info", "Please select or enter a topic.");
            return;
        }

        setIsGenerating(true);
        try {
            const email = await AIService.generateEmail({
                courseName,
                professorName,
                currentGrade: params.currentGrade ? parseFloat(params.currentGrade) : undefined,
                topic: selectedTopic,
                tone,
                studentName: "[My Name]" // Placeholder for user to fill
            });
            setGeneratedEmail(email);
            setIsModalVisible(true);
        } catch (error) {
            Alert.alert("Error", "Failed to generate email. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = async () => {
        await Clipboard.setStringAsync(generatedEmail);
        Alert.alert("Copied!", "Email text copied to clipboard.");
    };

    const openInMailApp = async () => {
        try {
            // Simple parsing to try and separate subject and body
            // Assumes format "Subject: [Subject Text]\n\n[Body Text]"
            let subject = "";
            let body = generatedEmail;

            const subjectMatch = generatedEmail.match(/(?:Subject:)\s*(.*)/i);
            if (subjectMatch && subjectMatch[1]) {
                subject = subjectMatch[1].trim();
                // Remove the subject line from the body
                body = generatedEmail.replace(subjectMatch[0], '').trim();
            }

            const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            
            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) {
                await Linking.openURL(url);
            } else {
                Alert.alert("Error", "Could not open mail app.");
            }
        } catch (error) {
            Alert.alert("Error", "Failed to open mail app.");
        }
    };

    return (
        <View className="flex-1 bg-background">
            <Stack.Screen options={{ headerShown: false }} />
            <View className="px-4 py-2 flex-row items-center border-b border-border/50 safe-top">
                <TouchableOpacity 
                    onPress={() => router.back()}
                    className="p-2 -ml-2 mr-2 rounded-full active:bg-secondary"
                >
                    <Ionicons name="arrow-back" size={24} color={theme.colors.foreground} />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-foreground ml-2">Email Generator</Text>
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 40 }}>
                    
                    {/* Context Inputs */}
                    <View className="bg-card rounded-xl p-4 mb-4 border border-border">
                        <Text className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Details</Text>
                        
                        <View className="mb-3">
                            <Text className="text-xs text-muted-foreground mb-1">Course Name</Text>
                            <TextInput
                                className="bg-background border border-input rounded-lg p-3 text-foreground"
                                value={courseName}
                                onChangeText={setCourseName}
                                placeholder="e.g. Intro to Psychology"
                                placeholderTextColor={theme.colors.mutedForeground}
                            />
                        </View>

                        <View>
                            <Text className="text-xs text-muted-foreground mb-1">Professor Name (Optional)</Text>
                            <TextInput
                                className="bg-background border border-input rounded-lg p-3 text-foreground"
                                value={professorName}
                                onChangeText={setProfessorName}
                                placeholder="e.g. Dr. Smith"
                                placeholderTextColor={theme.colors.mutedForeground}
                            />
                        </View>
                    </View>

                    {/* Topic Selection */}
                    <View className="bg-card rounded-xl p-4 mb-4 border border-border">
                        <Text className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">What is this about?</Text>
                        <View className="flex-row flex-wrap gap-2 mb-3">
                            {TOPICS.map((t) => (
                                <TouchableOpacity
                                    key={t}
                                    onPress={() => setTopic(t)}
                                    className={`px-3 py-2 rounded-full border ${
                                        topic === t 
                                            ? 'bg-primary border-primary' 
                                            : 'bg-background border-border'
                                    }`}
                                >
                                    <Text className={`text-xs font-medium ${
                                        topic === t ? 'text-primary-foreground' : 'text-foreground'
                                    }`}>
                                        {t}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity
                                onPress={() => setTopic('Other')}
                                className={`px-3 py-2 rounded-full border ${
                                    topic === 'Other' 
                                        ? 'bg-primary border-primary' 
                                        : 'bg-background border-border'
                                }`}
                            >
                                <Text className={`text-xs font-medium ${
                                    topic === 'Other' ? 'text-primary-foreground' : 'text-foreground'
                                }`}>
                                    Other
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {topic === 'Other' && (
                            <TextInput
                                className="bg-background border border-input rounded-lg p-3 text-foreground"
                                value={customTopic}
                                onChangeText={setCustomTopic}
                                placeholder="Enter your topic..."
                                placeholderTextColor={theme.colors.mutedForeground}
                            />
                        )}
                    </View>

                    {/* Tone Selection */}
                    <View className="bg-card rounded-xl p-4 mb-6 border border-border">
                        <Text className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Tone</Text>
                        <View className="flex-row gap-3">
                            {TONES.map((t) => (
                                <TouchableOpacity
                                    key={t.id}
                                    onPress={() => setTone(t.id as any)}
                                    className={`flex-1 p-3 rounded-xl border items-center ${
                                        tone === t.id 
                                            ? 'bg-primary/10 border-primary' 
                                            : 'bg-background border-border'
                                    }`}
                                >
                                    <Ionicons 
                                        name={t.icon as any} 
                                        size={20} 
                                        color={tone === t.id ? theme.colors.primary : theme.colors.mutedForeground} 
                                    />
                                    <Text className={`text-xs font-medium mt-2 ${
                                        tone === t.id ? 'text-primary' : 'text-muted-foreground'
                                    }`}>
                                        {t.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Generate Button */}
                    <PlatformButton
                        onPress={handleGenerate}
                        disabled={isGenerating}
                        style={{ 
                            backgroundColor: theme.colors.primary, 
                            padding: 16, 
                            borderRadius: 12, 
                            alignItems: 'center',
                            marginBottom: 16,
                            opacity: isGenerating ? 0.7 : 1
                        }}
                    >
                        {isGenerating ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <View className="flex-row items-center">
                                <Ionicons name="sparkles" size={20} color="white" style={{ marginRight: 8 }} />
                                <Text className="text-white font-bold text-base">Generate Email</Text>
                            </View>
                        )}
                    </PlatformButton>

                    {/* Cancel Button */}
                    <TouchableOpacity 
                        onPress={() => router.replace('/(student)/student_dashboard')}
                        className="items-center py-3 mb-6"
                    >
                        <Text className="text-muted-foreground font-medium text-base">Cancel</Text>
                    </TouchableOpacity>

                    {/* Result Modal */}
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={isModalVisible}
                        onRequestClose={() => setIsModalVisible(false)}
                    >
                        <View className="flex-1 bg-black/50 justify-end">
                            <View className="bg-background rounded-t-3xl h-[85%] p-6 shadow-2xl">
                                <View className="flex-row justify-between items-center mb-6">
                                    <Text className="text-xl font-bold text-foreground">Generated Draft</Text>
                                    <TouchableOpacity 
                                        onPress={() => setIsModalVisible(false)}
                                        className="p-2 bg-secondary rounded-full"
                                    >
                                        <Ionicons name="close" size={24} color={theme.colors.foreground} />
                                    </TouchableOpacity>
                                </View>

                                <TextInput
                                    className="flex-1 bg-card border border-border rounded-xl p-4 text-foreground text-base leading-6 mb-6"
                                    multiline
                                    value={generatedEmail}
                                    onChangeText={setGeneratedEmail}
                                    textAlignVertical="top"
                                />

                                <View className="flex-row gap-4 mb-8">
                                    <TouchableOpacity 
                                        onPress={copyToClipboard}
                                        className="flex-1 bg-secondary p-4 rounded-xl flex-row justify-center items-center"
                                    >
                                        <Ionicons name="copy-outline" size={20} color={theme.colors.foreground} style={{ marginRight: 8 }} />
                                        <Text className="text-foreground font-semibold">Copy Text</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity 
                                        onPress={openInMailApp}
                                        className="flex-1 bg-primary p-4 rounded-xl flex-row justify-center items-center"
                                    >
                                        <Ionicons name="mail-outline" size={20} color="white" style={{ marginRight: 8 }} />
                                        <Text className="text-white font-semibold">Open Mail App</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>

                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
