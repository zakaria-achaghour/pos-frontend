import React from 'react';
import type { TableFiltersProps } from '@/types/table';

const TableFilters: React.FC<TableFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  statusOptions = [
    { value: 'available', label: 'Available' },
    { value: 'occupied', label: 'Occupied' },
    { value: 'reserved', label: 'Reserved' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'out-of-order', label: 'Out of Order' },
    { value: 'maintenance', label: 'Maintenance' },
  ],
}) => {
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
          <input
            type="text"
            placeholder="Search tables..."
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status || 'all'}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Status</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Shape Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Shape
          </label>
          <select
            value={filters.shape || 'all'}
            onChange={(e) => onFilterChange('shape', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Shapes</option>
            <option value="round">Round</option>
            <option value="square">Square</option>
            <option value="rectangular">Rectangular</option>
            <option value="rectangle">Rectangle</option>
          </select>
        </div>

        {/* Min Capacity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Min Capacity
          </label>
          <input
            type="number"
            min="1"
            placeholder="Min"
            value={filters.minCapacity || ''}
            onChange={(e) => onFilterChange('minCapacity', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Max Capacity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Capacity
          </label>
          <input
            type="number"
            min="1"
            placeholder="Max"
            value={filters.maxCapacity || ''}
            onChange={(e) => onFilterChange('maxCapacity', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Location Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Location/Section
        </label>
        <input
          type="text"
          placeholder="Filter by location or section..."
          value={filters.location || ''}
          onChange={(e) => onFilterChange('location', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <button
            onClick={onClearFilters}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default TableFilters;
