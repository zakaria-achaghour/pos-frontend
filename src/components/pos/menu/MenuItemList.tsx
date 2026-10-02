import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatMoney } from '@/lib/money';
import type { MenuItemListProps } from '@/types/menu';

const MenuItemList: React.FC<MenuItemListProps> = ({
  items,
  menuItems,
  loading,
  onEdit,
  onDelete,
  onToggleStatus,
  onToggleAvailability,
  onUploadImage,
  hasFilters,
}) => {
  const { t } = useTranslation();

  // Use menuItems or items, whichever is provided
  const itemsToDisplay = menuItems || items || [];

  if (loading) {
    return (
      <div role="status" aria-label={t('common.loading')} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-surface rounded-2xl shadow-sm animate-pulse border border-line">
            <div className="h-48 bg-surface-2 rounded-t-lg"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-surface-2 rounded w-3/4"></div>
              <div className="h-4 bg-surface-2 rounded w-1/2"></div>
              <div className="h-8 bg-surface-2 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (itemsToDisplay.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2 text-fg-muted" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="5" width="16" height="15" rx="3"/><path d="M8 10h8M8 14h5"/></svg></div>
        <h3 className="text-xl font-semibold text-fg dark:text-fg mb-2">
          {hasFilters ? t('menuAdmin.list.emptyFiltered') : t('menuAdmin.list.emptyNone')}
        </h3>
        <p className="text-fg-muted dark:text-fg-muted">
          {hasFilters ? t('menuAdmin.list.emptyFilteredHint') : t('menuAdmin.list.emptyNoneHint')}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {itemsToDisplay.map((item) => (
        <div
          key={item.id}
          className="bg-surface rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden dark:bg-surface border border-line"
        >
          {/* Item Image */}
          <div className="relative h-48 bg-surface-2 dark:bg-surface-2">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-fg-muted dark:text-fg-muted">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
            {/* Upload Image Button */}
            {onUploadImage && (
              <button
                type="button"
                onClick={() => onUploadImage(item.id)}
                className="absolute top-2 end-2 p-2 bg-surface dark:bg-surface rounded-full shadow-lg hover:bg-bg transition-colors"
                title={t('menuAdmin.list.uploadImage')}
                aria-label={t('menuAdmin.list.uploadImage')}
              >
                <svg aria-hidden="true" className="w-4 h-4 text-fg dark:text-fg-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </button>
            )}

            {/* Status Badges */}
            <div className="absolute bottom-2 start-2 flex gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                item.is_active
                  ? 'bg-success/10 text-success'
                  : 'bg-danger/10 text-danger'
              }`}>
                {item.is_active ? t('menuAdmin.list.active') : t('menuAdmin.list.inactive')}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                item.is_available
                  ? 'bg-primary/10 text-primary'
                  : 'bg-surface-2 text-fg dark:bg-surface-2 dark:text-fg-muted'
              }`}>
                {item.is_available ? t('menuAdmin.list.available') : t('menuAdmin.list.outOfStock')}
              </span>
            </div>
          </div>

          {/* Item Details */}
          <div className="p-4">
            {/* Name and Price */}
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-fg dark:text-fg text-lg line-clamp-1">
                  {item.name}
                </h3>
                <p className="text-sm text-fg-muted dark:text-fg-muted">
                  {item.category?.name || t('menuAdmin.list.noCategory')}
                </p>
              </div>
              <div className="text-end ms-2">
                <div className="text-lg font-bold text-primary">
                  {formatMoney(item.price)}
                </div>
                {item.cost && (
                  <div className="text-xs text-fg-muted dark:text-fg-muted">
                    {t('menuAdmin.list.cost', { amount: formatMoney(item.cost) })}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {item.description && (
              <p className="text-sm text-fg-muted dark:text-fg-muted mb-3 line-clamp-2">
                {item.description}
              </p>
            )}

            {/* Item Meta */}
            <div className="flex flex-wrap gap-2 mb-3 text-xs text-fg-muted dark:text-fg-muted">
              {item.preparation_time && (
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t('menuAdmin.list.minutes', { count: item.preparation_time })}
                </div>
              )}
              {item.allergens && item.allergens.length > 0 && (
                <div className="flex items-center gap-1 text-danger">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {t('menuAdmin.list.allergens', { count: item.allergens.length })}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {/* Toggle Buttons Row */}
              <div className="grid grid-cols-2 gap-2">
                {/* Active/Inactive Button */}
                {onToggleStatus && (
                  <button
                    type="button"
                    onClick={() => onToggleStatus(item.id, item.is_active ?? false, item.name)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      item.is_active
                        ? 'bg-primary/10 text-primary hover:bg-primary/20'
                        : 'bg-surface-2 text-fg hover:bg-surface-2 dark:bg-surface-2 dark:text-fg-muted'
                    }`}
                    title={item.is_active ? t('menuAdmin.list.deactivateItem') : t('menuAdmin.list.activateItem')}
                  >
                    {item.is_active ? `🟢 ${t('menuAdmin.list.active')}` : `⚫ ${t('menuAdmin.list.inactive')}`}
                  </button>
                )}

                {/* Available/Unavailable Button */}
                {onToggleAvailability && (
                  <button
                    type="button"
                    onClick={() => onToggleAvailability(item.id, item.is_available ?? false)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      item.is_available
                        ? 'bg-success/10 text-success hover:bg-success/20'
                        : 'bg-danger/10 text-danger hover:bg-danger/20'
                    }`}
                    title={item.is_available ? t('menuAdmin.list.markUnavailable') : t('menuAdmin.list.markAvailable')}
                  >
                    {item.is_available ? `✅ ${t('menuAdmin.list.available')}` : `🚫 ${t('menuAdmin.list.unavailable')}`}
                  </button>
                )}
              </div>

              {/* Edit and Delete Row */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(item)}
                  className="px-3 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
                >
                  {t('menuAdmin.list.edit')}
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(item.id, item.name)}
                  className="px-3 py-2 bg-danger/10 text-danger rounded-lg text-sm font-medium hover:bg-danger/20 transition-colors"
                >
                  {t('menuAdmin.list.delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MenuItemList;
