import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Alert from '@/components/ui/alert/Alert';
import Modal from '@/components/common/Modal';
import PaginationWithText from '@/components/ui/pagination/PaginationWithText';
import OrderList from '@/components/pos/orders/OrderList';
import PaymentModal from '@/components/pos/orders/PaymentModal';
import { useOrderManagement } from '@/hooks/useOrderManagement';
import { orderAPI } from '@/api/orders';
import type { Order, OrderStatus } from '@/types/order';

export default function OrdersManagement() {
  const navigate = useNavigate();
  const {
    // Data
    filteredOrders,

    // UI State
    statusFilter,
    typeFilter,
    tableFilter,
    searchTerm,
    loading,
    error,
    successMessage,
    pagination,
    orderStats,

    // Actions
    fetchOrders,
    deleteOrder,
    updateOrderStatus,
    goToPage,

    // UI Actions
    setStatusFilter,
    setTypeFilter,
    setTableFilter,
    setSearchTerm,
  } = useOrderManagement(12); // 12 orders per page

  // Local modal states
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [orderToUpdateStatus, setOrderToUpdateStatus] = useState<{order: Order; newStatus: OrderStatus} | null>(null);
  const [orderToPayment, setOrderToPayment] = useState<Order | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true); // Auto-refresh toggle

  // Auto-refresh when there are preparing orders
  useEffect(() => {
    if (!autoRefresh) return;

    // Check if there are any preparing orders
    const hasPreparingOrders = filteredOrders.some(order => order.status === 'preparing');
    
    if (hasPreparingOrders) {
      // Refresh every 30 seconds when there are preparing orders
      const interval = setInterval(() => {
        console.log('Auto-refreshing orders (preparing orders detected)');
        fetchOrders();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [filteredOrders, autoRefresh, fetchOrders]);

  // Handler for delete request (opens confirmation modal)
  const handleDeleteRequest = (id: number) => {
    const order = filteredOrders.find(o => o.id === id);
    if (order) {
      setOrderToDelete(order);
    }
  };

  const handleConfirmDelete = async () => {
    if (!orderToDelete) return;
    try {
      await deleteOrder(orderToDelete.id);
      setOrderToDelete(null);
    } catch (error) {
      // Error handled in hook
    }
  };

  // Handler for status update request
  const handleUpdateStatusRequest = (id: number, newStatus: OrderStatus) => {
    const order = filteredOrders.find(o => o.id === id);
    if (order) {
      setOrderToUpdateStatus({ order, newStatus });
    }
  };

  const handleConfirmUpdateStatus = async () => {
    if (!orderToUpdateStatus) return;
    try {
      await updateOrderStatus(orderToUpdateStatus.order.id, orderToUpdateStatus.newStatus);
      setOrderToUpdateStatus(null);
    } catch (error: any) {
      // Close modal first so error message is visible
      setOrderToUpdateStatus(null);
      // Error is already set in the hook, but we can log it
      console.error('Failed to update order status:', error);
    }
  };

  // Handler for payment request
  const handlePaymentRequest = (order: Order) => {
    setOrderToPayment(order);
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = async (orderId: number, paymentData: {
    payment_method: string;
    payment_status: string;
    amount_received?: number;
    tip_amount?: number;
    discount_amount?: number;
  }) => {
    try {
      await orderAPI.updatePayment(orderId, paymentData);
      setIsPaymentModalOpen(false);
      setOrderToPayment(null);
      // Refresh orders after payment
      window.location.reload();
    } catch (error: any) {
      console.error('Payment update failed:', error);
      alert(error.response?.data?.message || 'Failed to process payment');
      throw error;
    }
  };

  const handleEdit = (order: Order) => {
    navigate(`/orders/${order.id}/edit`);
  };

  const handleViewDetails = (order: Order) => {
    navigate(`/orders/${order.id}`);
  };

  return (
    <div>
      <PageMeta title="Orders Management | POS System" description="Manage restaurant orders" />
      <PageBreadcrumb pageTitle="Orders Management" />

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-6">
          <Alert
            variant="success"
            title="Success"
            message={successMessage}
          />
        </div>
      )}

      {error && (
        <div className="mb-6">
          <Alert
            variant="error"
            title="Error"
            message={error}
          />
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600 mt-1">
            Manage restaurant orders • {orderStats.total} total
          </p>
        </div>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span>Auto-refresh</span>
          </label>
          <button
            onClick={() => fetchOrders()}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={() => navigate('/orders/new')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Create New Order
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total</div>
          <div className="text-2xl font-bold text-gray-900">{orderStats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Active</div>
          <div className="text-2xl font-bold text-blue-600">{orderStats.active}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">{orderStats.pending}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Preparing</div>
          <div className="text-2xl font-bold text-orange-600">{orderStats.preparing}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Ready</div>
          <div className="text-2xl font-bold text-emerald-600">{orderStats.ready}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Served</div>
          <div className="text-2xl font-bold text-teal-600">{orderStats.served}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Completed</div>
          <div className="text-2xl font-bold text-green-600">{orderStats.completed}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Cancelled</div>
          <div className="text-2xl font-bold text-red-600">{orderStats.cancelled}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active ({orderStats.active})</option>
              <option value="pending">Pending ({orderStats.pending})</option>
              <option value="accepted">Accepted</option>
              <option value="preparing">Preparing ({orderStats.preparing})</option>
              <option value="ready">Ready ({orderStats.ready})</option>
              <option value="served">Served ({orderStats.served})</option>
              <option value="completed">Completed ({orderStats.completed})</option>
              <option value="cancelled">Cancelled ({orderStats.cancelled})</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Order Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="dine-in">Dine-in</option>
              <option value="takeout">Takeout</option>
              <option value="delivery">Delivery</option>
            </select>
          </div>

          {/* Table Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Table</label>
            <select
              value={tableFilter}
              onChange={(e) => setTableFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Tables</option>
              {/* TODO: Add table options from tables API */}
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow">
        <OrderList
          orders={filteredOrders}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
          onViewDetails={handleViewDetails}
          onUpdateStatus={handleUpdateStatusRequest}
          onPayment={handlePaymentRequest}
          hasFilters={searchTerm !== '' || statusFilter !== 'all' || typeFilter !== 'all' || tableFilter !== 'all'}
        />
      </div>

      {/* Pagination */}
      {filteredOrders.length > 0 && (
        <div className="mt-6">
          <PaginationWithText
            totalPages={pagination.lastPage}
            initialPage={pagination.currentPage}
            onPageChange={goToPage}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {orderToDelete && (
        <Modal
          isOpen={true}
          onClose={() => setOrderToDelete(null)}
          title="Delete Order"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete order <strong>{orderToDelete.orderNumber || `#${orderToDelete.id}`}</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Update Status Confirmation Modal */}
      {orderToUpdateStatus && (
        <Modal
          isOpen={true}
          onClose={() => setOrderToUpdateStatus(null)}
          title="Update Order Status"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to change order{' '}
              <strong>{orderToUpdateStatus.order.orderNumber || `#${orderToUpdateStatus.order.id}`}</strong>{' '}
              status from <strong>{orderToUpdateStatus.order.status}</strong> to{' '}
              <strong>{orderToUpdateStatus.newStatus}</strong>?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setOrderToUpdateStatus(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUpdateStatus}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setOrderToPayment(null);
        }}
        order={orderToPayment}
        onConfirm={handleConfirmPayment}
      />
    </div>
  );
}
