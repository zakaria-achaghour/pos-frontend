import React from 'react';
import type { MenuItem } from '../../hooks/useMenuManagement';

interface ItemCardProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (itemId: number) => void;
  onToggleStatus: (itemId: number) => void;
  isLoading?: boolean;
}

const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onEdit,
  onDelete,
  onToggleStatus,
  isLoading = false
}) => {
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      onDelete(item.id);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getPriceColor = (price: number) => {
    if (price < 50) return 'text-green-600';
    if (price < 150) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} MAD`;
  };

  const formatTime = (minutes?: number) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="bg-white rounded-lg shadow border hover:shadow-md transition-shadow">
      {/* Item Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍽️</span>
            <div>
              <h3 className="font-semibold text-gray-900">{item.name}</h3>
              <p className="text-sm text-gray-600">{item.category_name}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-lg font-bold ${getPriceColor(item.price)}`}>
              {formatPrice(item.price)}
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.is_active)}`}>
              {item.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Item Body */}
      <div className="p-4">
        {/* Description */}
        {item.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
        )}

        {/* Item Details */}
        <div className="mb-4 space-y-2">
          {/* Preparation Time */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">⏱️ Prep Time:</span>
            <span className="font-medium text-gray-900">{formatTime(item.preparation_time)}</span>
          </div>

          {/* Ingredients */}
          {item.ingredients && item.ingredients.length > 0 && (
            <div className="text-sm">
              <span className="text-gray-600">🥘 Ingredients:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {item.ingredients.slice(0, 3).map((ingredient, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {ingredient}
                  </span>
                ))}
                {item.ingredients.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{item.ingredients.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Allergens */}
          {item.allergens && item.allergens.length > 0 && (
            <div className="text-sm">
              <span className="text-gray-600">⚠️ Allergens:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {item.allergens.map((allergen, index) => (
                  <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                    {allergen}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          {/* Status Toggle */}
          <button
            onClick={() => onToggleStatus(item.id)}
            className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              item.is_active
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
            disabled={isLoading}
          >
            {item.is_active ? '❌ Deactivate' : '✅ Activate'}
          </button>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(item)}
              className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              ✏️ Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded text-sm hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              🗑️ Delete
            </button>
          </div>
        </div>

        {/* Price Analysis */}
        <div className="mt-3 p-2 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-600 text-center">
            Price Category: {' '}
            <span className={`font-medium ${getPriceColor(item.price)}`}>
              {item.price < 50 ? '💰 Budget' : item.price < 150 ? '💰💰 Standard' : '💰💰💰 Premium'}
            </span>
          </div>
        </div>

        {/* Status Warnings */}
        {!item.is_active && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-xs text-red-800">
              🚫 This item is inactive and won't appear in the POS
            </div>
          </div>
        )}

        {/* Allergen Warning */}
        {item.allergens && item.allergens.length > 0 && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-xs text-yellow-800">
              ⚠️ Contains allergens - staff should inform customers
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemCard;