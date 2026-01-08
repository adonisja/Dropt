import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/lib/theme/theme-context';
import { RecommendationResult } from '@/lib/logic/recommendation-engine';

interface RecommendationCardProps {
    result: RecommendationResult;
    aiAdvice?: string | null;
}

export default function RecommendationCard({ result, aiAdvice }: RecommendationCardProps) {
    const { theme, hexColors } = useTheme();
    const { score, riskLevel, advice } = result;

    const getColor = (s: number) => {
        if (s >= 90) return '#10B981'; // Emerald-Green (Excellent)
        if (s >= 75) return '#3B82F6'; // Blue (Good)
        if (s >= 50) return '#FBBF24'; // Yellow (Moderate)
        return '#EF4444'; // Red (High Risk/Critical)
    }

    const primaryColor = getColor(score);
    
    const gradientColors = [primaryColor + '33', primaryColor + 'AA', primaryColor + '33'];

    const markerPosition = Math.min(98, Math.max(2, score)); // Clamp between 2% and 98%

    return (
        <Animated.View 
            entering={FadeInDown.delay(200).springify()}
            className="rounded-2xl p-6 mb-6 shadow-sm overflow-hidden"
            style={{ backgroundColor: hexColors.card, borderWidth: 1, borderColor: hexColors.border }}
        >
            {/* Header */}
            <View className="flex-row justify-between items-start mb-6">
                <View>
                    <Text className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
                        Recommendation Score
                    </Text>
                    <View className="flex-row items-baseline">
                        <Text className="text-5xl font-bold" style={{ color: primaryColor }}>
                            {score.toFixed(0)}
                        </Text>
                        <Text className="text-lg text-muted-foreground ml-1">/100</Text>
                    </View>
                </View>
                
                <View className="px-3 py-1 rounded-full" style={{ backgroundColor: `${primaryColor}20` }}>
                    <Text className="font-bold" style={{ color: primaryColor }}>
                        {riskLevel}
                    </Text>
                </View>
            </View>

            {/* The Risk Meter (Gradient Bar) */}
            <View className="mb-6">
                <View className="h-4 w-full rounded-full overflow-hidden bg-secondary relative">
                    {/* The Gradient Background */}
                    <LinearGradient
                        colors={['#EF4444', '#EAB308', '#3B82F6', '#10B981']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ flex: 1, opacity: 0.8 }}
                    />
                    
                    {/* The Marker (White Circle) */}
                    <View 
                        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg z-10"
                        style={{ 
                            left: `${markerPosition}%`,
                            transform: [{ translateX: -2 }] // Center the marker
                        }} 
                    />
                </View>
                
                {/* Labels below the bar */}
                <View className="flex-row justify-between mt-1">
                    <Text className="text-[10px] text-muted-foreground">Critical</Text>
                    <Text className="text-[10px] text-muted-foreground">Safe</Text>
                    <Text className="text-[10px] text-muted-foreground">Excellent</Text>
                </View>
            </View>

            {/* Action Plan / Advice */}
            <View>
                <Text className="text-base font-semibold text-foreground mb-3">Action Plan</Text>
                
                {/* AI Advice Section */}
                {aiAdvice && (
                    <View className="mb-4 bg-primary/10 p-4 rounded-xl border border-primary/20">
                        <View className="flex-row items-center mb-2">
                            <Ionicons name="sparkles" size={16} color={theme.colors.primary} style={{ marginRight: 6 }} />
                            <Text className="text-xs font-bold text-primary uppercase tracking-wider">AI Insight</Text>
                        </View>
                        <Text className="text-sm text-foreground leading-5 italic">
                            "{aiAdvice}"
                        </Text>
                    </View>
                )}

                <View className="space-y-3">
                    {advice.map((tip, index) => (
                        <View key={index} className="flex-row items-start bg-secondary/30 p-3 rounded-lg">
                            <Ionicons 
                                name="checkmark-circle" 
                                size={18} 
                                color={primaryColor} 
                                style={{ marginTop: 2, marginRight: 8 }} 
                            />
                            <Text className="text-sm text-foreground flex-1 leading-5">
                                {tip}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        </Animated.View>
    );
}