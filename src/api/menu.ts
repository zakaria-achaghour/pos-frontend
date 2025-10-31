import apiClient from './client';
import type { ApiResponse } from './client';

// Menu types
export interface Category {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: number;
  category_id: number;
  category: Category;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  is_active: boolean;
  is_available: boolean;
  image_url?: string;
  preparation_time?: number; // in minutes
  allergens?: string[];
  ingredients?: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {}

export interface CreateMenuItemData {
  category_id: number;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  is_active?: boolean;
  is_available?: boolean;
  preparation_time?: number;
  allergens?: string[];
  ingredients?: string[];
  sort_order?: number;
}

export interface UpdateMenuItemData extends Partial<CreateMenuItemData> {}

// API Filter interfaces
export interface CategoryFilters {
  searchTerm?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

export interface MenuItemFilters {
  category_id?: number;
  is_active?: boolean;
  is_available?: boolean;
  searchTerm?: string;
  page?: number;
  limit?: number;
}

// API Response interfaces
export interface CategoriesResponse {
  data: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MenuItemsResponse {
  data: MenuItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Menu API service
export const menuAPI = {
  // Category endpoints
  /**
   * Get all categories with pagination and filters
   */
  getCategories: async (filters: CategoryFilters = {}): Promise<CategoriesResponse> => {
    const params = new URLSearchParams();
    
    if (filters.searchTerm) params.append('search', filters.searchTerm);
    if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await apiClient.get<ApiResponse<CategoriesResponse>>(`/categories?${params}`);
    
    console.log('Raw API response:', response.data);
    
    // Handle both response formats
    if (response.data.data && typeof response.data.data === 'object' && 'data' in response.data.data) {
      const result = response.data.data as CategoriesResponse;
      console.log('Returning paginated response:', result);
      return result;
    }
    
    // Fallback: if data is array directly (calculate pagination manually)
    const categories = Array.isArray(response.data.data) ? response.data.data as Category[] : [];
    const limit = filters.limit || 50;
    const total = categories.length;
    const totalPages = Math.ceil(total / limit);
    
    const result = {
      data: categories,
      total: total,
      page: filters.page || 1,
      limit: limit,
      totalPages: totalPages
    };
    
    console.log('Returning fallback response:', result);
    return result;
  },

  /**
   * Get single category
   */
  getCategory: async (id: number): Promise<Category> => {
    const response = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
    return response.data.data;
  },

  /**
   * Create new category
   */
  createCategory: async (categoryData: CreateCategoryData): Promise<Category> => {
    const response = await apiClient.post<ApiResponse<Category>>('/categories', categoryData);
    return response.data.data;
  },

  /**
   * Update category
   */
  updateCategory: async (id: number, updates: UpdateCategoryData): Promise<Category> => {
    const response = await apiClient.put<ApiResponse<Category>>(`/categories/${id}`, updates);
    return response.data.data;
  },

  /**
   * Delete category
   */
  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },

  // Menu Item endpoints
  /**
   * Get all menu items with pagination and filters
   */
  getItems: async (filters: MenuItemFilters = {}): Promise<MenuItemsResponse> => {
    const params = new URLSearchParams();
    
    if (filters.category_id) params.append('category_id', filters.category_id.toString());
    if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());
    if (filters.is_available !== undefined) params.append('is_available', filters.is_available.toString());
    if (filters.searchTerm) params.append('search', filters.searchTerm);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    
    const response = await apiClient.get<ApiResponse<MenuItemsResponse>>(`/items?${params}`);
    
    // Handle both response formats
    if (response.data.data && typeof response.data.data === 'object' && 'data' in response.data.data) {
      return response.data.data as MenuItemsResponse;
    }
    
    // Fallback: if data is array directly
    const items = Array.isArray(response.data.data) ? response.data.data as MenuItem[] : [];
    return {
      data: items,
      total: items.length,
      page: filters.page || 1,
      limit: filters.limit || 50,
      totalPages: 1
    };
  },

  /**
   * Get single menu item
   */
  getItem: async (id: number): Promise<MenuItem> => {
    const response = await apiClient.get<ApiResponse<MenuItem>>(`/items/${id}`);
    return response.data.data;
  },

  /**
   * Create new menu item
   */
  createItem: async (itemData: CreateMenuItemData): Promise<MenuItem> => {
    const response = await apiClient.post<ApiResponse<MenuItem>>('/items', itemData);
    return response.data.data;
  },

  /**
   * Update menu item
   */
  updateItem: async (id: number, updates: UpdateMenuItemData): Promise<MenuItem> => {
    const response = await apiClient.put<ApiResponse<MenuItem>>(`/items/${id}`, updates);
    return response.data.data;
  },

  /**
   * Delete menu item
   */
  deleteItem: async (id: number): Promise<void> => {
    await apiClient.delete(`/items/${id}`);
  },

  /**
   * Upload menu item image
   */
  uploadItemImage: async (id: number, file: File): Promise<{ image_url: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await apiClient.post<ApiResponse<{ image_url: string }>>(`/items/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  }
};

export default menuAPI;
