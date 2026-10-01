import { tableAPI } from '@/api/tables';
import type { PaginatedResponse } from '@/api/client';
import type { Table, TableStatus, CreateTableRequest, UpdateTableRequest } from '@/types/table';
import { baseApi, run } from './baseApi';

export interface AdminTableListArgs {
  page?: number;
  per_page?: number;
  status?: string;
  shape?: string;
  section?: string;
  min_capacity?: number;
  max_capacity?: number;
}

/**
 * Table admin (CRUD + filters). Shares the 'Tables' tag with the waiter board
 * (tablesApi), so editing a table refreshes the board too.
 */
export const tableAdminApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAdminTables: build.query<PaginatedResponse<Table>, AdminTableListArgs>({
      queryFn: (args) => run(() => tableAPI.getTables(args)),
      providesTags: ['Tables'],
    }),
    createTable: build.mutation<Table, CreateTableRequest>({
      queryFn: (body) => run(() => tableAPI.createTable(body)),
      invalidatesTags: ['Tables'],
    }),
    updateTable: build.mutation<Table, { id: number; data: Partial<UpdateTableRequest> }>({
      queryFn: ({ id, data }) => run(() => tableAPI.updateTable(id, data)),
      invalidatesTags: ['Tables'],
    }),
    deleteTable: build.mutation<void, number>({
      queryFn: (id) => run(() => tableAPI.deleteTable(id)),
      invalidatesTags: ['Tables'],
    }),
    updateAdminTableStatus: build.mutation<Table, { id: number; status: TableStatus }>({
      queryFn: ({ id, status }) => run(() => tableAPI.updateTableStatus(id, status)),
      invalidatesTags: ['Tables'],
    }),
  }),
});

export const {
  useGetAdminTablesQuery,
  useCreateTableMutation,
  useUpdateTableMutation,
  useDeleteTableMutation,
  useUpdateAdminTableStatusMutation,
} = tableAdminApi;
