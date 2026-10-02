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
import { CartIcon, DollarLineIcon, PieChartIcon } from '@/icons';

const timeframeOptions: Array<{ key: DashboardPeriod; labelKey: `dashboard.period.${DashboardPeriod}` }> = [
  { key: 'today', labelKey: 'dashboard.period.today' },
  { key: 'week', labelKey: 'dashboard.period.week' },
  { key: 'month', labelKey: 'dashboard.period.month' },
];

const SkeletonCard = () => (
  <div className="dashboard-panel animate-pulse">
    <div className="h-4 bg-surface-2 rounded w-1/2 mb-3" />
    <div className="h-8 bg-surface-2 rounded w-2/3" />
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
    { label: period === 'today' ? t('dashboard.salesToday') : t('dashboard.totalSales'), value: overview?.sales_today ?? 0, currency: true, accent: 'accent-revenue', Icon: DollarLineIcon },
    { label: period === 'today' ? t('dashboard.ordersToday') : t('dashboard.orders'), value: overview?.orders_today ?? 0, currency: false, accent: 'accent-orders', Icon: CartIcon },
    { label: t('dashboard.avgTicket'), value: overview?.avg_ticket ?? 0, currency: true, accent: 'accent-staff', Icon: PieChartIcon },
  ];

  return (
    <div className="space-y-6">
      <PageMeta title={t('dashboard.metaTitle')} description={t('dashboard.metaDescription')} />
      <PageBreadcrumb hideTitle pageTitle={t('nav.dashboard')} />

      {error && (
        <Alert variant="error" title={t('nav.dashboard')} message={error} />
      )}

      <div className="dashboard-hero">
        <h1 className="text-2xl font-bold">{t('dashboard.greeting', { name: user?.name || t('dashboard.guest') })}</h1>
        <p className="text-fg-muted">{t('dashboard.subtitle')}</p>
      </div>

      <div className="period-switch">
        {timeframeOptions.map((option) => (
          <button
            key={option.key}
            onClick={() => setPeriod(option.key)}
            aria-pressed={period === option.key}
            className="transition-colors hover:bg-surface-2"
          >
            {t(option.labelKey)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading
          ? metricCards.map((_, index) => <SkeletonCard key={`skeleton-${index}`} />)
          : metricCards.map((card) => (
              <div key={card.label} className={`metric-card ${card.accent}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-fg-muted">{card.label}</p>
                  <span className="accent-chip">
                    <card.Icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                </div>
                <p className="metric-value text-fg mt-3">
                  {card.currency
                    ? formatMoney(card.value)
                    : Number(card.value).toLocaleString(numberLocale)}
                </p>
              </div>
            ))}
      </div>

      <div className="dashboard-panel">
        <h3 className="text-lg font-semibold text-fg mb-4">{t('dashboard.paymentMethods')}</h3>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 bg-surface-2 rounded animate-pulse" />
            ))}
          </div>
        ) : overview?.payment_methods?.length ? (
          <div className="space-y-3">
            {overview.payment_methods.map((method) => (
              <div key={method.method} className="flex items-center justify-between">
                <span className="text-fg-muted">{method.label || method.method}</span>
                <span className="font-semibold text-fg">{formatMoney(method.total)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-fg-muted">{t('dashboard.noPaymentData')}</p>
        )}
      </div>
    </div>
  );
}
