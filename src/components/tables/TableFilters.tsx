import React from 'react';
import type { TableFilters as TableFiltersType, TableStatus, TableShape } from '../../types/table';

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
  const statusOptions: { value: TableStatus | 'all'; label: string; icon: string }[] = [
    { value: 'all', label: 'All Statuses', icon: '📋' },
    { value: 'available', label: 'Available', icon: '✅' },
    { value: 'occupied', label: 'Occupied', icon: '🔴' },
    { value: 'reserved', label: 'Reserved', icon: '🟡' },
    { value: 'cleaning', label: 'Cleaning', icon: '🧽' },
    { value: 'out-of-order', label: 'Out of Order', icon: '⚠️' },
    { value: 'maintenance', label: 'Maintenance', icon: '🔧' }
  ];

  const shapeOptions: { value: TableShape | 'all'; label: string; icon: string }[] = [
    { value: 'all', label: 'All Shapes', icon: '🔄' },
    { value: 'round', label: 'Round', icon: '⭕' },
    { value: 'square', label: 'Square', icon: '⬜' },
    { value: 'rectangular', label: 'Rectangular', icon: '▭' },
    { value: 'rectangle', label: 'Rectangle', icon: '▭' }
  ];

  const handleStatusChange = (value: string) => {
    if (value === 'all') {
      onFiltersChange({ status: undefined });
    } else {
      onFiltersChange({ status: value as TableStatus });
    }
  };

  const handleShapeChange = (value: string) => {
    if (value === 'all') {
      onFiltersChange({ shape: undefined });
    } else {
      onFiltersChange({ shape: value as TableShape });
    }
  };

  const isFiltered = filters.searchTerm || filters.status || filters.shape || 
                    filters.capacity || filters.minCapacity || filters.maxCapacity || 
                    filters.section || filters.floor;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search Input */}
          <div className="flex-1 min-w-0">
            <label htmlFor="search" className="sr-only">Search tables</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                id="search"
                type="text"
                placeholder="Search by table number, section..."
                value={filters.searchTerm || ''}
                onChange={(e) => onFiltersChange({ searchTerm: e.target.value || undefined })}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <label htmlFor="status-filter" className="sr-only">Filter by status</label>
            <select
              id="status-filter"
              value={filters.status || 'all'}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Shape Filter */}
          <div className="sm:w-48">
            <label htmlFor="shape-filter" className="sr-only">Filter by shape</label>
            <select
              id="shape-filter"
              value={filters.shape || 'all'}
              onChange={(e) => handleShapeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              {shapeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Capacity Range */}
          <div className="sm:w-48">
            <label htmlFor="capacity-filter" className="sr-only">Filter by capacity</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                min="1"
                max="20"
                value={filters.minCapacity || ''}
                onChange={(e) => onFiltersChange({ 
                  minCapacity: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <input
                type="number"
                placeholder="Max"
                min="1"
                max="20"
                value={filters.maxCapacity || ''}
                onChange={(e) => onFiltersChange({ 
                  maxCapacity: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Results Info & Reset */}
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-indigo-600 dark:text-indigo-400">{filteredCount}</span> of{' '}
            <span className="font-medium">{totalCount}</span> tables
          </div>
          
          {isFiltered && (
            <button
              onClick={onReset}
              className="inline-flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters Row */}
      <div className="mt-4 flex flex-col sm:flex-row gap-4">
        {/* Section Filter */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Filter by section..."
            value={filters.section || ''}
            onChange={(e) => onFiltersChange({ section: e.target.value || undefined })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          />
        </div>

        {/* Floor Filter */}
        <div className="sm:w-32">
          <input
            type="number"
            placeholder="Floor"
            min="1"
            value={filters.floor || ''}
            onChange={(e) => onFiltersChange({ 
              floor: e.target.value ? parseInt(e.target.value) : undefined 
            })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Active Filters Display */}
      {isFiltered && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Active filters:</span>
          
          {filters.searchTerm && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full dark:bg-blue-900 dark:text-blue-200">
              🔍 "{filters.searchTerm}"
              <button
                onClick={() => onFiltersChange({ searchTerm: undefined })}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5 dark:hover:bg-blue-800"
              >
                ✕
              </button>
            </span>
          )}
          
          {filters.status && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full dark:bg-green-900 dark:text-green-200">
              🏷️ {statusOptions.find(opt => opt.value === filters.status)?.label}
              <button
                onClick={() => onFiltersChange({ status: undefined })}
                className="ml-1 hover:bg-green-200 rounded-full p-0.5 dark:hover:bg-green-800"
              >
                ✕
              </button>
            </span>
          )}
          
          {filters.shape && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full dark:bg-purple-900 dark:text-purple-200">
              🔲 {shapeOptions.find(opt => opt.value === filters.shape)?.label}
              <button
                onClick={() => onFiltersChange({ shape: undefined })}
                className="ml-1 hover:bg-purple-200 rounded-full p-0.5 dark:hover:bg-purple-800"
              >
                ✕
              </button>
            </span>
          )}

          {(filters.minCapacity || filters.maxCapacity) && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full dark:bg-orange-900 dark:text-orange-200">
              👥 {filters.minCapacity || 1}-{filters.maxCapacity || '20+'} seats
              <button
                onClick={() => onFiltersChange({ minCapacity: undefined, maxCapacity: undefined })}
                className="ml-1 hover:bg-orange-200 rounded-full p-0.5 dark:hover:bg-orange-800"
              >
                ✕
              </button>
            </span>
          )}

          {filters.section && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full dark:bg-indigo-900 dark:text-indigo-200">
              📍 {filters.section}
              <button
                onClick={() => onFiltersChange({ section: undefined })}
                className="ml-1 hover:bg-indigo-200 rounded-full p-0.5 dark:hover:bg-indigo-800"
              >
                ✕
              </button>
            </span>
          )}

          {filters.floor && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full dark:bg-gray-700 dark:text-gray-200">
              🏢 Floor {filters.floor}
              <button
                onClick={() => onFiltersChange({ floor: undefined })}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5 dark:hover:bg-gray-600"
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