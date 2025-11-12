import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Alert from '@/components/ui/alert/Alert';
import Modal from '@/components/common/Modal';
import PaginationWithText from '@/components/ui/pagination/PaginationWithText';
import { useRoleManagement } from '@/hooks/useRoleManagement';
import RoleList from '@/components/admin/roles/RoleList';
import RoleUsersDrawer from '@/components/admin/roles/RoleUsersDrawer';
import type { Role } from '@/types/roles';

export default function RoleManagement() {
  const navigate = useNavigate();
  const {
    roles,
    loading,
    error,
    successMessage,
    pagination,
    roleUsers,
    selectedRole,
    deleteRole,
    fetchRoleUsers,
    goToPage,
    handleSearch,
    setSelectedRole,
    clearError,
  } = useRoleManagement();

  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [showUsersDrawer, setShowUsersDrawer] = useState(false);

  // Handle delete confirmation
  const handleDeleteRequest = (id: number, name: string) => {
    const role = roles.find((r) => r.id === id);
    if (role) {
      setRoleToDelete(role);
    }
  };

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;
    try {
      await deleteRole(roleToDelete.id);
      setRoleToDelete(null);
    } catch (error) {
      // Error handled by hook
    }
  };

  // Handle view users
  const handleViewUsers = async (role: Role) => {
    setSelectedRole(role);
    setShowUsersDrawer(true);
    await fetchRoleUsers(role.id);
  };

  return (
    <div className="space-y-6">
      <PageMeta title="Role Management | POS System" description="Manage user roles and permissions" />
      <PageBreadcrumb pageTitle="Role Management" />

      {/* Success Message */}
      {successMessage && (
        <Alert variant="success" title="Success!" message={successMessage} />
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="error" title="Error" message={error} onClose={clearError} />
      )}

      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
            <p className="text-gray-600">Create and manage user roles with custom permissions</p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{pagination.total}</div>
              <div className="text-sm text-gray-600">Total Roles</div>
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
              placeholder="Search roles..."
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => navigate('/admin/roles/create')}
            className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            ➕ Create New Role
          </button>
        </div>
      </div>

      {/* Role List */}
      <RoleList
        roles={roles}
        loading={loading}
        onEdit={(role) => {
          // Prevent editing protected roles
          if (role.name === 'SuperAdmin') {
            console.warn(`Cannot edit protected role: ${role.name}`);
            return;
          }
          navigate(`/admin/roles/${role.id}/edit`);
        }}
        onDelete={handleDeleteRequest}
        onViewUsers={handleViewUsers}
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!roleToDelete}
        onClose={() => setRoleToDelete(null)}
        title="Confirm Deletion"
        size="sm"
      >
        <div className="space-y-6">
          <p className="text-gray-700">
            Are you sure you want to delete the role{' '}
            <span className="font-semibold">{roleToDelete?.name}</span>?
            {roleToDelete && roleToDelete.users_count > 0 && (
              <span className="block mt-2 text-red-600">
                ⚠️ This role has {roleToDelete.users_count} assigned user(s). Please reassign them first.
              </span>
            )}
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setRoleToDelete(null)}
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
              {loading ? 'Deleting...' : 'Delete Role'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Users Drawer */}
      <RoleUsersDrawer
        isOpen={showUsersDrawer}
        onClose={() => {
          setShowUsersDrawer(false);
          setSelectedRole(null);
        }}
        roleName={selectedRole?.name || ''}
        users={roleUsers}
        loading={loading}
      />
    </div>
  );
}
