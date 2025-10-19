import React from 'react';
import type { Table, TableStatus, TableShape } from '../../types/table';

interface TableCardProps {
  table: Table;
  onEdit: (table: Table) => void;
  onDelete: (tableId: number) => void;
  onStatusChange: (tableId: number, status: TableStatus) => void;
  onSelect?: (tableId: number) => void;
  isSelected?: boolean;
  isLoading?: boolean;
  className?: string;
}

const TableCard: React.FC<TableCardProps> = ({
  table,
  onEdit,
  onDelete,
  onStatusChange,
  onSelect,
  isSelected = false,
  isLoading = false,
  className = ''
}) => {
  const getStatusColor = (status: TableStatus): string => {
    const colors = {
      available: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      occupied: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      reserved: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      cleaning: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'out-of-order': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      maintenance: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    };
    return colors[status] || colors.available;
  };

  const getShapeIcon = (shape: TableShape): string => {
    const icons = {
      round: '⭕',
      square: '⬜',
      rectangular: '▭',
      rectangle: '▭'
    };
    return icons[shape] || '▭';
  };

  const getStatusIcon = (status: TableStatus): string => {
    const icons = {
      available: '✅',
      occupied: '🔴',
      reserved: '🟡',
      cleaning: '🧽',
      'out-of-order': '⚠️',
      maintenance: '🔧'
    };
    return icons[status] || '❓';
  };

  const handleDelete = () => {
    if (table.status === 'occupied') {
      alert('Cannot delete occupied table with active order');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete table "${table.number}"?`)) {
      onDelete(table.id);
    }
  };

  const canDelete = !['occupied'].includes(table.status);
  const canEdit = !isLoading;

  return (
    <div className={`
      bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5
      dark:bg-gray-800 dark:border-gray-700
      ${isSelected ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border-gray-200'}
      ${className}
    `}>
      {/* Table Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect(table.id)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
            )}
            <div className="flex items-center gap-2">
              <span className="text-lg">{getShapeIcon(table.shape)}</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {table.number}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {table.location?.section || 'No Section'} • Floor {table.location?.floor || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(table.status)}`}>
              {getStatusIcon(table.status)} {table.status.replace('-', ' ')}
            </span>
          </div>
        </div>
        
        <div className="mt-3 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span className="flex items-center gap-1">
            👥 {table.capacity} seat{table.capacity !== 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1">
            🔲 {table.shape}
          </span>
          {table.assignedWaiter && (
            <span className="flex items-center gap-1">
              👨‍💼 Waiter #{table.assignedWaiter}
            </span>
          )}
        </div>
      </div>

      {/* Table Body */}
      <div className="p-4">
        {/* Description */}
        {table.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            📝 {table.description}
          </p>
        )}

        {/* Features */}
        {table.features && table.features.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {table.features.slice(0, 3).map((feature, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded dark:bg-gray-700 dark:text-gray-300"
                >
                  ✨ {feature}
                </span>
              ))}
              {table.features.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded dark:bg-gray-700 dark:text-gray-300">
                  +{table.features.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Current Order Info (if occupied) */}
        {table.currentOrder && table.status === 'occupied' && (
          <div className="mb-3 p-3 bg-red-50 rounded-lg border border-red-200 dark:bg-red-900/20 dark:border-red-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-xs font-medium text-red-800 dark:text-red-200">🍽️ Active Order</div>
            </div>
            <div className="text-xs text-red-700 dark:text-red-300 space-y-1">
              <div>Order #{table.currentOrder}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Started: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        )}

        {/* Reservations Info */}
        {table.reservations && table.reservations.length > 0 && (
          <div className="mb-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
            <div className="text-xs font-medium text-yellow-800 dark:text-yellow-200 mb-1">
              📅 Upcoming Reservations
            </div>
            <div className="text-xs text-yellow-700 dark:text-yellow-300">
              {table.reservations.slice(0, 2).map((reservation, index) => (
                <div key={index}>
                  {reservation.customerName} - {reservation.guestCount} guests
                </div>
              ))}
              {table.reservations.length > 2 && (
                <div>+{table.reservations.length - 2} more...</div>
              )}
            </div>
          </div>
        )}

        {/* Quick Status Change */}
        <div className="mb-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
            Quick Actions:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {/* Status-specific actions */}
            {table.status === 'available' && (
              <>
                <button
                  onClick={() => onStatusChange(table.id, 'occupied')}
                  className="px-3 py-2 bg-green-100 text-green-700 text-sm rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
                  disabled={isLoading}
                >
                  🍽️ Seat Guests
                </button>
                <button
                  onClick={() => onStatusChange(table.id, 'reserved')}
                  className="px-3 py-2 bg-blue-100 text-blue-700 text-sm rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                  disabled={isLoading}
                >
                  📅 Reserve
                </button>
              </>
            )}

            {table.status === 'occupied' && (
              <>
                <button
                  onClick={() => onStatusChange(table.id, 'cleaning')}
                  className="px-3 py-2 bg-blue-100 text-blue-700 text-sm rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                  disabled={isLoading}
                >
                  🧽 Needs Cleaning
                </button>
                <button
                  onClick={() => onStatusChange(table.id, 'available')}
                  className="px-3 py-2 bg-green-100 text-green-700 text-sm rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
                  disabled={isLoading}
                >
                  ✅ Clear Table
                </button>
              </>
            )}

            {table.status === 'reserved' && (
              <>
                <button
                  onClick={() => onStatusChange(table.id, 'occupied')}
                  className="px-3 py-2 bg-green-100 text-green-700 text-sm rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
                  disabled={isLoading}
                >
                  🍽️ Seat Now
                </button>
                <button
                  onClick={() => onStatusChange(table.id, 'available')}
                  className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  disabled={isLoading}
                >
                  ❌ Cancel
                </button>
              </>
            )}

            {table.status === 'cleaning' && (
              <button
                onClick={() => onStatusChange(table.id, 'available')}
                className="col-span-2 px-3 py-2 bg-green-100 text-green-700 text-sm rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
                disabled={isLoading}
              >
                ✅ Mark Clean
              </button>
            )}

            {['maintenance', 'out-of-order'].includes(table.status) && (
              <button
                onClick={() => onStatusChange(table.id, 'available')}
                className="col-span-2 px-3 py-2 bg-green-100 text-green-700 text-sm rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
                disabled={isLoading}
              >
                🔧 Mark Fixed
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={() => onEdit(table)}
            className="flex-1 bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
            disabled={!canEdit}
          >
            ✏️ Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
            disabled={!canDelete || isLoading}
            title={!canDelete ? 'Cannot delete occupied table' : 'Delete table'}
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableCard;