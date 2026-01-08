import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/lib/auth/auth-context';
import { useTheme } from '@/lib/theme/theme-context';

export const HeaderProfileBtn = () => {
    const { user } = useAuth();
    const { theme, hexColors } = useTheme();
    
    return (
        <TouchableOpacity 
            onPress={() => router.push('/(student)/settings')}
            className="mr-2 w-9 h-9 rounded-full items-center justify-center border"
            style={{ 
                backgroundColor: theme.colors.secondary,
                borderColor: theme.colors.border
            }}
        >
            <Text 
                className="text-sm font-bold"
                style={{ color: theme.colors.foreground }}
            >
                {user?.name?.[0] || 'S'}
            </Text>
        </TouchableOpacity>
    );
};
