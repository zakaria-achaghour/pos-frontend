import React from 'react';
import type { KitchenAnalytics } from '@/types/kitchen';
import { TimeIcon, CheckCircleIcon, AlertIcon, ArrowUpIcon } from '@/icons';

interface KitchenStatsProps {
  analytics: KitchenAnalytics | null;
}

/**
 * Kitchen Statistics Dashboard
 * Displays key performance metrics
 */
const KitchenStats: React.FC<KitchenStatsProps> = ({ analytics }) => {
  if (!analytics) {
    return null;
  }

  const stats = [
    {
      label: 'Pending Orders',
      value: analytics.pending_tickets,
      icon: AlertIcon,
      color: 'text-red-600 bg-red-100 dark:bg-red-900/20',
    },
    {
      label: 'In Preparation',
      value: analytics.preparing_tickets,
      icon: TimeIcon,
      color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20',
    },
    {
      label: 'Completed Today',
      value: analytics.completed_tickets,
      icon: CheckCircleIcon,
      color: 'text-green-600 bg-green-100 dark:bg-green-900/20',
    },
    {
      label: 'Avg Prep Time',
      value: `${analytics.average_prep_time}m`,
      icon: ArrowUpIcon,
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KitchenStats;
