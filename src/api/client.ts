import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { apiConfig } from '../config';

// Create axios instance with environment configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: apiConfig.baseUrl,
  timeout: apiConfig.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    console.log('🔍 API Response Error:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data
    });
    
    // Handle common errors
    if (error.response?.status === 401) {
      // Token expired or invalid
      console.log('🚫 401 Unauthorized - Clearing auth data');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      
      // Only redirect if not already on login page and not during initialization
      const isInitRequest = error.config?.url?.includes('/me');
      const isOnLoginPage = window.location.pathname === '/login';
      
      if (!isOnLoginPage && !isInitRequest) {
        console.log('🔄 Redirecting to login...');
        window.location.href = '/login';
      }
    }
    
    if (error.response?.status === 403) {
      // Access denied
      console.error('Access denied:', error.response.data);
    }
    
    if (error.response?.status === 422) {
      // Validation errors
      console.error('Validation errors:', error.response.data);
    }
    
    if (error.response?.status >= 500) {
      // Server errors
      console.error('Server error:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

// Export API configuration for use in other files
export { apiConfig };

// Types for common API responses
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

// Error handler utility
export const handleApiError = (error: AxiosError): string => {
  if (error.response?.status === 401) {
    return 'Your session has expired. Please log in again.';
  }
  
  if (error.response?.status === 403) {
    return 'You do not have permission to perform this action.';
  }
  
  if (error.response?.status === 422) {
    const errors = (error.response.data as any)?.errors;
    if (errors) {
      return Object.values(errors).flat().join(', ');
    }
    return (error.response.data as any)?.message || 'Validation failed.';
  }
  
  if (error.response?.status === 404) {
    return 'The requested resource was not found.';
  }
  
  if (error.response?.status >= 500) {
    return 'A server error occurred. Please try again later.';
  }
  
  if (error.code === 'ECONNABORTED') {
    return 'Request timeout. Please check your connection and try again.';
  }
  
  return 'An unexpected error occurred. Please try again.';
};
