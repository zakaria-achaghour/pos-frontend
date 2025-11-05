import React from 'react';
import type { Restaurant } from '@/types/restaurant';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onEdit?: (id: number) => void;
  onView?: (id: number) => void;
  onStatusChange?: (id: number) => void;
  onDelete?: (id: number) => void;
  isSelected?: boolean;
  onSelect?: () => void;
}

export default function RestaurantCard({
  restaurant,
  onEdit,
  onView,
  onStatusChange,
  onDelete,
  isSelected = false,
  onSelect,
}: RestaurantCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const status = restaurant.status || (restaurant.is_active ? 'active' : 'inactive');

  return (
    <div
      className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow border-2 ${
        isSelected ? 'border-blue-500' : 'border-transparent'
      }`}
    >
      <div className="p-6">
        {/* Header with checkbox and status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3 flex-1">
            {onSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={onSelect}
                className="mt-1 h-4 w-4 text-blue-600 rounded"
              />
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {restaurant.name}
              </h3>
              {restaurant.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {restaurant.description}
                </p>
              )}
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>

        {/* Restaurant details */}
        <div className="space-y-2 mb-4">
          {restaurant.city && (
            <div className="flex items-center text-sm text-gray-600">
              <span className="mr-2">📍</span>
              <span>{restaurant.city}</span>
            </div>
          )}
          {restaurant.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <span className="mr-2">📞</span>
              <span>{restaurant.phone}</span>
            </div>
          )}
          {restaurant.email && (
            <div className="flex items-center text-sm text-gray-600">
              <span className="mr-2">📧</span>
              <span>{restaurant.email}</span>
            </div>
          )}
          {restaurant.owner_name && (
            <div className="flex items-center text-sm text-gray-600">
              <span className="mr-2">👤</span>
              <span>Owner: {restaurant.owner_name}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4 py-3 border-t border-b border-gray-100">
          <div className="text-center">
            <div className="text-sm text-gray-500">Tables</div>
            <div className="text-lg font-semibold text-gray-900">
              {restaurant.tableCount || 0}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">Staff</div>
            <div className="text-lg font-semibold text-gray-900">
              {restaurant.staffCount || 0}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">Rating</div>
            <div className="text-lg font-semibold text-gray-900">
              ⭐ {restaurant.averageRating?.toFixed(1) || 'N/A'}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between space-x-2">
          {onView && (
            <button
              onClick={() => onView(restaurant.id)}
              className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
            >
              View
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(restaurant.id)}
              className="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
            >
              Edit
            </button>
          )}
          {onStatusChange && (
            <button
              onClick={() => onStatusChange(restaurant.id)}
              className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                status === 'active'
                  ? 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                  : 'bg-green-50 text-green-600 hover:bg-green-100'
              }`}
            >
              {status === 'active' ? 'Deactivate' : 'Activate'}
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(restaurant.id)}
              className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
