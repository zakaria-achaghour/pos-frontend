import { dynamicT } from '@/i18n/dynamic';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Alert from '@/components/ui/alert/Alert';
import { Button, Modal, useToast } from '@/components/kit';
import PaginationWithText from '@/components/ui/pagination/PaginationWithText';
import OrderList from '@/components/pos/orders/OrderList';
import PaymentModal from '@/components/pos/orders/PaymentModal';
import { useOrderManagement } from '@/hooks/useOrderManagement';
import { orderAPI } from '@/api/orders';
import type { Order, OrderStatus, OrderFilter, OrderTypeFilter } from '@/types/order';
import { useCashierShift } from '@/hooks/useCashierShift';
import { useAuth } from '@/hooks/useAuthRedux';
import { errorMessage } from '@/lib/errors';

export default function OrdersManagement() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const toast = useToast();
  const { user } = useAuth();
  const isCashier = user?.role === 'cashier';
  const {
    currentShift,
    requireShift,
    error: shiftError,
  } = useCashierShift({ autoFetch: isCashier });
  const [autoRefresh, setAutoRefresh] = useState(true); // Auto-refresh toggle (RTK Query polling)
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
  } = useOrderManagement(12, { autoRefresh }); // 12 orders per page

  // Local modal states
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [orderToUpdateStatus, setOrderToUpdateStatus] = useState<{order: Order; newStatus: OrderStatus} | null>(null);
  const [orderToPayment, setOrderToPayment] = useState<Order | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

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
    } catch (error) {
      // Close modal first so error message is visible
      setOrderToUpdateStatus(null);
      // Error is already set in the hook, but we can log it
      console.error('Failed to update order status:', error);
    }
  };

  // Handler for payment request
  const handlePaymentRequest = async (order: Order) => {
    if (isCashier) {
      const hasShift = currentShift || (await requireShift());
      if (!hasShift) {
        toast.error(t('orderList.errors.shiftRequired'));
        return;
      }
    }
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
      const updatedOrder = await orderAPI.updatePayment(orderId, paymentData);
      await fetchOrders();
      return updatedOrder;
    } catch (error) {
      console.error('Payment update failed:', error);
      toast.error(errorMessage(error, t('orderList.errors.payment')));
      throw error;
    }
  };

  const handleEdit = (order: Order) => {
    navigate(`/orders/${order.id}`); // no edit route exists; details page handles changes
  };

  const handleViewDetails = (order: Order) => {
    navigate(`/orders/${order.id}`);
  };

  return (
    <div>
      <PageMeta title={t('orderList.meta.title')} description={t('orderList.meta.description')} />
      <PageBreadcrumb hideTitle pageTitle={t('orderList.title')} />

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-6">
          <Alert
            variant="success"
            title={t('orderList.alerts.success')}
            message={successMessage}
          />
        </div>
      )}

      {error && (
        <div className="mb-6">
          <Alert
            variant="error"
            title={t('orderList.alerts.error')}
            message={error}
          />
        </div>
      )}
      {shiftError && (
        <div className="mb-4">
          <Alert
            variant="error"
            title={t('orderList.alerts.shiftWarning')}
            message={shiftError}
          />
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fg">{t('orderList.title')}</h1>
          <p className="text-fg-muted mt-1">
            {t('orderList.subtitle', { count: orderStats.total })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="flex min-h-11 items-center gap-2 text-sm text-fg cursor-pointer px-3 py-2 bg-bg rounded-lg hover:bg-surface-2 transition-colors">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 text-primary border-line rounded focus:ring-primary"
            />
            <span>{t('orderList.autoRefresh')}</span>
          </label>
          <Button size="md" variant="secondary" onClick={() => fetchOrders()} loading={loading}>
            {loading ? t('orderList.refreshing') : t('common.refresh')}
          </Button>
          <Button size="md" onClick={() => navigate('/orders/new')}>
            {t('orderList.createNew')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
        <div className="bg-surface rounded-2xl shadow-sm p-4 border border-line">
          <div className="text-sm text-fg-muted">{t('orderList.stats.total')}</div>
          <div className="text-2xl font-bold text-fg">{orderStats.total}</div>
        </div>
        <div className="bg-surface rounded-2xl shadow-sm p-4 border border-line">
          <div className="text-sm text-fg-muted">{t('orderList.stats.active')}</div>
          <div className="text-2xl font-bold text-primary">{orderStats.active}</div>
        </div>
        <div className="bg-surface rounded-2xl shadow-sm p-4 border border-line">
          <div className="text-sm text-fg-muted">{t('status.pending')}</div>
          <div className="text-2xl font-bold text-warning">{orderStats.pending}</div>
        </div>
        <div className="bg-surface rounded-2xl shadow-sm p-4 border border-line">
          <div className="text-sm text-fg-muted">{t('status.preparing')}</div>
          <div className="text-2xl font-bold text-warning">{orderStats.preparing}</div>
        </div>
        <div className="bg-surface rounded-2xl shadow-sm p-4 border border-line">
          <div className="text-sm text-fg-muted">{t('status.ready')}</div>
          <div className="text-2xl font-bold text-success">{orderStats.ready}</div>
        </div>
        <div className="bg-surface rounded-2xl shadow-sm p-4 border border-line">
          <div className="text-sm text-fg-muted">{t('status.served')}</div>
          <div className="text-2xl font-bold text-success">{orderStats.served}</div>
        </div>
        <div className="bg-surface rounded-2xl shadow-sm p-4 border border-line">
          <div className="text-sm text-fg-muted">{t('status.completed')}</div>
          <div className="text-2xl font-bold text-success">{orderStats.completed}</div>
        </div>
        <div className="bg-surface rounded-2xl shadow-sm p-4 border border-line">
          <div className="text-sm text-fg-muted">{t('status.cancelled')}</div>
          <div className="text-2xl font-bold text-danger">{orderStats.cancelled}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-surface rounded-2xl shadow-sm p-4 border border-line">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-fg mb-2">{t('common.search')}</label>
            <input
              type="text"
              placeholder={t('orderList.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-line rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-fg mb-2">{t('orderList.filters.status')}</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderFilter)}
              className="w-full px-4 py-2 border border-line rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="all">{t('orderList.filters.allStatus')}</option>
              <option value="active">{t('orderList.stats.active')} ({orderStats.active})</option>
              <option value="pending">{t('status.pending')} ({orderStats.pending})</option>
              <option value="accepted">{t('status.accepted')}</option>
              <option value="preparing">{t('status.preparing')} ({orderStats.preparing})</option>
              <option value="ready">{t('status.ready')} ({orderStats.ready})</option>
              <option value="served">{t('status.served')} ({orderStats.served})</option>
              <option value="completed">{t('status.completed')} ({orderStats.completed})</option>
              <option value="cancelled">{t('status.cancelled')} ({orderStats.cancelled})</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-fg mb-2">{t('order.typeLabel')}</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as OrderTypeFilter)}
              className="w-full px-4 py-2 border border-line rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="all">{t('orderList.filters.allTypes')}</option>
              <option value="dine-in">{t('order.type.dineIn')}</option>
              <option value="takeout">{t('order.type.takeout')}</option>
              <option value="delivery">{t('order.type.delivery')}</option>
            </select>
          </div>

          {/* Table Filter */}
          <div>
            <label className="block text-sm font-medium text-fg mb-2">{t('orderList.filters.table')}</label>
            <select
              value={tableFilter}
              onChange={(e) => setTableFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full px-4 py-2 border border-line rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="all">{t('orderList.filters.allTables')}</option>
              {/* TODO: Add table options from tables API */}
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-surface rounded-2xl shadow-sm border border-line">
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
          title={t('orderList.cancelModal.title')}
          closeLabel={t('common.close')}
          size="sm"
          footer={
            <>
              <Button variant="secondary" onClick={() => setOrderToDelete(null)}>
                {t('orderList.cancelModal.keep')}
              </Button>
              <Button variant="danger" onClick={handleConfirmDelete} loading={loading}>
                {loading ? t('orderList.cancelModal.cancelling') : t('orderList.cancelModal.confirm')}
              </Button>
            </>
          }
        >
          <p className="text-fg-muted">
            <Trans
              i18nKey="orderList.cancelModal.body"
              values={{ order: orderToDelete.orderNumber || `#${orderToDelete.id}` }}
              components={{ strong: <strong /> }}
            />
          </p>
        </Modal>
      )}

      {/* Update Status Confirmation Modal */}
      {orderToUpdateStatus && (
        <Modal
          isOpen={true}
          onClose={() => setOrderToUpdateStatus(null)}
          title={t('orderList.statusModal.title')}
          closeLabel={t('common.close')}
          size="sm"
          footer={
            <>
              <Button variant="secondary" onClick={() => setOrderToUpdateStatus(null)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleConfirmUpdateStatus} loading={loading}>
                {loading ? t('orderList.statusModal.updating') : t('orderList.statusModal.confirm')}
              </Button>
            </>
          }
        >
          <p className="text-fg-muted">
            <Trans
              i18nKey="orderList.statusModal.body"
              values={{
                order: orderToUpdateStatus.order.orderNumber || `#${orderToUpdateStatus.order.id}`,
                from: dynamicT(`status.${orderToUpdateStatus.order.status}`, { defaultValue: orderToUpdateStatus.order.status }),
                to: dynamicT(`status.${orderToUpdateStatus.newStatus}`, { defaultValue: orderToUpdateStatus.newStatus }),
              }}
              components={{ strong: <strong /> }}
            />
          </p>
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
