import React from 'react';
import type { TableListProps } from '@/types/table';
import type { Table, TableStatus } from '@/types/table';
import TableCard from './TableCard';

interface TableListProps {
  tables: Table[];
  onEdit: (table: Table) => void;
  onDelete: (tableId: number) => void;
  onStatusChange: (tableId: number, status: TableStatus) => void;
  onSelectTable?: (tableId: number) => void;
  selectedTables?: number[];
  isLoading?: boolean;
  viewMode?: 'grid' | 'list';
  className?: string;
}

const TableList: React.FC<TableListProps> = ({
  tables,
  onEdit,
  onDelete,
  onStatusChange,
  onSelectTable,
  selectedTables = [],
  isLoading = false,
  viewMode = 'grid',
  className = ''
}) => {
  if (tables.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 dark:bg-gray-900 dark:border-gray-800">
        <div className="text-center">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tables found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            No tables match your current filters. Try adjusting your search criteria or create a new table to get started.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-sm mx-auto dark:bg-blue-900/20 dark:border-blue-800">
            <div className="text-sm text-blue-800 dark:text-blue-200">
              💡 <strong>Tip:</strong> Use the "Clear Filters" button to see all tables or click "Create Table" to add your first table.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const gridClasses = {
    grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
    list: 'grid grid-cols-1 lg:grid-cols-2 gap-4'
  };

  return (
    <div className={`${gridClasses[viewMode]} ${className}`}>
      {tables.map((table) => (
        <TableCard
          key={table.id}
          table={table}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          {...(onSelectTable && { onSelect: onSelectTable })}
          isSelected={selectedTables.includes(table.id)}
          isLoading={isLoading}
          className={viewMode === 'list' ? 'lg:col-span-1' : ''}
        />
      ))}
    </div>
  );
};

export default TableList;