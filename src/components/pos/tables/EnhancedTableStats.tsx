import { dynamicT } from '@/i18n/dynamic';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatMoney } from '@/lib/money';
import type { EnhancedTableStatsProps } from '@/types/table';
import { useTableAnalytics } from '@/hooks/useTableAnalytics';


export default function EnhancedTableStats({ className = '' }: EnhancedTableStatsProps) {
  const { t } = useTranslation();
  const {
    analytics,
    loading,
    error,
    period,
    summaryStats,
    tableRanking,
    occupancyTrends,
    revenueBreakdown,
    updatePeriod,
    refreshAnalytics
  } = useTableAnalytics();

  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'revenue' | 'occupancy'>('overview');

  if (loading && !analytics.length) {
    return (
      <div className={`bg-surface p-6 rounded-lg shadow border ${className}`}>
        <div role="status" aria-label={t('common.loading')} className="animate-pulse">
          <div className="h-4 bg-surface-2 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-surface-2 rounded"></div>
            <div className="h-3 bg-surface-2 rounded w-5/6"></div>
            <div className="h-3 bg-surface-2 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-surface p-6 rounded-lg shadow border ${className}`}>
        <div className="text-center text-danger">
          <p className="mb-4"><span aria-hidden="true">⚠️ </span>{error}</p>
          <button
            type="button"
            onClick={refreshAnalytics}
            className="bg-danger text-white px-4 py-2 rounded hover:bg-danger/90 transition-colors"
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-surface rounded-lg shadow border ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-line">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-fg"><span aria-hidden="true">📊 </span>{t('tableAdmin.stats.title')}</h3>
            <p className="text-fg-muted text-sm">{t('tableAdmin.stats.subtitle')}</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Period Selector */}
            <div className="flex bg-surface-2 rounded-lg p-1" role="group" aria-label={t('tableAdmin.stats.period')}>
              {(['today', 'week', 'month'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  aria-pressed={period === p}
                  onClick={() => updatePeriod(p)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    period === p
                      ? 'bg-surface text-primary shadow-sm'
                      : 'text-fg-muted hover:text-fg'
                  }`}
                >
                  {dynamicT(`tableAdmin.stats.periods.${p}`)}
                </button>
              ))}
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={refreshAnalytics}
              disabled={loading}
              className="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              <span aria-hidden="true">{loading ? '🔄' : '↻'}</span> {t('common.refresh')}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-line">
        <nav className="flex gap-8 px-6" aria-label={t('tableAdmin.stats.tabsLabel')}>
          {[
            { id: 'overview', name: t('tableAdmin.stats.tabs.overview'), icon: '📈' },
            { id: 'performance', name: t('tableAdmin.stats.tabs.performance'), icon: '🏆' },
            { id: 'revenue', name: t('tableAdmin.stats.tabs.revenue'), icon: '💰' },
            { id: 'occupancy', name: t('tableAdmin.stats.tabs.occupancy'), icon: '🪑' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              aria-current={activeTab === tab.id ? 'page' : undefined}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-fg-muted hover:text-fg hover:border-line'
              }`}
            >
              <span aria-hidden="true">{tab.icon}</span> {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Summary Cards */}
            <div className="bg-surface p-4 rounded-lg border border-success/30">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl" aria-hidden="true">💰</span>
                </div>
                <div className="ms-3">
                  <p className="text-sm font-medium text-success">{t('tableAdmin.stats.totalRevenue')}</p>
                  <p className="text-lg font-semibold text-success">{formatMoney(summaryStats.totalRevenue)}</p>
                </div>
              </div>
            </div>

            <div className="bg-surface p-4 rounded-lg border border-primary/30">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl" aria-hidden="true">🪑</span>
                </div>
                <div className="ms-3">
                  <p className="text-sm font-medium text-primary">{t('tableAdmin.stats.avgOccupancy')}</p>
                  <p className="text-lg font-semibold text-primary">{summaryStats.avgOccupancy}%</p>
                </div>
              </div>
            </div>

            <div className="bg-surface p-4 rounded-lg border border-sec-staff/30">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl" aria-hidden="true">👥</span>
                </div>
                <div className="ms-3">
                  <p className="text-sm font-medium text-sec-staff">{t('tableAdmin.stats.totalSeatings')}</p>
                  <p className="text-lg font-semibold text-sec-staff">{summaryStats.totalSeatings}</p>
                </div>
              </div>
            </div>

            <div className="bg-surface p-4 rounded-lg border border-warning/30">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl" aria-hidden="true">⏱️</span>
                </div>
                <div className="ms-3">
                  <p className="text-sm font-medium text-warning">{t('tableAdmin.stats.avgDuration')}</p>
                  <p className="text-lg font-semibold text-warning">{t('tableAdmin.stats.minutesShort', { count: summaryStats.avgDuration })}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            {/* Top Performing Table */}
            {summaryStats.topPerformingTable && (
              <div className="bg-surface p-4 rounded-lg border border-warning/30">
                <div className="flex items-center">
                  <span className="text-3xl me-3" aria-hidden="true">🏆</span>
                  <div>
                    <h4 className="font-semibold text-warning">{t('tableAdmin.stats.topTable')}</h4>
                    <p className="text-warning">
                      {t('tableAdmin.stats.topTableLine', {
                        n: summaryStats.topPerformingTable.table_number,
                        amount: formatMoney(summaryStats.topPerformingTable.total_revenue),
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Table Performance Ranking */}
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-line">
                <thead className="bg-bg">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-medium text-fg-muted uppercase tracking-wider">
                      {t('tableAdmin.stats.col.rank')}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-fg-muted uppercase tracking-wider">
                      {t('tableAdmin.stats.col.table')}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-fg-muted uppercase tracking-wider">
                      {t('tableAdmin.stats.col.revenue')}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-fg-muted uppercase tracking-wider">
                      {t('tableAdmin.stats.col.seatings')}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-fg-muted uppercase tracking-wider">
                      {t('tableAdmin.stats.col.occupancy')}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-fg-muted uppercase tracking-wider">
                      {t('tableAdmin.stats.col.share')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-surface divide-y divide-line">
                  {tableRanking.slice(0, 10).map((table) => (
                    <tr key={table.table_id} className="hover:bg-bg">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-fg">
                        #{table.rank}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-fg">
                            {t('tableAdmin.card.title', { n: table.table_number })}
                          </span>
                          <span className="ms-2 text-xs text-fg-muted">
                            ({t('tables.seats', { count: table.capacity })})
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-fg">
                        {formatMoney(table.total_revenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-fg">
                        {table.total_seatings}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-fg">
                        {table.average_occupancy_rate}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-surface-2 rounded-full h-2 me-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${Math.min(table.revenuePercentage, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-fg-muted">{table.revenuePercentage}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <div className="bg-bg p-6 rounded-lg">
              <h4 className="text-lg font-medium text-fg mb-4"><span aria-hidden="true">💰 </span>{t('tableAdmin.stats.revenueAnalytics')}</h4>
              <pre className="text-sm text-fg-muted overflow-auto">
                {JSON.stringify(revenueBreakdown, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'occupancy' && (
          <div className="space-y-6">
            <div className="bg-bg p-6 rounded-lg">
              <h4 className="text-lg font-medium text-fg mb-4"><span aria-hidden="true">🪑 </span>{t('tableAdmin.stats.occupancyTrends')}</h4>
              <pre className="text-sm text-fg-muted overflow-auto">
                {JSON.stringify(occupancyTrends, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* No Data State */}
        {!analytics.length && !loading && (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block" aria-hidden="true">📊</span>
            <p className="text-fg-muted text-lg">{t('tableAdmin.stats.noData')}</p>
            <p className="text-fg-muted text-sm">{t('tableAdmin.stats.noDataHint')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
