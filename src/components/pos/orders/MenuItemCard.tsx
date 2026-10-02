import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/kit';
import { formatMoney } from '@/lib/money';
import type { MenuItem } from '@/types/menu';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
  onCustomize: (item: MenuItem) => void;
}

/**
 * Menu tile: one tap adds the item. The whole tile is a real <button>; the
 * customize control is a sibling button (buttons can't nest) with a 44px target.
 */
const MenuItemCardComponent = ({ item, onAddToCart, onCustomize }: MenuItemCardProps) => {
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);
  const available = item.is_available !== false;

  return (
    <div className="relative">
      <button
        type="button"
        disabled={!available}
        onClick={() => onAddToCart(item)}
        aria-label={t('menu.addNamed', { name: item.name })}
        className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-line bg-surface text-start shadow-sm enabled:hover:border-primary disabled:opacity-60"
      >
        <div className="h-32 w-full bg-surface-2">
          {item.image_url && !imageError ? (
            <img
              src={item.image_url}
              alt=""
              loading="lazy"
              onError={() => setImageError(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div aria-hidden="true" className="flex h-full w-full items-center justify-center text-3xl font-medium text-fg-muted">
              {item.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1 p-3">
          <span className="line-clamp-2 min-h-10 text-sm font-semibold leading-snug text-fg">{item.name}</span>
          <div className="mt-auto flex items-center justify-between gap-2">
            <span className="text-lg font-semibold text-fg">{formatMoney(item.price)}</span>
            {!available && (
              <span className="inline-flex items-center gap-1 rounded-full bg-status-void/15 px-2 py-0.5 text-xs font-semibold text-status-void">
                <Icon name="x" className="h-3.5 w-3.5" />
                {t('menu.outOfStock')}
              </span>
            )}
          </div>
        </div>
      </button>

      {available && (
        <button
          type="button"
          onClick={() => onCustomize(item)}
          aria-label={t('menu.customize', { name: item.name })}
          className="absolute end-2 top-2 flex h-11 w-11 items-center justify-center rounded-full bg-surface/95 text-fg shadow-sm hover:bg-surface-2 border border-line"
        >
          <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h12M20 18h0M14 4v4M8 10v4M16 16v4" />
          </svg>
        </button>
      )}
    </div>
  );
};

export const MenuItemCard = memo(MenuItemCardComponent);
