import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Alert from '@/components/ui/alert/Alert';
import { useRoleManagement } from '@/hooks/useRoleManagement';
import RoleForm from '@/components/admin/roles/RoleForm';

export default function CreateRole() {
  const navigate = useNavigate();
  const {
    loading,
    error,
    validationErrors,
    availablePermissions,
    createRole,
    clearError,
  } = useRoleManagement();

  const handleSubmit = async (formData: any) => {
    try {
      await createRole(formData);
      navigate('/admin/roles');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div className="space-y-6">
      <PageMeta title="Create Role | POS System" description="Create a new user role" />
      <PageBreadcrumb 
        pageTitle="Create Role"
        items={[
          { label: 'Admin', link: '/admin' },
          { label: 'Roles', link: '/admin/roles' },
          { label: 'Create' }
        ]}
      />

      {/* Error Message */}
      {error && (
        <Alert variant="error" title="Error" message={error} />
      )}

      {/* Form Card */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create New Role</h1>
          <p className="text-gray-600 mt-1">Define a new role with custom permissions</p>
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
