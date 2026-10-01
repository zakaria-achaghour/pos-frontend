import i18n from '@/i18n';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  useGetKitchenTicketsQuery,
  useLazyGetKitchenTicketQuery,
  useGetKitchenAnalyticsQuery,
  useStartPreparationMutation,
  useCompleteTicketMutation,
} from '@/services/kitchenApi';
import { LIVE_POLL_MS, type ApiError } from '@/services/baseApi';
import type { KitchenTicket, KitchenFilters } from '@/types/kitchen';

type KitchenFilterState = KitchenFilters & { date?: string };

const ITEMS_PER_PAGE = 10;

const errorMessage = (err: unknown, fallback = i18n.t('notifications.kitchenFailed')) =>
  (err as Partial<ApiError> | undefined)?.message || fallback;

/** Local calendar day (not UTC), re-checked every minute so a screen left open overnight rolls over. */
const localToday = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const useToday = () => {
  const [today, setToday] = useState(localToday);
  useEffect(() => {
    const timer = setInterval(() => setToday((prev) => (prev === localToday() ? prev : localToday())), 60000);
    return () => clearInterval(timer);
  }, []);
  return today;
};

export const useKitchenManagement = (
  initialFilters: Partial<KitchenFilterState> = {},
  options: { perPage?: number } = {}
) => {
  const perPage = options.perPage ?? ITEMS_PER_PAGE;
  const today = useToday();
  const [filterOverrides, setFilterOverrides] = useState<KitchenFilterState>({ ...initialFilters });
  const [page, setPage] = useState(1);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentTicket, setCurrentTicket] = useState<KitchenTicket | null>(null);
  const inFlight = useRef(new Set<number>());

  // `date` defaults to today unless the user picked one
  const filters = useMemo<KitchenFilterState>(
    () => ({ ...filterOverrides, date: filterOverrides.date ?? today }),
    [filterOverrides, today]
  );

  const { data, isLoading, isFetching, error: queryError, refetch } = useGetKitchenTicketsQuery(
    { ...filters, page, per_page: perPage },
    {
      // Always poll: new tickets arrive while nothing is "preparing"
      pollingInterval: autoRefresh ? LIVE_POLL_MS : 0,
      skipPollingIfUnfocused: true,
      refetchOnMountOrArgChange: true,
    }
  );
  const { data: analytics = null, isFetching: analyticsLoading, refetch: refetchAnalytics } =
    useGetKitchenAnalyticsQuery('today', { pollingInterval: autoRefresh ? LIVE_POLL_MS * 4 : 0, skipPollingIfUnfocused: true });

  const [loadTicket] = useLazyGetKitchenTicketQuery();
  const [startPrep] = useStartPreparationMutation();
  const [completeTicket] = useCompleteTicketMutation();

  const tickets = data?.data ?? [];
  const pagination = {
    current_page: data?.current_page ?? page,
    last_page: data?.last_page ?? 1,
    per_page: data?.per_page ?? perPage,
    total: data?.total ?? tickets.length,
    from: data?.from ?? 0,
    to: data?.to ?? tickets.length,
  };

  const loading = { list: isLoading || (isFetching && tickets.length === 0), analytics: analyticsLoading, action: actionLoading };
  const error = actionError ?? (queryError ? errorMessage(queryError, i18n.t('notifications.kitchenFetch')) : null);

  const fetchTickets = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const fetchAnalytics = useCallback(async () => {
    await refetchAnalytics();
  }, [refetchAnalytics]);

  const fetchTicketDetails = useCallback(
    async (ticketId: number) => {
      setActionLoading(true);
      try {
        const ticket = await loadTicket(ticketId).unwrap();
        setCurrentTicket(ticket);
        return ticket;
      } catch (err) {
        setActionError(errorMessage(err));
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [loadTicket]
  );

  const goToPage = useCallback((next: number) => {
    setPage(next);
    return Promise.resolve();
  }, []);

  const updateFilters = useCallback((patch: Partial<KitchenFilterState>) => {
    setFilterOverrides((prev) => ({ ...prev, ...patch }));
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilterOverrides({});
    setPage(1);
  }, []);

  // Ignore repeat taps on the same ticket while its request is running
  const runTicketAction = useCallback(async (ticketId: number, action: () => Promise<unknown>) => {
    if (inFlight.current.has(ticketId)) return;
    inFlight.current.add(ticketId);
    setActionLoading(true);
    setActionError(null);
    try {
      await action();
    } catch (err) {
      setActionError(errorMessage(err));
      throw err;
    } finally {
      inFlight.current.delete(ticketId);
      setActionLoading(inFlight.current.size > 0);
    }
  }, []);

  const handleStartPreparation = useCallback(
    (ticketId: number) => runTicketAction(ticketId, () => startPrep(ticketId).unwrap()),
    [runTicketAction, startPrep]
  );

  const handleCompletePreparation = useCallback(
    (ticketId: number) => runTicketAction(ticketId, () => completeTicket(ticketId).unwrap()),
    [runTicketAction, completeTicket]
  );

  const clearError = useCallback(() => setActionError(null), []);

  return {
    tickets,
    currentTicket,
    analytics,
    filters,
    pagination,
    loading,
    error,
    autoRefresh,
    setAutoRefresh,
    updateFilters,
    clearFilters,
    clearError,
    fetchTickets,
    fetchTicketDetails,
    fetchAnalytics,
    handleStartPreparation,
    handleCompletePreparation,
    goToPage,
  };
};

export default useKitchenManagement;
