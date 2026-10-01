import { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import PaginationWithText from '@/components/ui/pagination/PaginationWithText';
import { Button, Icon, Skeleton, StatusPill, useToast } from '@/components/kit';
import { useTableBoard, type TableBoardFilter } from '@/hooks/useTableBoard';
import { useAuth } from '@/hooks/useAuthRedux';
import { useGetOrdersQuery } from '@/services/ordersApi';
import { LIVE_POLL_MS } from '@/services/baseApi';
import { tableStateStyle } from '@/design/status';
import { ActiveOrdersList } from '@/components/waiter/ActiveOrdersList';
import type { Table } from '@/types/table';

type Tab = 'tables' | 'orders';

const FILTERS: TableBoardFilter[] = ['all', 'available', 'occupied', 'reserved'];

export default function Tables() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const isWaiter = user?.role === 'waiter';
  const [activeTab, setActiveTab] = useState<Tab>('tables');
  const [searchTerm, setSearchTerm] = useState('');

  const { tables, statusFilter, loading, error, pagination, goToPage, fetchTables, setStatusFilter, tableStats } =
    useTableBoard(20); // polls, and refetches whenever an order changes

  // Orders whose food is ready: lets the board flag tables that need serving
  const { data: readyOrders } = useGetOrdersQuery(
    { status: 'ready' },
    { pollingInterval: LIVE_POLL_MS, skipPollingIfUnfocused: true }
  );
  const readyByTable = useMemo(() => {
    const map = new Map<number, number>();
    (readyOrders?.items ?? []).forEach((o) => {
      if (o.tableId) map.set(o.tableId, o.id);
    });
    return map;
  }, [readyOrders]);

  const displayedTables = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return tables;
    return tables.filter(
      (table) => table.number.toString().toLowerCase().includes(term) || table.section?.toLowerCase().includes(term)
    );
  }, [tables, searchTerm]);

  const handleTableClick = (table: Table) => {
    if (table.status === 'available') {
      navigate('/orders/new', { state: { tableId: table.id, tableNumber: table.number } });
      return;
    }
    const orderId = table.currentOrder ?? readyByTable.get(table.id);
    if (table.status === 'occupied' && orderId) {
      navigate(`/orders/${orderId}`);
      return;
    }
    // Used to do nothing; tell the waiter where to look instead
    toast.info(table.status === 'occupied' ? t('tables.noOrderLink') : t('tables.unavailable'));
  };

  const title = isWaiter ? (activeTab === 'tables' ? t('tables.selectTitle') : t('orders.activeTitle')) : t('tables.title');

  const stat = (label: string, value: number, tone: string) => (
    <div className="flex items-baseline gap-2">
      <span className="text-sm text-fg-muted">{label}</span>
      <span className={twMerge('text-lg font-bold tabular-nums', tone)}>{value}</span>
    </div>
  );

  const renderTables = () => {
    if (loading && tables.length === 0) {
      return (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-5" role="status" aria-label={t('common.loading')}>
          {Array.from({ length: 10 }, (_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-xl bg-danger/15 px-4 py-3 text-danger">
          <span className="font-medium">{error}</span>
          <Button variant="secondary" size="md" onClick={() => void fetchTables()}>
            {t('common.retry')}
          </Button>
        </div>
      );
    }

    if (displayedTables.length === 0) {
      return <p className="py-12 text-center text-fg-muted">{t('tables.empty')}</p>;
    }

    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {displayedTables.map((table) => {
          const state = tableStateStyle(table.status);
          const ready = readyByTable.has(table.id);
          return (
            <button
              key={table.id}
              type="button"
              onClick={() => handleTableClick(table)}
              aria-label={t('tables.tileLabel', {
                n: table.number,
                state: t(`tableState.${table.status}`, { defaultValue: state.label }),
              })}
              className={twMerge(
                'flex min-h-32 flex-col justify-between rounded-2xl border-2 bg-surface p-3 text-start shadow-sm transition-colors hover:bg-surface-2',
                ready ? 'border-status-ready ring-4 ring-status-ready/30' : state.border
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-2xl font-black text-fg">{table.number}</span>
                <StatusPill
                  size="sm"
                  style={state}
                  label={t(`tableState.${table.status}`, { defaultValue: state.label })}
                />
              </div>
              <div className="space-y-1">
                <p className="flex items-center gap-1 text-sm text-fg-muted">
                  <Icon name="user" className="h-4 w-4" />
                  {t('tables.seats', { count: table.capacity })}
                </p>
                {ready ? (
                  <p className="inline-flex items-center gap-1 rounded-md bg-status-ready px-2 py-0.5 text-sm font-bold text-white">
                    <Icon name="check" className="h-4 w-4" />
                    {t('tables.readyToServe')}
                  </p>
                ) : table.status === 'available' ? (
                  <p className="text-sm font-semibold text-table-free">{t('tables.tapToOrder')}</p>
                ) : table.status === 'occupied' && table.currentOrder ? (
                  <p className="text-sm font-semibold text-fg">{t('tables.orderNumber', { n: table.currentOrder })}</p>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className={isWaiter ? 'pb-28' : ''}>
      <PageMeta title={`${title} | POS`} description={title} />
      {!isWaiter && <PageBreadcrumb pageTitle={title} />}
      {isWaiter && <h1 className="mb-4 text-2xl font-bold text-fg">{title}</h1>}

      {location.state?.message && (
        <div role="status" className="mb-4 rounded-xl bg-success/15 px-4 py-3 font-medium text-success">
          {location.state.message}
        </div>
      )}

      {activeTab === 'tables' && (
        <>
          <div className="mb-4 space-y-3 rounded-2xl border border-line bg-surface p-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <label className="block flex-1 lg:max-w-md">
                <span className="sr-only">{t('tables.search')}</span>
                <input
                  type="search"
                  placeholder={t('tables.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-12 w-full rounded-xl border border-line bg-surface px-3 text-base text-fg placeholder:text-fg-muted"
                />
              </label>

              <div role="group" aria-label={t('tables.filterLabel')} className="flex gap-2 overflow-x-auto">
                {FILTERS.map((key) => {
                  const selected = statusFilter === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setStatusFilter(key)}
                      className={twMerge(
                        'min-h-12 shrink-0 rounded-xl px-4 text-base font-semibold ring-1 transition-colors',
                        selected ? 'bg-primary text-primary-fg ring-primary' : 'bg-surface text-fg ring-line hover:bg-surface-2'
                      )}
                    >
                      {t(`tables.filter.${key}`)}
                    </button>
                  );
                })}
              </div>

              <Button variant="secondary" size="lg" className="hidden lg:inline-flex" onClick={() => void fetchTables()}>
                {t('common.refresh')}
              </Button>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-1">
              {stat(t('tables.stats.total'), tableStats.total, 'text-fg')}
              {stat(t('tables.stats.free'), tableStats.available, 'text-table-free')}
              {stat(t('tables.stats.busy'), tableStats.occupied, 'text-table-busy')}
            </div>
          </div>

          {renderTables()}

          {pagination.lastPage > 1 && (
            <div className="mt-6">
              <PaginationWithText
                totalPages={pagination.lastPage}
                initialPage={pagination.currentPage}
                onPageChange={goToPage}
              />
            </div>
          )}
        </>
      )}

      {activeTab === 'orders' && <ActiveOrdersList />}

      {/* Waiter bottom bar: thumb-reachable, stays below the sticky header */}
      {isWaiter && (
        <nav
          aria-label={t('tables.navLabel')}
          className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 gap-2 border-t border-line bg-surface p-2 shadow-2xl"
        >
          {(['tables', 'orders'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              aria-current={activeTab === tab ? 'page' : undefined}
              onClick={() => setActiveTab(tab)}
              className={twMerge(
                'min-h-14 rounded-xl text-base font-bold transition-colors',
                activeTab === tab ? 'bg-primary text-primary-fg' : 'text-fg hover:bg-surface-2'
              )}
            >
              {t(`tables.tabs.${tab}`)}
            </button>
          ))}
          <button
            type="button"
            onClick={() => navigate('/orders/new')}
            className="min-h-14 rounded-xl bg-success text-base font-bold text-white hover:opacity-90"
          >
            {t('tables.tabs.newOrder')}
          </button>
        </nav>
      )}
    </div>
  );
}
