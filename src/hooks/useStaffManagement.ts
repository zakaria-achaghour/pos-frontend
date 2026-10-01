import i18n from '@/i18n';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './useAuthRedux';
import {
  useGetStaffListQuery,
  useLazyGetAssignableRolesQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
  useClockInMutation,
  useClockOutMutation,
} from '@/services/staffApi';
import { errorMessage, validationErrors as getValidationErrors } from '@/lib/errors';
import type { Staff, UpdateStaffData } from '../types/staff';
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

/** Extra fields the staff endpoint may return beyond the base Staff type. */
interface ApiStaffExtras {
  first_name?: string;
  last_name?: string;
  position?: string;
  status?: string;
  active_attendance?: Array<{ id: number; clock_in: string }>;
}

// Map API Staff to local StaffMember format
const mapApiStaffToLocal = (apiStaff: Partial<Staff> & ApiStaffExtras): StaffMember => {
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
    ? (String(hireDateSource).split('T')[0] ?? '')
    : (new Date().toISOString().split('T')[0] ?? '');

  const salaryRaw = apiStaff.hourly_rate;
  const salary =
    typeof salaryRaw === 'string'
      ? Number.parseFloat(salaryRaw) || 0
      : typeof salaryRaw === 'number'
      ? salaryRaw
      : 0;

  // Check if staff has active attendance (clock in without clock out)
  // Backend returns active_attendance as an array
  const activeAttendance = Array.isArray(apiStaff.active_attendance) ? apiStaff.active_attendance[0] : undefined;

  const currentShift = activeAttendance ? {
    clockIn: new Date(activeAttendance.clock_in).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    }),
    isActive: true,
    attendanceId: activeAttendance.id,
    ...(normalizedRole === 'waiter' && { tableAssignments: [] })
  } : undefined;

  return {
    id: apiStaff.id ?? Date.now(),
    name: fullName || apiStaff.name || 'Unknown',
    first_name: firstName,
    last_name: lastName,
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
  StaffStats,
  ViewMode
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

const PER_PAGE = 5;

const DEFAULT_ROLES = [
  { name: 'waiter', label: 'Waiter' },
  { name: 'cashier', label: 'Cashier' },
  { name: 'manager', label: 'Manager' },
  { name: 'kitchen', label: 'Kitchen' },
];

const NO_STAFF: StaffMember[] = [];

const formatTime = (isoString?: string) => {
  const options: Intl.DateTimeFormatOptions = { hour12: false, hour: '2-digit', minute: '2-digit' };
  if (!isoString) return new Date().toLocaleTimeString('en-US', options);
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return date.toLocaleTimeString('en-US', options);
};

export function useStaffManagement(): UseStaffManagementReturn {
  const { user } = useAuth();

  // Selection / editing state
  const [selectedMember, setSelectedMember] = useState<StaffMember | null>(null);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  const [availableRoles, setAvailableRoles] = useState<Array<{ name: string; label: string }>>([]);

  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [roleFilter, setRoleFilterState] = useState<StaffFilter>('all');
  const [page, setPage] = useState(1);
  const [pendingActions, setPendingActions] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  // Server data (role filter is applied server-side)
  const queryArgs = useMemo(
    () => ({ page, per_page: PER_PAGE, ...(roleFilter !== 'all' && { role: roleFilter }) }),
    [page, roleFilter]
  );
  const { data, isLoading, error: queryError, refetch } = useGetStaffListQuery(queryArgs, {
    refetchOnMountOrArgChange: true,
  });
  const [loadRoles] = useLazyGetAssignableRolesQuery();
  const [createStaffMutation] = useCreateStaffMutation();
  const [updateStaffMutation] = useUpdateStaffMutation();
  const [deleteStaffMutation] = useDeleteStaffMutation();
  const [clockInMutation] = useClockInMutation();
  const [clockOutMutation] = useClockOutMutation();

  const staff = useMemo(() => (data ? data.data.map(mapApiStaffToLocal) : NO_STAFF), [data]);

  const pagination = useMemo<PaginationInfo>(() => {
    if (!data) return { currentPage: page, lastPage: 1, perPage: PER_PAGE, total: 0 };
    return {
      currentPage: Number(data.current_page ?? page) || page,
      lastPage: Number(data.last_page ?? 1) || 1,
      perPage: Number(data.per_page ?? staff.length) || staff.length || PER_PAGE,
      total: Number(data.total ?? staff.length) || staff.length,
    };
  }, [data, page, staff.length]);

  // Loading is true for the first load or an action, not for background refetches
  const loading = isLoading || pendingActions > 0;
  const error = actionError ?? (queryError ? errorMessage(queryError, i18n.t('notifications.staffFetch')) : null);

  // Auto-clear messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [successMessage]);

  useEffect(() => {
    if (actionError) {
      const timer = setTimeout(() => setActionError(null), 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [actionError]);

  const setRoleFilter = useCallback((filter: StaffFilter) => {
    setRoleFilterState(filter);
    setPage(1);
  }, []);

  const fetchStaff = useCallback(
    async (target?: number) => {
      if (target !== undefined && target !== page) {
        setPage(target);
        return;
      }
      await refetch();
    },
    [page, refetch]
  );

  const goToPage = (target: number) => {
    if (target < 1 || target > pagination.lastPage || target === pagination.currentPage) return;
    setPage(target);
  };

  // Run a mutation with loading / error / success / validation handling
  const perform = async (
    action: () => Promise<void>,
    opts: { success: string; fallback: string; validate?: boolean; rethrow?: boolean }
  ) => {
    setPendingActions((n) => n + 1);
    setActionError(null);
    if (opts.validate) setValidationErrors({});
    try {
      await action();
      setSuccessMessage(opts.success);
    } catch (err) {
      const fieldErrors = opts.validate ? getValidationErrors(err) : undefined;
      if (fieldErrors) {
        setValidationErrors(fieldErrors);
        setActionError(errorMessage(err, i18n.t('notifications.staffValidation')));
      } else {
        setActionError(errorMessage(err, opts.fallback));
      }
      if (opts.rethrow) throw err;
    } finally {
      setPendingActions((n) => n - 1);
    }
  };

  // Create new staff member
  const createStaff = (formData: StaffFormData) =>
    perform(
      async () => {
        const createData = {
          user_id: user?.id || 1,
          employee_id: formData.employee_id || `EMP${Date.now()}`,
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
        await createStaffMutation(createData).unwrap();
        setPage(1);
      },
      { success: i18n.t('notifications.staffCreated'), fallback: i18n.t('notifications.staffFailed'), validate: true, rethrow: true }
    );

  // Update staff member
  const updateStaff = (id: number, formData: Partial<StaffFormData>) =>
    perform(
      async () => {
        const updateData: UpdateStaffData = {};

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

        await updateStaffMutation({ id, data: updateData }).unwrap();
        setEditingMember(null);
      },
      { success: i18n.t('notifications.staffUpdated'), fallback: i18n.t('notifications.staffFailed'), validate: true, rethrow: true }
    );

  // Delete staff member (step back a page if it was the last one on this page)
  const deleteStaff = (id: number) =>
    perform(
      async () => {
        await deleteStaffMutation(id).unwrap();
        const remaining = Math.max(0, pagination.total - 1) - (pagination.currentPage - 1) * pagination.perPage;
        if (remaining <= 0 && pagination.currentPage > 1) setPage(pagination.currentPage - 1);
      },
      { success: i18n.t('notifications.staffDeleted'), fallback: i18n.t('notifications.staffFailed') }
    );

  // Update staff status (activate/deactivate)
  const updateStaffStatus = (id: number, status: StaffStatus) => {
    return perform(
      async () => {
        await updateStaffMutation({ id, data: { status, is_active: status === 'active' } }).unwrap();
      },
      { success: i18n.t('notifications.staffUpdated'), fallback: i18n.t('notifications.staffFailed') }
    );
  };

  // Fetch available roles from API (falls back to the default roles)
  const fetchAvailableRoles = async () => {
    try {
      setAvailableRoles(await loadRoles().unwrap());
    } catch {
      setAvailableRoles(DEFAULT_ROLES);
    }
  };

  const clockInOut = async (id: number) => {
    const member = staff.find((s) => s.id === id);
    if (!member) return;

    const isClockingIn = !member.currentShift?.isActive;
    let success = '';
    await perform(
      async () => {
        if (isClockingIn) {
          const record = await clockInMutation({ staff_id: id }).unwrap();
          success = i18n.t('notifications.staffClockIn', { name: member.name, time: formatTime(record?.clock_in) });
        } else {
          const record = await clockOutMutation({ staff_id: id }).unwrap();
          success = i18n.t('notifications.staffClockOut', { name: member.name, time: formatTime(record?.clock_out) });
        }
      },
      { success: '', fallback: i18n.t('notifications.staffFailed') }
    );
    if (success) setSuccessMessage(success);
  };

  // Clear error
  const clearError = () => {
    setActionError(null);
    setValidationErrors({});
  };

  const clearSuccessMessage = () => {
    setSuccessMessage(null);
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

  // Bulk operations
  const bulkUpdateStatus = async (ids: number[], status: StaffStatus): Promise<void> => {
    if (ids.length === 0) return;

    setPendingActions((n) => n + 1);
    try {
      await Promise.all(ids.map(id => updateStaffStatus(id, status)));
      setSuccessMessage(i18n.t('notifications.staffUpdated'));
      clearSelection();
    } catch (err) {
      setActionError(errorMessage(err, i18n.t('notifications.staffFailed')));
    } finally {
      setPendingActions((n) => n - 1);
    }
  };

  // Filtering is done server-side, so filteredStaff is just the staff array
  const filteredStaff = staff;

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
    setViewMode,
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
