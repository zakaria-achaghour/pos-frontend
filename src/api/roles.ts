import apiClient from './client';
import type { ApiResponse, PaginatedResponse } from './client';

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
      console.log('🔍 Fetching roles with filters:', filters);
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.per_page) params.append('per_page', filters.per_page.toString());
      if (filters.page) params.append('page', filters.page.toString());
      
      const response = await apiClient.get(`/admin/roles?${params}`);
      console.log('📡 Roles API response:', response.data);
      
      const apiResponse = response.data as PaginatedResponse<ApiRole>;
      
      // Transform API roles to app roles
      return {
        ...apiResponse,
        data: apiResponse.data.map(transformApiRole),
      };
    } catch (error: any) {
      console.error('❌ Error fetching roles:', error);
      throw error;
    }
  },

  /**
   * Get single role by ID
   */
  getRole: async (id: number): Promise<Role> => {
    try {
      console.log('🔍 Fetching role with ID:', id);
      const response = await apiClient.get(`/admin/roles/${id}`);
      console.log('📡 Single role API response:', response.data);
      
      const apiRole = response.data.data || response.data;
      return transformApiRole(apiRole as ApiRole);
    } catch (error: any) {
      console.error('❌ Error fetching role:', error);
      throw error;
    }
  },

  /**
   * Create new role
   */
  createRole: async (roleData: CreateRoleData): Promise<Role> => {
    try {
      console.log('➕ Creating role:', roleData);
      const response = await apiClient.post('/admin/roles', roleData);
      console.log('📡 Create role API response:', response.data);
      
      const apiRole = response.data.data || response.data;
      return transformApiRole(apiRole as ApiRole);
    } catch (error: any) {
      console.error('❌ Error creating role:', error);
      throw error;
    }
  },

  /**
   * Update existing role
   */
  updateRole: async (id: number, updates: UpdateRoleData): Promise<Role> => {
    try {
      console.log('🔄 Updating role:', id, updates);
      const response = await apiClient.patch(`/admin/roles/${id}`, updates);
      console.log('📡 Update role API response:', response.data);
      
      const apiRole = response.data.data || response.data;
      return transformApiRole(apiRole as ApiRole);
    } catch (error: any) {
      console.error('❌ Error updating role:', error);
      throw error;
    }
  },

  /**
   * Delete role
   */
  deleteRole: async (id: number): Promise<void> => {
    try {
      console.log('🗑️ Deleting role:', id);
      await apiClient.delete(`/admin/roles/${id}`);
      console.log('✅ Role deleted successfully');
    } catch (error: any) {
      console.error('❌ Error deleting role:', error);
      throw error;
    }
  },

  /**
   * Get users assigned to a role
   */
  getRoleUsers: async (id: number): Promise<RoleUser[]> => {
    try {
      console.log('👥 Fetching users for role:', id);
      const response = await apiClient.get(`/admin/roles/${id}/users`);
      console.log('📡 Role users API response:', response.data);
      
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('❌ Error fetching role users:', error);
      throw error;
    }
  },
};

export default rolesAPI;
