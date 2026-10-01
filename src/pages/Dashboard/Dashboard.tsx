import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuthRedux';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Alert from '@/components/ui/alert/Alert';
import { formatMoney } from '@/lib/money';
import { dashboardAPI } from '@/api/dashboard';
import type { DashboardPeriod, DashboardOverviewResponse } from '@/types/dashboard';
import { handleApiError } from '@/api/client';
import type { AxiosError } from 'axios';

const timeframeOptions: Array<{ key: DashboardPeriod; labelKey: string }> = [
  { key: 'today', labelKey: 'dashboard.period.today' },
  { key: 'week', labelKey: 'dashboard.period.week' },
  { key: 'month', labelKey: 'dashboard.period.month' },
];

const SkeletonCard = () => (
  <div className="bg-white p-6 rounded-lg shadow animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
    <div className="h-8 bg-gray-200 rounded w-2/3" />
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const numberLocale = i18n.language.startsWith('ar') ? 'ar-MA-u-nu-latn' : i18n.language;
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
    } catch (err) {
      setError(handleApiError(err as AxiosError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const metricCards = [
    { label: period === 'today' ? t('dashboard.salesToday') : t('dashboard.totalSales'), value: overview?.sales_today ?? 0, currency: true },
    { label: period === 'today' ? t('dashboard.ordersToday') : t('dashboard.orders'), value: overview?.orders_today ?? 0, currency: false },
    { label: t('dashboard.avgTicket'), value: overview?.avg_ticket ?? 0, currency: true },
  ];

  return (
    <div className="space-y-6">
      <PageMeta title={t('dashboard.metaTitle')} description={t('dashboard.metaDescription')} />
      <PageBreadcrumb pageTitle={t('nav.dashboard')} />

      {error && (
        <Alert variant="error" title={t('nav.dashboard')} message={error} />
      )}

      <div className="bg-indigo-500 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold">{t('dashboard.greeting', { name: user?.name || t('dashboard.guest') })} 👋</h1>
        <p className="text-indigo-100">{t('dashboard.subtitle')}</p>
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
            {t(option.labelKey)}
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
                    ? formatMoney(card.value)
                    : Number(card.value).toLocaleString(numberLocale)}
                </p>
              </div>
            ))}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.paymentMethods')}</h3>
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
                <span className="font-semibold text-gray-900">{formatMoney(method.total)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">{t('dashboard.noPaymentData')}</p>
        )}
      </div>
    </div>
  );
}
