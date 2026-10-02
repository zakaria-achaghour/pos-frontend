import { dynamicT } from '@/i18n/dynamic';
import { useTranslation } from 'react-i18next';
import { formatMoney } from '@/lib/money';
import type { StaffMember } from '@/types/staff';

interface StaffPerformanceViewProps {
  staff: StaffMember[];
}

export default function StaffPerformanceView({ staff }: StaffPerformanceViewProps) {
  const { t } = useTranslation();
  // Sort staff by performance (revenue generated)
  const sortedByPerformance = [...staff].sort(
    (a, b) => b.performance.revenueGenerated - a.performance.revenueGenerated
  );

  const getPerformanceRank = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '👤';
    }
  };

  const getPerformanceGrade = (member: StaffMember) => {
    const { customerRating, punctualityScore } = member.performance;
    const avgScore = (customerRating * 20 + punctualityScore) / 2; // Convert to 100 scale

    if (avgScore >= 90) return { grade: 'A+', color: 'text-success', bg: 'bg-success/10' };
    if (avgScore >= 80) return { grade: 'A', color: 'text-success', bg: 'bg-success/10' };
    if (avgScore >= 70) return { grade: 'B', color: 'text-primary', bg: 'bg-primary/10' };
    if (avgScore >= 60) return { grade: 'C', color: 'text-warning', bg: 'bg-warning/10' };
    return { grade: 'D', color: 'text-danger', bg: 'bg-danger/10' };
  };

  // Calculate team totals
  const teamStats = {
    totalOrders: staff.reduce((sum, s) => sum + s.performance.ordersCompleted, 0),
    totalRevenue: staff.reduce((sum, s) => sum + s.performance.revenueGenerated, 0),
    avgRating: staff.reduce((sum, s) => sum + s.performance.customerRating, 0) / staff.length || 0,
    avgPunctuality: staff.reduce((sum, s) => sum + s.performance.punctualityScore, 0) / staff.length || 0,
    totalTips: staff.reduce((sum, s) => sum + s.performance.tips, 0),
  };

  return (
    <div className="space-y-6">
      {/* Team Performance Summary */}
      <div className="bg-surface rounded-2xl shadow-sm p-6 border border-line">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span aria-hidden="true">📊</span> {t('staffAdmin.performance.teamOverview')}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{teamStats.totalOrders}</div>
            <div className="text-sm text-fg-muted">{t('staffAdmin.performance.totalOrders')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">
              {formatMoney(teamStats.totalRevenue)}
            </div>
            <div className="text-sm text-fg-muted">{t('staffAdmin.performance.totalRevenue')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning">
              ⭐ {teamStats.avgRating.toFixed(1)}
            </div>
            <div className="text-sm text-fg-muted">{t('staffAdmin.performance.avgRating')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-sec-staff">{teamStats.avgPunctuality.toFixed(0)}%</div>
            <div className="text-sm text-fg-muted">{t('staffAdmin.performance.avgPunctuality')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">
              {formatMoney(teamStats.totalTips)}
            </div>
            <div className="text-sm text-fg-muted">{t('staffAdmin.performance.totalTips')}</div>
          </div>
        </div>
      </div>

      {/* Individual Performance Rankings */}
      <div className="bg-surface rounded-2xl shadow-sm border border-line">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span aria-hidden="true">🏆</span> {t('staffAdmin.performance.rankings')}
          </h3>
          <div className="space-y-4">
            {sortedByPerformance.map((member, index) => {
              const grade = getPerformanceGrade(member);
              return (
                <div
                  key={member.id}
                  className={`flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow ${
                    index < 3 ? 'border-warning/30 bg-warning/10' : 'border-line'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">
                      {getPerformanceRank(index)}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-line rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-fg-muted">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-fg-muted">{dynamicT(`roles.${member.role}`, { defaultValue: member.role })}</div>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${grade.bg} ${grade.color}`}>
                      {t('staffAdmin.performance.grade', { grade: grade.grade })}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-6 text-center">
                    <div>
                      <div className="text-lg font-bold">{member.performance.ordersCompleted}</div>
                      <div className="text-xs text-fg-muted">{t('staffAdmin.card.orders')}</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-success">
                        {formatMoney(member.performance.revenueGenerated)}
                      </div>
                      <div className="text-xs text-fg-muted">{t('staffAdmin.card.revenue')}</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">
                        ⭐ {member.performance.customerRating.toFixed(1)}
                      </div>
                      <div className="text-xs text-fg-muted">{t('staffAdmin.card.rating')}</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{member.performance.punctualityScore}%</div>
                      <div className="text-xs text-fg-muted">{t('staffAdmin.details.punctuality')}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-surface rounded-2xl shadow-sm p-6 border border-line">
          <h4 className="font-semibold mb-4 text-success"><span aria-hidden="true">🌟</span> {t('staffAdmin.performance.topPerformers')}</h4>
          <div className="space-y-3">
            {sortedByPerformance.slice(0, 3).map((member, index) => (
              <div key={member.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{getPerformanceRank(index)}</span>
                  <span className="font-medium">{member.name}</span>
                </div>
                <span className="text-success font-medium">
                  {formatMoney(member.performance.revenueGenerated)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Areas for Improvement */}
        <div className="bg-surface rounded-2xl shadow-sm p-6 border border-line">
          <h4 className="font-semibold mb-4 text-warning"><span aria-hidden="true">📈</span> {t('staffAdmin.performance.improvement')}</h4>
          <div className="space-y-3">
            {staff
              .filter(s => s.performance.punctualityScore < 80 || s.performance.customerRating < 4.0)
              .slice(0, 3)
              .map((member) => (
                <div key={member.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-fg-muted">
                      {member.performance.punctualityScore < 80 && `${t('staffAdmin.details.punctuality')}: ${member.performance.punctualityScore}%`}
                      {member.performance.punctualityScore < 80 && member.performance.customerRating < 4.0 && ' • '}
                      {member.performance.customerRating < 4.0 && `${t('staffAdmin.card.rating')}: ${member.performance.customerRating.toFixed(1)}`}
                    </div>
                  </div>
                  <span className="text-warning text-sm">{t('staffAdmin.performance.needsAttention')}</span>
                </div>
              ))}
            {staff.filter(s => s.performance.punctualityScore < 80 || s.performance.customerRating < 4.0).length === 0 && (
              <div className="text-success text-center py-4">
                <span aria-hidden="true">🎉</span> {t('staffAdmin.performance.allGood')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
