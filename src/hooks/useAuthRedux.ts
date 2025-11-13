import { useAppSelector, useAppDispatch } from '../store/hooks';
import {
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
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectAuthError);
  const loginError = useAppSelector(selectLoginError);
  
  const getRoleBasedRedirect = () => {
    if (!user) {
      return '/login';
    }
    
    let redirectPath: string;
    switch (user.role) {
      case 'superadmin':
        redirectPath = '/admin/tenants';
        break;
      case 'owner':
        redirectPath = '/owner/dashboard';
        break;
      case 'manager':
        redirectPath = '/dashboard';
        break;
      case 'cashier':
        redirectPath = '/orders';
        break;
      case 'kitchen':
        redirectPath = '/kitchen';
        break;
      case 'waiter':
        redirectPath = '/tables';
        break;
      default:
        redirectPath = '/orders';
    }
    
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
