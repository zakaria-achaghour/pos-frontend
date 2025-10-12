import apiClient from './client';
import type { ApiResponse } from './client';

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'superadmin' | 'owner' | 'manager' | 'cashier' | 'waiter' | 'kitchen';
  roles?: string[]; // Backend uses roles array
  restaurant_id?: number;
  restaurant?: {
    id: number;
    name: string;
    slug: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  token_type: string;
  expires_in: number;
}

export interface RefreshResponse {
  token: string;
  token_type: string;
  expires_in: number;
}

// Authentication API service
export const authAPI = {
  /**
   * Login user with email and password
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<any>('/login', credentials);
    // Handle direct response format from Laravel backend
    const user = response.data.user;
    
    // Convert roles array to single role for frontend compatibility
    if (user.roles && user.roles.length > 0) {
      const roleMapping: { [key: string]: string } = {
        'SuperAdmin': 'superadmin',
        'Owner': 'owner',
        'Manager': 'manager',
        'Cashier': 'cashier',
        'Waiter': 'waiter',
        'Kitchen': 'kitchen'
      };
      user.role = roleMapping[user.roles[0]] || 'waiter';
    }
    if (user.role && typeof user.role === 'string') {
      user.role = user.role.toLowerCase();
    }

    return {
      user: user,
      token: response.data.access_token,
      token_type: response.data.token_type,
      expires_in: response.data.expires_in
    };
  },

  /**
   * Register new user (if enabled)
   */
  register: async (userData: LoginCredentials & { name: string }): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/register', userData);
    return response.data.data;
  },

  /**
   * Get current user information
   */
  me: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User> | User>('/me');
    const payload: any = response.data;

    // Support multiple backend response shapes
    const user: any = payload?.data ?? payload?.user ?? payload;

    if (!user) {
      throw new Error('Invalid response from /me endpoint');
    }

    // Harmonize role field if backend returns roles array or capitalized role
    if (!user.role && Array.isArray(user.roles) && user.roles.length > 0) {
      const roleMapping: { [key: string]: string } = {
        SuperAdmin: 'superadmin',
        Owner: 'owner',
        Manager: 'manager',
        Cashier: 'cashier',
        Waiter: 'waiter',
        Kitchen: 'kitchen'
      };
      user.role = roleMapping[user.roles[0]] || user.roles[0]?.toLowerCase() || 'waiter';
    } else if (typeof user.role === 'string') {
      user.role = user.role.toLowerCase();
    }

    return user as User;
  },

  /**
   * Refresh JWT token
   */
  refresh: async (): Promise<RefreshResponse> => {
    const response = await apiClient.post<ApiResponse<RefreshResponse>>('/refresh');
    return response.data.data;
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/logout');
  },

  /**
   * Store authentication data in localStorage
   */
  storeAuthData: (authData: AuthResponse): void => {
    localStorage.setItem('auth_token', authData.token);
    localStorage.setItem('user', JSON.stringify(authData.user));
  },

  /**
   * Get stored user data from localStorage
   */
  getStoredUser: (): User | null => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  },

  /**
   * Get stored auth token from localStorage
   */
  getStoredToken: (): string | null => {
    return localStorage.getItem('auth_token');
  },

  /**
   * Clear authentication data from localStorage
   */
  clearAuthData: (): void => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    const token = authAPI.getStoredToken();
    const user = authAPI.getStoredUser();
    return !!(token && user);
  },

  /**
   * Check if user has specific role(s)
   */
  hasRole: (requiredRoles: string | string[]): boolean => {
    const user = authAPI.getStoredUser();
    if (!user) return false;

    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    
    // Check both role property and roles array
    if (user.role && roles.includes(user.role)) {
      return true;
    }
    
    if (user.roles) {
      const roleMapping: { [key: string]: string } = {
        'SuperAdmin': 'superadmin',
        'Owner': 'owner',
        'Manager': 'manager',
        'Cashier': 'cashier',
        'Waiter': 'waiter',
        'Kitchen': 'kitchen'
      };
      
      return user.roles.some(backendRole => {
        const frontendRole = roleMapping[backendRole];
        return frontendRole && roles.includes(frontendRole);
      });
    }
    
    return false;
  },

  /**
   * Check if user is superadmin
   */
  isSuperAdmin: (): boolean => {
    return authAPI.hasRole('superadmin');
  },

  /**
   * Check if user is owner or manager
   */
  isOwnerOrManager: (): boolean => {
    return authAPI.hasRole(['owner', 'manager']);
  },

  /**
   * Check if user can access owner features
   */
  canAccessOwnerFeatures: (): boolean => {
    return authAPI.hasRole(['superadmin', 'owner']);
  },

  /**
   * Check if user can access manager features
   */
  canAccessManagerFeatures: (): boolean => {
    return authAPI.hasRole(['superadmin', 'owner', 'manager']);
  }
};

export default authAPI;
