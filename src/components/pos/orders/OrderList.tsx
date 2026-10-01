import React from 'react';
import { useTranslation } from 'react-i18next';
import type { OrderListProps } from '@/types/order';
import { orderStatusStyle } from '@/design/status';
import { Button, StatusPill } from '@/components/kit';
import { formatMoney } from '@/lib/money';

const TYPE_KEY: Record<string, string> = {
  'dine-in': 'order.type.dineIn',
  takeout: 'order.type.takeout',
  delivery: 'order.type.delivery',
};

const NEXT_STATUS: Record<string, { to: 'accepted' | 'preparing' | 'ready' | 'served' | 'completed'; key: string }> = {
  pending: { to: 'accepted', key: 'orderList.accept' },
  accepted: { to: 'preparing', key: 'orderList.startPreparing' },
  preparing: { to: 'ready', key: 'orderList.markReady' },
  ready: { to: 'served', key: 'orderList.markServed' },
  served: { to: 'completed', key: 'orderList.complete' },
};

const OrderList: React.FC<OrderListProps> = ({
  items,
  orders: ordersProp,
  loading,
  onEdit,
  onDelete,
  onViewDetails,
  onUpdateStatus,
  onPayment,
  hasFilters,
}) => {
  const { t, i18n } = useTranslation();
  // Use orders or items, whichever is provided
  const ordersToDisplay = ordersProp || items || [];
  const formatDate = (value: string) => new Date(value).toLocaleString(i18n.language);

  if (loading) {
    return (
      <div role="status" aria-label={t('common.loading')} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (ordersToDisplay.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {hasFilters ? t('orderList.empty.filteredTitle') : t('orderList.empty.title')}
        </h3>
        <p className="text-gray-500 text-center max-w-md">
          {hasFilters ? t('orderList.empty.filteredHint') : t('orderList.empty.hint')}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {ordersToDisplay.map((order) => {
        const label = order.orderNumber || `#${order.id}`;
        const method = order.payment_method || order.paymentMethod;
        const canChange = order.status === 'pending' || order.status === 'accepted';
        const next = NEXT_STATUS[order.status];
        const discount = Number(order.discount_amount || order.discount);
        const tax = Number(order.tax_amount || order.tax);
        const typeKey = TYPE_KEY[order.type as string];
        return (
        <div
          key={order.id}
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b">
            <div className="flex justify-between items-start mb-2 gap-2">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {order.orderNumber || t('orders.orderNumber', { n: order.id })}
                </h3>
                {order.type && (
                  <p className="text-sm text-gray-600">{typeKey ? t(typeKey) : order.type}</p>
                )}
              </div>
              <StatusPill
                style={orderStatusStyle(order.status)}
                label={t(`status.${order.status}`, { defaultValue: order.status })}
                size="sm"
              />
            </div>

            {order.table && (
              <p className="text-sm text-gray-700 font-medium">
                {t('order.tableNumber', { n: order.table.number })}
              </p>
            )}
          </div>

          {/* Body */}
          <div className="p-4 space-y-3">
            {order.customer && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">{t('orderList.customer')}</span>
                <span className="font-medium text-gray-900">{order.customer.name}</span>
              </div>
            )}

            {order.server && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">{t('orderList.server')}</span>
                <span className="font-medium text-gray-900">{order.server.name}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">{t('orderList.items')}</span>
              <span className="font-medium text-gray-900">{order.items?.length || 0}</span>
            </div>

            <div className="pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">{t('orderList.total')}</span>
                <span className="text-2xl font-bold text-blue-600">{formatMoney(order.total)}</span>
              </div>
              {order.subtotal && (
                <div className="text-xs text-gray-500 mt-1">
                  <div className="flex justify-between">
                    <span>{t('orderList.subtotal')}</span>
                    <span>{formatMoney(order.subtotal)}</span>
                  </div>
                  {tax > 0 && (
                    <div className="flex justify-between">
                      <span>{t('orderList.tax')}</span>
                      <span>{formatMoney(tax)}</span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="flex justify-between">
                      <span>{t('orderList.discount')}</span>
                      <span>-{formatMoney(discount)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm text-gray-600">{t('orderList.payment')}</span>
              <div className="flex flex-col items-end gap-1">
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${method
                    ? 'bg-green-100 text-green-700'
                    : 'bg-orange-100 text-orange-700'
                    }`}
                >
                  {method ? t('orderList.paid') : t('orderList.readyToPay')}
                </span>
                {method && (
                  <span className="text-xs text-gray-500">
                    {method === 'split' ? t('orderList.split') : t(`payment.method.${method}`, { defaultValue: method })}
                  </span>
                )}
              </div>
            </div>

            <div className="text-xs text-gray-500 pt-2">
              <div>{t('orderList.created', { date: formatDate(order.createdAt) })}</div>
              {order.updatedAt && order.updatedAt !== order.createdAt && (
                <div>{t('orderList.updated', { date: formatDate(order.updatedAt) })}</div>
              )}
            </div>
          </div>

          {/* Footer - Action Buttons */}
          <div className="p-4 bg-gray-50 border-t space-y-2">
            {onUpdateStatus && order.status !== 'completed' && order.status !== 'cancelled' && (
              <div className="grid grid-cols-2 gap-2">
                {next && (
                  <Button size="md" variant="secondary" onClick={() => onUpdateStatus(order.id, next.to, label)}>
                    {t(next.key)}
                  </Button>
                )}
                <Button size="md" variant="danger" onClick={() => onUpdateStatus(order.id, 'cancelled', label)}>
                  {t('orderList.cancel')}
                </Button>
              </div>
            )}

            {onPayment && !method && order.status !== 'cancelled' && (
              <Button
                size="md"
                variant="success"
                fullWidth
                onClick={() => onPayment(order)}
                title={t('orderList.processPaymentTitle')}
              >
                {t('orderList.processPayment', { amount: formatMoney(order.total) })}
              </Button>
            )}

            <div className="grid grid-cols-3 gap-2">
              <Button
                size="md"
                className="px-2"
                onClick={() => onViewDetails(order)}
                title={t('orderList.viewTitle')}
              >
                {t('orderList.view')}
              </Button>

              <Button
                size="md"
                variant="secondary"
                className="px-2"
                onClick={() => onEdit(order)}
                disabled={!canChange}
                title={canChange ? t('orderList.editTitle') : t('orderList.editDisabled')}
              >
                {t('orderList.edit')}
              </Button>

              <Button
                size="md"
                variant="danger"
                className="px-2"
                onClick={() => onDelete(order.id, label)}
                disabled={!canChange}
                title={canChange ? t('orderList.cancelTitle') : t('orderList.cancelDisabled')}
              >
                {t('orderList.cancel')}
              </Button>
            </div>
          </div>
        </div>
        );
      })}
    </div>
  );
};

export default OrderList;
