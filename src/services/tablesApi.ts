import apiClient from '@/api/client';
import type { Table } from '@/types/table';
import { baseApi, run } from './baseApi';
import { toPage, type Page } from './adapter';

export interface TableListArgs {
  page?: number;
  per_page?: number;
  status?: string;
}

export const tablesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Tagged 'Tables': any order create / status change / payment refreshes the table board
    getTables: build.query<Page<Table>, TableListArgs | void>({
      queryFn: (args) =>
        run(async () => toPage<Table>((await apiClient.get('/tables', { params: args ?? {} })).data)),
      providesTags: ['Tables'],
    }),
  }),
});

export const { useGetTablesQuery } = tablesApi;
