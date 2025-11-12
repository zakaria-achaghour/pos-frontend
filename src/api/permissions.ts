import apiClient from './client';
import type { ApiResponse, PaginatedResponse } from './client';

// Permission Types
export interface Permission {
  id: number;
  name: string; // Permission slug like "manage-menu"
  created_at: string;
  updated_at: string;
}

export interface CreatePermissionData {
  name: string;
}

export interface UpdatePermissionData {
  name: string;
}

// Permission API service
export const permissionsAPI = {
  /**
   * Get all permissions with optional search and pagination
   * Omit per_page to get full catalog for multi-select components
   */
  getPermissions: async (filters: {
    search?: string;
    per_page?: number;
    page?: number;
  } = {}): Promise<PaginatedResponse<Permission> | Permission[]> => {
    try {
      console.log('🔍 Fetching permissions with filters:', filters);
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.per_page) params.append('per_page', filters.per_page.toString());
      if (filters.page) params.append('page', filters.page.toString());
      
      const response = await apiClient.get(`/admin/permissions?${params}`);
      console.log('📡 Permissions API response:', response.data);
      
      // If no per_page, return full array for multi-select
      if (!filters.per_page && Array.isArray(response.data)) {
        return response.data as Permission[];
      }
      
      return response.data as PaginatedResponse<Permission>;
    } catch (error: any) {
      console.error('❌ Error fetching permissions:', error);
      throw error;
    }
  },

  /**
   * Get single permission by ID
   */
  getPermission: async (id: number): Promise<Permission> => {
    try {
      console.log('🔍 Fetching permission with ID:', id);
      const response = await apiClient.get(`/admin/permissions/${id}`);
      console.log('📡 Single permission API response:', response.data);
      
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('❌ Error fetching permission:', error);
      throw error;
    }
  },

  /**
   * Create new permission
   */
  createPermission: async (permissionData: CreatePermissionData): Promise<Permission> => {
    try {
      console.log('➕ Creating permission:', permissionData);
      const response = await apiClient.post('/admin/permissions', permissionData);
      console.log('📡 Create permission API response:', response.data);
      
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('❌ Error creating permission:', error);
      throw error;
    }
  },

  /**
   * Update existing permission
   */
  updatePermission: async (id: number, updates: UpdatePermissionData): Promise<Permission> => {
    try {
      console.log('🔄 Updating permission:', id, updates);
      const response = await apiClient.patch(`/admin/permissions/${id}`, updates);
      console.log('📡 Update permission API response:', response.data);
      
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('❌ Error updating permission:', error);
      throw error;
    }
  },

  /**
   * Delete permission
   */
  deletePermission: async (id: number): Promise<void> => {
    try {
      console.log('🗑️ Deleting permission:', id);
      await apiClient.delete(`/admin/permissions/${id}`);
      console.log('✅ Permission deleted successfully');
    } catch (error: any) {
      console.error('❌ Error deleting permission:', error);
      throw error;
    }
  },
};

export default permissionsAPI;
