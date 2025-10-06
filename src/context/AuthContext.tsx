import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, User as ApiUser } from '../api/auth';
import { handleApiError } from '../api/client';

interface AuthContextType {
  user: ApiUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; redirectPath?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  getRoleBasedRedirect: () => string;
  hasRole: (roles: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to get redirect path for a specific user
  const getRedirectPathForUser = (user: ApiUser): string => {
    console.log('🧭 Getting redirect path for user:', user);
    console.log('👤 User role:', user.role);
    
    let redirectPath: string;
    switch (user.role) {
      case 'superadmin':
        redirectPath = '/admin/tenants';
        break;
      case 'owner':
      case 'manager':
        redirectPath = '/owner/dashboard';
        break;
      case 'cashier':
        redirectPath = '/cashier/dashboard';
        break;
      case 'waiter':
        redirectPath = '/tables';
        break;
      case 'kitchen':
        redirectPath = '/kitchen';
        break;
      default:
        redirectPath = '/tables';
        break;
    }
    
    console.log('🔀 Calculated redirect path:', redirectPath);
    return redirectPath;
  };

  useEffect(() => {
    // Check for existing auth token on app load
    const initializeAuth = async () => {
      try {
        if (authAPI.isAuthenticated()) {
          // Verify token by fetching user data
          const userData = await authAPI.me();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        authAPI.clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; redirectPath?: string }> => {
    setIsLoading(true);
    
    try {
      console.log('🔐 Attempting login with:', { email });
      const authData = await authAPI.login({ email, password });
      console.log('✅ Login API response:', authData);
      
      authAPI.storeAuthData(authData);
      setUser(authData.user);
      
      console.log('👤 User set in context:', authData.user);
      console.log('🔀 User role:', authData.user.role);
      
      // Calculate redirect path using the fresh user data
      const redirectPath = getRedirectPathForUser(authData.user);
      console.log('🔀 Calculated redirect path:', redirectPath);
      
      return { success: true, redirectPath };
    } catch (error: any) {
      console.error('❌ Login error:', error);
      const errorMessage = handleApiError(error);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      authAPI.clearAuthData();
      setUser(null);
    }
  };

  const getRoleBasedRedirect = (): string => {
    console.log('🧭 Getting role-based redirect for user:', user);
    if (!user) {
      console.log('❌ No user found, redirecting to login');
      return '/login';
    }
    
    console.log('👤 User role:', user.role);
    
    let redirectPath: string;
    switch (user.role) {
      case 'superadmin':
        redirectPath = '/admin/tenants';
        break;
      case 'owner':
      case 'manager':
        redirectPath = '/owner/dashboard';
        break;
      case 'cashier':
        redirectPath = '/cashier/dashboard';
        break;
      case 'waiter':
        redirectPath = '/tables';
        break;
      case 'kitchen':
        redirectPath = '/kitchen';
        break;
      default:
        redirectPath = '/tables';
        break;
    }
    
    console.log('🔀 Redirecting to:', redirectPath);
    return redirectPath;
  };

  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    getRoleBasedRedirect,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};