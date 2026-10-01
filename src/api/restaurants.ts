import apiClient from './client';
import type { ApiResponse, PaginatedResponse } from './client';
import type {
  Restaurant,
  CreateRestaurantData,
  UpdateRestaurantData,
  RestaurantStats,
  RestaurantFilters
} from '../types/restaurant';
import { asApiError } from '@/utils/apiError';

// Restaurant API service
export const restaurantAPI = {
  /**
   * Get all restaurants with optional filters
   */
  getRestaurants: async (filters: RestaurantFilters = {}): Promise<PaginatedResponse<Restaurant>> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const response = await apiClient.get<PaginatedResponse<Restaurant>>(`/admin/restaurants?${params}`);
    // Backend returns paginated data directly, not wrapped in a data property
    return response.data;
  },

  /**
   * Get single restaurant
   */
  getRestaurant: async (id: number): Promise<Restaurant> => {
    try {
      const response = await apiClient.get(`/admin/restaurants/${id}`);
      
      // For single restaurant, the data is returned directly (not wrapped in data property)
      return response.data as Restaurant;
    } catch (errorRaw) {
      const error = asApiError(errorRaw);
      console.error('❌ Error fetching restaurant:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  /**
   * Create new restaurant
   */
  createRestaurant: async (restaurantData: CreateRestaurantData): Promise<Restaurant> => {
    try {
      const response = await apiClient.post('/admin/restaurants', restaurantData);
      
      // For single restaurant creation, the data might be returned directly or wrapped
      // Let's handle both cases
      return response.data.data || response.data as Restaurant;
    } catch (errorRaw) {
      const error = asApiError(errorRaw);
      console.error('❌ Error creating restaurant:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  /**
   * Update restaurant
   */
  updateRestaurant: async (id: number, updates: UpdateRestaurantData): Promise<Restaurant> => {
    try {
      const response = await apiClient.put(`/admin/restaurants/${id}`, updates);
      
      // For single restaurant updates, the data is returned directly (not wrapped in data property)
      return response.data as Restaurant;
    } catch (errorRaw) {
      const error = asApiError(errorRaw);
      console.error('❌ Error updating restaurant:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  /**
   * Delete restaurant
   */
  deleteRestaurant: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/restaurants/${id}`);
  },

  /**
   * Get restaurant statistics for admin dashboard
   */
  getRestaurantStats: async (): Promise<RestaurantStats> => {
    const response = await apiClient.get<ApiResponse<RestaurantStats>>('/admin/restaurants/stats');
    return response.data.data;
  },

  /**
   * Update restaurant status (activate/deactivate)
   */
  updateRestaurantStatus: async (id: number, status: 'active' | 'inactive'): Promise<Restaurant> => {
    try {
      
      // Convert status string to boolean for the backend
      const is_active = status === 'active';
      const response = await apiClient.patch(`/admin/restaurants/${id}/status`, { is_active });
      
      // For status updates, the data is returned directly (not wrapped in data property)
      return response.data as Restaurant;
    } catch (errorRaw) {
      const error = asApiError(errorRaw);
      console.error('❌ Error updating restaurant status:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  /**
   * Upload restaurant logo
   */
  uploadRestaurantLogo: async (id: number, file: File): Promise<{ logo_url: string }> => {
    const formData = new FormData();
    formData.append('logo', file);
    
    const response = await apiClient.post<ApiResponse<{ logo_url: string }>>(`/admin/restaurants/${id}/logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  },

  /**
   * Get restaurants by city (for analytics)
   */
  getRestaurantsByCity: async (): Promise<{ city: string; count: number }[]> => {
    const response = await apiClient.get<ApiResponse<{ city: string; count: number }[]>>('/admin/restaurants/by-city');
    return response.data.data;
  },

  /**
   * Get subscription expiry report
   */
  getSubscriptionReport: async (): Promise<{ 
    expiring_soon: Restaurant[];
    expired: Restaurant[];
    active: Restaurant[];
  }> => {
    const response = await apiClient.get<ApiResponse<{ 
      expiring_soon: Restaurant[];
      expired: Restaurant[];
      active: Restaurant[];
    }>>('/admin/restaurants/subscription-report');
    return response.data.data;
  }
};

export default restaurantAPI;