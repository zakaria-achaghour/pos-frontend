import apiClient from './client';
import type { ApiResponse } from './client';
import type {
  DashboardMetrics,
  SalesChart,
  TopItem,
  StaffPerformance,
  DashboardPeriod
} from '../types/dashboard';

// Dashboard API service
export const dashboardAPI = {
  /**
   * Get dashboard metrics
   */
  getMetrics: async (period: DashboardPeriod = 'today'): Promise<DashboardMetrics> => {
    const response = await apiClient.get<ApiResponse<DashboardMetrics>>(`/dashboard/metrics?period=${period}`);
    return response.data.data;
  },

  /**
   * Get sales charts data
   */
  getCharts: async (period: DashboardPeriod = 'today'): Promise<SalesChart> => {
    const response = await apiClient.get<ApiResponse<SalesChart>>(`/dashboard/charts?period=${period}`);
    return response.data.data;
  },

  /**
   * Get top selling items
   */
  getTopItems: async (period: DashboardPeriod = 'today', limit: number = 10): Promise<TopItem[]> => {
    const response = await apiClient.get<ApiResponse<TopItem[]>>(`/dashboard/top-items?period=${period}&limit=${limit}`);
    return response.data.data;
  },

  /**
   * Get staff performance data
   */
  getStaffPerformance: async (period: DashboardPeriod = 'today'): Promise<StaffPerformance[]> => {
    const response = await apiClient.get<ApiResponse<StaffPerformance[]>>(`/analytics/staff-performance?period=${period}`);
    return response.data.data;
  }
};

export default dashboardAPI;
