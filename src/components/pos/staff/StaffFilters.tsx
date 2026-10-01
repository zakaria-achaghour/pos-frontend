import { dynamicT } from '@/i18n/dynamic';
import { useTranslation } from 'react-i18next';
import type { ViewMode, StaffFilter } from '@/hooks/useStaffManagement';

interface StaffFiltersProps {
  viewMode: ViewMode;
  roleFilter: StaffFilter;
  onViewModeChange: (mode: ViewMode) => void;
  onRoleFilterChange: (filter: StaffFilter) => void;
  onAddStaff: () => void;
  availableRoles?: Array<{ name: string; label: string }>;
}

const viewModes = [
  { key: 'grid', labelKey: 'staffAdmin.view.grid', icon: '👥' },
  // { key: 'performance', label: 'Performance', icon: '📊' },
  // { key: 'schedule', label: 'Schedule', icon: '📅' }
] as const;

const defaultRoleValues = ['manager', 'cashier', 'waiter', 'kitchen'] as const;

export default function StaffFilters({
  viewMode,
  roleFilter,
  onViewModeChange,
  onRoleFilterChange,
  onAddStaff,
  availableRoles
}: StaffFiltersProps) {
  const { t } = useTranslation();
  // Use API roles if available, otherwise fall back to default
  const roleFilters = [
    { value: 'all', label: t('staffAdmin.filters.allRoles') },
    ...(availableRoles && availableRoles.length > 0
      ? availableRoles.map((r) => ({ value: r.name, label: dynamicT(`roles.${r.name}`, { defaultValue: r.label }) }))
      : defaultRoleValues.map((r) => ({ value: r, label: dynamicT(`roles.${r}`) }))),
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* View Mode Toggle */}
        <div className="flex gap-2">
          {viewModes.map((mode) => (
            <button
              key={mode.key}
              type="button"
              aria-pressed={viewMode === mode.key}
              onClick={() => onViewModeChange(mode.key)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === mode.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span aria-hidden="true">{mode.icon}</span> {t(mode.labelKey)}
            </button>
          ))}
        </div>

        {/* Role Filter & Add Button */}
        <div className="flex gap-2">
          <select
            value={roleFilter}
            aria-label={t('staffAdmin.filters.roleLabel')}
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
            type="button"
            onClick={onAddStaff}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            <span aria-hidden="true">➕</span> {t('staffAdmin.filters.add')}
          </button>
        </div>
      </div>
    </div>
  );
}
