import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useAuth } from '../../hooks/useAuthRedux';
// import { dashboardAPI } from '../../api/dashboard'; // DEPRECATED - endpoint no longer exists
import type { DashboardMetrics, DashboardPeriod } from '@/types/dashboard';
import { handleApiError } from '../../api/client';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import DemoDataBanner from '@/components/common/DemoDataBanner';
import type { AxiosError } from 'axios';
import { formatMoney } from '@/lib/money';

const mockMetrics: DashboardMetrics = {
  total_revenue: 15750.00,
  total_orders: 156,
  paid_orders: 147,
  cancelled_orders: 9,
  average_order_value: 101.00,
  active_staff: 8,
  occupied_tables: 12,
  available_tables: 8
};

// Extended mock data for the dashboard
const extendedMockData = {
  yesterdayRevenue: 14200.00,
  weekRevenue: 89400.00,
  monthRevenue: 387500.00,
  completionRate: 94.5,
  totalTables: 20,
  averageTurnover: 1.8,
  topPerformer: {
    name: "Sarah",
    ordersCompleted: 28,
    revenue: 2850.00
  },
  paymentMethods: {
    cash: 6300.00,
    card: 8450.00,
    other: 1000.00
  },
  topItems: [
    { name: "Tagine Beef", sold: 24, revenue: 1440.00 },
    { name: "Couscous Royal", sold: 18, revenue: 1260.00 },
    { name: "Pastilla Chicken", sold: 15, revenue: 900.00 },
    { name: "Mint Tea", sold: 45, revenue: 450.00 }
  ],
  hourlySales: [
    { hour: "09:00", sales: 450, orders: 5 },
    { hour: "10:00", sales: 720, orders: 8 },
    { hour: "11:00", sales: 980, orders: 12 },
    { hour: "12:00", sales: 1850, orders: 18 },
    { hour: "13:00", sales: 2400, orders: 24 },
    { hour: "14:00", sales: 1950, orders: 19 },
    { hour: "15:00", sales: 1200, orders: 14 },
    { hour: "16:00", sales: 890, orders: 9 },
    { hour: "17:00", sales: 1100, orders: 11 },
    { hour: "18:00", sales: 1650, orders: 16 },
    { hour: "19:00", sales: 2250, orders: 22 },
    { hour: "20:00", sales: 1300, orders: 13 }
  ]
};

