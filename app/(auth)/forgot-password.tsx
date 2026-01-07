import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../lib/auth/auth-context';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'EMAIL' | 'RESET'>('EMAIL');
  const [showPassword, setShowPassword] = useState(false);
  
  const { resetPassword, confirmResetPassword, isLoading, error, clearError } = useAuth();

  const handleSendCode = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    try {
      await resetPassword(email);
      setStep('RESET');
    } catch (err) {
      // Error is handled by auth context
    }
  };

  const handleResetPassword = async () => {
    if (!code || !newPassword) {
      Alert.alert('Error', 'Please enter the code and your new password');
      return;
    }

    try {
      await confirmResetPassword(email, code, newPassword);
      Alert.alert('Success', 'Your password has been reset. Please login with your new password.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') }
      ]);
    } catch (err) {
      // Error is handled by auth context
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>
        {step === 'EMAIL' 
          ? 'Enter your email to receive a reset code' 
          : 'Enter the code sent to your email and your new password'}
      </Text>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={clearError}>
            <Text style={styles.errorDismiss}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.form}>
        {step === 'EMAIL' ? (
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="Confirmation Code"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              autoCapitalize="none"
              editable={!isLoading}
            />
            
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                textContentType="newPassword"
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#666" />
              </TouchableOpacity>
            </View>
          </>
        )}

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={step === 'EMAIL' ? handleSendCode : handleResetPassword}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {step === 'EMAIL' ? 'Send Code' : 'Reset Password'}
            </Text>
          )}
        </TouchableOpacity>

        {step === 'RESET' && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setStep('EMAIL')}
            disabled={isLoading}
          >
            <Text style={styles.secondaryButtonText}>Back to Email</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.footer}>
        <Link href="/(auth)/login">
          <Text style={styles.footerLink}>Back to Login</Text>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  form: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  eyeButton: {
    padding: 15,
  },
  eyeButtonText: {
    fontSize: 18,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#a0cfff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerLink: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
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
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
