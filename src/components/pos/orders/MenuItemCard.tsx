import React, { memo } from 'react';
import type { MenuItem } from '@/types/menu';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
  onCustomize: (item: MenuItem) => void;
}

const MenuItemCardComponent: React.FC<MenuItemCardProps> = ({ item, onAddToCart, onCustomize }) => {
  const isAvailable = item.is_available !== false;
  const [imageError, setImageError] = React.useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div
      onClick={() => isAvailable && onAddToCart(item)}
      className={`relative rounded-lg border-2 transition-all flex flex-col overflow-hidden ${isAvailable
        ? 'bg-white border-green-300 hover:border-green-500 cursor-pointer hover:shadow-md'
        : 'bg-white border-red-300 cursor-not-allowed opacity-75'
        }`}
    >
      {/* Image Section */}
      <div className="relative w-full h-32 sm:h-36 lg:h-40 bg-gray-100 overflow-hidden">
        {item.image_url && !imageError ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <svg 
              className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
        {/* Status Dot on Image */}
        <div className="absolute top-2 right-2">
          <div
            className={`w-3 h-3 rounded-full shadow-md ${isAvailable ? 'bg-green-500' : 'bg-red-500'
              }`}
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className={`font-semibold text-base md:text-lg mb-2 ${isAvailable ? 'text-gray-900' : 'text-gray-400'
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
    </div>
  );
};

export const MenuItemCard = memo(MenuItemCardComponent);
