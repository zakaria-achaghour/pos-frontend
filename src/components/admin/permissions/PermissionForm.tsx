import React, { useState, useId } from 'react';
import { useTranslation } from 'react-i18next';
import type { PermissionFormProps } from '@/types/roles';

export default function PermissionForm({
  initialData,
  isEdit = false,
  onSubmit,
  onCancel,
  isLoading = false,
  serverErrors = {},
}: PermissionFormProps) {
  const { t } = useTranslation();
  const nameId = useId();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
  });

  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalErrors({});

    // Validation
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors['name'] = t('rbac.permissionForm.nameRequired');
    } else if (!/^[a-z0-9-]+$/.test(formData.name)) {
      errors['name'] = t('rbac.permissionForm.nameFormat');
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
      {/* Permission Name */}
      <div>
        <label htmlFor={nameId} className="block text-sm font-medium text-gray-700 mb-1">
          {t('rbac.permissionForm.name')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id={nameId}
          aria-required="true"
          aria-invalid={getErrorMessage('name') ? true : undefined}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase() })}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            getErrorMessage('name') ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder={t('rbac.permissionForm.namePlaceholder')}
          disabled={isLoading}
        />
        <p className="mt-1 text-xs text-gray-500">
          {t('rbac.permissionForm.hint')}
        </p>
        {getErrorMessage('name') && (
          <p className="mt-1 text-sm text-red-600">{getErrorMessage('name')}</p>
        )}
      </div>

      {/* Common Permission Examples */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2"><span aria-hidden="true">📝</span> {t('rbac.permissionForm.examples')}</h4>
        <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
          <div>• view-menu</div>
          <div>• manage-menu</div>
          <div>• view-orders</div>
          <div>• manage-orders</div>
          <div>• view-roles</div>
          <div>• manage-roles</div>
          <div>• view-permissions</div>
          <div>• manage-permissions</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
        >
          {isLoading ? t('rbac.saving') : isEdit ? t('rbac.permissionForm.update') : t('rbac.permissionForm.create')}
        </button>
      </div>
    </form>
  );
}
