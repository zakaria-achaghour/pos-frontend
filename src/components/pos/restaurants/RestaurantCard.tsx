import { dynamicT } from '@/i18n/dynamic';
import { useTranslation } from 'react-i18next';
import type { Restaurant } from '@/types/restaurant';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onEdit?: (id: number) => void;
  onView?: (id: number) => void;
  onStatusChange?: (id: number) => void;
  onDelete?: (id: number) => void;
  isSelected?: boolean;
  onSelect?: () => void;
}

export default function RestaurantCard({
  restaurant,
  onEdit,
  onView,
  onStatusChange,
  onDelete,
  isSelected = false,
  onSelect,
}: RestaurantCardProps) {
  const { t } = useTranslation();
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success';
      case 'inactive':
        return 'bg-danger/10 text-danger';
      case 'pending':
        return 'bg-warning/10 text-warning';
      case 'suspended':
        return 'bg-surface-2 text-fg';
      default:
        return 'bg-surface-2 text-fg';
    }
  };

  const status = restaurant.status || (restaurant.is_active ? 'active' : 'inactive');

  return (
    <div
      className={`bg-surface rounded-lg shadow hover:shadow-lg transition-shadow border-2 ${
        isSelected ? 'border-primary' : 'border-transparent'
      }`}
    >
      <div className="p-6">
        {/* Header with checkbox and status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            {onSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={onSelect}
                aria-label={t('tenants.card.select', { name: restaurant.name })}
                className="mt-1 h-4 w-4 text-primary rounded"
              />
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-fg mb-1">
                {restaurant.name}
              </h3>
              {restaurant.description && (
                <p className="text-sm text-fg-muted line-clamp-2">
                  {restaurant.description}
                </p>
              )}
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
            {dynamicT(`tenants.status.${status}`, { defaultValue: status })}
          </span>
        </div>

        {/* Restaurant details */}
        <div className="space-y-2 mb-4">
          {restaurant.city && (
            <div className="flex items-center text-sm text-fg-muted">
              <span className="me-2" aria-hidden="true">📍</span>
              <span>{restaurant.city}</span>
            </div>
          )}
          {restaurant.phone && (
            <div className="flex items-center text-sm text-fg-muted">
              <span className="me-2" aria-hidden="true">📞</span>
              <span>{restaurant.phone}</span>
            </div>
          )}
          {restaurant.email && (
            <div className="flex items-center text-sm text-fg-muted">
              <span className="me-2" aria-hidden="true">📧</span>
              <span>{restaurant.email}</span>
            </div>
          )}
          {restaurant.owner_name && (
            <div className="flex items-center text-sm text-fg-muted">
              <span className="me-2" aria-hidden="true">👤</span>
              <span>{t('tenants.card.owner', { name: restaurant.owner_name })}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4 py-3 border-t border-b border-line">
          <div className="text-center">
            <div className="text-sm text-fg-muted">{t('tenants.card.tables')}</div>
            <div className="text-lg font-semibold text-fg">
              {restaurant.tableCount || 0}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-fg-muted">{t('tenants.card.staff')}</div>
            <div className="text-lg font-semibold text-fg">
              {restaurant.staffCount || 0}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-fg-muted">{t('tenants.card.rating')}</div>
            <div className="text-lg font-semibold text-fg">
              <span aria-hidden="true">⭐</span> {restaurant.averageRating?.toFixed(1) || t('tenants.notAvailable')}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-2">
          {onView && (
            <button
              onClick={() => onView(restaurant.id)}
              className="flex-1 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/15 transition-colors text-sm font-medium"
            >
              {t('tenants.actions.view')}
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(restaurant.id)}
              className="flex-1 px-3 py-2 bg-success/10 text-success rounded-lg hover:bg-success/15 transition-colors text-sm font-medium"
            >
              {t('tenants.actions.edit')}
            </button>
          )}
          {onStatusChange && (
            <button
              onClick={() => onStatusChange(restaurant.id)}
              className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                status === 'active'
                  ? 'bg-warning/10 text-warning hover:bg-warning/15'
                  : 'bg-success/10 text-success hover:bg-success/15'
              }`}
            >
              {status === 'active' ? t('tenants.actions.deactivate') : t('tenants.actions.activate')}
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(restaurant.id)}
              className="px-3 py-2 bg-danger/10 text-danger rounded-lg hover:bg-danger/15 transition-colors text-sm font-medium"
            >
              {t('tenants.actions.delete')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
