// Staff Schedule Redux Slice
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/client';
import { parseApiError } from '../utils/errorUtils';
import type { LoadingState, ApiError, PaginationState } from '../types/common';

// Schedule Types
export interface Schedule {
  id: number;
  staff_id: number;
  date: string;
  start_time: string;
  end_time: string;
  shift_type: 'morning' | 'afternoon' | 'evening' | 'night';
  status: 'scheduled' | 'confirmed' | 'cancelled';
  notes?: string;
  restaurant_id: number;
  created_at: string;
  updated_at: string;
  staff?: {
    id: number;
    first_name: string;
    last_name: string;
    position: string;
    status: string;
  };
}

export interface ScheduleFilters {
  staff_id?: number;
  date_from?: string;
  date_to?: string;
  shift_type?: Schedule['shift_type'];
  status?: Schedule['status'];
}

export interface CreateScheduleRequest {
  staff_id: number;
  date: string;
  start_time: string;
  end_time: string;
  shift_type: Schedule['shift_type'];
  notes?: string;
}

export interface UpdateScheduleRequest {
  date?: string;
  start_time?: string;
  end_time?: string;
  shift_type?: Schedule['shift_type'];
  status?: Schedule['status'];
  notes?: string;
}

// State Interface
interface ScheduleState {
  schedules: Schedule[];
  currentSchedule: Schedule | null;
  pagination: PaginationState;
  loading: LoadingState;
  error: ApiError | null;
  filters: ScheduleFilters;
  weekView: Schedule[];
  calendarData: Record<string, Schedule[]>;
}

// Initial State
const initialState: ScheduleState = {
  schedules: [],
  currentSchedule: null,
  pagination: {
    currentPage: 1,
    lastPage: 1,
    perPage: 15,
    total: 0,
    from: 0,
    to: 0
  },
  loading: {
    isLoading: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false
  },
  error: null,
  filters: {},
  weekView: [],
  calendarData: {}
};

