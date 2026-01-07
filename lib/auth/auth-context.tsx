import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { signIn, signUp, signOut, getCurrentUser, fetchUserAttributes, confirmSignUp, resetPassword as amplifyResetPassword, confirmResetPassword as amplifyConfirmResetPassword } from 'aws-amplify/auth';
import { configureAmplify } from '../api/amplify-config';
import { AuthState, AuthContextType, LoginCredentials, RegisterData, User, UserRole } from './auth-types';

// Initial state
const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

// Action types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'INIT_COMPLETE' }
  | { type: 'NEEDS_CONFIRMATION'; payload: string };

// Extended auth state for confirmation flow
interface ExtendedAuthState extends AuthState {
  pendingConfirmation: string | null;
}

const extendedInitialState: ExtendedAuthState = {
  ...initialState,
  pendingConfirmation: null,
};

// Reducer
function authReducer(state: ExtendedAuthState, action: AuthAction): ExtendedAuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        pendingConfirmation: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        pendingConfirmation: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'INIT_COMPLETE':
      return {
        ...state,
        isLoading: false,
      };
    case 'NEEDS_CONFIRMATION':
      return {
        ...state,
        isLoading: false,
        pendingConfirmation: action.payload,
      };
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to convert Cognito user to our User type
async function cognitoToUser(): Promise<User> {
  const attributes = await fetchUserAttributes();

  return {
    id: attributes.sub || '',
    email: attributes.email || '',
    name: attributes.given_name || attributes.name || '',
    role: (attributes['custom:role'] as UserRole) || 'student',
    tenantId: attributes['custom:tenantId'] || 'default',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, extendedInitialState);

  // Initialize Amplify and check for existing session
  useEffect(() => {
    const initAuth = async () => {
      try {
        await configureAmplify();

        // Check if user is already signed in
        const currentUser = await getCurrentUser();
        if (currentUser) {
          const user = await cognitoToUser();
          dispatch({ type: 'AUTH_SUCCESS', payload: user });
        } else {
          dispatch({ type: 'INIT_COMPLETE' });
        }
      } catch (error) {
        // No user signed in
        dispatch({ type: 'INIT_COMPLETE' });
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials): Promise<void> => {
    dispatch({ type: 'AUTH_START' });

    try {
      console.log('Attempting sign in for:', credentials.email);
      const { isSignedIn, nextStep } = await signIn({
        username: credentials.email,
        password: credentials.password,
      });

      console.log('Sign in result:', { isSignedIn, nextStep });

      if (isSignedIn) {
        const user = await cognitoToUser();
        console.log('User authenticated:', user);
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
      } else if (nextStep.signInStep === 'CONFIRM_SIGN_UP') {
        dispatch({ type: 'NEEDS_CONFIRMATION', payload: credentials.email });
        throw new Error('Please confirm your email address');
      } else if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        throw new Error('New password required. This flow is not yet implemented.');
      } else if (nextStep.signInStep === 'RESET_PASSWORD') {
        throw new Error('Password reset required. Please use the Forgot Password feature.');
      } else {
        throw new Error(`Unexpected sign in step: ${nextStep.signInStep}`);
      }
    } catch (error) {
      console.error('Sign in error (full):', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      console.error('Sign in error (type):', typeof error);
      console.error('Sign in error (constructor):', error?.constructor?.name);

      let errorMessage = 'Login failed';

      // Try multiple ways to extract the error message
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error('Error.message:', errorMessage);

        // Handle the case where a user is already signed in
        if (errorMessage.includes('already a signed in user')) {
          console.log('User already signed in, signing out and retrying...');
          await signOut();
          return login(credentials);
        }
      } else if (typeof error === 'object' && error !== null) {
        const errObj = error as any;

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
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      // Parse specific authentication error messages
      if (errorMessage.includes('UserNotFoundException') || errorMessage.includes('UserNotFound')) {
        errorMessage = 'User not found. Please check your email or sign up.';
      } else if (errorMessage.includes('NotAuthorizedException') || errorMessage.includes('NotAuthorized') || errorMessage.includes('Incorrect username or password')) {
        errorMessage = 'Incorrect email or password. Please try again.';
      } else if (errorMessage.includes('UserNotConfirmedException') || errorMessage.includes('confirm')) {
        errorMessage = 'Please confirm your email address before signing in.';
      } else if (errorMessage.includes('PasswordResetRequiredException')) {
        errorMessage = 'Password reset required. Please reset your password.';
      } else if (errorMessage.includes('TooManyRequestsException') || errorMessage.includes('LimitExceeded')) {
        errorMessage = 'Too many login attempts. Please wait a few minutes and try again.';
      } else if (errorMessage.includes('Network') || errorMessage.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (errorMessage === 'An unknown error has occurred.') {
        errorMessage = 'Login failed. Please check your credentials and try again.';
      }

      console.error('Final parsed error message:', errorMessage);
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // Register function
  const register = async (data: RegisterData): Promise<void> => {
    dispatch({ type: 'AUTH_START' });

    try {
      const { isSignUpComplete, nextStep } = await signUp({
        username: data.email,
        password: data.password,
        options: {
          userAttributes: {
            email: data.email,
            given_name: data.name,
            'custom:role': data.role,
            'custom:tenantId': data.tenantId || 'default',
          },
        },
      });

      if (isSignUpComplete) {
        // Auto sign-in after registration
        await login({ email: data.email, password: data.password });
      } else if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        dispatch({ type: 'NEEDS_CONFIRMATION', payload: data.email });
        throw new Error('Please check your email for a confirmation code');
      } else {
        throw new Error(`Unexpected sign up step: ${nextStep.signUpStep}`);
      }
    } catch (error) {
      console.error('Registration error (full):', JSON.stringify(error, null, 2));
      console.error('Registration error (type):', typeof error);

      let errorMessage = 'Registration failed';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        const errObj = error as any;
        if (errObj.message) {
          errorMessage = errObj.message;
        } else if (errObj.error?.message) {
          errorMessage = errObj.error.message;
        } else if (errObj.__type) {
          errorMessage = errObj.__type;
        } else if (errObj.name) {
          errorMessage = errObj.name;
        }
      }

      // Parse specific registration error messages
      if (errorMessage.includes('UsernameExistsException') || errorMessage.includes('exists')) {
        errorMessage = 'An account with this email already exists. Please sign in instead.';
      } else if (errorMessage.includes('InvalidPasswordException')) {
        errorMessage = 'Password does not meet requirements. Must be at least 8 characters with uppercase, lowercase, and numbers.';
      } else if (errorMessage.includes('InvalidParameterException')) {
        errorMessage = 'Invalid registration information. Please check your details.';
      } else if (errorMessage.includes('Network') || errorMessage.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (errorMessage === 'An unknown error has occurred.') {
        errorMessage = 'Registration failed. Please check your information and try again.';
      }

      console.error('Final parsed registration error:', errorMessage);
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await signOut();
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Reset Password function
  const resetPassword = async (email: string): Promise<void> => {
    dispatch({ type: 'AUTH_START' });
    try {
      const output = await amplifyResetPassword({ username: email });
      const { nextStep } = output;
      if (nextStep.resetPasswordStep === 'CONFIRM_RESET_PASSWORD_WITH_CODE') {
        dispatch({ type: 'INIT_COMPLETE' }); // Stop loading
      } else if (nextStep.resetPasswordStep === 'DONE') {
        dispatch({ type: 'INIT_COMPLETE' });
        throw new Error('Password reset already complete. Please login.');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      let errorMessage = 'Failed to send reset code';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Confirm Reset Password function
  const confirmResetPassword = async (email: string, code: string, newPassword: string): Promise<void> => {
    dispatch({ type: 'AUTH_START' });
    try {
      await amplifyConfirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword,
      });
      dispatch({ type: 'INIT_COMPLETE' });
    } catch (error) {
      console.error('Confirm reset password error:', error);
      let errorMessage = 'Failed to reset password';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Clear error function
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    resetPassword,
    confirmResetPassword,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// HOC for protected routes
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P> {
  return function WithAuthComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return null; // Or a loading spinner
    }

    if (!isAuthenticated) {
      // Redirect to login
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
