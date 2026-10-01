import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Permission } from '../api/permissions';
import type { PermissionFormData } from '../types/roles';
import {
  useGetPermissionsQuery,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
} from '@/services/permissionsApi';
import type { ApiError } from '@/services/baseApi';

interface PaginationInfo {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
}

const PER_PAGE = 15;
const EMPTY: Permission[] = [];
const ACCESS_DENIED = 'Access denied. SuperAdmin privileges required.';

const messageOf = (err: unknown, fallback: string): string => {
  const e = err as Partial<ApiError> | undefined;
  if (e?.status === 403) return ACCESS_DENIED;
  return e?.message || fallback;
};

/**
 * Permissions admin. Server state lives in RTK Query; this hook holds UI state
 * (search, page, selection, messages).
 */
export function usePermissionManagement() {
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [dismissedQueryError, setDismissedQueryError] = useState<unknown>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  const {
    data,
    isLoading,
    error: queryError,
    refetch,
  } = useGetPermissionsQuery(
    { page, per_page: PER_PAGE, ...(searchQuery && { search: searchQuery }) },
    { refetchOnMountOrArgChange: true }
  );
  const [createMutation] = useCreatePermissionMutation();
  const [updateMutation] = useUpdatePermissionMutation();
  const [deleteMutation] = useDeletePermissionMutation();

  // The API may answer with a bare array or a paginator
  const permissions = useMemo(() => (Array.isArray(data) ? data : data?.data ?? EMPTY), [data]);

  const pagination = useMemo<PaginationInfo>(() => {
    if (Array.isArray(data)) {
      return { currentPage: 1, lastPage: 1, perPage: data.length, total: data.length };
    }
    return {
      currentPage: Number(data?.current_page ?? page) || page,
      lastPage: Number(data?.last_page ?? 1) || 1,
      perPage: Number(data?.per_page ?? permissions.length) || PER_PAGE,
      total: Number(data?.total ?? permissions.length) || permissions.length,
    };
  }, [data, page, permissions.length]);

  const queryErrorMessage =
    queryError && queryError !== dismissedQueryError
      ? messageOf(queryError, 'Failed to fetch permissions')
      : null;
  const error = actionError ?? queryErrorMessage;

  // Auto-clear messages
  useEffect(() => {
    if (!successMessage) return undefined;
    const timer = setTimeout(() => setSuccessMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    if (!error) return undefined;
    const timer = setTimeout(() => {
      setActionError(null);
      setDismissedQueryError(queryError);
    }, 5000);
    return () => clearTimeout(timer);
  }, [error, queryError]);

  // Runs a mutation with shared loading / error / success handling
  const perform = useCallback(
    async <T,>(action: () => Promise<T>, success: string, failure: string): Promise<T> => {
      setActionLoading(true);
      setActionError(null);
      setValidationErrors({});
      try {
        const result = await action();
        setSuccessMessage(success);
        return result;
      } catch (err) {
        const apiErr = err as Partial<ApiError>;
        if (apiErr.status === 422 && apiErr.errors) setValidationErrors(apiErr.errors);
        setActionError(messageOf(err, failure));
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    []
  );

  const fetchPermissions = async (nextPage?: number) => {
    if (nextPage !== undefined && nextPage !== page) {
      setPage(nextPage);
      return;
    }
    await refetch();
  };

  const createPermission = async (formData: PermissionFormData) => {
    await perform(
      () => createMutation({ name: formData.name }).unwrap(),
      'Permission created successfully!',
      'Failed to create permission'
    );
    setPage(1);
  };

  const updatePermission = async (id: number, formData: PermissionFormData) => {
    await perform(
      () => updateMutation({ id, data: { name: formData.name } }).unwrap(),
      'Permission updated successfully!',
      'Failed to update permission'
    );
    setEditingPermission(null);
  };

  const deletePermission = async (id: number) => {
    // Step back a page if this deletion empties the current one
    const remaining = Math.max(0, pagination.total - 1) - (pagination.currentPage - 1) * pagination.perPage;
    const nextPage = remaining > 0 || pagination.currentPage === 1 ? pagination.currentPage : pagination.currentPage - 1;
    try {
      await perform(
        () => deleteMutation(id).unwrap(),
        'Permission deleted successfully!',
        'Failed to delete permission'
      );
      setPage(Math.max(1, nextPage));
    } catch {
      // error already surfaced through perform
    }
  };

  const goToPage = (next: number) => {
    if (next < 1 || next > pagination.lastPage || next === pagination.currentPage) return;
    setPage(next);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const clearError = () => {
    setActionError(null);
    setDismissedQueryError(queryError);
    setValidationErrors({});
  };

  const clearSuccessMessage = () => {
    setSuccessMessage(null);
  };

  return {
    // Data
    permissions,
    selectedPermission,
    editingPermission,

    // UI State
    loading: isLoading || actionLoading,
    error,
    successMessage,
    validationErrors,
    pagination,
    searchQuery,

    // Actions
    fetchPermissions,
    createPermission,
    updatePermission,
    deletePermission,
    goToPage,
    handleSearch,

    // UI Actions
    setSelectedPermission,
    setEditingPermission,
    clearError,
    clearSuccessMessage,
  };
}
