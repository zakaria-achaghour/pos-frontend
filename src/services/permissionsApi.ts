import { permissionsAPI, type Permission, type CreatePermissionData, type UpdatePermissionData } from '@/api/permissions';
import type { PaginatedResponse } from '@/api/client';
import { baseApi, run } from './baseApi';

export interface PermissionListArgs {
  page?: number;
  per_page?: number;
  search?: string;
}

/** Roles embed their permissions, so changing a permission also refreshes roles. */
export const permissionsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPermissions: build.query<PaginatedResponse<Permission> | Permission[], PermissionListArgs | void>({
      queryFn: (args) => run(() => permissionsAPI.getPermissions(args ?? {})),
      providesTags: ['Permissions'],
    }),
    createPermission: build.mutation<Permission, CreatePermissionData>({
      queryFn: (body) => run(() => permissionsAPI.createPermission(body)),
      invalidatesTags: ['Permissions', 'Roles'],
    }),
    updatePermission: build.mutation<Permission, { id: number; data: UpdatePermissionData }>({
      queryFn: ({ id, data }) => run(() => permissionsAPI.updatePermission(id, data)),
      invalidatesTags: ['Permissions', 'Roles'],
    }),
    deletePermission: build.mutation<void, number>({
      queryFn: (id) => run(() => permissionsAPI.deletePermission(id)),
      invalidatesTags: ['Permissions', 'Roles'],
    }),
  }),
});

export const {
  useGetPermissionsQuery,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
} = permissionsApi;
