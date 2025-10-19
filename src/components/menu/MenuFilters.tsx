import React from 'react';
import type { MenuFilters as MenuFiltersType } from '../../hooks/useMenuManagement';

interface MenuFiltersProps {
  filters: MenuFiltersType;
  onFiltersChange: (filters: Partial<MenuFiltersType>) => void;
  onReset: () => void;
  totalItemsCount: number;
  filteredItemsCount: number;
  totalCategoriesCount: number;
  categories: Array<{ id: number; name: string; is_active?: boolean }>;
  viewMode?: 'items' | 'categories';
  onViewModeChange?: (mode: 'items' | 'categories') => void;
}

const MenuFilters: React.FC<MenuFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  totalItemsCount,
  filteredItemsCount,
  totalCategoriesCount,
  categories,
  viewMode = 'items',
  onViewModeChange
}) => {
  const activeCategories = categories.filter(cat => cat.is_active !== false);

  return (
    <div className="bg-white p-4 rounded-lg shadow border">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search Input */}
          <div className="flex-1 min-w-0">
            <input
              type="text"
              placeholder={viewMode === 'items' ? "Search menu items..." : "Search categories..."}
              value={filters.search}
              onChange={(e) => onFiltersChange({ search: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* View Mode Toggle */}
          {onViewModeChange && (
            <div className="sm:w-48">
              <select
                value={viewMode}
                onChange={(e) => onViewModeChange(e.target.value as 'items' | 'categories')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="items">📄 Menu Items</option>
                <option value="categories">📂 Categories</option>
              </select>
            </div>
          )}

          {/* Category Filter (only for items view) */}
          {viewMode === 'items' && (
            <div className="sm:w-48">
              <select
                value={filters.category_id}
                onChange={(e) => onFiltersChange({ 
                  category_id: e.target.value === 'all' ? 'all' : parseInt(e.target.value)
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="all">All Categories</option>
                {activeCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Status Filter */}
          <div className="sm:w-40">
            <select
              value={filters.status}
              onChange={(e) => onFiltersChange({ status: e.target.value as MenuFiltersType['status'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="all">All Status</option>
              <option value="active">✅ Active</option>
              <option value="inactive">❌ Inactive</option>
            </select>
          </div>

          {/* Price Range Filter (only for items view) */}
          {viewMode === 'items' && (
            <div className="sm:w-40">
              <select
                value={filters.price_range}
                onChange={(e) => onFiltersChange({ price_range: e.target.value as MenuFiltersType['price_range'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="all">All Prices</option>
                <option value="low">💰 Low (&lt; 50 MAD)</option>
                <option value="medium">💰💰 Medium (50-150 MAD)</option>
                <option value="high">💰💰💰 High (&gt; 150 MAD)</option>
              </select>
            </div>
          )}
        </div>

        {/* Results Info & Reset */}
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            {viewMode === 'items' ? (
              <>
                <span className="font-medium">{filteredItemsCount}</span> of <span className="font-medium">{totalItemsCount}</span> items
              </>
            ) : (
              <>
                <span className="font-medium">{totalCategoriesCount}</span> categories
              </>
            )}
          </div>
          
          {(filters.search || filters.status !== 'all' || 
            (viewMode === 'items' && (filters.category_id !== 'all' || filters.price_range !== 'all'))) && (
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
      {(filters.search || filters.status !== 'all' || 
        (viewMode === 'items' && (filters.category_id !== 'all' || filters.price_range !== 'all'))) && (
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
          
          {viewMode === 'items' && filters.category_id !== 'all' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
              Category: {categories.find(c => c.id === filters.category_id)?.name}
              <button
                onClick={() => onFiltersChange({ category_id: 'all' })}
                className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
              >
                ✕
              </button>
            </span>
          )}
          
          {viewMode === 'items' && filters.price_range !== 'all' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
              Price: {filters.price_range}
              <button
                onClick={() => onFiltersChange({ price_range: 'all' })}
                className="ml-1 hover:bg-yellow-200 rounded-full p-0.5"
              >
                ✕
              </button>
            </span>
          )}
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-gray-900">{totalItemsCount}</div>
            <div className="text-xs text-gray-600">Total Items</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">
              {categories.filter(c => c.is_active !== false).length}
            </div>
            <div className="text-xs text-gray-600">Active Categories</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-600">{filteredItemsCount}</div>
            <div className="text-xs text-gray-600">Filtered Results</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-600">
              {Math.round((filteredItemsCount / totalItemsCount) * 100) || 0}%
            </div>
            <div className="text-xs text-gray-600">Match Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuFilters;