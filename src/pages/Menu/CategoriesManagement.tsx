import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Alert from '@/components/ui/alert/Alert';
import { Button, Modal } from '@/components/kit';
import { useCategoryManagement } from '@/hooks/useCategoryManagement';
import PaginationWithText from '@/components/ui/pagination/PaginationWithText';
import CategoryList from '@/components/pos/menu/CategoryList';
import CategoryModal from '@/components/pos/menu/CategoryModal';
import type { Category, CategoryFilter, CreateCategoryData, UpdateCategoryData } from '@/types/menu';

export default function CategoriesManagement() {
  const { t } = useTranslation();
  const searchId = useId();
  const statusId = useId();
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
  const handleAddCategory = async (data: CreateCategoryData) => {
    try {
      await createCategory(data);
      setShowAddModal(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleEditCategory = async (data: UpdateCategoryData) => {
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
      <PageMeta title={t('categoriesAdmin.metaTitle')} description={t('categoriesAdmin.metaDescription')} />
      <PageBreadcrumb pageTitle={t('categoriesAdmin.breadcrumb')} />

      {/* Success Alert */}
      {successMessage && (
        <div className="mb-6">
          <Alert
            variant="success"
            title={t('categoriesAdmin.successTitle')}
            message={successMessage}
          />
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mb-6">
          <Alert
            variant="error"
            title={t('categoriesAdmin.errorTitle')}
            message={error}
          />
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('categoriesAdmin.heading')}</h1>
          <p className="text-sm text-gray-600 mt-1">
            {t('categoriesAdmin.subtitle', { total: categoryStats.total })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          {t('categoriesAdmin.add')}
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label htmlFor={searchId} className="block text-sm font-medium text-gray-700 mb-2">{t('common.search')}</label>
            <input
              id={searchId}
              type="text"
              placeholder={t('categoriesAdmin.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor={statusId} className="block text-sm font-medium text-gray-700 mb-2">{t('categoriesAdmin.status')}</label>
            <select
              id={statusId}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CategoryFilter)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">{t('categoriesAdmin.filterAll', { count: categoryStats.total })}</option>
              <option value="active">{t('categoriesAdmin.filterActive', { count: categoryStats.active })}</option>
              <option value="inactive">{t('categoriesAdmin.filterInactive', { count: categoryStats.inactive })}</option>
            </select>
          </div>

          {/* Stats */}
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              {t('categoriesAdmin.showing', { shown: filteredCategories.length, total: categoryStats.total })}
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
          title={t('categoriesAdmin.delete.title')}
          closeLabel={t('common.close')}
          size="sm"
          footer={
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setCategoryToDelete(null)}>
                {t('common.cancel')}
              </Button>
              <Button variant="danger" onClick={handleConfirmDelete} disabled={loading}>
                {loading ? t('categoriesAdmin.delete.deleting') : t('categoriesAdmin.delete.confirm')}
              </Button>
            </div>
          }
        >
          <p className="text-gray-600">{t('categoriesAdmin.delete.body', { name: categoryToDelete.name })}</p>
        </Modal>
      )}

      {/* Toggle Status Confirmation Modal */}
      {categoryToToggle && (
        <Modal
          isOpen={true}
          onClose={() => setCategoryToToggle(null)}
          title={categoryToToggle.is_active ? t('categoriesAdmin.toggle.deactivateTitle') : t('categoriesAdmin.toggle.activateTitle')}
          closeLabel={t('common.close')}
          size="sm"
          footer={
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setCategoryToToggle(null)}>
                {t('common.cancel')}
              </Button>
              <Button
                variant={categoryToToggle.is_active ? 'danger' : 'success'}
                onClick={handleConfirmToggleStatus}
                disabled={loading}
              >
                {loading
                  ? t('categoriesAdmin.toggle.processing')
                  : categoryToToggle.is_active
                    ? t('categoriesAdmin.toggle.deactivate')
                    : t('categoriesAdmin.toggle.activate')}
              </Button>
            </div>
          }
        >
          <p className="text-gray-600">
            {categoryToToggle.is_active
              ? t('categoriesAdmin.toggle.deactivateBody', { name: categoryToToggle.name })
              : t('categoriesAdmin.toggle.activateBody', { name: categoryToToggle.name })}
          </p>
        </Modal>
      )}
    </div>
  );
}
