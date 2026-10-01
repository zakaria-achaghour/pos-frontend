import { useState, useId } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Alert from '@/components/ui/alert/Alert';
import Modal from '@/components/common/Modal';
import PaginationWithText from '@/components/ui/pagination/PaginationWithText';
import { usePermissionManagement } from '@/hooks/usePermissionManagement';
import PermissionList from '@/components/admin/permissions/PermissionList';
import PermissionForm from '@/components/admin/permissions/PermissionForm';
import type { Permission } from '@/types/roles';
import type { PermissionFormData } from '@/types/roles';

export default function PermissionManagement() {
  const { t } = useTranslation();
  const searchId = useId();
  const {
    permissions,
    loading,
    error,
    successMessage,
    validationErrors,
    pagination,
    editingPermission,
    createPermission,
    updatePermission,
    deletePermission,
    goToPage,
    handleSearch,
    setEditingPermission,
  } = usePermissionManagement();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [permissionToDelete, setPermissionToDelete] = useState<Permission | null>(null);

  // Handle create
  const handleCreateSubmit = async (formData: PermissionFormData) => {
    try {
      await createPermission(formData);
      setShowCreateModal(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  // Handle edit
  const handleEditSubmit = async (formData: PermissionFormData) => {
    if (!editingPermission) return;
    try {
      await updatePermission(editingPermission.id, formData);
    } catch (error) {
      // Error handled by hook
    }
  };

  // Handle delete
  const handleDeleteRequest = (id: number, _name: string) => {
    const permission = permissions.find((p) => p.id === id);
    if (permission) {
      setPermissionToDelete(permission);
    }
  };

  const handleConfirmDelete = async () => {
    if (!permissionToDelete) return;
    try {
      await deletePermission(permissionToDelete.id);
      setPermissionToDelete(null);
    } catch (error) {
      // Error handled by hook
    }
  };

  // Close modals
  const closeModals = () => {
    setShowCreateModal(false);
    setEditingPermission(null);
    setPermissionToDelete(null);
  };

  return (
    <div className="space-y-6">
      <PageMeta title={t('rbac.permissions.metaTitle')} description={t('rbac.permissions.metaDescription')} />
      <PageBreadcrumb pageTitle={t('rbac.permissions.title')} />

      {/* Success Message */}
      {successMessage && (
        <Alert variant="success" title={t('rbac.successTitle')} message={successMessage} />
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="error" title={t('rbac.errorTitle')} message={error} />
      )}

      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('rbac.permissions.title')}</h1>
            <p className="text-gray-600">{t('rbac.permissions.subtitle')}</p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{pagination.total}</div>
              <div className="text-sm text-gray-600">{t('rbac.permissions.total')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-96">
            <label htmlFor={searchId} className="sr-only">{t('rbac.permissions.searchLabel')}</label>
            <input
              id={searchId}
              type="text"
              placeholder={t('rbac.permissions.searchPlaceholder')}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <span aria-hidden="true">➕</span> {t('rbac.permissions.create')}
          </button>
        </div>
      </div>

      {/* Permission List */}
      <PermissionList
        permissions={permissions}
        loading={loading}
        onEdit={setEditingPermission}
        onDelete={handleDeleteRequest}
      />

      {/* Pagination */}
      {pagination.lastPage > 1 && (
        <div className="bg-white rounded-lg shadow">
          <PaginationWithText
            totalPages={pagination.lastPage}
            initialPage={pagination.currentPage}
            onPageChange={goToPage}
          />
        </div>
      )}

      {/* Create Permission Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={closeModals}
        title={t('rbac.permissions.createTitle')}
        size="md"
      >
        <PermissionForm
          onSubmit={handleCreateSubmit}
          onCancel={closeModals}
          isLoading={loading}
          serverErrors={validationErrors}
        />
      </Modal>

      {/* Edit Permission Modal */}
      <Modal
        isOpen={!!editingPermission}
        onClose={closeModals}
        title={t('rbac.permissions.editTitle')}
        size="md"
      >
        {editingPermission && (
          <PermissionForm
            initialData={editingPermission}
            isEdit
            onSubmit={handleEditSubmit}
            onCancel={closeModals}
            isLoading={loading}
            serverErrors={validationErrors}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!permissionToDelete}
        onClose={() => setPermissionToDelete(null)}
        title={t('rbac.deleteTitle')}
        size="sm"
      >
        <div className="space-y-6">
          <p className="text-gray-700">
            <Trans
              i18nKey="rbac.permissions.deleteConfirm"
              values={{ name: permissionToDelete?.name }}
              components={{ strong: <span className="font-semibold" /> }}
            />
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setPermissionToDelete(null)}
              disabled={loading}
              className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={loading}
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
            >
              {loading ? t('rbac.deleting') : t('rbac.permissions.deleteAction')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
