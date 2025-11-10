import React from 'react';
import type { KitchenTicket } from '@/store/slices/kitchenSlice';
import { TimeIcon, AlertIcon } from '@/icons';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';

interface KitchenTicketCardProps {
  ticket: KitchenTicket;
  onAction: (action: 'start' | 'ready' | 'complete') => void;
}

/**
 * Kitchen Ticket Card Component
 * Displays individual order ticket with actions
 */
const KitchenTicketCard: React.FC<KitchenTicketCardProps> = ({ ticket, onAction }) => {
  const getStatusColor = () => {
    switch (ticket.status) {
      case 'pending':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'preparing':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'ready':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      default:
        return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  const getActionButton = () => {
    switch (ticket.status) {
      case 'pending':
        return (
          <button
            onClick={() => onAction('start')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Start Preparation
          </button>
        );
      case 'preparing':
        return (
          <button
            onClick={() => onAction('ready')}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Mark as Ready
          </button>
        );
      case 'ready':
        return (
          <button
            onClick={() => onAction('complete')}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Complete
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`rounded-lg border-2 p-4 ${getStatusColor()} transition-all hover:shadow-md`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {ticket.order?.table_id ? `Table ${ticket.order.table_id}` : 'Takeout'} #{ticket.ticket_number}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Order #{ticket.order_id}</p>
        </div>
        <div className="flex flex-col gap-1 items-end">
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
        </div>
      </div>

      {/* Order Details - Placeholder for items */}
      <div className="mb-3 space-y-2">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Items: View in order details
        </p>
        {ticket.special_instructions && (
          <div className="flex items-start gap-2 bg-white/50 dark:bg-gray-900/50 rounded p-2">
            <AlertIcon className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {ticket.special_instructions}
            </p>
          </div>
        )}
      </div>

      {/* Meta Info */}
      <div className="flex items-center justify-between mb-3 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <TimeIcon className="h-4 w-4" />
          <span>
            {ticket.estimated_completion 
              ? new Date(ticket.estimated_completion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Not set'}
          </span>
        </div>
        {ticket.cooking_station && (
          <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-medium">
            {ticket.cooking_station}
          </span>
        )}
      </div>

      {/* Action Button */}
      {getActionButton()}
    </div>
  );
};

export default KitchenTicketCard;
