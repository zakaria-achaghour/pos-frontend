import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Custom hooks for specific state slices
export const useAuth = () => useAppSelector((state) => state.auth);
export const useTheme = () => useAppSelector((state) => state.theme);
export const useSidebar = () => useAppSelector((state) => state.sidebar);
export const useStaff = () => useAppSelector((state) => state.staff);
export const useRestaurant = () => useAppSelector((state) => state.restaurant);
export const useMenu = () => useAppSelector((state) => state.menu);
export const useOrders = () => useAppSelector((state) => state.orders);
export const useTables = () => useAppSelector((state) => state.tables);
export const useDashboard = () => useAppSelector((state) => state.dashboard);
export const useKitchen = () => useAppSelector((state) => state.kitchen);
export const useAttendance = () => useAppSelector((state) => state.attendance);
export const useSchedules = () => useAppSelector((state) => state.schedules);

// Validation error hooks
export const useValidationErrors = (slice: keyof RootState) => {
  return useAppSelector((state) => (state[slice] as any)?.validationErrors || {});
};

export const useFieldError = (slice: keyof RootState, field: string) => {
  const validationErrors = useValidationErrors(slice);
  return validationErrors[field]?.[0] || null;
};

export const useHasError = (slice: keyof RootState, field?: string) => {
  const validationErrors = useValidationErrors(slice);
  if (field) {
    return !!(validationErrors[field] && validationErrors[field].length > 0);
  }
  return Object.keys(validationErrors).length > 0;
};

// Loading state hooks
export const useIsLoading = (slice: keyof RootState) => {
  return useAppSelector((state) => (state[slice] as any)?.isLoading || false);
};

export const useIsCreating = (slice: keyof RootState) => {
  return useAppSelector((state) => (state[slice] as any)?.isCreating || false);
};

export const useIsUpdating = (slice: keyof RootState) => {
  return useAppSelector((state) => (state[slice] as any)?.isUpdating || false);
};

export const useIsDeleting = (slice: keyof RootState) => {
  return useAppSelector((state) => (state[slice] as any)?.isDeleting || false);
};

// Error state hooks
export const useError = (slice: keyof RootState) => {
  return useAppSelector((state) => (state[slice] as any)?.error || null);
};

export const useLastError = (slice: keyof RootState) => {
  return useAppSelector((state) => (state[slice] as any)?.lastError || null);
};

// Combined loading and error state hook
export const useAsyncState = (slice: keyof RootState) => {
  const isLoading = useIsLoading(slice);
  const isCreating = useIsCreating(slice);
  const isUpdating = useIsUpdating(slice);
  const isDeleting = useIsDeleting(slice);
  const error = useError(slice);
  const validationErrors = useValidationErrors(slice);
  
  return {
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isProcessing: isLoading || isCreating || isUpdating || isDeleting,
    error,
    validationErrors,
    hasError: !!error || Object.keys(validationErrors).length > 0,
  };
};

// Kitchen-specific hooks
export const useKitchenStats = () => {
  return useAppSelector((state) => {
    const tickets = state.kitchen?.tickets || [];
    return {
      total: tickets.length,
      pending: tickets.filter((t: any) => t.status === 'pending').length,
      preparing: tickets.filter((t: any) => t.status === 'preparing').length,
      ready: tickets.filter((t: any) => t.status === 'ready').length,
      urgent: tickets.filter((t: any) => t.priority === 'urgent').length,
    };
  });
};

// Attendance-specific hooks
export const useAttendanceStats = () => {
  return useAppSelector((state) => {
    const records = state.attendance?.records || [];
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = records.filter((r: any) => r.clock_in?.startsWith(today));
    
    return {
      totalToday: todayRecords.length,
      clockedIn: todayRecords.filter((r: any) => !r.clock_out).length,
      clockedOut: todayRecords.filter((r: any) => r.clock_out).length,
      totalHours: records.reduce((sum: number, r: any) => sum + (r.hours_worked || 0), 0),
    };
  });
};

// Schedule-specific hooks
export const useScheduleStats = () => {
  return useAppSelector((state) => {
    const schedules = state.schedules?.schedules || [];
    const today = new Date().toISOString().split('T')[0];
    const todaySchedules = schedules.filter((s: any) => s.date === today);
    
    return {
      totalToday: todaySchedules.length,
      confirmed: todaySchedules.filter((s: any) => s.status === 'confirmed').length,
      scheduled: todaySchedules.filter((s: any) => s.status === 'scheduled').length,
      cancelled: todaySchedules.filter((s: any) => s.status === 'cancelled').length,
    };
  });
};

// Real-time data hooks
export const useRealTimeUpdates = () => {
  const kitchenStats = useKitchenStats();
  const attendanceStats = useAttendanceStats();
  const scheduleStats = useScheduleStats();
  
  return {
    kitchen: kitchenStats,
    attendance: attendanceStats,
    schedule: scheduleStats,
  };
};