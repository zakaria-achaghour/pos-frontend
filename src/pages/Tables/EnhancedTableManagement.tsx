import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import DemoDataBanner from '@/components/common/DemoDataBanner';
import EnhancedTableStats from '@/components/pos/tables/EnhancedTableStats';
import { Modal, StatusPill } from '@/components/kit';
import { tableStateStyle } from '@/design/status';
import { formatMoney } from '@/lib/money';

interface TableWithDetails {
  id: number;
  name: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  position: { x: number; y: number };
  shape: 'square' | 'round' | 'rectangle';
  currentOrder?: {
    id: number;
    customerId?: number;
    customerName?: string;
    total: number;
    items: number;
    status: 'preparing' | 'ready' | 'served';
    startTime: string;
    waitTime: number; // minutes
    waiterName: string;
  };
  reservations?: Array<{
    id: number;
    customerName: string;
    time: string;
    partySize: number;
    phone: string;
    notes?: string;
  }>;
  todayStats: {
    turnovers: number;
    totalRevenue: number;
    averageStay: number; // minutes
    tips: number;
  };
}

const mockTablesData: TableWithDetails[] = [
  {
    id: 1,
    name: 'Table 1',
    capacity: 4,
    status: 'occupied',
    position: { x: 100, y: 100 },
    shape: 'square',
    currentOrder: {
      id: 101,
      customerName: 'Hassan Ahmed',
      total: 245.50,
      items: 3,
      status: 'ready',
      startTime: '14:30',
      waitTime: 45,
      waiterName: 'Sara'
    },
    todayStats: {
      turnovers: 3,
      totalRevenue: 486.75,
      averageStay: 65,
      tips: 45.25
    }
  },
  {
    id: 2,
    name: 'Table 2',
    capacity: 2,
    status: 'available',
    position: { x: 250, y: 100 },
    shape: 'round',
    todayStats: {
      turnovers: 4,
      totalRevenue: 320.00,
      averageStay: 52,
      tips: 28.50
    }
  },
  {
    id: 3,
    name: 'Table 3',
    capacity: 6,
    status: 'reserved',
    position: { x: 400, y: 100 },
    shape: 'rectangle',
    reservations: [
      {
        id: 201,
        customerName: 'Fatima Benali',
        time: '19:30',
        partySize: 6,
        phone: '+212 6 12 34 56 78',
        notes: 'Birthday celebration - cake needed'
      }
    ],
    todayStats: {
      turnovers: 2,
      totalRevenue: 580.25,
      averageStay: 85,
      tips: 62.00
    }
  }
];

