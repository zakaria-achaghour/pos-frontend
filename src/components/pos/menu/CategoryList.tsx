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
        className="pos-card-grid"
      >
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-surface-2 h-48 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-fg-muted text-5xl mb-4" aria-hidden="true">
          {hasFilters ? '🔍' : '📁'}
        </div>
        <h3 className="text-lg font-medium text-fg mb-2">
          {hasFilters ? t('categoriesAdmin.list.emptyFiltered') : t('categoriesAdmin.list.emptyNone')}
        </h3>
        <p className="text-fg-muted">
          {hasFilters ? t('categoriesAdmin.list.emptyFilteredHint') : t('categoriesAdmin.list.emptyNoneHint')}
        </p>
      </div>
    );
  }

  return (
    <div className="pos-card-grid">
      {categories.map((category) => (
        <div
          key={category.id}
          className="bg-surface border border-line rounded-2xl p-5 hover:border-brand-300 transition-colors"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/></svg></span>
                <h3 className="font-semibold text-fg truncate">{category.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    category.is_active
                      ? 'bg-success/10 text-success'
                      : 'bg-surface-2 text-fg'
                  }`}
                >
                  {category.is_active ? t('categoriesAdmin.list.active') : t('categoriesAdmin.list.inactive')}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {category.description && (
            <p className="text-sm text-fg-muted mb-4 line-clamp-2">
              {category.description}
            </p>
          )}

          {/* Menu Items Count (placeholder) */}
          <div className="mb-4 text-sm text-fg-muted">
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
                    ? 'bg-danger/10 text-danger hover:bg-danger/15'
                    : 'bg-success/10 text-success hover:bg-success/15'
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
                className="flex-1 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/15 transition-colors font-medium"
              >
                {t('categoriesAdmin.list.edit')}
              </button>
              <button
                type="button"
                onClick={() => onDelete(category.id)}
                className="flex-1 px-4 py-2 bg-bg text-danger rounded-lg hover:bg-danger/15 transition-colors font-medium"
              >
                {t('categoriesAdmin.list.delete')}
              </button>
            </div>
          </div>

          {/* Warning for inactive */}
          {!category.is_active && (
            <div className="mt-3 p-2 bg-danger/10 border border-danger/30 rounded-lg">
              <div className="text-xs text-danger">
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
