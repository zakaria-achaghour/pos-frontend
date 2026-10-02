import { Skeleton } from '@/components/kit';
import { useTranslation } from 'react-i18next';
import type { StaffListProps } from '@/types/staff';
import StaffCard from './StaffCard';

export default function StaffList({
  staff,
  loading,
  onClockInOut,
  onViewDetails,
  onStatusChange,
  onEdit,
  onDelete
}: StaffListProps) {
  const { t } = useTranslation();
  if (loading && staff.length === 0) return <div className="pos-card-grid" role="status" aria-label={t('staffAdmin.list.loading')}>{[1, 2, 3].map(i => <Skeleton key={i} className="h-48"/>)}</div>;
  if (staff.length === 0) {
    return (
      <div className="bg-surface rounded-2xl shadow-sm p-8 text-center border border-line">
        <div className="text-fg-muted mb-4">
          <svg aria-hidden="true" className="w-16 h-16 mx-auto mb-4 text-fg-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-fg mb-2">{t('staffAdmin.list.emptyTitle')}</h3>
        <p className="text-fg-muted mb-4">
          {loading ? t('staffAdmin.list.loading') : t('staffAdmin.list.emptyFilters')}
        </p>
        {!loading && (
          <button
            onClick={() => window.location.reload()}
            className="text-primary hover:text-primary font-medium"
          >
            {t('staffAdmin.list.refresh')}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="pos-card-grid">
      {staff.map((member) => (
        <StaffCard
          key={member.id}
          member={member}
          loading={loading}
          onToggleClock={onClockInOut}
          onShowDetails={onViewDetails}
          onChangeStatus={onStatusChange}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
