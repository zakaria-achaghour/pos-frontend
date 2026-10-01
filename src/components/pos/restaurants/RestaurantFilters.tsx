import { useTranslation } from 'react-i18next';
import type { RestaurantFilter } from '@/hooks/useRestaurantManagement';

interface RestaurantFiltersProps {
  statusFilter: RestaurantFilter;
  searchTerm: string;
  onStatusFilterChange: (filter: RestaurantFilter) => void;
  onSearchChange: (term: string) => void;
  stats?: {
    total: number;
    active: number;
    inactive: number;
    pending: number;
    suspended: number;
  };
}

export default function RestaurantFilters({
  statusFilter,
  searchTerm,
  onStatusFilterChange,
  onSearchChange,
  stats,
}: RestaurantFiltersProps) {
  const { t } = useTranslation();
  const filters: Array<{ key: RestaurantFilter; label: string; icon: string }> = [
    { key: 'all', label: t('tenants.filters.all'), icon: '🏪' },
    { key: 'active', label: t('tenants.status.active'), icon: '✅' },
    { key: 'inactive', label: t('tenants.status.inactive'), icon: '🔴' },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      {/* Search Bar */}
      <div>
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
          {t('tenants.filters.search')}
        </label>
        <div className="relative">
          <input
            type="text"
            id="search"
            placeholder={t('tenants.filters.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full ps-10 pe-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
            <span className="text-gray-400" aria-hidden="true">🔍</span>
          </div>
        </div>
      </div>

      {/* Status Filter Buttons */}
      <div>
        <span id="tenant-status-filter-label" className="block text-sm font-medium text-gray-700 mb-2">
          {t('tenants.filters.byStatus')}
        </span>
        <div className="flex flex-wrap gap-2" role="group" aria-labelledby="tenant-status-filter-label">
          {filters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              aria-pressed={statusFilter === filter.key}
              onClick={() => onStatusFilterChange(filter.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === filter.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span aria-hidden="true">{filter.icon}</span> {filter.label}
              {stats && (
                <span className="ms-1.5 text-xs opacity-75">
                  ({filter.key === 'all' ? stats.total : stats[filter.key as keyof typeof stats]})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500">{t('tenants.filters.total')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-500">{t('tenants.status.active')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
            <div className="text-sm text-gray-500">{t('tenants.status.inactive')}</div>
          </div>
        </div>
      )}
    </div>
  );
}