export default function OwnerDashboard() {
  const { t, i18n } = useTranslation();
  const numberLocale = i18n.language.startsWith('ar') ? 'ar-MA-u-nu-latn' : i18n.language;
  const formatNumber = (value: number, digits = 0) =>
    value.toLocaleString(numberLocale, { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<DashboardPeriod>('today');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        // NOTE: /dashboard/metrics endpoint no longer exists on backend
        // Using mock data until new endpoint is implemented
        setMetrics(mockMetrics);
      } catch (err) {
        console.error('Error fetching metrics:', handleApiError(err as AxiosError));
        // Fallback to mock data
        setMetrics(mockMetrics);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [selectedTimeframe]);

  const getRevenueByTimeframe = () => {
    if (!metrics) return 0;
    switch (selectedTimeframe) {
      case 'today': return metrics.total_revenue;
      case 'week': return extendedMockData.weekRevenue;
      case 'month': return extendedMockData.monthRevenue;
      default: return metrics.total_revenue;
    }
  };

  const getRevenueChange = () => {
    if (!metrics) return 0;
    const today = metrics.total_revenue;
    const yesterday = extendedMockData.yesterdayRevenue;
    return yesterday > 0 ? ((today - yesterday) / yesterday * 100) : 0;
  };

  if (loading) {
    return (
      <div>
        <PageMeta title={t('dashboard.owner.metaTitle')} description={t('dashboard.owner.metaDescription')} />
        <PageBreadcrumb pageTitle={t('nav.ownerDashboard')} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      <PageMeta title={t('dashboard.owner.metaTitle')} description={t('dashboard.owner.metaDescription')} />
      <PageBreadcrumb pageTitle={t('nav.ownerDashboard')} />
      <DemoDataBanner />

      {/* Welcome Header */}
      <div className="bg-blue-500 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold">{t('dashboard.owner.welcome', { name: user?.name })}</h1>
        <p className="text-blue-100">{t('dashboard.owner.subtitle')}</p>
      </div>

      {/* Timeframe Selector */}
      <div className="flex gap-2">
        {[
          { key: 'today' as DashboardPeriod, label: t('dashboard.period.today') },
          { key: 'week' as DashboardPeriod, label: t('dashboard.period.week') },
          { key: 'month' as DashboardPeriod, label: t('dashboard.period.month') }
        ].map((timeframe) => (
          <button
            key={timeframe.key}
            onClick={() => setSelectedTimeframe(timeframe.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedTimeframe === timeframe.key
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 border hover:bg-gray-50'
              }`}
          >
            {timeframe.label}
          </button>
        ))}
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Revenue */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('dashboard.owner.revenue')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatMoney(getRevenueByTimeframe())}
              </p>
              <div className={`text-sm ${getRevenueChange() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {getRevenueChange() >= 0 ? '↗️' : '↘️'} {t('dashboard.owner.vsYesterday', { percent: formatNumber(Math.abs(getRevenueChange()), 1) })}
              </div>
            </div>
            <div className="text-2xl">💰</div>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('dashboard.ordersToday')}</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.total_orders}</p>
              <p className="text-sm text-gray-500">{t('dashboard.owner.avgTicketValue', { amount: formatMoney(metrics.average_order_value) })}</p>
            </div>
            <div className="text-2xl">🧾</div>
          </div>
        </div>

        {/* Tables */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('dashboard.owner.tableOccupancy')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.occupied_tables}/{metrics.occupied_tables + metrics.available_tables}
              </p>
              <p className="text-sm text-gray-500">{t('dashboard.owner.occupiedPercent', { percent: formatNumber((metrics.occupied_tables / (metrics.occupied_tables + metrics.available_tables)) * 100) })}</p>
            </div>
            <div className="text-2xl">🍽️</div>
          </div>
        </div>

        {/* Staff Performance */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('dashboard.owner.topPerformer')}</p>
              <p className="text-lg font-bold text-gray-900">{extendedMockData.topPerformer.name}</p>
              <p className="text-sm text-gray-500">{t('dashboard.owner.performerStats', { count: extendedMockData.topPerformer.ordersCompleted, amount: formatMoney(extendedMockData.topPerformer.revenue) })}</p>
            </div>
            <div className="text-2xl">👑</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Sales Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">📈 {t('dashboard.owner.hourlySales')}</h3>
          <div className="space-y-2">
            {extendedMockData.hourlySales.slice(-8).map((hour) => (
              <div key={hour.hour} className="flex items-center gap-3">
                <div className="w-12 text-sm text-gray-600">{hour.hour}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-3 relative">
                  <div
                    className="bg-blue-500 h-3 rounded-full"
                    style={{ width: `${(hour.sales / 2500) * 100}%` }}
                  ></div>
                </div>
                <div className="w-20 text-sm font-medium text-end">{formatMoney(hour.sales)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">💳 {t('dashboard.paymentMethods')}</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>{t('payment.method.cash')}</span>
              </div>
              <div className="text-end">
                <div className="font-semibold">{formatMoney(extendedMockData.paymentMethods.cash)}</div>
                <div className="text-sm text-gray-500">
                  {formatNumber((extendedMockData.paymentMethods.cash / metrics.total_revenue) * 100)}%
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>{t('payment.method.card')}</span>
              </div>
              <div className="text-end">
                <div className="font-semibold">{formatMoney(extendedMockData.paymentMethods.card)}</div>
                <div className="text-sm text-gray-500">
                  {formatNumber((extendedMockData.paymentMethods.card / metrics.total_revenue) * 100)}%
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span>{t('dashboard.owner.other')}</span>
              </div>
              <div className="text-end">
                <div className="font-semibold">{formatMoney(extendedMockData.paymentMethods.other)}</div>
                <div className="text-sm text-gray-500">
                  {formatNumber((extendedMockData.paymentMethods.other / metrics.total_revenue) * 100)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Items */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">🏆 {t('dashboard.owner.topItems')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          {extendedMockData.topItems.map((item, index) => (
            <div key={item.name} className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}</span>
                <span className="font-medium">{item.name}</span>
              </div>
              <div className="text-sm text-gray-600">
                <div>{t('dashboard.owner.sold', { count: item.sold })}</div>
                <div className="font-semibold text-green-600">{formatMoney(item.revenue)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">⚡ {t('dashboard.owner.quickActions')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <button
            onClick={() => navigate('/reports')}
            className="p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors hover:scale-105 transform duration-200"
          >
            <div className="text-2xl mb-2">📊</div>
            <div className="text-sm font-medium">{t('dashboard.owner.viewReports')}</div>
          </button>
          <button
            onClick={() => navigate('/tables/manage')}
            className="p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors hover:scale-105 transform duration-200"
          >
            <div className="text-2xl mb-2">🍽️</div>
            <div className="text-sm font-medium">{t('nav.manageTables')}</div>
          </button>
          <button
            onClick={() => navigate('/owner/tables')}
            className="p-4 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors hover:scale-105 transform duration-200"
          >
            <div className="text-2xl mb-2">📊</div>
            <div className="text-sm font-medium">{t('dashboard.owner.tableAnalytics')}</div>
          </button>
          <button
            onClick={() => navigate('/owner/staff')}
            className="p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors hover:scale-105 transform duration-200"
          >
            <div className="text-2xl mb-2">👥</div>
            <div className="text-sm font-medium">{t('dashboard.owner.staffManagement')}</div>
          </button>
          <button
            onClick={() => navigate('/items')}
            className="p-4 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors hover:scale-105 transform duration-200"
          >
            <div className="text-2xl mb-2">📋</div>
            <div className="text-sm font-medium">{t('dashboard.owner.menuEditor')}</div>
          </button>
        </div>
      </div>
    </div>
  );
}
