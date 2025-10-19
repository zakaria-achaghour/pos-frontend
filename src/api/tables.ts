import apiClient from './client';
import type { ApiResponse, PaginatedResponse } from './client';
import type { 
  Table, 
  TableFormData, 
  CreateTableRequest, 
  UpdateTableRequest,
  TableFilters,
  TablesResponse,
  TableAnalytics 
} from '../types/table';

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
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.filters?.status) searchParams.append('status', params.filters.status);
    if (params?.filters?.capacity) searchParams.append('capacity', params.filters.capacity.toString());
    if (params?.filters?.minCapacity) searchParams.append('min_capacity', params.filters.minCapacity.toString());
    if (params?.filters?.maxCapacity) searchParams.append('max_capacity', params.filters.maxCapacity.toString());
    if (params?.filters?.section) searchParams.append('section', params.filters.section);
    if (params?.filters?.floor) searchParams.append('floor', params.filters.floor.toString());
    if (params?.filters?.shape) searchParams.append('shape', params.filters.shape);
    if (params?.filters?.searchTerm) searchParams.append('search', params.filters.searchTerm);

    const queryString = searchParams.toString();
    const url = queryString ? `/tables?${queryString}` : '/tables';
    
    const response = await apiClient.get<PaginatedResponse<Table>>(url);
    return {
      tables: response.data.data,
      total: response.data.total,
      page: response.data.page,
      limit: response.data.limit
    };
  },

  /**
   * Get single table
   */
  getTable: async (id: number): Promise<Table> => {
    const response = await apiClient.get<ApiResponse<Table>>(`/tables/${id}`);
    return response.data.data;
  },

  /**
   * Create new table
   */
  createTable: async (tableData: CreateTableRequest): Promise<Table> => {
    const response = await apiClient.post<ApiResponse<Table>>('/tables', tableData);
    return response.data.data;
  },

  /**
   * Update table
   */
  updateTable: async (id: number, updates: Partial<UpdateTableRequest>): Promise<Table> => {
    const response = await apiClient.put<ApiResponse<Table>>(`/tables/${id}`, updates);
    return response.data.data;
  },

  /**
   * Delete table
   */
  deleteTable: async (id: number): Promise<void> => {
    await apiClient.delete(`/tables/${id}`);
  },

  /**
   * Get table analytics overview
   */
  getAnalytics: async (period: 'today' | 'week' | 'month' = 'today'): Promise<TableAnalytics[]> => {
    const response = await apiClient.get<ApiResponse<TableAnalytics[]>>(`/tables/analytics?period=${period}`);
    return response.data.data;
  },

  /**
   * Get specific table analytics
   */
  getTableAnalytics: async (id: number, period: 'today' | 'week' | 'month' = 'today'): Promise<TableAnalytics> => {
    const response = await apiClient.get<ApiResponse<TableAnalytics>>(`/tables/${id}/analytics?period=${period}`);
    return response.data.data;
  },

  /**
   * Update table status
   */
  updateTableStatus: async (id: number, status: Table['status']): Promise<Table> => {
    const response = await apiClient.patch<ApiResponse<Table>>(`/tables/${id}/status`, { status });
    return response.data.data;
  },

  /**
   * Bulk update table statuses
   */
  bulkUpdateStatus: async (tableIds: number[], status: Table['status']): Promise<Table[]> => {
    const response = await apiClient.patch<ApiResponse<Table[]>>('/tables/bulk-status', { 
      table_ids: tableIds, 
      status 
    });
    return response.data.data;
  },

  /**
   * Update table layout positions
   */
  updateLayout: async (tables: { id: number; coordinates: { x: number; y: number } }[]): Promise<void> => {
    await apiClient.put('/tables/layout', { tables });
  }
};

export default tableAPI;

