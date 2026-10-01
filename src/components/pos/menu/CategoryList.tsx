import React from 'react';
import { useTranslation } from 'react-i18next';
import type { CategoryListProps } from '@/types/menu';

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  loading,
  onEdit,
  onDelete,
  onToggleStatus,
  hasFilters = false,
}) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div
        role="status"
        aria-label={t('common.loading')}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-48 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-5xl mb-4" aria-hidden="true">
          {hasFilters ? '🔍' : '📁'}
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {hasFilters ? t('categoriesAdmin.list.emptyFiltered') : t('categoriesAdmin.list.emptyNone')}
        </h3>
        <p className="text-gray-600">
          {hasFilters ? t('categoriesAdmin.list.emptyFilteredHint') : t('categoriesAdmin.list.emptyNoneHint')}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {categories.map((category) => (
        <div
          key={category.id}
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl" aria-hidden="true">📂</span>
                <h3 className="font-semibold text-gray-900 truncate">{category.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    category.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {category.is_active ? t('categoriesAdmin.list.active') : t('categoriesAdmin.list.inactive')}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {category.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {category.description}
            </p>
          )}

          {/* Menu Items Count (placeholder) */}
          <div className="mb-4 text-sm text-gray-500">
            {t('categoriesAdmin.list.itemsCount', { count: 0 })}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            {/* Toggle Status */}
            {onToggleStatus && (
              <button
                type="button"
                onClick={() => onToggleStatus(category.id)}
                className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                  category.is_active
                    ? 'bg-red-50 text-red-700 hover:bg-red-100'
                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                }`}
              >
                {category.is_active ? `✗ ${t('categoriesAdmin.list.deactivate')}` : `✓ ${t('categoriesAdmin.list.activate')}`}
              </button>
            )}

            {/* Edit & Delete */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onEdit(category)}
                className="flex-1 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
              >
                {t('categoriesAdmin.list.edit')}
              </button>
              <button
                type="button"
                onClick={() => onDelete(category.id)}
                className="flex-1 px-4 py-2 bg-gray-50 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
              >
                {t('categoriesAdmin.list.delete')}
              </button>
            </div>
          </div>

          {/* Warning for inactive */}
          {!category.is_active && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-xs text-red-800">
                {t('categoriesAdmin.list.inactiveWarning')}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CategoryList;
