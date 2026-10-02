import EmptyState from '@/components/common/EmptyState';
import { Skeleton } from '@/components/kit';
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
  isLoading = false,
  className = ''
}) => {
  const { t } = useTranslation();

  if (isLoading && tables.length === 0) return <div className="pos-card-grid" role="status" aria-label={t('common.loading')}>{[1, 2, 3].map(i => <Skeleton key={i} className="h-48"/>)}</div>;
  if (tables.length === 0) {
    return <EmptyState title={t('tableAdmin.list.emptyTitle')} description={t('tableAdmin.list.emptyBody')}/>;
  }

  const gridClasses = {
    grid: 'pos-card-grid',
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
