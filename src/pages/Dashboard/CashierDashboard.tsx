import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Alert from '@/components/ui/alert/Alert';
import Modal from '@/components/common/Modal';
import Button from '@/components/ui/button/Button';
import { useAuth } from '@/hooks/useAuthRedux';
import { useToast } from '@/components/kit';
import { printReceipt, downloadReceipt } from '@/api/receipts';
import { formatMoney } from '@/lib/money';
import { useCashierShift } from '@/hooks/useCashierShift';
import { useCashierDashboard } from '@/hooks/useCashierDashboard';
import type { CashierDashboardOrder, CashierTotalsByMethod } from '@/types/cashier';

const formatMethodEntries = (
  byMethod: CashierTotalsByMethod[] | Record<string, number> | undefined,
) => {
  if (!byMethod) return [];
  if (Array.isArray(byMethod)) return byMethod;
  return Object.entries(byMethod).map(([method, amount]) => ({
    method,
    amount,
  }));
};

const parseShiftDate = (value?: string | null): Date | null => {
  if (!value) return null;
  const normalized = value.includes('T') ? value : value.replace(' ', 'T');
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
};

const CashierDashboard: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const { t, i18n } = useTranslation();
  const timeLocale = i18n.language.startsWith('ar') ? 'ar-MA-u-nu-latn' : i18n.language;
  const [scope, setScope] = useState<'self' | 'all'>('self');
  const {
    currentShift,
    isLoading: shiftLoading,
    isActionLoading,
    error: shiftError,
    setError: setShiftError,
    openShift,
    closeShift,
    refresh: refreshShift,
  } = useCashierShift({ autoFetch: true });
  const { data, isLoading: dashboardLoading, error: dashboardError, refresh } =
    useCashierDashboard({ scope, pollInterval: 45000 });

  const [openingAmount, setOpeningAmount] = useState('');
  const [openingNote, setOpeningNote] = useState('');
  const [closingModalOpen, setClosingModalOpen] = useState(false);
  const [closingAmount, setClosingAmount] = useState('');
  const [closingNote, setClosingNote] = useState('');
  const [elapsed, setElapsed] = useState('');

  const canViewAll = user?.role === 'owner' || user?.role === 'manager' || user?.role === 'superadmin';

  const shiftStartDate = useMemo(() => {
    const source = currentShift?.started_at || currentShift?.opened_at || null;
    return parseShiftDate(source);
  }, [currentShift?.started_at, currentShift?.opened_at]);

  useEffect(() => {
    if (!currentShift || !shiftStartDate) {
      setElapsed('');
      return;
    }
    const update = () => {
      const diff = Date.now() - shiftStartDate.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      setElapsed(t('cashier.elapsedValue', { hours, minutes }));
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [currentShift, shiftStartDate, t]);

  const byMethod = useMemo(
    () => formatMethodEntries(data?.totals?.by_method),
    [data?.totals],
  );

  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(openingAmount);
    if (Number.isNaN(amount)) {
      setShiftError(t('cashier.openingAmountRequired'));
      return;
    }
    await openShift({ opening_amount: amount, note: openingNote || undefined });
    setOpeningAmount('');
    setOpeningNote('');
  };

  const handleCloseShift = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(closingAmount);
    if (Number.isNaN(amount)) {
      setShiftError(t('cashier.closingAmountRequired'));
      return;
    }
    await closeShift({ closing_amount: amount, note: closingNote || undefined });
    setClosingModalOpen(false);
    setClosingAmount('');
    setClosingNote('');
    refreshShift();
    refresh();
  };

  // Authenticated fetch (a plain window.open('/api/...') sends no Bearer token and gets a 401)
  const handlePrintReceipt = (orderId: number) => {
    printReceipt(orderId).catch(() => toast.error(t('payment.receiptFailed')));
  };

  const handleDownloadReceipt = (orderId: number) => {
    downloadReceipt(orderId, 'pdf').catch(() => toast.error(t('cashier.downloadFailed')));
  };

  const renderOrders = (orders: CashierDashboardOrder[]) => {
    if (!orders.length) {
      return (
        <div className="text-center text-gray-500 py-8">
          {t('cashier.noPaidOrders')}
        </div>
      );
    }

    return (
      <div className="divide-y">
        {orders.map((order) => (
          <div key={order.id} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 py-4">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-900">{order.order_number}</h4>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    order.payment_method === 'cash'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {t(`payment.method.${order.payment_method}`, { defaultValue: order.payment_method }).toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {order.table_label || t('cashier.noTable')} • {t('cashier.paidAt')}{' '}
                {new Date(order.paid_at).toLocaleTimeString(timeLocale, {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">
                {formatMoney(order.total)}
              </span>
              <button
                onClick={() => handlePrintReceipt(order.id)}
                className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50"
              >
                {t('cashier.print')}
              </button>
              <button
                onClick={() => handleDownloadReceipt(order.id)}
                className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50"
              >
                {t('cashier.pdf')}
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <PageMeta title={t('cashier.metaTitle')} description={t('cashier.metaDescription')} />
      <PageBreadcrumb pageTitle={t('nav.cashierDashboard')} />

      {shiftError && (
        <Alert
          variant="error"
          title={t('cashier.shiftWarning')}
          message={shiftError}
        />
      )}
      {dashboardError && (
        <Alert
          variant="warning"
          title={t('nav.dashboard')}
          message={dashboardError}
        />
      )}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('cashier.welcome', { name: user?.name })}</h1>
          <p className="text-gray-500">{t('cashier.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refresh} disabled={dashboardLoading}>
            {dashboardLoading ? t('cashier.refreshing') : t('common.refresh')}
          </Button>
          {canViewAll && (
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as 'self' | 'all')}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="self">{t('cashier.myTotals')}</option>
              <option value="all">{t('cashier.allCashiers')}</option>
            </select>
          )}
        </div>
      </div>

      {/* Shift Widget */}
      <div className="bg-white rounded-lg shadow p-6">
        {shiftLoading ? (
          <div className="text-gray-500">{t('cashier.loadingShift')}</div>
        ) : currentShift ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{t('cashier.currentShift')}</p>
                <h3 className="text-xl font-semibold text-gray-900">
                  {t('cashier.started')}{' '}
                  {shiftStartDate
                    ? shiftStartDate.toLocaleTimeString(timeLocale, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : t('cashier.unknown')}
                </h3>
                <p className="text-sm text-gray-500">
                  {t('cashier.elapsed', { value: elapsed || t('cashier.elapsedValue', { hours: 0, minutes: 0 }) })}
                </p>
              </div>
              <div className="text-end">
                <p className="text-sm text-gray-500">{t('cashier.openingCash')}</p>
                <p className="text-lg font-semibold">
                  {formatMoney(currentShift.opening_amount)}
                </p>
              </div>
            </div>
            <Button
              className="w-full bg-red-500 hover:bg-red-600 text-white"
              onClick={() => {
                setClosingModalOpen(true);
                setClosingAmount('');
                setClosingNote('');
              }}
            >
              {t('cashier.closeShift')}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleOpenShift} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('cashier.openingFloat')}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={openingAmount}
                onChange={(e) => setOpeningAmount(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="0.00"
                required
                disabled={isActionLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('cashier.noteOptional')}
              </label>
              <textarea
                value={openingNote}
                onChange={(e) => setOpeningNote(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                rows={3}
                disabled={isActionLoading}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
              disabled={isActionLoading}
            >
              {isActionLoading ? t('cashier.opening') : t('cashier.openShift')}
            </Button>
          </form>
        )}
      </div>

      {/* Totals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">{t('cashier.overallPaid')}</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatMoney(data?.totals?.overall || 0)}
          </p>
        </div>
        {byMethod.map((entry) => (
          <div key={entry.method} className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500">
              {t('cashier.methodTotal', { method: entry.method === 'cash' ? t('payment.method.cash') : t('payment.method.card') })}
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {formatMoney(entry.amount)}
            </p>
          </div>
        ))}
      </div>

      {/* Orders list */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{t('cashier.paidOrders')}</h3>
          {data?.orders && (
            <span className="text-sm text-gray-500">{t('cashier.ordersCount', { count: data.orders.length })}</span>
          )}
        </div>
        <div className="p-4">
          {dashboardLoading ? (
            <div className="text-center text-gray-500">{t('cashier.loadingOrders')}</div>
          ) : (
            renderOrders(data?.orders || [])
          )}
        </div>
      </div>

      {/* Close shift modal */}
      <Modal isOpen={closingModalOpen} onClose={() => setClosingModalOpen(false)} title={t('cashier.closeShift')}>
        <form onSubmit={handleCloseShift} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('cashier.closingAmount')}
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={closingAmount}
              onChange={(e) => setClosingAmount(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              required
              disabled={isActionLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('cashier.notesOptional')}
            </label>
            <textarea
              value={closingNote}
              onChange={(e) => setClosingNote(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              rows={3}
              disabled={isActionLoading}
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setClosingModalOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              disabled={isActionLoading}
            >
              {isActionLoading ? t('cashier.closing') : t('cashier.closeShift')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CashierDashboard;
