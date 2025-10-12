import React from 'react';
import type { Table } from '../../hooks/useTableManagement';
import TableCard from './TableCard';

interface TableListProps {
  tables: Table[];
  onEdit: (table: Table) => void;
  onDelete: (tableId: number) => void;
  onStatusChange: (tableId: number, status: Table['status']) => void;
  isLoading?: boolean;
  getStatusColor: (status: Table['status']) => string;
  getShapeIcon: (shape: Table['shape']) => string;
}

const TableList: React.FC<TableListProps> = ({
  tables,
  onEdit,
  onDelete,
  onStatusChange,
  isLoading = false,
  getStatusColor,
  getShapeIcon
}) => {
  if (tables.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow border p-12">
        <div className="text-center">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tables found</h3>
          <p className="text-gray-600 mb-6">
            No tables match your current filters. Try adjusting your search criteria or create a new table.
          </p>
          <div className="text-sm text-gray-500">
            💡 Tip: Use the "Clear Filters" button to see all tables
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {tables.map((table) => (
        <TableCard
          key={table.id}
          table={table}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          isLoading={isLoading}
          getStatusColor={getStatusColor}
          getShapeIcon={getShapeIcon}
        />
      ))}
    </div>
  );
};

export default TableList;