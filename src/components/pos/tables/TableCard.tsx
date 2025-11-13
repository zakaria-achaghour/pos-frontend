import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { TableCardProps } from '@/types/table';

const TableCard: React.FC<TableCardProps> = ({
  table,
  onEdit,
  onDelete,
  onStatusChange,
  isSelected = false,
  onSelect,
}) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'occupied':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'reserved':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cleaning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getShapeIcon = (shape: string) => {
    switch (shape) {
      case 'round':
        return '⭕';
      case 'square':
        return '⬜';
      case 'rectangle':
        return '▭';
      default:
        return '⬜';
    }
  };

  const handleCreateOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/orders/new', { state: { tableId: table.id } });
  };

  return (
    <div
      className={`bg-white rounded-lg shadow p-4 border-2 transition-all hover:shadow-lg ${
        isSelected ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200'
      }`}
      onClick={onSelect}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getShapeIcon(table.shape)}</span>
          <div>
            <h3 className="font-semibold text-gray-900">Table {table.number}</h3>
            <p className="text-sm text-gray-500">
              {table.capacity} {table.capacity === 1 ? 'seat' : 'seats'}
            </p>
          </div>
        </div>
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
            table.status
          )}`}
        >
          {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
        </span>
      </div>

      {/* Section/Location */}
      {table.section && (
        <div className="mb-3 text-sm text-gray-600">
          <span className="font-medium">Section:</span> {table.section}
          {table.floor && ` • Floor ${table.floor}`}
        </div>
      )}

      {/* Description */}
      {table.description && (
        <div className="mb-3 text-sm text-gray-600 line-clamp-2">
          {table.description}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-gray-100">
        {/* Create Order Button (only for available or occupied tables) */}
        {(table.status === 'available' || table.status === 'occupied') && (
          <button
            onClick={handleCreateOrder}
            className="w-full px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Create Order
          </button>
        )}
        
        {/* Status and Actions Row */}
        <div className="flex gap-2">
          {onStatusChange && (
            <select
              value={table.status}
              onChange={(e) => {
                e.stopPropagation();
                onStatusChange(e.target.value as any);
              }}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 text-sm px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="reserved">Reserved</option>
              <option value="maintenance">Maintenance</option>
              <option value="out-of-order">Out of Order</option>
            </select>
          )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(table);
          }}
          className="px-3 py-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded transition-colors"
        >
          Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(table.id);
          }}
          className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
        >
          Delete
        </button>
        </div>
      </div>
    </div>
  );
};

export default TableCard;
