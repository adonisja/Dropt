// User roles for role-based access control
export type UserRole = 'student' | 'teacher' | 'admin';

// User interface with role and tenant information
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string; // Multi-tenant support: organization/school ID
  createdAt: Date;
  updatedAt: Date;
}

// Authentication state
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// Registration data
export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  tenantId?: string; // Optional: for joining existing organization
}

// Auth context actions
export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmResetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  clearError: () => void;
}

// Session token response
export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: User;
}

// Role-based permissions
export interface RolePermissions {
  canViewOwnGrades: boolean;
  canViewStudentGrades: boolean;
  canEditCourseRubric: boolean;
  canManageUsers: boolean;
  canManageTenant: boolean;
}

// Permission map by role
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  student: {
    canViewOwnGrades: true,
    canViewStudentGrades: false,
    canEditCourseRubric: false,
    canManageUsers: false,
    canManageTenant: false,
  },
  teacher: {
    canViewOwnGrades: true,
    canViewStudentGrades: true,
    canEditCourseRubric: true,
    canManageUsers: false,
    canManageTenant: false,
  },
  admin: {
    canViewOwnGrades: true,
    canViewStudentGrades: true,
    canEditCourseRubric: true,
    canManageUsers: true,
    canManageTenant: true,
  },
};

// Helper to check if user has permission
export function hasPermission(
  user: User | null,
  permission: keyof RolePermissions
): boolean {
  if (!user) return false;
  return ROLE_PERMISSIONS[user.role][permission];
}
