import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Alert from '@/components/ui/alert/Alert';
import { useRoleManagement } from '@/hooks/useRoleManagement';
import RoleForm from '@/components/admin/roles/RoleForm';
import type { RoleFormData } from '@/types/roles';

export default function CreateRole() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    loading,
    error,
    validationErrors,
    availablePermissions,
    createRole,
  } = useRoleManagement();

  const handleSubmit = async (formData: RoleFormData) => {
    try {
      await createRole(formData);
      navigate('/admin/roles');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div className="space-y-6">
      <PageMeta title={t('rbac.roles.createMetaTitle')} description={t('rbac.roles.createMetaDescription')} />
      <PageBreadcrumb hideTitle
        pageTitle={t('rbac.roles.createTitle')}
        breadcrumbItems={[
          { label: t('rbac.breadcrumb.admin'), href: '/admin' },
          { label: t('rbac.breadcrumb.roles'), href: '/admin/roles' },
          { label: t('rbac.breadcrumb.create') }
        ]}
      />

      {/* Error Message */}
      {error && (
        <Alert variant="error" title={t('rbac.errorTitle')} message={error} />
      )}

      {/* Form Card */}
      <div className="bg-surface p-6 rounded-2xl shadow-sm border border-line">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-fg">{t('rbac.roles.createHeading')}</h1>
          <p className="text-fg-muted mt-1">{t('rbac.roles.createSubtitle')}</p>
        </div>

        <RoleForm
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
