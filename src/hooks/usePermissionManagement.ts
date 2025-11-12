import { useState, useEffect } from 'react';
import { permissionsAPI, type Permission } from '../api/permissions';
import type { PermissionFormData } from '../types/roles';

interface PaginationInfo {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
}

export function usePermissionManagement() {
  // Data state
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    lastPage: 1,
    perPage: 15,
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

  // Fetch permissions with pagination and search
  const fetchPermissions = async (page: number = pagination.currentPage) => {
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
      
      const response = await permissionsAPI.getPermissions(filters);
      
      // Handle both paginated and array response
      if (Array.isArray(response)) {
        setPermissions(response);
        setPagination({
          currentPage: 1,
          lastPage: 1,
          perPage: response.length,
          total: response.length,
        });
      } else {
        setPermissions(response.data);
        setPagination({
          currentPage: Number(response.current_page ?? page) || page,
          lastPage: Number(response.last_page ?? 1) || 1,
          perPage: Number(response.per_page ?? response.data.length) || pagination.perPage,
          total: Number(response.total ?? response.data.length) || response.data.length,
        });
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch permissions';
      if (err.response?.status === 403) {
        setError('Access denied. SuperAdmin privileges required.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Create new permission
  const createPermission = async (formData: PermissionFormData) => {
    setLoading(true);
    setError(null);
    setValidationErrors({});

    try {
      const createData = {
        name: formData.name,
      };

      await permissionsAPI.createPermission(createData);
      await fetchPermissions(1); // Refresh list and go to first page
      setSuccessMessage('Permission created successfully!');
    } catch (err: any) {
      if (err.response?.status === 422 && err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
        setError(err.response.data.message || 'Validation errors occurred');
      } else if (err.response?.status === 403) {
        setError('Access denied. SuperAdmin privileges required.');
      } else {
        setError(err.response?.data?.message || 'Failed to create permission');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update permission
  const updatePermission = async (id: number, formData: PermissionFormData) => {
    setLoading(true);
    setError(null);
    setValidationErrors({});

    try {
      const updateData = {
        name: formData.name,
      };

      await permissionsAPI.updatePermission(id, updateData);
      await fetchPermissions(pagination.currentPage); // Refresh list, stay on current page
      setSuccessMessage('Permission updated successfully!');
      setEditingPermission(null);
    } catch (err: any) {
      if (err.response?.status === 422 && err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
        setError(err.response.data.message || 'Validation errors occurred');
      } else if (err.response?.status === 403) {
        setError('Access denied. SuperAdmin privileges required.');
      } else {
        setError(err.response?.data?.message || 'Failed to update permission');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete permission
  const deletePermission = async (id: number) => {
    setLoading(true);
    try {
      await permissionsAPI.deletePermission(id);

      // Calculate next page if current page will be empty
      const anticipatedTotal = Math.max(0, pagination.total - 1);
      const previousItems = (pagination.currentPage - 1) * pagination.perPage;
      const itemsRemainingOnPage = anticipatedTotal - previousItems;
      const nextPage =
        itemsRemainingOnPage > 0 || pagination.currentPage === 1
          ? pagination.currentPage
          : pagination.currentPage - 1;

      await fetchPermissions(Math.max(1, nextPage));
      setSuccessMessage('Permission deleted successfully!');
    } catch (err: any) {
      if (err.response?.status === 422) {
        // Permission still bound to roles
        setError(err.response.data.message || 'Cannot delete this permission. It is still assigned to roles.');
      } else if (err.response?.status === 403) {
        setError('Access denied. SuperAdmin privileges required.');
      } else {
        setError(err.response?.data?.message || 'Failed to delete permission');
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
    fetchPermissions(page);
  };

  // Search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Debounce would be better in production
    fetchPermissions(1);
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

  // Load permissions on mount
  useEffect(() => {
    fetchPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    // Data
    permissions,
    selectedPermission,
    editingPermission,
    
    // UI State
    loading,
    error,
    successMessage,
    validationErrors,
    pagination,
    searchQuery,
    
    // Actions
    fetchPermissions,
    createPermission,
    updatePermission,
    deletePermission,
    goToPage,
    handleSearch,
    
    // UI Actions
    setSelectedPermission,
    setEditingPermission,
    clearError,
    clearSuccessMessage,
  };
}
