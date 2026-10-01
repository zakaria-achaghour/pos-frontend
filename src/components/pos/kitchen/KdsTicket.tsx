import { dynamicT } from '@/i18n/dynamic';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';
import { AGE_STYLE, ageLevel, orderStatusStyle, priorityStyle } from '@/design/status';
import { Button, Icon, StatusPill } from '@/components/kit';
import { extraLabel } from '@/lib/extras';
import type { KitchenTicket } from '@/types/kitchen';

interface KdsTicketProps {
  ticket: KitchenTicket;
  /** current time in ms (shared ticking clock from the page) */
  now: number;
  /** ticket appeared in the last few seconds */
  isNew: boolean;
  busy: boolean;
  onStart: (id: number) => void;
  onComplete: (id: number) => void;
}

const formatTimer = (ms: number): string => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

function KdsTicketComponent({ ticket, now, isNew, busy, onStart, onComplete }: KdsTicketProps) {
  const { t } = useTranslation();

  const elapsedMs = now - new Date(ticket.created_at).getTime();
  const isActive = ticket.status === 'pending' || ticket.status === 'preparing';
  // Aging colors only matter while the food is still being waited on
  const level = isActive ? ageLevel(elapsedMs / 60000) : 'fresh';
  const age = AGE_STYLE[level];

  const order = ticket.order;
  const where = order?.table?.number
    ? t('kitchen.table', { n: order.table.number })
    : order?.type === 'delivery'
      ? t('kitchen.delivery')
      : t('kitchen.takeout');

  const status = orderStatusStyle(ticket.status === 'pending' ? 'pending' : ticket.status);
  const priority = priorityStyle(ticket.priority);

  return (
    <article
      aria-label={`${where} #${ticket.ticket_number}`}
      className={twMerge(
        'flex flex-col overflow-hidden rounded-2xl border-2 bg-surface text-fg shadow-sm',
        status.border,
        isNew && 'ring-4 ring-primary/60'
      )}
    >
      {/* Header: where + live timer; background follows ticket age */}
      <header className={twMerge('flex items-center justify-between gap-3 px-4 py-3', age.header)}>
        <div className="min-w-0">
          <p className="truncate text-kds-qty font-black leading-tight">{where}</p>
          <p className="text-sm opacity-80">
            {t('kitchen.ticket', { n: ticket.ticket_number })}
            {order?.customer_name ? ` · ${order.customer_name}` : ''}
          </p>
        </div>
        <div className="text-end">
          {isNew && (
            <span className="mb-1 inline-block rounded-md bg-primary px-2 py-0.5 text-xs font-bold text-primary-fg">
              {t('kitchen.new')}
            </span>
          )}
          <p className="text-kds-timer font-bold tabular-nums" aria-label={t('kitchen.elapsed')}>
            {formatTimer(elapsedMs)}
          </p>
        </div>
      </header>

      {/* Status / priority / station */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-2">
        <StatusPill style={status} label={dynamicT(`status.${ticket.status}`, { defaultValue: status.label })} />
        {ticket.priority !== 'normal' && (
          <StatusPill style={priority} label={dynamicT(`priority.${ticket.priority}`, { defaultValue: priority.label })} />
        )}
        {ticket.cooking_station && (
          <span className="rounded-full bg-surface-2 px-3 py-1 text-sm font-medium text-fg-muted">
            {ticket.cooking_station}
          </span>
        )}
        {ticket.assigned_chef && (
          <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-3 py-1 text-sm font-medium text-fg-muted">
            <Icon name="user" className="h-4 w-4" />
            {ticket.assigned_chef.first_name} {ticket.assigned_chef.last_name}
          </span>
        )}
      </div>

      {/* Items: big quantity, big name, modifiers with symbols (not color alone) */}
      <ul className="flex-1 divide-y divide-line px-4">
        {ticket.items?.length ? (
          ticket.items.map((item) => (
            <li key={item.id} className="py-3">
              <div className="flex items-baseline gap-3">
                <span className="min-w-[2.5ch] text-kds-qty font-black tabular-nums">{item.quantity}×</span>
                <span className="text-kds-item font-semibold leading-snug">{item.menu_item?.name}</span>
              </div>
              {item.removed_ingredients && item.removed_ingredients.length > 0 && (
                <p className="mt-1 ps-[3.5ch] text-lg font-bold uppercase text-danger">
                  ✕ {t('kitchen.no', { items: item.removed_ingredients.join(', ') })}
                </p>
              )}
              {item.added_extras && item.added_extras.length > 0 && (
                <p className="mt-1 ps-[3.5ch] text-lg font-bold text-success">
                  ＋ {item.added_extras.map((e) => extraLabel(t, e)).join(', ')}
                </p>
              )}
              {item.special_instructions && (
                <p className="mt-1 ms-[3.5ch] rounded-lg bg-warning/15 px-3 py-1.5 text-base font-medium text-warning">
                  {item.special_instructions}
                </p>
              )}
            </li>
          ))
        ) : (
          <li className="py-4 text-fg-muted">{t('kitchen.noItems')}</li>
        )}
      </ul>

      {ticket.special_instructions && (
        <p className="mx-4 mb-3 flex items-start gap-2 rounded-lg bg-warning/15 px-3 py-2 text-base font-medium text-warning">
          <Icon name="alert" className="mt-0.5 h-5 w-5 shrink-0" />
          <span>
            <strong>{t('kitchen.ticketNote')}:</strong> {ticket.special_instructions}
          </span>
        </p>
      )}

      {/* One big action per ticket */}
      <footer className="p-4 pt-0">
        {ticket.status === 'pending' && (
          <Button size="xl" fullWidth variant="primary" disabled={busy} onClick={() => onStart(ticket.id)}>
            {t('kitchen.start')}
          </Button>
        )}
        {ticket.status === 'preparing' && (
          <Button size="xl" fullWidth variant="success" disabled={busy} onClick={() => onComplete(ticket.id)}>
            {t('kitchen.done')}
          </Button>
        )}
        {ticket.status === 'ready' && (
          <p className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-status-ready/15 text-lg font-bold text-status-ready">
            <Icon name="check" className="h-6 w-6" />
            {t('kitchen.readyForService')}
          </p>
        )}
      </footer>
    </article>
  );
}

const KdsTicket = memo(KdsTicketComponent);
export default KdsTicket;
