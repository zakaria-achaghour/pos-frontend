import { staffAPI } from '@/api/staff';
import { rolesAPI } from '@/api/roles';
import { baseApi, run } from './baseApi';

export type StaffListArgs = Parameters<typeof staffAPI.getStaff>[0];
export type StaffListResult = Awaited<ReturnType<typeof staffAPI.getStaff>>;
type CreateStaffInput = Parameters<typeof staffAPI.createStaff>[0];
type UpdateStaffInput = Parameters<typeof staffAPI.updateStaff>[1];
type ClockInput = Parameters<typeof staffAPI.clockIn>[0];
type ClockOutInput = Parameters<typeof staffAPI.clockOut>[0];

export const staffApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getStaffList: build.query<StaffListResult, NonNullable<StaffListArgs>>({
      queryFn: (args) => run(() => staffAPI.getStaff(args)),
      providesTags: ['Staff'],
    }),
    // Roles a staff member can be given (read-only here; roles admin owns the writes)
    getAssignableRoles: build.query<Array<{ name: string; label: string }>, void>({
      queryFn: () =>
        run(async () => {
          const excluded = new Set(['superadmin', 'owner']);
          const response = await rolesAPI.getRoles({ per_page: 100 });
          return response.data
            .filter((role) => !excluded.has(role.name?.toLowerCase?.() || ''))
            .map((role) => ({ name: role.name.toLowerCase(), label: role.name }));
        }),
      providesTags: ['Roles'],
    }),
    createStaff: build.mutation<unknown, CreateStaffInput>({
      queryFn: (data) => run(() => staffAPI.createStaff(data)),
      invalidatesTags: ['Staff'],
    }),
    updateStaff: build.mutation<unknown, { id: number; data: UpdateStaffInput }>({
      queryFn: ({ id, data }) => run(() => staffAPI.updateStaff(id, data)),
      invalidatesTags: ['Staff'],
    }),
    deleteStaff: build.mutation<void, number>({
      queryFn: (id) => run(() => staffAPI.deleteStaff(id)),
      invalidatesTags: ['Staff'],
    }),
    clockIn: build.mutation<Awaited<ReturnType<typeof staffAPI.clockIn>>, ClockInput>({
      queryFn: (data) => run(() => staffAPI.clockIn(data)),
      invalidatesTags: ['Staff', 'Shifts'],
    }),
    clockOut: build.mutation<Awaited<ReturnType<typeof staffAPI.clockOut>>, ClockOutInput>({
      queryFn: (data) => run(() => staffAPI.clockOut(data)),
      invalidatesTags: ['Staff', 'Shifts'],
    }),
  }),
});

export const {
  useGetStaffListQuery,
  useLazyGetAssignableRolesQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
  useClockInMutation,
  useClockOutMutation,
} = staffApi;
