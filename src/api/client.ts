import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { refreshSession, expireSession } from './session';
import { localizeApiError, localizeApiResponse } from '@/lib/apiMessages';
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

// Retry each protected request once after refreshing the shared JWT.
apiClient.interceptors.response.use(
  (response: AxiosResponse) => { localizeApiResponse(response.data); return response; },
  async (error: AxiosError) => {
    const config = error.config as (typeof error.config & { _retried?: boolean });
    const sentToken = String(config?.headers?.Authorization ?? '').replace(/^Bearer /, '');
    const currentToken = localStorage.getItem('auth_token');
    const authRoute = /\/(?:login|refresh|logout)(?:\?|$)/.test(config?.url ?? '');
    if (error.response?.status === 401 && config && !authRoute && sentToken && currentToken) {
      if (!config._retried) {
        config._retried = true;
        try {
          // Another request may already have rotated the token while this one was in flight.
          const token = currentToken !== sentToken ? currentToken : await refreshSession(sentToken);
          config.headers.Authorization = `Bearer ${token}`;
          return apiClient.request(config);
        } catch {
          expireSession(sentToken);
        }
      } else {
        expireSession(sentToken);
      }
    }
    // Normalize all server messages at the boundary, including callers outside RTK Query.
    localizeApiError(error);
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

// Error messages are localized by the response interceptor.
export const handleApiError = (error: AxiosError): string => localizeApiError(error);
