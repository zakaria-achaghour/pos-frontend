import React, { useState } from 'react';
import type { RoleFormProps } from '@/types/roles';

export default function RoleForm({
  initialData,
  isEdit = false,
  onSubmit,
  onCancel,
  isLoading = false,
  serverErrors = {},
  availablePermissions,
}: RoleFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    permissions: initialData?.permissions || [],
  });

  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalErrors({});

    // Validation
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = 'Role name is required';
    }
    if (formData.permissions.length === 0) {
      errors.permissions = 'At least one permission is required';
    }

    if (Object.keys(errors).length > 0) {
      setLocalErrors(errors);
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      // Error handled by parent
    }
  };

  const handlePermissionToggle = (permissionName: string) => {
    setFormData((prev) => {
      const isSelected = prev.permissions.includes(permissionName);
      return {
        ...prev,
        permissions: isSelected
          ? prev.permissions.filter((p) => p !== permissionName)
          : [...prev.permissions, permissionName],
      };
    });
  };

  const selectAllPermissions = () => {
    setFormData((prev) => ({
      ...prev,
      permissions: availablePermissions.map((p) => p.name),
    }));
  };

  const deselectAllPermissions = () => {
    setFormData((prev) => ({
      ...prev,
      permissions: [],
    }));
  };

  const getErrorMessage = (field: string) => {
    if (localErrors[field]) return localErrors[field];
    if (serverErrors[field]) {
      return Array.isArray(serverErrors[field])
        ? serverErrors[field][0]
        : serverErrors[field];
    }
    return null;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Role Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Role Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            getErrorMessage('name') ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g. Inventory Manager"
          disabled={isLoading}
        />
        {getErrorMessage('name') && (
          <p className="mt-1 text-sm text-red-600">{getErrorMessage('name')}</p>
        )}
      </div>

      {/* Permissions */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Permissions <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={selectAllPermissions}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              disabled={isLoading}
            >
              Select All
            </button>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={deselectAllPermissions}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              disabled={isLoading}
            >
              Clear All
            </button>
          </div>
        </div>
        
        <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
          {availablePermissions.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No permissions available</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {availablePermissions.map((permission) => (
                <label
                  key={permission.id}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(permission.name)}
                    onChange={() => handlePermissionToggle(permission.name)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <span className="text-sm text-gray-700">{permission.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        
        <p className="mt-1 text-xs text-gray-500">
          Selected: {formData.permissions.length} permission(s)
        </p>
        {getErrorMessage('permissions') && (
          <p className="mt-1 text-sm text-red-600">{getErrorMessage('permissions')}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
        >
          {isLoading ? 'Saving...' : isEdit ? 'Update Role' : 'Create Role'}
        </button>
      </div>
    </form>
  );
}
