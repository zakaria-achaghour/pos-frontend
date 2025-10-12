import React from 'react';
import type { TableFilters as TableFiltersType } from '../../hooks/useTableManagement';

interface TableFiltersProps {
  filters: TableFiltersType;
  onFiltersChange: (filters: Partial<TableFiltersType>) => void;
  onReset: () => void;
  totalCount: number;
  filteredCount: number;
}

const TableFilters: React.FC<TableFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  totalCount,
  filteredCount
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow border">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search Input */}
          <div className="flex-1 min-w-0">
            <input
              type="text"
              placeholder="Search tables by name..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ search: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <select
              value={filters.status}
              onChange={(e) => onFiltersChange({ status: e.target.value as TableFiltersType['status'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="reserved">Reserved</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          {/* Shape Filter */}
          <div className="sm:w-48">
            <select
              value={filters.shape}
              onChange={(e) => onFiltersChange({ shape: e.target.value as TableFiltersType['shape'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="all">All Shapes</option>
              <option value="square">⬜ Square</option>
              <option value="round">⭕ Round</option>
              <option value="rectangle">▭ Rectangle</option>
            </select>
          </div>
        </div>

        {/* Results Info & Reset */}
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{filteredCount}</span> of <span className="font-medium">{totalCount}</span> tables
          </div>
          
          {(filters.search || filters.status !== 'all' || filters.shape !== 'all') && (
            <button
              onClick={onReset}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.search || filters.status !== 'all' || filters.shape !== 'all') && (
        <div className="mt-3 flex flex-wrap gap-2">
          {filters.search && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              Search: "{filters.search}"
              <button
                onClick={() => onFiltersChange({ search: '' })}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                ✕
              </button>
            </span>
          )}
          
          {filters.status !== 'all' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
              Status: {filters.status}
              <button
                onClick={() => onFiltersChange({ status: 'all' })}
                className="ml-1 hover:bg-green-200 rounded-full p-0.5"
              >
                ✕
              </button>
            </span>
          )}
          
          {filters.shape !== 'all' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
              Shape: {filters.shape}
              <button
                onClick={() => onFiltersChange({ shape: 'all' })}
                className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
              >
                ✕
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default TableFilters;