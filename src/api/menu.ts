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

// Menu API service
export const menuAPI = {
  // Category endpoints
  /**
   * Get all categories
   */
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<ApiResponse<Category[]>>('/categories');
    return response.data.data;
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
   * Get all menu items
   */
  getItems: async (filters: {
    category_id?: number;
    is_active?: boolean;
    is_available?: boolean;
  } = {}): Promise<MenuItem[]> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const response = await apiClient.get<ApiResponse<MenuItem[]>>(`/items?${params}`);
    return response.data.data;
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
