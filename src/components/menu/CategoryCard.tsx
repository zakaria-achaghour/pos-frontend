import React from 'react';
import type { Category } from '../../hooks/useMenuManagement';

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: number) => void;
  onToggleStatus: (categoryId: number) => void;
  isLoading?: boolean;
  itemCount?: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onEdit,
  onDelete,
  onToggleStatus,
  isLoading = false,
  itemCount = 0
}) => {
  const handleDelete = () => {
    if (itemCount > 0) {
      alert(`Cannot delete category with ${itemCount} menu items. Remove all items first.`);
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      onDelete(category.id);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <div className="bg-white rounded-lg shadow border hover:shadow-md transition-shadow">
      {/* Category Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📂</span>
            <h3 className="font-semibold text-gray-900">{category.name}</h3>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(category.is_active !== false)}`}>
            {category.is_active !== false ? 'Active' : 'Inactive'}
          </span>
        </div>
        
        {/* Item Count */}
        <div className="text-sm text-gray-600 mt-1">
          📄 {itemCount} menu item{itemCount !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Category Body */}
      <div className="p-4">
        {/* Description */}
        {category.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{category.description}</p>
        )}

        {/* Category Stats */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Menu Items:</span>
            <span className="font-medium text-gray-900">{itemCount}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-600">Status:</span>
            <span className={`font-medium ${category.is_active !== false ? 'text-green-600' : 'text-red-600'}`}>
              {category.is_active !== false ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          {/* Status Toggle */}
          <button
            onClick={() => onToggleStatus(category.id)}
            className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              category.is_active !== false
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
            disabled={isLoading}
          >
            {category.is_active !== false ? '❌ Deactivate' : '✅ Activate'}
          </button>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(category)}
              className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              ✏️ Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded text-sm hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || itemCount > 0}
              title={itemCount > 0 ? `Cannot delete category with ${itemCount} menu items` : 'Delete category'}
            >
              🗑️ Delete
            </button>
          </div>
        </div>

        {/* Warning for categories with items */}
        {itemCount > 0 && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-xs text-yellow-800">
              ⚠️ Remove all menu items before deleting this category
            </div>
          </div>
        )}

        {/* Inactive Warning */}
        {category.is_active === false && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-xs text-red-800">
              🚫 This category is inactive and won't appear in the POS
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryCard;