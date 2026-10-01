import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';
import { Button, Modal } from '@/components/kit';
import { EXTRAS, extraLabel } from '@/lib/extras';
import { formatMoney } from '@/lib/money';
import type { MenuItem } from '@/types/menu';

interface AddItemModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (
    item: MenuItem,
    quantity: number,
    specialInstructions?: string,
    removedIngredients?: string[],
    addedExtras?: string[]
  ) => void;
  initialValues?: {
    quantity: number;
    specialInstructions?: string | undefined;
    removedIngredients?: string[] | undefined;
    addedExtras?: string[] | undefined;
  } | undefined;
  mode?: 'add' | 'edit';
}

const chip = (selected: boolean, tone: 'danger' | 'success') =>
  twMerge(
    'min-h-11 rounded-full px-4 text-base font-medium ring-2 transition-colors',
    selected
      ? tone === 'danger'
        ? 'bg-danger/15 text-danger ring-danger line-through'
        : 'bg-success/15 text-success ring-success'
      : 'bg-surface-2 text-fg ring-transparent hover:ring-line'
  );

const toggle = (list: string[], value: string) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

export const AddItemModal = ({ item, isOpen, onClose, onAdd, initialValues, mode = 'add' }: AddItemModalProps) => {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [removed, setRemoved] = useState<string[]>([]);
  const [extras, setExtras] = useState<string[]>([]);

  // Keep the latest initial values in a ref: the parent builds a new object every render,
  // and re-running the reset effect on each render would wipe what the cashier is typing.
  const initialRef = useRef(initialValues);
  initialRef.current = initialValues;

  // Reset only when the dialog opens or switches to another item
  useEffect(() => {
    if (!isOpen) return;
    const initial = mode === 'edit' ? initialRef.current : undefined;
    setQuantity(initial?.quantity ?? 1);
    setNotes(initial?.specialInstructions ?? '');
    setRemoved(initial?.removedIngredients ?? []);
    setExtras(initial?.addedExtras ?? []);
  }, [isOpen, item?.id, mode]);

  if (!item) return null;

  const ingredients = item.ingredients ?? [];

  const submit = () => {
    onAdd(item, quantity, notes, removed, extras);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item.name}
      size="lg"
      closeLabel={t('common.close')}
      footer={
        <>
          <Button variant="secondary" size="lg" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button size="lg" onClick={submit}>
            {mode === 'edit' ? t('addItem.updateCart') : t('addItem.addToCart')} · {formatMoney(Number(item.price) * quantity)}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {item.description && <p className="text-fg-muted">{item.description}</p>}

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-fg-muted">{t('addItem.price')}</p>
            <p className="text-pos-price font-bold">{formatMoney(item.price)}</p>
          </div>
          <div className="flex items-center rounded-xl bg-surface-2 ring-1 ring-line">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label={t('addItem.decrease')}
              className="flex h-12 w-12 items-center justify-center rounded-lg text-2xl font-bold hover:bg-surface"
            >
              −
            </button>
            <input
              type="number"
              min={1}
              inputMode="numeric"
              value={quantity}
              aria-label={t('addItem.quantity')}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="h-12 w-16 bg-transparent text-center text-lg font-bold tabular-nums"
            />
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              aria-label={t('addItem.increase')}
              className="flex h-12 w-12 items-center justify-center rounded-lg text-2xl font-bold hover:bg-surface"
            >
              +
            </button>
          </div>
        </div>

        {ingredients.length > 0 && (
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">{t('addItem.removeIngredients')}</legend>
            <div className="flex flex-wrap gap-2">
              {ingredients.map((ingredient) => (
                <button
                  key={ingredient}
                  type="button"
                  aria-pressed={removed.includes(ingredient)}
                  onClick={() => setRemoved((prev) => toggle(prev, ingredient))}
                  className={chip(removed.includes(ingredient), 'danger')}
                >
                  {ingredient}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <fieldset>
          <legend className="mb-2 text-sm font-semibold">{t('addItem.extras')}</legend>
          <div className="flex flex-wrap gap-2">
            {EXTRAS.map((extra) => (
              <button
                key={extra.value}
                type="button"
                aria-pressed={extras.includes(extra.value)}
                onClick={() => setExtras((prev) => toggle(prev, extra.value))}
                className={chip(extras.includes(extra.value), 'success')}
              >
                {extraLabel(t, extra.value)}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold">{t('addItem.notes')}</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('addItem.notesPlaceholder')}
            rows={2}
            className="w-full resize-none rounded-xl border border-line bg-surface px-3 py-2 text-base text-fg placeholder:text-fg-muted"
          />
        </label>
      </div>
    </Modal>
  );
};
