import { dynamicT } from '@/i18n/dynamic';
import { useTranslation } from 'react-i18next';
import { formatMoney } from '@/lib/money';
import { Button, Icon } from '@/components/kit';
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

const ROLE_TONE: Record<string, { pill: string; avatar: string }> = {
  manager: { pill: 'bg-sec-staff/10 text-sec-staff', avatar: 'bg-sec-staff/15 text-sec-staff' },
  cashier: { pill: 'bg-sec-revenue/10 text-sec-revenue', avatar: 'bg-sec-revenue/15 text-sec-revenue' },
  waiter: { pill: 'bg-sec-orders/10 text-sec-orders', avatar: 'bg-sec-orders/15 text-sec-orders' },
  kitchen: { pill: 'bg-sec-kitchen/10 text-sec-kitchen', avatar: 'bg-sec-kitchen/15 text-sec-kitchen' },
};
const DEFAULT_TONE = { pill: 'bg-surface-2 text-fg', avatar: 'bg-surface-2 text-fg-muted' };

const STATUS_DOT: Record<string, string> = {
  active: 'bg-success',
  inactive: 'bg-danger',
  'on-break': 'bg-warning',
  vacation: 'bg-primary',
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
  const tone = ROLE_TONE[member.role] ?? DEFAULT_TONE;
  const onDuty = !!member.currentShift?.isActive;

  return (
    <div className="flex flex-col bg-surface rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-line overflow-hidden">
      {/* Identity */}
      <div className="flex items-start gap-3 p-4">
        <div
          aria-hidden="true"
          className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center text-sm font-semibold ${tone.avatar}`}
        >
          {initials || 'U'}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-fg truncate" title={displayName}>{displayName}</h3>
          <p className="text-sm text-fg-muted truncate" title={member.email}>{member.email}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tone.pill}`}>
              {dynamicT(`roles.${member.role}`, { defaultValue: member.role })}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-surface-2 text-fg">
              <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[member.status] ?? 'bg-fg-muted'}`} />
              {dynamicT(`staffAdmin.status.${member.status}`, { defaultValue: member.status })}
            </span>
          </div>
        </div>
      </div>

      {/* Shift */}
      <div
        className={`mx-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
          onDuty ? 'bg-success/10 text-success' : 'bg-surface-2 text-fg-muted'
        }`}
      >
        <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
          {onDuty && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />}
          <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${onDuty ? 'bg-success' : 'bg-fg-muted'}`} />
        </span>
        <span className="sr-only">{t('staffAdmin.card.shiftStatus')}</span>
        {onDuty
          ? t('staffAdmin.card.onDutySince', { time: member.currentShift?.clockIn })
          : t('staffAdmin.card.offDuty')}
      </div>

      {/* Stats */}
      <dl className="grid grid-cols-2 gap-px m-4 rounded-lg overflow-hidden border border-line bg-line text-sm">
        <div className="bg-surface p-3">
          <dt className="text-xs text-fg-muted">{t('staffAdmin.card.orders')}</dt>
          <dd className="mt-0.5 font-semibold text-fg tabular-nums">{member.performance.ordersCompleted}</dd>
        </div>
        <div className="bg-surface p-3">
          <dt className="text-xs text-fg-muted">{t('staffAdmin.card.rating')}</dt>
          <dd className="mt-0.5 font-semibold text-fg tabular-nums">
            <span aria-hidden="true" className="text-warning">★</span> {member.performance.customerRating.toFixed(1)}
          </dd>
        </div>
        <div className="bg-surface p-3">
          <dt className="text-xs text-fg-muted">{t('staffAdmin.card.revenue')}</dt>
          <dd className="mt-0.5 font-semibold text-fg tabular-nums">{formatMoney(member.performance.revenueGenerated)}</dd>
        </div>
        <div className="bg-surface p-3">
          <dt className="text-xs text-fg-muted">{t('staffAdmin.card.salary')}</dt>
          <dd className="mt-0.5 font-semibold text-fg tabular-nums">{formatMoney(member.salary)}</dd>
        </div>
      </dl>

      {member.role === 'waiter' && member.currentShift?.tableAssignments && (
        <p className="mx-4 -mt-1 mb-4 text-sm">
          <span className="text-fg-muted">{t('staffAdmin.card.tables')} </span>
          <span className="font-medium text-fg">
            {member.currentShift.tableAssignments.map((n) => `T${n}`).join(', ') || t('staffAdmin.details.none')}
          </span>
        </p>
      )}

      {/* Actions */}
      <div className="mt-auto p-4 bg-bg border-t border-line space-y-2">
        <Button
          size="md"
          variant={onDuty ? 'secondary' : 'success'}
          fullWidth
          onClick={() => onToggleClock(member.id)}
          disabled={loading}
        >
          <Icon name="clock" />
          {onDuty ? t('staffAdmin.card.clockOut') : t('staffAdmin.card.clockIn')}
        </Button>

        <div className="grid grid-cols-3 gap-2">
          <Button size="md" variant="secondary" className="px-2" onClick={() => onShowDetails(member)}>
            {t('staffAdmin.card.details')}
          </Button>
          {onEdit && (
            <Button size="md" variant="secondary" className="px-2" onClick={() => onEdit(member)}>
              {t('staffAdmin.card.edit')}
            </Button>
          )}
          {onDelete && (
            <Button
              size="md"
              variant="ghost"
              className="px-2 border border-danger/40 text-danger hover:bg-danger/10"
              onClick={() => onDelete(member.id, member.name)}
              disabled={loading}
            >
              {t('staffAdmin.delete')}
            </Button>
          )}
        </div>

        <select
          value={member.status}
          aria-label={t('staffAdmin.card.changeStatus', { name: displayName })}
          onChange={(e) => onChangeStatus(member.id, e.target.value as StaffStatus)}
          className="w-full min-h-11 px-3 bg-surface text-fg border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          disabled={loading}
        >
          <option value="active">{t('staffAdmin.status.active')}</option>
          <option value="inactive">{t('staffAdmin.status.inactive')}</option>
          <option value="vacation">{t('staffAdmin.status.vacation')}</option>
        </select>
      </div>
    </div>
  );
}
