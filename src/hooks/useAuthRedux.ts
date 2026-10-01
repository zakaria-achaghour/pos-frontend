import { useAppSelector, useAppDispatch } from '../store/hooks';
import {
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectAuthError,
  selectLoginError,
  getRedirectPathForRole,
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
  
  const getRoleBasedRedirect = () =>
    user ? getRedirectPathForRole(user.role) : '/login';

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

  // Plain check on the current user (selectors must not be called inside handlers)
  const hasRole = (roles: string | string[]) => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
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
