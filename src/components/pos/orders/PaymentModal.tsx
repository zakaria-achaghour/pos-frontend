import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';
import { Button, Icon, Modal, useToast } from '@/components/kit';
import { printReceipt, downloadReceipt } from '@/api/receipts';
import { emitCashierDashboardRefresh } from '@/utils/cashierEvents';
import { formatMoney, toCents } from '@/lib/money';
import type { Order } from '@/types/order';

/**
 * The backend's PATCH /orders/{id}/payment does not apply `discount_amount`: the order would keep its
 * full total while the cashier collected less. Keep this off until the API applies discounts.
 */
const SUPPORTS_DISCOUNT = false;

type Method = 'cash' | 'card' | 'mobile';
const METHODS: Method[] = ['cash', 'card', 'mobile'];

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onConfirm: (
    orderId: number,
    paymentData: {
      payment_method: string;
      payment_status: string;
      amount_received?: number;
      tip_amount?: number;
      discount_amount?: number;
    }
  ) => Promise<Order | void>;
}

const input =
  'h-14 w-full rounded-xl border border-line bg-surface px-4 text-xl font-semibold tabular-nums text-fg placeholder:text-fg-muted';

/** Cash chips: exact amount plus the next round amounts a customer would hand over. */
const quickCashAmounts = (due: number): number[] => {
  const rounded = [10, 50, 100, 200, 500].map((step) => Math.ceil(due / step) * step);
  return [...new Set(rounded)].filter((v) => v > due).sort((a, b) => a - b).slice(0, 4);
};

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, order, onConfirm }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [method, setMethod] = useState<Method>('cash');
  const [amountReceived, setAmountReceived] = useState('');
  const [tipAmount, setTipAmount] = useState('0');
  const [discountAmount, setDiscountAmount] = useState('0');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paidAt, setPaidAt] = useState<string | null>(null);

  // Reset when opened for an order (keyed on id: a refetched order object must not wipe the form)
  const orderId = order?.id;
  useEffect(() => {
    if (!isOpen || !order) return;
    const existing = order.paymentMethod || order.payment_method;
    setMethod(existing === 'cash' || existing === 'card' || existing === 'mobile' ? existing : 'cash');
    setAmountReceived(toCents(Number(order.total) || 0).toFixed(2));
    setTipAmount('0');
    setDiscountAmount('0');
    setIsSuccess(false);
    setPaidAt(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, orderId]);

  const orderTotal = toCents(Number(order?.total) || 0);
  const tip = toCents(parseFloat(tipAmount) || 0);
  const discount = SUPPORTS_DISCOUNT ? toCents(parseFloat(discountAmount) || 0) : 0;
  const finalTotal = toCents(orderTotal + tip - discount);
  const received = toCents(parseFloat(amountReceived) || 0);
  const change = toCents(received - finalTotal);
  const shortBy = toCents(finalTotal - received);
  const cashShort = method === 'cash' && received < finalTotal;

  const chips = useMemo(() => quickCashAmounts(finalTotal), [finalTotal]);

  if (!order) return null;

  const orderLabel = order.orderNumber || `#${order.id}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing || cashShort) return; // also blocks a double tap

    setIsProcessing(true);
    try {
      await onConfirm(order.id, {
        payment_method: method,
        payment_status: 'completed',
        ...(method === 'cash' && { amount_received: received }),
        ...(tip > 0 && { tip_amount: tip }),
        ...(discount > 0 && { discount_amount: discount }),
      });
      emitCashierDashboardRefresh();
      setPaidAt(new Date().toISOString());
      setIsSuccess(true);
    } catch {
      // The caller rethrows on failure and shows the reason; stay here so the cashier can retry
      toast.error(t('payment.failed'));
    } finally {
      setIsProcessing(false);
    }
  };

  const receiptAction = async (action: () => Promise<unknown>) => {
    try {
      await action();
    } catch {
      toast.error(t('payment.receiptFailed'));
    }
  };

  const handleClose = () => {
    if (isProcessing) return;
    setIsSuccess(false);
    setPaidAt(null);
    onClose();
  };

  const title = isSuccess ? t('payment.completedTitle') : t('payment.title');

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="md"
      closeOnBackdrop={false}
      closeLabel={t('common.close')}
    >
      {isSuccess ? (
        <div className="space-y-5">
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
              <Icon name="check" className="h-9 w-9" />
            </span>
            <p className="text-fg-muted">
              {t('payment.completedBody', { order: orderLabel, method: t(`payment.method.${method}`) })}
            </p>
            {paidAt && <p className="text-sm text-fg-muted">{new Date(paidAt).toLocaleString()}</p>}
          </div>

          <dl className="space-y-1 rounded-xl bg-surface-2 p-4">
            <div className="flex justify-between">
              <dt>{t('payment.orderTotal')}</dt>
              <dd className="font-semibold tabular-nums">{formatMoney(orderTotal)}</dd>
            </div>
            {tip > 0 && (
              <div className="flex justify-between">
                <dt>{t('payment.tip')}</dt>
                <dd className="font-semibold tabular-nums">{formatMoney(tip)}</dd>
              </div>
            )}
            <div className="mt-2 flex justify-between border-t border-line pt-2 text-lg font-bold">
              <dt>{t('payment.amountDue')}</dt>
              <dd className="tabular-nums">{formatMoney(finalTotal)}</dd>
            </div>
            {method === 'cash' && change > 0 && (
              <div className="flex justify-between text-success">
                <dt>{t('payment.change')}</dt>
                <dd className="font-semibold tabular-nums">{formatMoney(change)}</dd>
              </div>
            )}
          </dl>

          <div className="space-y-3">
            <Button size="xl" fullWidth onClick={() => void receiptAction(() => printReceipt(order.id))}>
              {t('payment.print')}
            </Button>
            <Button size="lg" fullWidth variant="secondary" onClick={() => void receiptAction(() => downloadReceipt(order.id, 'pdf'))}>
              {t('payment.download')}
            </Button>
            <Button size="lg" fullWidth variant="ghost" onClick={handleClose}>
              {t('common.close')}
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* The number the cashier cares about most */}
          <div className="rounded-2xl bg-surface-2 p-4 text-center">
            <p className="text-sm font-medium text-fg-muted">
              {t('payment.amountDue')} · {orderLabel}
            </p>
            <p className="text-pos-total font-black tabular-nums">{formatMoney(finalTotal)}</p>
            {(tip > 0 || discount > 0) && (
              <p className="text-sm text-fg-muted">
                {formatMoney(orderTotal)}
                {tip > 0 ? ` + ${formatMoney(tip)} ${t('payment.tip').toLowerCase()}` : ''}
                {discount > 0 ? ` − ${formatMoney(discount)}` : ''}
              </p>
            )}
          </div>

          {/* Method */}
          <div role="radiogroup" aria-label={t('payment.methodLabel')} className="grid grid-cols-3 gap-2">
            {METHODS.map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={method === m}
                disabled={isProcessing}
                onClick={() => setMethod(m)}
                className={twMerge(
                  'min-h-14 rounded-xl text-base font-bold ring-2 transition-colors',
                  method === m ? 'bg-primary text-primary-fg ring-primary' : 'bg-surface text-fg ring-line hover:bg-surface-2'
                )}
              >
                {t(`payment.method.${m}`)}
              </button>
            ))}
          </div>

          {method === 'cash' ? (
            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-sm font-semibold">{t('payment.received')}</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value.replace(',', '.'))}
                  disabled={isProcessing}
                  className={input}
                  placeholder="0.00"
                />
              </label>

              <div className="flex flex-wrap gap-2" role="group" aria-label={t('payment.quickCash')}>
                <button
                  type="button"
                  onClick={() => setAmountReceived(finalTotal.toFixed(2))}
                  className="min-h-12 rounded-xl bg-surface-2 px-4 text-base font-semibold ring-1 ring-line hover:bg-surface"
                >
                  {t('payment.exact')}
                </button>
                {chips.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setAmountReceived(value.toFixed(2))}
                    className="min-h-12 rounded-xl bg-surface-2 px-4 text-base font-semibold tabular-nums ring-1 ring-line hover:bg-surface"
                  >
                    {formatMoney(value)}
                  </button>
                ))}
              </div>

              {/* Change is the most prominent number once cash covers the total */}
              {received >= finalTotal ? (
                <div role="status" className="rounded-2xl bg-success/15 p-4 text-center text-success">
                  <p className="text-sm font-semibold">{t('payment.change')}</p>
                  <p className="text-pos-total font-black tabular-nums">{formatMoney(change)}</p>
                </div>
              ) : (
                received > 0 && (
                  <p role="alert" className="rounded-xl bg-danger/15 px-4 py-3 text-center text-base font-bold text-danger">
                    {t('payment.short', { amount: formatMoney(shortBy) })}
                  </p>
                )
              )}
            </div>
          ) : (
            <p className="rounded-xl bg-surface-2 px-4 py-3 text-base text-fg-muted">
              {method === 'card' ? t('payment.cardHint') : t('payment.mobileHint')}
            </p>
          )}

          {/* Tip */}
          <fieldset>
            <legend className="mb-1 text-sm font-semibold">{t('payment.tipOptional')}</legend>
            <div className="mb-2 grid grid-cols-4 gap-2">
              {[0, 10, 15, 20].map((pct) => {
                const value = pct === 0 ? 0 : Math.round(orderTotal * pct) / 100;
                const selected = tip === value;
                return (
                  <button
                    key={pct}
                    type="button"
                    disabled={isProcessing}
                    aria-pressed={selected}
                    onClick={() => setTipAmount(value.toFixed(2))}
                    className={twMerge(
                      'min-h-12 rounded-xl text-base font-semibold ring-1 transition-colors',
                      selected ? 'bg-primary text-primary-fg ring-primary' : 'bg-surface text-fg ring-line hover:bg-surface-2'
                    )}
                  >
                    {pct === 0 ? t('payment.noTip') : `${pct}%`}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              inputMode="decimal"
              aria-label={t('payment.tipOptional')}
              value={tipAmount}
              onChange={(e) => setTipAmount(e.target.value.replace(',', '.'))}
              disabled={isProcessing}
              className={twMerge(input, 'h-12 text-base')}
              placeholder="0.00"
            />
          </fieldset>

          {SUPPORTS_DISCOUNT && (
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">{t('payment.discountOptional')}</span>
              <input
                type="text"
                inputMode="decimal"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value.replace(',', '.'))}
                disabled={isProcessing}
                className={twMerge(input, 'h-12 text-base')}
                placeholder="0.00"
              />
            </label>
          )}

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" size="xl" disabled={isProcessing} onClick={handleClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="success" size="xl" fullWidth loading={isProcessing} disabled={cashShort}>
              {isProcessing ? t('payment.processing') : `${t('payment.confirm')} · ${formatMoney(finalTotal)}`}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default PaymentModal;
