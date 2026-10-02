import React, { useState, useId } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const nameId = useId();
  const permsId = useId();
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
      errors.name = t('rbac.roleForm.nameRequired');
    }
    if (formData.permissions.length === 0) {
      errors.permissions = t('rbac.roleForm.permissionsRequired');
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
        <label htmlFor={nameId} className="block text-sm font-medium text-fg mb-1">
          {t('rbac.roleForm.name')} <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          id={nameId}
          aria-required="true"
          aria-invalid={getErrorMessage('name') ? true : undefined}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
            getErrorMessage('name') ? 'border-danger' : 'border-line'
          }`}
          placeholder={t('rbac.roleForm.namePlaceholder')}
          disabled={isLoading}
        />
        {getErrorMessage('name') && (
          <p className="mt-1 text-sm text-danger">{getErrorMessage('name')}</p>
        )}
      </div>

      {/* Permissions */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span id={permsId} className="block text-sm font-medium text-fg">
            {t('rbac.roleForm.permissions')} <span className="text-danger">*</span>
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={selectAllPermissions}
              className="text-xs text-primary hover:text-primary font-medium"
              disabled={isLoading}
            >
              {t('rbac.roleForm.selectAll')}
            </button>
            <span className="text-fg-muted" aria-hidden="true">|</span>
            <button
              type="button"
              onClick={deselectAllPermissions}
              className="text-xs text-primary hover:text-primary font-medium"
              disabled={isLoading}
            >
              {t('rbac.roleForm.clearAll')}
            </button>
          </div>
        </div>

        <div role="group" aria-labelledby={permsId} className="border border-line rounded-lg p-4 max-h-64 overflow-y-auto bg-bg">
          {availablePermissions.length === 0 ? (
            <p className="text-sm text-fg-muted text-center py-4">{t('rbac.roleForm.noPermissions')}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {availablePermissions.map((permission) => (
                <label
                  key={permission.id}
                  className="flex items-center gap-2 p-2 hover:bg-surface-2 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(permission.name)}
                    onChange={() => handlePermissionToggle(permission.name)}
                    className="w-4 h-4 text-primary border-line rounded focus:ring-primary"
                    disabled={isLoading}
                  />
                  <span className="text-sm text-fg">{permission.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <p className="mt-1 text-xs text-fg-muted">
          {t('rbac.roleForm.selected', { count: formData.permissions.length })}
        </p>
        {getErrorMessage('permissions') && (
          <p className="mt-1 text-sm text-danger">{getErrorMessage('permissions')}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 border border-line rounded-lg text-fg hover:bg-bg disabled:opacity-60"
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-60"
        >
          {isLoading ? t('rbac.saving') : isEdit ? t('rbac.roleForm.update') : t('rbac.roleForm.create')}
        </button>
      </div>
    </form>
  );
}
