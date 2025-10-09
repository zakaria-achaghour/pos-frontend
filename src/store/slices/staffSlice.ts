import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { staffAPI } from '../../api/staff';

interface StaffMember {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'manager' | 'cashier' | 'waiter' | 'kitchen';
  status: 'active' | 'inactive' | 'on-break' | 'vacation';
  hireDate: string;
  salary: number;
  shiftSchedule: {
    monday: { start: string; end: string; isWorking: boolean };
    tuesday: { start: string; end: string; isWorking: boolean };
    wednesday: { start: string; end: string; isWorking: boolean };
    thursday: { start: string; end: string; isWorking: boolean };
    friday: { start: string; end: string; isWorking: boolean };
    saturday: { start: string; end: string; isWorking: boolean };
    sunday: { start: string; end: string; isWorking: boolean };
  };
  performance: {
    ordersCompleted: number;
    revenueGenerated: number;
    customerRating: number;
    punctualityScore: number;
    tips: number;
  };
  currentShift?: {
    clockIn: string;
    isActive: boolean;
    tableAssignments?: number[];
  };
}

interface StaffState {
  staff: StaffMember[];
  loading: boolean;
  error: string | null;
  validationErrors: Record<string, string[]>;
  successMessage: string | null;
  selectedMember: StaffMember | null;
  roleFilter: 'all' | 'manager' | 'cashier' | 'waiter' | 'kitchen';
  viewMode: 'grid' | 'performance' | 'schedule';
}

// Map API Staff to local StaffMember format
const mapApiStaffToLocal = (apiStaff: any): StaffMember => {
  return {
    id: apiStaff.id,
    name: apiStaff.first_name && apiStaff.last_name 
      ? `${apiStaff.first_name} ${apiStaff.last_name}` 
      : apiStaff.name || 'Unknown',
    email: apiStaff.email || '',
    phone: apiStaff.phone || '',
    role: apiStaff.role || 'waiter',
    status: apiStaff.is_active ? 'active' : 'inactive',
    hireDate: apiStaff.hire_date || apiStaff.created_at || new Date().toISOString().split('T')[0],
    salary: apiStaff.hourly_rate || 0,
    // Set default values for complex fields not provided by API
    shiftSchedule: {
      monday: { start: '09:00', end: '17:00', isWorking: true },
      tuesday: { start: '09:00', end: '17:00', isWorking: true },
      wednesday: { start: '09:00', end: '17:00', isWorking: true },
      thursday: { start: '09:00', end: '17:00', isWorking: true },
      friday: { start: '09:00', end: '17:00', isWorking: true },
      saturday: { start: '10:00', end: '18:00', isWorking: true },
      sunday: { start: '10:00', end: '18:00', isWorking: false }
    },
    performance: {
      ordersCompleted: 0,
      revenueGenerated: 0,
      customerRating: 4.5,
      punctualityScore: 90,
      tips: 0
    }
  };
};

const initialState: StaffState = {
  staff: [],
  loading: false,
  error: null,
  validationErrors: {},
  successMessage: null,
  selectedMember: null,
  roleFilter: 'all',
  viewMode: 'grid',
};

// Async thunks
export const fetchStaff = createAsyncThunk(
  'staff/fetchStaff',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔄 Fetching staff data from API...');
      const response = await staffAPI.getStaff();
      console.log('✅ API Response:', response);
      
      const mappedStaff = response.data.map(mapApiStaffToLocal);
      console.log('📝 Mapped staff data:', mappedStaff);
      
      return mappedStaff;
    } catch (error: any) {
      console.error('❌ Error fetching staff:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch staff data');
    }
  }
);

export const createStaffMember = createAsyncThunk(
  'staff/createStaffMember',
  async (staffData: any, { rejectWithValue, getState }) => {
    try {
      console.log('➕ Creating new staff member:', staffData);
      
      // Get user from auth state
      const state = getState() as any;
      const userId = state.auth.user?.id || 1;
      
      // Generate employee_id if not provided
      const employeeId = staffData.employee_id || `EMP${Date.now()}`;
      
      const createData = {
        user_id: userId,
        employee_id: employeeId,
        first_name: staffData.first_name,
        last_name: staffData.last_name,
        email: staffData.email,
        position: staffData.role, // Backend expects 'position' instead of 'role'
        phone: staffData.phone,
        hire_date: staffData.hireDate,
        hourly_rate: staffData.salary,
        password: staffData.password
      };
      
      console.log('📤 Sending data to API:', createData);
      
      const response = await fetch('/api/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(createData)
      });
      
      const responseData = await response.json();
      console.log('📡 API Response:', responseData);
      
      if (!response.ok) {
        if (responseData.errors) {
          return rejectWithValue({ errors: responseData.errors, message: responseData.message });
        } else {
          return rejectWithValue({ message: responseData.message || 'Failed to add staff member' });
        }
      }
      
      return mapApiStaffToLocal(responseData.data || responseData);
    } catch (error: any) {
      console.error('❌ Error creating staff:', error);
      return rejectWithValue({ message: 'Failed to add staff member. Please try again.' });
    }
  }
);

