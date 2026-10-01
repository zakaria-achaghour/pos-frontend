import { useState, useCallback, useEffect } from 'react';
import { tableAPI } from '../api/tables';
import type { TableAnalytics } from '../types/table';
import { asApiError } from '@/utils/apiError';

export const useTableAnalytics = () => {
  const [analytics, setAnalytics] = useState<TableAnalytics[]>([]);
  const [occupancyRates, setOccupancyRates] = useState<Record<string, unknown>>({});
  const [revenueData, setRevenueData] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');

  // Clear error after 5 seconds
  const clearError = useCallback(() => {
    setTimeout(() => setError(null), 5000);
  }, []);

  // Show error
  const showError = useCallback((message: string) => {
    setError(message);
    clearError();
  }, [clearError]);

  // Fetch comprehensive table analytics
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all analytics data in parallel
      const [analyticsData, occupancyData, revenueDataRes] = await Promise.all([
        tableAPI.getTableAnalytics(),
        tableAPI.getTableOccupancyRates(),
        tableAPI.getTableRevenue()
      ]);

      setAnalytics(analyticsData);
      setOccupancyRates(occupancyData);
      setRevenueData(revenueDataRes);
      setError(null);
    } catch (errRaw) {
      const err = asApiError(errRaw);
      console.error('Error fetching table analytics:', err);
      const errorMessage = err.response?.data?.message || 'Failed to load analytics data';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  // Fetch analytics for specific table
  const fetchTableAnalyticsById = useCallback(async (tableId: number) => {
    try {
      const tableAnalytics = await tableAPI.getTableAnalyticsById(tableId);
      return tableAnalytics;
    } catch (errRaw) {
      const err = asApiError(errRaw);
      console.error(`Error fetching analytics for table ${tableId}:`, err);
      const errorMessage = err.response?.data?.message || `Failed to load analytics for table ${tableId}`;
      showError(errorMessage);
      return null;
    }
  }, [showError]);

  // Refresh analytics data
  const refreshAnalytics = useCallback(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Load data when period changes
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics, period]);

  // Calculate summary statistics from analytics
  const summaryStats = useCallback(() => {
    if (!analytics.length) {
      return {
        totalRevenue: 0,
        avgOccupancy: 0,
        topPerformingTable: null,
        totalOrders: 0,
        avgServiceTime: 0
      };
    }

    const totalRevenue = analytics.reduce((sum, table) => sum + (table.total_revenue || 0), 0);
    const totalSeatings = analytics.reduce((sum, table) => sum + (table.total_seatings || 0), 0);
    const avgOccupancy = analytics.reduce((sum, table) => sum + (table.average_occupancy_rate || 0), 0) / analytics.length;
    const avgDuration = analytics.reduce((sum, table) => sum + (table.average_duration || 0), 0) / analytics.length;
    
    const topPerformingTable = analytics.reduce((top, table) => 
      (table.total_revenue || 0) > (top?.total_revenue || 0) ? table : top, 
      analytics[0]
    );

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      avgOccupancy: Math.round(avgOccupancy * 100) / 100,
      topPerformingTable,
      totalSeatings,
      avgDuration: Math.round(avgDuration * 100) / 100
    };
  }, [analytics]);

  // Get table performance ranking
  const getTableRanking = useCallback(() => {
    return analytics
      .sort((a, b) => (b.total_revenue || 0) - (a.total_revenue || 0))
      .map((table, index) => ({
        ...table,
        rank: index + 1,
        revenuePercentage: analytics.length > 0 
          ? Math.round(((table.total_revenue || 0) / analytics.reduce((sum, t) => sum + (t.total_revenue || 0), 0)) * 100)
          : 0
      }));
  }, [analytics]);

  // Get occupancy trend data
  const getOccupancyTrends = useCallback(() => {
    return occupancyRates;
  }, [occupancyRates]);

  // Get revenue breakdown
  const getRevenueBreakdown = useCallback(() => {
    return revenueData;
  }, [revenueData]);

  // Update period filter
  const updatePeriod = useCallback((newPeriod: 'today' | 'week' | 'month') => {
    setPeriod(newPeriod);
  }, []);

  return {
    // State
    analytics,
    occupancyRates,
    revenueData,
    loading,
    error,
    period,

    // Computed data
    summaryStats: summaryStats(),
    tableRanking: getTableRanking(),
    occupancyTrends: getOccupancyTrends(),
    revenueBreakdown: getRevenueBreakdown(),

    // Actions
    fetchAnalytics,
    fetchTableAnalyticsById,
    refreshAnalytics,
    updatePeriod,

    // Helpers
    showError,
  };
};