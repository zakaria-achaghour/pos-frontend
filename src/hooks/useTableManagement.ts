import { useState, useCallback } from 'react';
import { useAuth } from './useAuthRedux';
import type { 
  Table as BaseTable, 
  TableFormData as BaseTableFormData, 
  TableFilters as BaseTableFilters,
  TableStatus,
  TableShape
} from '../types/table';

// Extended interfaces for backward compatibility with current implementation
export interface Table extends Omit<BaseTable, 'number' | 'location' | 'features' | 'currentOrder'> {
  name: string; // Using name instead of number for compatibility
  currentOrder?: {
    id: number;
    total: number;
    items: number;
    status: 'preparing' | 'ready' | 'served';
    time: string;
  };
}

export interface TableFormData extends Omit<BaseTableFormData, 'number' | 'section' | 'floor' | 'features'> {
  name: string; // Using name instead of number for compatibility
}

export interface TableFilters extends Omit<BaseTableFilters, 'section' | 'floor' | 'assignedWaiter'> {
  search: string;
  status: TableStatus | 'all';
  shape: TableShape | 'all';
}

// Mock initial data
const initialTables: Table[] = [
  { id: 1, name: 'Table 1', capacity: 4, status: 'available', shape: 'square' },
  { id: 2, name: 'Table 2', capacity: 2, status: 'occupied', shape: 'round' },
  { id: 3, name: 'Table 3', capacity: 6, status: 'available', shape: 'rectangle' },
  { id: 4, name: 'Table 4', capacity: 4, status: 'reserved', shape: 'square' },
  { id: 5, name: 'Table 5', capacity: 8, status: 'maintenance', shape: 'rectangle' },
  { id: 6, name: 'Table 6', capacity: 2, status: 'available', shape: 'round' },
];

export const useTableManagement = () => {
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [filters, setFilters] = useState<TableFilters>({
    search: '',
    status: 'all',
    shape: 'all'
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

  // Filter tables based on current filters
  const filteredTables = tables.filter(table => {
    const matchesSearch = table.name.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = filters.status === 'all' || table.status === filters.status;
    const matchesShape = filters.shape === 'all' || table.shape === filters.shape;
    
    return matchesSearch && matchesStatus && matchesShape;
  });

  // Get table statistics
  const tableStats = {
    total: tables.length,
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
    maintenance: tables.filter(t => t.status === 'maintenance').length,
    totalCapacity: tables.reduce((sum, t) => sum + t.capacity, 0),
    occupancyRate: Math.round((tables.filter(t => t.status === 'occupied').length / tables.length) * 100),
  };

  // Create new table
  const createTable = useCallback(async (formData: TableFormData): Promise<boolean> => {
    if (!formData.name.trim()) {
      showMessage('Please enter a table name', 'error');
      return false;
    }

    // Check for duplicate names
    if (tables.some(t => t.name.toLowerCase() === formData.name.toLowerCase())) {
      showMessage('A table with this name already exists', 'error');
      return false;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newTable: Table = {
        id: Math.max(...tables.map(t => t.id), 0) + 1,
        name: formData.name.trim(),
        capacity: formData.capacity,
        status: 'available',
        shape: formData.shape,
        description: formData.description?.trim() || undefined
      };

      setTables(prev => [...prev, newTable]);
      showMessage(`Table "${newTable.name}" created successfully!`, 'success');
      return true;
    } catch (error) {
      showMessage('Failed to create table', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [tables, showMessage]);

  // Update existing table
  const updateTable = useCallback(async (tableId: number, formData: TableFormData): Promise<boolean> => {
    const existingTable = tables.find(t => t.id === tableId);
    if (!existingTable) {
      showMessage('Table not found', 'error');
      return false;
    }

    if (!formData.name.trim()) {
      showMessage('Please enter a table name', 'error');
      return false;
    }

    // Check for duplicate names (excluding current table)
    if (tables.some(t => t.id !== tableId && t.name.toLowerCase() === formData.name.toLowerCase())) {
      showMessage('A table with this name already exists', 'error');
      return false;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedTable: Table = {
        ...existingTable,
        name: formData.name.trim(),
        capacity: formData.capacity,
        shape: formData.shape,
        description: formData.description?.trim() || undefined
      };

      setTables(prev => prev.map(table => 
        table.id === tableId ? updatedTable : table
      ));
      
      showMessage(`Table "${updatedTable.name}" updated successfully!`, 'success');
      return true;
    } catch (error) {
      showMessage('Failed to update table', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [tables, showMessage]);

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

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setTables(prev => prev.filter(t => t.id !== tableId));
      showMessage(`Table "${table.name}" deleted successfully!`, 'success');
      return true;
    } catch (error) {
      showMessage('Failed to delete table', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [tables, showMessage]);

  // Update table status
  const updateTableStatus = useCallback(async (tableId: number, newStatus: Table['status']): Promise<boolean> => {
    const table = tables.find(t => t.id === tableId);
    if (!table) {
      showMessage('Table not found', 'error');
      return false;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setTables(prev => prev.map(t => 
        t.id === tableId ? { ...t, status: newStatus } : t
      ));
      
      showMessage(`Table "${table.name}" status updated to ${newStatus}`, 'success');
      return true;
    } catch (error) {
      showMessage('Failed to update table status', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [tables, showMessage]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<TableFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      status: 'all',
      shape: 'all'
    });
  }, []);

  // Get table by ID
  const getTableById = useCallback((id: number) => {
    return tables.find(table => table.id === id);
  }, [tables]);

  // Get status color helper
  const getStatusColor = useCallback((status: Table['status']) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-red-100 text-red-800';
      case 'reserved': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  // Get shape icon helper
  const getShapeIcon = useCallback((shape: Table['shape']) => {
    switch (shape) {
      case 'square': return '⬜';
      case 'round': return '⭕';
      case 'rectangle': return '▭';
      default: return '⬜';
    }
  }, []);

  return {
    // State
    tables,
    filteredTables,
    loading,
    message,
    filters,
    tableStats,
    user,

    // Actions
    createTable,
    updateTable,
    deleteTable,
    updateTableStatus,
    updateFilters,
    resetFilters,

    // Helpers
    getTableById,
    getStatusColor,
    getShapeIcon,
    showMessage,
  };
};