export const deleteStaffMember = createAsyncThunk(
  'staff/deleteStaffMember',
  async (memberId: number, { rejectWithValue }) => {
    try {
      console.log('🗑️ Deleting staff member:', memberId);
      await staffAPI.deleteStaff(memberId);
      return memberId;
    } catch (error: any) {
      console.error('❌ Error deleting staff:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to delete staff member');
    }
  }
);

const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.validationErrors = {};
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    setSelectedMember: (state, action: PayloadAction<StaffMember | null>) => {
      state.selectedMember = action.payload;
    },
    setRoleFilter: (state, action: PayloadAction<'all' | 'manager' | 'cashier' | 'waiter' | 'kitchen'>) => {
      state.roleFilter = action.payload;
    },
    setViewMode: (state, action: PayloadAction<'grid' | 'performance' | 'schedule'>) => {
      state.viewMode = action.payload;
    },
    updateStaffStatus: (state, action: PayloadAction<{ memberId: number; status: StaffMember['status'] }>) => {
      const { memberId, status } = action.payload;
      const staff = state.staff.find(s => s.id === memberId);
      if (staff) {
        staff.status = status;
      }
    },
    clockInOut: (state, action: PayloadAction<number>) => {
      const memberId = action.payload;
      const member = state.staff.find(s => s.id === memberId);
      if (member) {
        const isClockingIn = !member.currentShift?.isActive;
        const currentTime = new Date().toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        });

        if (isClockingIn) {
          member.currentShift = {
            clockIn: currentTime,
            isActive: true,
            ...(member.role === 'waiter' && { tableAssignments: [] })
          };
        } else {
          delete member.currentShift;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch staff
      .addCase(fetchStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStaff.fulfilled, (state, action) => {
        state.loading = false;
        state.staff = action.payload;
        state.error = null;
      })
      .addCase(fetchStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create staff
      .addCase(createStaffMember.pending, (state) => {
        state.loading = true;
        state.validationErrors = {};
        state.error = null;
      })
      .addCase(createStaffMember.fulfilled, (state, action) => {
        state.loading = false;
        state.staff.push(action.payload);
        state.successMessage = 'Staff member added successfully!';
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(createStaffMember.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        if (payload.errors) {
          state.validationErrors = payload.errors;
          state.error = payload.message || 'Validation errors occurred';
        } else {
          state.error = payload.message || 'Failed to add staff member';
        }
      })
      // Delete staff
      .addCase(deleteStaffMember.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteStaffMember.fulfilled, (state, action) => {
        state.loading = false;
        state.staff = state.staff.filter(s => s.id !== action.payload);
        state.successMessage = 'Staff member deleted successfully!';
      })
      .addCase(deleteStaffMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Selectors
export const selectStaff = (state: { staff: StaffState }) => state.staff;
export const selectStaffList = (state: { staff: StaffState }) => state.staff.staff;
export const selectStaffLoading = (state: { staff: StaffState }) => state.staff.loading;
export const selectStaffError = (state: { staff: StaffState }) => state.staff.error;
export const selectValidationErrors = (state: { staff: StaffState }) => state.staff.validationErrors;
export const selectSuccessMessage = (state: { staff: StaffState }) => state.staff.successMessage;
export const selectSelectedMember = (state: { staff: StaffState }) => state.staff.selectedMember;
export const selectRoleFilter = (state: { staff: StaffState }) => state.staff.roleFilter;
export const selectViewMode = (state: { staff: StaffState }) => state.staff.viewMode;

export const selectFilteredStaff = (state: { staff: StaffState }) => {
  const { staff, roleFilter } = state.staff;
  return staff.filter(member => roleFilter === 'all' || member.role === roleFilter);
};

export const selectStaffStats = (state: { staff: StaffState }) => {
  const { staff } = state.staff;
  return {
    total: staff.length,
    active: staff.filter(s => s.status === 'active').length,
    onShift: staff.filter(s => s.currentShift?.isActive).length,
    totalSalary: staff.reduce((sum, s) => sum + s.salary, 0)
  };
};

export const {
  clearError,
  clearSuccessMessage,
  setSelectedMember,
  setRoleFilter,
  setViewMode,
  updateStaffStatus,
  clockInOut,
} = staffSlice.actions;

export default staffSlice.reducer;
