import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, User as ApiUser } from '../api/auth';
import { handleApiError } from '../api/client';

interface AuthContextType {
  user: ApiUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
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

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      const authData = await authAPI.login({ email, password });
      authAPI.storeAuthData(authData);
      setUser(authData.user);
      return { success: true };
    } catch (error: any) {
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
    if (!user) return '/login';
    
    switch (user.role) {
      case 'superadmin':
        return '/admin/tenants';
      case 'owner':
      case 'manager':
        return '/owner/dashboard';
      case 'cashier':
        return '/cashier/dashboard';
      case 'waiter':
        return '/tables';
      case 'kitchen':
        return '/kitchen';
      default:
        return '/tables';
    }
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