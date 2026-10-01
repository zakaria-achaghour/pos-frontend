import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Alert from '@/components/ui/alert/Alert';
import { useRoleManagement } from '@/hooks/useRoleManagement';
import RoleForm from '@/components/admin/roles/RoleForm';
import { rolesAPI } from '@/api/roles';
import type { Role, RoleFormData } from '@/types/roles';

export default function EditRole() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {
    loading,
    error,
    validationErrors,
    availablePermissions,
    updateRole,
  } = useRoleManagement();

  const [roleData, setRoleData] = React.useState<Role | null>(null);
  const [fetchLoading, setFetchLoading] = React.useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!id) return;
      try {
        setFetchLoading(true);
        const role = await rolesAPI.getRole(Number(id));
        setRoleData(role);
      } catch (error) {
        console.error('Error fetching role:', error);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchRole();
  }, [id]);

  const handleSubmit = async (formData: RoleFormData) => {
    if (!id) return;
    try {
      await updateRole(Number(id), formData);
      navigate('/admin/roles');
    } catch (error) {
      // Error handled by hook
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div role="status" aria-label={t('common.loading')} className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!roleData) {
    return (
      <div className="space-y-6">
        <Alert variant="error" title={t('rbac.errorTitle')} message={t('rbac.roles.notFound')} />
        <button
          type="button"
          onClick={() => navigate('/admin/roles')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {t('rbac.roles.back')}
        </button>
      </div>
    );
  }

  // Check if role is protected
  const isProtected = roleData.name === 'SuperAdmin';

  if (isProtected) {
    return (
      <div className="space-y-6">
        <PageMeta title={t('rbac.roles.metaTitleNamed', { name: roleData.name })} description={t('rbac.roles.protectedMetaDescription')} />
        <PageBreadcrumb 
          pageTitle={roleData.name}
          breadcrumbItems={[
            { label: t('rbac.breadcrumb.admin'), href: '/admin' },
            { label: t('rbac.breadcrumb.roles'), href: '/admin/roles' },
            { label: roleData.name }
          ]}
        />

        <Alert 
          variant="warning" 
          title={t('rbac.roles.protectedTitle')} 
          message={t('rbac.roles.protectedMessage', { name: roleData.name })}
        />

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{roleData.name}</h1>
              <p className="text-gray-600 mt-1">{t('rbac.roles.systemProtected')}</p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              <span aria-hidden="true">🔒</span> {t('rbac.roles.protected')}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">{t('rbac.roles.permissionsHeading', { n: roleData.permissions.length })}</h3>
              <div className="flex flex-wrap gap-2">
                {roleData.permissions.map((permission: string) => (
                  <span
                    key={permission}
                    className="inline-flex items-center px-3 py-1 rounded-lg text-sm bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <button
              onClick={() => navigate('/admin/roles')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <span aria-hidden="true" className="inline-block rtl:rotate-180">←</span> {t('rbac.roles.back')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageMeta title={t('rbac.roles.editMetaTitleNamed', { name: roleData.name })} description={t('rbac.roles.editMetaDescription')} />
      <PageBreadcrumb 
        pageTitle={t('rbac.roles.editTitleNamed', { name: roleData.name })}
        breadcrumbItems={[
          { label: t('rbac.breadcrumb.admin'), href: '/admin' },
          { label: t('rbac.breadcrumb.roles'), href: '/admin/roles' },
          { label: t('rbac.breadcrumb.edit') }
        ]}
      />

      {/* Error Message */}
      {error && (
        <Alert variant="error" title={t('rbac.errorTitle')} message={error} />
      )}

      {/* Form Card */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('rbac.roles.editHeading')}</h1>
          <p className="text-gray-600 mt-1">{t('rbac.roles.editSubtitle')}</p>
        </div>

        <RoleForm
          initialData={roleData}
          isEdit
          onSubmit={handleSubmit}
          onCancel={() => navigate('/admin/roles')}
          isLoading={loading}
          serverErrors={validationErrors}
          availablePermissions={availablePermissions}
        />
      </div>
    </div>
  );
}
