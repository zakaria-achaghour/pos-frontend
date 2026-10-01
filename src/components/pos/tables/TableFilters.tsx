import React, { useId } from 'react';
import { useTranslation } from 'react-i18next';
import type { TableFiltersProps } from '@/types/table';

const TableFilters: React.FC<TableFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  statusOptions,
}) => {
  const { t } = useTranslation();
  const searchId = useId();
  const statusId = useId();
  const shapeId = useId();
  const minId = useId();
  const maxId = useId();
  const locationId = useId();
  const options = statusOptions ?? [
    { value: 'available', label: t('tableState.available') },
    { value: 'occupied', label: t('tableState.occupied') },
    { value: 'reserved', label: t('tableState.reserved') },
    { value: 'out-of-order', label: t('tableAdmin.outOfOrder') },
    { value: 'maintenance', label: t('tableState.maintenance') },
  ];
  const hasActiveFilters = 
    filters.search ||
    filters.status !== 'all' ||
    filters.shape !== 'all' ||
    filters.minCapacity ||
    filters.maxCapacity ||
    filters.location;

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor={searchId} className="sr-only">{t('tables.search')}</label>
          <input
            id={searchId}
            type="text"
            placeholder={t('tableAdmin.filters.searchPlaceholder')}
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label htmlFor={statusId} className="block text-sm font-medium text-gray-700 mb-1">
            {t('tableAdmin.filters.status')}
          </label>
          <select
            id={statusId}
            value={filters.status || 'all'}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">{t('tableAdmin.filters.allStatus')}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Shape Filter */}
        <div>
          <label htmlFor={shapeId} className="block text-sm font-medium text-gray-700 mb-1">
            {t('tableAdmin.filters.shape')}
          </label>
          <select
            id={shapeId}
            value={filters.shape || 'all'}
            onChange={(e) => onFilterChange('shape', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">{t('tableAdmin.filters.allShapes')}</option>
            <option value="round">{t('tableAdmin.shape.round')}</option>
            <option value="square">{t('tableAdmin.shape.square')}</option>
            <option value="rectangular">{t('tableAdmin.shape.rectangular')}</option>
            <option value="rectangle">{t('tableAdmin.shape.rectangle')}</option>
          </select>
        </div>

        {/* Min Capacity */}
        <div>
          <label htmlFor={minId} className="block text-sm font-medium text-gray-700 mb-1">
            {t('tableAdmin.filters.minCapacity')}
          </label>
          <input
            id={minId}
            type="number"
            min="1"
            placeholder={t('tableAdmin.filters.min')}
            value={filters.minCapacity || ''}
            onChange={(e) => onFilterChange('minCapacity', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Max Capacity */}
        <div>
          <label htmlFor={maxId} className="block text-sm font-medium text-gray-700 mb-1">
            {t('tableAdmin.filters.maxCapacity')}
          </label>
          <input
            id={maxId}
            type="number"
            min="1"
            placeholder={t('tableAdmin.filters.max')}
            value={filters.maxCapacity || ''}
            onChange={(e) => onFilterChange('maxCapacity', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Location Filter */}
      <div>
        <label htmlFor={locationId} className="block text-sm font-medium text-gray-700 mb-1">
          {t('tableAdmin.filters.location')}
        </label>
        <input
          id={locationId}
          type="text"
          placeholder={t('tableAdmin.filters.locationPlaceholder')}
          value={filters.location || ''}
          onChange={(e) => onFilterChange('location', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClearFilters}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {t('tableAdmin.filters.clear')}
          </button>
        </div>
      )}
    </div>
  );
};

export default TableFilters;
