import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { dashboardAPI } from '../../api/dashboard';
import type { DashboardMetrics, SalesChart, TopItem, StaffPerformance } from '../../api/dashboard';
import { parseApiError } from '../utils/errorUtils';
import type { ApiError } from '../types/common';

// Dashboard state interface
interface DashboardState {
  // Data
  metrics: DashboardMetrics | null;
  charts: SalesChart | null;
  topItems: TopItem[];
  staffPerformance: StaffPerformance[];
  
  // Loading states
  isLoadingMetrics: boolean;
  isLoadingCharts: boolean;
  isLoadingTopItems: boolean;
  isLoadingStaffPerformance: boolean;
  
  // Error states
  error: string | null;
  lastError: ApiError | null;
  
  // UI state
  selectedPeriod: 'today' | 'week' | 'month';
  lastUpdated: string | null;
  autoRefresh: boolean;
  refreshInterval: number; // in seconds
}

const initialState: DashboardState = {
  metrics: null,
  charts: null,
  topItems: [],
  staffPerformance: [],
  isLoadingMetrics: false,
  isLoadingCharts: false,
  isLoadingTopItems: false,
  isLoadingStaffPerformance: false,
  error: null,
  lastError: null,
  selectedPeriod: 'today',
  lastUpdated: null,
  autoRefresh: false,
  refreshInterval: 30,
};

// Async thunks
export const fetchMetrics = createAsyncThunk<
  DashboardMetrics,
  'today' | 'week' | 'month',
  { rejectValue: ApiError }
