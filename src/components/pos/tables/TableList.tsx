import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Table, TableStatus } from '@/types/table';
import TableCard from './TableCard';

interface TableListComponentProps {
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

const TableList: React.FC<TableListComponentProps> = ({
  tables,
  onEdit,
  onDelete,
  onStatusChange,
  onSelectTable,
  selectedTables = [],
  viewMode = 'grid',
  className = ''
}) => {
  const { t } = useTranslation();

  if (tables.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 dark:bg-gray-900 dark:border-gray-800">
        <div className="text-center">
          <div className="text-6xl mb-4" aria-hidden="true">🍽️</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('tableAdmin.list.emptyTitle')}</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            {t('tableAdmin.list.emptyBody')}
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-sm mx-auto dark:bg-blue-900/20 dark:border-blue-800">
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <span aria-hidden="true">💡 </span><strong>{t('tableAdmin.list.tipLabel')}</strong> {t('tableAdmin.list.tip')}
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
          onStatusChange={(status) => onStatusChange(table.id, status)}
          {...(onSelectTable && { onSelect: () => onSelectTable(table.id) })}
          isSelected={selectedTables.includes(table.id)}
        />
      ))}
    </div>
  );
};

export default TableList;