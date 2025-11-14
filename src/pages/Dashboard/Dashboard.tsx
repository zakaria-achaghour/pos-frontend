import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuthRedux';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Alert from '@/components/ui/alert/Alert';
import { useCurrency } from '@/hooks/useConfig';
import { dashboardAPI } from '@/api/dashboard';
import type { DashboardPeriod, DashboardOverviewResponse } from '@/types/dashboard';
import { handleApiError } from '@/api/client';

const timeframeOptions: Array<{ key: DashboardPeriod; label: string }> = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
];

const SkeletonCard = () => (
  <div className="bg-white p-6 rounded-lg shadow animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
    <div className="h-8 bg-gray-200 rounded w-2/3" />
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const [period, setPeriod] = useState<DashboardPeriod>('today');
  const [overview, setOverview] = useState<DashboardOverviewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardAPI.getOverview({ period });
      setOverview(data);
    } catch (err: any) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const metricCards = [
    { label: period === 'today' ? 'Sales Today' : 'Total Sales', value: overview?.sales_today ?? 0, currency: true },
    { label: period === 'today' ? 'Orders Today' : 'Orders', value: overview?.orders_today ?? 0, currency: false },
    { label: 'Avg Ticket', value: overview?.avg_ticket ?? 0, currency: true },
  ];

  return (
    <div className="space-y-6">
      <PageMeta title="Dashboard | POS System" description="Restaurant performance overview" />
      <PageBreadcrumb pageTitle="Dashboard" />

      {error && (
        <Alert variant="error" title="Dashboard" message={error} onClose={() => setError(null)} />
      )}

      <div className="bg-indigo-500 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold">Hey {user?.name || 'there'} 👋</h1>
        <p className="text-indigo-100">Here is how your business is performing</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {timeframeOptions.map((option) => (
          <button
            key={option.key}
            onClick={() => setPeriod(option.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              period === option.key ? 'bg-indigo-500 text-white' : 'bg-white text-gray-700 border hover:bg-gray-50'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading
          ? metricCards.map((_, index) => <SkeletonCard key={`skeleton-${index}`} />)
          : metricCards.map((card) => (
              <div key={card.label} className="bg-white p-6 rounded-lg shadow">
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {card.currency
                    ? formatCurrency(card.value as number)
                    : Number(card.value).toLocaleString()}
                </p>
              </div>
            ))}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        ) : overview?.payment_methods?.length ? (
          <div className="space-y-3">
            {overview.payment_methods.map((method) => (
              <div key={method.method} className="flex items-center justify-between">
                <span className="text-gray-600">{method.label || method.method}</span>
                <span className="font-semibold text-gray-900">{formatCurrency(method.total)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No payment data for this period.</p>
        )}
      </div>
    </div>
  );
}
