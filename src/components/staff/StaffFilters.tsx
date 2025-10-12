import React from 'react';
import type { ViewMode, StaffFilter } from '../../hooks/useStaffManagement';

interface StaffFiltersProps {
  viewMode: ViewMode;
  roleFilter: StaffFilter;
  onViewModeChange: (mode: ViewMode) => void;
  onRoleFilterChange: (filter: StaffFilter) => void;
  onAddStaff: () => void;
}

const viewModes = [
  { key: 'grid', label: 'Staff Grid', icon: '👥' },
  { key: 'performance', label: 'Performance', icon: '📊' },
  { key: 'schedule', label: 'Schedule', icon: '📅' }
] as const;

const roleFilters = [
  { value: 'all', label: 'All Roles' },
  { value: 'manager', label: 'Managers' },
  { value: 'cashier', label: 'Cashiers' },
  { value: 'waiter', label: 'Waiters' },
  { value: 'kitchen', label: 'Kitchen' }
] as const;

export default function StaffFilters({
  viewMode,
  roleFilter,
  onViewModeChange,
  onRoleFilterChange,
  onAddStaff
}: StaffFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* View Mode Toggle */}
        <div className="flex gap-2">
          {viewModes.map((mode) => (
            <button
              key={mode.key}
              onClick={() => onViewModeChange(mode.key)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === mode.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {mode.icon} {mode.label}
            </button>
          ))}
        </div>

        {/* Role Filter & Add Button */}
        <div className="flex gap-2">
          <select
            value={roleFilter}
            onChange={(e) => onRoleFilterChange(e.target.value as StaffFilter)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {roleFilters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
          
          <button
            onClick={onAddStaff}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            ➕ Add Staff
          </button>
        </div>
      </div>
    </div>
  );
}