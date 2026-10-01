import { useTranslation } from 'react-i18next';
import type { Role } from '@/types/roles';

interface RoleCardProps {
  role: Role;
  onEdit: (role: Role) => void;
  onDelete: (id: number) => void;
  onViewUsers: (role: Role) => void;
}

export default function RoleCard({ role, onEdit, onDelete, onViewUsers }: RoleCardProps) {
  const { t } = useTranslation();
  const isProtected = role.name === 'SuperAdmin';

  return (
    <div className="bg-white rounded-lg shadow border p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
          <div className="flex items-center gap-3 mt-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {t('rbac.roleCard.permissionCount', { count: role.permissions.length })}
            </span>
            <button
              type="button"
              onClick={() => onViewUsers(role)}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
            >
              {t('rbac.roleCard.userCount', { count: role.users_count })}
            </button>
          </div>
        </div>
        {isProtected && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <span aria-hidden="true">🔒</span> {t('rbac.roles.protected')}
          </span>
        )}
      </div>

      {role.permissions.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">{t('rbac.roleCard.permissions')}</p>
          <div className="flex flex-wrap gap-1">
            {role.permissions.slice(0, 5).map((permission) => (
              <span
                key={permission}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
              >
                {permission}
              </span>
            ))}
            {role.permissions.length > 5 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                {t('rbac.roleCard.more', { count: role.permissions.length - 5 })}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-4 border-t">
        <button
          type="button"
          onClick={() => onEdit(role)}
          disabled={isProtected}
          className={`flex-1 px-4 py-2 rounded text-sm font-medium ${
            isProtected
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <span aria-hidden="true">✏️</span> {t('rbac.edit')}
        </button>
        <button
          type="button"
          onClick={() => onDelete(role.id)}
          disabled={isProtected}
          className={`flex-1 px-4 py-2 rounded text-sm font-medium ${
            isProtected
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          <span aria-hidden="true">🗑️</span> {t('rbac.delete')}
        </button>
      </div>
    </div>
  );
}
