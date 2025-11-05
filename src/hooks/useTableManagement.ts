import { useState, useCallback, useEffect } from 'react';
import { tableAPI } from '../api/tables';
import type { 
  Table, 
  TableFormData, 
  TableStatus,
  CreateTableRequest,
  UpdateTableRequest
} from '../types/table';
import type { PaginationInfo, UseResourceManagementReturn } from '@/types/components';

export type TableFilter = 'all' | TableStatus;

interface TableStats {
  total: number;
  available: number;
  occupied: number;
  reserved: number;
  maintenance: number;
  totalCapacity: number;
  occupancyRate: number;
}

interface UseTableManagementReturn extends UseResourceManagementReturn<
  Table,
  TableFormData,
  TableStatus,
  TableFilter,
  TableStats
> {
  // Table-specific extensions and aliases
  tables: Table[];
  filteredTables: Table[];
  selectedTable: Table | null;
  editingTable: Table | null;
  statusFilter: TableFilter;
  shapeFilter: string;
  sectionFilter: string;
  minCapacityFilter: number | null;
  maxCapacityFilter: number | null;
  setStatusFilter: (filter: TableFilter) => void;
  setShapeFilter: (shape: string) => void;
  setSectionFilter: (section: string) => void;
  setMinCapacityFilter: (capacity: number | null) => void;
  setMaxCapacityFilter: (capacity: number | null) => void;
  setSelectedTable: (table: Table | null) => void;
  setEditingTable: (table: Table | null) => void;
  fetchTables: (page?: number) => Promise<void>;
  createTable: (data: TableFormData) => Promise<void>;
  updateTable: (id: number, data: Partial<TableFormData>) => Promise<void>;
  deleteTable: (id: number) => Promise<void>;
  updateTableStatus: (id: number, status: TableStatus) => Promise<void>;
  tableStats: TableStats;
  setPerPage: (perPage: number) => void;
}

