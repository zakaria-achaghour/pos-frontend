import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'owner' | 'manager' | 'cashier' | 'waiter' | 'kitchen';
  tenantId?: string; // For non-superadmin users
  tenantName?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  getRoleBasedRedirect: () => string;
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth token on app load
    const token = localStorage.getItem('pos_auth_token');
    const userData = localStorage.getItem('pos_user_data');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('pos_auth_token');
        localStorage.removeItem('pos_user_data');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Mock authentication - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user database with different roles
      const mockUsers: Record<string, User> = {
        'superadmin@pos.com': {
          id: 'superadmin-1',
          email: 'superadmin@pos.com',
          name: 'Super Administrator',
          role: 'superadmin'
        },
        'owner@restaurant.com': {
          id: 'owner-1',
          email: 'owner@restaurant.com',
          name: 'Restaurant Owner',
          role: 'owner',
          tenantId: 'tenant-1',
          tenantName: 'Demo Restaurant'
        },
        'manager@restaurant.com': {
          id: 'manager-1',
          email: 'manager@restaurant.com',
          name: 'Restaurant Manager',
          role: 'manager',
          tenantId: 'tenant-1',
          tenantName: 'Demo Restaurant'
        },
        'cashier@restaurant.com': {
          id: 'cashier-1',
          email: 'cashier@restaurant.com',
          name: 'Cashier Staff',
          role: 'cashier',
          tenantId: 'tenant-1',
          tenantName: 'Demo Restaurant'
        },
        'waiter@restaurant.com': {
          id: 'waiter-1',
          email: 'waiter@restaurant.com',
          name: 'Waiter Staff',
          role: 'waiter',
          tenantId: 'tenant-1',
          tenantName: 'Demo Restaurant'
        },
        'kitchen@restaurant.com': {
          id: 'kitchen-1',
          email: 'kitchen@restaurant.com',
          name: 'Kitchen Staff',
          role: 'kitchen',
          tenantId: 'tenant-1',
          tenantName: 'Demo Restaurant'
        }
      };

      // Validate credentials (password is 'password123' for all users)
      const user = mockUsers[email];
      if (user && password === 'password123') {
        const token = `mock_token_${Date.now()}`;
        localStorage.setItem('pos_auth_token', token);
        localStorage.setItem('pos_user_data', JSON.stringify(user));
        setUser(user);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBasedRedirect = (): string => {
    if (!user) return '/login';
    
    switch (user.role) {
      case 'superadmin':
        return '/admin/tenants';
      case 'owner':
      case 'manager':
        return '/dashboard';
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

  const logout = () => {
    localStorage.removeItem('pos_auth_token');
    localStorage.removeItem('pos_user_data');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    getRoleBasedRedirect
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};