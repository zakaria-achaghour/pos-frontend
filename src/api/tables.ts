import apiClient from './client';
import type { ApiResponse, PaginatedResponse } from './client';
import type { 
  Table, 
  CreateTableRequest, 
  UpdateTableRequest,
  TableAnalytics 
} from '../types/table';
import { asApiError } from '@/utils/apiError';

// Table API service
export const tableAPI = {
  /**
   * Get all tables with pagination and filters
   */
  getTables: async (params: {
    page?: number;
    per_page?: number;
    status?: string;
    capacity?: number;
    min_capacity?: number;
    max_capacity?: number;
    section?: string;
    floor?: number;
    shape?: string;
    search?: string;
    assigned_waiter?: number;
  } = {}): Promise<PaginatedResponse<Table>> => {
    try {
      const searchParams = new URLSearchParams();
      
      // Add all parameters using Object.entries
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });

      const queryString = searchParams.toString();
      const url = queryString ? `/tables?${queryString}` : '/tables';
      
      const response = await apiClient.get<PaginatedResponse<Table>>(url);
      
      // Handle both direct response and wrapped response
      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data as PaginatedResponse<Table>;
      } else if (Array.isArray(response.data)) {
        // Direct array response - create pagination structure
        return {
          data: response.data,
          current_page: 1,
          last_page: 1,
          per_page: response.data.length,
          total: response.data.length,
          from: 1,
          to: response.data.length
        };
      }
      
      return response.data as PaginatedResponse<Table>;
    } catch (errorRaw) {
      const error = asApiError(errorRaw);
      console.error('❌ Error fetching tables:', error);
      throw error;
    }
  },

  /**
   * @deprecated - This endpoint is no longer supported by the backend
   * Get table analytics - general analytics data
   */
  getTableAnalytics: async (): Promise<TableAnalytics[]> => {
    console.warn('⚠️ tableAPI.getTableAnalytics is deprecated - endpoint /tables/analytics no longer exists');
    return [];
  },

  /**
   * Get analytics for specific table
   */
  getTableAnalyticsById: async (tableId: number): Promise<TableAnalytics | null> => {
    try {
      const response = await apiClient.get<ApiResponse<TableAnalytics>>(`/tables/${tableId}/analytics`);
      return response.data.data || response.data || null;
    } catch (errorRaw) {
      const error = asApiError(errorRaw);
      console.error(`❌ Error fetching analytics for table ${tableId}:`, error);
      return null;
    }
  },

  /**
   * Get table occupancy rates
   */
  getTableOccupancyRates: async (): Promise<Record<string, unknown>> => {
    try {
      const response = await apiClient.get<ApiResponse<Record<string, unknown>>>('/tables/occupancy-rates');
      return response.data.data || response.data || {};
    } catch (errorRaw) {
      const error = asApiError(errorRaw);
      console.error('❌ Error fetching table occupancy rates:', error);
      return {};
    }
  },

  /**
   * Get revenue per table
   */
  getTableRevenue: async (): Promise<Record<string, unknown>> => {
    try {
      const response = await apiClient.get<ApiResponse<Record<string, unknown>>>('/tables/revenue-per-table');
      return response.data.data || response.data || {};
    } catch (errorRaw) {
      const error = asApiError(errorRaw);
      console.error('❌ Error fetching table revenue:', error);
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
    } catch (errorRaw) {
      const error = asApiError(errorRaw);
      console.error(`❌ Error fetching table ${id}:`, error);
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
    } catch (errorRaw) {
      const error = asApiError(errorRaw);
      console.error('❌ Error creating table:', error);
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
    } catch (errorRaw) {
      const error = asApiError(errorRaw);
      console.error(`❌ Error updating table ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete table
   */
  deleteTable: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/tables/${id}`);
    } catch (errorRaw) {
      const error = asApiError(errorRaw);
      console.error(`❌ Error deleting table ${id}:`, error);
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
    } catch (errorRaw) {
      const error = asApiError(errorRaw);
      console.error(`❌ Error updating table ${id} status:`, error);
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
    } catch (errorRaw) {
      const error = asApiError(errorRaw);
      console.error('❌ Error bulk updating table statuses:', error);
      throw error;
    }
  },

  /**
   * @deprecated - This endpoint is no longer supported by the backend
   * Get table performance analytics (individual table metrics)
   * Returns performance metrics for each table from /api/tables/analytics
   */
  getTablePerformanceAnalytics: async (_period: 'today' | 'week' | 'month' = 'today'): Promise<TableAnalytics[]> => {
    console.warn('⚠️ tableAPI.getTablePerformanceAnalytics is deprecated - endpoint /tables/analytics no longer exists');
    return [];
  },

  /**
   * @deprecated - This endpoint is no longer supported by the backend
   * Get table analytics overview (comprehensive analytics)
   * Legacy method - kept for backward compatibility
   */
  getAnalytics: async (_period: 'today' | 'week' | 'month' = 'today'): Promise<TableAnalytics[]> => {
    console.warn('⚠️ tableAPI.getAnalytics is deprecated - endpoint /tables/analytics no longer exists');
    return [];
  },

  /**
   * Get specific table analytics by ID
   */
  getSpecificTableAnalytics: async (id: number, period: 'today' | 'week' | 'month' = 'today'): Promise<TableAnalytics> => {
    try {
      const response = await apiClient.get<ApiResponse<TableAnalytics>>(`/tables/${id}/analytics?period=${period}`);
      return response.data.data || response.data;
    } catch (errorRaw) {
      const error = asApiError(errorRaw);
      console.error(`❌ Error fetching analytics for table ${id}:`, error);
      throw error;
    }
  },

  /**
   * Update table layout positions
   */
  updateLayout: async (tables: { id: number; coordinates: { x: number; y: number } }[]): Promise<void> => {
    try {
      await apiClient.put('/tables/layout', { tables });
    } catch (errorRaw) {
      const error = asApiError(errorRaw);
      console.error('❌ Error updating table layout:', error);
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

