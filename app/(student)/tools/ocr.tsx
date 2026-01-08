import { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/theme-context';
import PlatformButton from '@/components/PlatformButton';
import { useRouter } from 'expo-router';
import { AIService } from '@/lib/api/ai-service';

interface ExtractedSyllabus {
    type: 'syllabus';
    courseInfo: {
        courseName: string;
        courseCode: string; // e.g. "CS360" -> helps us extract 'department'
        instructor?: string;
        instructorEmail?: string;
        officeHours?: string;
        classDays?: string;
        classTime?: string;
    };
    grading: {
        category: string;
        weight: number;
        dropLowest?: number; // Often found in syllabi (e.g. "Lowest quiz dropped")
    }[];
}

interface ExtractedGrades {
    type: 'grades';
    source: string;
    courseInfo?: {
        courseCode?: string;
        courseName?: string;
    };
    assignments: {
        name: string;
        category: string; // CRITICAL: We must try to guess this (e.g. "Quiz 1" -> "Quizzes")
        scoreEarned: number;
        maxScore: number;
        dateDue: string; // We make this required in our internal model, defaulting if necessary
        isDateEstimated?: boolean; // The "Flag" for the user
    }[];
}

type ExtractedData = ExtractedSyllabus | ExtractedGrades;


export default function OCRTool() {
    const { theme, hexColors, isDark } = useTheme();
    const [image, setImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
    const [ docType, setDocType ] = useState<'syllabus' | 'grades'| null>(null);
    const [inputType, setInputType] = useState<'image' | 'text'>('image');
    const [textInput, setTextInput] = useState('');
    const [selectedFile, setSelectedFile] = useState<{ uri: string; name: string; mimeType: string } | null>(null);
    const router = useRouter();

    const pickDocument = async () => {
        if (!docType) {
            Alert.alert("Select Document Type", "Please select whether you are scanning a Syllabus or Grades before picking a file.");
            return;
        }

        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['text/*', 'application/pdf', 'image/*'],
                copyToCacheDirectory: true
            });

            if (result.canceled) return;

            const file = result.assets[0];
            
            // Handle Images
            if (file.mimeType?.startsWith('image/')) {
                setImage(file.uri);
                setInputType('image');
                return;
            }

            // Handle Text Files
            if (file.mimeType === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.json')) {
                const content = await FileSystem.readAsStringAsync(file.uri);
                setTextInput(content);
                setInputType('text');
                return;
            }

            // Handle PDF (Now Supported!)
            if (file.mimeType === 'application/pdf') {
                setSelectedFile({
                    uri: file.uri,
                    name: file.name,
                    mimeType: file.mimeType
                });
                setInputType('text'); // We reuse the 'text' tab UI for now, but show file info
                return;
            }

            Alert.alert("Unsupported File", "Please select an image, text file, or PDF.");

        } catch (err) {
            console.error("Error picking document:", err);
            Alert.alert("Error", "Failed to pick document.");
        }
    };

    const pickImage = async () => {
        if (!docType) {
            Alert.alert("Select Document Type", "Please select whether you are scanning a Syllabus or Grades before picking an image.");
            return;
        }

        // 1. Request permission to access media library
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.status !== 'granted') {
            Alert.alert("Permission Denied", "Permission to access media library is required!");
            return;
        }

        // 2. Launch the system's photo library
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images, // Only show images, not videos
            allowsEditing: true, // Allow user to edit (crop/rotate) the selected image
            aspect: [4, 3], // Maintain a 4:3 aspect ratio if editing
            quality: 1, // Keep highest quality, for OCR accuracy
        });

        // If the user didn't cancel, set the selected image URI
        if (!result.canceled) {
            const imageURI = result.assets[0].uri
            setImage(imageURI);
        }
    }

    // Helper to get Base64 from URI (Web & Native)
    const getBase64 = async (uri: string): Promise<string> => {
        if (Platform.OS === 'web') {
            const response = await fetch(uri);
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64data = reader.result as string;
                    // Remove data URL prefix (e.g. "data:image/jpeg;base64,")
                    resolve(base64data.split(',')[1]);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } else {
            return await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
        }
    };

    // 3. Process the content (AI Extraction)
    const processData = async () =>  {
        console.log('[OCR] Starting processing...', { docType, inputType });
        if (!docType) return;
        if (inputType === 'image' && !image) return;
        if (inputType === 'text' && !textInput.trim() && !selectedFile) return;

        setIsProcessing(true);
        try{
            let result;
            
            if (inputType === 'image' && image) {
                console.log('[OCR] Processing image...');
                // 1. Convert image to Base64
                const base64 = await getBase64(image);
                // 2. Call AI Service with Image
                result = await AIService.extractData<ExtractedData>({ type: 'image', base64 }, docType);
            } else if (selectedFile) {
                console.log('[OCR] Processing file:', selectedFile.name, selectedFile.mimeType);
                // 3. Call AI Service with File (PDF)
                // For PDF on web, we also need to convert to base64 if the API expects it
                // The current AIService implementation for 'file' type might expect a URI it can read, 
                // but on web we can't read local files by path. 
                // We should probably convert to base64 here too and pass as 'image' or 'text' depending on what the service handles,
                // OR update the service to handle base64 for files.
                // Let's assume we can pass base64 for files too if we change the service, 
                // BUT for now let's see if we can just read it as base64 and pass it.
                
                // If it's a PDF, we need to send the base64 content.
                // The AIService.extractData takes { type: 'file', uri: ... }
                // Let's check AIService implementation. 
                // If AIService uses FileSystem.readAsStringAsync internally, it will fail on web.
                // So we should read it here and pass it as base64 if possible.
                
                // Actually, let's look at how AIService handles 'file'.
                // If I can't see AIService, I should assume I need to pass base64.
                
                // Let's try reading the file to base64 here.
                const base64 = await getBase64(selectedFile.uri);
                
                // We'll pass it as 'image' type to AIService if it's a PDF because Gemini handles PDFs as inlineData (like images)
                // OR we can pass it as a new type if AIService supports it.
                // Let's stick to the existing interface. 
                // If AIService expects 'file' with 'uri', it will try to read it.
                // We should probably pass the base64 directly if we can.
                
                // Let's assume we can pass the base64 in the 'uri' field if we change the type to 'image' 
                // or if we modify AIService. 
                // But wait, the AIService likely reads the file.
                
                // Let's pass it as 'image' type with base64, even if it is a PDF. 
                // Gemini API treats PDFs as "parts" with inlineData, same as images.
                result = await AIService.extractData<ExtractedData>({ 
                    type: 'image', // We lie and say it's an image so we can pass base64 directly
                    base64: base64,
                    mimeType: selectedFile.mimeType 
                }, docType);

            } else {
                console.log('[OCR] Processing text input...');
                // 4. Call AI Service with Text
                result = await AIService.extractData<ExtractedData>({ type: 'text', text: textInput }, docType);
            }

            console.log('[OCR] Result:', result);

            if (result.success && result.data) {
                // Ensure the type matches what we expect
                const data = { ...result.data, type: docType } as ExtractedData;
                setExtractedData(data);
                
                // Automatically navigate to the form
                navigateToForm(data);
            } else {
                console.error('[OCR] Extraction failed:', result.error);
                Alert.alert("Extraction Failed", result.error || "Could not extract data. Please try again.");
            }

        } catch (error) {
            console.error("[OCR] Error processing data:", error);
            Alert.alert("Error", "There was an error processing the data. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    }

    const navigateToForm = (data: ExtractedData) => {
        if (data.type === 'grades') {
            // Navigate to Batch Assignment Review
            router.push({
                pathname: '/(student)/assignments/batch-add',
                params: {
                    prefillAssignments: JSON.stringify(data.assignments),
                    prefillCourseId: data.courseInfo?.courseCode
                }
            });
        } else {
            router.push({
                pathname: '/(student)/courses/add',
                params: { 
                    prefillCourseName: data.courseInfo.courseName,
                    prefillCourseId: data.courseInfo.courseCode,
                    prefillDepartment: data.courseInfo.courseCode.replace(/[0-9]/g, '').trim(), // Extract letters only
                    prefillInstructor: data.courseInfo.instructor,
                    prefillInstructorEmail: data.courseInfo.instructorEmail,
                    prefillOfficeHours: data.courseInfo.officeHours,
                    prefillClassDays: data.courseInfo.classDays,
                    prefillClassTime: data.courseInfo.classTime,
                    // prefillPassingGrade: data.courseInfo.passingGrade, // Add if available in schema

                    //We'll serialize grading breakdown as JSON string
                    prefillCategories: JSON.stringify(data.grading.map(g => ({
                        category: g.category,
                        weight: g.weight.toString(),
                        dropLowest: g.dropLowest?.toString() || '0',
                    }))),
                }
            })
        }
    };

    const handleContinue = async () => {
        if (!extractedData) return;
        navigateToForm(extractedData);
    };

    // Log state changes
    useEffect(() => {
        if (extractedData) {
            console.log('[OCR] extractedData state updated:', extractedData);
        }
    }, [extractedData]);

    return (
        <View className="flex-1  p-4" style={{ backgroundColor: hexColors.background }}>
            <Text className="text-2xl font-bold mb-4">Scan Images</Text>
            {/* Document Type Selector */}
            <Text className="text-sm  mb-3" style={{ color: hexColors.mutedForeground }}>
                Select the file you're uploading: a Course Syllabus/Rubric or a Grade Report
            </Text>
            <View className="flex-row mb-6 bg-secondary/30 p-1 rounded-xl">
                {/* Syllabus Button */}
                <TouchableOpacity
                    className={`flex-1 py-3 rounded-lg items-center ${docType === 'syllabus' ? 'bg-blue-600 shadow-md' : ''}`}
                    onPress={() => setDocType('syllabus')}
                >
                    <Text className={`font-bold ${docType === 'syllabus' ? 'text-white' : 'text-muted-foreground'}`}>
                        Syllabus
                    </Text>
                </TouchableOpacity>

                {/* Grades Button */}
                <TouchableOpacity
                    className={`flex-1 py-3 rounded-lg items-center ${docType === 'grades' ? 'bg-blue-600 shadow-md' : ''}`}
                    onPress={() => setDocType('grades')}
                >
                    <Text className={`font-bold ${docType === 'grades' ? 'text-white' : 'text-muted-foreground'}`}>
                        Grades
                    </Text> 
                </TouchableOpacity>
            </View>
            
            {/* Input Area - Only show if no data extracted yet */}
            {!extractedData && (
                <>
                    {/* Input Type Switcher */}
                    <View className="flex-row bg-secondary/20 p-1 rounded-lg mb-4">
                        <TouchableOpacity 
                            className={`flex-1 py-2 rounded-md items-center ${inputType === 'image' ? ' shadow-sm' : ''}`} style={{ backgroundColor: hexColors.background }}
                            onPress={() => setInputType('image')}
                        >
                            <Text className={`font-medium ${inputType === 'image' ? 'text-foreground' : 'text-muted-foreground'}`}>Image</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            className={`flex-1 py-2 rounded-md items-center ${inputType === 'text' ? ' shadow-sm' : ''}`} style={{ backgroundColor: hexColors.background }}
                            onPress={() => setInputType('text')}
                        >
                            <Text className={`font-medium ${inputType === 'text' ? 'text-foreground' : 'text-muted-foreground'}`}>File / Text</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Privacy Warning */}
                    <View className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-4 flex-row items-start gap-2">
                        <Ionicons name="shield-checkmark-outline" size={16} color="#F59E0B" style={{ marginTop: 2 }} />
                        <Text className="text-xs  flex-1" style={{ color: hexColors.mutedForeground }}>
                            <Text className="font-bold text-amber-500">Privacy Notice: </Text>
                            This document will be processed by AI. Please redact sensitive personal info (like Student IDs) before uploading.
                        </Text>
                    </View>
                    
                    {/* Input Area */}
                    {inputType === 'image' ? (
                        <View className="h-64 bg-secondary/30 rounded-xl border-2 border-dashed border-border items-center justify-center mb-6 overflow-hidden">
                            {image ? (
                                <Image source={{ uri: image }} className="w-full h-full" resizeMode="contain" />
                            ) : (
                                <View className="items-center">
                                    <Ionicons name="scan-outline" size={48} color={theme.colors.mutedForeground} />
                                    <Text className="mt-2" style={{ color: hexColors.mutedForeground }}>No image selected</Text>
                                </View>
                            )}
                        </View>
                    ) : (
                        <View className="h-64 bg-secondary/30 rounded-xl borderWidth: 1, borderColor: hexColors.border mb-6 p-2">
                            {selectedFile ? (
                                <View className="flex-1 items-center justify-center">
                                    <Ionicons name="document-text-outline" size={48} color={theme.colors.primary} />
                                    <Text className="font-semibold mt-2" style={{ color: hexColors.foreground }}>{selectedFile.name}</Text>
                                    <Text className="text-xs mt-1" style={{ color: hexColors.mutedForeground }}>Ready to extract</Text>
                                    <TouchableOpacity 
                                        onPress={() => { setSelectedFile(null); setTextInput(''); }}
                                        className="mt-4 bg-destructive/10 px-3 py-1 rounded-full"
                                    >
                                        <Text className="text-destructive text-xs">Remove File</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TextInput
                                    className="flex-1 p-2 text-sm"
                                    multiline
                                    placeholder="Paste text here OR click 'Pick File' below..."
                                    placeholderTextColor={theme.colors.mutedForeground}
                                    value={textInput}
                                    onChangeText={setTextInput}
                                    textAlignVertical="top"
                                />
                            )}
                        </View>
                    )}

                    {/* Controls */}
                    <View className="flex-row gap-4 mb-6">
                        <View className="flex-1">
                            {inputType === 'image' ? (
                                <PlatformButton 
                                    onPress={pickImage}
                                    style={{ 
                                        backgroundColor: docType ? theme.colors.secondary : theme.colors.muted, 
                                        opacity: docType ? 1 : 0.5,
                                        padding: 12, 
                                        borderRadius: 8, 
                                        alignItems: 'center', 
                                        flexDirection: 'row', 
                                        justifyContent: 'center' 
                                    }}
                                >
                                    <Ionicons name="images" size={20} color={theme.colors.foreground} style={{ marginRight: 8 }} />
                                    <Text style={{ color: theme.colors.foreground, fontWeight: '600' }}>Pick Image</Text>
                                </PlatformButton>
                            ) : (
                                <PlatformButton 
                                    onPress={pickDocument}
                                    style={{ 
                                        backgroundColor: docType ? theme.colors.secondary : theme.colors.muted, 
                                        opacity: docType ? 1 : 0.5,
                                        padding: 12, 
                                        borderRadius: 8, 
                                        alignItems: 'center', 
                                        flexDirection: 'row', 
                                        justifyContent: 'center' 
                                    }}
                                >
                                    <Ionicons name="document-text" size={20} color={theme.colors.foreground} style={{ marginRight: 8 }} />
                                    <Text style={{ color: theme.colors.foreground, fontWeight: '600' }}>Pick File</Text>
                                </PlatformButton>
                            )}
                        </View>
                        <View className="flex-1">
                            <PlatformButton 
                                onPress={processData}
                                disabled={
                                    isProcessing || 
                                    (inputType === 'image' && !image) || 
                                    (inputType === 'text' && !textInput.trim() && !selectedFile)
                                }
                                style={{ 
                                    backgroundColor: (
                                        isProcessing || 
                                        (inputType === 'image' && !image) || 
                                        (inputType === 'text' && !textInput.trim() && !selectedFile)
                                    ) ? theme.colors.muted : theme.colors.primary, 
                                    padding: 12, 
                                    borderRadius: 8, 
                                    alignItems: 'center', 
                                    flexDirection: 'row', 
                                    justifyContent: 'center' 
                                }}
                            >
                                {isProcessing ? (
                                    <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
                                ) : (
                                    <Ionicons name="analytics" size={20} color="white" style={{ marginRight: 8 }} />
                                )}
                                <Text style={{ color: 'white', fontWeight: '600' }}>
                                    {isProcessing ? 'Scanning...' : 'Extract Data'}
                                </Text>
                            </PlatformButton>
                        </View>
                    </View>
                </>
            )}

            {/* Results Area */}
            {extractedData && (
                <ScrollView className="flex-1 mt-4  p-4 rounded-xl borderWidth: 1, borderColor: hexColors.border mb-8" style={{ backgroundColor: hexColors.card }}>
                    <Text className="font-bold text-lg mb-4 " style={{ color: hexColors.foreground }}>
                        {extractedData.type === 'syllabus' ? 'Syllabus Detected' : 'Grades Detected'}
                    </Text>

                    {extractedData.type === 'syllabus' ? (
                        <View>
                            <Text className="text-lg font-semibold  mb-1" style={{ color: hexColors.primary }}>{extractedData.courseInfo.courseName}</Text>
                            <Text className="mb-4" style={{ color: hexColors.mutedForeground }}>{extractedData.courseInfo.instructor} • {extractedData.courseInfo.officeHours}</Text>
                            
                            <Text className="font-semibold mb-2 " style={{ color: hexColors.foreground }}>Grading Breakdown:</Text>
                            {extractedData.grading.map((item, index) => (
                                <View key={index} className="flex-row justify-between py-2 border-b border-border">
                                    <Text className="text" style={{ color: hexColors.foreground }}>{item.category}</Text>
                                    <Text className="font-bold " style={{ color: hexColors.foreground }}>{item.weight}%</Text>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View>
                            <Text className="mb-4" style={{ color: hexColors.mutedForeground }}>Source: {extractedData.source}</Text>
                            
                            {extractedData.assignments.map((item, index) => (
                                <View key={index} className="flex-row justify-between items-center py-3 border-b border-border">
                                    <View>
                                        <Text className="font-medium " style={{ color: hexColors.foreground }}>{item.name}</Text>
                                        <View className="flex-row items-center">
                                            <Text className="text-xs  mr-2" style={{ color: hexColors.mutedForeground }}>Due: {item.dateDue}</Text>
                                            {item.isDateEstimated && (
                                                <View className="bg-yellow-100 px-2 py-0.5 rounded">
                                                    <Text className="text-[10px] text-yellow-800 font-bold">ESTIMATED</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                    <View className="items-end">
                                        <Text className="font-bold " style={{ color: hexColors.foreground }}>{item.scoreEarned}/{item.maxScore}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </ScrollView>
            )}

            {/* Action Button */}
            {extractedData && (
                <View className="mt-4">
                    <PlatformButton 
                        onPress={handleContinue}
                        style={{ 
                            backgroundColor: theme.colors.primary, 
                            padding: 16, 
                            borderRadius: 12, 
                            alignItems: 'center',
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                            elevation: 3
                        }}
                    >
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                            {extractedData.type === 'syllabus' ? 'Review & Create Course' : 'Save Grades'}
                        </Text>
                    </PlatformButton>
                </View>
            )}

            {/* Reset Button */}
            {extractedData && (
                <View className="mt-4 mb-8">
                    <TouchableOpacity 
                        onPress={() => setExtractedData(null)}
                        className="py-3 items-center"
                    >
                        <Text className="font-medium" style={{ color: hexColors.primary }}>Scan Another Document</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}