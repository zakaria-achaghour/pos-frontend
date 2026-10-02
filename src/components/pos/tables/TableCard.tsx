import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { StatusPill } from '@/components/kit';
import type { TableCardProps, TableStatus } from '@/types/table';
import { tableStatusLabel, tableStatusStyle } from './tableStatus';

const TableCard: React.FC<TableCardProps> = ({
  table,
  onEdit,
  onDelete,
  onStatusChange,
  isSelected = false,
  onSelect,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleCreateOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/orders/new', { state: { tableId: table.id } });
  };

  const header = (
    <>
      <div className="flex items-center gap-2">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600" aria-hidden="true"><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="5" width="14" height="14" rx={table.shape === 'round' ? 7 : 3}/><path d="M9 2h6M9 22h6M2 9v6M22 9v6"/></svg></span>
        <div className="text-start">
          <h3 className="font-semibold text-fg">{t('tableAdmin.card.title', { n: table.number })}</h3>
          <p className="text-sm text-fg-muted">{t('tables.seats', { count: table.capacity })}</p>
        </div>
      </div>
      <StatusPill style={tableStatusStyle(table.status)} label={tableStatusLabel(t, table.status)} size="sm" />
    </>
  );

  return (
    <div
      className={`bg-surface rounded-2xl p-5 border transition-colors hover:border-brand-300 ${
        isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-line'
      }`}
    >
      {/* Header */}
      {onSelect ? (
        <button
          type="button"
          onClick={onSelect}
          aria-pressed={isSelected}
          aria-label={t('tableAdmin.card.select', { n: table.number })}
          className="flex w-full items-start justify-between mb-3"
        >
          {header}
        </button>
      ) : (
        <div className="flex items-start justify-between mb-3">{header}</div>
      )}

      {/* Section/Location */}
      {table.section && (
        <div className="mb-3 text-sm text-fg-muted">
          <span className="font-medium">{t('tableAdmin.card.section')}:</span> {table.section}
          {table.floor && ` • ${t('tableAdmin.card.floor', { floor: table.floor })}`}
        </div>
      )}

      {/* Description */}
      {table.description && (
        <div className="mb-3 text-sm text-fg-muted line-clamp-2">
          {table.description}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-line">
        {/* Create Order Button (only for available or occupied tables) */}
        {(table.status === 'available' || table.status === 'occupied') && (
          <button
            type="button"
            onClick={handleCreateOrder}
            className="w-full px-3 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            {t('tableAdmin.card.createOrder')}
          </button>
        )}

        {/* Status and Actions Row */}
        <div className="flex flex-wrap gap-2">
          {onStatusChange && (
            <select
              value={table.status}
              aria-label={t('tableAdmin.card.changeStatus', { n: table.number })}
              onChange={(e) => {
                e.stopPropagation();
                onStatusChange(e.target.value as TableStatus);
              }}
              className="min-w-0 flex-1 text-sm px-2 py-1 border border-line rounded focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="available">{t('tableState.available')}</option>
              <option value="occupied">{t('tableState.occupied')}</option>
              <option value="reserved">{t('tableState.reserved')}</option>
              <option value="maintenance">{t('tableState.maintenance')}</option>
              <option value="out-of-order">{t('tableAdmin.outOfOrder')}</option>
            </select>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(table);
            }}
            className="px-3 py-1 text-sm font-medium text-primary hover:text-primary hover:bg-primary/15 rounded transition-colors"
          >
            {t('tableAdmin.card.edit')}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(table.id);
            }}
            className="px-3 py-1 text-sm font-medium text-danger hover:text-danger hover:bg-danger/15 rounded transition-colors"
          >
            {t('tableAdmin.card.delete')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableCard;
