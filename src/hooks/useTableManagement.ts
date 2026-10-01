import i18n from '@/i18n';
import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  useGetAdminTablesQuery,
  useCreateTableMutation,
  useUpdateTableMutation,
  useDeleteTableMutation,
  useUpdateAdminTableStatusMutation,
  type AdminTableListArgs,
} from '@/services/tableAdminApi';
import type { ApiError } from '@/services/baseApi';
import type {
  Table,
  TableFormData,
  TableStatus,
  CreateTableRequest,
  UpdateTableRequest
} from '../types/table';
import type { PaginationInfo, UseResourceManagementReturn } from '@/types/components';

export type TableFilter = 'all' | TableStatus;

interface TableStats {
  total: number;
  available: number;
  occupied: number;
  reserved: number;
  maintenance: number;
  totalCapacity: number;
  occupancyRate: number;
}

interface UseTableManagementReturn extends UseResourceManagementReturn<
  Table,
  TableFormData,
  TableStatus,
  TableFilter,
  TableStats
> {
  // Table-specific extensions and aliases
  tables: Table[];
  filteredTables: Table[];
  selectedTable: Table | null;
  editingTable: Table | null;
  statusFilter: TableFilter;
  shapeFilter: string;
  sectionFilter: string;
  minCapacityFilter: number | null;
  maxCapacityFilter: number | null;
  setStatusFilter: (filter: TableFilter) => void;
  setShapeFilter: (shape: string) => void;
  setSectionFilter: (section: string) => void;
  setMinCapacityFilter: (capacity: number | null) => void;
  setMaxCapacityFilter: (capacity: number | null) => void;
  setSelectedTable: (table: Table | null) => void;
  setEditingTable: (table: Table | null) => void;
  fetchTables: (page?: number) => Promise<void>;
  createTable: (data: TableFormData) => Promise<void>;
  updateTable: (id: number, data: Partial<TableFormData>) => Promise<void>;
  deleteTable: (id: number) => Promise<void>;
  updateTableStatus: (id: number, status: TableStatus) => Promise<void>;
  tableStats: TableStats;
  setPerPage: (perPage: number) => void;
}

const EMPTY_TABLES: Table[] = [];

const messageOf = (err: unknown, fallback: string): string => {
  const e = err as Partial<ApiError> | undefined;
  return e?.message || fallback;
};

/**
 * Table admin (CRUD + server-side filters/pagination). Server state lives in RTK Query;
 * mutations invalidate the shared 'Tables' tag, so the waiter board refreshes too.
 */
