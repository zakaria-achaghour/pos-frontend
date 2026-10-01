import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Role } from '../api/roles';
import type { RoleFormData } from '../types/roles';
import {
  useGetRolesQuery,
  useLazyGetRoleUsersQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} from '@/services/rolesApi';
import { useGetPermissionsQuery } from '@/services/permissionsApi';
import type { ApiError } from '@/services/baseApi';
import type { Permission } from '../api/permissions';

interface PaginationInfo {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
}

const PER_PAGE = 10;
const EMPTY_ROLES: Role[] = [];
const EMPTY_PERMISSIONS: Permission[] = [];
const ACCESS_DENIED = 'Access denied. SuperAdmin privileges required.';

const messageOf = (err: unknown, fallback: string): string => {
  const e = err as Partial<ApiError> | undefined;
  if (e?.status === 403) return ACCESS_DENIED;
  return e?.message || fallback;
};

/**
 * Roles admin. Server state lives in RTK Query; this hook holds UI state
 * (search, page, selection, messages).
 */
export function useRoleManagement() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
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
  } = useGetRolesQuery(
    { page, per_page: PER_PAGE, ...(searchQuery && { search: searchQuery }) },
    { refetchOnMountOrArgChange: true }
  );
  const { data: permissionsData, refetch: refetchPermissions } = useGetPermissionsQuery();
  const [loadRoleUsers, roleUsersResult] = useLazyGetRoleUsersQuery();
  const [createRoleMutation] = useCreateRoleMutation();
  const [updateRoleMutation] = useUpdateRoleMutation();
  const [deleteRoleMutation] = useDeleteRoleMutation();

  const roles = data?.data ?? EMPTY_ROLES;
  const roleUsers = roleUsersResult.data ?? [];
  const availablePermissions = useMemo(
    () => (Array.isArray(permissionsData) ? permissionsData : permissionsData?.data ?? EMPTY_PERMISSIONS),
    [permissionsData]
  );

  const pagination = useMemo<PaginationInfo>(
    () => ({
      currentPage: Number(data?.current_page ?? page) || page,
      lastPage: Number(data?.last_page ?? 1) || 1,
      perPage: Number(data?.per_page ?? roles.length) || PER_PAGE,
      total: Number(data?.total ?? roles.length) || roles.length,
    }),
    [data, page, roles.length]
  );

  const queryErrorMessage =
    queryError && queryError !== dismissedQueryError ? messageOf(queryError, 'Failed to fetch roles') : null;
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

  const fetchRoles = async (nextPage?: number) => {
    if (nextPage !== undefined && nextPage !== page) {
      setPage(nextPage);
      return;
    }
    await refetch();
  };

  const fetchRoleUsers = async (roleId: number) => {
    try {
      await loadRoleUsers(roleId).unwrap();
    } catch (err) {
      setActionError(messageOf(err, 'Failed to fetch role users'));
    }
  };

  const fetchAvailablePermissions = async () => {
    await refetchPermissions();
  };

  const createRole = async (formData: RoleFormData) => {
    await perform(
      () => createRoleMutation({ name: formData.name, permissions: formData.permissions }).unwrap(),
      'Role created successfully!',
      'Failed to create role'
    );
    setPage(1);
  };

  const updateRole = async (id: number, formData: RoleFormData) => {
    await perform(
      () => updateRoleMutation({ id, data: { name: formData.name, permissions: formData.permissions } }).unwrap(),
      'Role updated successfully!',
      'Failed to update role'
    );
    setEditingRole(null);
  };

  const deleteRole = async (id: number) => {
    // Step back a page if this deletion empties the current one
    const remaining = Math.max(0, pagination.total - 1) - (pagination.currentPage - 1) * pagination.perPage;
    const nextPage = remaining > 0 || pagination.currentPage === 1 ? pagination.currentPage : pagination.currentPage - 1;
    try {
      await perform(() => deleteRoleMutation(id).unwrap(), 'Role deleted successfully!', 'Failed to delete role');
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
    roles,
    selectedRole,
    editingRole,
    roleUsers,
    availablePermissions,

    // UI State
    loading: isLoading || actionLoading,
    error,
    successMessage,
    validationErrors,
    pagination,
    searchQuery,

    // Actions
    fetchRoles,
    fetchRoleUsers,
    fetchAvailablePermissions,
    createRole,
    updateRole,
    deleteRole,
    goToPage,
    handleSearch,

    // UI Actions
    setSelectedRole,
    setEditingRole,
    clearError,
    clearSuccessMessage,
  };
}