// Async Thunks
export const fetchSchedules = createAsyncThunk(
  'schedules/fetchSchedules',
  async (filters: ScheduleFilters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.staff_id) params.append('staff_id', filters.staff_id.toString());
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.shift_type) params.append('shift_type', filters.shift_type);
      if (filters.status) params.append('status', filters.status);

      const response = await api.get(`/schedules?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const fetchSchedule = createAsyncThunk(
  'schedules/fetchSchedule',
  async (scheduleId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/schedules/${scheduleId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const createSchedule = createAsyncThunk(
  'schedules/createSchedule',
  async (data: CreateScheduleRequest, { rejectWithValue }) => {
    try {
      const response = await api.post('/schedules', data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const updateSchedule = createAsyncThunk(
  'schedules/updateSchedule',
  async ({ id, data }: { id: number; data: UpdateScheduleRequest }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/schedules/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const deleteSchedule = createAsyncThunk(
  'schedules/deleteSchedule',
  async (scheduleId: number, { rejectWithValue }) => {
    try {
      await api.delete(`/schedules/${scheduleId}`);
      return scheduleId;
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

// Fetch schedules for specific week (helper)
export const fetchWeekSchedules = createAsyncThunk(
  'schedules/fetchWeekSchedules',
  async (weekStartDate: string, { rejectWithValue }) => {
    try {
      const weekStart = new Date(weekStartDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const params = new URLSearchParams({
        date_from: weekStart.toISOString().split('T')[0],
        date_to: weekEnd.toISOString().split('T')[0]
      });

      const response = await api.get(`/schedules?${params.toString()}`);
      return { schedules: response.data, weekStart: weekStartDate };
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

// Slice
const scheduleSlice = createSlice({
  name: 'schedules',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<ScheduleFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentSchedule: (state) => {
      state.currentSchedule = null;
    },
    setCalendarView: (state, action: PayloadAction<{ date: string; schedules: Schedule[] }>) => {
      const { date, schedules } = action.payload;
      state.calendarData[date] = schedules;
    },
    clearCalendarData: (state) => {
      state.calendarData = {};
    },
    // Real-time schedule updates
    updateScheduleStatus: (state, action: PayloadAction<{ id: number; status: Schedule['status'] }>) => {
      const { id, status } = action.payload;
      const schedule = state.schedules.find(s => s.id === id);
      if (schedule) {
        schedule.status = status;
      }
      if (state.currentSchedule?.id === id) {
        state.currentSchedule.status = status;
      }
      // Update calendar data if exists
      Object.keys(state.calendarData).forEach(date => {
        const daySchedule = state.calendarData[date].find(s => s.id === id);
        if (daySchedule) {
          daySchedule.status = status;
        }
      });
    }
  },
  extraReducers: (builder) => {
    // Fetch Schedules
    builder
      .addCase(fetchSchedules.pending, (state) => {
        state.loading.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSchedules.fulfilled, (state, action) => {
        state.loading.isLoading = false;
        if (Array.isArray(action.payload)) {
          state.schedules = action.payload;
        } else {
          state.schedules = action.payload.data || [];
          if (action.payload.current_page) {
            state.pagination = {
              currentPage: action.payload.current_page,
              lastPage: action.payload.last_page,
              perPage: action.payload.per_page,
              total: action.payload.total,
              from: action.payload.from || 0,
              to: action.payload.to || 0
            };
          }
        }
      })
      .addCase(fetchSchedules.rejected, (state, action) => {
        state.loading.isLoading = false;
        state.error = action.payload as ApiError;
      })

      // Fetch Single Schedule
      .addCase(fetchSchedule.pending, (state) => {
        state.loading.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSchedule.fulfilled, (state, action) => {
        state.loading.isLoading = false;
        state.currentSchedule = action.payload;
      })
      .addCase(fetchSchedule.rejected, (state, action) => {
        state.loading.isLoading = false;
        state.error = action.payload as ApiError;
      })

      // Create Schedule
      .addCase(createSchedule.pending, (state) => {
        state.loading.isCreating = true;
        state.error = null;
      })
      .addCase(createSchedule.fulfilled, (state, action) => {
        state.loading.isCreating = false;
        state.schedules.unshift(action.payload);
      })
      .addCase(createSchedule.rejected, (state, action) => {
        state.loading.isCreating = false;
        state.error = action.payload as ApiError;
      })

      // Update Schedule
      .addCase(updateSchedule.pending, (state) => {
        state.loading.isUpdating = true;
        state.error = null;
      })
      .addCase(updateSchedule.fulfilled, (state, action) => {
        state.loading.isUpdating = false;
        const updatedSchedule = action.payload;
        const index = state.schedules.findIndex(s => s.id === updatedSchedule.id);
        if (index !== -1) {
          state.schedules[index] = updatedSchedule;
        }
        if (state.currentSchedule?.id === updatedSchedule.id) {
          state.currentSchedule = updatedSchedule;
        }
      })
      .addCase(updateSchedule.rejected, (state, action) => {
        state.loading.isUpdating = false;
        state.error = action.payload as ApiError;
      })

      // Delete Schedule
      .addCase(deleteSchedule.pending, (state) => {
        state.loading.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteSchedule.fulfilled, (state, action) => {
        state.loading.isDeleting = false;
        const deletedId = action.payload;
        state.schedules = state.schedules.filter(s => s.id !== deletedId);
        if (state.currentSchedule?.id === deletedId) {
          state.currentSchedule = null;
        }
      })
      .addCase(deleteSchedule.rejected, (state, action) => {
        state.loading.isDeleting = false;
        state.error = action.payload as ApiError;
      })

      // Fetch Week Schedules
      .addCase(fetchWeekSchedules.pending, (state) => {
        state.loading.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWeekSchedules.fulfilled, (state, action) => {
        state.loading.isLoading = false;
        state.weekView = action.payload.schedules.data || action.payload.schedules;
      })
      .addCase(fetchWeekSchedules.rejected, (state, action) => {
        state.loading.isLoading = false;
        state.error = action.payload as ApiError;
      });
  },
});

// Actions
export const {
  setFilters,
  clearFilters,
  clearError,
  clearCurrentSchedule,
  setCalendarView,
  clearCalendarData,
  updateScheduleStatus
} = scheduleSlice.actions;

// Selectors
export const selectSchedules = (state: { schedules: ScheduleState }) => state.schedules.schedules;
export const selectCurrentSchedule = (state: { schedules: ScheduleState }) => state.schedules.currentSchedule;
export const selectSchedulePagination = (state: { schedules: ScheduleState }) => state.schedules.pagination;
export const selectScheduleLoading = (state: { schedules: ScheduleState }) => state.schedules.loading;
export const selectScheduleError = (state: { schedules: ScheduleState }) => state.schedules.error;
export const selectScheduleFilters = (state: { schedules: ScheduleState }) => state.schedules.filters;
export const selectWeekView = (state: { schedules: ScheduleState }) => state.schedules.weekView;
export const selectCalendarData = (state: { schedules: ScheduleState }) => state.schedules.calendarData;

// Helper selectors
export const selectTodaySchedules = (state: { schedules: ScheduleState }) => {
  const today = new Date().toISOString().split('T')[0];
  return state.schedules.schedules.filter(schedule => schedule.date === today);
};

export const selectSchedulesByDate = (date: string) => 
  (state: { schedules: ScheduleState }) =>
    state.schedules.schedules.filter(schedule => schedule.date === date);

export const selectStaffSchedules = (staffId: number) =>
  (state: { schedules: ScheduleState }) =>
    state.schedules.schedules.filter(schedule => schedule.staff_id === staffId);

export const selectUpcomingSchedules = (state: { schedules: ScheduleState }) => {
  const today = new Date().toISOString().split('T')[0];
  return state.schedules.schedules.filter(schedule => schedule.date >= today);
};

export const selectSchedulesByShift = (shiftType: Schedule['shift_type']) =>
  (state: { schedules: ScheduleState }) =>
    state.schedules.schedules.filter(schedule => schedule.shift_type === shiftType);

export default scheduleSlice.reducer;