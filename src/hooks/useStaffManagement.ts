import { useState, useEffect, useRef } from 'react';
import { useAuth } from './useAuthRedux';
import { staffAPI } from '../api/staff';
import { rolesAPI } from '../api/roles';
import type { Staff } from '../api/staff';
import type { StaffMember, StaffFormData, StaffStatus, StaffRole } from '../types/staff';
import type { PaginationInfo, UseResourceManagementReturn } from '@/types/components';

const roleToDepartment = (role: StaffRole): string => {
  switch (role) {
    case 'manager':
      return 'Management';
    case 'cashier':
      return 'Service';
    case 'waiter':
      return 'Service';
    case 'kitchen':
      return 'Kitchen';
    default:
      return 'Service';
  }
};

// Map API Staff to local StaffMember format
const mapApiStaffToLocal = (apiStaff: Partial<Staff> & Record<string, any>): StaffMember => {
  const firstName = apiStaff.first_name ?? '';
  const lastName = apiStaff.last_name ?? '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();

  const rawRole: string | undefined = apiStaff.role ?? apiStaff.position;
  const normalizedRole = (() => {
    if (!rawRole) return 'waiter';
    const roleLower = rawRole.toLowerCase();
    if (roleLower.includes('manager')) return 'manager';
    if (roleLower.includes('cashier')) return 'cashier';
    if (
      roleLower.includes('cook') ||
      roleLower.includes('chef') ||
      roleLower.includes('kitchen')
    ) {
      return 'kitchen';
    }
    if (
      roleLower.includes('server') ||
      roleLower.includes('host') ||
      roleLower.includes('bartender') ||
      roleLower.includes('busser') ||
      roleLower.includes('front')
    ) {
      return 'waiter';
    }
    return 'waiter';
  })();

  const normalizedStatus = (() => {
    const status = typeof apiStaff.status === 'string' ? apiStaff.status.toLowerCase() : undefined;
    if (status && ['active', 'inactive', 'on-break', 'vacation'].includes(status)) {
      return status as StaffMember['status'];
    }
    if (typeof apiStaff.is_active === 'boolean') {
      return apiStaff.is_active ? 'active' : 'inactive';
    }
    return 'inactive';
  })();

  const hireDateSource = apiStaff.hire_date ?? apiStaff.created_at ?? '';
  const hireDate = hireDateSource
    ? String(hireDateSource).split('T')[0]
    : new Date().toISOString().split('T')[0];

  const salaryRaw = apiStaff.hourly_rate;
  const salary =
    typeof salaryRaw === 'string'
      ? Number.parseFloat(salaryRaw) || 0
      : typeof salaryRaw === 'number'
      ? salaryRaw
      : 0;

  // Check if staff has active attendance (clock in without clock out)
  // Backend returns active_attendance as an array
  const hasActiveAttendance = apiStaff.active_attendance && Array.isArray(apiStaff.active_attendance) && apiStaff.active_attendance.length > 0;
  
  if (apiStaff.active_attendance) {
    console.log('📋 Active attendance data for staff:', apiStaff.id, apiStaff.active_attendance);
  }
  
  const currentShift = hasActiveAttendance ? {
    clockIn: new Date(apiStaff.active_attendance[0].clock_in).toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    isActive: true,
    attendanceId: apiStaff.active_attendance[0].id,
    ...(normalizedRole === 'waiter' && { tableAssignments: [] })
  } : undefined;

  return {
    id: apiStaff.id ?? Date.now(),
    name: fullName || apiStaff.name || 'Unknown',
    email: apiStaff.email || '',
    phone: apiStaff.phone || '',
    role: normalizedRole,
    status: normalizedStatus,
    hireDate,
    salary,
    currentShift,
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

interface StaffStats {
  total: number;
  active: number;
  onShift: number;
  totalSalary: number;
}

interface UseStaffManagementReturn extends UseResourceManagementReturn<
  StaffMember,
  StaffFormData,
  StaffStatus,
  StaffFilter,
  StaffStats
> {
  // Staff-specific extensions
  viewMode: ViewMode; // Override to include staff-specific view modes
  clockInOut: (id: number) => Promise<void>;
  availableRoles: Array<{ name: string; label: string }>;
  fetchAvailableRoles: () => Promise<void>;
  
  // Aliases for consistency with existing code
  staff: StaffMember[];
  filteredStaff: StaffMember[];
  selectedMember: StaffMember | null;
  editingMember: StaffMember | null;
  roleFilter: StaffFilter;
  setRoleFilter: (filter: StaffFilter) => void;
  setSelectedMember: (member: StaffMember | null) => void;
  setEditingMember: (member: StaffMember | null) => void;
  fetchStaff: (page?: number) => Promise<void>;
  createStaff: (data: StaffFormData) => Promise<void>;
  updateStaff: (id: number, data: Partial<StaffFormData>) => Promise<void>;
  deleteStaff: (id: number) => Promise<void>;
  updateStaffStatus: (id: number, status: StaffStatus) => Promise<void>;
  staffStats: StaffStats;
}

export function useStaffManagement(): UseStaffManagementReturn {
  const { user } = useAuth();
  
  // Track if we're currently fetching to prevent duplicate calls
  const isFetchingRef = useRef(false);
  
  // Data state
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<StaffMember | null>(null);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  const [availableRoles, setAvailableRoles] = useState<Array<{ name: string; label: string }>>([]);
  
  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [roleFilter, setRoleFilter] = useState<StaffFilter>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    lastPage: 1,
    perPage: 5,
    total: 0,
  });

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
  const fetchStaff = async (page: number = pagination.currentPage) => {
    // Prevent duplicate simultaneous fetches
    if (isFetchingRef.current) {
      console.log('⏭️ Skipping duplicate fetchStaff call');
      return;
    }
    
    console.log('🔄 fetchStaff called with page:', page, 'roleFilter:', roleFilter);
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const filters: {
        page: number;
        per_page: number;
        role?: string;
      } = {
        page,
        per_page: pagination.perPage,
      };
      
      // Add role filter if not 'all'
      if (roleFilter !== 'all') {
        filters.role = roleFilter;
      }
      
      console.log('📤 Sending API request with filters:', filters);
      const response = await staffAPI.getStaff(filters);
      const mappedStaff = response.data.map(mapApiStaffToLocal);
      setStaff(mappedStaff);
      setPagination({
        currentPage: Number(response.current_page ?? page) || page,
        lastPage: Number(response.last_page ?? 1) || 1,
        perPage: Number(response.per_page ?? mappedStaff.length) || mappedStaff.length || pagination.perPage,
        total: Number(response.total ?? mappedStaff.length) || mappedStaff.length,
      });
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch staff data');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.lastPage || page === pagination.currentPage) {
      return;
    }
    fetchStaff(page);
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
        user_id: userId,
        employee_id: employeeId,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        position: formData.role,
        role: formData.role.charAt(0).toUpperCase() + formData.role.slice(1),
        department: roleToDepartment(formData.role),
        hire_date: formData.hireDate,
        hourly_rate: formData.salary,
        password: formData.password,
        status: 'active',
      };

      await staffAPI.createStaff(createData);
      await fetchStaff(1);
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

      if (formData.employee_id) updateData.employee_id = formData.employee_id;
      if (formData.first_name) updateData.first_name = formData.first_name;
      if (formData.last_name) updateData.last_name = formData.last_name;
      if (formData.email) updateData.email = formData.email;
      if (formData.role) {
        updateData.position = formData.role;
        updateData.department = roleToDepartment(formData.role);
      }
      if (formData.phone) updateData.phone = formData.phone;
      if (formData.hireDate) updateData.hire_date = formData.hireDate;
      if (formData.salary) updateData.hourly_rate = formData.salary;
      if (formData.password) updateData.password = formData.password;

      await staffAPI.updateStaff(id, updateData);
      await fetchStaff(pagination.currentPage);
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
    setLoading(true);
    try {
      await staffAPI.deleteStaff(id);

      const anticipatedTotal = Math.max(0, pagination.total - 1);
      const previousItems = (pagination.currentPage - 1) * pagination.perPage;
      const itemsRemainingOnPage = anticipatedTotal - previousItems;
      const nextPage =
        itemsRemainingOnPage > 0 || pagination.currentPage === 1
          ? pagination.currentPage
          : pagination.currentPage - 1;

      await fetchStaff(Math.max(1, nextPage));
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
      await staffAPI.updateStaff(id, { 
        status,
        is_active: isActive 
      });
      
      setStaff(prev => prev.map(member => 
        member.id === id ? { ...member, status } : member
      ));
      
      const member = staff.find(s => s.id === id);
      setSuccessMessage(`${member?.name}'s status updated to ${status}`);
    } catch (error: any) {
      const apiMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        (error?.response?.data?.errors
          ? Object.values(error.response.data.errors).flat().join(', ')
          : null);
      setError(apiMessage || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  // Clock in/out staff
  const formatTime = (isoString?: string) => {
    if (!isoString) return new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) {
      return isoString;
    }
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Fetch available roles from API
  const fetchAvailableRoles = async () => {
    try {
      console.log('🔍 Fetching available roles from API...');
      const response = await rolesAPI.getRoles({ per_page: 100 }); // Get all roles without pagination
      
      const excludedRoles = new Set(['superadmin', 'owner']);
      const roles = response.data
        .filter((role) => !excludedRoles.has(role.name?.toLowerCase?.() || ''))
        .map((role) => ({
          name: role.name.toLowerCase(),
          label: role.name,
        }));
      
      console.log('📡 Available roles:', roles);
      setAvailableRoles(roles);
    } catch (error: any) {
      console.error('❌ Error fetching available roles:', error);
      // Fallback to default roles if API fails
      setAvailableRoles([
        { name: 'waiter', label: 'Waiter' },
        { name: 'cashier', label: 'Cashier' },
        { name: 'manager', label: 'Manager' },
        { name: 'kitchen', label: 'Kitchen' },
      ]);
    }
  };

  const clockInOut = async (id: number) => {
    const member = staff.find(s => s.id === id);
    if (!member) return;

    setLoading(true);
    setError(null);
    try {
      const isClockingIn = !member.currentShift?.isActive;
      if (isClockingIn) {
        console.log('🕐 Clocking in staff member:', id);
        const record = await staffAPI.clockIn({ staff_id: id });
        console.log('✅ Clock in response:', record);
        const clockInTime = formatTime(record?.clock_in);

        setStaff(prev =>
          prev.map(s =>
            s.id === id
              ? {
                  ...s,
                  currentShift: {
                    clockIn: clockInTime,
                    isActive: true,
                    attendanceId: record?.id,
                    ...(s.role === 'waiter' && { tableAssignments: [] }),
                  },
                }
              : s
          )
        );

        setSuccessMessage(`${member.name} clocked in at ${clockInTime}`);
      } else {
        console.log('🕐 Clocking out staff member:', id);
        const record = await staffAPI.clockOut({ staff_id: id });
        console.log('✅ Clock out response:', record);
        const clockOutTime = formatTime(record?.clock_out);

        setStaff(prev =>
          prev.map(s => {
            if (s.id === id) {
              const { currentShift, ...rest } = s;
              return rest;
            }
            return s;
          })
        );

        setSuccessMessage(`${member.name} clocked out${clockOutTime ? ` at ${clockOutTime}` : ''}`);
      }
    } catch (error: any) {
      const apiMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        (error?.response?.data?.errors
          ? Object.values(error.response.data.errors).flat().join(', ')
          : null);
      setError(apiMessage || 'Failed to update clock status');
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

  // Bulk operations
  const bulkUpdateStatus = async (ids: number[], status: StaffStatus): Promise<void> => {
    if (ids.length === 0) return;
    
    setLoading(true);
    try {
      // Update each staff member's status
      await Promise.all(ids.map(id => updateStaffStatus(id, status)));
      setSuccessMessage(`Successfully updated ${ids.length} staff member(s)`);
      clearSelection();
    } catch (err: any) {
      setError(err.message || 'Failed to update staff members');
    } finally {
      setLoading(false);
    }
  };

  // Selection management
  const toggleItemSelection = (id: number) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  // Load staff data on mount and when role filter changes
  useEffect(() => {
    fetchStaff(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  // Since filtering is now done server-side, filteredStaff is just the staff array
  const filteredStaff = staff;

  // Computed staff stats
  const staffStats = {
    total: pagination.total,
    active: staff.filter(s => s.status === 'active').length,
    onShift: staff.filter(s => s.currentShift?.isActive).length,
    totalSalary: staff.reduce((sum, s) => sum + s.salary, 0)
  };

  return {
    // Data - base properties
    items: staff,
    filteredItems: filteredStaff,
    selectedItem: selectedMember,
    editingItem: editingMember,
    
    // Data - aliases for backward compatibility
    staff,
    filteredStaff,
    selectedMember,
    editingMember,
    availableRoles,
    
    // UI State
    viewMode,
    filter: roleFilter,
    roleFilter,
    loading,
    error,
    successMessage,
    validationErrors,
    pagination,
    selectedItems,
    
    // Actions - base
    fetchItems: fetchStaff,
    createItem: createStaff,
    updateItem: updateStaff,
    deleteItem: deleteStaff,
    updateItemStatus: updateStaffStatus,
    bulkUpdateStatus,
    goToPage,
    
    // Actions - aliases
    fetchStaff,
    createStaff,
    updateStaff,
    deleteStaff,
    updateStaffStatus,
    clockInOut,
    fetchAvailableRoles,
    
    // UI Actions - base
    setViewMode: (mode: 'grid' | 'list') => setViewMode(mode as ViewMode),
    setFilter: setRoleFilter,
    setSelectedItem: setSelectedMember,
    setEditingItem: setEditingMember,
    clearError,
    clearSuccessMessage,
    toggleItemSelection,
    clearSelection,
    
    // UI Actions - aliases
    setRoleFilter,
    setSelectedMember,
    setEditingMember,
    
    // Computed values
    stats: staffStats,
    staffStats,
  };
}
