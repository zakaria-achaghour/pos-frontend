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

const isActiveStatus = (status: OrderStatus) => status !== 'completed' && status !== 'cancelled';

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
  options: { autoRefresh?: boolean } = {}
): UseOrderManagementReturn => {
  const { autoRefresh = true } = options;
  // UI state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<OrderFilter>('all');
  const [typeFilter, setTypeFilter] = useState<OrderTypeFilter>('all');
  const [tableFilter, setTableFilter] = useState<number | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPageState] = useState(initialPerPage);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [actionLoading, setActionLoading] = useState(false);

  // Server filters. The API has no `search` and no "active" status, so those are applied below.
  const queryArgs = useMemo<OrderListArgs>(() => {
    const args: OrderListArgs = { page, per_page: perPage };
    if (statusFilter !== 'all' && statusFilter !== 'active') args.status = statusFilter;
    if (typeFilter !== 'all') args.type = typeFilter;
    if (tableFilter !== 'all') args.table_id = tableFilter;
    return args;
  }, [page, perPage, statusFilter, typeFilter, tableFilter]);

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

  const filteredOrders = useMemo(() => {
    let list = orders;
    if (statusFilter === 'active') list = list.filter((o) => isActiveStatus(o.status));
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(term) ||
          String(o.id).includes(term) ||
          o.customer?.name?.toLowerCase().includes(term) ||
          o.table?.number?.toLowerCase().includes(term) ||
          o.items.some((item) => item.menuItem?.name?.toLowerCase().includes(term))
      );
    }
    return list;
  }, [orders, statusFilter, searchTerm]);

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
    perform(() => createOrderMutation(body).unwrap(), 'Order created successfully!', 'Failed to create order');

  const updateOrder = async (id: number, body: UpdateOrderData) => {
    await perform(
      () => updateOrderMutation({ id, data: body as unknown as Record<string, unknown> }).unwrap(),
      'Order updated successfully!',
      'Failed to update order'
    );
  };

  // The API has no delete route: "delete" cancels the order (which also frees the table).
  const deleteOrder = async (id: number) => {
    await perform(
      () => updateStatusMutation({ id, status: 'cancelled' }).unwrap(),
      'Order cancelled successfully!',
      'Failed to cancel order'
    );
  };

  const updateOrderStatus = async (id: number, status: OrderStatus) => {
    await perform(
      () => updateStatusMutation({ id, status }).unwrap(),
      `Order status updated to ${status}!`,
      'Failed to update order status'
    );
  };

  const addOrderItem = async (orderId: number, item: AddOrderItemData) => {
    await perform(() => addItemMutation({ orderId, item }).unwrap(), 'Item added to order!', 'Failed to add item to order');
  };

  const removeOrderItem = async (orderId: number, itemId: number) => {
    await perform(
      () => removeItemMutation({ orderId, itemId }).unwrap(),
      'Item removed from order!',
      'Failed to remove item from order'
    );
  };

  const closeOrder = async (orderId: number, paymentData: { payment_method: PaymentMethod; amount_paid: number }) => {
    await perform(
      () => closeOrderMutation({ orderId, ...paymentData }).unwrap(),
      'Order closed successfully!',
      'Failed to close order'
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

  const error = actionError ?? (queryError ? errorMessage(queryError, 'Failed to fetch orders') : null);

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
    setSearchTerm,
    clearError: () => setActionError(null),
    clearSuccessMessage: () => setSuccessMessage(null),
  };
};

export default useOrderManagement;
