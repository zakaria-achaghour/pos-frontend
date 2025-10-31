import React, { useState } from 'react';
import { useTableAnalytics } from '@/hooks/useTableAnalytics';

interface EnhancedTableStatsProps {
  className?: string;
}

export default function EnhancedTableStats({ className = '' }: EnhancedTableStatsProps) {
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
      <div className={`bg-white p-6 rounded-lg shadow border ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow border ${className}`}>
        <div className="text-center text-red-600">
          <p className="mb-4">⚠️ {error}</p>
          <button
            onClick={refreshAnalytics}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow border ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">📊 Advanced Table Analytics</h3>
            <p className="text-gray-600 text-sm">Comprehensive performance metrics and insights</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Period Selector */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['today', 'week', 'month'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => updatePeriod(p)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    period === p
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>

            {/* Refresh Button */}
            <button
              onClick={refreshAnalytics}
              disabled={loading}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {loading ? '🔄' : '↻'} Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {[
            { id: 'overview', name: 'Overview', icon: '📈' },
            { id: 'performance', name: 'Table Performance', icon: '🏆' },
            { id: 'revenue', name: 'Revenue', icon: '💰' },
            { id: 'occupancy', name: 'Occupancy', icon: '🪑' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon} {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Summary Cards */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">Total Revenue</p>
                  <p className="text-lg font-semibold text-green-900">${summaryStats.totalRevenue}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">🪑</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-800">Avg Occupancy</p>
                  <p className="text-lg font-semibold text-blue-900">{summaryStats.avgOccupancy}%</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-800">Total Seatings</p>
                  <p className="text-lg font-semibold text-purple-900">{summaryStats.totalSeatings}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">⏱️</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-orange-800">Avg Duration</p>
                  <p className="text-lg font-semibold text-orange-900">{summaryStats.avgDuration}m</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            {/* Top Performing Table */}
            {summaryStats.topPerformingTable && (
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center">
                  <span className="text-3xl mr-3">🏆</span>
                  <div>
                    <h4 className="font-semibold text-yellow-800">Top Performing Table</h4>
                    <p className="text-yellow-700">
                      Table {summaryStats.topPerformingTable.table_number} - 
                      ${summaryStats.topPerformingTable.total_revenue} revenue
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Table Performance Ranking */}
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Table
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seatings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Occupancy
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Share
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tableRanking.slice(0, 10).map((table) => (
                    <tr key={table.table_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{table.rank}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900">
                            Table {table.table_number}
                          </span>
                          <span className="ml-2 text-xs text-gray-500">
                            ({table.capacity} seats)
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${table.total_revenue}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {table.total_seatings}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {table.average_occupancy_rate}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${Math.min(table.revenuePercentage, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">{table.revenuePercentage}%</span>
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
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-4">💰 Revenue Analytics</h4>
              <pre className="text-sm text-gray-600 overflow-auto">
                {JSON.stringify(revenueBreakdown, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'occupancy' && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-4">🪑 Occupancy Trends</h4>
              <pre className="text-sm text-gray-600 overflow-auto">
                {JSON.stringify(occupancyTrends, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* No Data State */}
        {!analytics.length && !loading && (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">📊</span>
            <p className="text-gray-500 text-lg">No analytics data available</p>
            <p className="text-gray-400 text-sm">Analytics will appear as tables are used</p>
          </div>
        )}
      </div>
    </div>
  );
}