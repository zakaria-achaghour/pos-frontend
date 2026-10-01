import { dynamicT } from '@/i18n/dynamic';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { Button, Icon, StatusPill, useToast } from '@/components/kit';
import { orderStatusStyle, priorityStyle } from '@/design/status';
import { formatMoney } from '@/lib/money';
import { authAPI } from '@/api/auth';
import { orderAPI } from '@/api/orders';
import { downloadReceipt, printReceipt } from '@/api/receipts';
import PaymentModal from '@/components/pos/orders/PaymentModal';
import { normalizeOrder } from '@/services/adapter';
import { errorMessage } from '@/lib/errors';

// Backend response structure (snake_case)
interface BackendOrderItem {
  id: number;
  order_id: number;
  menu_item_id: number;
  quantity: number;
  unit_price: string;
  special_instructions: string | null;
  removed_ingredients: string[] | null;
  added_extras: string[] | null;
  menu_item: {
    id: number;
    name: string;
    description: string;
    price: string;
    ingredients: string[];
    category: {
      id: number;
      name: string;
    };
  };
}

interface BackendOrder {
  id: number;
  restaurant_id: number;
  table_id: number | null;
  waiter_id: number | null;
  type: string;
  status: string;
  priority: string;
  subtotal: string;
  tax_amount: string;
  discount_amount: string;
  total: string;
  payment_method: string | null;
  notes: string | null;
  placed_at: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  table?: {
    id: number;
    number: string;
    section: string;
  } | null;
  waiter?: {
    id: number;
    name: string;
  } | null;
  order_items: BackendOrderItem[];
}

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const [order, setOrder] = useState<BackendOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [receiptLoading, setReceiptLoading] = useState<'download' | 'print' | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const user = authAPI.getStoredUser();

  // `quiet` refreshes in the background without swapping the page for the loading state
  // (needed while the payment dialog is open on its success screen)
  const fetchOrder = async (quiet = false) => {
    try {
      if (!quiet) setLoading(true);
      const orderData = await orderAPI.getOrder(parseInt(id || '0'));
      setOrder(orderData as unknown as BackendOrder);
    } catch (error) {
      console.error('❌ Error fetching order:', error);
      toast.error(t('orderDetails.errors.load'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handlePaymentRequest = () => {
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
      setProcessing(true);
      await orderAPI.updatePayment(orderId, paymentData);
      toast.success(t('orderDetails.toast.paid'));
      // Keep the dialog open: its success screen offers Print / Download. Refresh quietly behind it.
      void fetchOrder(true);
    } catch (error) {
      console.error('Payment update failed:', error);
      toast.error(errorMessage(error, t('orderDetails.errors.payment')));
      throw error; // let PaymentModal know the payment failed
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      setProcessing(true);
      if (!order) return;

      await orderAPI.updateOrderStatus(order.id, newStatus);
      toast.success(t('orderDetails.toast.statusUpdated', { status: dynamicT(`status.${newStatus}`, { defaultValue: newStatus }) }));
      fetchOrder(); // Refresh order data
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(t('orderDetails.errors.status'));
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!order) return;
    try {
      setReceiptLoading('download');
      await downloadReceipt(order.id, 'pdf');
      toast.success(t('orderDetails.toast.downloaded'));
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error(t('orderDetails.errors.download'));
    } finally {
      setReceiptLoading(null);
    }
  };

  const handlePrintReceipt = async () => {
    if (!order) return;
    try {
      setReceiptLoading('print');
      await printReceipt(order.id);
      toast.success(t('orderDetails.toast.printing'));
    } catch (error) {
      console.error('Error printing receipt:', error);
      toast.error(t('orderDetails.errors.print'));
    } finally {
      setReceiptLoading(null);
    }
  };

  const canProcessPayment = () => {
    // Check if payment is not completed (paid_at is null or payment_method is null)
    return !order?.paid_at &&
      user &&
      ['owner', 'manager', 'cashier'].includes(user.role);
  };

  const isReceiptAvailable = () => {
    // Receipt is available if order is completed or paid
    return order?.paid_at ||
      order?.status === 'completed' ||
      order?.status === 'served';
  };

  const typeLabel = (type: string) => {
    const key = type === 'dine-in' ? 'dineIn' : type;
    return dynamicT(`order.type.${key}`, { defaultValue: type });
  };

  const getTableDisplay = () => {
    if (order?.table) {
      return t('order.tableNumber', { n: order.table.number });
    }
    return order?.type === 'takeout' ? t('order.type.takeout') : order?.type === 'delivery' ? t('order.type.delivery') : t('orderDetails.notAvailable');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(i18n.language, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div>
        <PageMeta title={t('orderDetails.meta.title')} description={t('orderDetails.meta.description')} />
        <PageBreadcrumb pageTitle={t('orderDetails.title')} />
        <div role="status" aria-label={t('common.loading')} className="space-y-6 animate-pulse">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/5"></div>
              <div className="h-4 bg-gray-200 rounded w-1/6"></div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div>
        <PageMeta title={t('orderDetails.meta.title')} description={t('orderDetails.meta.description')} />
        <PageBreadcrumb pageTitle={t('orderDetails.title')} />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{t('orderDetails.notFound')}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageMeta title={t('orderDetails.meta.orderTitle', { n: order.id })} description={t('orderDetails.meta.description')} />
      <PageBreadcrumb pageTitle={t('orders.orderNumber', { n: order.id })} />

      <div className="space-y-6">
        {/* Order Header */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t('orders.orderNumber', { n: order.id })}</h2>
              <p className="text-sm text-gray-500 mt-1">{t('orderDetails.orderId', { id: order.id })}</p>
            </div>
            <div className="flex gap-2">
              {/* Order Status Badge */}
              <StatusPill
                style={orderStatusStyle(order.status)}
                label={dynamicT(`status.${order.status}`, { defaultValue: order.status })}
              />
              {/* Payment Status Badge */}
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${order.paid_at ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'}`}
              >
                {order.paid_at ? t('orderDetails.paid') : t('orderDetails.unpaid')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">{t('orderDetails.table')}</span>
              <p className="font-medium">{getTableDisplay()}</p>
            </div>
            <div>
              <span className="text-gray-500">{t('orderDetails.time')}</span>
              <p className="font-medium">{formatDate(order.created_at)}</p>
            </div>
            <div>
              <span className="text-gray-500">{t('orderDetails.type')}</span>
              <p className="font-medium">{typeLabel(order.type)}</p>
            </div>
            <div>
              <span className="text-gray-500">{t('orderDetails.total')}</span>
              <p className="font-bold text-lg">{formatMoney(order.total)}</p>
            </div>
          </div>

          {order.priority && order.priority !== 'normal' && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${priorityStyle(order.priority).pill}`}>
                {t('orderDetails.priority', { priority: dynamicT(`priority.${order.priority}`, { defaultValue: order.priority }) })}
              </span>
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">{t('orderDetails.items')}</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {order.order_items.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-gray-900">
                          {item.menu_item?.name || t('orderDetails.itemFallback', { n: item.menu_item_id })}
                        </h4>
                        <StatusPill
                          style={orderStatusStyle(order.status)}
                          label={dynamicT(`status.${order.status}`, { defaultValue: order.status })}
                          size="sm"
                        />
                      </div>
                      <p className="text-sm text-gray-500">{t('orderDetails.each', { price: formatMoney(item.unit_price) })}</p>

                      {/* Special Instructions */}
                      {item.special_instructions && (
                        <p className="text-sm text-blue-600 mt-2">
                          <span className="font-medium">{t('orderDetails.note')}</span> {item.special_instructions}
                        </p>
                      )}

                      {/* Removed Ingredients */}
                      {item.removed_ingredients && item.removed_ingredients.length > 0 && (
                        <p className="text-sm text-red-600 mt-2">
                          <span className="font-medium">{t('orderDetails.without')}</span> {item.removed_ingredients.join(', ')}
                        </p>
                      )}

                      {/* Added Extras */}
                      {item.added_extras && item.added_extras.length > 0 && (
                        <p className="text-sm text-green-600 mt-2">
                          <span className="font-medium">{t('orderDetails.extra')}</span> {item.added_extras.join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="text-center min-w-[80px]">
                      <span className="text-gray-600 text-lg">× {item.quantity}</span>
                    </div>
                    <div className="text-end min-w-[120px]">
                      <span className="font-semibold text-lg">{formatMoney(parseFloat(item.unit_price) * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="border-t border-gray-200 pt-6 mt-6 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{t('orderDetails.subtotal')}</span>
                <span className="font-medium">{formatMoney(order.subtotal)}</span>
              </div>
              {parseFloat(order.tax_amount) > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{t('orderDetails.tax')}</span>
                  <span className="font-medium">{formatMoney(order.tax_amount)}</span>
                </div>
              )}
              {parseFloat(order.discount_amount) > 0 && (
                <div className="flex justify-between items-center text-sm text-green-600">
                  <span>{t('orderDetails.discount')}</span>
                  <span className="font-medium">-{formatMoney(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                <span className="text-lg font-medium text-gray-600">{t('orderDetails.orderTotal')}</span>
                <span className="text-2xl font-bold text-green-600">{formatMoney(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Status Actions */}
        {user && ['owner', 'manager', 'waiter'].includes(user.role) &&
          order.status !== 'completed' && order.status !== 'cancelled' && (
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('orderDetails.updateStatus')}</h3>
              <div className="flex flex-wrap gap-3">
                {order.status === 'pending' && (
                  <Button onClick={() => handleUpdateStatus('accepted')} disabled={processing}>
                    {t('orderDetails.actions.accept')}
                  </Button>
                )}
                {(order.status === 'accepted' || order.status === 'pending') && (
                  <Button onClick={() => handleUpdateStatus('preparing')} disabled={processing}>
                    {t('orderDetails.actions.startPreparing')}
                  </Button>
                )}
                {order.status === 'preparing' && (
                  <Button onClick={() => handleUpdateStatus('ready')} disabled={processing}>
                    {t('orderDetails.actions.markReady')}
                  </Button>
                )}
                {order.status === 'ready' && (
                  <Button onClick={() => handleUpdateStatus('served')} disabled={processing}>
                    {t('orderDetails.actions.markServed')}
                  </Button>
                )}
                {order.status === 'served' && order.paid_at && (
                  <Button variant="success" onClick={() => handleUpdateStatus('completed')} disabled={processing}>
                    {t('orderDetails.actions.complete')}
                  </Button>
                )}
                <Button variant="danger" onClick={() => handleUpdateStatus('cancelled')} disabled={processing}>
                  {t('orderDetails.actions.cancel')}
                </Button>
              </div>
            </div>
          )}

        {/* Receipt Actions */}
        {isReceiptAvailable() && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('orderDetails.receiptActions')}</h3>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                onClick={handlePrintReceipt}
                loading={receiptLoading === 'print'}
              >
                {receiptLoading === 'print' ? t('orderDetails.printing') : t('orderDetails.printReceipt')}
              </Button>
              <Button
                variant="danger"
                onClick={handleDownloadReceipt}
                loading={receiptLoading === 'download'}
              >
                {receiptLoading === 'download' ? t('orderDetails.downloading') : t('orderDetails.downloadPdf')}
              </Button>
            </div>
          </div>
        )}

        {/* Payment Actions */}
        {canProcessPayment() && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('orderDetails.paymentActions')}</h3>
            <div className="flex gap-3">
              <Button
                variant="success"
                fullWidth
                size="lg"
                onClick={handlePaymentRequest}
                disabled={processing}
              >
                <Icon name="check" className="h-5 w-5" />
                {processing ? t('orderDetails.processing') : t('orderDetails.processPayment', { amount: formatMoney(order.total) })}
              </Button>
            </div>
          </div>
        )}
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          void fetchOrder(true);
        }}
        order={order ? normalizeOrder(order as unknown as Record<string, unknown>) : null}
        onConfirm={handleConfirmPayment}
      />
    </div>

  );
}
