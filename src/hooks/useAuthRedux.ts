import { useAppSelector, useAppDispatch } from '../store/hooks';
import {
  selectAuth,
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectAuthError,
  selectLoginError,
  selectHasRole,
  loginUser,
  logoutUser,
  clearError,
} from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(selectAuth);
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectAuthError);
  const loginError = useAppSelector(selectLoginError);
  
  const getRoleBasedRedirect = () => {
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
        redirectPath = '/pos/cashier-dashboard';
        break;
      case 'waiter':
      case 'kitchen':
        redirectPath = '/pos/orders';
        break;
      default:
        console.log('⚠️ Unknown role, redirecting to default dashboard');
        redirectPath = '/pos/orders';
    }
    
    console.log('🔀 Computed redirect path:', redirectPath);
    return redirectPath;
  };

  const login = async (email: string, password: string) => {
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      return { 
        success: true, 
        redirectPath: result.payload.redirectPath 
      };
    } else {
      return { 
        success: false, 
        error: result.payload as string 
      };
    }
  };

  const logout = () => {
    dispatch(logoutUser());
  };

  const hasRole = (roles: string | string[]) => {
    return useAppSelector(selectHasRole(roles));
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    loginError,
    login,
    logout,
    getRoleBasedRedirect,
    hasRole,
    clearError: clearAuthError,
  };
};