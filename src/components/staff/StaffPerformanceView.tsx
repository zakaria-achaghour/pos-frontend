import React from 'react';
import type { StaffMember } from '../../types/staff';

interface StaffPerformanceViewProps {
  staff: StaffMember[];
}

export default function StaffPerformanceView({ staff }: StaffPerformanceViewProps) {
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
    
    if (avgScore >= 90) return { grade: 'A+', color: 'text-green-600', bg: 'bg-green-100' };
    if (avgScore >= 80) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-100' };
    if (avgScore >= 70) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (avgScore >= 60) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { grade: 'D', color: 'text-red-600', bg: 'bg-red-100' };
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
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          📊 Team Performance Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{teamStats.totalOrders}</div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              MAD {teamStats.totalRevenue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              ⭐ {teamStats.avgRating.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Avg Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{teamStats.avgPunctuality.toFixed(0)}%</div>
            <div className="text-sm text-gray-600">Avg Punctuality</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              MAD {teamStats.totalTips.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Tips</div>
          </div>
        </div>
      </div>

      {/* Individual Performance Rankings */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            🏆 Performance Rankings
          </h3>
          <div className="space-y-4">
            {sortedByPerformance.map((member, index) => {
              const grade = getPerformanceGrade(member);
              return (
                <div 
                  key={member.id} 
                  className={`flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow ${
                    index < 3 ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">
                      {getPerformanceRank(index)}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-gray-600">{member.role}</div>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${grade.bg} ${grade.color}`}>
                      Grade: {grade.grade}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-6 text-center">
                    <div>
                      <div className="text-lg font-bold">{member.performance.ordersCompleted}</div>
                      <div className="text-xs text-gray-600">Orders</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">
                        MAD {member.performance.revenueGenerated.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600">Revenue</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">
                        ⭐ {member.performance.customerRating.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-600">Rating</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{member.performance.punctualityScore}%</div>
                      <div className="text-xs text-gray-600">Punctuality</div>
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
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-semibold mb-4 text-green-600">🌟 Top Performers</h4>
          <div className="space-y-3">
            {sortedByPerformance.slice(0, 3).map((member, index) => (
              <div key={member.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{getPerformanceRank(index)}</span>
                  <span className="font-medium">{member.name}</span>
                </div>
                <span className="text-green-600 font-medium">
                  MAD {member.performance.revenueGenerated.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Areas for Improvement */}
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-semibold mb-4 text-orange-600">📈 Areas for Improvement</h4>
          <div className="space-y-3">
            {staff
              .filter(s => s.performance.punctualityScore < 80 || s.performance.customerRating < 4.0)
              .slice(0, 3)
              .map((member) => (
                <div key={member.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-gray-600">
                      {member.performance.punctualityScore < 80 && 'Punctuality: ' + member.performance.punctualityScore + '%'}
                      {member.performance.punctualityScore < 80 && member.performance.customerRating < 4.0 && ' • '}
                      {member.performance.customerRating < 4.0 && 'Rating: ' + member.performance.customerRating.toFixed(1)}
                    </div>
                  </div>
                  <span className="text-orange-600 text-sm">Needs attention</span>
                </div>
              ))}
            {staff.filter(s => s.performance.punctualityScore < 80 || s.performance.customerRating < 4.0).length === 0 && (
              <div className="text-green-600 text-center py-4">
                🎉 All staff performing well!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}