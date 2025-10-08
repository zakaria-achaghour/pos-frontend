import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authAPI, User as ApiUser, AuthResponse } from '../../api/auth';
import { handleApiError } from '../../api/client';

interface AuthState {
  user: ApiUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  loginError: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResult {
  success: boolean;
  error?: string;
  redirectPath?: string;
}

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  loginError: null,
};

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

// Async thunks
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔍 Initializing auth...');
      
      if (authAPI.isAuthenticated()) {
        console.log('🎫 Token found in storage, verifying...');
        // Verify token by fetching user data
        const userData = await authAPI.me();
        console.log('✅ Token valid, user data:', userData);
        return userData;
      } else {
        console.log('❌ No token found in storage');
        return null;
      }
    } catch (error: any) {
      console.error('❌ Error initializing auth:', error);
      console.log('🧹 Clearing invalid auth data...');
      authAPI.clearAuthData();
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const loginUser = createAsyncThunk<
  { user: ApiUser; redirectPath: string },
  LoginCredentials,
  { rejectValue: string }
>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      console.log('🔐 Attempting login with:', { email: credentials.email });
      const authData = await authAPI.login(credentials);
      console.log('✅ Login API response:', authData);
      
      authAPI.storeAuthData(authData);
      
      console.log('👤 User logged in:', authData.user);
      console.log('🔀 User role:', authData.user.role);
      
      // Calculate redirect path using the fresh user data
      const redirectPath = getRedirectPathForUser(authData.user);
      console.log('🔀 Calculated redirect path:', redirectPath);
      
      return { user: authData.user, redirectPath };
    } catch (error: any) {
      console.error('❌ Login error:', error);
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();
    } catch (error: any) {
      console.error('Logout error:', error);
      // Don't reject on logout error, still clear local data
    } finally {
      authAPI.clearAuthData();
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.loginError = null;
    },
    setUser: (state, action: PayloadAction<ApiUser | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize auth
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.loginError = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.loginError = null;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.loginError = action.payload as string;
      })
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
        state.loginError = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectLoginError = (state: { auth: AuthState }) => state.auth.loginError;

// Helper selectors
export const selectHasRole = (roles: string | string[]) => (state: { auth: AuthState }) => {
  const user = state.auth.user;
  if (!user) return false;
  const roleArray = Array.isArray(roles) ? roles : [roles];
  return roleArray.includes(user.role);
};

export const selectGetRoleBasedRedirect = (state: { auth: AuthState }): string => {
  const user = state.auth.user;
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

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;