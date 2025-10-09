import apiClient from './client';
import type { ApiResponse, PaginatedResponse } from './client';

// Restaurant types
export interface Restaurant {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  address: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  status?: 'active' | 'inactive';
  license_number?: string;
  tax_number?: string;
  owner_name?: string;
  owner_email?: string;
  owner_phone?: string;
  subscription_plan?: string;
  subscription_status?: 'active' | 'expired' | 'trial';
  subscription_expires_at?: string;
  timezone?: string;
  currency?: string;
  tax_rate?: string;
  is_active?: boolean;
  subdomain?: string;
  settings?: {
    theme?: string;
    language?: string;
    receipt_footer?: string;
    auto_print_kitchen?: boolean;
  };
  users?: Array<{
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    created_at: string;
    updated_at: string;
    restaurant_id: number;
  }>;
  created_at?: string;
  updated_at?: string;
}

export interface CreateRestaurantData {
  name: string;
  description?: string;
  address: string;
  city: string;
  country: string;
  phone?: string;
  email?: string;
  website?: string;
  license_number?: string;
  tax_number?: string;
  owner_name: string;
  owner_email: string;
  owner_phone?: string;
  subscription_plan?: string;
  timezone?: string;
  currency?: string;
}

export interface UpdateRestaurantData extends Partial<CreateRestaurantData> {
  status?: 'active' | 'inactive';
  subscription_status?: 'active' | 'expired' | 'trial';
}

export interface RestaurantStats {
  total_restaurants: number;
  active_restaurants: number;
  inactive_restaurants: number;
  new_this_month: number;
  revenue_this_month: number;
  subscription_expiring_soon: number;
}

export interface RestaurantFilters {
  search?: string;
  status?: 'active' | 'inactive';
  city?: string;
  subscription_status?: 'active' | 'expired' | 'trial';
  page?: number;
  per_page?: number;
}

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
      console.log('🔍 Fetching restaurant with ID:', id);
      const response = await apiClient.get(`/admin/restaurants/${id}`);
      console.log('📡 Single restaurant API response:', response.data);
      
      // For single restaurant, the data is returned directly (not wrapped in data property)
      return response.data as Restaurant;
    } catch (error: any) {
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
      console.log('➕ Creating new restaurant:', restaurantData);
      const response = await apiClient.post('/admin/restaurants', restaurantData);
      console.log('📡 Create restaurant API response:', response.data);
      
      // For single restaurant creation, the data might be returned directly or wrapped
      // Let's handle both cases
      return response.data.data || response.data as Restaurant;
    } catch (error: any) {
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
      console.log('🔄 Updating restaurant with ID:', id, 'Data:', updates);
      const response = await apiClient.put(`/admin/restaurants/${id}`, updates);
      console.log('📡 Update restaurant API response:', response.data);
      
      // For single restaurant updates, the data is returned directly (not wrapped in data property)
      return response.data as Restaurant;
    } catch (error: any) {
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
      console.log('🔄 Updating restaurant status for ID:', id, 'Status:', status);
      
      // Convert status string to boolean for the backend
      const is_active = status === 'active';
      const response = await apiClient.patch(`/admin/restaurants/${id}/status`, { is_active });
      console.log('📡 Status update API response:', response.data);
      
      // For status updates, the data is returned directly (not wrapped in data property)
      return response.data as Restaurant;
    } catch (error: any) {
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