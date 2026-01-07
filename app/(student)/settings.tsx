import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Pressable, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth/auth-context';
import { useTheme } from '@/lib/theme/theme-context';
import { seedTestCourses } from '@/lib/api/seed-data';

export default function Settings() {
    const { user, logout } = useAuth();
    const { theme, themeMode, setThemeMode } = useTheme();
    const [showThemeModal, setShowThemeModal] = useState(false);
    const [isSeeding, setIsSeeding] = useState(false);
    const [devModeCount, setDevModeCount] = useState(0);

    const handleLogout = async () => {
        await logout();
        router.replace('/(auth)/login');
    };

    const enableDevMode = () => {
        if (devModeCount >= 5) return;
        setDevModeCount(prev => prev + 1);
        if (devModeCount + 1 === 5) {
            Alert.alert("Developer Mode Enabled", "You can now access admin tools.");
        }
    };

    const handleSeedData = async () => {
        console.log('Seed Data button pressed');
        if (!user?.id) {
            console.error('No user ID found');
            if (Platform.OS === 'web') {
                alert("Error: User ID not found. Please log in again.");
            } else {
                Alert.alert("Error", "User ID not found. Please log in again.");
            }
            return;
        }
        
        const runSeed = async () => {
            console.log('Starting seed process...');
            setIsSeeding(true);
            try {
                await seedTestCourses(user!.id);
                console.log('Seed process completed successfully');
                if (Platform.OS === 'web') {
                    alert("Success: Test data has been added. Please refresh your dashboard.");
                } else {
                    Alert.alert("Success", "Test data has been added. Please refresh your dashboard.");
                }
            } catch (error) {
                console.error('Seed process failed:', error);
                const errorMessage = error instanceof Error ? error.message : String(error);
                if (Platform.OS === 'web') {
                    alert(`Error: Failed to seed data: ${errorMessage}`);
                } else {
                    Alert.alert("Error", `Failed to seed data: ${errorMessage}`);
                }
            } finally {
                setIsSeeding(false);
            }
        };

        if (Platform.OS === 'web') {
            // @ts-ignore - confirm is available on web
            if (confirm("Seed Test Data: This will add 4 test courses to your account. Are you sure?")) {
                await runSeed();
            }
        } else {
            Alert.alert(
                "Seed Test Data",
                "This will add 4 test courses to your account. Are you sure?",
                [
                    { text: "Cancel", style: "cancel" },
                    { 
                        text: "Seed Data", 
                        onPress: runSeed
                    }
                ]
            );
        }
    };

    const getThemeLabel = (mode: string) => {
        switch(mode) {
            case 'light': return 'Light';
            case 'dark': return 'Dark';
            case 'system': return 'Auto (System)';
            default: return 'Auto';
        }
    };

    return (
        <View className="flex-1 bg-background">
            <SafeAreaView className="flex-1">
                <ScrollView
                    className="flex-1 px-4 pt-2"
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View className="px-2 pt-4 pb-6">
                        <Pressable onPress={enableDevMode}>
                            <Text className="text-3xl font-bold text-foreground mb-1">Settings</Text>
                        </Pressable>
                        <Text className="text-base text-muted-foreground">
                            Manage your account and preferences
                        </Text>
                    </View>

                    {/* Account Section */}
                    <Animated.View 
                        entering={FadeInDown.delay(100).springify()}
                        className="mb-8"
                    >
                        <Text className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                            Account
                        </Text>
                        <View className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                            <View className="flex-row items-center justify-between p-4 border-b border-border">
                                <View className="flex-row items-center flex-1">
                                    <View className="w-9 h-9 rounded-lg bg-primary/10 items-center justify-center mr-3">
                                        <Ionicons name="person" size={18} color={theme.colors.primary} />
                                    </View>
                                    <Text className="text-base font-medium text-foreground">Email</Text>
                                </View>
                                <Text className="text-sm text-muted-foreground">{user?.email || 'Not available'}</Text>
                            </View>
                            <View className="flex-row items-center justify-between p-4">
                                <View className="flex-row items-center flex-1">
                                    <View className="w-9 h-9 rounded-lg bg-green-500/10 items-center justify-center mr-3">
                                        <Ionicons name="id-card" size={18} color="#10B981" />
                                    </View>
                                    <Text className="text-base font-medium text-foreground">Name</Text>
                                </View>
                                <Text className="text-sm text-muted-foreground">{user?.name || 'Not available'}</Text>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Preferences Section */}
                    <Animated.View 
                        entering={FadeInDown.delay(200).springify()}
                        className="mb-8"
                    >
                        <Text className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                            Preferences
                        </Text>
                        <View className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                            <TouchableOpacity 
                                className="flex-row items-center justify-between p-4 border-b border-border"
                                activeOpacity={0.7}
                            >
                                <View className="flex-row items-center flex-1">
                                    <View className="w-9 h-9 rounded-lg bg-yellow-500/10 items-center justify-center mr-3">
                                        <Ionicons name="notifications" size={18} color="#EAB308" />
                                    </View>
                                    <Text className="text-base font-medium text-foreground">Notifications</Text>
                                </View>
                                <Text className="text-sm text-muted-foreground">Coming Soon</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                className="flex-row items-center justify-between p-4 border-b border-border"
                                activeOpacity={0.7}
                                onPress={() => setShowThemeModal(true)}
                            >
                                <View className="flex-row items-center flex-1">
                                    <View className="w-9 h-9 rounded-lg bg-purple-500/10 items-center justify-center mr-3">
                                        <Ionicons name="color-palette" size={18} color="#A855F7" />
                                    </View>
                                    <Text className="text-base font-medium text-foreground">Theme</Text>
                                </View>
                                <View className="flex-row items-center">
                                    <Text className="text-sm text-muted-foreground mr-2">
                                        {getThemeLabel(themeMode)}
                                    </Text>
                                    <Ionicons name="chevron-forward" size={16} color={theme.colors.mutedForeground} />
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                className="flex-row items-center justify-between p-4"
                                activeOpacity={0.7}
                                onPress={() => {
                                    // TODO: Implement language selection
                                }}
                            >
                                <View className="flex-row items-center flex-1">
                                    <View className="w-9 h-9 rounded-lg bg-blue-500/10 items-center justify-center mr-3">
                                        <Ionicons name="globe" size={18} color="#3B82F6" />
                                    </View>
                                    <Text className="text-base font-medium text-foreground">Language</Text>
                                </View>
                                <Text className="text-sm text-muted-foreground">English</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>

                    {/* Developer Tools - Only visible for admins or if enabled */}
                    {(user?.role === 'admin' || devModeCount >= 5) && (
                        <Animated.View 
                            entering={FadeInDown.delay(300).springify()}
                            className="mb-8"
                        >
                            <Text className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                                Admin Tools
                            </Text>
                            <View className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                                <TouchableOpacity 
                                    className="flex-row items-center justify-between p-4"
                                    activeOpacity={0.7}
                                    onPress={handleSeedData}
                                    disabled={isSeeding}
                                >
                                    <View className="flex-row items-center flex-1">
                                        <View className="w-9 h-9 rounded-lg bg-purple-500/10 items-center justify-center mr-3">
                                            <Ionicons name="construct" size={18} color="#A855F7" />
                                        </View>
                                        <Text className="text-base font-medium text-foreground">
                                            {isSeeding ? "Seeding Data..." : "Seed Test Data"}
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={theme.colors.mutedForeground} />
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    )}

                    {/* Logout Button */}
                    <Animated.View 
                        entering={FadeInDown.delay(400).springify()}
                        className="mb-8"
                    >
                        <TouchableOpacity
                            className="bg-destructive/10 p-4 rounded-2xl border border-destructive/20 items-center flex-row justify-center"
                            onPress={handleLogout}
                        >
                            <Ionicons name="log-out-outline" size={20} color={theme.colors.destructive} style={{ marginRight: 8 }} />
                            <Text className="text-base font-bold text-destructive">Log Out</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>
            </SafeAreaView>

            {/* Theme Selection Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showThemeModal}
                onRequestClose={() => setShowThemeModal(false)}
            >
                <Pressable 
                    className="flex-1 bg-black/50 justify-center items-center p-4"
                    onPress={() => setShowThemeModal(false)}
                >
                    <Pressable 
                        className="bg-card w-full max-w-sm rounded-3xl p-6 shadow-xl border border-border"
                        onPress={(e) => e.stopPropagation()}
                    >
                        <Text className="text-xl font-bold text-foreground mb-4 text-center">Choose Theme</Text>
                        
                        <View className="space-y-2">
                            {[
                                { id: 'light', label: 'Light', icon: 'sunny' },
                                { id: 'dark', label: 'Dark', icon: 'moon' },
                                { id: 'system', label: 'Auto (System)', icon: 'phone-portrait' }
                            ].map((option) => (
                                <TouchableOpacity
                                    key={option.id}
                                    className={`flex-row items-center p-4 rounded-xl border ${
                                        themeMode === option.id 
                                            ? 'bg-primary/10 border-primary' 
                                            : 'bg-secondary/50 border-transparent'
                                    } mb-3`}
                                    onPress={() => {
                                        setThemeMode(option.id as any);
                                        setShowThemeModal(false);
                                    }}
                                >
                                    <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                                        themeMode === option.id ? 'bg-primary' : 'bg-muted'
                                    }`}>
                                        <Ionicons 
                                            name={option.icon as any} 
                                            size={20} 
                                            color={themeMode === option.id ? 'white' : theme.colors.mutedForeground} 
                                        />
                                    </View>
                                    <Text className={`text-base font-medium flex-1 ${
                                        themeMode === option.id ? 'text-primary' : 'text-foreground'
                                    }`}>
                                        {option.label}
                                    </Text>
                                    {themeMode === option.id && (
                                        <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity 
                            className="mt-4 py-3 items-center"
                            onPress={() => setShowThemeModal(false)}
                        >
                            <Text className="text-base font-medium text-muted-foreground">Cancel</Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}
