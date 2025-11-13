import React, { useState } from 'react';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Alert from '@/components/ui/alert/Alert';
import Modal from '@/components/common/Modal';
import { useCategoryManagement } from '@/hooks/useCategoryManagement';
import PaginationWithText from '@/components/ui/pagination/PaginationWithText';
import CategoryList from '@/components/pos/menu/CategoryList';
import CategoryModal from '@/components/pos/menu/CategoryModal';
import type { Category } from '@/types/menu';

export default function CategoriesManagement() {
  const {
    // Data
    categories,
    filteredCategories,
    editingCategory,

    // UI State
    statusFilter,
    searchTerm,
    loading,
    error,
    successMessage,
    pagination,
    categoryStats,

    // Actions
    createCategory,
    updateCategory,
    deleteCategory,
    updateCategoryStatus,
    goToPage,

    // UI Actions
    setStatusFilter,
    setSearchTerm,
    setEditingCategory,
    clearError,
  } = useCategoryManagement(10); // 10 categories per page

  // Local modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [categoryToToggle, setCategoryToToggle] = useState<Category | null>(null);

  // Handle form submissions
  const handleAddCategory = async (data: any) => {
    try {
      await createCategory(data);
      setShowAddModal(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleEditCategory = async (data: any) => {
    if (!editingCategory) return;
    try {
      await updateCategory(editingCategory.id, data);
      setEditingCategory(null);
    } catch (error) {
      // Error handled in hook
    }
  };

    // Handler for delete request (opens confirmation modal)
  const handleDeleteRequest = (id: number) => {
    const category = categories.find(c => c.id === id);
    if (category) {
      setCategoryToDelete(category);
    }
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteCategory(categoryToDelete.id);
      setCategoryToDelete(null);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleToggleStatusRequest = (id: number) => {
    const category = categories.find((c) => c.id === id);
    if (category) {
      setCategoryToToggle(category);
    }
  };

  const handleConfirmToggleStatus = async () => {
    if (!categoryToToggle) return;
    try {
      const newStatus = !categoryToToggle.is_active;
      await updateCategoryStatus(categoryToToggle.id, newStatus);
      setCategoryToToggle(null);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
  };

  // Close all modals
  const closeModals = () => {
    setShowAddModal(false);
    setEditingCategory(null);
    setCategoryToDelete(null);
    setCategoryToToggle(null);
    clearError();
  };

  return (
    <div>
      <PageMeta title="Categories | POS System" description="Manage menu categories" />
      <PageBreadcrumb pageTitle="Categories" />

      {/* Success Alert */}
      {successMessage && (
        <div className="mb-6">
          <Alert
            variant="success"
            title="Success!"
            message={successMessage}
          />
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mb-6">
          <Alert
            variant="error"
            title="Error"
            message={error}
          />
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Categories</h1>
          <p className="text-sm text-gray-600 mt-1">
            Organize your menu items into categories • {categoryStats.total} total
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Add Category
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All ({categoryStats.total})</option>
              <option value="active">Active ({categoryStats.active})</option>
              <option value="inactive">Inactive ({categoryStats.inactive})</option>
            </select>
          </div>

          {/* Stats */}
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              Showing {filteredCategories.length} of {categoryStats.total} categories
            </div>
          </div>
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow">
        <CategoryList
          categories={filteredCategories}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
          onToggleStatus={handleToggleStatusRequest}
          hasFilters={searchTerm !== '' || statusFilter !== 'all'}
        />
      </div>

      {/* Pagination */}
      {!loading && pagination.total > 0 && (
        <div className="bg-white rounded-lg shadow dark:bg-gray-900">
          <PaginationWithText
            totalPages={pagination.lastPage}
            initialPage={pagination.currentPage}
            onPageChange={goToPage}
          />
        </div>
      )}

      {/* Add/Edit Modal */}
      <CategoryModal
        isOpen={showAddModal || !!editingCategory}
        onClose={closeModals}
        onSubmit={editingCategory ? handleEditCategory : handleAddCategory}
        editingCategory={editingCategory}
        loading={loading}
      />

      {/* Delete Confirmation Modal */}
      {categoryToDelete && (
        <Modal
          isOpen={true}
          onClose={() => setCategoryToDelete(null)}
          title="Delete Category"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete <strong>{categoryToDelete.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setCategoryToDelete(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Toggle Status Confirmation Modal */}
      {categoryToToggle && (
        <Modal
          isOpen={true}
          onClose={() => setCategoryToToggle(null)}
          title={`${categoryToToggle.is_active ? 'Deactivate' : 'Activate'} Category`}
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to {categoryToToggle.is_active ? 'deactivate' : 'activate'}{' '}
              <strong>{categoryToToggle.name}</strong>?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setCategoryToToggle(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmToggleStatus}
                disabled={loading}
                className={`px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50 ${
                  categoryToToggle.is_active
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {loading ? 'Processing...' : categoryToToggle.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
