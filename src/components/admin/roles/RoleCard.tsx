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
    <div className="bg-surface rounded-2xl shadow-sm border p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-fg">{role.name}</h3>
          <div className="flex items-center gap-3 mt-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {t('rbac.roleCard.permissionCount', { count: role.permissions.length })}
            </span>
            <button
              type="button"
              onClick={() => onViewUsers(role)}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success hover:bg-success/20 transition-colors"
            >
              {t('rbac.roleCard.userCount', { count: role.users_count })}
            </button>
          </div>
        </div>
        {isProtected && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning">
            <span aria-hidden="true">🔒</span> {t('rbac.roles.protected')}
          </span>
        )}
      </div>

      {role.permissions.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-fg-muted mb-2">{t('rbac.roleCard.permissions')}</p>
          <div className="flex flex-wrap gap-1">
            {role.permissions.slice(0, 5).map((permission) => (
              <span
                key={permission}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-surface-2 text-fg"
              >
                {permission}
              </span>
            ))}
            {role.permissions.length > 5 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-surface-2 text-fg">
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
              ? 'bg-surface-2 text-fg-muted cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary-hover'
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
              ? 'bg-surface-2 text-fg-muted cursor-not-allowed'
              : 'bg-danger text-white hover:bg-danger/90'
          }`}
        >
          <span aria-hidden="true">🗑️</span> {t('rbac.delete')}
        </button>
      </div>
    </div>
  );
}
