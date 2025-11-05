import apiClient from './client';
import type { ApiResponse, PaginatedResponse } from './client';
import type { 
  Table, 
  CreateTableRequest, 
  UpdateTableRequest,
  TableAnalytics 
} from '../types/table';

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
      console.log('🔍 Fetching tables with params:', params);
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
      console.log('📡 Tables API response:', response.data);
      
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
    } catch (error: any) {
      console.error('❌ Error fetching tables:', error);
      throw error;
    }
  },

  /**
   * Get table analytics - general analytics data
   */
  getTableAnalytics: async (): Promise<TableAnalytics[]> => {
    try {
      console.log('🔍 Fetching table analytics');
      const response = await apiClient.get<ApiResponse<TableAnalytics[]>>('/tables/analytics');
      console.log('📡 Table analytics API response:', response.data);
      return response.data.data || response.data || [];
    } catch (error: any) {
      console.error('❌ Error fetching table analytics:', error);
      return [];
    }
  },

  /**
   * Get analytics for specific table
   */
  getTableAnalyticsById: async (tableId: number): Promise<TableAnalytics | null> => {
    try {
      console.log('🔍 Fetching analytics for table:', tableId);
      const response = await apiClient.get<ApiResponse<TableAnalytics>>(`/tables/${tableId}/analytics`);
      console.log('📡 Table analytics by ID API response:', response.data);
      return response.data.data || response.data || null;
    } catch (error: any) {
      console.error(`❌ Error fetching analytics for table ${tableId}:`, error);
      return null;
    }
  },

  /**
   * Get table occupancy rates
   */
  getTableOccupancyRates: async (): Promise<any> => {
    try {
      console.log('🔍 Fetching table occupancy rates');
      const response = await apiClient.get<ApiResponse<any>>('/tables/occupancy-rates');
      console.log('📡 Table occupancy rates API response:', response.data);
      return response.data.data || response.data || {};
    } catch (error: any) {
      console.error('❌ Error fetching table occupancy rates:', error);
      return {};
    }
  },

  /**
   * Get revenue per table
   */
  getTableRevenue: async (): Promise<any> => {
    try {
      console.log('🔍 Fetching table revenue');
      const response = await apiClient.get<ApiResponse<any>>('/tables/revenue-per-table');
      console.log('📡 Table revenue API response:', response.data);
      return response.data.data || response.data || {};
    } catch (error: any) {
      console.error('❌ Error fetching table revenue:', error);
      return {};
    }
  },

  /**
   * Get single table
   */
  getTable: async (id: number): Promise<Table> => {
    try {
      console.log('🔍 Fetching table:', id);
      const response = await apiClient.get<ApiResponse<Table>>(`/tables/${id}`);
      console.log('📡 Table API response:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error(`❌ Error fetching table ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create new table
   */
  createTable: async (tableData: CreateTableRequest): Promise<Table> => {
    try {
      console.log('➕ Creating table with data:', tableData);
      const response = await apiClient.post<ApiResponse<Table>>('/tables', tableData);
      console.log('📡 Create table API response:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('❌ Error creating table:', error);
      throw error;
    }
  },

  /**
   * Update table
   */
  updateTable: async (id: number, updates: Partial<UpdateTableRequest>): Promise<Table> => {
    try {
      console.log('🔄 Updating table:', id, 'with updates:', updates);
      const response = await apiClient.put<ApiResponse<Table>>(`/tables/${id}`, updates);
      console.log('📡 Update table API response:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error(`❌ Error updating table ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete table
   */
  deleteTable: async (id: number): Promise<void> => {
    try {
      console.log('🗑️ Deleting table:', id);
      await apiClient.delete(`/tables/${id}`);
      console.log('✅ Table deleted successfully');
    } catch (error: any) {
      console.error(`❌ Error deleting table ${id}:`, error);
      throw error;
    }
  },

  /**
   * Update table status
   */
  updateTableStatus: async (id: number, status: Table['status']): Promise<Table> => {
    try {
      console.log('🔄 Updating table status:', id, 'to:', status);
      const response = await apiClient.patch<ApiResponse<Table>>(`/tables/${id}/status`, { status });
      console.log('📡 Update table status API response:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error(`❌ Error updating table ${id} status:`, error);
      throw error;
    }
  },

  /**
   * Bulk update table statuses
   */
  bulkUpdateStatus: async (tableIds: number[], status: Table['status']): Promise<Table[]> => {
    try {
      console.log('🔄 Bulk updating table statuses:', tableIds, 'to:', status);
      const response = await apiClient.patch<ApiResponse<Table[]>>('/tables/bulk-status', { 
        table_ids: tableIds, 
        status 
      });
      console.log('📡 Bulk update status API response:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('❌ Error bulk updating table statuses:', error);
      throw error;
    }
  },

  /**
   * Get table performance analytics (individual table metrics)
   * Returns performance metrics for each table from /api/tables/analytics
   */
  getTablePerformanceAnalytics: async (period: 'today' | 'week' | 'month' = 'today'): Promise<TableAnalytics[]> => {
    try {
      console.log('🔍 Fetching table performance analytics for period:', period);
      const queryString = period !== 'today' ? `?period=${period}` : '';
      const response = await apiClient.get<TableAnalytics[]>(`/tables/analytics${queryString}`);
      console.log('📡 Table performance analytics API response:', response.data);
      
      // The backend returns an array directly, not wrapped in a data object
      return response.data || [];
    } catch (error: any) {
      console.error('❌ Error fetching table performance analytics:', error);
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
      console.log('🔍 Fetching analytics for table:', id, 'period:', period);
      const response = await apiClient.get<ApiResponse<TableAnalytics>>(`/tables/${id}/analytics?period=${period}`);
      console.log('📡 Specific table analytics API response:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error(`❌ Error fetching analytics for table ${id}:`, error);
      throw error;
    }
  },

  /**
   * Update table layout positions
   */
  updateLayout: async (tables: { id: number; coordinates: { x: number; y: number } }[]): Promise<void> => {
    try {
      console.log('🔄 Updating table layout:', tables);
      await apiClient.put('/tables/layout', { tables });
      console.log('✅ Table layout updated successfully');
    } catch (error: any) {
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

