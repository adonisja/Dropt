import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { confirmSignUp, resendSignUpCode, signIn } from 'aws-amplify/auth';

export default function ConfirmEmail() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!email) {
      router.replace('/(auth)/register');
    }
  }, [email]);

  const handleConfirm = async () => {
    if (!code) {
      setError('Please enter the confirmation code');
      return;
    }

    if (!password) {
      setError('Please enter your password to sign in');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      console.log('Starting confirmation process for:', email);
      await confirmSignUp({
        username: email,
        confirmationCode: code,
      });
      console.log('Confirmation successful, attempting sign-in...');

      // Auto sign-in after confirmation
      const { isSignedIn } = await signIn({
        username: email,
        password: password,
      });

      console.log('Sign-in result:', isSignedIn);
      if (isSignedIn) {
        router.replace('/');
      } else {
        router.replace('/(auth)/login');
      }
    } catch (err) {
      console.error('Confirmation error (full):', JSON.stringify(err, null, 2));
      console.error('Confirmation error (type):', typeof err);
      console.error('Confirmation error (constructor):', err?.constructor?.name);

      // Enhanced error parsing
      let errorMessage = 'Confirmation failed';

      // Try multiple ways to extract the error message
      if (err instanceof Error) {
        errorMessage = err.message;
        console.error('Error.message:', errorMessage);
      } else if (typeof err === 'object' && err !== null) {
        const errObj = err as any;

        // Log the entire error structure for debugging
        console.error('Error object keys:', Object.keys(errObj));
        console.error('Error object:', errObj);

        // Try various error properties
        if (errObj.message) {
          errorMessage = errObj.message;
        } else if (errObj.error?.message) {
          errorMessage = errObj.error.message;
        } else if (errObj.__type) {
          errorMessage = errObj.__type;
        } else if (errObj.name) {
          errorMessage = errObj.name;
        } else if (errObj.code) {
          errorMessage = `Error code: ${errObj.code}`;
        }
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      // Parse specific Amplify error messages
      if (errorMessage.includes('CodeMismatchException') || errorMessage.includes('CodeMismatch')) {
        errorMessage = 'Invalid confirmation code. Please check and try again.';
      } else if (errorMessage.includes('ExpiredCodeException') || errorMessage.includes('ExpiredCode')) {
        errorMessage = 'Confirmation code has expired. Please request a new code.';
      } else if (errorMessage.includes('LimitExceededException') || errorMessage.includes('LimitExceeded')) {
        errorMessage = 'Too many attempts. Please wait a few minutes and try again.';
      } else if (errorMessage.includes('NotAuthorizedException') || errorMessage.includes('NotAuthorized')) {
        errorMessage = 'Incorrect password. Please try again or go back to reset.';
      } else if (errorMessage.includes('UserNotFoundException') || errorMessage.includes('UserNotFound')) {
        errorMessage = 'User not found. Please register again.';
      } else if (errorMessage.includes('Network') || errorMessage.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (errorMessage === 'An unknown error has occurred.') {
        // If still unknown, provide more helpful message
        errorMessage = 'An error occurred during confirmation. Please check your code and password, or request a new code.';
      }

      console.error('Final parsed error message:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError(null);
    setSuccess(null);
    setIsResending(true);

    try {
      console.log('Resending confirmation code to:', email);
      await resendSignUpCode({
        username: email,
      });
      console.log('Code resent successfully');
      setSuccess('A new confirmation code has been sent to your email');
    } catch (err) {
      console.error('Resend code error:', err);

      let errorMessage = 'Failed to resend code';

      if (err instanceof Error) {
        errorMessage = err.message;

        if (errorMessage.includes('LimitExceededException')) {
          errorMessage = 'Too many requests. Please wait a few minutes before requesting another code.';
        } else if (errorMessage.includes('UserNotFoundException')) {
          errorMessage = 'User not found. Please register again.';
        } else if (errorMessage.includes('Network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        }
      } else if (typeof err === 'object' && err !== null) {
        const errObj = err as any;
        if (errObj.message) {
          errorMessage = errObj.message;
        }
      }

      console.error('Parsed resend error:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirm Your Email</Text>

      <Text style={styles.subtitle}>
        We've sent a confirmation code to{'\n'}
        <Text style={styles.emailText}>{email}</Text>
      </Text>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => setError(null)}>
            <Text style={styles.errorDismiss}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}

      {success && (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>{success}</Text>
        </View>
      )}

      <View style={styles.form}>
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
            placeholder="Password (to sign in after confirmation)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            textContentType="password"
            autoComplete="password"
            editable={!isLoading}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.eyeButtonText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleConfirm}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Confirm & Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.resendButton, isResending && styles.buttonDisabled]}
          onPress={handleResendCode}
          disabled={isResending}
        >
          {isResending ? (
            <ActivityIndicator color="#007AFF" />
          ) : (
            <Text style={styles.resendButtonText}>Resend Code</Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>Back to Registration</Text>
      </TouchableOpacity>
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
    marginBottom: 15,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
    lineHeight: 24,
  },
  emailText: {
    fontWeight: '600',
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
  buttonDisabled: {
    opacity: 0.7,
  },
  resendButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  resendButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#666',
    fontSize: 14,
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
  successContainer: {
    backgroundColor: '#e8f5e9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  successText: {
    color: '#2e7d32',
  },
});
