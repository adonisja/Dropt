import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../lib/auth/auth-context';
import { UserRole } from '../../lib/auth/auth-types';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const { register, isLoading, error, clearError } = useAuth();

  const handleRegister = async () => {
    setLocalError(null);

    if (!name || !email || !password || !confirmPassword) {
      setLocalError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    try {
      await register({ email, password, name, role });
      router.replace('/');
    } catch (err) {
      // Check if user needs to confirm email
      if (err instanceof Error && err.message.includes('confirm')) {
        router.push({
          pathname: '/(auth)/confirm',
          params: { email },
        });
      }
      // Other errors are handled by auth context
    }
  };

  const displayError = localError || error;

  const handleDismissError = () => {
    setLocalError(null);
    clearError();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      {displayError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{displayError}</Text>
          <TouchableOpacity onPress={handleDismissError}>
            <Text style={styles.errorDismiss}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          editable={!isLoading}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            textContentType="newPassword"
            autoComplete="password-new"
            editable={!isLoading}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            textContentType="newPassword"
            autoComplete="password-new"
            editable={!isLoading}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.roleContainer}>
          <Text style={styles.roleLabel}>I am a:</Text>
          <View style={styles.roleButtons}>
            <TouchableOpacity
              style={[styles.roleButton, role === 'student' && styles.roleButtonActive]}
              onPress={() => setRole('student')}
            >
              <Text style={[styles.roleButtonText, role === 'student' && styles.roleButtonTextActive]}>
                Student
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, role === 'teacher' && styles.roleButtonActive]}
              onPress={() => setRole('teacher')}
            >
              <Text style={[styles.roleButtonText, role === 'teacher' && styles.roleButtonTextActive]}>
                Teacher
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, role === 'admin' && styles.roleButtonActive]}
              onPress={() => setRole('admin')}
            >
              <Text style={[styles.roleButtonText, role === 'admin' && styles.roleButtonTextActive]}>
                Admin
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <Link href="/(auth)/login">
          <Text style={styles.footerLink}>Sign In</Text>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  form: {
    gap: 15,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    backgroundColor: '#fff',
    padding: 15,
    paddingRight: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    padding: 5,
  },
  eyeButtonText: {
    fontSize: 20,
  },
  roleContainer: {
    marginVertical: 10,
  },
  roleLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  roleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  roleButtonText: {
    fontSize: 14,
    color: '#333',
  },
  roleButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#666',
  },
  footerLink: {
    color: '#007AFF',
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#c62828',
    flex: 1,
  },
  errorDismiss: {
    color: '#c62828',
    fontWeight: '600',
    marginLeft: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