export const useTableManagement = (initialPerPage: number = 5): UseTableManagementReturn => {
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  
  // UI State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<TableFilter>('all');
  const [shapeFilter, setShapeFilter] = useState<string>('all');
  const [sectionFilter, setSectionFilter] = useState<string>('');
  const [minCapacityFilter, setMinCapacityFilter] = useState<number | null>(null);
  const [maxCapacityFilter, setMaxCapacityFilter] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    lastPage: 1,
    perPage: initialPerPage,
    total: 0,
  });
  const [tableStats, setTableStats] = useState<TableStats>({
    total: 0,
    available: 0,
    occupied: 0,
    reserved: 0,
    maintenance: 0,
    totalCapacity: 0,
    occupancyRate: 0,
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

  const clearError = () => setError(null);
  const clearSuccessMessage = () => setSuccessMessage(null);

  // Load tables from API with server-side pagination and filtering
  const fetchTables = useCallback(async (page?: number) => {
    setLoading(true);
    setError(null);
    try {
      const currentPage = page || pagination.currentPage;
      
      // Build API params with filters
      const apiParams: any = {
        page: currentPage,
        per_page: pagination.perPage,
      };
      
      // Add status filter if not 'all'
      if (statusFilter !== 'all') {
        apiParams.status = statusFilter;
      }
      
      // Add shape filter if not 'all'
      if (shapeFilter && shapeFilter !== 'all') {
        apiParams.shape = shapeFilter;
      }
      
      // Add section filter if provided
      if (sectionFilter && sectionFilter.trim()) {
        apiParams.section = sectionFilter.trim();
      }
      
      // Add capacity filters
      if (minCapacityFilter !== null && minCapacityFilter > 0) {
        apiParams.min_capacity = minCapacityFilter;
      }
      
      if (maxCapacityFilter !== null && maxCapacityFilter > 0) {
        apiParams.max_capacity = maxCapacityFilter;
      }
      
      const response = await tableAPI.getTables(apiParams);

      const tablesData = response.data || [];

      setTables(tablesData);
      setPagination({
        currentPage: Number(response.current_page ?? currentPage) || currentPage,
        lastPage: Number(response.last_page ?? 1) || 1,
        perPage: Number(response.per_page ?? tablesData.length) || tablesData.length || pagination.perPage,
        total: Number(response.total ?? tablesData.length) || tablesData.length,
      });
      
      // Calculate stats
      setTableStats({
        total: response.total || tablesData.length,
        available: tablesData.filter((t: Table) => t.status === 'available').length,
        occupied: tablesData.filter((t: Table) => t.status === 'occupied').length,
        reserved: tablesData.filter((t: Table) => t.status === 'reserved').length,
        maintenance: tablesData.filter((t: Table) => ['maintenance', 'out-of-order', 'cleaning'].includes(t.status || '')).length,
        totalCapacity: tablesData.reduce((sum: number, t: Table) => sum + (t.capacity || 0), 0),
        occupancyRate: tablesData.length > 0 ? Math.round((tablesData.filter((t: Table) => t.status === 'occupied').length / tablesData.length) * 100) : 0,
      });
    } catch (err: any) {
      console.error('Error fetching tables:', err);
      setError(err.message || 'Failed to load tables');
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.perPage, statusFilter, shapeFilter, sectionFilter, minCapacityFilter, maxCapacityFilter]);

  // Load data on mount and when filter changes
  useEffect(() => {
    fetchTables(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, shapeFilter, sectionFilter, minCapacityFilter, maxCapacityFilter]);

  // Filtered tables (client-side backup if needed)
  const filteredTables = tables;

  // Pagination helper
  const goToPage = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    fetchTables(page);
  };

  // Set items per page
  const setPerPage = (perPage: number) => {
    setPagination(prev => ({ ...prev, perPage, currentPage: 1 }));
    // Will trigger refetch via useEffect
  };

  // Create new table
  const createTable = useCallback(async (formData: TableFormData): Promise<void> => {
    if (!formData.number.trim()) {
      setError('Please enter a table number');
      return;
    }

    setLoading(true);
    setError(null);
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
      setSuccessMessage(`Table "${newTable.number}" created successfully!`);
      await fetchTables(pagination.currentPage);
    } catch (error: any) {
      console.error('Error creating table:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create table';
      setError(errorMessage);
      if (error.response?.data?.errors) {
        setValidationErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  }, [fetchTables, pagination.currentPage]);

  // Update existing table
  const updateTable = useCallback(async (tableId: number, formData: Partial<TableFormData>): Promise<void> => {
    const existingTable = tables.find(t => t.id === tableId);
    if (!existingTable) {
      setError('Table not found');
      return;
    }

    if (formData.number && !formData.number.trim()) {
      setError('Please enter a table number');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const updateData: Partial<UpdateTableRequest> = {};
      
      if (formData.number) updateData.number = formData.number.trim();
      if (formData.capacity) updateData.capacity = formData.capacity;
      if (formData.shape) updateData.shape = formData.shape;
      if (formData.status) updateData.status = formData.status;
      if (formData.section || formData.floor || formData.coordinates) {
        updateData.location = {
          section: formData.section || (existingTable.location as any)?.section || '',
          floor: formData.floor || (existingTable.location as any)?.floor || '',
          ...(formData.coordinates && { coordinates: formData.coordinates })
        };
      }
      if (formData.features) updateData.features = formData.features;
      if (formData.description?.trim()) updateData.description = formData.description.trim();

      const updatedTable = await tableAPI.updateTable(tableId, updateData);
      setSuccessMessage(`Table "${updatedTable.number}" updated successfully!`);
      await fetchTables(pagination.currentPage);
    } catch (error: any) {
      console.error('Error updating table:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update table';
      setError(errorMessage);
      if (error.response?.data?.errors) {
        setValidationErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  }, [tables, fetchTables, pagination.currentPage]);

  // Delete table
  const deleteTable = useCallback(async (tableId: number): Promise<void> => {
    const table = tables.find(t => t.id === tableId);
    if (!table) {
      setError('Table not found');
      return;
    }

    if (table.status === 'occupied') {
      setError('Cannot delete occupied table');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await tableAPI.deleteTable(tableId);
      setSuccessMessage(`Table "${table.number}" deleted successfully!`);
      await fetchTables(pagination.currentPage);
    } catch (error: any) {
      console.error('Error deleting table:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete table';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [tables, fetchTables, pagination.currentPage]);

  // Update table status
  const updateTableStatus = useCallback(async (tableId: number, newStatus: TableStatus): Promise<void> => {
    const table = tables.find(t => t.id === tableId);
    if (!table) {
      setError('Table not found');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await tableAPI.updateTableStatus(tableId, newStatus);
      setSuccessMessage(`Table "${table.number}" status updated to ${newStatus}`);
      await fetchTables(pagination.currentPage);
    } catch (error: any) {
      console.error('Error updating table status:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update table status';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [tables, fetchTables, pagination.currentPage]);

  // Bulk update status
  const bulkUpdateStatus = async (ids: number[], status: TableStatus): Promise<void> => {
    if (ids.length === 0) return;
    
    setLoading(true);
    setError(null);
    try {
      await Promise.all(ids.map(id => updateTableStatus(id, status)));
      setSuccessMessage(`Successfully updated ${ids.length} table(s)`);
      clearSelection();
    } catch (err: any) {
      setError(err.message || 'Failed to update tables');
    } finally {
      setLoading(false);
    }
  };

  // Selection management
  const toggleItemSelection = (id: number) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  return {
    // Base properties
    items: tables,
    filteredItems: filteredTables,
    selectedItem: selectedTable,
    editingItem: editingTable,
    filter: statusFilter,
    selectedItems,
    
    // Aliases for backward compatibility
    tables,
    filteredTables,
    selectedTable,
    editingTable,
    statusFilter,
    shapeFilter,
    sectionFilter,
    minCapacityFilter,
    maxCapacityFilter,
    
    // UI State
    viewMode,
    loading,
    error,
    successMessage,
    validationErrors,
    pagination,
    
    // Actions - base
    fetchItems: fetchTables,
    createItem: createTable,
    updateItem: updateTable,
    deleteItem: deleteTable,
    updateItemStatus: updateTableStatus,
    bulkUpdateStatus,
    goToPage,
    
    // Actions - aliases
    fetchTables,
    createTable,
    updateTable,
    deleteTable,
    updateTableStatus,
    
    // UI Actions - base
    setViewMode,
    setFilter: setStatusFilter,
    setSelectedItem: setSelectedTable,
    setEditingItem: setEditingTable,
    clearError,
    clearSuccessMessage,
    toggleItemSelection,
    clearSelection,
    setPerPage,
    
    // UI Actions - aliases
    setStatusFilter,
    setShapeFilter,
    setSectionFilter,
    setMinCapacityFilter,
    setMaxCapacityFilter,
    setSelectedTable,
    setEditingTable,
    
    // Stats
    stats: tableStats,
    tableStats,
  };
};