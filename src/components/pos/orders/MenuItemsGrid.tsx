import React, { memo } from 'react';
import { MenuItemCard } from './MenuItemCard';
import type { MenuItem } from '@/types/menu';

interface MenuItemsGridProps {
  items: MenuItem[];
  loading: boolean;
  onAddToCart: (item: MenuItem) => void;
  onCustomize: (item: MenuItem) => void;
}

const MenuItemsGridComponent: React.FC<MenuItemsGridProps> = ({ items, loading, onAddToCart, onCustomize }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-500">Loading menu items...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p className="text-lg font-medium">No items found</p>
        <p className="text-sm">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-5">
      {items.map(item => (
        <MenuItemCard
          key={item.id}
          item={item}
          onAddToCart={onAddToCart}
          onCustomize={onCustomize}
        />
      ))}
    </div>
  );
};

export const MenuItemsGrid = memo(MenuItemsGridComponent);
