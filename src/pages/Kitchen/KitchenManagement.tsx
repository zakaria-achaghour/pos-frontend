import { dynamicT } from '@/i18n/dynamic';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';
import PageMeta from '@/components/common/PageMeta';
import { Button, Icon, Skeleton, useToast } from '@/components/kit';
import KdsTicket from '@/components/pos/kitchen/KdsTicket';
import { useKitchenManagement } from '@/hooks/useKitchenManagement';
import { useNow } from '@/hooks/useNow';
import { orderStatusStyle } from '@/design/status';
import { playChime, unlockAudio } from '@/lib/sound';
import type { KitchenTicket } from '@/types/kitchen';

type Lane = 'pending' | 'preparing' | 'ready';
const LANES: Lane[] = ['pending', 'preparing', 'ready'];

// Board view: all of today's tickets on one screen, no paging
const BOARD_PAGE_SIZE = 60;
const NEW_BADGE_MS = 12000;

/**
 * Kitchen display: responsive, theme-aware, three lanes (New / Cooking / Ready).
 * Live timers change color with ticket age; new tickets chime and are highlighted.
 *
 * Ticket status flow (backend):  pending → [Start] → preparing → [Done] → ready
 * The backend has no per-item status and no "undo", so actions are ticket-level.
 */
const KitchenManagement: React.FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const now = useNow(1000);

  const {
    tickets,
    loading,
    error,
    filters,
    pagination,
    autoRefresh,
    setAutoRefresh,
    updateFilters,
    clearError,
    fetchTickets,
    handleStartPreparation,
    handleCompletePreparation,
  } = useKitchenManagement({}, { perPage: BOARD_PAGE_SIZE });

  const [activeLane, setActiveLane] = useState<Lane>('pending');
  const [soundOn, setSoundOn] = useState(false);
  const [freshIds, setFreshIds] = useState<Set<number>>(new Set());
  const knownIds = useRef<Set<number> | null>(null);
  const soundRef = useRef(soundOn);
  soundRef.current = soundOn;

  // Detect tickets that arrived since the last poll: highlight them and chime
  useEffect(() => {
    const current = new Set(tickets.map((tk) => tk.id));
    if (knownIds.current === null) {
      knownIds.current = current; // first load: nothing is "new"
      return undefined;
    }
    const arrived = tickets.filter((tk) => !knownIds.current!.has(tk.id) && tk.status === 'pending');
    knownIds.current = current;
    if (arrived.length === 0) return undefined;

    if (soundRef.current) playChime();
    setFreshIds((prev) => new Set([...prev, ...arrived.map((tk) => tk.id)]));
    const timer = setTimeout(() => {
      setFreshIds((prev) => {
        const next = new Set(prev);
        arrived.forEach((tk) => next.delete(tk.id));
        return next;
      });
    }, NEW_BADGE_MS);
    return () => clearTimeout(timer);
  }, [tickets]);

  const byLane = useMemo(() => {
    const groups: Record<Lane, KitchenTicket[]> = { pending: [], preparing: [], ready: [] };
    tickets.forEach((tk) => {
      if (tk.status === 'pending' || tk.status === 'preparing' || tk.status === 'ready') {
        groups[tk.status].push(tk);
      }
    });
    return groups;
  }, [tickets]);

  const act = useCallback(
    (action: (id: number) => Promise<unknown>, id: number) => {
      action(id).catch(() => {
        // the hook already stored the message; surface it where the cook is looking
        toast.error(t('kitchen.actionFailed'));
      });
    },
    [toast, t]
  );
  const onStart = useCallback((id: number) => act(handleStartPreparation, id), [act, handleStartPreparation]);
  const onComplete = useCallback((id: number) => act(handleCompletePreparation, id), [act, handleCompletePreparation]);

  const toggleSound = async () => {
    if (soundOn) {
      setSoundOn(false);
      return;
    }
    const ok = await unlockAudio(); // the click is the user gesture browsers require
    setSoundOn(ok);
    if (ok) playChime();
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.();
  };

  const selectedDate = filters.date ?? '';
  const priorityFilter = filters.priority ?? 'all';
  const initialLoading = loading.list && tickets.length === 0;

  const controlClass =
    'h-11 max-w-full rounded-lg border border-line bg-surface px-3 text-sm font-medium text-fg';

  return (
    // Follow the shared theme; the header theme switch also controls the kitchen.
    <div className="kitchen-board space-y-5 text-fg">
      <PageMeta title={`${t('kitchen.title')} | POS`} description={t('kitchen.title')} />

      {/* Toolbar */}
      <div className="kitchen-toolbar flex flex-wrap items-end gap-3 rounded-2xl border border-line bg-surface p-5">
        <h1 className="me-auto w-full text-2xl font-semibold tracking-tight">{t('kitchen.title')}</h1>

        <label className="flex min-w-0 flex-col gap-2 text-xs font-medium text-fg-muted">
          {t('kitchen.date')}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => updateFilters({ date: e.target.value || undefined })}
            className={controlClass}
          />
        </label>

        <label className="flex min-w-0 flex-col gap-2 text-xs font-medium text-fg-muted">
          {t('kitchen.priority')}
          <select
            value={priorityFilter}
            onChange={(e) => {
              const value = e.target.value;
              updateFilters({
                priority: value === 'all' ? undefined : (value as 'normal' | 'rush' | 'urgent'),
              });
            }}
            className={controlClass}
          >
            <option value="all">{t('kitchen.allPriorities')}</option>
            <option value="normal">{t('priority.normal')}</option>
            <option value="rush">{t('priority.rush')}</option>
            <option value="urgent">{t('priority.urgent')}</option>
          </select>
        </label>

        <label className="flex h-11 items-center gap-2 rounded-lg bg-surface-2 px-3 text-sm font-medium">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="h-5 w-5 accent-primary"
          />
          {t('kitchen.autoRefresh')}
        </label>

        <Button variant="secondary" size="md" aria-pressed={soundOn} onClick={toggleSound}>
          {soundOn ? t('kitchen.soundOn') : t('kitchen.soundOff')}
        </Button>
        <Button variant="secondary" size="md" loading={loading.list && tickets.length > 0} onClick={() => void fetchTickets()}>
          {t('common.refresh')}
        </Button>
        <Button variant="secondary" size="md" onClick={toggleFullscreen}>
          {t('kitchen.fullscreen')}
        </Button>
      </div>

      {error && (
        <div role="alert" className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-danger/15 px-4 py-3 text-danger">
          <span className="font-medium">{error}</span>
          <Button variant="ghost" size="md" onClick={clearError}>
            {t('common.dismiss')}
          </Button>
        </div>
      )}

      {pagination.last_page > 1 && (
        <p className="mb-4 rounded-xl bg-warning/15 px-4 py-2 font-medium text-warning">
          {t('kitchen.moreTickets', { count: tickets.length, total: pagination.total })}
        </p>
      )}

      {/* Lane switcher (small screens); all lanes show side by side from lg */}
      <div role="group" aria-label={t('kitchen.lanesLabel')} className="mb-4 grid grid-cols-3 gap-2 lg:hidden">
        {LANES.map((lane) => {
          const style = orderStatusStyle(lane);
          const selected = activeLane === lane;
          return (
            <button
              key={lane}
              type="button"
              aria-pressed={selected}
              onClick={() => setActiveLane(lane)}
              className={twMerge(
                'min-h-14 rounded-xl border-2 px-2 text-base font-bold',
                selected ? twMerge(style.solid, style.border) : 'border-line bg-surface text-fg'
              )}
            >
              {dynamicT(`kitchen.lane.${lane}`)} ({byLane[lane].length})
            </button>
          );
        })}
      </div>

      {initialLoading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
          {LANES.map((lane) => {
            const style = orderStatusStyle(lane);
            return (
              <section
                key={lane}
                aria-label={dynamicT(`kitchen.lane.${lane}`)}
                className={twMerge('min-w-0 space-y-3 rounded-2xl border border-line bg-surface-2/50 p-3', activeLane === lane ? 'block' : 'hidden lg:block')}
              >
                <h2
                  className={twMerge(
                    'hidden items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold lg:flex',
                    style.pill
                  )}
                >
                  <span>{dynamicT(`kitchen.lane.${lane}`)}</span>
                  <span className="tabular-nums">{byLane[lane].length}</span>
                </h2>
                {byLane[lane].length === 0 ? (
                  <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-line bg-surface px-4 py-10 text-center">
                    <span className="mb-4 rounded-2xl bg-surface-2 p-3 text-fg-muted"><Icon name={style.icon} className="h-6 w-6"/></span>
                    <p className="text-sm font-medium text-fg">{t('kitchen.emptyLane')}</p>
                    <p className="mt-2 max-w-48 text-xs leading-5 text-fg-muted">{t('kitchen.emptyHint')}</p>
                  </div>
                ) : (
                  byLane[lane].map((ticket) => (
                    <KdsTicket
                      key={ticket.id}
                      ticket={ticket}
                      now={now}
                      isNew={freshIds.has(ticket.id)}
                      busy={loading.action}
                      onStart={onStart}
                      onComplete={onComplete}
                    />
                  ))
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default KitchenManagement;
