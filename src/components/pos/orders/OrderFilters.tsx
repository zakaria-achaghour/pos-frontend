import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';
import type { Table } from '@/types/table';

type OrderType = 'dine-in' | 'takeout' | 'delivery';
type Priority = 'normal' | 'rush' | 'urgent';

interface OrderFiltersProps {
  orderType: OrderType;
  selectedTable: number | '';
  customerName: string;
  priority: Priority;
  searchTerm: string;
  tables: Table[];
  onOrderTypeChange: (type: OrderType) => void;
  onTableChange: (tableId: number) => void;
  onCustomerNameChange: (name: string) => void;
  onPriorityChange: (priority: Priority) => void;
  onSearchChange: (term: string) => void;
}

const ORDER_TYPES: OrderType[] = ['dine-in', 'takeout', 'delivery'];
const TYPE_KEY: Record<OrderType, 'order.type.dineIn' | 'order.type.takeout' | 'order.type.delivery'> = {
  'dine-in': 'order.type.dineIn',
  takeout: 'order.type.takeout',
  delivery: 'order.type.delivery',
};

const field =
  'h-12 w-full rounded-xl border border-line bg-surface px-3 text-base text-fg placeholder:text-fg-muted';

const OrderFiltersComponent = ({
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
}: OrderFiltersProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      {/* Order type: one tap, large targets */}
      <div role="radiogroup" aria-label={t('order.typeLabel')} className="grid grid-cols-3 gap-2">
        {ORDER_TYPES.map((type) => {
          const selected = orderType === type;
          return (
            <button
              key={type}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onOrderTypeChange(type)}
              className={twMerge(
                'min-h-12 rounded-xl px-2 text-base font-semibold ring-1 transition-colors',
                selected ? 'bg-primary text-primary-fg ring-primary' : 'bg-surface text-fg ring-line hover:bg-surface-2'
              )}
            >
              {t(TYPE_KEY[type])}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 2xl:grid-cols-3">
        {orderType === 'dine-in' && (
          <label className="flex flex-col gap-1 text-sm font-medium text-fg-muted">
            {t('order.table')}
            <select
              value={selectedTable}
              onChange={(e) => onTableChange(Number(e.target.value))}
              className={field}
            >
              <option value="">{t('order.selectTable')}</option>
              {tables.map((table) => (
                <option key={table.id} value={table.id}>
                  {t('order.tableNumber', { n: table.number })}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="flex flex-col gap-1 text-sm font-medium text-fg-muted">
          {t('order.priority')}
          <select value={priority} onChange={(e) => onPriorityChange(e.target.value as Priority)} className={field}>
            <option value="normal">{t('priority.normal')}</option>
            <option value="rush">{t('priority.rush')}</option>
            <option value="urgent">{t('priority.urgent')}</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-fg-muted">
          {t('order.customer')}
          <input
            type="text"
            value={customerName}
            onChange={(e) => onCustomerNameChange(e.target.value)}
            className={field}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium text-fg-muted">
        <span className="sr-only">{t('menu.search')}</span>
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('menu.search')}
          className={twMerge(field, 'text-lg')}
        />
      </label>
    </div>
  );
};

export const OrderFilters = memo(OrderFiltersComponent);
