import React from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button, Skeleton, StatusPill, useToast } from '@/components/kit';
import { useOrderManagement } from '@/hooks/useOrderManagement';
import { orderStatusStyle } from '@/design/status';
import { formatMoney } from '@/lib/money';

const formatTime = (iso: string, locale: string): string => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
};

/**
 * Active (not completed / cancelled) orders. The API cannot yet filter by the logged-in
 * waiter (waiter ids belong to the staff table, not users), so this lists all active orders.
 */
export const ActiveOrdersList: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { t, i18n } = useTranslation();
  const { orders, loading, fetchOrders, updateOrderStatus } = useOrderManagement(50);

  const activeOrders = orders.filter((order) => order.status !== 'completed' && order.status !== 'cancelled');

  const handleServeOrder = async (orderId: number) => {
    try {
      // The status mutation invalidates the orders cache, so the list refetches itself
      await updateOrderStatus(orderId, 'served');
    } catch {
      toast.error(t('orders.serveFailed'));
    }
  };

  if (loading && activeOrders.length === 0) {
    return (
      <div className="space-y-3" role="status" aria-label={t('common.loading')}>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (activeOrders.length === 0) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-xl font-bold text-fg">{t('orders.noneTitle')}</h2>
        <p className="mx-auto mt-2 max-w-xs text-fg-muted">{t('orders.noneHint')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button variant="ghost" size="md" onClick={() => void fetchOrders()}>
          {t('common.refresh')}
        </Button>
      </div>

      {activeOrders.map((order) => {
        const status = orderStatusStyle(order.status);
        return (
          <article
            key={order.id}
            className={`rounded-2xl border-2 bg-surface p-4 shadow-sm ${status.border}`}
          >
            <div className="flex items-start justify-between gap-3">
              <button
                type="button"
                onClick={() => navigate(`/orders/${order.id}`)}
                className="min-w-0 flex-1 text-start"
                aria-label={t('orders.open', { n: order.orderNumber })}
              >
                <p className="text-lg font-bold text-fg">{t('orders.orderNumber', { n: order.orderNumber })}</p>
                <p className="text-sm text-fg-muted">
                  {t('order.tableNumber', { n: order.table?.number ?? '—' })}
                  {order.createdAt ? ` · ${formatTime(order.createdAt, i18n.language)}` : ''}
                </p>
                <ul className="mt-2 space-y-0.5 text-sm text-fg">
                  {order.items.slice(0, 2).map((item) => (
                    <li key={item.id}>
                      <span className="font-semibold">{item.quantity}×</span> {item.menuItem?.name}
                    </li>
                  ))}
                  {order.items.length > 2 && (
                    <li className="text-fg-muted">{t('orders.moreItems', { count: order.items.length - 2 })}</li>
                  )}
                </ul>
              </button>

              <div className="flex shrink-0 flex-col items-end gap-2">
                <StatusPill style={status} label={t(`status.${order.status}`, { defaultValue: status.label })} />
                <p className="text-pos-price font-bold tabular-nums">{formatMoney(order.total)}</p>
                <p className="text-sm text-fg-muted">{t('cart.itemCount', { count: order.items.length })}</p>
              </div>
            </div>

            {order.status === 'ready' && (
              <Button size="lg" variant="success" fullWidth className="mt-3" onClick={() => void handleServeOrder(order.id)}>
                {t('orders.serve')}
              </Button>
            )}
          </article>
        );
      })}
    </div>
  );
};
