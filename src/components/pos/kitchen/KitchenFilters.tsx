import React from 'react';
import type { KitchenFilters as KitchenFiltersType } from '@/types/kitchen';
import { GridIcon, CloseIcon } from '@/icons';

interface KitchenFiltersProps {
  filters: KitchenFiltersType;
  onFilterChange: (filters: Partial<KitchenFiltersType>) => void;
  onClearFilters: () => void;
}

/**
 * Kitchen Filters Component
 * Provides filtering UI for kitchen tickets
 */
const KitchenFilters: React.FC<KitchenFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
}) => {
  const hasActiveFilters = Object.values(filters).some((value) => value !== undefined && value !== '');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GridIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
          >
            <CloseIcon className="h-4 w-4" />
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => {
              const value = e.target.value;
              if (value) {
                onFilterChange({ status: value as 'pending' | 'preparing' | 'ready' });
              } else {
                onFilterChange({});
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Priority
          </label>
          <select
            value={filters.priority || ''}
            onChange={(e) => {
              const value = e.target.value;
              if (value) {
                onFilterChange({ priority: value as 'normal' | 'rush' | 'urgent' });
              } else {
                onFilterChange({});
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Priorities</option>
            <option value="normal">Normal</option>
            <option value="rush">Rush</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Cooking Station Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Station
          </label>
          <select
            value={filters.cooking_station || ''}
            onChange={(e) => {
              const value = e.target.value;
              if (value) {
                onFilterChange({ cooking_station: value });
              } else {
                onFilterChange({});
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Stations</option>
            <option value="grill">Grill</option>
            <option value="fryer">Fryer</option>
            <option value="salad">Salad</option>
            <option value="dessert">Dessert</option>
            <option value="beverages">Beverages</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default KitchenFilters;
