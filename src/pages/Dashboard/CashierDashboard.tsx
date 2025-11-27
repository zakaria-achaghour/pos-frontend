import React, { useMemo, useState, useEffect } from 'react';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Alert from '@/components/ui/alert/Alert';
import Modal from '@/components/common/Modal';
import Button from '@/components/ui/button/Button';
import { useAuth } from '@/hooks/useAuthRedux';
import { useCurrency } from '@/hooks/useConfig';
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
  const { formatCurrency } = useCurrency();
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
      setElapsed(`${hours}h ${minutes}m`);
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [currentShift]);

  const byMethod = useMemo(
    () => formatMethodEntries(data?.totals?.by_method),
    [data?.totals],
  );

  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(openingAmount);
    if (Number.isNaN(amount)) {
      setShiftError('Please enter an opening amount.');
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
      setShiftError('Please enter a closing amount.');
      return;
    }
    await closeShift({ closing_amount: amount, note: closingNote || undefined });
    setClosingModalOpen(false);
    setClosingAmount('');
    setClosingNote('');
    refreshShift();
    refresh();
  };

  const handlePrintReceipt = (orderId: number) => {
    window.open(`/api/orders/${orderId}/receipt?auto_print=1`, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadReceipt = (orderId: number) => {
    window.open(`/api/orders/${orderId}/receipt?format=pdf`, '_blank', 'noopener,noreferrer');
  };

  const renderOrders = (orders: CashierDashboardOrder[]) => {
    if (!orders.length) {
      return (
        <div className="text-center text-gray-500 py-8">
          No paid orders yet today.
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
                  {order.payment_method.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {order.table_label || 'No table'} • Paid{' '}
                {new Date(order.paid_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">
                {formatCurrency(order.total)}
              </span>
              <button
                onClick={() => handlePrintReceipt(order.id)}
                className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50"
              >
                Print
              </button>
              <button
                onClick={() => handleDownloadReceipt(order.id)}
                className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50"
              >
                PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <PageMeta title="Cashier Dashboard | POS" description="Cashier operations dashboard" />
      <PageBreadcrumb pageTitle="Cashier Dashboard" />

      {shiftError && (
        <Alert
          variant="error"
          title="Shift Warning"
          message={shiftError}
          onClose={() => setShiftError(null)}
        />
      )}
      {dashboardError && (
        <Alert
          variant="warning"
          title="Dashboard"
          message={dashboardError}
          onClose={refresh}
        />
      )}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}</h1>
          <p className="text-gray-500">Monitor your shift and payments in real time.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refresh} disabled={dashboardLoading}>
            {dashboardLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
          {canViewAll && (
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as 'self' | 'all')}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="self">My totals</option>
              <option value="all">All cashiers</option>
            </select>
          )}
        </div>
      </div>

      {/* Shift Widget */}
      <div className="bg-white rounded-lg shadow p-6">
        {shiftLoading ? (
          <div className="text-gray-500">Loading shift...</div>
        ) : currentShift ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Current shift</p>
                <h3 className="text-xl font-semibold text-gray-900">
                  Started{' '}
                  {shiftStartDate
                    ? shiftStartDate.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Unknown'}
                </h3>
                <p className="text-sm text-gray-500">
                  Elapsed: {elapsed || '0h 0m'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Opening cash</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(currentShift.opening_amount)}
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
              Close Shift
            </Button>
          </div>
        ) : (
          <form onSubmit={handleOpenShift} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opening Cash Float
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
                Note (optional)
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
              {isActionLoading ? 'Opening…' : 'Open Shift'}
            </Button>
          </form>
        )}
      </div>

      {/* Totals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Overall paid today</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(data?.totals?.overall || 0)}
          </p>
        </div>
        {byMethod.map((entry) => (
          <div key={entry.method} className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500">
              {entry.method === 'cash' ? 'Cash' : 'Card'} total
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(entry.amount)}
            </p>
          </div>
        ))}
      </div>

      {/* Orders list */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Paid Orders</h3>
          {data?.orders && (
            <span className="text-sm text-gray-500">{data.orders.length} orders</span>
          )}
        </div>
        <div className="p-4">
          {dashboardLoading ? (
            <div className="text-center text-gray-500">Loading orders…</div>
          ) : (
            renderOrders(data?.orders || [])
          )}
        </div>
      </div>

      {/* Close shift modal */}
      <Modal isOpen={closingModalOpen} onClose={() => setClosingModalOpen(false)} title="Close Shift">
        <form onSubmit={handleCloseShift} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Closing Cash Amount
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
              Notes (optional)
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
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              disabled={isActionLoading}
            >
              {isActionLoading ? 'Closing…' : 'Close Shift'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CashierDashboard;
