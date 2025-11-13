import React, { useState } from 'react';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Alert from '@/components/ui/alert/Alert';
import Modal from '@/components/common/Modal';
import PaginationWithText from '@/components/ui/pagination/PaginationWithText';
import { usePermissionManagement } from '@/hooks/usePermissionManagement';
import PermissionList from '@/components/admin/permissions/PermissionList';
import PermissionForm from '@/components/admin/permissions/PermissionForm';
import type { Permission } from '@/types/roles';

export default function PermissionManagement() {
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
  const handleCreateSubmit = async (formData: any) => {
    try {
      await createPermission(formData);
      setShowCreateModal(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  // Handle edit
  const handleEditSubmit = async (formData: any) => {
    if (!editingPermission) return;
    try {
      await updatePermission(editingPermission.id, formData);
    } catch (error) {
      // Error handled by hook
    }
  };

  // Handle delete
  const handleDeleteRequest = (id: number, name: string) => {
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
      <PageMeta title="Permission Management | POS System" description="Manage system permissions" />
      <PageBreadcrumb pageTitle="Permission Management" />

      {/* Success Message */}
      {successMessage && (
        <Alert variant="success" title="Success!" message={successMessage} />
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="error" title="Error" message={error} />
      )}

      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Permission Management</h1>
            <p className="text-gray-600">Define and manage system permissions</p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{pagination.total}</div>
              <div className="text-sm text-gray-600">Total Permissions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-96">
            <input
              type="text"
              placeholder="Search permissions..."
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            ➕ Create New Permission
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
        title="Create New Permission"
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
        title="Edit Permission"
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
        title="Confirm Deletion"
        size="sm"
      >
        <div className="space-y-6">
          <p className="text-gray-700">
            Are you sure you want to delete the permission{' '}
            <span className="font-semibold">{permissionToDelete?.name}</span>?
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setPermissionToDelete(null)}
              disabled={loading}
              className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={loading}
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
            >
              {loading ? 'Deleting...' : 'Delete Permission'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
