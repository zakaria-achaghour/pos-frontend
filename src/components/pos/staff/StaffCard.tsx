import { dynamicT } from '@/i18n/dynamic';
import { useTranslation } from 'react-i18next';
import { formatMoney } from '@/lib/money';
import type { StaffMember, StaffStatus } from '@/types/staff';

interface StaffCardProps {
  member: StaffMember;
  loading?: boolean;
  onToggleClock: (id: number) => void;
  onShowDetails: (member: StaffMember) => void;
  onChangeStatus: (id: number, status: StaffStatus) => void;
  onEdit?: (member: StaffMember) => void;
  onDelete?: (id: number, name: string) => void;
}


const getRoleColor = (role: string) => {
  switch (role) {
    case 'manager':
      return 'bg-purple-100 text-purple-800';
    case 'cashier':
      return 'bg-green-100 text-green-800';
    case 'waiter':
      return 'bg-blue-100 text-blue-800';
    case 'kitchen':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'inactive':
      return 'bg-red-100 text-red-800';
    case 'on-break':
      return 'bg-yellow-100 text-yellow-800';
    case 'vacation':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function StaffCard({
  member,
  loading,
  onToggleClock,
  onShowDetails,
  onChangeStatus,
  onEdit,
  onDelete,
}: StaffCardProps) {
  const { t } = useTranslation();
  const displayName = member.name || t('staffAdmin.card.unknown');
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('');

  return (
    <div className="bg-white rounded-lg shadow border">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">{initials || 'U'}</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{displayName}</h3>
              <p className="text-sm text-gray-600">{member.email}</p>
            </div>
          </div>
          <div className="text-end">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
                member.role
              )}`}
            >
              {dynamicT(`roles.${member.role}`, { defaultValue: member.role })}
            </span>
            <div className="mt-1">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  member.status
                )}`}
              >
                {dynamicT(`staffAdmin.status.${member.status}`, { defaultValue: member.status })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{t('staffAdmin.card.shiftStatus')}</span>
            <div className="flex items-center gap-2">
              {member.currentShift?.isActive ? (
                <span className="text-green-600 text-sm">
                  <span aria-hidden="true">🟢</span> {t('staffAdmin.card.onDutySince', { time: member.currentShift.clockIn })}
                </span>
              ) : (
                <span className="text-gray-500 text-sm"><span aria-hidden="true">⚫</span> {t('staffAdmin.card.offDuty')}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">{t('staffAdmin.card.orders')}</span>
              <div className="font-medium">{member.performance.ordersCompleted}</div>
            </div>
            <div>
              <span className="text-gray-500">{t('staffAdmin.card.rating')}</span>
              <div className="font-medium">⭐ {member.performance.customerRating.toFixed(1)}</div>
            </div>
            <div>
              <span className="text-gray-500">{t('staffAdmin.card.revenue')}</span>
              <div className="font-medium text-green-600">
                {formatMoney(member.performance.revenueGenerated)}
              </div>
            </div>
            <div>
              <span className="text-gray-500">{t('staffAdmin.card.salary')}</span>
              <div className="font-medium">{formatMoney(member.salary)}</div>
            </div>
          </div>

          {member.role === 'waiter' && member.currentShift?.tableAssignments && (
            <div>
              <span className="text-sm text-gray-600">{t('staffAdmin.card.tables')} </span>
              <span className="text-sm font-medium">
                {member.currentShift.tableAssignments.map((n) => `T${n}`).join(', ') || t('staffAdmin.details.none')}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => onToggleClock(member.id)}
              className={`px-3 py-2 rounded text-sm font-medium ${
                member.currentShift?.isActive
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
              disabled={loading}
            >
              <span aria-hidden="true">⏰</span> {member.currentShift?.isActive ? t('staffAdmin.card.clockOut') : t('staffAdmin.card.clockIn')}
            </button>
            <button
              onClick={() => onShowDetails(member)}
              className="bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm hover:bg-blue-200"
            >
              <span aria-hidden="true">👁️</span> {t('staffAdmin.card.details')}
            </button>
            {onEdit && (
              <button
                onClick={() => onEdit(member)}
                className="bg-yellow-100 text-yellow-700 px-3 py-2 rounded text-sm hover:bg-yellow-200"
              >
                <span aria-hidden="true">✏️</span> {t('staffAdmin.card.edit')}
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(member.id, member.name)}
                className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm hover:bg-red-200"
                disabled={loading}
              >
                <span aria-hidden="true">🗑️</span> {t('staffAdmin.delete')}
              </button>
            )}
          </div>

          <select
            value={member.status}
            aria-label={t('staffAdmin.card.changeStatus', { name: displayName })}
            onChange={(e) => onChangeStatus(member.id, e.target.value as StaffStatus)}
            className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            <option value="active">{t('staffAdmin.status.active')}</option>
            <option value="inactive">{t('staffAdmin.status.inactive')}</option>
            <option value="vacation">{t('staffAdmin.status.vacation')}</option>
          </select>
        </div>
      </div>
    </div>
  );
}
