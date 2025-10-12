import React from 'react';

interface TableStatsData {
  total: number;
  available: number;
  occupied: number;
  reserved: number;
  maintenance: number;
  totalCapacity: number;
  occupancyRate: number;
}

interface TableStatsProps {
  stats: TableStatsData;
}

const TableStats: React.FC<TableStatsProps> = ({ stats }) => {
  const getOccupancyColor = (rate: number) => {
    if (rate >= 80) return 'text-red-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getOccupancyBgColor = (rate: number) => {
    if (rate >= 80) return 'bg-red-100';
    if (rate >= 60) return 'bg-yellow-100';
    return 'bg-green-100';
  };

  const statsCards = [
    {
      title: 'Total Tables',
      value: stats.total,
      icon: '🍽️',
      color: 'text-gray-900',
      bgColor: 'bg-gray-100',
      description: 'All tables in restaurant'
    },
    {
      title: 'Available',
      value: stats.available,
      icon: '✅',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Ready for guests'
    },
    {
      title: 'Occupied',
      value: stats.occupied,
      icon: '👥',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'Currently serving'
    },
    {
      title: 'Reserved',
      value: stats.reserved,
      icon: '📅',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Upcoming reservations'
    },
    {
      title: 'Maintenance',
      value: stats.maintenance,
      icon: '🔧',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      description: 'Under maintenance'
    },
    {
      title: 'Total Capacity',
      value: stats.totalCapacity,
      icon: '🪑',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Maximum guests'
    }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">📊 Table Statistics</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getOccupancyBgColor(stats.occupancyRate)} ${getOccupancyColor(stats.occupancyRate)}`}>
          {stats.occupancyRate}% Occupied
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {statsCards.map((stat, index) => (
          <div key={index} className="text-center p-4 rounded-lg border bg-gray-50">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${stat.bgColor} mb-2`}>
              <span className="text-xl">{stat.icon}</span>
            </div>
            <div className={`text-2xl font-bold ${stat.color} mb-1`}>
              {stat.value}
            </div>
            <div className="text-sm font-medium text-gray-700 mb-1">
              {stat.title}
            </div>
            <div className="text-xs text-gray-500">
              {stat.description}
            </div>
          </div>
        ))}
      </div>

      {/* Occupancy Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Restaurant Occupancy</span>
          <span className={`text-sm font-medium ${getOccupancyColor(stats.occupancyRate)}`}>
            {stats.occupied} of {stats.total} tables
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${
              stats.occupancyRate >= 80 ? 'bg-red-500' :
              stats.occupancyRate >= 60 ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{ width: `${stats.occupancyRate}%` }}
          ></div>
        </div>
      </div>

      {/* Status Distribution */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Status Distribution</h4>
        <div className="space-y-2">
          {[
            { label: 'Available', value: stats.available, total: stats.total, color: 'bg-green-500' },
            { label: 'Occupied', value: stats.occupied, total: stats.total, color: 'bg-red-500' },
            { label: 'Reserved', value: stats.reserved, total: stats.total, color: 'bg-blue-500' },
            { label: 'Maintenance', value: stats.maintenance, total: stats.total, color: 'bg-yellow-500' }
          ].map((item, index) => {
            const percentage = stats.total > 0 ? Math.round((item.value / item.total) * 100) : 0;
            return (
              <div key={index} className="flex items-center gap-3">
                <div className="w-16 text-sm text-gray-600">{item.label}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${item.color} transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-600 w-12 text-right">
                  {percentage}%
                </div>
                <div className="text-sm text-gray-500 w-8 text-right">
                  {item.value}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Insights */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Insights</h4>
        <div className="text-sm text-gray-600 space-y-1">
          {stats.occupancyRate >= 80 && (
            <div className="flex items-center gap-2 text-red-600">
              <span>🔥</span>
              <span>High occupancy - consider wait list management</span>
            </div>
          )}
          {stats.maintenance > 0 && (
            <div className="flex items-center gap-2 text-yellow-600">
              <span>⚠️</span>
              <span>{stats.maintenance} table{stats.maintenance !== 1 ? 's' : ''} need{stats.maintenance === 1 ? 's' : ''} maintenance</span>
            </div>
          )}
          {stats.available > Math.floor(stats.total * 0.7) && (
            <div className="flex items-center gap-2 text-green-600">
              <span>✨</span>
              <span>Good availability for walk-in customers</span>
            </div>
          )}
          {stats.reserved > 0 && (
            <div className="flex items-center gap-2 text-blue-600">
              <span>📅</span>
              <span>{stats.reserved} reservation{stats.reserved !== 1 ? 's' : ''} pending</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableStats;