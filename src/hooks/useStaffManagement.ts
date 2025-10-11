import { useState, useEffect } from 'react';
import { useAuth } from './useAuthRedux';
import { staffAPI } from '../api/staff';
import type { Staff } from '../api/staff';
import type { StaffMember, StaffFormData, StaffStatus, StaffRole } from '../types/staff';

// Map API Staff to local StaffMember format
const mapApiStaffToLocal = (apiStaff: Staff): StaffMember => {
  return {
    id: apiStaff.id,
    name: apiStaff.name || 'Unknown',
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

export type ViewMode = 'grid' | 'performance' | 'schedule';
export type StaffFilter = 'all' | StaffRole;

interface UseStaffManagementReturn {
  // Data
  staff: StaffMember[];
  filteredStaff: StaffMember[];
  selectedMember: StaffMember | null;
  editingMember: StaffMember | null;
  
  // UI State
  viewMode: ViewMode;
  roleFilter: StaffFilter;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  validationErrors: Record<string, string[]>;
  
  // Actions
  fetchStaff: () => Promise<void>;
  createStaff: (data: StaffFormData) => Promise<void>;
  updateStaff: (id: number, data: Partial<StaffFormData>) => Promise<void>;
  deleteStaff: (id: number) => Promise<void>;
  updateStaffStatus: (id: number, status: StaffStatus) => Promise<void>;
  clockInOut: (id: number) => Promise<void>;
  
  // UI Actions
  setViewMode: (mode: ViewMode) => void;
  setRoleFilter: (filter: StaffFilter) => void;
  setSelectedMember: (member: StaffMember | null) => void;
  setEditingMember: (member: StaffMember | null) => void;
  clearError: () => void;
  clearSuccessMessage: () => void;
  
  // Computed values
  staffStats: {
    total: number;
    active: number;
    onShift: number;
    totalSalary: number;
  };
}

export function useStaffManagement(): UseStaffManagementReturn {
  const { user } = useAuth();
  
  // Data state
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<StaffMember | null>(null);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  
  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [roleFilter, setRoleFilter] = useState<StaffFilter>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  // Auto-clear messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Fetch staff data from API
  const fetchStaff = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await staffAPI.getStaff();
      const mappedStaff = response.data.map(mapApiStaffToLocal);
      setStaff(mappedStaff);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch staff data');
    } finally {
      setLoading(false);
    }
  };

  // Create new staff member
  const createStaff = async (formData: StaffFormData) => {
    setLoading(true);
    setError(null);
    setValidationErrors({});

    try {
      const userId = user?.id || 1;
      const employeeId = formData.employee_id || `EMP${Date.now()}`;

      const createData = {
        name: `${formData.first_name} ${formData.last_name}`,
        email: formData.email,
        role: formData.role,
        phone: formData.phone,
        hire_date: formData.hireDate,
        hourly_rate: formData.salary,
        password: formData.password,
      };

      await staffAPI.createStaff(createData);
      await fetchStaff();
      setSuccessMessage('Staff member added successfully!');
    } catch (error: any) {
      if (error.response?.status === 422 && error.response?.data?.errors) {
        setValidationErrors(error.response.data.errors);
        setError(error.response.data.message || 'Validation errors occurred');
      } else {
        setError(error.response?.data?.message || 'Failed to add staff member');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update staff member
  const updateStaff = async (id: number, formData: Partial<StaffFormData>) => {
    setLoading(true);
    setError(null);
    setValidationErrors({});

    try {
      const updateData: any = {};
      
      if (formData.first_name && formData.last_name) {
        updateData.name = `${formData.first_name} ${formData.last_name}`;
      }
      if (formData.email) updateData.email = formData.email;
      if (formData.role) updateData.role = formData.role;
      if (formData.phone) updateData.phone = formData.phone;
      if (formData.hireDate) updateData.hire_date = formData.hireDate;
      if (formData.salary) updateData.hourly_rate = formData.salary;
      if (formData.password) updateData.password = formData.password;

      await staffAPI.updateStaff(id, updateData);
      await fetchStaff();
      setSuccessMessage('Staff member updated successfully!');
      setEditingMember(null);
    } catch (error: any) {
      if (error.response?.status === 422 && error.response?.data?.errors) {
        setValidationErrors(error.response.data.errors);
        setError(error.response.data.message || 'Validation errors occurred');
      } else {
        setError(error.response?.data?.message || 'Failed to update staff member');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete staff member
  const deleteStaff = async (id: number) => {
    const member = staff.find(s => s.id === id);
    if (!confirm(`Are you sure you want to delete ${member?.name}?`)) {
      return;
    }

    setLoading(true);
    try {
      await staffAPI.deleteStaff(id);
      setStaff(prev => prev.filter(s => s.id !== id));
      setSuccessMessage('Staff member deleted successfully!');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete staff member');
    } finally {
      setLoading(false);
    }
  };

  // Update staff status (activate/deactivate)
  const updateStaffStatus = async (id: number, status: StaffStatus) => {
    setLoading(true);
    try {
      const isActive = status === 'active';
      await staffAPI.updateStaff(id, { is_active: isActive });
      
      setStaff(prev => prev.map(member => 
        member.id === id ? { ...member, status } : member
      ));
      
      const member = staff.find(s => s.id === id);
      setSuccessMessage(`${member?.name}'s status updated to ${status}`);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  // Clock in/out staff
  const clockInOut = async (id: number) => {
    const member = staff.find(s => s.id === id);
    if (!member) return;

    setLoading(true);
    try {
      const isClockingIn = !member.currentShift?.isActive;
      const currentTime = new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      // For now, update locally. In real app, call API
      setStaff(prev => prev.map(s => 
        s.id === id ? {
          ...s,
          currentShift: isClockingIn ? {
            clockIn: currentTime,
            isActive: true,
            ...(s.role === 'waiter' && { tableAssignments: [] })
          } : undefined
        } : s
      ));
      
      setSuccessMessage(`${member.name} ${isClockingIn ? 'clocked in' : 'clocked out'}`);
    } catch (error: any) {
      setError('Failed to update clock status');
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
    setValidationErrors({});
  };

  // Clear success message
  const clearSuccessMessage = () => {
    setSuccessMessage(null);
  };

  // Load staff data on mount
  useEffect(() => {
    fetchStaff();
  }, []);

  // Filter staff by role
  const filteredStaff = staff.filter(member => 
    roleFilter === 'all' || member.role === roleFilter
  );

  // Computed staff stats
  const staffStats = {
    total: staff.length,
    active: staff.filter(s => s.status === 'active').length,
    onShift: staff.filter(s => s.currentShift?.isActive).length,
    totalSalary: staff.reduce((sum, s) => sum + s.salary, 0)
  };

  return {
    // Data
    staff,
    filteredStaff,
    selectedMember,
    editingMember,
    
    // UI State
    viewMode,
    roleFilter,
    loading,
    error,
    successMessage,
    validationErrors,
    
    // Actions
    fetchStaff,
    createStaff,
    updateStaff,
    deleteStaff,
    updateStaffStatus,
    clockInOut,
    
    // UI Actions
    setViewMode,
    setRoleFilter,
    setSelectedMember,
    setEditingMember,
    clearError,
    clearSuccessMessage,
    
    // Computed values
    staffStats,
  };
}