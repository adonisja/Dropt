import { Stack, router } from "expo-router";
import { Redirect } from "expo-router";
import { useAuth } from "@/lib/auth/auth-context";
import { useTheme } from "@/lib/theme/theme-context";
import { View, ActivityIndicator } from "react-native";
import { HeaderProfileBtn } from "@/components/HeaderProfileBtn";
import BottomNav from "@/components/BottomNav";

export default function StudentLayout() {
    const { isAuthenticated, isLoading } = useAuth();
    const { theme, hexColors } = useTheme();

    if (isLoading) {
        return (
            <View style={{flex:1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background}} >
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!isAuthenticated) {
        return <Redirect href="(auth)/login" />;
    }

    return (
        <View style={{ flex: 1 }}>
            <Stack
                screenOptions={{
                    headerStyle: {
                        backgroundColor: theme.colors.card,
                    },
                    headerTintColor: theme.colors.primary,
                    headerTitleStyle: {
                        fontWeight: 'bold',
                        color: theme.colors.foreground,
                    },
                    headerTitleAlign: 'center',
                    headerShadowVisible: true,
                    headerRight: () => <HeaderProfileBtn />,
                }}
            >
                <Stack.Screen
                    name="student_dashboard"
                    options={{
                        title: "Dashboard",
                        headerShown: true,
                    }}
                />
                <Stack.Screen
                    name="courses/index"
                    options={{
                        title: "My Courses",
                        headerShown: true,
                    }}
                />
                <Stack.Screen
                    name="courses/add"
                    options={{
                        title: "Add Course",
                        headerShown: true,
                        presentation: 'modal',
                    }}
                />
                <Stack.Screen
                    name="assignments/add"
                    options={{
                        title: "Add Assignment",
                        headerShown: true,
                        presentation: 'modal',
                    }}
                />
                <Stack.Screen
                    name="courses/[id]"
                    options={{
                        title: "Course Details",
                        headerShown: true,
                    }}
                />
                <Stack.Screen
                    name="courses/edit"
                    options={{
                        title: "Edit Course",
                        headerShown: true,
                        presentation: 'modal',
                    }}
                />
                <Stack.Screen
                    name="assignments/edit"
                    options={{
                        title: "Edit Assignment",
                        headerShown: true,
                        presentation: 'modal',
                    }}
                />
                <Stack.Screen
                    name="tools/analytics"
                    options={{
                        title: "Analytics",
                        headerShown: true,
                    }}
                />
                <Stack.Screen
                    name="settings"
                    options={{
                        title: "Settings",
                        headerShown: true,
                    }}
                />
                <Stack.Screen
                    name="tools/calculator"
                    options={{
                        title: "What-If Calculator",
                        headerShown: true,
                        presentation: 'modal',
                    }}
                />
                <Stack.Screen
                    name="courses/assessment"
                    options={{
                        title: "Course Assessment",
                        headerShown: true,
                        presentation: 'modal',
                    }}
                />
            </Stack>
            <BottomNav />
        </View>
    );
}
