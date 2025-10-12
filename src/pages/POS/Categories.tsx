import React, { useState } from 'react';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { useMenuManagement } from '../../hooks/useMenuManagement';
import type { Category, CategoryFormData } from '../../hooks/useMenuManagement';
import MenuFilters from '../../components/menu/MenuFilters';
import CategoryCard from '../../components/menu/CategoryCard';
import CategoryForm from '../../components/menu/CategoryForm';

export default function Categories() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const {
    categories,
    filteredCategories,
    loading,
    message,
    filters,
    menuStats,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    updateFilters,
    resetFilters,
  } = useMenuManagement();

  // Handle create category
  const handleCreateCategory = async (formData: CategoryFormData): Promise<boolean> => {
    const success = await createCategory(formData);
    if (success) {
      setShowCreateModal(false);
    }
    return success;
  };

  // Handle update category
  const handleUpdateCategory = async (formData: CategoryFormData): Promise<boolean> => {
    if (!editingCategory) return false;
    
    const success = await updateCategory(editingCategory.id, formData);
    if (success) {
      setEditingCategory(null);
    }
    return success;
  };

  // Handle edit category
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
  };

  // Handle close modals
  const handleCloseModals = () => {
    setShowCreateModal(false);
    setEditingCategory(null);
  };

  return (
    <div>
      <PageMeta title="Categories | POS System" description="Manage menu categories" />
      <PageBreadcrumb pageTitle="Categories" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Menu Categories</h2>
              <p className="text-sm text-gray-600 mt-1">
                Organize your menu items into categories
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add New Category
            </button>
          </div>
        </div>

        {/* Filters */}
        <MenuFilters
          filters={filters}
          onFiltersChange={updateFilters}
          onResetFilters={resetFilters}
          categories={categories}
          mode="categories"
          stats={menuStats}
        />

        {/* Message Display */}
        {message && (
          <div className={`p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Categories Grid */}
        <div className="bg-white rounded-xl shadow p-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-32 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-5xl mb-4">📁</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
              <p className="text-gray-600 mb-4">
                {filters.search || filters.status !== 'all'
                  ? 'Try adjusting your filters to see more categories.'
                  : 'Get started by creating your first category.'}
              </p>
              {!filters.search && filters.status === 'all' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Your First Category
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onEdit={handleEditCategory}
                  onDelete={deleteCategory}
                  onToggleStatus={toggleCategoryStatus}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <CategoryForm
              onSubmit={handleCreateCategory}
              onCancel={handleCloseModals}
              isSubmitting={loading}
              title="Add New Category"
            />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <CategoryForm
              onSubmit={handleUpdateCategory}
              onCancel={handleCloseModals}
              isSubmitting={loading}
              initialData={{
                name: editingCategory.name,
                description: editingCategory.description || '',
                color: editingCategory.color || '#3B82F6',
                isActive: editingCategory.isActive
              }}
              title="Edit Category"
            />
          </div>
        </div>
      )}
    </div>
  );
}