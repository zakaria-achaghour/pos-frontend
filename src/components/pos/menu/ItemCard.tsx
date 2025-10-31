import React from 'react';
import type { ItemCardProps } from '@/types/menu';

const ItemCard: React.FC<ItemCardProps> = ({ item, onEdit, onDelete }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'unavailable':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'out-of-stock':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      {item.image && (
        <div className="h-48 overflow-hidden bg-gray-100">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
              item.status
            )}`}
          >
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </span>
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Price and Details */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-bold text-indigo-600">
            ${item.price.toFixed(2)}
          </span>
          {item.preparationTime && (
            <span className="text-sm text-gray-500">
              ⏱️ {item.preparationTime} min
            </span>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {item.isVegetarian && (
            <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
              🌱 Vegetarian
            </span>
          )}
          {item.isVegan && (
            <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
              🥗 Vegan
            </span>
          )}
          {item.isGlutenFree && (
            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
              🌾 Gluten-Free
            </span>
          )}
          {item.isSpicy && (
            <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded">
              🌶️ Spicy
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={() => onEdit(item)}
            className="flex-1 px-3 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="flex-1 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
