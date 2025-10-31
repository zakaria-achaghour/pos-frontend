import React from 'react';
import type { Category } from '../../api/menu';

export interface MenuItemFilterOptions {
  searchTerm: string;
  categoryFilter: number | 'all';
  statusFilter: 'all' | 'active' | 'inactive';
  availabilityFilter: 'all' | 'available' | 'unavailable';
}

interface MenuItemFiltersProps {
  filters: MenuItemFilterOptions;
  onFiltersChange: (filters: MenuItemFilterOptions) => void;
  onReset: () => void;
  onAddItem: () => void;
  categories: Category[];
  totalCount: number;
  filteredCount: number;
  loading?: boolean;
}

const MenuItemFilters: React.FC<MenuItemFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  onAddItem,
  categories,
  totalCount,
  filteredCount,
  loading = false,
}) => {
  const hasFilters = 
    filters.searchTerm !== '' || 
    filters.categoryFilter !== 'all' || 
    filters.statusFilter !== 'all' || 
    filters.availabilityFilter !== 'all';

  const activeCategories = categories.filter(cat => cat.is_active);

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      {/* Top Row: Search and Add Button */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search menu items..."
            value={filters.searchTerm}
            onChange={(e) => onFiltersChange({ ...filters, searchTerm: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            disabled={loading}
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {loading && filters.searchTerm && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Add New Item Button */}
        <button
          onClick={onAddItem}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 transition-colors whitespace-nowrap"
          disabled={loading}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Item
        </button>
      </div>

      {/* Bottom Row: Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Category Filter */}
        <div>
          <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <select
            id="category-filter"
            value={filters.categoryFilter}
            onChange={(e) => onFiltersChange({ ...filters, categoryFilter: e.target.value === 'all' ? 'all' : Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            disabled={loading}
          >
            <option value="all">All Categories</option>
            {activeCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            id="status-filter"
            value={filters.statusFilter}
            onChange={(e) => onFiltersChange({ ...filters, statusFilter: e.target.value as 'all' | 'active' | 'inactive' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            disabled={loading}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Availability Filter */}
        <div>
          <label htmlFor="availability-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Availability
          </label>
          <select
            id="availability-filter"
            value={filters.availabilityFilter}
            onChange={(e) => onFiltersChange({ ...filters, availabilityFilter: e.target.value as 'all' | 'available' | 'unavailable' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            disabled={loading}
          >
            <option value="all">All Items</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>

        {/* Reset Button */}
        <div className="flex items-end">
          <button
            onClick={onReset}
            disabled={!hasFilters || loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <div className="text-gray-600 dark:text-gray-400">
          Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredCount}</span> of{' '}
          <span className="font-semibold text-gray-900 dark:text-white">{totalCount}</span> items
        </div>
        {hasFilters && (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium dark:bg-indigo-900 dark:text-indigo-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters active
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuItemFilters;
