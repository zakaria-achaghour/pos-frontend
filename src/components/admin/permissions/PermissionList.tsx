import { useTranslation } from 'react-i18next';
import type { Permission } from '@/types/roles';

interface PermissionListProps {
  permissions: Permission[];
  loading?: boolean;
  onEdit: (permission: Permission) => void;
  onDelete: (id: number, name: string) => void;
}

export default function PermissionList({ permissions, loading, onEdit, onDelete }: PermissionListProps) {
  const { t, i18n } = useTranslation();
  if (loading) {
    return (
      <div className="bg-surface rounded-2xl shadow-sm overflow-x-auto border border-line">
        <div className="animate-pulse p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-5 bg-surface-2 rounded w-1/3"></div>
              <div className="flex gap-2">
                <div className="h-8 bg-surface-2 rounded w-16"></div>
                <div className="h-8 bg-surface-2 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (permissions.length === 0) {
    return (
      <div className="bg-surface rounded-2xl shadow-sm border p-12 text-center">
        <div className="text-fg-muted text-6xl mb-4" aria-hidden="true">🔑</div>
        <h3 className="text-lg font-medium text-fg mb-2">{t('rbac.permissionList.emptyTitle')}</h3>
        <p className="text-fg-muted">{t('rbac.permissionList.emptyHint')}</p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl shadow-sm overflow-x-auto border border-line">
      <table className="min-w-full divide-y divide-line">
        <thead className="bg-bg">
          <tr>
            <th className="px-6 py-3 text-start text-xs font-medium text-fg-muted uppercase tracking-wider">
              {t('rbac.permissionList.colName')}
            </th>
            <th className="px-6 py-3 text-start text-xs font-medium text-fg-muted uppercase tracking-wider">
              {t('rbac.permissionList.colCreated')}
            </th>
            <th className="px-6 py-3 text-end text-xs font-medium text-fg-muted uppercase tracking-wider">
              {t('rbac.permissionList.colActions')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-surface divide-y divide-line">
          {permissions.map((permission) => (
            <tr key={permission.id} className="hover:bg-bg">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {permission.name}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-fg-muted">
                {new Date(permission.created_at).toLocaleDateString(i18n.language)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(permission)}
                    className="text-primary hover:text-primary"
                  >
                    <span aria-hidden="true">✏️</span> {t('rbac.edit')}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(permission.id, permission.name)}
                    className="text-danger hover:text-danger"
                  >
                    <span aria-hidden="true">🗑️</span> {t('rbac.delete')}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
