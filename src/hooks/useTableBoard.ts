import { useMemo, useState, useCallback } from 'react';
import { useGetTablesQuery } from '@/services/tablesApi';
import { LIVE_POLL_MS, type ApiError } from '@/services/baseApi';
import type { Table } from '@/types/table';

export type TableBoardFilter = 'all' | 'available' | 'occupied' | 'reserved';

const EMPTY: Table[] = [];

/**
 * Read-only live table board for waiters. Polls, and refetches on its own whenever an
 * order is created, changes status or is paid (shared 'Tables' cache tag).
 */
export const useTableBoard = (perPage = 20) => {
  const [statusFilter, setStatusFilter] = useState<TableBoardFilter>('all');
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, error, refetch } = useGetTablesQuery(
    { page, per_page: perPage, ...(statusFilter !== 'all' && { status: statusFilter }) },
    { pollingInterval: LIVE_POLL_MS, skipPollingIfUnfocused: true, refetchOnMountOrArgChange: true }
  );

  const tables = data?.items ?? EMPTY;

  const tableStats = useMemo(
    () => ({
      total: data?.pagination.total ?? tables.length,
      available: tables.filter((t) => t.status === 'available').length,
      occupied: tables.filter((t) => t.status === 'occupied').length,
      reserved: tables.filter((t) => t.status === 'reserved').length,
    }),
    [data, tables]
  );

  const changeFilter = useCallback((filter: TableBoardFilter) => {
    setStatusFilter(filter);
    setPage(1);
  }, []);

  return {
    tables,
    statusFilter,
    setStatusFilter: changeFilter,
    // true only on first load: background polling never blanks the board
    loading: isLoading,
    refreshing: isFetching,
    error: error ? (error as ApiError).message || 'Failed to load tables' : null,
    pagination: {
      currentPage: data?.pagination.currentPage ?? page,
      lastPage: data?.pagination.lastPage ?? 1,
      total: data?.pagination.total ?? 0,
      perPage: data?.pagination.perPage ?? perPage,
    },
    goToPage: setPage,
    fetchTables: async () => {
      await refetch();
    },
    tableStats,
  };
};
