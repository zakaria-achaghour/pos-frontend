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
// NOTE: These endpoints are deprecated and should not be used in production
// They are kept here for reference only
export const dashboardAPI = {
  /**
   * @deprecated - This endpoint is no longer supported by the backend
   * Get dashboard metrics
   */
  getMetrics: async (period: DashboardPeriod = 'today'): Promise<DashboardMetrics> => {
    console.warn('⚠️ dashboardAPI.getMetrics is deprecated - endpoint /dashboard/metrics no longer exists');
    throw new Error('Endpoint /dashboard/metrics is deprecated');
  },

  /**
   * @deprecated - This endpoint is no longer supported by the backend
   * Get sales charts data
   */
  getCharts: async (period: DashboardPeriod = 'today'): Promise<SalesChart> => {
    console.warn('⚠️ dashboardAPI.getCharts is deprecated - endpoint /dashboard/charts no longer exists');
    throw new Error('Endpoint /dashboard/charts is deprecated');
  },

  /**
   * @deprecated - This endpoint is no longer supported by the backend
   * Get top selling items
   */
  getTopItems: async (period: DashboardPeriod = 'today', limit: number = 10): Promise<TopItem[]> => {
    console.warn('⚠️ dashboardAPI.getTopItems is deprecated - endpoint /dashboard/top-items no longer exists');
    throw new Error('Endpoint /dashboard/top-items is deprecated');
  },

  /**
   * @deprecated - This endpoint is no longer supported by the backend
   * Get staff performance data
   */
  getStaffPerformance: async (period: DashboardPeriod = 'today'): Promise<StaffPerformance[]> => {
    console.warn('⚠️ dashboardAPI.getStaffPerformance is deprecated - endpoint /analytics/staff-performance no longer exists');
    throw new Error('Endpoint /analytics/staff-performance is deprecated');
  }
};

export default dashboardAPI;