>(
  'dashboard/fetchMetrics',
  async (period, { rejectWithValue }) => {
    try {
      return await dashboardAPI.getMetrics(period);
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const fetchCharts = createAsyncThunk<
  SalesChart,
  'today' | 'week' | 'month',
  { rejectValue: ApiError }
>(
  'dashboard/fetchCharts',
  async (period, { rejectWithValue }) => {
    try {
      return await dashboardAPI.getCharts(period);
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const fetchTopItems = createAsyncThunk<
  TopItem[],
  { period: 'today' | 'week' | 'month'; limit?: number },
  { rejectValue: ApiError }
>(
  'dashboard/fetchTopItems',
  async ({ period, limit = 10 }, { rejectWithValue }) => {
    try {
      return await dashboardAPI.getTopItems(period, limit);
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const fetchStaffPerformance = createAsyncThunk<
  StaffPerformance[],
  'today' | 'week' | 'month',
  { rejectValue: ApiError }
>(
  'dashboard/fetchStaffPerformance',
  async (period, { rejectWithValue }) => {
    try {
      return await dashboardAPI.getStaffPerformance(period);
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

// Combined thunk to fetch all dashboard data
export const fetchAllDashboardData = createAsyncThunk<
  void,
  'today' | 'week' | 'month',
  { rejectValue: ApiError }
>(
  'dashboard/fetchAllData',
  async (period, { dispatch }) => {
    await Promise.allSettled([
      dispatch(fetchMetrics(period)),
      dispatch(fetchCharts(period)),
      dispatch(fetchTopItems({ period })),
      dispatch(fetchStaffPerformance(period)),
    ]);
  }
);

// Slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    // Error management
    clearError: (state) => {
      state.error = null;
      state.lastError = null;
    },

    // Period management
    setPeriod: (state, action: PayloadAction<'today' | 'week' | 'month'>) => {
      state.selectedPeriod = action.payload;
    },

    // Auto refresh settings
    setAutoRefresh: (state, action: PayloadAction<boolean>) => {
      state.autoRefresh = action.payload;
    },

    setRefreshInterval: (state, action: PayloadAction<number>) => {
      state.refreshInterval = action.payload;
    },

    // Manual refresh trigger
    refreshData: (state) => {
      // This will be handled by middleware or components
      state.lastUpdated = new Date().toISOString();
    },

    // Reset dashboard state
    resetDashboard: (state) => {
      return { ...initialState, selectedPeriod: state.selectedPeriod };
    },
  },
  extraReducers: (builder) => {
    // Fetch metrics
    builder
      .addCase(fetchMetrics.pending, (state) => {
        state.isLoadingMetrics = true;
        state.error = null;
      })
      .addCase(fetchMetrics.fulfilled, (state, action) => {
        state.isLoadingMetrics = false;
        state.metrics = action.payload;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchMetrics.rejected, (state, action) => {
        state.isLoadingMetrics = false;
        state.error = action.payload?.message || 'Failed to fetch metrics';
        state.lastError = action.payload || null;
      });

    // Fetch charts
    builder
      .addCase(fetchCharts.pending, (state) => {
        state.isLoadingCharts = true;
        state.error = null;
      })
      .addCase(fetchCharts.fulfilled, (state, action) => {
        state.isLoadingCharts = false;
        state.charts = action.payload;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchCharts.rejected, (state, action) => {
        state.isLoadingCharts = false;
        state.error = action.payload?.message || 'Failed to fetch charts';
        state.lastError = action.payload || null;
      });

    // Fetch top items
    builder
      .addCase(fetchTopItems.pending, (state) => {
        state.isLoadingTopItems = true;
        state.error = null;
      })
      .addCase(fetchTopItems.fulfilled, (state, action) => {
        state.isLoadingTopItems = false;
        state.topItems = action.payload;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchTopItems.rejected, (state, action) => {
        state.isLoadingTopItems = false;
        state.error = action.payload?.message || 'Failed to fetch top items';
        state.lastError = action.payload || null;
      });

    // Fetch staff performance
    builder
      .addCase(fetchStaffPerformance.pending, (state) => {
        state.isLoadingStaffPerformance = true;
        state.error = null;
      })
      .addCase(fetchStaffPerformance.fulfilled, (state, action) => {
        state.isLoadingStaffPerformance = false;
        state.staffPerformance = action.payload;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchStaffPerformance.rejected, (state, action) => {
        state.isLoadingStaffPerformance = false;
        state.error = action.payload?.message || 'Failed to fetch staff performance';
        state.lastError = action.payload || null;
      });

    // Fetch all dashboard data
    builder
      .addCase(fetchAllDashboardData.pending, (state) => {
        state.isLoadingMetrics = true;
        state.isLoadingCharts = true;
        state.isLoadingTopItems = true;
        state.isLoadingStaffPerformance = true;
        state.error = null;
      })
      .addCase(fetchAllDashboardData.fulfilled, (state) => {
        // Individual loading states will be handled by their respective actions
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchAllDashboardData.rejected, (state, action) => {
        state.isLoadingMetrics = false;
        state.isLoadingCharts = false;
        state.isLoadingTopItems = false;
        state.isLoadingStaffPerformance = false;
        state.error = action.payload?.message || 'Failed to fetch dashboard data';
        state.lastError = action.payload || null;
      });
  },
});

// Selectors
export const selectDashboard = (state: { dashboard: DashboardState }) => state.dashboard;
export const selectDashboardMetrics = (state: { dashboard: DashboardState }) => state.dashboard.metrics;
export const selectDashboardCharts = (state: { dashboard: DashboardState }) => state.dashboard.charts;
export const selectTopItems = (state: { dashboard: DashboardState }) => state.dashboard.topItems;
export const selectStaffPerformance = (state: { dashboard: DashboardState }) => state.dashboard.staffPerformance;
export const selectDashboardLoading = (state: { dashboard: DashboardState }) => ({
  metrics: state.dashboard.isLoadingMetrics,
  charts: state.dashboard.isLoadingCharts,
  topItems: state.dashboard.isLoadingTopItems,
  staffPerformance: state.dashboard.isLoadingStaffPerformance,
  any: state.dashboard.isLoadingMetrics || 
       state.dashboard.isLoadingCharts || 
       state.dashboard.isLoadingTopItems || 
       state.dashboard.isLoadingStaffPerformance,
});
export const selectDashboardError = (state: { dashboard: DashboardState }) => state.dashboard.error;
export const selectSelectedPeriod = (state: { dashboard: DashboardState }) => state.dashboard.selectedPeriod;
export const selectAutoRefresh = (state: { dashboard: DashboardState }) => state.dashboard.autoRefresh;
export const selectRefreshInterval = (state: { dashboard: DashboardState }) => state.dashboard.refreshInterval;
export const selectLastUpdated = (state: { dashboard: DashboardState }) => state.dashboard.lastUpdated;

// Computed selectors
export const selectTotalRevenue = (state: { dashboard: DashboardState }) => 
  state.dashboard.metrics?.total_revenue || 0;

export const selectTotalOrders = (state: { dashboard: DashboardState }) => 
  state.dashboard.metrics?.total_orders || 0;

export const selectAverageOrderValue = (state: { dashboard: DashboardState }) => 
  state.dashboard.metrics?.average_order_value || 0;

export const selectOccupancyRate = (state: { dashboard: DashboardState }) => {
  const metrics = state.dashboard.metrics;
  if (!metrics) return 0;
  const total = metrics.occupied_tables + metrics.available_tables;
  return total > 0 ? (metrics.occupied_tables / total) * 100 : 0;
};

export const selectTopSellingItems = (limit: number = 5) => 
  (state: { dashboard: DashboardState }) => 
    state.dashboard.topItems.slice(0, limit);

export const selectTopPerformingStaff = (limit: number = 5) => 
  (state: { dashboard: DashboardState }) => 
    state.dashboard.staffPerformance
      .sort((a, b) => b.performance_score - a.performance_score)
      .slice(0, limit);

// Actions
export const {
  clearError,
  setPeriod,
  setAutoRefresh,
  setRefreshInterval,
  refreshData,
  resetDashboard,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;