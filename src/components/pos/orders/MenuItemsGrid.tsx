import EmptyState from '@/components/common/EmptyState';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/kit';
import { MenuItemCard } from './MenuItemCard';
import type { MenuItem } from '@/types/menu';

interface MenuItemsGridProps {
  items: MenuItem[];
  loading: boolean;
  onAddToCart: (item: MenuItem) => void;
  onCustomize: (item: MenuItem) => void;
}

// Columns are sized by the space actually available (the cart takes a share of the screen),
// not by viewport breakpoints.
const GRID = 'grid grid-cols-[repeat(auto-fill,minmax(min(100%,10rem),1fr))] gap-3';

const MenuItemsGridComponent = ({ items, loading, onAddToCart, onCustomize }: MenuItemsGridProps) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className={GRID} role="status" aria-label={t('menu.loading')}>
        {Array.from({ length: 12 }, (_, i) => (
          <Skeleton key={i} className="h-44" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState title={t('menu.emptyTitle')} description={t('menu.emptyHint')}/>
    );
  }

  return (
    <div className={GRID}>
      {items.map((item) => (
        <MenuItemCard key={item.id} item={item} onAddToCart={onAddToCart} onCustomize={onCustomize} />
      ))}
    </div>
  );
};

export const MenuItemsGrid = memo(MenuItemsGridComponent);
