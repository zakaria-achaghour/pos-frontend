import apiClient from './client';
import type { ApiResponse, PaginatedResponse } from './client';
import type {
  Staff,
  CreateStaffData,
  UpdateStaffData,
  StaffPerformance,
  AttendanceRecord,
  ClockInData,
  ClockOutData,
  AttendanceSummary
} from '../types/staff';
import { asApiError } from '@/utils/apiError';

// Staff API service
export const staffAPI = {
  /**
   * Get all staff members
   */
  getStaff: async (filters: {
    role?: string;
    is_active?: boolean;
    page?: number;
    per_page?: number;
  } = {}): Promise<PaginatedResponse<Staff>> => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
      
      const response = await apiClient.get(`/staff?${params}`);
      
      // Handle both direct response and wrapped response
      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data as PaginatedResponse<Staff>;
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
      
      return response.data as PaginatedResponse<Staff>;
    } catch (errorRaw) {
      const error = asApiError(errorRaw);
      console.error('❌ Error fetching staff:', error);
      throw error;
    }
  },

  /**
   * Get single staff member
   */
  getStaffMember: async (id: number): Promise<Staff> => {
    try {
      const response = await apiClient.get(`/staff/${id}`);
      
      // Handle both direct response and wrapped response
      return response.data.data || response.data;
    } catch (errorRaw) {
      const error = asApiError(errorRaw);
      console.error('❌ Error fetching staff member:', error);
      throw error;
    }
  },

  /**
   * Create new staff member
   */
  createStaff: async (staffData: CreateStaffData): Promise<Staff> => {
    try {
      const response = await apiClient.post('/staff', staffData);
      
      // Handle both direct response and wrapped response
      return response.data.data || response.data;
    } catch (errorRaw) {
      const error = asApiError(errorRaw);
      console.error('❌ Error creating staff member:', error);
      throw error;
    }
  },

  /**
   * Update staff member
   */
  updateStaff: async (id: number, updates: UpdateStaffData): Promise<Staff> => {
    try {
      const response = await apiClient.put(`/staff/${id}`, updates);
      
      // Handle both direct response and wrapped response
      return response.data.data || response.data;
    } catch (errorRaw) {
      const error = asApiError(errorRaw);
      console.error('❌ Error updating staff member:', error);
      throw error;
    }
  },

  /**
   * Delete staff member
   */
  deleteStaff: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/staff/${id}`);
    } catch (errorRaw) {
      const error = asApiError(errorRaw);
      console.error('❌ Error deleting staff member:', error);
      throw error;
    }
  },

  /**
   * Get staff performance summary
   */
  getPerformanceSummary: async (period: 'today' | 'week' | 'month' = 'today'): Promise<StaffPerformance[]> => {
    const response = await apiClient.get<ApiResponse<StaffPerformance[]>>(`/staff/performance/summary?period=${period}`);
    return response.data.data;
  },

  /**
   * Clock in staff member
   */
  clockIn: async (data: ClockInData): Promise<AttendanceRecord> => {
    const response = await apiClient.post<ApiResponse<AttendanceRecord>>('/staff/attendance/clock-in', data);
    return response.data.data;
  },

  /**
   * Clock out staff member
   */
  clockOut: async (data: ClockOutData): Promise<AttendanceRecord> => {
    const response = await apiClient.post<ApiResponse<AttendanceRecord>>('/staff/attendance/clock-out', data);
    return response.data.data;
  },

  /**
   * Get attendance records
   */
  getAttendance: async (filters: {
    staff_id?: number;
    date_from?: string;
    date_to?: string;
    page?: number;
    per_page?: number;
  } = {}): Promise<PaginatedResponse<AttendanceRecord>> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const response = await apiClient.get<PaginatedResponse<AttendanceRecord>>(`/staff/attendance?${params}`);
    return response.data;
  },

  /**
   * Get attendance summary
   */
  getAttendanceSummary: async (date?: string): Promise<AttendanceSummary> => {
    const params = date ? `?date=${date}` : '';
    const response = await apiClient.get<ApiResponse<AttendanceSummary>>(`/staff/attendance/summary${params}`);
    return response.data.data;
  },

  /**
   * Download attendance summary PDF
   */
  downloadSummaryPDF: async (filters: {
    date_from?: string;
    date_to?: string;
    staff_id?: number;
  } = {}): Promise<Blob> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const response = await apiClient.get(`/staff/attendance/reports/summary-pdf?${params}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Download detailed attendance PDF
   */
  downloadDetailedPDF: async (filters: {
    date_from?: string;
    date_to?: string;
    staff_id?: number;
  } = {}): Promise<Blob> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const response = await apiClient.get(`/staff/attendance/reports/detailed-pdf?${params}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

export default staffAPI;
