import apiClient, { ApiResponse, PaginatedResponse } from './client';

// Dashboard types
export interface DashboardMetrics {
  total_revenue: number;
  total_orders: number;
  paid_orders: number;
  cancelled_orders: number;
  average_order_value: number;
  active_staff: number;
  occupied_tables: number;
  available_tables: number;
}

export interface SalesChart {
  labels: string[];
  data: number[];
  revenue: number[];
}

export interface TopItem {
  id: number;
  name: string;
  sold_count: number;
  revenue: number;
  category?: string;
}

export interface StaffPerformance {
  id: number;
  name: string;
  orders_completed: number;
  revenue_generated: number;
  hours_worked: number;
  performance_score: number;
}

// Dashboard API service
export const dashboardAPI = {
  /**
   * Get dashboard metrics
   */
  getMetrics: async (period: 'today' | 'week' | 'month' = 'today'): Promise<DashboardMetrics> => {
    const response = await apiClient.get<ApiResponse<DashboardMetrics>>(`/dashboard/metrics?period=${period}`);
    return response.data.data;
  },

  /**
   * Get sales charts data
   */
  getCharts: async (period: 'today' | 'week' | 'month' = 'today'): Promise<SalesChart> => {
    const response = await apiClient.get<ApiResponse<SalesChart>>(`/dashboard/charts?period=${period}`);
    return response.data.data;
  },

  /**
   * Get top selling items
   */
  getTopItems: async (period: 'today' | 'week' | 'month' = 'today', limit: number = 10): Promise<TopItem[]> => {
    const response = await apiClient.get<ApiResponse<TopItem[]>>(`/dashboard/top-items?period=${period}&limit=${limit}`);
    return response.data.data;
  },

  /**
   * Get staff performance data
   */
  getStaffPerformance: async (period: 'today' | 'week' | 'month' = 'today'): Promise<StaffPerformance[]> => {
    const response = await apiClient.get<ApiResponse<StaffPerformance[]>>(`/analytics/staff-performance?period=${period}`);
    return response.data.data;
  }
};

export default dashboardAPI;