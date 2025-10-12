// Staff Attendance Redux Slice
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/client';
import { parseApiError } from '../utils/errorUtils';
import type { LoadingState, ApiError, PaginationState } from '../types/common';

// Attendance Types
export interface Attendance {
  id: number;
  staff_id: number;
  clock_in: string;
  clock_out?: string;
  hours_worked?: number;
  break_minutes?: number;
  notes?: string;
  restaurant_id: number;
  created_at: string;
  updated_at: string;
  staff?: {
    id: number;
    first_name: string;
    last_name: string;
    position: string;
  };
}

export interface AttendanceSummary {
  staff_id: number;
  staff_name: string;
  total_hours: number;
  total_days: number;
  average_hours_per_day: number;
}

export interface ClockInRequest {
  staff_id: number;
}

export interface ClockOutRequest {
  staff_id: number;
  break_minutes?: number;
  notes?: string;
}

export interface AttendanceFilters {
  staff_id?: number;
  date_from?: string;
  date_to?: string;
  page?: number;
}

export interface ReportFilters {
  period?: 'today' | 'week' | 'month' | 'custom';
  start_date?: string;
  end_date?: string;
  staff_id?: number;
}

// State Interface
interface AttendanceState {
  records: Attendance[];
  currentRecord: Attendance | null;
  summary: AttendanceSummary[];
  pagination: PaginationState;
  loading: LoadingState;
  error: ApiError | null;
  filters: AttendanceFilters;
}

// Initial State
const initialState: AttendanceState = {
  records: [],
  currentRecord: null,
  summary: [],
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
  filters: {}
};

