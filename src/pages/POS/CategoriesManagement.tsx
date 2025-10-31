import React, { useState } from 'react';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import CategoryFilters from '../../components/menu/CategoryFilters';
import type { CategoryFilterOptions } from '../../components/menu/CategoryFilters';
import CategoryList from '../../components/menu/CategoryList';
import CategoryModal from '../../components/menu/CategoryModal';
import Pagination from '../../components/common/Pagination';
import Toast from '../../components/common/Toast';
import { useCategoryManagement } from '../../hooks/useCategoryManagement';
import type { Category, CreateCategoryData } from '../../api/menu';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export default function CategoriesManagement() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'info'
  });

  const {
    filteredCategories,
    loading,
    error,
    pagination,
    filters,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    setFilters,
    resetFilters,
    setPage,
    setLimit,
  } = useCategoryManagement();

  // Show toast notification
  const showToast = (message: string, type: ToastState['type']) => {
    setToast({ show: true, message, type });
  };

  // Close toast
  const closeToast = () => {
    setToast({ ...toast, show: false });
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: CategoryFilterOptions) => {
    setFilters(newFilters);
  };

  // Handle create category
  const handleCreateCategory = async (data: CreateCategoryData) => {
    try {
      await createCategory(data);
      setShowCreateModal(false);
      showToast(`Category "${data.name}" created successfully! 🎉`, 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to create category', 'error');
    }
  };

  // Handle update category
  const handleUpdateCategory = async (data: CreateCategoryData) => {
    if (!editingCategory) return;

    try {
      await updateCategory(editingCategory.id, data);
      setEditingCategory(null);
      showToast(`Category "${data.name}" updated successfully! ✓`, 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to update category', 'error');
    }
  };

  // Handle edit category
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
  };

  // Handle close modals
  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingCategory(null);
  };

  // Handle delete
  const handleDeleteCategory = async (id: number) => {
    const category = filteredCategories.find(c => c.id === id);
    try {
      await deleteCategory(id);
      showToast(`Category "${category?.name || ''}" deleted successfully`, 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to delete category', 'error');
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (id: number, isActive: boolean) => {
    const category = filteredCategories.find(c => c.id === id);
    try {
      await toggleCategoryStatus(id, isActive);
      showToast(
        `Category "${category?.name || ''}" ${isActive ? 'activated' : 'deactivated'} successfully`,
        'success'
      );
    } catch (error: any) {
      showToast(error.message || 'Failed to update category status', 'error');
    }
  };

  return (
    <div>
      <PageMeta title="Categories | POS System" description="Manage menu categories" />
      <PageBreadcrumb pageTitle="Categories" />

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Menu Categories</h2>
              <p className="text-sm text-gray-600 mt-1">
                Organize your menu items into categories
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              ➕ Add New Category
            </button>
          </div>
        </div>

        {/* Filters */}
        <CategoryFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
          totalCount={pagination.total}
          filteredCount={pagination.total}
          loading={loading}
        />

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <svg className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800 mb-1">Error</h3>
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                >
                  Refresh page
                </button>
              </div>
              <button
                onClick={() => setFilters(filters)}
                className="text-red-400 hover:text-red-600 transition-colors"
                aria-label="Dismiss error"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Categories List */}
        <div className="bg-white rounded-xl shadow p-6">
          <CategoryList
            categories={filteredCategories}
            loading={loading}
            onEdit={handleEditCategory}
            onDelete={handleDeleteCategory}
            onToggleStatus={handleToggleStatus}
            hasFilters={filters.searchTerm !== '' || filters.statusFilter !== 'all'}
          />

          {/* Pagination */}
          {!loading && pagination.total > 0 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
              onPageChange={setPage}
              onItemsPerPageChange={setLimit}
              className="mt-6"
            />
          )}
        </div>
      </div>

      {/* Create Modal */}
      <CategoryModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onSubmit={handleCreateCategory}
        isSubmitting={loading}
      />

      {/* Edit Modal */}
      <CategoryModal
        isOpen={!!editingCategory}
        onClose={handleCloseModal}
        onSubmit={handleUpdateCategory}
        category={editingCategory}
        isSubmitting={loading}
      />

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
    </div>
  );
}
