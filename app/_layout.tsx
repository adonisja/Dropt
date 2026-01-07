import '../global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../lib/auth/auth-context';
import { ThemeProvider } from '../lib/theme/theme-context';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            animation: 'fade',
            headerShown: false,
            contentStyle: { backgroundColor: 'transparent' },
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: 'Dropt',
              headerShown: true
            }}
          />
          <Stack.Screen
            name="(auth)"
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen
            name="(student)"
            options={{
              headerShown: false
            }}
          />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}
