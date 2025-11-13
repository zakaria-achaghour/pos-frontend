import React, { memo } from 'react';
import type { Table } from '@/types/table';

interface OrderFiltersProps {
  orderType: 'dine-in' | 'takeout' | 'delivery';
  selectedTable: number | '';
  customerName: string;
  priority: 'normal' | 'high' | 'urgent';
  searchTerm: string;
  tables: Table[];
  onOrderTypeChange: (type: 'dine-in' | 'takeout' | 'delivery') => void;
  onTableChange: (tableId: number) => void;
  onCustomerNameChange: (name: string) => void;
  onPriorityChange: (priority: 'normal' | 'high' | 'urgent') => void;
  onSearchChange: (term: string) => void;
}

const OrderFiltersComponent: React.FC<OrderFiltersProps> = ({
  orderType,
  selectedTable,
  customerName,
  priority,
  searchTerm,
  tables,
  onOrderTypeChange,
  onTableChange,
  onCustomerNameChange,
  onPriorityChange,
  onSearchChange,
}) => {
  return (
    <div className="p-4 border-b space-y-3">
      {/* Quick Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <select
          value={orderType}
          onChange={(e) => onOrderTypeChange(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="dine-in">🍽️ Dine-in</option>
          <option value="takeout">🥡 Takeout</option>
          <option value="delivery">🚚 Delivery</option>
        </select>

        {orderType === 'dine-in' && (
          <select
            value={selectedTable}
            onChange={(e) => onTableChange(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Table</option>
            {tables.map(table => (
              <option key={table.id} value={table.id}>
                Table {table.number}
              </option>
            ))}
          </select>
        )}

        <select
          value={priority}
          onChange={(e) => onPriorityChange(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="normal">🔵 Normal</option>
          <option value="high">🟡 High Priority</option>
          <option value="urgent">🔴 Urgent</option>
        </select>

        <input
          type="text"
          value={customerName}
          onChange={(e) => onCustomerNameChange(e.target.value)}
          placeholder="Customer name"
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Search */}
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="🔍 Search items..."
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

export const OrderFilters = memo(OrderFiltersComponent);