// Async Thunks
export const clockInStaff = createAsyncThunk(
  'attendance/clockIn',
  async (data: ClockInRequest, { rejectWithValue }) => {
    try {
      const response = await api.post('/staff/attendance/clock-in', data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const clockOutStaff = createAsyncThunk(
  'attendance/clockOut',
  async (data: ClockOutRequest, { rejectWithValue }) => {
    try {
      const response = await api.post('/staff/attendance/clock-out', data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const fetchAttendanceRecords = createAsyncThunk(
  'attendance/fetchRecords',
  async (filters: AttendanceFilters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.staff_id) params.append('staff_id', filters.staff_id.toString());
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.page) params.append('page', filters.page.toString());

      const response = await api.get(`/staff/attendance?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const fetchAttendanceSummary = createAsyncThunk(
  'attendance/fetchSummary',
  async (period: 'today' | 'week' | 'month' = 'week', { rejectWithValue }) => {
    try {
      const response = await api.get(`/staff/attendance/summary?period=${period}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const generateSummaryPDFReport = createAsyncThunk(
  'attendance/generateSummaryPDF',
  async (filters: ReportFilters, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.period) params.append('period', filters.period);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);

      const response = await api.get(`/staff/attendance/reports/summary-pdf?${params.toString()}`, {
        responseType: 'blob'
      });
      
      // Create download link for PDF
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `attendance-summary-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true, message: 'PDF report downloaded successfully' };
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const generateDetailedPDFReport = createAsyncThunk(
  'attendance/generateDetailedPDF',
  async (filters: ReportFilters, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.period) params.append('period', filters.period);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.staff_id) params.append('staff_id', filters.staff_id.toString());

      const response = await api.get(`/staff/attendance/reports/detailed-pdf?${params.toString()}`, {
        responseType: 'blob'
      });
      
      // Create download link for PDF
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `attendance-detailed-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true, message: 'PDF report downloaded successfully' };
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

// Slice
const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<AttendanceFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentRecord: (state) => {
      state.currentRecord = null;
    },
    // Real-time updates for active attendance
    updateAttendanceRecord: (state, action: PayloadAction<Attendance>) => {
      const updatedRecord = action.payload;
      const index = state.records.findIndex(r => r.id === updatedRecord.id);
      if (index !== -1) {
        state.records[index] = updatedRecord;
      } else {
        state.records.unshift(updatedRecord);
      }
      if (state.currentRecord?.id === updatedRecord.id) {
        state.currentRecord = updatedRecord;
      }
    }
  },
  extraReducers: (builder) => {
    // Clock In
    builder
      .addCase(clockInStaff.pending, (state) => {
        state.loading.isCreating = true;
        state.error = null;
      })
      .addCase(clockInStaff.fulfilled, (state, action) => {
        state.loading.isCreating = false;
        const newRecord = action.payload.attendance;
        state.records.unshift(newRecord);
        state.currentRecord = newRecord;
      })
      .addCase(clockInStaff.rejected, (state, action) => {
        state.loading.isCreating = false;
        state.error = action.payload as ApiError;
      })

      // Clock Out
      .addCase(clockOutStaff.pending, (state) => {
        state.loading.isUpdating = true;
        state.error = null;
      })
      .addCase(clockOutStaff.fulfilled, (state, action) => {
        state.loading.isUpdating = false;
        const updatedRecord = action.payload.attendance;
        const index = state.records.findIndex(r => r.id === updatedRecord.id);
        if (index !== -1) {
          state.records[index] = updatedRecord;
        }
        if (state.currentRecord?.id === updatedRecord.id) {
          state.currentRecord = updatedRecord;
        }
      })
      .addCase(clockOutStaff.rejected, (state, action) => {
        state.loading.isUpdating = false;
        state.error = action.payload as ApiError;
      })

      // Fetch Records
      .addCase(fetchAttendanceRecords.pending, (state) => {
        state.loading.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceRecords.fulfilled, (state, action) => {
        state.loading.isLoading = false;
        state.records = action.payload.data || action.payload;
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
      })
      .addCase(fetchAttendanceRecords.rejected, (state, action) => {
        state.loading.isLoading = false;
        state.error = action.payload as ApiError;
      })

      // Fetch Summary
      .addCase(fetchAttendanceSummary.pending, (state) => {
        state.loading.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceSummary.fulfilled, (state, action) => {
        state.loading.isLoading = false;
        state.summary = action.payload;
      })
      .addCase(fetchAttendanceSummary.rejected, (state, action) => {
        state.loading.isLoading = false;
        state.error = action.payload as ApiError;
      })

      // PDF Reports
      .addCase(generateSummaryPDFReport.pending, (state) => {
        state.loading.isLoading = true;
        state.error = null;
      })
      .addCase(generateSummaryPDFReport.fulfilled, (state) => {
        state.loading.isLoading = false;
      })
      .addCase(generateSummaryPDFReport.rejected, (state, action) => {
        state.loading.isLoading = false;
        state.error = action.payload as ApiError;
      })

      .addCase(generateDetailedPDFReport.pending, (state) => {
        state.loading.isLoading = true;
        state.error = null;
      })
      .addCase(generateDetailedPDFReport.fulfilled, (state) => {
        state.loading.isLoading = false;
      })
      .addCase(generateDetailedPDFReport.rejected, (state, action) => {
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
  clearCurrentRecord,
  updateAttendanceRecord
} = attendanceSlice.actions;

// Selectors
export const selectAttendanceRecords = (state: { attendance: AttendanceState }) => state.attendance.records;
export const selectCurrentAttendanceRecord = (state: { attendance: AttendanceState }) => state.attendance.currentRecord;
export const selectAttendanceSummary = (state: { attendance: AttendanceState }) => state.attendance.summary;
export const selectAttendancePagination = (state: { attendance: AttendanceState }) => state.attendance.pagination;
export const selectAttendanceLoading = (state: { attendance: AttendanceState }) => state.attendance.loading;
export const selectAttendanceError = (state: { attendance: AttendanceState }) => state.attendance.error;
export const selectAttendanceFilters = (state: { attendance: AttendanceState }) => state.attendance.filters;

// Helper selectors
export const selectTodayAttendance = (state: { attendance: AttendanceState }) => {
  const today = new Date().toISOString().split('T')[0];
  return state.attendance.records.filter(record => 
    record.clock_in.startsWith(today)
  );
};

export const selectActiveClockIns = (state: { attendance: AttendanceState }) =>
  state.attendance.records.filter(record => record.clock_in && !record.clock_out);

export const selectStaffTotalHours = (staffId: number) => 
  (state: { attendance: AttendanceState }) => {
    return state.attendance.records
      .filter(record => record.staff_id === staffId && record.hours_worked)
      .reduce((total, record) => total + (record.hours_worked || 0), 0);
  };

export default attendanceSlice.reducer;