import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Alert from '@/components/ui/alert/Alert';
import { useRoleManagement } from '@/hooks/useRoleManagement';
import RoleForm from '@/components/admin/roles/RoleForm';
import { rolesAPI } from '@/api/roles';

export default function EditRole() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {
    loading,
    error,
    validationErrors,
    availablePermissions,
    updateRole,
  } = useRoleManagement();

  const [roleData, setRoleData] = React.useState<any>(null);
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

  const handleSubmit = async (formData: any) => {
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!roleData) {
    return (
      <div className="space-y-6">
        <Alert variant="error" title="Error" message="Role not found" />
        <button
          onClick={() => navigate('/admin/roles')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Roles
        </button>
      </div>
    );
  }

  // Check if role is protected
  const isProtected = roleData.name === 'SuperAdmin';

  if (isProtected) {
    return (
      <div className="space-y-6">
        <PageMeta title={`${roleData.name} | POS System`} description="View protected role details" />
        <PageBreadcrumb 
          pageTitle={roleData.name}
          items={[
            { label: 'Admin', link: '/admin' },
            { label: 'Roles', link: '/admin/roles' },
            { label: roleData.name }
          ]}
        />

        <Alert 
          variant="warning" 
          title="Protected Role" 
          message={`The ${roleData.name} role is protected and cannot be edited. This role has system-level permissions that are essential for platform security.`}
        />

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{roleData.name}</h1>
              <p className="text-gray-600 mt-1">System protected role</p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              🔒 Protected
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Permissions ({roleData.permissions.length})</h3>
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
              ← Back to Roles
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageMeta title={`Edit ${roleData.name} | POS System`} description="Edit role details and permissions" />
      <PageBreadcrumb 
        pageTitle={`Edit ${roleData.name}`}
        items={[
          { label: 'Admin', link: '/admin' },
          { label: 'Roles', link: '/admin/roles' },
          { label: 'Edit' }
        ]}
      />

      {/* Error Message */}
      {error && (
        <Alert variant="error" title="Error" message={error} />
      )}

      {/* Form Card */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Role</h1>
          <p className="text-gray-600 mt-1">Update role details and permissions</p>
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
