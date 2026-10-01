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
          <div key={i} className="bg-white rounded-lg shadow animate-pulse">
            <div className="h-48 bg-gray-200 rounded-t-lg"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (itemsToDisplay.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4" aria-hidden="true">🍽️</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {hasFilters ? t('menuAdmin.list.emptyFiltered') : t('menuAdmin.list.emptyNone')}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
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
          className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden dark:bg-gray-800"
        >
          {/* Item Image */}
          <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
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
                className="absolute top-2 end-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                title={t('menuAdmin.list.uploadImage')}
                aria-label={t('menuAdmin.list.uploadImage')}
              >
                <svg aria-hidden="true" className="w-4 h-4 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </button>
            )}
            
            {/* Status Badges */}
            <div className="absolute bottom-2 start-2 flex gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                item.is_active 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
              }`}>
                {item.is_active ? t('menuAdmin.list.active') : t('menuAdmin.list.inactive')}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                item.is_available 
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' 
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
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
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg line-clamp-1">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {item.category?.name || t('menuAdmin.list.noCategory')}
                </p>
              </div>
              <div className="text-end ms-2">
                <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  {formatMoney(item.price)}
                </div>
                {item.cost && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {t('menuAdmin.list.cost', { amount: formatMoney(item.cost) })}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {item.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {item.description}
              </p>
            )}

            {/* Item Meta */}
            <div className="flex flex-wrap gap-2 mb-3 text-xs text-gray-600 dark:text-gray-400">
              {item.preparation_time && (
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t('menuAdmin.list.minutes', { count: item.preparation_time })}
                </div>
              )}
              {item.allergens && item.allergens.length > 0 && (
                <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
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
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
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
                        ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800'
                        : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800'
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
                  className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200 transition-colors dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800"
                >
                  {t('menuAdmin.list.edit')}
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(item.id, item.name)}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
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