export const useTableManagement = (initialPerPage: number = 5): UseTableManagementReturn => {
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  // UI State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilterState] = useState<TableFilter>('all');
  const [shapeFilter, setShapeFilterState] = useState<string>('all');
  const [sectionFilter, setSectionFilterState] = useState<string>('');
  const [minCapacityFilter, setMinCapacityFilterState] = useState<number | null>(null);
  const [maxCapacityFilter, setMaxCapacityFilterState] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPageState] = useState(initialPerPage);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [dismissedQueryError, setDismissedQueryError] = useState<unknown>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  // Server-side filters; changing one goes back to page 1
  const queryArgs = useMemo<AdminTableListArgs>(() => {
    const args: AdminTableListArgs = { page, per_page: perPage };
    if (statusFilter !== 'all') args.status = statusFilter;
    if (shapeFilter && shapeFilter !== 'all') args.shape = shapeFilter;
    if (sectionFilter && sectionFilter.trim()) args.section = sectionFilter.trim();
    if (minCapacityFilter !== null && minCapacityFilter > 0) args.min_capacity = minCapacityFilter;
    if (maxCapacityFilter !== null && maxCapacityFilter > 0) args.max_capacity = maxCapacityFilter;
    return args;
  }, [page, perPage, statusFilter, shapeFilter, sectionFilter, minCapacityFilter, maxCapacityFilter]);

  const { data, isLoading, error: queryError, refetch } = useGetAdminTablesQuery(queryArgs, {
    refetchOnMountOrArgChange: true,
  });

  const [createTableMutation] = useCreateTableMutation();
  const [updateTableMutation] = useUpdateTableMutation();
  const [deleteTableMutation] = useDeleteTableMutation();
  const [updateStatusMutation] = useUpdateAdminTableStatusMutation();

  const tables = data?.data ?? EMPTY_TABLES;

  const pagination = useMemo<PaginationInfo>(
    () => ({
      currentPage: Number(data?.current_page ?? page) || page,
      lastPage: Number(data?.last_page ?? 1) || 1,
      perPage: Number(data?.per_page ?? tables.length) || tables.length || perPage,
      total: Number(data?.total ?? tables.length) || tables.length,
    }),
    [data, page, perPage, tables.length]
  );

  const tableStats = useMemo<TableStats>(() => {
    const occupied = tables.filter((t) => t.status === 'occupied').length;
    return {
      total: data?.total || tables.length,
      available: tables.filter((t) => t.status === 'available').length,
      occupied,
      reserved: tables.filter((t) => t.status === 'reserved').length,
      maintenance: tables.filter((t) => ['maintenance', 'out-of-order', 'cleaning'].includes(t.status || '')).length,
      totalCapacity: tables.reduce((sum, t) => sum + (t.capacity || 0), 0),
      occupancyRate: tables.length > 0 ? Math.round((occupied / tables.length) * 100) : 0,
    };
  }, [data, tables]);

  const queryErrorMessage =
    queryError && queryError !== dismissedQueryError ? messageOf(queryError, i18n.t('notifications.tableFetch')) : null;
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

  const clearError = () => {
    setActionError(null);
    setDismissedQueryError(queryError);
  };
  const clearSuccessMessage = () => setSuccessMessage(null);

  // Runs a mutation with shared loading / error / success handling (never throws)
  const perform = useCallback(
    async (action: () => Promise<unknown>, success: string, failure: string): Promise<void> => {
      setActionLoading(true);
      setActionError(null);
      try {
        await action();
        if (success) setSuccessMessage(success);
      } catch (err) {
        setActionError(messageOf(err, failure));
        const apiErr = err as Partial<ApiError>;
        if (apiErr.errors) setValidationErrors(apiErr.errors);
      } finally {
        setActionLoading(false);
      }
    },
    []
  );

  const fetchTables = useCallback(
    async (nextPage?: number) => {
      if (nextPage && nextPage !== page) {
        setPage(nextPage);
        return;
      }
      await refetch();
    },
    [page, refetch]
  );

  // Filter setters reset to the first page
  const setStatusFilter = (filter: TableFilter) => {
    setStatusFilterState(filter);
    setPage(1);
  };
  const setShapeFilter = (shape: string) => {
    setShapeFilterState(shape);
    setPage(1);
  };
  const setSectionFilter = (section: string) => {
    setSectionFilterState(section);
    setPage(1);
  };
  const setMinCapacityFilter = (capacity: number | null) => {
    setMinCapacityFilterState(capacity);
    setPage(1);
  };
  const setMaxCapacityFilter = (capacity: number | null) => {
    setMaxCapacityFilterState(capacity);
    setPage(1);
  };

  // Filtered tables (filters are applied server-side)
  const filteredTables = tables;

  const goToPage = (next: number) => setPage(next);

  const setPerPage = (next: number) => {
    setPerPageState(next);
    setPage(1);
  };

  // Create new table
  const createTable = useCallback(
    async (formData: TableFormData): Promise<void> => {
      if (!formData.number.trim()) {
        setActionError('Please enter a table number');
        return;
      }

      const createData: CreateTableRequest = {
        number: formData.number.trim(),
        capacity: formData.capacity,
        shape: formData.shape,
        status: formData.status || 'available',
        location: {
          section: formData.section,
          floor: formData.floor,
          ...(formData.coordinates && { coordinates: formData.coordinates }),
        },
        features: formData.features || [],
      };

      if (formData.description?.trim()) {
        createData.description = formData.description.trim();
      }

      await perform(
        async () => {
          await createTableMutation(createData).unwrap();
          setSuccessMessage(i18n.t('notifications.tableCreated'));
        },
        '',
        i18n.t('notifications.tableFailed')
      );
    },
    [perform, createTableMutation]
  );

  // Update existing table
  const updateTable = useCallback(
    async (tableId: number, formData: Partial<TableFormData>): Promise<void> => {
      const existingTable = tables.find((t) => t.id === tableId);
      if (!existingTable) {
        setActionError('Table not found');
        return;
      }

      if (formData.number && !formData.number.trim()) {
        setActionError('Please enter a table number');
        return;
      }

      const updateData: Partial<UpdateTableRequest> = {};

      if (formData.number) updateData.number = formData.number.trim();
      if (formData.capacity) updateData.capacity = formData.capacity;
      if (formData.shape) updateData.shape = formData.shape;
      if (formData.status) updateData.status = formData.status;
      if (formData.section || formData.floor || formData.coordinates) {
        updateData.location = {
          section: formData.section || existingTable.location?.section || '',
          floor: (formData.floor || existingTable.location?.floor || '') as number,
          ...(formData.coordinates && { coordinates: formData.coordinates }),
        };
      }
      if (formData.features) updateData.features = formData.features;
      if (formData.description?.trim()) updateData.description = formData.description.trim();

      await perform(
        async () => {
          await updateTableMutation({ id: tableId, data: updateData }).unwrap();
          setSuccessMessage(i18n.t('notifications.tableUpdated'));
        },
        '',
        i18n.t('notifications.tableFailed')
      );
    },
    [tables, perform, updateTableMutation]
  );

  // Delete table
  const deleteTable = useCallback(
    async (tableId: number): Promise<void> => {
      const table = tables.find((t) => t.id === tableId);
      if (!table) {
        setActionError('Table not found');
        return;
      }

      if (table.status === 'occupied') {
        setActionError('Cannot delete occupied table');
        return;
      }

      await perform(
        () => deleteTableMutation(tableId).unwrap(),
        i18n.t('notifications.tableDeleted'),
        i18n.t('notifications.tableFailed')
      );
    },
    [tables, perform, deleteTableMutation]
  );

  // Update table status
  const updateTableStatus = useCallback(
    async (tableId: number, newStatus: TableStatus): Promise<void> => {
      const table = tables.find((t) => t.id === tableId);
      if (!table) {
        setActionError('Table not found');
        return;
      }

      await perform(
        () => updateStatusMutation({ id: tableId, status: newStatus }).unwrap(),
        i18n.t('notifications.tableUpdated'),
        i18n.t('notifications.tableFailed')
      );
    },
    [tables, perform, updateStatusMutation]
  );

  // Selection management
  const clearSelection = () => {
    setSelectedItems([]);
  };

  // Bulk update status
  const bulkUpdateStatus = async (ids: number[], status: TableStatus): Promise<void> => {
    if (ids.length === 0) return;

    setActionLoading(true);
    setActionError(null);
    try {
      await Promise.all(ids.map((id) => updateTableStatus(id, status)));
      setSuccessMessage(i18n.t('notifications.tableUpdated'));
      clearSelection();
    } catch (err) {
      setActionError(messageOf(err, i18n.t('notifications.tableFailed')));
    } finally {
      setActionLoading(false);
    }
  };

  const toggleItemSelection = (id: number) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]));
  };

  return {
    // Base properties
    items: tables,
    filteredItems: filteredTables,
    selectedItem: selectedTable,
    editingItem: editingTable,
    filter: statusFilter,
    selectedItems,

    // Aliases for backward compatibility
    tables,
    filteredTables,
    selectedTable,
    editingTable,
    statusFilter,
    shapeFilter,
    sectionFilter,
    minCapacityFilter,
    maxCapacityFilter,

    // UI State
    viewMode,
    loading: isLoading || actionLoading,
    error,
    successMessage,
    validationErrors,
    pagination,

    // Actions - base
    fetchItems: fetchTables,
    createItem: createTable,
    updateItem: updateTable,
    deleteItem: deleteTable,
    updateItemStatus: updateTableStatus,
    bulkUpdateStatus,
    goToPage,

    // Actions - aliases
    fetchTables,
    createTable,
    updateTable,
    deleteTable,
    updateTableStatus,

    // UI Actions - base
    setViewMode,
    setFilter: setStatusFilter,
    setSelectedItem: setSelectedTable,
    setEditingItem: setEditingTable,
    clearError,
    clearSuccessMessage,
    toggleItemSelection,
    clearSelection,
    setPerPage,

    // UI Actions - aliases
    setStatusFilter,
    setShapeFilter,
    setSectionFilter,
    setMinCapacityFilter,
    setMaxCapacityFilter,
    setSelectedTable,
    setEditingTable,

    // Stats
    stats: tableStats,
    tableStats,
  };
};
