import apiClient, { ApiResponse, PaginatedResponse } from './client';

// Staff types
export interface Staff {
  id: number;
  name: string;
  email: string;
  role: 'manager' | 'cashier' | 'waiter' | 'kitchen';
  phone?: string;
  address?: string;
  hire_date: string;
  hourly_rate?: number;
  photo_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateStaffData {
  name: string;
  email: string;
  role: 'manager' | 'cashier' | 'waiter' | 'kitchen';
  phone?: string;
  address?: string;
  hire_date: string;
  hourly_rate?: number;
  password: string;
}

export interface UpdateStaffData extends Partial<Omit<CreateStaffData, 'password'>> {
  password?: string;
  is_active?: boolean;
}

export interface StaffPerformance {
  staff_id: number;
  staff_name: string;
  orders_completed: number;
  revenue_generated: number;
  hours_worked: number;
  performance_score: number;
  productivity_rate: number;
  period: string;
}

export interface AttendanceRecord {
  id: number;
  staff_id: number;
  staff_name: string;
  clock_in: string;
  clock_out?: string;
  hours_worked?: number;
  date: string;
  status: 'present' | 'absent' | 'late' | 'early_leave';
}

export interface ClockInData {
  staff_id: number;
}

export interface ClockOutData {
  staff_id: number;
}

export interface AttendanceSummary {
  total_staff: number;
  present_today: number;
  absent_today: number;
  late_today: number;
  total_hours_today: number;
  average_hours_per_staff: number;
}

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
      console.log('🔍 Fetching staff with filters:', filters);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
      
      const response = await apiClient.get(`/staff?${params}`);
      console.log('📡 Staff API response:', response.data);
      
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
    } catch (error: any) {
      console.error('❌ Error fetching staff:', error);
      throw error;
    }
  },

  /**
   * Get single staff member
   */
  getStaffMember: async (id: number): Promise<Staff> => {
    try {
      console.log('🔍 Fetching staff member with ID:', id);
      const response = await apiClient.get(`/staff/${id}`);
      console.log('📡 Single staff API response:', response.data);
      
      // Handle both direct response and wrapped response
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('❌ Error fetching staff member:', error);
      throw error;
    }
  },

  /**
   * Create new staff member
   */
  createStaff: async (staffData: CreateStaffData): Promise<Staff> => {
    try {
      console.log('➕ Creating staff member:', staffData);
      const response = await apiClient.post('/staff', staffData);
      console.log('📡 Create staff API response:', response.data);
      
      // Handle both direct response and wrapped response
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('❌ Error creating staff member:', error);
      throw error;
    }
  },

  /**
   * Update staff member
   */
  updateStaff: async (id: number, updates: UpdateStaffData): Promise<Staff> => {
    try {
      console.log('🔄 Updating staff member:', id, updates);
      const response = await apiClient.put(`/staff/${id}`, updates);
      console.log('📡 Update staff API response:', response.data);
      
      // Handle both direct response and wrapped response
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('❌ Error updating staff member:', error);
      throw error;
    }
  },

  /**
   * Delete staff member
   */
  deleteStaff: async (id: number): Promise<void> => {
    try {
      console.log('🗑️ Deleting staff member:', id);
      await apiClient.delete(`/staff/${id}`);
      console.log('✅ Staff member deleted successfully');
    } catch (error: any) {
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