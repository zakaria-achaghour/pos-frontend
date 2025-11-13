import { useState, useEffect, useCallback } from 'react';
import { orderAPI } from '../api/orders';
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
  PaymentMethod
} from '../types/order';

/**
 * @description Custom hook for managing orders with filtering, pagination, and CRUD operations
 * @param {number} initialPerPage - Number of orders to display per page
 * @returns {UseOrderManagementReturn} Order management state and actions
 */
export const useOrderManagement = (initialPerPage: number = 12): UseOrderManagementReturn => {
  // Data State
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  
  // UI State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<OrderFilter>('all');
  const [typeFilter, setTypeFilter] = useState<OrderTypeFilter>('all');
  const [tableFilter, setTableFilter] = useState<number | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    lastPage: 1,
    perPage: initialPerPage,
    total: 0,
  });
  const [orderStats, setOrderStats] = useState<OrderStats>({
    total: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
    pending: 0,
    preparing: 0,
    ready: 0,
    served: 0,
  });

  // Auto-clear success messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [successMessage]);

  // Calculate stats from orders
  const calculateStats = useCallback((ordersList: Order[]) => {
    const stats: OrderStats = {
      total: ordersList.length,
      active: 0,
      completed: 0,
      cancelled: 0,
      pending: 0,
      preparing: 0,
      ready: 0,
      served: 0,
    };

    ordersList.forEach(order => {
      if (order.status === 'completed') stats.completed++;
      else if (order.status === 'cancelled') stats.cancelled++;
      else stats.active++;

      if (order.status === 'pending') stats.pending++;
      if (order.status === 'preparing') stats.preparing++;
      if (order.status === 'ready') stats.ready++;
      if (order.status === 'served') stats.served++;
    });

    setOrderStats(stats);
  }, []);

  // Filter and search orders - REMOVED: Now using server-side filtering in fetchOrders
  // Client-side filtering was overriding API pagination
  /*
  useEffect(() => {
    let filtered = [...orders];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => {
        if (statusFilter === 'active') {
          return order.status !== 'completed' && order.status !== 'cancelled';
        }
        return order.status === statusFilter;
      });
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(order => order.type === typeFilter);
    }

    // Table filter
    if (tableFilter !== 'all') {
      filtered = filtered.filter(order => order.tableId === tableFilter);
    }

    // Search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.orderNumber?.toLowerCase().includes(term) ||
        order.customer?.name?.toLowerCase().includes(term) ||
        order.table?.number?.toLowerCase().includes(term) ||
        order.items?.some(item => item.menuItem?.name?.toLowerCase().includes(term))
      );
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredOrders(filtered);
    calculateStats(filtered);

    // Update pagination
    const totalPages = Math.ceil(filtered.length / pagination.perPage);
    setPagination(prev => ({
      ...prev,
      total: filtered.length,
      lastPage: totalPages,
      currentPage: Math.min(prev.currentPage, totalPages || 1),
    }));
  }, [orders, statusFilter, typeFilter, tableFilter, searchTerm, pagination.perPage, calculateStats]);
  */

  // Fetch orders from API with server-side filtering
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        page: pagination.currentPage,
        per_page: pagination.perPage,
      };

      // Add filters to API request
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (typeFilter !== 'all') {
        params.type = typeFilter;
      }
      if (tableFilter !== 'all') {
        params.table_id = tableFilter;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await orderAPI.getOrders(params);
      
      const ordersData = Array.isArray(response) ? response : response.data || [];
      setOrders(ordersData);
      setFilteredOrders(ordersData); // Set filtered orders directly from API
      
      // Update pagination from response if available
      if (!Array.isArray(response) && response) {
        setPagination({
          currentPage: Number(response.current_page ?? pagination.currentPage) || pagination.currentPage,
          lastPage: Number(response.last_page ?? 1) || 1,
          perPage: Number(response.per_page ?? ordersData.length) || ordersData.length || pagination.perPage,
          total: Number(response.total ?? ordersData.length) || ordersData.length,
        });
      }

      // Calculate stats from fetched orders
      calculateStats(ordersData);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch orders');
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.perPage, statusFilter, typeFilter, tableFilter, searchTerm, calculateStats]);

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Create new order
  const createOrder = async (data: CreateOrderData): Promise<Order> => {
    setLoading(true);
    setError(null);
    setValidationErrors({});
    try {
      const newOrder = await orderAPI.createOrder(data);
      setSuccessMessage('Order created successfully!');
      await fetchOrders();
      return newOrder;
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
      }
      setError(err.response?.data?.message || err.message || 'Failed to create order');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update order
  const updateOrder = async (id: number, data: UpdateOrderData) => {
    setLoading(true);
    setError(null);
    try {
      // Note: Update API endpoint when available
      // await orderAPI.updateOrder(id, data);
      setOrders(prev => prev.map(order => 
        order.id === id ? { ...order, ...data } : order
      ));
      setSuccessMessage('Order updated successfully!');
      await fetchOrders();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update order');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete order
  const deleteOrder = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      // Note: Delete API endpoint when available
      // await orderAPI.deleteOrder(id);
      setOrders(prev => prev.filter(order => order.id !== id));
      setSuccessMessage('Order deleted successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete order');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (id: number, status: OrderStatus) => {
    setLoading(true);
    setError(null);
    try {
      await orderAPI.updateOrderStatus(id, status);
      setSuccessMessage(`Order status updated to ${status}!`);
      await fetchOrders(); // Refresh orders after status update
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update order status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add item to order
  const addOrderItem = async (orderId: number, item: AddOrderItemData) => {
    setLoading(true);
    setError(null);
    try {
      await orderAPI.addItem(orderId, item);
      setSuccessMessage('Item added to order!');
      await fetchOrders();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to add item to order');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Remove item from order
  const removeOrderItem = async (orderId: number, itemId: number) => {
    setLoading(true);
    setError(null);
    try {
      await orderAPI.removeItem(orderId, itemId);
      setSuccessMessage('Item removed from order!');
      await fetchOrders();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to remove item from order');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Close order (payment)
  const closeOrder = async (orderId: number, paymentData: { payment_method: PaymentMethod; amount_paid: number }) => {
    setLoading(true);
    setError(null);
    try {
      await orderAPI.closeOrder(orderId, paymentData);
      setSuccessMessage('Order closed successfully!');
      await fetchOrders();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to close order');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Selection actions
  const toggleOrderSelection = (id: number) => {
    setSelectedOrders(prev =>
      prev.includes(id) ? prev.filter(orderId => orderId !== id) : [...prev, id]
    );
  };

  const selectAllOrders = () => {
    setSelectedOrders(filteredOrders.map(order => order.id));
  };

  const clearSelection = () => {
    setSelectedOrders([]);
  };

  // Pagination actions
  const goToPage = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const setPerPage = (perPage: number) => {
    setPagination(prev => ({ ...prev, perPage, currentPage: 1 }));
  };

  // Clear functions
  const clearError = () => setError(null);
  const clearSuccessMessage = () => setSuccessMessage(null);

  // Filter actions that reset to page 1
  const handleSetStatusFilter = (filter: OrderFilter) => {
    setStatusFilter(filter);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleSetTypeFilter = (filter: OrderTypeFilter) => {
    setTypeFilter(filter);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleSetTableFilter = (tableId: number | 'all') => {
    setTableFilter(tableId);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleSetSearchTerm = (term: string) => {
    setSearchTerm(term);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

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
    loading,
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
    setSearchTerm: handleSetSearchTerm,
    clearError,
    clearSuccessMessage,
  };
};
