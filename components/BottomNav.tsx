import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { router, usePathname } from 'expo-router';
import { useTheme } from '@/lib/theme/theme-context';
import { Ionicons } from '@expo/vector-icons';

interface NavItem {
    label: string;
    route: string;
    icon: keyof typeof Ionicons.glyphMap;
}

const navItems: NavItem[] = [
    { label: 'Home', route: '/(student)/student_dashboard', icon: 'home-outline' },
    { label: 'Courses', route: '/(student)/courses', icon: 'book-outline' },
    { label: 'Analytics', route: '/(student)/tools/analytics', icon: 'bar-chart-outline' },
    { label: 'Settings', route: '/(student)/settings', icon: 'settings-outline' },
];

const activeIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
    'home-outline': 'home',
    'book-outline': 'book',
    'bar-chart-outline': 'bar-chart',
    'settings-outline': 'settings',
};

export default function BottomNav() {
    const pathname = usePathname();
    const { theme, hexColors } = useTheme();

    const handleNavigation = (route: string) => {
        router.push(route as any);
    };

    // Don't show bottom nav on modal screens or dashboard
    if (
        pathname.includes('/add-') ||
        pathname.includes('/edit-') ||
        pathname.includes('student_dashboard')
    ) {
        return null;
    }

    return (
        <View className="flex-row pt-2 pb-5 shadow-lg" style={{ borderTopWidth: 1, borderTopColor: hexColors.border, backgroundColor: hexColors.card }}>
            {navItems.map((item) => {
                const isActive = pathname === item.route;
                const iconName = isActive ? activeIcons[item.icon] : item.icon;
                
                return (
                    <TouchableOpacity
                        key={item.route}
                        className="flex-1 items-center justify-center py-2"
                        onPress={() => handleNavigation(item.route)}
                        activeOpacity={0.7}
                    >
                        <Ionicons 
                            name={iconName} 
                            size={24} 
                            color={isActive ? theme.colors.primary : theme.colors.mutedForeground} 
                        />
                        <Text 
                            className="text-xs mt-1"
                            style={{ 
                                color: isActive ? hexColors.primary : hexColors.mutedForeground,
                                fontWeight: isActive ? '600' : '500'
                            }}
                        >
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}
