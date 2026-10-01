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

  const header = (
    <>
      <div className="flex items-center gap-2">
        <span className="text-2xl" aria-hidden="true">{getShapeIcon(table.shape)}</span>
        <div className="text-start">
          <h3 className="font-semibold text-gray-900">{t('tableAdmin.card.title', { n: table.number })}</h3>
          <p className="text-sm text-gray-500">{t('tables.seats', { count: table.capacity })}</p>
        </div>
      </div>
      <StatusPill style={tableStatusStyle(table.status)} label={tableStatusLabel(t, table.status)} size="sm" />
    </>
  );

  return (
    <div
      className={`bg-white rounded-lg shadow p-4 border-2 transition-all hover:shadow-lg ${
        isSelected ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200'
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
        <div className="mb-3 text-sm text-gray-600">
          <span className="font-medium">{t('tableAdmin.card.section')}:</span> {table.section}
          {table.floor && ` • ${t('tableAdmin.card.floor', { floor: table.floor })}`}
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
            type="button"
            onClick={handleCreateOrder}
            className="w-full px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            {t('tableAdmin.card.createOrder')}
          </button>
        )}

        {/* Status and Actions Row */}
        <div className="flex gap-2">
          {onStatusChange && (
            <select
              value={table.status}
              aria-label={t('tableAdmin.card.changeStatus', { n: table.number })}
              onChange={(e) => {
                e.stopPropagation();
                onStatusChange(e.target.value as TableStatus);
              }}
              className="flex-1 text-sm px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
            className="px-3 py-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded transition-colors"
          >
            {t('tableAdmin.card.edit')}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(table.id);
            }}
            className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
          >
            {t('tableAdmin.card.delete')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableCard;
