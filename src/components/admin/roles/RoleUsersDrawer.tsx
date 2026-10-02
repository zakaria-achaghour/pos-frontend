import { useTranslation } from 'react-i18next';
import type { RoleUser } from '@/types/roles';
import { Button, Modal, Skeleton } from '@/components/kit';
import EmptyState from '@/components/common/EmptyState';

interface RoleUsersDrawerProps { isOpen: boolean; onClose: () => void; roleName: string; users: RoleUser[]; loading?: boolean; }
export default function RoleUsersDrawer({ isOpen, onClose, roleName, users, loading = false }: RoleUsersDrawerProps) {
  const { t } = useTranslation();
  return <Modal isOpen={isOpen} onClose={onClose} title={t('rbac.drawer.title', { name: roleName })} className="fixed inset-y-0 end-0 max-h-dvh max-w-md rounded-none sm:rounded-none" footer={<Button variant="secondary" fullWidth size="md" onClick={onClose}>{t('common.close')}</Button>}>
    <p className="mb-5 text-sm text-fg-muted">{t('rbac.drawer.count', { count: users.length })}</p>
    {loading ? <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20"/>)}</div> : users.length === 0 ? <EmptyState title={t('rbac.drawer.empty')} icon="user"/> : <div className="space-y-3">{users.map(user => <div key={user.id} className="rounded-xl border border-line p-4"><h4 className="font-medium text-fg">{user.name}</h4><p className="mt-1 break-all text-sm text-fg-muted">{user.email}</p></div>)}</div>}
  </Modal>;
}
