import apiClient from './client';
import type { ApiResponse } from './client';

// Table types
export interface Table {
  id: number;
  name: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  position_x?: number;
  position_y?: number;
  current_order_id?: number;
  current_order?: {
    id: number;
    customer_name?: string;
    total: number;
    created_at: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CreateTableData {
  name: string;
  capacity: number;
  position_x?: number;
  position_y?: number;
}

export interface UpdateTableData extends Partial<CreateTableData> {
  status?: 'available' | 'occupied' | 'reserved' | 'maintenance';
}

export interface TableAnalytics {
  table_id: number;
  table_name: string;
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
  occupancy_rate: number;
  average_duration: number; // in minutes
}

export interface OccupancyData {
  total_tables: number;
  occupied_tables: number;
  available_tables: number;
  reserved_tables: number;
  maintenance_tables: number;
  occupancy_percentage: number;
}

// Table API service
export const tableAPI = {
  /**
   * Get all tables
   */
  getTables: async (): Promise<Table[]> => {
    const response = await apiClient.get<ApiResponse<Table[]>>('/tables');
    return response.data.data;
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
  createTable: async (tableData: CreateTableData): Promise<Table> => {
    const response = await apiClient.post<ApiResponse<Table>>('/tables', tableData);
    return response.data.data;
  },

  /**
   * Update table
   */
  updateTable: async (id: number, updates: UpdateTableData): Promise<Table> => {
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
   * Get real-time occupancy data
   */
  getOccupancyRates: async (): Promise<OccupancyData> => {
    const response = await apiClient.get<ApiResponse<OccupancyData>>('/tables/occupancy-rates');
    return response.data.data;
  },

  /**
   * Get revenue per table
   */
  getRevenuePerTable: async (period: 'today' | 'week' | 'month' = 'today'): Promise<TableAnalytics[]> => {
    const response = await apiClient.get<ApiResponse<TableAnalytics[]>>(`/tables/revenue-per-table?period=${period}`);
    return response.data.data;
  },

  /**
   * Update table layout positions
   */
  updateLayout: async (tables: { id: number; position_x: number; position_y: number }[]): Promise<void> => {
    await apiClient.put('/tables/layout', { tables });
  }
};

export default tableAPI;
