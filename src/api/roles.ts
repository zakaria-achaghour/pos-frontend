import apiClient from './client';
import type { PaginatedResponse } from './client';
import { asApiError } from '@/utils/apiError';

// API Response Types (what backend returns)
interface ApiPermission {
  id: number;
  name: string;
  pivot?: {
    role_id: number;
    permission_id: number;
  };
}

interface ApiRole {
  id: number;
  name: string;
  permissions: ApiPermission[]; // Backend returns array of objects
  users_count: number;
  created_at: string;
  updated_at: string;
}

// Role Types (what our app uses)
export interface Role {
  id: number;
  name: string;
  permissions: string[]; // Array of permission slugs
  users_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Transform API role response to app Role format
 */
function transformApiRole(apiRole: ApiRole): Role {
  return {
    ...apiRole,
    permissions: apiRole.permissions.map((p) => p.name),
  };
}

export interface CreateRoleData {
  name: string;
  permissions: string[];
}

export interface UpdateRoleData {
  name: string;
  permissions: string[];
}

export interface RoleUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

// Role API service
export const rolesAPI = {
  /**
   * Get all roles with pagination and search
   */
  getRoles: async (filters: {
    search?: string;
    per_page?: number;
    page?: number;
  } = {}): Promise<PaginatedResponse<Role>> => {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.per_page) params.append('per_page', filters.per_page.toString());
      if (filters.page) params.append('page', filters.page.toString());
      
      const response = await apiClient.get(`/admin/roles?${params}`);
      
      const apiResponse = response.data as PaginatedResponse<ApiRole>;
      
      // Transform API roles to app roles
      return {
        ...apiResponse,
        data: apiResponse.data.map(transformApiRole),
      };
    } catch (errorRaw) {
      const error = asApiError(errorRaw);
      console.error('❌ Error fetching roles:', error);
      throw error;
    }
  },

  /**
   * Get single role by ID
   */
  getRole: async (id: number): Promise<Role> => {
    try {
      const response = await apiClient.get(`/admin/roles/${id}`);
      
      const apiRole = response.data.data || response.data;
      return transformApiRole(apiRole as ApiRole);
    } catch (errorRaw) {
      const error = asApiError(errorRaw);
      console.error('❌ Error fetching role:', error);
      throw error;
    }
  },

  /**
   * Create new role
   */
  createRole: async (roleData: CreateRoleData): Promise<Role> => {
    try {
      const response = await apiClient.post('/admin/roles', roleData);
      
      const apiRole = response.data.data || response.data;
      return transformApiRole(apiRole as ApiRole);
    } catch (errorRaw) {
      const error = asApiError(errorRaw);
      console.error('❌ Error creating role:', error);
      throw error;
    }
  },

  /**
   * Update existing role
   */
  updateRole: async (id: number, updates: UpdateRoleData): Promise<Role> => {
    try {
      const response = await apiClient.patch(`/admin/roles/${id}`, updates);
      
      const apiRole = response.data.data || response.data;
      return transformApiRole(apiRole as ApiRole);
    } catch (errorRaw) {
      const error = asApiError(errorRaw);
      console.error('❌ Error updating role:', error);
      throw error;
    }
  },

  /**
   * Delete role
   */
  deleteRole: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/admin/roles/${id}`);
    } catch (errorRaw) {
      const error = asApiError(errorRaw);
      console.error('❌ Error deleting role:', error);
      throw error;
    }
  },

  /**
   * Get users assigned to a role
   */
  getRoleUsers: async (id: number): Promise<RoleUser[]> => {
    try {
      const response = await apiClient.get(`/admin/roles/${id}/users`);
      
      return response.data.data || response.data;
    } catch (errorRaw) {
      const error = asApiError(errorRaw);
      console.error('❌ Error fetching role users:', error);
      throw error;
    }
  },
};

export default rolesAPI;
