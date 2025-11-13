import { useState, useEffect, useCallback, useRef } from 'react';
import kitchenAPI from '@/api/kitchen';
import type {
  KitchenTicket,
  KitchenFilters,
  KitchenAnalytics,
} from '@/types/kitchen';

type KitchenFilterState = KitchenFilters & { date?: string };

interface KitchenPaginationState {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

interface KitchenLoadingState {
  list: boolean;
  analytics: boolean;
  action: boolean;
}

const ITEMS_PER_PAGE = 10;
const TODAY = () => new Date().toISOString().split('T')[0];
const DEFAULT_FILTERS: KitchenFilterState = { date: TODAY() };
const DEFAULT_PAGINATION: KitchenPaginationState = {
  current_page: 1,
  last_page: 1,
  per_page: ITEMS_PER_PAGE,
  total: 0,
  from: 0,
  to: 0,
};

const formatError = (err: any) =>
  err?.response?.data?.message || err?.message || 'Failed to process request';

export const useKitchenManagement = (
  initialFilters: Partial<KitchenFilterState> = {},
) => {
  const [tickets, setTickets] = useState<KitchenTicket[]>([]);
  const [currentTicket, setCurrentTicket] = useState<KitchenTicket | null>(null);
  const [analytics, setAnalytics] = useState<KitchenAnalytics | null>(null);
  const [filters, setFilters] = useState<KitchenFilterState>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });
  const [pagination, setPagination] =
    useState<KitchenPaginationState>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState<KitchenLoadingState>({
    list: false,
    analytics: false,
    action: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const currentPageRef = useRef(1);

  const fetchTickets = useCallback(
    async (page?: number) => {
      const targetPage = page ?? currentPageRef.current;
      setLoading((prev) => ({ ...prev, list: true }));
      setError(null);

      try {
        const response = await kitchenAPI.getTickets({
          ...filters,
          page: targetPage,
          per_page: ITEMS_PER_PAGE,
        });

        currentPageRef.current = response.current_page ?? targetPage;

        setTickets(response.data || []);
        setPagination({
          current_page: response.current_page ?? targetPage,
          last_page: response.last_page ?? 1,
          per_page: response.per_page ?? ITEMS_PER_PAGE,
          total: response.total ?? response.data.length,
          from: response.from ?? 0,
          to: response.to ?? response.data.length,
        });
      } catch (err: any) {
        setError(formatError(err));
      } finally {
        setLoading((prev) => ({ ...prev, list: false }));
      }
    },
    [filters],
  );

  const fetchTicketDetails = useCallback(async (ticketId: number) => {
    setLoading((prev) => ({ ...prev, action: true }));
    try {
      const ticket = await kitchenAPI.getTicket(ticketId);
      setCurrentTicket(ticket);
      return ticket;
    } catch (err: any) {
      setError(formatError(err));
      throw err;
    } finally {
      setLoading((prev) => ({ ...prev, action: false }));
    }
  }, []);

  const fetchAnalytics = useCallback(
    async (period: 'today' | 'week' | 'month' = 'today') => {
      setLoading((prev) => ({ ...prev, analytics: true }));
      try {
        const data = await kitchenAPI.getAnalytics(period);
        setAnalytics(data);
      } catch (err: any) {
        setError(formatError(err));
      } finally {
        setLoading((prev) => ({ ...prev, analytics: false }));
      }
    },
    [],
  );

  const refreshTickets = useCallback(
    () => fetchTickets(currentPageRef.current),
    [fetchTickets],
  );

  const goToPage = useCallback(
    (page: number) => {
      currentPageRef.current = page;
      return fetchTickets(page);
    },
    [fetchTickets],
  );

  const updateFilters = useCallback(
    (patch: Partial<KitchenFilterState>) => {
      setFilters((prev) => ({
        ...prev,
        ...patch,
      }));
    },
    [],
  );

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const handleStartPreparation = useCallback(
    async (ticketId: number) => {
      setLoading((prev) => ({ ...prev, action: true }));
      try {
        await kitchenAPI.startPreparation(ticketId);
        await refreshTickets();
      } catch (err: any) {
        setError(formatError(err));
        throw err;
      } finally {
        setLoading((prev) => ({ ...prev, action: false }));
      }
    },
    [refreshTickets],
  );

  const handleCompletePreparation = useCallback(
    async (ticketId: number) => {
      setLoading((prev) => ({ ...prev, action: true }));
      try {
        await kitchenAPI.completeTicket(ticketId);
        await refreshTickets();
      } catch (err: any) {
        setError(formatError(err));
        throw err;
      } finally {
        setLoading((prev) => ({ ...prev, action: false }));
      }
    },
    [refreshTickets],
  );

  const clearError = useCallback(() => setError(null), []);

  // Fetch data on mount and when filters change
  useEffect(() => {
    currentPageRef.current = 1;
    fetchTickets(1);
  }, [fetchTickets]);

  useEffect(() => {
    fetchAnalytics('today');
  }, [fetchAnalytics]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const hasPreparing = tickets.some((ticket) => ticket.status === 'preparing');
    if (!hasPreparing) return;

    const interval = setInterval(() => {
      refreshTickets();
    }, 30000);

    return () => clearInterval(interval);
  }, [tickets, autoRefresh, refreshTickets]);

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
    fetchTickets: refreshTickets,
    fetchTicketDetails,
    fetchAnalytics,
    handleStartPreparation,
    handleCompletePreparation,
    goToPage,
  };
};

export default useKitchenManagement;
