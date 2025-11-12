import { useState, useEffect } from 'react';
import { rolesAPI, type Role, type RoleUser } from '../api/roles';
import { permissionsAPI, type Permission } from '../api/permissions';
import type { RoleFormData } from '../types/roles';

interface PaginationInfo {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
}

export function useRoleManagement() {
  // Data state
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleUsers, setRoleUsers] = useState<RoleUser[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
    total: 0,
  });

  // Auto-clear messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Fetch all available permissions (for role form)
  const fetchAvailablePermissions = async () => {
    try {
      console.log('🔍 Fetching all permissions for role form');
      const response = await permissionsAPI.getPermissions({});
      const permissions = Array.isArray(response) ? response : response.data;
      setAvailablePermissions(permissions);
    } catch (err: any) {
      console.error('❌ Error fetching permissions:', err);
      // Don't set error here, it's a background operation
    }
  };

  // Fetch roles with pagination and search
  const fetchRoles = async (page: number = pagination.currentPage) => {
    setLoading(true);
    setError(null);
    
    try {
      const filters: {
        page: number;
        per_page: number;
        search?: string;
      } = {
        page,
        per_page: pagination.perPage,
      };
      
      if (searchQuery) {
        filters.search = searchQuery;
      }
      
      const response = await rolesAPI.getRoles(filters);
      setRoles(response.data);
      setPagination({
        currentPage: Number(response.current_page ?? page) || page,
        lastPage: Number(response.last_page ?? 1) || 1,
        perPage: Number(response.per_page ?? response.data.length) || pagination.perPage,
        total: Number(response.total ?? response.data.length) || response.data.length,
      });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch roles';
      if (err.response?.status === 403) {
        setError('Access denied. SuperAdmin privileges required.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch users for a specific role
  const fetchRoleUsers = async (roleId: number) => {
    setLoading(true);
    try {
      const users = await rolesAPI.getRoleUsers(roleId);
      setRoleUsers(users);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch role users';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Create new role
  const createRole = async (formData: RoleFormData) => {
    setLoading(true);
    setError(null);
    setValidationErrors({});

    try {
      const createData = {
        name: formData.name,
        permissions: formData.permissions,
      };

      await rolesAPI.createRole(createData);
      await fetchRoles(1); // Refresh list and go to first page
      setSuccessMessage('Role created successfully!');
    } catch (err: any) {
      if (err.response?.status === 422 && err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
        setError(err.response.data.message || 'Validation errors occurred');
      } else if (err.response?.status === 403) {
        setError('Access denied. SuperAdmin privileges required.');
      } else {
        setError(err.response?.data?.message || 'Failed to create role');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update role
  const updateRole = async (id: number, formData: RoleFormData) => {
    setLoading(true);
    setError(null);
    setValidationErrors({});

    try {
      const updateData = {
        name: formData.name,
        permissions: formData.permissions,
      };

      await rolesAPI.updateRole(id, updateData);
      await fetchRoles(pagination.currentPage); // Refresh list, stay on current page
      setSuccessMessage('Role updated successfully!');
      setEditingRole(null);
    } catch (err: any) {
      if (err.response?.status === 422 && err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
        setError(err.response.data.message || 'Validation errors occurred');
      } else if (err.response?.status === 403) {
        setError('Access denied. SuperAdmin privileges required.');
      } else {
        setError(err.response?.data?.message || 'Failed to update role');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete role
  const deleteRole = async (id: number) => {
    setLoading(true);
    try {
      await rolesAPI.deleteRole(id);

      // Calculate next page if current page will be empty
      const anticipatedTotal = Math.max(0, pagination.total - 1);
      const previousItems = (pagination.currentPage - 1) * pagination.perPage;
      const itemsRemainingOnPage = anticipatedTotal - previousItems;
      const nextPage =
        itemsRemainingOnPage > 0 || pagination.currentPage === 1
          ? pagination.currentPage
          : pagination.currentPage - 1;

      await fetchRoles(Math.max(1, nextPage));
      setSuccessMessage('Role deleted successfully!');
    } catch (err: any) {
      if (err.response?.status === 422) {
        // Role still has users or is SuperAdmin/Owner
        setError(err.response.data.message || 'Cannot delete this role. Please reassign staff first.');
      } else if (err.response?.status === 403) {
        setError('Access denied. SuperAdmin privileges required.');
      } else {
        setError(err.response?.data?.message || 'Failed to delete role');
      }
    } finally {
      setLoading(false);
    }
  };

  // Pagination
  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.lastPage || page === pagination.currentPage) {
      return;
    }
    fetchRoles(page);
  };

  // Search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Debounce would be better in production
    fetchRoles(1);
  };

  // Clear error
  const clearError = () => {
    setError(null);
    setValidationErrors({});
  };

  // Clear success message
  const clearSuccessMessage = () => {
    setSuccessMessage(null);
  };

  // Load roles and permissions on mount
  useEffect(() => {
    fetchRoles();
    fetchAvailablePermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    // Data
    roles,
    selectedRole,
    editingRole,
    roleUsers,
    availablePermissions,
    
    // UI State
    loading,
    error,
    successMessage,
    validationErrors,
    pagination,
    searchQuery,
    
    // Actions
    fetchRoles,
    fetchRoleUsers,
    fetchAvailablePermissions,
    createRole,
    updateRole,
    deleteRole,
    goToPage,
    handleSearch,
    
    // UI Actions
    setSelectedRole,
    setEditingRole,
    clearError,
    clearSuccessMessage,
  };
}
