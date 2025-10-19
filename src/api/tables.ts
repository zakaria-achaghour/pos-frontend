import apiClient from './client';
import type { ApiResponse, PaginatedResponse } from './client';
import type { 
  Table, 
  CreateTableRequest, 
  UpdateTableRequest,
  TableFilters,
  TablesResponse,
  TableAnalytics 
} from '../types/table';

// Helper function to build query parameters
const buildFilterParams = (filters?: TableFilters): string => {
  if (!filters) return '';
  
  const searchParams = new URLSearchParams();
  
  if (filters.status) searchParams.append('status', filters.status);
  if (filters.capacity) searchParams.append('capacity', filters.capacity.toString());
  if (filters.minCapacity) searchParams.append('min_capacity', filters.minCapacity.toString());
  if (filters.maxCapacity) searchParams.append('max_capacity', filters.maxCapacity.toString());
  if (filters.section) searchParams.append('section', filters.section);
  if (filters.floor) searchParams.append('floor', filters.floor.toString());
  if (filters.shape) searchParams.append('shape', filters.shape);
  if (filters.searchTerm) searchParams.append('search', filters.searchTerm);
  if (filters.assignedWaiter) searchParams.append('assigned_waiter', filters.assignedWaiter.toString());
  
  return searchParams.toString();
};

// Table API service
export const tableAPI = {
  /**
   * Get all tables with pagination and filters
   */
  getTables: async (params?: {
    page?: number;
    limit?: number;
    filters?: TableFilters;
  }): Promise<TablesResponse> => {
    const searchParams = new URLSearchParams();
    
    // Pagination parameters
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    // Add filter parameters
    if (params?.filters) {
      const filterParams = buildFilterParams(params.filters);
      if (filterParams) {
        // Merge filter params with pagination params
        const filterSearchParams = new URLSearchParams(filterParams);
        filterSearchParams.forEach((value, key) => {
          searchParams.append(key, value);
        });
      }
    }

    const queryString = searchParams.toString();
    const url = queryString ? `/tables?${queryString}` : '/tables';
    
    try {
      const response = await apiClient.get<PaginatedResponse<Table>>(url);
      return {
        tables: response.data.data || [],
        total: response.data.total || 0,
        page: response.data.page || response.data.current_page || 1,
        limit: response.data.limit || response.data.per_page || 10
      };
    } catch (error) {
      console.error('Error fetching tables:', error);
      throw error;
    }
  },

  /**
   * Get table analytics - general analytics data
   */
  getTableAnalytics: async (): Promise<TableAnalytics[]> => {
    try {
      const response = await apiClient.get<ApiResponse<TableAnalytics[]>>('/tables/analytics');
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('Error fetching table analytics:', error);
      return [];
    }
  },

  /**
   * Get analytics for specific table
   */
  getTableAnalyticsById: async (tableId: number): Promise<TableAnalytics | null> => {
    try {
      const response = await apiClient.get<ApiResponse<TableAnalytics>>(`/tables/${tableId}/analytics`);
      return response.data.data || response.data || null;
    } catch (error) {
      console.error(`Error fetching analytics for table ${tableId}:`, error);
      return null;
    }
  },

  /**
   * Get table occupancy rates
   */
  getTableOccupancyRates: async (): Promise<any> => {
    try {
      const response = await apiClient.get<ApiResponse<any>>('/tables/occupancy-rates');
      return response.data.data || response.data || {};
    } catch (error) {
      console.error('Error fetching table occupancy rates:', error);
      return {};
    }
  },

  /**
   * Get revenue per table
   */
  getTableRevenue: async (): Promise<any> => {
    try {
      const response = await apiClient.get<ApiResponse<any>>('/tables/revenue-per-table');
      return response.data.data || response.data || {};
    } catch (error) {
      console.error('Error fetching table revenue:', error);
      return {};
    }
  },

  /**
   * Get single table
   */
  getTable: async (id: number): Promise<Table> => {
    try {
      const response = await apiClient.get<ApiResponse<Table>>(`/tables/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error fetching table ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create new table
   */
  createTable: async (tableData: CreateTableRequest): Promise<Table> => {
    try {
      const response = await apiClient.post<ApiResponse<Table>>('/tables', tableData);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error creating table:', error);
      throw error;
    }
  },

  /**
   * Update table
   */
  updateTable: async (id: number, updates: Partial<UpdateTableRequest>): Promise<Table> => {
    try {
      const response = await apiClient.put<ApiResponse<Table>>(`/tables/${id}`, updates);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error updating table ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete table
   */
  deleteTable: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/tables/${id}`);
    } catch (error) {
      console.error(`Error deleting table ${id}:`, error);
      throw error;
    }
  },

  /**
   * Update table status
   */
  updateTableStatus: async (id: number, status: Table['status']): Promise<Table> => {
    try {
      const response = await apiClient.patch<ApiResponse<Table>>(`/tables/${id}/status`, { status });
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error updating table ${id} status:`, error);
      throw error;
    }
  },

  /**
   * Bulk update table statuses
   */
  bulkUpdateStatus: async (tableIds: number[], status: Table['status']): Promise<Table[]> => {
    try {
      const response = await apiClient.patch<ApiResponse<Table[]>>('/tables/bulk-status', { 
        table_ids: tableIds, 
        status 
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error bulk updating table statuses:', error);
      throw error;
    }
  },

  /**
   * Get table performance analytics (individual table metrics)
   * Returns performance metrics for each table from /api/tables/analytics
   */
  getTablePerformanceAnalytics: async (period: 'today' | 'week' | 'month' = 'today'): Promise<TableAnalytics[]> => {
    try {
      const queryString = period !== 'today' ? `?period=${period}` : '';
      const response = await apiClient.get<TableAnalytics[]>(`/tables/analytics${queryString}`);
      
      // The backend returns an array directly, not wrapped in a data object
      return response.data || [];
    } catch (error) {
      console.error('Error fetching table performance analytics:', error);
      return [];
    }
  },

  /**
   * Get table analytics overview (comprehensive analytics)
   * Legacy method - kept for backward compatibility
   */
  getAnalytics: async (period: 'today' | 'week' | 'month' = 'today'): Promise<TableAnalytics[]> => {
    return tableAPI.getTablePerformanceAnalytics(period);
  },

  /**
   * Get specific table analytics by ID
   */
  getSpecificTableAnalytics: async (id: number, period: 'today' | 'week' | 'month' = 'today'): Promise<TableAnalytics> => {
    try {
      const response = await apiClient.get<ApiResponse<TableAnalytics>>(`/tables/${id}/analytics?period=${period}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error fetching analytics for table ${id}:`, error);
      throw error;
    }
  },

  /**
   * Update table layout positions
   */
  updateLayout: async (tables: { id: number; coordinates: { x: number; y: number } }[]): Promise<void> => {
    try {
      await apiClient.put('/tables/layout', { tables });
    } catch (error) {
      console.error('Error updating table layout:', error);
      throw error;
    }
  }
};

export default tableAPI;

// Export individual functions for easier imports
export const {
  getTables,
  getTable,
  createTable,
  updateTable,
  deleteTable,
  updateTableStatus,
  bulkUpdateStatus,
  getAnalytics,
  getTablePerformanceAnalytics,
  getTableAnalytics,
  getTableAnalyticsById,
  getSpecificTableAnalytics,
  getTableOccupancyRates,
  getTableRevenue,
  updateLayout
} = tableAPI;

