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
    // Handle common errors
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      
      // Only redirect if not already on login page
      const isOnLoginPage = window.location.pathname === '/login';
      
      if (!isOnLoginPage) {
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
    
    if (error.response && error.response.status >= 500) {
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
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  current_page?: number;
  last_page?: number;
  per_page?: number;
  page?: number;
  limit?: number;
  total: number;
  from?: number;
  to?: number;
}

interface ErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
}

// Error handler utility
export const handleApiError = (error: AxiosError): string => {
  // First check if there's a specific error message from the backend
  const backendMessage = (error.response?.data as ErrorBody | undefined)?.message;
  if (backendMessage) {
    return backendMessage;
  }
  
  if (error.response?.status === 401) {
    return 'Your session has expired. Please log in again.';
  }
  
  if (error.response?.status === 403) {
    return 'You do not have permission to perform this action.';
  }
  
  if (error.response?.status === 422) {
    const errors = (error.response.data as ErrorBody | undefined)?.errors;
    if (errors) {
      return Object.values(errors).flat().join(', ');
    }
    return (error.response.data as ErrorBody | undefined)?.message || 'Validation failed.';
  }
  
  if (error.response?.status === 404) {
    return 'The requested resource was not found.';
  }
  
  if (error.response?.status && error.response.status >= 500) {
    return 'A server error occurred. Please try again later.';
  }
  
  if (error.code === 'ECONNABORTED') {
    return 'Request timeout. Please check your connection and try again.';
  }
  
  return 'An unexpected error occurred. Please try again.';
};
