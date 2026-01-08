import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Vibration, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/theme-context';
import Animated, { FadeInDown, useAnimatedStyle, withSpring, useSharedValue, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

type TimerMode = 'focus' | 'short-break' | 'long-break';

const MODES: Record<TimerMode, { label: string, minutes: number, color: string, icon: string }> = {
    'focus': { label: 'Focus', minutes: 25, color: '#3B82F6', icon: 'bulb-outline' },
    'short-break': { label: 'Short Break', minutes: 5, color: '#10B981', icon: 'cafe-outline' },
    'long-break': { label: 'Long Break', minutes: 15, color: '#8B5CF6', icon: 'game-controller-outline' }
};

export default function StudyTimer() {
    const { theme, hexColors, isDark } = useTheme();
    const [mode, setMode] = useState<TimerMode>('focus');
    const [timeLeft, setTimeLeft] = useState(MODES['focus'].minutes * 60);
    const [isActive, setIsActive] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Animation values
    const progress = useSharedValue(1);

    useEffect(() => {
        // Reset timer when mode changes
        stopTimer();
        setTimeLeft(MODES[mode].minutes * 60);
        progress.value = withSpring(1);
    }, [mode]);

    useEffect(() => {
        if (isActive) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        stopTimer();
                        Vibration.vibrate([500, 500, 500]);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive]);

    // Update progress bar
    useEffect(() => {
        const totalSeconds = MODES[mode].minutes * 60;
        progress.value = withTiming(timeLeft / totalSeconds, { duration: 1000 });
    }, [timeLeft]);

    const toggleTimer = () => {
        setIsActive(!isActive);
    };

    const stopTimer = () => {
        setIsActive(false);
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const resetTimer = () => {
        stopTimer();
        setTimeLeft(MODES[mode].minutes * 60);
        progress.value = withSpring(1);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progressStyle = useAnimatedStyle(() => {
        return {
            width: `${progress.value * 100}%`
        };
    });

    return (
        <View className="flex-1" style={{ backgroundColor: hexColors.background }}>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView className="flex-1">
                {/* Header */}
                <View className="px-4 py-3 border-b border-border flex-row items-center justify-between">
                    <TouchableOpacity 
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-full items-center justify-center"
                        style={{ backgroundColor: hexColors.secondary }}
                    >
                        <Ionicons name="arrow-back" size={24} color={hexColors.foreground} />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold " style={{ color: hexColors.foreground }}>Study Timer</Text>
                    <View className="w-10" />
                </View>

                <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
                    
                    {/* Mode Selector */}
                    <View className="flex-row justify-between mb-8 p-1 rounded-2xl" style={{ backgroundColor: `${hexColors.secondary}30` }}>
                        {(Object.keys(MODES) as TimerMode[]).map((m) => (
                            <TouchableOpacity
                                key={m}
                                onPress={() => setMode(m)}
                                className="flex-1 py-3 rounded-xl items-center flex-row justify-center"
                                style={{ 
                                    backgroundColor: mode === m ? hexColors.background : 'transparent',
                                    ...(mode === m ? { shadowOpacity: 0.1, shadowRadius: 3 } : {})
                                }}
                            >
                                <Ionicons 
                                    name={MODES[m].icon as any} 
                                    size={16} 
                                    color={mode === m ? MODES[m].color : hexColors.mutedForeground} 
                                    style={{ marginRight: 6 }}
                                />
                                <Text 
                                    className="font-semibold text-xs"
                                    style={{ color: mode === m ? hexColors.foreground : hexColors.mutedForeground }}
                                >
                                    {MODES[m].label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Timer Display */}
                    <Animated.View 
                        entering={FadeInDown.springify()}
                        className="items-center justify-center mb-12"
                    >
                        <View className="w-72 h-72 rounded-full border-8 border-secondary items-center justify-center  shadow-lg relative overflow-hidden" style={{ backgroundColor: hexColors.card }}>
                            {/* Progress Background */}
                            <View className="absolute bottom-0 left-0 right-0 h-full w-full bg-secondary/10" />
                            
                            {/* Timer Text */}
                            <Text className="text-6xl font-black font-monospaced tracking-tighter">
                                {formatTime(timeLeft)}
                            </Text>
                            <Text className="mt-2 font-medium uppercase tracking-widest" style={{ color: hexColors.mutedForeground }}>
                                {isActive ? 'Running' : 'Paused'}
                            </Text>
                        </View>
                    </Animated.View>

                    {/* Controls */}
                    <View className="flex-row justify-center gap-6 mb-12">
                        <TouchableOpacity
                            onPress={resetTimer}
                            className="w-16 h-16 rounded-full items-center justify-center"
                            style={{ backgroundColor: hexColors.secondary }}
                        >
                            <Ionicons name="refresh" size={24} color={hexColors.foreground} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={toggleTimer}
                            className="w-24 h-24 rounded-full items-center justify-center shadow-xl"
                            style={{ backgroundColor: MODES[mode].color }}
                        >
                            <Ionicons 
                                name={isActive ? "pause" : "play"} 
                                size={40} 
                                color="white" 
                                style={{ marginLeft: isActive ? 0 : 4 }}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                // Skip logic (just set to 0)
                                setTimeLeft(0);
                                setIsActive(false);
                            }}
                            className="w-16 h-16 rounded-full items-center justify-center"
                            style={{ backgroundColor: hexColors.secondary }}
                        >
                            <Ionicons name="play-skip-forward" size={24} color={hexColors.foreground} />
                        </TouchableOpacity>
                    </View>

                    {/* Tips Section */}
                    <View className="p-6 rounded-3xl" style={{ backgroundColor: hexColors.card, borderWidth: 1, borderColor: hexColors.border }}>
                        <View className="flex-row items-center mb-4">
                            <Ionicons name="sparkles" size={20} color="#EAB308" className="mr-2" />
                            <Text className="text-lg font-bold ml-2" style={{ color: hexColors.foreground }}>Study Tips</Text>
                        </View>
                        <Text className="leading-6" style={{ color: hexColors.mutedForeground }}>
                            • <Text className="font-bold " style={{ color: hexColors.foreground }}>Pomodoro Technique:</Text> Work for 25 minutes, then take a 5-minute break.
                            {'\n'}
                            • <Text className="font-bold " style={{ color: hexColors.foreground }}>Eliminate Distractions:</Text> Put your phone on "Do Not Disturb".
                            {'\n'}
                            • <Text className="font-bold " style={{ color: hexColors.foreground }}>Stay Hydrated:</Text> Drink water during your breaks.
                        </Text>
                    </View>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
