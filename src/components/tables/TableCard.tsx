import React from 'react';
import type { Table } from '../../hooks/useTableManagement';

interface TableCardProps {
  table: Table;
  onEdit: (table: Table) => void;
  onDelete: (tableId: number) => void;
  onStatusChange: (tableId: number, status: Table['status']) => void;
  isLoading?: boolean;
  getStatusColor: (status: Table['status']) => string;
  getShapeIcon: (shape: Table['shape']) => string;
}

const TableCard: React.FC<TableCardProps> = ({
  table,
  onEdit,
  onDelete,
  onStatusChange,
  isLoading = false,
  getStatusColor,
  getShapeIcon
}) => {
  const handleDelete = () => {
    if (table.status === 'occupied') {
      alert('Cannot delete occupied table');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete "${table.name}"?`)) {
      onDelete(table.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border hover:shadow-md transition-shadow">
      {/* Table Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getShapeIcon(table.shape)}</span>
            <h3 className="font-semibold text-gray-900">{table.name}</h3>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(table.status)}`}>
            {table.status}
          </span>
        </div>
        <div className="text-sm text-gray-600 mt-1">
          👥 {table.capacity} seats • {table.shape}
        </div>
      </div>

      {/* Table Body */}
      <div className="p-4">
        {table.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{table.description}</p>
        )}

        {/* Current Order Info (if occupied) */}
        {table.currentOrder && table.status === 'occupied' && (
          <div className="mb-3 p-2 bg-red-50 rounded-lg border border-red-200">
            <div className="text-xs font-medium text-red-800 mb-1">Current Order</div>
            <div className="text-xs text-red-700">
              Order #{table.currentOrder.id} • {table.currentOrder.items} items • {table.currentOrder.total} MAD
              <br />
              Status: {table.currentOrder.status} • Since: {table.currentOrder.time}
            </div>
          </div>
        )}

        {/* Status Change Dropdown */}
        <div className="mb-3">
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Change Status:
          </label>
          <select
            value={table.status}
            onChange={(e) => onStatusChange(table.id, e.target.value as Table['status'])}
            className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            disabled={isLoading}
          >
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="reserved">Reserved</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(table)}
            className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            ✏️ Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded text-sm hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || table.status === 'occupied'}
            title={table.status === 'occupied' ? 'Cannot delete occupied table' : 'Delete table'}
          >
            🗑️ Delete
          </button>
        </div>

        {/* Quick Actions (if available) */}
        {table.status === 'available' && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="flex gap-2">
              <button
                onClick={() => onStatusChange(table.id, 'occupied')}
                className="flex-1 bg-green-100 text-green-700 px-3 py-1 rounded text-xs hover:bg-green-200 transition-colors"
                disabled={isLoading}
              >
                🍽️ Seat Guests
              </button>
              <button
                onClick={() => onStatusChange(table.id, 'reserved')}
                className="flex-1 bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs hover:bg-blue-200 transition-colors"
                disabled={isLoading}
              >
                📅 Reserve
              </button>
            </div>
          </div>
        )}

        {/* Occupied Actions */}
        {table.status === 'occupied' && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <button
              onClick={() => onStatusChange(table.id, 'available')}
              className="w-full bg-green-100 text-green-700 px-3 py-1 rounded text-xs hover:bg-green-200 transition-colors"
              disabled={isLoading}
            >
              ✅ Clear Table
            </button>
          </div>
        )}

        {/* Reserved Actions */}
        {table.status === 'reserved' && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="flex gap-2">
              <button
                onClick={() => onStatusChange(table.id, 'occupied')}
                className="flex-1 bg-green-100 text-green-700 px-3 py-1 rounded text-xs hover:bg-green-200 transition-colors"
                disabled={isLoading}
              >
                🍽️ Seat Now
              </button>
              <button
                onClick={() => onStatusChange(table.id, 'available')}
                className="flex-1 bg-gray-100 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-200 transition-colors"
                disabled={isLoading}
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        )}

        {/* Maintenance Actions */}
        {table.status === 'maintenance' && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <button
              onClick={() => onStatusChange(table.id, 'available')}
              className="w-full bg-green-100 text-green-700 px-3 py-1 rounded text-xs hover:bg-green-200 transition-colors"
              disabled={isLoading}
            >
              🔧 Mark Fixed
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableCard;