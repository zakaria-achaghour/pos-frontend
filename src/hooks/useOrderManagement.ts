import i18n from '@/i18n';
import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  useGetOrdersQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useUpdateOrderStatusMutation,
  useAddOrderItemMutation,
  useRemoveOrderItemMutation,
  useCloseOrderMutation,
  type OrderListArgs,
} from '@/services/ordersApi';
import { LIVE_POLL_MS, type ApiError } from '@/services/baseApi';
import type {
  Order,
  OrderFilter,
  OrderTypeFilter,
  OrderStats,
  PaginationInfo,
  UseOrderManagementReturn,
  CreateOrderData,
  UpdateOrderData,
  AddOrderItemData,
  OrderStatus,
  PaymentMethod,
} from '../types/order';

const EMPTY_ORDERS: Order[] = [];


const calculateStats = (orders: Order[]): OrderStats => {
  const stats: OrderStats = {
    total: orders.length,
    active: 0,
    completed: 0,
    cancelled: 0,
    pending: 0,
    preparing: 0,
    ready: 0,
    served: 0,
  };
  orders.forEach((order) => {
    if (order.status === 'completed') stats.completed++;
    else if (order.status === 'cancelled') stats.cancelled++;
    else stats.active++;

    if (order.status === 'pending') stats.pending++;
    if (order.status === 'preparing') stats.preparing++;
    if (order.status === 'ready') stats.ready++;
    if (order.status === 'served') stats.served++;
  });
  return stats;
};

const errorMessage = (err: unknown, fallback: string): string => {
  const e = err as Partial<ApiError> | undefined;
  return e?.message || fallback;
};

/**
 * Orders list + actions. Server state lives in RTK Query (cached, de-duplicated,
 * polled); this hook only holds UI state (filters, selection, messages).
 */
export const useOrderManagement = (
  initialPerPage: number = 12,
  options: { autoRefresh?: boolean; mine?: boolean; initialStatus?: OrderFilter } = {}
): UseOrderManagementReturn => {
  const { autoRefresh = true } = options;
  // UI state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<OrderFilter>(options.initialStatus ?? 'all');
  const [typeFilter, setTypeFilter] = useState<OrderTypeFilter>('all');
  const [tableFilter, setTableFilter] = useState<number | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPageState] = useState(initialPerPage);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [actionLoading, setActionLoading] = useState(false);

  // Filtering happens before server pagination.
  const queryArgs = useMemo<OrderListArgs>(() => {
    const args: OrderListArgs = { page, per_page: perPage };
    if (statusFilter !== 'all') args.status = statusFilter;
    if (typeFilter !== 'all') args.type = typeFilter;
    if (tableFilter !== 'all') args.table_id = tableFilter;
    if (searchTerm.trim()) args.search = searchTerm.trim();
    if (options.mine) args.mine = 1;
    return args;
  }, [page, perPage, statusFilter, typeFilter, tableFilter, searchTerm, options.mine]);

  const { data, isLoading, error: queryError, refetch } = useGetOrdersQuery(queryArgs, {
    pollingInterval: autoRefresh ? LIVE_POLL_MS : 0,
    skipPollingIfUnfocused: true,
    refetchOnMountOrArgChange: true,
  });

  const [createOrderMutation] = useCreateOrderMutation();
  const [updateOrderMutation] = useUpdateOrderMutation();
  const [updateStatusMutation] = useUpdateOrderStatusMutation();
  const [addItemMutation] = useAddOrderItemMutation();
  const [removeItemMutation] = useRemoveOrderItemMutation();
  const [closeOrderMutation] = useCloseOrderMutation();

  const orders = data?.items ?? EMPTY_ORDERS;

  const filteredOrders = orders;

  const orderStats = useMemo(() => calculateStats(filteredOrders), [filteredOrders]);

  const pagination = useMemo<PaginationInfo>(
    () => ({
      currentPage: data?.pagination.currentPage ?? page,
      lastPage: data?.pagination.lastPage ?? 1,
      perPage: data?.pagination.perPage ?? perPage,
      total: data?.pagination.total ?? 0,
    }),
    [data, page, perPage]
  );

  // Auto-clear success messages
  useEffect(() => {
    if (!successMessage) return undefined;
    const timer = setTimeout(() => setSuccessMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

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
        if (apiErr.errors) setValidationErrors(apiErr.errors);
        setActionError(errorMessage(err, failure));
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    []
  );

  const fetchOrders = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const createOrder = (body: CreateOrderData): Promise<Order> =>
    perform(() => createOrderMutation(body).unwrap(), i18n.t('notifications.orderCreated'), i18n.t('notifications.orderFailed'));

  const updateOrder = async (id: number, body: UpdateOrderData) => {
    await perform(
      () => updateOrderMutation({ id, data: body as unknown as Record<string, unknown> }).unwrap(),
      i18n.t('notifications.orderUpdated'),
      i18n.t('notifications.orderFailed')
    );
  };

  // The API has no delete route: "delete" cancels the order (which also frees the table).
  const deleteOrder = async (id: number) => {
    await perform(
      () => updateStatusMutation({ id, status: 'cancelled' }).unwrap(),
      i18n.t('notifications.orderCancelled'),
      i18n.t('notifications.orderFailed')
    );
  };

  const updateOrderStatus = async (id: number, status: OrderStatus) => {
    await perform(
      () => updateStatusMutation({ id, status }).unwrap(),
      i18n.t('notifications.orderUpdated'),
      i18n.t('notifications.orderFailed')
    );
  };

  const addOrderItem = async (orderId: number, item: AddOrderItemData) => {
    await perform(() => addItemMutation({ orderId, item }).unwrap(), i18n.t('notifications.orderItemAdded'), i18n.t('notifications.orderFailed'));
  };

  const removeOrderItem = async (orderId: number, itemId: number) => {
    await perform(
      () => removeItemMutation({ orderId, itemId }).unwrap(),
      i18n.t('notifications.orderItemRemoved'),
      i18n.t('notifications.orderFailed')
    );
  };

  const closeOrder = async (orderId: number, paymentData: { payment_method: PaymentMethod; amount_paid: number }) => {
    await perform(
      () => closeOrderMutation({ orderId, ...paymentData }).unwrap(),
      i18n.t('notifications.orderClosed'),
      i18n.t('notifications.orderFailed')
    );
  };

  // Selection
  const toggleOrderSelection = (id: number) => {
    setSelectedOrders((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const selectAllOrders = () => setSelectedOrders(filteredOrders.map((o) => o.id));
  const clearSelection = () => setSelectedOrders([]);

  // Pagination
  const goToPage = (next: number) => setPage(next);
  const setPerPage = (next: number) => {
    setPerPageState(next);
    setPage(1);
  };

  // Filters reset to page 1
  const handleSetStatusFilter = (filter: OrderFilter) => {
    setStatusFilter(filter);
    setPage(1);
  };
  const handleSetTypeFilter = (filter: OrderTypeFilter) => {
    setTypeFilter(filter);
    setPage(1);
  };
  const handleSetTableFilter = (tableId: number | 'all') => {
    setTableFilter(tableId);
    setPage(1);
  };

  const error = actionError ?? (queryError ? errorMessage(queryError, i18n.t('notifications.orderFetch')) : null);

  return {
    // Data
    orders,
    filteredOrders,
    selectedOrder,
    editingOrder,
    selectedOrders,

    // UI State
    viewMode,
    statusFilter,
    typeFilter,
    tableFilter,
    searchTerm,
    // true only for the first load or an action: background polling never flashes a skeleton
    loading: isLoading || actionLoading,
    error,
    successMessage,
    validationErrors,
    pagination,
    orderStats,

    // CRUD Actions
    fetchOrders,
    createOrder,
    updateOrder,
    deleteOrder,
    updateOrderStatus,
    addOrderItem,
    removeOrderItem,
    closeOrder,

    // Selection Actions
    setSelectedOrder,
    setEditingOrder,
    toggleOrderSelection,
    selectAllOrders,
    clearSelection,

    // Pagination Actions
    goToPage,
    setPerPage,

    // Filter Actions
    setViewMode,
    setStatusFilter: handleSetStatusFilter,
    setTypeFilter: handleSetTypeFilter,
    setTableFilter: handleSetTableFilter,
    setSearchTerm: (term: string) => { setSearchTerm(term); setPage(1); },
    clearError: () => setActionError(null),
    clearSuccessMessage: () => setSuccessMessage(null),
  };
};

export default useOrderManagement;
