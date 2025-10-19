import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuthRedux';
import { tableAPI } from '../api/tables';
import type { 
  Table, 
  TableFormData, 
  TableFilters,
  TableStatus,
  TableShape,
  CreateTableRequest,
  UpdateTableRequest
} from '../types/table';

export const useTableManagement = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });
  const [filters, setFilters] = useState<TableFilters>({});
  const [tableStats, setTableStats] = useState({
    total: 0,
    available: 0,
    occupied: 0,
    reserved: 0,
    maintenance: 0,
    totalCapacity: 0,
    occupancyRate: 0,
  });

  const { user } = useAuth();

  // Clear message after 3 seconds
  const clearMessage = useCallback(() => {
    setTimeout(() => setMessage(null), 3000);
  }, []);

  // Show message
  const showMessage = useCallback((text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setMessage({ text, type });
    clearMessage();
  }, [clearMessage]);

  // Load tables from API with server-side pagination and filtering
  const fetchTables = useCallback(async (params?: {
    page?: number;
    limit?: number;
    filters?: TableFilters;
    forceRefresh?: boolean;
  }) => {
    setLoading(true);
    try {
      // Use server-side filtering and pagination
      const response = await tableAPI.getTables({
        page: params?.page || pagination.page,
        limit: params?.limit || pagination.limit,
        filters: params?.filters || filters
      });
      
      setTables(response.tables);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total
      });
    } catch (error) {
      console.error('Error fetching tables:', error);
      showMessage('Failed to load tables', 'error');
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  // Load data when pagination changes
  useEffect(() => {
    fetchTables({ page: pagination.page, limit: pagination.limit, filters });
  }, [pagination.page, pagination.limit, fetchTables]);

  // Debounced effect for filter changes to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Reset to first page when filters change
      fetchTables({ page: 1, limit: pagination.limit, filters });
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [filters, pagination.limit, fetchTables]);

  // Use server-filtered tables directly (no client-side filtering)
  const filteredTables = tables;

  // Calculate basic statistics from loaded tables (no API call)
  const calculateTableStats = useCallback(() => {
    const currentTables = tables;
    setTableStats({
      total: currentTables.length,
      available: currentTables.filter(t => t.status === 'available').length,
      occupied: currentTables.filter(t => t.status === 'occupied').length,
      reserved: currentTables.filter(t => t.status === 'reserved').length,
      maintenance: currentTables.filter(t => t.status === 'maintenance' || t.status === 'out-of-order' || t.status === 'cleaning').length,
      totalCapacity: currentTables.reduce((sum, t) => sum + t.capacity, 0),
      occupancyRate: currentTables.length > 0 ? Math.round((currentTables.filter(t => t.status === 'occupied').length / currentTables.length) * 100) : 0,
    });
  }, [tables]);

  // Calculate stats when tables change
  useEffect(() => {
    calculateTableStats();
  }, [calculateTableStats]);

  // Create new table
  const createTable = useCallback(async (formData: TableFormData): Promise<boolean> => {
    if (!formData.number.trim()) {
      showMessage('Please enter a table number', 'error');
      return false;
    }

    setCreating(true);
    try {
      const createData: CreateTableRequest = {
        number: formData.number.trim(),
        capacity: formData.capacity,
        shape: formData.shape,
        status: formData.status || 'available',
        location: {
          section: formData.section,
          floor: formData.floor,
          ...(formData.coordinates && { coordinates: formData.coordinates })
        },
        features: formData.features || []
      };

      if (formData.description?.trim()) {
        createData.description = formData.description.trim();
      }

      const newTable = await tableAPI.createTable(createData);
      // Refresh the table list after creation
      await fetchTables({ page: pagination.page, limit: pagination.limit, filters });
      showMessage(`Table "${newTable.number}" created successfully!`, 'success');
      return true;
    } catch (error: any) {
      console.error('Error creating table:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create table';
      showMessage(errorMessage, 'error');
      return false;
    } finally {
      setCreating(false);
    }
  }, [showMessage, fetchTables, pagination.page, pagination.limit, filters]);

  // Update existing table
  const updateTable = useCallback(async (tableId: number, formData: TableFormData): Promise<boolean> => {
    const existingTable = tables.find(t => t.id === tableId);
    if (!existingTable) {
      showMessage('Table not found', 'error');
      return false;
    }

    if (!formData.number.trim()) {
      showMessage('Please enter a table number', 'error');
      return false;
    }

    setUpdating(true);
    try {
      const updateData: Partial<UpdateTableRequest> = {
        number: formData.number.trim(),
        capacity: formData.capacity,
        shape: formData.shape,
        status: formData.status,
        location: {
          section: formData.section,
          floor: formData.floor,
          ...(formData.coordinates && { coordinates: formData.coordinates })
        },
        features: formData.features || []
      };

      if (formData.description?.trim()) {
        updateData.description = formData.description.trim();
      }

      const updatedTable = await tableAPI.updateTable(tableId, updateData);
      // Refresh the table list after update
      await fetchTables({ page: pagination.page, limit: pagination.limit, filters });
      
      showMessage(`Table "${updatedTable.number}" updated successfully!`, 'success');
      return true;
    } catch (error: any) {
      console.error('Error updating table:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update table';
      showMessage(errorMessage, 'error');
      return false;
    } finally {
      setUpdating(false);
    }
  }, [tables, showMessage, fetchTables]);

  // Delete table
  const deleteTable = useCallback(async (tableId: number): Promise<boolean> => {
    const table = tables.find(t => t.id === tableId);
    if (!table) {
      showMessage('Table not found', 'error');
      return false;
    }

    if (table.status === 'occupied') {
      showMessage('Cannot delete occupied table', 'error');
      return false;
    }

    setDeleting(true);
    try {
      await tableAPI.deleteTable(tableId);
      // Refresh the table list after deletion
      await fetchTables({ page: pagination.page, limit: pagination.limit, filters });
      showMessage(`Table "${table.number}" deleted successfully!`, 'success');
      return true;
    } catch (error: any) {
      console.error('Error deleting table:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete table';
      showMessage(errorMessage, 'error');
      return false;
    } finally {
      setDeleting(false);
    }
  }, [tables, showMessage, fetchTables, pagination.page, pagination.limit, filters]);

  // Update table status
  const updateTableStatus = useCallback(async (tableId: number, newStatus: TableStatus): Promise<boolean> => {
    const table = tables.find(t => t.id === tableId);
    if (!table) {
      showMessage('Table not found', 'error');
      return false;
    }

    try {
      await tableAPI.updateTableStatus(tableId, newStatus);
      // Refresh the table list after status update
      await fetchTables({ page: pagination.page, limit: pagination.limit, filters });
      
      showMessage(`Table "${table.number}" status updated to ${newStatus}`, 'success');
      return true;
    } catch (error: any) {
      console.error('Error updating table status:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update table status';
      showMessage(errorMessage, 'error');
      return false;
    }
  }, [tables, showMessage, fetchTables, pagination.page, pagination.limit, filters]);

  // Deactivate table (set to out-of-order)
  const deactivateTable = useCallback(async (tableId: number): Promise<boolean> => {
    return updateTableStatus(tableId, 'out-of-order');
  }, [updateTableStatus]);

  // Activate table (set to available)
  const activateTable = useCallback(async (tableId: number): Promise<boolean> => {
    return updateTableStatus(tableId, 'available');
  }, [updateTableStatus]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<TableFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({});
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Update pagination
  const updatePagination = useCallback((newPagination: Partial<typeof pagination>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  // Get table by ID
  const getTableById = useCallback((id: number) => {
    return tables.find(table => table.id === id);
  }, [tables]);

  // Get status color helper
  const getStatusColor = useCallback((status: TableStatus) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-red-100 text-red-800';
      case 'reserved': return 'bg-blue-100 text-blue-800';
      case 'cleaning': return 'bg-purple-100 text-purple-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'out-of-order': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  // Get shape icon helper
  const getShapeIcon = useCallback((shape: TableShape) => {
    switch (shape) {
      case 'square': return '⬜';
      case 'round': return '⭕';
      case 'rectangular': 
      case 'rectangle': return '▭';
      default: return '⬜';
    }
  }, []);

  return {
    // State
    tables,
    filteredTables,
    loading,
    creating,
    updating,
    deleting,
    message,
    filters,
    pagination,
    tableStats,
    user,

    // Actions
    fetchTables,
    createTable,
    updateTable,
    deleteTable,
    updateTableStatus,
    deactivateTable,
    activateTable,
    updateFilters,
    resetFilters,
    updatePagination,

    // Helpers
    getTableById,
    getStatusColor,
    getShapeIcon,
    showMessage,
  };
};