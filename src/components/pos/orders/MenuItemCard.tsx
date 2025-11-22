import React, { memo } from 'react';
import type { MenuItem } from '@/types/menu';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
  onCustomize: (item: MenuItem) => void;
}

const MenuItemCardComponent: React.FC<MenuItemCardProps> = ({ item, onAddToCart, onCustomize }) => {
  const isAvailable = item.is_available !== false;

  return (
    <div
      onClick={() => isAvailable && onAddToCart(item)}
      className={`relative p-4 rounded-lg border-2 transition-all flex flex-col justify-between gap-3 min-h-[190px] ${isAvailable
        ? 'bg-green-50 border-green-300 hover:border-green-500 cursor-pointer hover:shadow-md'
        : 'bg-red-50 border-red-300 cursor-not-allowed opacity-75'
        }`}
    >
      {/* Status Dot */}
      <div className="absolute top-2 right-2">
        <div
          className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'
            }`}
        />
      </div>

      {/* Content Section */}
      <div>
        <h3 className={`font-semibold text-base md:text-lg mb-2 pr-6 ${isAvailable ? 'text-gray-900' : 'text-gray-400'
          }`}>
          {item.name}
        </h3>

        {item.description && (
          <p className={`text-sm md:text-base mb-2 line-clamp-2 ${isAvailable ? 'text-gray-600' : 'text-gray-400'
            }`}>
            {item.description}
          </p>
        )}
      </div>

      {/* Footer Section - Always at bottom */}
      <div className="flex items-center justify-between mt-auto">
        <span className={`text-lg md:text-xl font-bold ${isAvailable ? 'text-green-600' : 'text-gray-400'
          }`}>
          {Number(item.price).toFixed(2)} MAD
        </span>

        {!isAvailable && (
          <span className="text-xs md:text-sm font-medium text-red-600 bg-red-100 px-2 py-1 rounded">
            Out of Stock
          </span>
        )}

        {isAvailable && (
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCustomize(item);
              }}
              className="text-xs md:text-sm font-medium text-gray-600 bg-gray-100 px-2.5 py-1.5 rounded hover:bg-gray-200 transition-colors"
              title="Customize"
            >
              ⚙️
            </button>
            <button className="text-xs md:text-sm font-medium text-blue-600 bg-blue-100 px-2.5 py-1.5 rounded hover:bg-blue-200 transition-colors">
              + Add
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const MenuItemCard = memo(MenuItemCardComponent);
