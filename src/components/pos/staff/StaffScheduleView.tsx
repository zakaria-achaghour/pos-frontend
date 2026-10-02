import { dynamicT } from '@/i18n/dynamic';
import { useTranslation } from 'react-i18next';
import type { StaffScheduleViewProps } from '@/types/staff';
import type { StaffMember } from '@/types/staff';

const days = [
  { key: 'monday' },
  { key: 'tuesday' },
  { key: 'wednesday' },
  { key: 'thursday' },
  { key: 'friday' },
  { key: 'saturday' },
  { key: 'sunday' }
] as const;

export default function StaffScheduleView({ staff }: StaffScheduleViewProps) {
  const { t } = useTranslation();
  const dayLabel = (key: (typeof days)[number]['key']) => dynamicT(`staffAdmin.schedule.days.${key}`);
  // Get schedule summary for each day
  const getScheduleSummary = () => {
    return days.map(day => {
      const workingStaff = staff.filter(member =>
        member.shiftSchedule[day.key as keyof typeof member.shiftSchedule].isWorking
      );

      const totalHours = workingStaff.reduce((sum, member) => {
        const shift = member.shiftSchedule[day.key as keyof typeof member.shiftSchedule];
        if (!shift.isWorking) return sum;

        const start = new Date(`2000-01-01T${shift.start}:00`);
        const end = new Date(`2000-01-01T${shift.end}:00`);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        return sum + hours;
      }, 0);

      return {
        day: dayLabel(day.key),
        workingCount: workingStaff.length,
        totalHours: totalHours,
        coverage: workingStaff.length >= 3 ? 'good' : workingStaff.length >= 2 ? 'adequate' : 'low'
      };
    });
  };

  const scheduleSummary = getScheduleSummary();

  const getCoverageColor = (coverage: string) => {
    switch (coverage) {
      case 'good': return 'text-success bg-success/10';
      case 'adequate': return 'text-warning bg-warning/10';
      case 'low': return 'text-danger bg-danger/10';
      default: return 'text-fg-muted bg-surface-2';
    }
  };

  const getCoverageIcon = (coverage: string) => {
    switch (coverage) {
      case 'good': return '✅';
      case 'adequate': return '⚠️';
      case 'low': return '❌';
      default: return '➖';
    }
  };

  return (
    <div className="space-y-6">
      {/* Weekly Coverage Summary */}
      <div className="bg-surface rounded-2xl shadow-sm p-6 border border-line">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span aria-hidden="true">📅</span> {t('staffAdmin.schedule.weeklyCoverage')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {scheduleSummary.map((day) => (
            <div key={day.day} className="text-center p-3 border rounded-lg">
              <div className="font-medium text-fg mb-2">{day.day}</div>
              <div className="space-y-2">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getCoverageColor(day.coverage)}`}>
                  <span aria-hidden="true">{getCoverageIcon(day.coverage)}</span> {t('staffAdmin.schedule.staffCount', { count: day.workingCount })}
                </div>
                <div className="text-sm text-fg-muted">
                  {t('staffAdmin.schedule.hoursTotal', { hours: day.totalHours.toFixed(1) })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Schedule Table */}
      <div className="bg-surface rounded-2xl shadow-sm border border-line">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span aria-hidden="true">🗓️</span> {t('staffAdmin.schedule.detailed')}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-start p-3 font-medium">{t('staffAdmin.schedule.staffMember')}</th>
                  {days.map((day) => (
                    <th key={day.key} className="text-center p-3 font-medium min-w-[120px]">
                      {dayLabel(day.key)}
                    </th>
                  ))}
                  <th className="text-center p-3 font-medium">{t('staffAdmin.schedule.totalHours')}</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((member) => {
                  const weeklyHours = Object.values(member.shiftSchedule).reduce((sum, shift) => {
                    if (!shift.isWorking) return sum;
                    const start = new Date(`2000-01-01T${shift.start}:00`);
                    const end = new Date(`2000-01-01T${shift.end}:00`);
                    return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                  }, 0);

                  return (
                    <tr key={member.id} className="border-b hover:bg-bg">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-line rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-fg-muted">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-xs text-fg-muted">{dynamicT(`roles.${member.role}`, { defaultValue: member.role })}</div>
                          </div>
                        </div>
                      </td>
                      {days.map((day) => {
                        const shift = member.shiftSchedule[day.key as keyof typeof member.shiftSchedule];
                        return (
                          <td key={day.key} className="p-3 text-center">
                            {shift.isWorking ? (
                              <div className="text-success">
                                <div className="font-medium">{shift.start} - {shift.end}</div>
                                <div className="text-xs">
                                  {(() => {
                                    const start = new Date(`2000-01-01T${shift.start}:00`);
                                    const end = new Date(`2000-01-01T${shift.end}:00`);
                                    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                                    return t('staffAdmin.schedule.hours', { hours });
                                  })()}
                                </div>
                              </div>
                            ) : (
                              <div className="text-fg-muted text-xs">{t('staffAdmin.schedule.off')}</div>
                            )}
                          </td>
                        );
                      })}
                      <td className="p-3 text-center">
                        <div className="font-medium">{t('staffAdmin.schedule.hours', { hours: weeklyHours.toFixed(1) })}</div>
                        <div className="text-xs text-fg-muted">
                          {weeklyHours > 40 ? t('staffAdmin.schedule.overtime') : weeklyHours < 20 ? t('staffAdmin.schedule.partTime') : t('staffAdmin.schedule.regular')}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Schedule Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Coverage Alerts */}
        <div className="bg-surface rounded-2xl shadow-sm p-6 border border-line">
          <h4 className="font-semibold mb-4 text-danger"><span aria-hidden="true">⚠️</span> {t('staffAdmin.schedule.coverageAlerts')}</h4>
          <div className="space-y-3">
            {scheduleSummary
              .filter(day => day.coverage === 'low')
              .map((day) => (
                <div key={day.day} className="flex items-center justify-between">
                  <span className="font-medium">{day.day}</span>
                  <span className="text-danger text-sm">{t('staffAdmin.schedule.onlyStaff', { count: day.workingCount })}</span>
                </div>
              ))}
            {scheduleSummary.filter(day => day.coverage === 'low').length === 0 && (
              <div className="text-success text-center py-4">
                <span aria-hidden="true">✅</span> {t('staffAdmin.schedule.allCovered')}
              </div>
            )}
          </div>
        </div>

        {/* Overtime Staff */}
        <div className="bg-surface rounded-2xl shadow-sm p-6 border border-line">
          <h4 className="font-semibold mb-4 text-warning"><span aria-hidden="true">⏰</span> {t('staffAdmin.schedule.overtimeStaff')}</h4>
          <div className="space-y-3">
            {staff
              .filter(member => {
                const weeklyHours = Object.values(member.shiftSchedule).reduce((sum, shift) => {
                  if (!shift.isWorking) return sum;
                  const start = new Date(`2000-01-01T${shift.start}:00`);
                  const end = new Date(`2000-01-01T${shift.end}:00`);
                  return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                }, 0);
                return weeklyHours > 40;
              })
              .map((member) => {
                const weeklyHours = Object.values(member.shiftSchedule).reduce((sum, shift) => {
                  if (!shift.isWorking) return sum;
                  const start = new Date(`2000-01-01T${shift.start}:00`);
                  const end = new Date(`2000-01-01T${shift.end}:00`);
                  return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                }, 0);
                return (
                  <div key={member.id} className="flex items-center justify-between">
                    <span className="font-medium">{member.name}</span>
                    <span className="text-warning text-sm">{t('staffAdmin.schedule.hours', { hours: weeklyHours.toFixed(1) })}</span>
                  </div>
                );
              })}
            {staff.filter(member => {
              const weeklyHours = Object.values(member.shiftSchedule).reduce((sum, shift) => {
                if (!shift.isWorking) return sum;
                const start = new Date(`2000-01-01T${shift.start}:00`);
                const end = new Date(`2000-01-01T${shift.end}:00`);
                return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
              }, 0);
              return weeklyHours > 40;
            }).length === 0 && (
              <div className="text-success text-center py-4">
                <span aria-hidden="true">✅</span> {t('staffAdmin.schedule.noOvertime')}
              </div>
            )}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-surface rounded-2xl shadow-sm p-6 border border-line">
          <h4 className="font-semibold mb-4 text-primary"><span aria-hidden="true">📍</span> {t('staffAdmin.schedule.today')}</h4>
          <div className="space-y-3">
            {(() => {
              const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof StaffMember['shiftSchedule'];
              const todayStaff = staff.filter(member =>
                member.shiftSchedule[today]?.isWorking
              );

              return todayStaff.length > 0 ? (
                todayStaff.map((member) => {
                  const shift = member.shiftSchedule[today];
                  return (
                    <div key={member.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{member.name}</span>
                        <span className="text-xs text-fg-muted">({dynamicT(`roles.${member.role}`, { defaultValue: member.role })})</span>
                      </div>
                      <span className="text-primary text-sm">
                        {shift.start} - {shift.end}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-fg-muted text-center py-4">
                  {t('staffAdmin.schedule.noneToday')}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
