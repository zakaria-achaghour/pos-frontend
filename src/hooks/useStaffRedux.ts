import { useAppSelector, useAppDispatch } from '../store/hooks';
import { useEffect } from 'react';
import {
  selectStaffList,
  selectStaffLoading,
  selectStaffError,
  selectValidationErrors,
  selectSuccessMessage,
  selectSelectedMember,
  selectRoleFilter,
  selectViewMode,
  selectFilteredStaff,
  selectStaffStats,
  fetchStaff,
  createStaffMember,
  deleteStaffMember,
  clearError,
  clearSuccessMessage,
  setSelectedMember,
  setRoleFilter,
  setViewMode,
  updateStaffStatus,
  clockInOut,
} from '../store/slices/staffSlice';

interface StaffFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: 'manager' | 'cashier' | 'waiter' | 'kitchen';
  salary: number;
  hireDate: string;
  password: string;
  employee_id: string;
}

export const useStaff = () => {
  const dispatch = useAppDispatch();
  
  const staff = useAppSelector(selectStaffList);
  const loading = useAppSelector(selectStaffLoading);
  const error = useAppSelector(selectStaffError);
  const validationErrors = useAppSelector(selectValidationErrors);
  const successMessage = useAppSelector(selectSuccessMessage);
  const selectedMember = useAppSelector(selectSelectedMember);
  const roleFilter = useAppSelector(selectRoleFilter);
  const viewMode = useAppSelector(selectViewMode);
  const filteredStaff = useAppSelector(selectFilteredStaff);
  const stats = useAppSelector(selectStaffStats);

  // Auto-fetch staff on mount
  useEffect(() => {
    if (staff.length === 0) {
      dispatch(fetchStaff());
    }
  }, [dispatch, staff.length]);

  const handleAddStaff = async (formData: StaffFormData) => {
    const result = await dispatch(createStaffMember(formData));
    return createStaffMember.fulfilled.match(result);
  };

  const handleDeleteStaff = async (memberId: number) => {
    const result = await dispatch(deleteStaffMember(memberId));
    return deleteStaffMember.fulfilled.match(result);
  };

  const handleStatusChange = (memberId: number, status: any) => {
    dispatch(updateStaffStatus({ memberId, status }));
  };

  const handleClockInOut = (memberId: number) => {
    dispatch(clockInOut(memberId));
  };

  const refreshStaff = () => {
    dispatch(fetchStaff());
  };

  return {
    staff,
    loading,
    error,
    validationErrors,
    successMessage,
    selectedMember,
    roleFilter,
    viewMode,
    filteredStaff,
    stats,
    
    // Actions
    handleAddStaff,
    handleDeleteStaff,
    handleStatusChange,
    handleClockInOut,
    refreshStaff,
    clearError: () => dispatch(clearError()),
    clearSuccessMessage: () => dispatch(clearSuccessMessage()),
    setSelectedMember: (member: any) => dispatch(setSelectedMember(member)),
    setRoleFilter: (filter: any) => dispatch(setRoleFilter(filter)),
    setViewMode: (mode: any) => dispatch(setViewMode(mode)),
  };
};