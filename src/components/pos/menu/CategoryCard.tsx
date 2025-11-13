import React from 'react';
import type { CategoryCardProps } from '@/types/menu';

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onEdit,
  onDelete,
  onToggleStatus,
  isLoading = false,
  itemCount = 0,
}) => {
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      onDelete(category.id);
    }
  };

  const handleToggleStatus = () => {
    if (onToggleStatus) {
      onToggleStatus(category.id);
    }
  };

  const isActive = category.status === 'active' || category.is_active;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      {category.image && (
        <div className="h-40 overflow-hidden bg-gray-100">
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-lg">{category.name}</h3>
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full border ${
              isActive
                ? 'bg-green-100 text-green-800 border-green-200'
                : 'bg-gray-100 text-gray-800 border-gray-200'
            }`}
          >
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Description */}
        {category.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {category.description}
          </p>
        )}

        {/* Item Count */}
        <div className="mb-3">
          <span className="text-sm text-gray-500">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          {onToggleStatus && (
            <button
              onClick={handleToggleStatus}
              disabled={isLoading}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded transition-colors ${
                isActive
                  ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50'
                  : 'text-green-600 hover:text-green-700 hover:bg-green-50'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isActive ? 'Deactivate' : 'Activate'}
            </button>
          )}
          <button
            onClick={() => onEdit(category)}
            disabled={isLoading}
            className={`flex-1 px-3 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded transition-colors ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className={`flex-1 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;
