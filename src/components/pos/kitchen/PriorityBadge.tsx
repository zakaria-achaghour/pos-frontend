import React from 'react';
import { BoltIcon, AlertIcon } from '@/icons';

interface PriorityBadgeProps {
  priority: 'normal' | 'rush' | 'urgent';
}

/**
 * Priority Badge Component
 * Displays order priority with icon
 */
const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const getPriorityStyle = () => {
    switch (priority) {
      case 'urgent':
        return {
          className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
          icon: AlertIcon,
        };
      case 'rush':
        return {
          className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
          icon: BoltIcon,
        };
      case 'normal':
      default:
        return null; // Don't show badge for normal priority
    }
  };

  const priorityStyle = getPriorityStyle();

  if (!priorityStyle) {
    return null;
  }

  const Icon = priorityStyle.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${priorityStyle.className}`}
    >
      <Icon className="h-3 w-3" />
      {priority.toUpperCase()}
    </span>
  );
};

export default PriorityBadge;