export default function EnhancedTableManagement() {
  const { t } = useTranslation();
  const [tables, setTables] = useState<TableWithDetails[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableWithDetails | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'layout' | 'analytics'>('grid');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'occupied' | 'reserved'>('all');
  const [loading, setLoading] = useState(true);
  
  // Enhanced analytics are handled by EnhancedTableStats component

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setTables(mockTablesData);
      setLoading(false);
    }, 800);
  }, []);

  const filteredTables = tables.filter(table => 
    statusFilter === 'all' || table.status === statusFilter
  );

  const tableName = (table: TableWithDetails) => t('tableAdmin.card.title', { n: table.id });
  const orderStatusLabel = (status: string) => t(`status.${status}`, { defaultValue: status });

  const getTotalStats = () => {
    return tables.reduce((acc, table) => ({
      totalRevenue: acc.totalRevenue + table.todayStats.totalRevenue,
      totalTurnovers: acc.totalTurnovers + table.todayStats.turnovers,
      totalTips: acc.totalTips + table.todayStats.tips,
      avgStay: acc.avgStay + table.todayStats.averageStay
    }), { totalRevenue: 0, totalTurnovers: 0, totalTips: 0, avgStay: 0 });
  };

  const stats = getTotalStats();
  const avgStayTime = Math.round(stats.avgStay / tables.length);

  if (loading) {
    return (
      <div>
        <PageMeta title={t('tableAdmin.enhanced.metaTitle')} description={t('tableAdmin.enhanced.metaDescription')} />
        <PageBreadcrumb pageTitle={t('tableAdmin.breadcrumb')} />
        <div role="status" aria-label={t('common.loading')} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageMeta title={t('tableAdmin.enhanced.metaTitle')} description={t('tableAdmin.enhanced.metaDescription')} />
      <PageBreadcrumb pageTitle={t('tableAdmin.breadcrumb')} />
      <DemoDataBanner />

      {/* Header with Stats */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('tableAdmin.breadcrumb')}</h1>
            <p className="text-gray-600">{t('tableAdmin.enhanced.subtitle')}</p>
          </div>
          
          {/* Key Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{formatMoney(stats.totalRevenue)}</div>
              <div className="text-sm text-gray-600">{t('tableAdmin.enhanced.todayRevenue')}</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{stats.totalTurnovers}</div>
              <div className="text-sm text-gray-600">{t('tableAdmin.enhanced.totalTurnovers')}</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{t('tableAdmin.minutes', { count: avgStayTime })}</div>
              <div className="text-sm text-gray-600">{t('tableAdmin.enhanced.avgStayTime')}</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{formatMoney(stats.totalTips)}</div>
              <div className="text-sm text-gray-600">{t('tableAdmin.enhanced.tipsToday')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Table Analytics */}
      <EnhancedTableStats />

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* View Mode Toggle */}
          <div className="flex gap-2" role="group" aria-label={t('tableAdmin.enhanced.viewMode')}>
            {[
              { key: 'grid', label: t('tableAdmin.enhanced.gridView'), icon: '▦' },
              { key: 'layout', label: t('tableAdmin.enhanced.floorPlan'), icon: '🏗️' },
              { key: 'analytics', label: t('tableAdmin.enhanced.analytics'), icon: '📊' }
            ].map((mode) => (
              <button
                key={mode.key}
                type="button"
                aria-pressed={viewMode === mode.key}
                onClick={() => setViewMode(mode.key as 'grid' | 'layout' | 'analytics')}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  viewMode === mode.key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span aria-hidden="true">{mode.icon}</span> {mode.label}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex gap-2" role="group" aria-label={t('tables.filterLabel')}>
            {[
              { key: 'all', label: t('common.all'), count: tables.length },
              { key: 'available', label: t('tableState.available'), count: tables.filter(tb => tb.status === 'available').length },
              { key: 'occupied', label: t('tableState.occupied'), count: tables.filter(tb => tb.status === 'occupied').length },
              { key: 'reserved', label: t('tableState.reserved'), count: tables.filter(tb => tb.status === 'reserved').length }
            ].map((filter) => (
              <button
                key={filter.key}
                type="button"
                aria-pressed={statusFilter === filter.key}
                onClick={() => setStatusFilter(filter.key as 'all' | 'available' | 'occupied' | 'reserved')}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  statusFilter === filter.key
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTables.map((table) => (
            <button
              type="button"
              key={table.id}
              onClick={() => setSelectedTable(table)}
              aria-label={t('tableAdmin.enhanced.openDetails', { name: tableName(table) })}
              className={`block w-full text-start bg-white rounded-lg shadow cursor-pointer hover:shadow-lg transition-all border-2 ${tableStateStyle(table.status).border}`}
            >
              {/* Table Header */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{tableName(table)}</h3>
                  </div>
                  <StatusPill style={tableStateStyle(table.status)} label={t(`tableState.${table.status}`)} size="sm" />
                </div>
                <p className="text-sm text-gray-600 mt-1">{t('tableAdmin.enhanced.capacity', { count: table.capacity })}</p>
              </div>

              {/* Table Body */}
              <div className="p-4">
                {/* Current Order Info */}
                {table.currentOrder && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{t('tableAdmin.enhanced.currentOrder')}</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-800">
                        {orderStatusLabel(table.currentOrder.status)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">{t('tableAdmin.enhanced.customer')}</span>
                        <div className="font-medium">{table.currentOrder.customerName}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">{t('tableAdmin.enhanced.waiter')}</span>
                        <div className="font-medium">{table.currentOrder.waiterName}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">{t('tableAdmin.enhanced.started')}</span>
                        <div className="font-medium">{table.currentOrder.startTime}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">{t('tableAdmin.enhanced.total')}</span>
                        <div className="font-bold text-green-600">{formatMoney(table.currentOrder.total)}</div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-orange-600">
                      <span aria-hidden="true">⏱️ </span>{t('tableAdmin.enhanced.waitTime', { count: table.currentOrder.waitTime })}
                    </div>
                  </div>
                )}

                {/* Reservation Info */}
                {table.reservations && table.reservations.length > 0 && (() => {
                  const nextReservation = table.reservations?.[0];
                  if (!nextReservation) return null;
                  return (
                    <div className="bg-blue-50 rounded-lg p-3 mb-3">
                      <div className="text-sm font-medium text-blue-700 mb-1">{t('tableAdmin.enhanced.nextReservation')}</div>
                      <div className="text-sm">
                        <div>{nextReservation.customerName}</div>
                        <div className="text-blue-600">{nextReservation.time} • {t('tableAdmin.enhanced.guests', { count: nextReservation.partySize })}</div>
                        {nextReservation.notes && (
                          <div className="text-xs text-blue-500 mt-1"><span aria-hidden="true">📝 </span>{nextReservation.notes}</div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Today's Performance */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-bold text-gray-900">{table.todayStats.turnovers}</div>
                    <div className="text-gray-600">{t('tableAdmin.enhanced.turnovers')}</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-bold text-green-600">{formatMoney(table.todayStats.totalRevenue)}</div>
                    <div className="text-gray-600">{t('tableAdmin.enhanced.revenue')}</div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Layout View */}
      {viewMode === 'layout' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center py-8">
            <div className="text-4xl mb-4" aria-hidden="true">🏗️</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">{t('tableAdmin.enhanced.floorPlanTitle')}</h3>
            <p className="text-gray-500 mb-4">{t('tableAdmin.enhanced.floorPlanSoon')}</p>
            <p className="text-sm text-gray-400">
              {t('tableAdmin.enhanced.floorPlanBody')}
            </p>
          </div>
        </div>
      )}

      {/* Analytics View */}
      {viewMode === 'analytics' && (
        <div className="space-y-6">
          {/* Performance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">{t('tableAdmin.enhanced.efficiency')}</h3>
              <div className="space-y-3">
                {tables.slice(0, 3).map((table) => (
                  <div key={table.id} className="flex justify-between items-center">
                    <span className="text-sm">{tableName(table)}</span>
                    <div className="text-end">
                      <div className="text-sm font-bold">{formatMoney(table.todayStats.totalRevenue / table.capacity)}</div>
                      <div className="text-xs text-gray-500">{t('tableAdmin.enhanced.perSeat')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">{t('tableAdmin.enhanced.avgStayTimes')}</h3>
              <div className="space-y-3">
                {tables.slice(0, 3).map((table) => (
                  <div key={table.id} className="flex justify-between items-center">
                    <span className="text-sm">{tableName(table)}</span>
                    <div className="text-end">
                      <div className="text-sm font-bold">{t('tableAdmin.minutes', { count: table.todayStats.averageStay })}</div>
                      <div className="text-xs text-gray-500">{t('tableAdmin.enhanced.avgStay')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">{t('tableAdmin.enhanced.topEarning')}</h3>
              <div className="space-y-3">
                {tables
                  .sort((a, b) => b.todayStats.totalRevenue - a.todayStats.totalRevenue)
                  .slice(0, 3)
                  .map((table, index) => (
                    <div key={table.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm" aria-hidden="true">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
                        <span className="text-sm">{tableName(table)}</span>
                      </div>
                      <div className="text-end">
                        <div className="text-sm font-bold text-green-600">{formatMoney(table.todayStats.totalRevenue)}</div>
                        <div className="text-xs text-gray-500">{t('tableAdmin.enhanced.turns', { count: table.todayStats.turnovers })}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table Details Modal */}
      {selectedTable && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedTable(null)}
          title={t('tableAdmin.enhanced.detailsTitle', { name: tableName(selectedTable) })}
          closeLabel={t('common.close')}
          size="sm"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">{t('tableAdmin.enhanced.capacityLabel')}</span>
                <div className="font-medium">{t('tableAdmin.enhanced.guests', { count: selectedTable.capacity })}</div>
              </div>
              <div>
                <span className="text-gray-500">{t('tableAdmin.enhanced.statusLabel')}</span>
                <div className="mt-1">
                  <StatusPill style={tableStateStyle(selectedTable.status)} label={t(`tableState.${selectedTable.status}`)} size="sm" />
                </div>
              </div>
              <div>
                <span className="text-gray-500">{t('tableAdmin.enhanced.todayRevenueLabel')}</span>
                <div className="font-bold text-green-600">{formatMoney(selectedTable.todayStats.totalRevenue)}</div>
              </div>
              <div>
                <span className="text-gray-500">{t('tableAdmin.enhanced.turnoversLabel')}</span>
                <div className="font-medium">{selectedTable.todayStats.turnovers}</div>
              </div>
            </div>

            {selectedTable.currentOrder && (
              <div className="bg-gray-50 p-3 rounded">
                <div className="font-medium mb-2">{t('tableAdmin.enhanced.orderDetails')}</div>
                <div className="text-sm space-y-1">
                  <div>{t('tableAdmin.enhanced.customer')} {selectedTable.currentOrder.customerName}</div>
                  <div>{t('tableAdmin.enhanced.waiter')} {selectedTable.currentOrder.waiterName}</div>
                  <div>{t('tableAdmin.enhanced.orderNumber', { n: selectedTable.currentOrder.id })}</div>
                  <div>{t('tableAdmin.enhanced.total')} {formatMoney(selectedTable.currentOrder.total)}</div>
                  <div>{t('tableAdmin.enhanced.statusLabel')} {orderStatusLabel(selectedTable.currentOrder.status)}</div>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button type="button" className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                {t('tableAdmin.enhanced.viewOrder')}
              </button>
              <button type="button" className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600">
                {t('tableAdmin.enhanced.manageTable')}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
