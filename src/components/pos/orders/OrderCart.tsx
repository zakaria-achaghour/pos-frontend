import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/kit';
import { extraLabel } from '@/lib/extras';
import { formatMoney } from '@/lib/money';

interface CartItem {
  line_id: string;
  menu_item_id: number;
  name: string;
  price: number;
  quantity: number;
  special_instructions?: string;
  removed_ingredients?: string[];
  added_extras?: string[];
}

interface OrderCartProps {
  cart: CartItem[];
  onUpdateQuantity: (lineId: string, newQuantity: number) => void;
  onRemoveItem: (lineId: string) => void;
  onEditItem?: (index: number) => void;
  onClear?: () => void;
  onPlaceOrder: () => void;
  loading: boolean;
  /** what the CTA says: "Send to kitchen" for dine-in, "Place order" otherwise */
  placeLabel: string;
  /** order context shown at the top of the cart, e.g. "Dine-in" and "Table 4" */
  summary?: { typeLabel: string; tableLabel?: string | undefined };
}

const stepperButton =
  'flex h-12 w-12 items-center justify-center rounded-lg text-2xl font-bold text-fg hover:bg-surface-2 disabled:opacity-40';
const iconButton =
  'flex h-11 w-11 items-center justify-center rounded-lg text-fg-muted hover:bg-surface-2 hover:text-fg';

const OrderCartComponent = ({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onEditItem,
  onClear,
  onPlaceOrder,
  loading,
  placeLabel,
  summary,
}: OrderCartProps) => {
  const { t } = useTranslation();
  const itemCount = cart.reduce((n, item) => n + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-surface text-fg">
      {/* Header: what this order is */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-lg font-bold">{t('cart.title')}</h2>
          {summary && (
            <p className="truncate text-sm text-fg-muted">
              {summary.typeLabel}
              {summary.tableLabel ? ` · ${summary.tableLabel}` : ''}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-9 min-w-9 items-center justify-center rounded-full bg-primary px-2 text-sm font-bold text-primary-fg">
            {itemCount}
          </span>
          {onClear && cart.length > 0 && (
            <Button variant="ghost" size="md" onClick={onClear}>
              {t('cart.clear')}
            </Button>
          )}
        </div>
      </div>

      {/* Lines */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {cart.length === 0 ? (
          <div className="flex h-full min-h-40 flex-col items-center justify-center text-center text-fg-muted">
            <p className="text-base font-semibold text-fg">{t('cart.empty')}</p>
            <p className="text-sm">{t('cart.emptyHint')}</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {cart.map((item, index) => (
              <li key={item.line_id} className="rounded-xl bg-surface-2 p-3">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold leading-snug">{item.name}</p>
                    <p className="text-sm text-fg-muted">{formatMoney(item.price)}</p>
                    {item.removed_ingredients && item.removed_ingredients.length > 0 && (
                      <p className="mt-1 text-sm font-medium text-danger">
                        ✕ {t('cart.no', { items: item.removed_ingredients.join(', ') })}
                      </p>
                    )}
                    {item.added_extras && item.added_extras.length > 0 && (
                      <p className="mt-1 text-sm font-medium text-success">
                        ＋ {t('cart.extra', { items: item.added_extras.map((e) => extraLabel(t, e)).join(', ') })}
                      </p>
                    )}
                    {item.special_instructions && (
                      <p className="mt-1 text-sm italic text-fg-muted">“{item.special_instructions}”</p>
                    )}
                  </div>
                  <div className="flex shrink-0">
                    {onEditItem && (
                      <button type="button" onClick={() => onEditItem(index)} aria-label={t('cart.edit', { name: item.name })} className={iconButton}>
                        <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
                    <button type="button" onClick={() => onRemoveItem(item.line_id)} aria-label={t('cart.remove', { name: item.name })} className={iconButton}>
                      <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center rounded-xl bg-surface ring-1 ring-line">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.line_id, item.quantity - 1)}
                      aria-label={t('cart.decrease', { name: item.name })}
                      className={stepperButton}
                    >
                      −
                    </button>
                    <span className="min-w-10 text-center text-lg font-bold tabular-nums" aria-live="polite">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.line_id, item.quantity + 1)}
                      aria-label={t('cart.increase', { name: item.name })}
                      className={stepperButton}
                    >
                      +
                    </button>
                  </div>
                  <p className="text-pos-price font-bold">{formatMoney(item.price * item.quantity)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Totals + CTA */}
      <div className="shrink-0 space-y-3 border-t border-line px-4 py-4">
        <div className="flex items-baseline justify-between">
          <span className="text-base font-semibold text-fg-muted">{t('cart.subtotal')}</span>
          <span className="text-pos-total font-black tabular-nums">{formatMoney(subtotal)}</span>
        </div>
        <Button size="xl" fullWidth loading={loading} disabled={cart.length === 0} onClick={onPlaceOrder}>
          {loading ? t('order.sending') : placeLabel}
        </Button>
      </div>
    </div>
  );
};

export const OrderCart = memo(OrderCartComponent);
