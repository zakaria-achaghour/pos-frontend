import React from 'react';
import type { StaffMember } from '../../types/staff';

interface StaffScheduleViewProps {
  staff: StaffMember[];
}

const days = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
] as const;

export default function StaffScheduleView({ staff }: StaffScheduleViewProps) {
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
        day: day.label,
        workingCount: workingStaff.length,
        totalHours: totalHours,
        coverage: workingStaff.length >= 3 ? 'good' : workingStaff.length >= 2 ? 'adequate' : 'low'
      };
    });
  };

  const scheduleSummary = getScheduleSummary();

  const getCoverageColor = (coverage: string) => {
    switch (coverage) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'adequate': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
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
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          📅 Weekly Coverage Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {scheduleSummary.map((day) => (
            <div key={day.day} className="text-center p-3 border rounded-lg">
              <div className="font-medium text-gray-900 mb-2">{day.day}</div>
              <div className="space-y-2">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getCoverageColor(day.coverage)}`}>
                  {getCoverageIcon(day.coverage)} {day.workingCount} staff
                </div>
                <div className="text-sm text-gray-600">
                  {day.totalHours.toFixed(1)}h total
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Schedule Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            🗓️ Detailed Schedule
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Staff Member</th>
                  {days.map((day) => (
                    <th key={day.key} className="text-center p-3 font-medium min-w-[120px]">
                      {day.label}
                    </th>
                  ))}
                  <th className="text-center p-3 font-medium">Total Hours</th>
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
                    <tr key={member.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-xs text-gray-600">{member.role}</div>
                          </div>
                        </div>
                      </td>
                      {days.map((day) => {
                        const shift = member.shiftSchedule[day.key as keyof typeof member.shiftSchedule];
                        return (
                          <td key={day.key} className="p-3 text-center">
                            {shift.isWorking ? (
                              <div className="text-green-600">
                                <div className="font-medium">{shift.start} - {shift.end}</div>
                                <div className="text-xs">
                                  {(() => {
                                    const start = new Date(`2000-01-01T${shift.start}:00`);
                                    const end = new Date(`2000-01-01T${shift.end}:00`);
                                    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                                    return `${hours}h`;
                                  })()}
                                </div>
                              </div>
                            ) : (
                              <div className="text-gray-400 text-xs">Off</div>
                            )}
                          </td>
                        );
                      })}
                      <td className="p-3 text-center">
                        <div className="font-medium">{weeklyHours.toFixed(1)}h</div>
                        <div className="text-xs text-gray-600">
                          {weeklyHours > 40 ? 'Overtime' : weeklyHours < 20 ? 'Part-time' : 'Regular'}
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
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-semibold mb-4 text-red-600">⚠️ Coverage Alerts</h4>
          <div className="space-y-3">
            {scheduleSummary
              .filter(day => day.coverage === 'low')
              .map((day) => (
                <div key={day.day} className="flex items-center justify-between">
                  <span className="font-medium">{day.day}</span>
                  <span className="text-red-600 text-sm">Only {day.workingCount} staff</span>
                </div>
              ))}
            {scheduleSummary.filter(day => day.coverage === 'low').length === 0 && (
              <div className="text-green-600 text-center py-4">
                ✅ All days have adequate coverage
              </div>
            )}
          </div>
        </div>

        {/* Overtime Staff */}
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-semibold mb-4 text-orange-600">⏰ Overtime Staff</h4>
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
                    <span className="text-orange-600 text-sm">{weeklyHours.toFixed(1)}h</span>
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
              <div className="text-green-600 text-center py-4">
                ✅ No overtime scheduled
              </div>
            )}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-semibold mb-4 text-blue-600">📍 Today's Schedule</h4>
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
                        <span className="text-xs text-gray-600">({member.role})</span>
                      </div>
                      <span className="text-blue-600 text-sm">
                        {shift.start} - {shift.end}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-gray-600 text-center py-4">
                  No staff scheduled for today
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}