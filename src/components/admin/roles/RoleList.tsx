import { useTranslation } from 'react-i18next';
import type { Role } from '@/types/roles';
import RoleCard from './RoleCard';

interface RoleListProps {
  roles: Role[];
  loading?: boolean;
  onEdit: (role: Role) => void;
  onDelete: (id: number, name: string) => void;
  onViewUsers: (role: Role) => void;
}

export default function RoleList({ roles, loading, onEdit, onDelete, onViewUsers }: RoleListProps) {
  const { t } = useTranslation();
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface rounded-2xl shadow-sm border p-6 animate-pulse">
            <div className="h-6 bg-surface-2 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-surface-2 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-surface-2 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div className="bg-surface rounded-2xl shadow-sm border p-12 text-center">
        <div className="text-fg-muted text-6xl mb-4" aria-hidden="true">🔐</div>
        <h3 className="text-lg font-medium text-fg mb-2">{t('rbac.roleList.emptyTitle')}</h3>
        <p className="text-fg-muted">{t('rbac.roleList.emptyHint')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {roles.map((role) => (
        <RoleCard
          key={role.id}
          role={role}
          onEdit={onEdit}
          onDelete={(id) => onDelete(id, role.name)}
          onViewUsers={onViewUsers}
        />
      ))}
    </div>
  );
}
