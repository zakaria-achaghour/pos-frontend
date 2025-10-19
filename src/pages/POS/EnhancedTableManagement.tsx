import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuthRedux';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

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
  const [tables, setTables] = useState<TableWithDetails[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableWithDetails | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'layout' | 'analytics'>('grid');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'occupied' | 'reserved'>('all');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'occupied': return 'bg-red-100 text-red-800 border-red-200';
      case 'reserved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cleaning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return '✅';
      case 'occupied': return '👥';
      case 'reserved': return '📅';
      case 'cleaning': return '🧹';
      default: return '❓';
    }
  };

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
        <PageMeta title="Table Management | POS System" description="Advanced table management" />
        <PageBreadcrumb pageTitle="Table Management" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      <PageMeta title="Table Management | POS System" description="Advanced table management" />
      <PageBreadcrumb pageTitle="Table Management" />
      
      {/* Header with Stats */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Table Management</h1>
            <p className="text-gray-600">Monitor and manage all restaurant tables</p>
          </div>
          
          {/* Key Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">MAD {stats.totalRevenue.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Today's Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{stats.totalTurnovers}</div>
              <div className="text-sm text-gray-600">Total Turnovers</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{avgStayTime}min</div>
              <div className="text-sm text-gray-600">Avg Stay Time</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">MAD {stats.totalTips.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Tips Today</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* View Mode Toggle */}
          <div className="flex gap-2">
            {[
              { key: 'grid', label: 'Grid View', icon: '▦' },
              { key: 'layout', label: 'Floor Plan', icon: '🏗️' },
              { key: 'analytics', label: 'Analytics', icon: '📊' }
            ].map((mode) => (
              <button
                key={mode.key}
                onClick={() => setViewMode(mode.key as 'grid' | 'layout' | 'analytics')}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  viewMode === mode.key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {mode.icon} {mode.label}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'All', count: tables.length },
              { key: 'available', label: 'Available', count: tables.filter(t => t.status === 'available').length },
              { key: 'occupied', label: 'Occupied', count: tables.filter(t => t.status === 'occupied').length },
              { key: 'reserved', label: 'Reserved', count: tables.filter(t => t.status === 'reserved').length }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setStatusFilter(filter.key as any)}
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
            <div
              key={table.id}
              onClick={() => setSelectedTable(table)}
              className={`bg-white rounded-lg shadow cursor-pointer hover:shadow-lg transition-all border-2 ${getStatusColor(table.status)}`}
            >
              {/* Table Header */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getStatusIcon(table.status)}</span>
                    <h3 className="font-semibold text-gray-900">{table.name}</h3>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(table.status)}`}>
                    {table.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">👥 Capacity: {table.capacity} guests</p>
              </div>

              {/* Table Body */}
              <div className="p-4">
                {/* Current Order Info */}
                {table.currentOrder && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Current Order</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-800">
                        {table.currentOrder.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Customer:</span>
                        <div className="font-medium">{table.currentOrder.customerName}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Waiter:</span>
                        <div className="font-medium">{table.currentOrder.waiterName}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Started:</span>
                        <div className="font-medium">{table.currentOrder.startTime}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Total:</span>
                        <div className="font-bold text-green-600">MAD {table.currentOrder.total.toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-orange-600">
                      ⏱️ Wait time: {table.currentOrder.waitTime} minutes
                    </div>
                  </div>
                )}

                {/* Reservation Info */}
                {table.reservations && table.reservations.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-3 mb-3">
                    <div className="text-sm font-medium text-blue-700 mb-1">Next Reservation</div>
                    <div className="text-sm">
                      <div>{table.reservations[0].customerName}</div>
                      <div className="text-blue-600">{table.reservations[0].time} • {table.reservations[0].partySize} guests</div>
                      {table.reservations[0].notes && (
                        <div className="text-xs text-blue-500 mt-1">📝 {table.reservations[0].notes}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Today's Performance */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-bold text-gray-900">{table.todayStats.turnovers}</div>
                    <div className="text-gray-600">Turnovers</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-bold text-green-600">MAD {table.todayStats.totalRevenue.toFixed(2)}</div>
                    <div className="text-gray-600">Revenue</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Layout View */}
      {viewMode === 'layout' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🏗️</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Floor Plan Designer</h3>
            <p className="text-gray-500 mb-4">Visual table layout management coming soon!</p>
            <p className="text-sm text-gray-400">
              This feature will allow drag-and-drop table positioning, custom layouts, and real-time status visualization.
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
              <h3 className="text-lg font-semibold mb-4">🎯 Table Efficiency</h3>
              <div className="space-y-3">
                {tables.slice(0, 3).map((table) => (
                  <div key={table.id} className="flex justify-between items-center">
                    <span className="text-sm">{table.name}</span>
                    <div className="text-right">
                      <div className="text-sm font-bold">MAD {(table.todayStats.totalRevenue / table.capacity).toFixed(0)}</div>
                      <div className="text-xs text-gray-500">per seat</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">⏱️ Average Stay Times</h3>
              <div className="space-y-3">
                {tables.slice(0, 3).map((table) => (
                  <div key={table.id} className="flex justify-between items-center">
                    <span className="text-sm">{table.name}</span>
                    <div className="text-right">
                      <div className="text-sm font-bold">{table.todayStats.averageStay}min</div>
                      <div className="text-xs text-gray-500">avg stay</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">💰 Top Earning Tables</h3>
              <div className="space-y-3">
                {tables
                  .sort((a, b) => b.todayStats.totalRevenue - a.todayStats.totalRevenue)
                  .slice(0, 3)
                  .map((table, index) => (
                    <div key={table.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
                        <span className="text-sm">{table.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-green-600">MAD {table.todayStats.totalRevenue.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">{table.todayStats.turnovers} turns</div>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{selectedTable.name} Details</h3>
              <button
                onClick={() => setSelectedTable(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Capacity:</span>
                  <div className="font-medium">{selectedTable.capacity} guests</div>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <div className={`font-medium ${selectedTable.status === 'available' ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedTable.status}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Today's Revenue:</span>
                  <div className="font-bold text-green-600">MAD {selectedTable.todayStats.totalRevenue.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-gray-500">Turnovers:</span>
                  <div className="font-medium">{selectedTable.todayStats.turnovers}</div>
                </div>
              </div>

              {selectedTable.currentOrder && (
                <div className="bg-gray-50 p-3 rounded">
                  <div className="font-medium mb-2">Current Order Details</div>
                  <div className="text-sm space-y-1">
                    <div>Customer: {selectedTable.currentOrder.customerName}</div>
                    <div>Waiter: {selectedTable.currentOrder.waiterName}</div>
                    <div>Order #: {selectedTable.currentOrder.id}</div>
                    <div>Total: MAD {selectedTable.currentOrder.total.toFixed(2)}</div>
                    <div>Status: {selectedTable.currentOrder.status}</div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                  View Order
                </button>
                <button className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600">
                  Manage Table
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}