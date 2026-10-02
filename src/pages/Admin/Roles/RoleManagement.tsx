import { useState, useId } from 'react';
import { useTranslation, Trans } from 'react-i18next';
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
  const { t } = useTranslation();
  const searchId = useId();
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
  } = useRoleManagement();

  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [showUsersDrawer, setShowUsersDrawer] = useState(false);

  // Handle delete confirmation
  const handleDeleteRequest = (id: number, _name: string) => {
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
      <PageMeta title={t('rbac.roles.metaTitle')} description={t('rbac.roles.metaDescription')} />
      <PageBreadcrumb hideTitle pageTitle={t('rbac.roles.title')} />

      {/* Success Message */}
      {successMessage && (
        <Alert variant="success" title={t('rbac.successTitle')} message={successMessage} />
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="error" title={t('rbac.errorTitle')} message={error} />
      )}

      {/* Header */}
      <div className="bg-surface p-6 rounded-2xl shadow-sm border border-line">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-fg">{t('rbac.roles.title')}</h1>
            <p className="text-fg-muted">{t('rbac.roles.subtitle')}</p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{pagination.total}</div>
              <div className="text-sm text-fg-muted">{t('rbac.roles.total')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="bg-surface p-4 rounded-2xl shadow-sm border border-line">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-96">
            <label htmlFor={searchId} className="sr-only">{t('rbac.roles.searchLabel')}</label>
            <input
              id={searchId}
              type="text"
              placeholder={t('rbac.roles.searchPlaceholder')}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 border border-line rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <button
            type="button"
            onClick={() => navigate('/admin/roles/create')}
            className="w-full md:w-auto px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover font-medium"
          >
            <span aria-hidden="true">➕</span> {t('rbac.roles.create')}
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
        <div className="bg-surface rounded-2xl shadow-sm border border-line">
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
        title={t('rbac.deleteTitle')}
        size="sm"
      >
        <div className="space-y-6">
          <p className="text-fg">
            <Trans
              i18nKey="rbac.roles.deleteConfirm"
              values={{ name: roleToDelete?.name }}
              components={{ strong: <span className="font-semibold" /> }}
            />
            {roleToDelete && roleToDelete.users_count > 0 && (
              <span className="block mt-2 text-danger">
                <span aria-hidden="true">⚠️</span> {t('rbac.roles.assignedWarning', { count: roleToDelete.users_count })}
              </span>
            )}
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setRoleToDelete(null)}
              disabled={loading}
              className="px-4 py-2 rounded border border-line text-fg hover:bg-surface-2"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={loading}
              className="px-4 py-2 rounded bg-danger text-white hover:bg-danger/90 disabled:opacity-60"
            >
              {loading ? t('rbac.deleting') : t('rbac.roles.deleteAction')}
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
