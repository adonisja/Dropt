import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../lib/auth/auth-context';

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // Redirect authenticated users to their dashboard based on role
      if (user.role === 'student') {
        router.replace('/(student)/student_dashboard');
      } else if (user.role === 'teacher') {
        // TODO: Add teacher dashboard route
        router.replace('/(student)/student_dashboard'); // Temporary
      } else if (user.role === 'admin') {
        // TODO: Add admin dashboard route
        router.replace('/(student)/student_dashboard'); // Temporary
      }
    }
  }, [isLoading, isAuthenticated, user]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Show loading while redirecting authenticated users
  if (isAuthenticated && user) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Dropt</Text>
      <Text style={styles.subtitle}>AI-powered course drop recommendations</Text>
      <View style={styles.linkContainer}>
        <Link href="/(auth)/login" style={styles.link}>
          <Text style={styles.linkText}>Sign In</Text>
        </Link>
        <Link href="/(auth)/register" style={styles.link}>
          <Text style={styles.linkText}>Create Account</Text>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  linkContainer: {
    gap: 15,
    width: '100%',
    maxWidth: 300,
  },
  link: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  linkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});
