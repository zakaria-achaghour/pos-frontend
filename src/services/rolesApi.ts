import { rolesAPI, type Role, type RoleUser, type CreateRoleData, type UpdateRoleData } from '@/api/roles';
import type { PaginatedResponse } from '@/api/client';
import { baseApi, run } from './baseApi';

export interface RoleListArgs {
  page?: number;
  per_page?: number;
  search?: string;
}

/** Role assignments change what permissions show, so mutations invalidate both tags. */
export const rolesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getRoles: build.query<PaginatedResponse<Role>, RoleListArgs | void>({
      queryFn: (args) => run(() => rolesAPI.getRoles(args ?? {})),
      providesTags: ['Roles'],
    }),
    getRoleUsers: build.query<RoleUser[], number>({
      queryFn: (id) => run(() => rolesAPI.getRoleUsers(id)),
      providesTags: ['Roles'],
    }),
    createRole: build.mutation<Role, CreateRoleData>({
      queryFn: (body) => run(() => rolesAPI.createRole(body)),
      invalidatesTags: ['Roles', 'Permissions'],
    }),
    updateRole: build.mutation<Role, { id: number; data: UpdateRoleData }>({
      queryFn: ({ id, data }) => run(() => rolesAPI.updateRole(id, data)),
      invalidatesTags: ['Roles', 'Permissions'],
    }),
    deleteRole: build.mutation<void, number>({
      queryFn: (id) => run(() => rolesAPI.deleteRole(id)),
      invalidatesTags: ['Roles', 'Permissions'],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useLazyGetRoleUsersQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = rolesApi;
