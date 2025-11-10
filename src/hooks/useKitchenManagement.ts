import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store';
import {
  fetchKitchenTickets,
  fetchKitchenTicket,
  assignTicket,
  startTicketPreparation,
  completeTicket,
  updateTicketPriority,
  fetchKitchenAnalytics,
  setFilters,
  selectPendingTickets,
  selectPreparingTickets,
  selectReadyTickets,
  selectUrgentTickets,
  type KitchenFilters,
  type AssignTicketRequest,
  type UpdatePriorityRequest,
} from '@/store/slices/kitchenSlice';

/**
 * Custom hook for kitchen management operations
 * Provides convenient interface for components to interact with kitchen state
 */
export const useKitchenManagement = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Selectors
  const { tickets, currentTicket, analytics, filters, loading, error, pagination } = useSelector(
    (state: RootState) => state.kitchen
  );
  const pendingTickets = useSelector(selectPendingTickets);
  const preparingTickets = useSelector(selectPreparingTickets);
  const readyTickets = useSelector(selectReadyTickets);
  const urgentTickets = useSelector(selectUrgentTickets);

  /**
   * Fetch tickets with current filters
   */
  const fetchTickets = useCallback(
    (customFilters?: KitchenFilters) => {
      const filterParams = customFilters || filters;
      dispatch(fetchKitchenTickets(filterParams));
    },
    [dispatch, filters]
  );

  /**
   * Fetch single ticket details
   */
  const fetchTicketDetails = useCallback(
    (ticketId: number) => {
      dispatch(fetchKitchenTicket(ticketId));
    },
    [dispatch]
  );

  /**
   * Update filter criteria
   */
  const updateFilters = useCallback(
    (newFilters: Partial<KitchenFilters>) => {
      dispatch(setFilters(newFilters));
      // Auto-fetch with new filters
      dispatch(fetchKitchenTickets({ ...filters, ...newFilters }));
    },
    [dispatch, filters]
  );

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    dispatch(setFilters({}));
    dispatch(fetchKitchenTickets({}));
  }, [dispatch]);

  /**
   * Assign ticket to chef and cooking station
   */
  const handleAssignTicket = useCallback(
    async (ticketId: number, data: AssignTicketRequest) => {
      const result = await dispatch(assignTicket({ ticketId, data }));
      if (assignTicket.fulfilled.match(result)) {
        return result.payload;
      }
      throw new Error(result.error.message || 'Failed to assign ticket');
    },
    [dispatch]
  );

  /**
   * Start preparing a ticket
   */
  const handleStartPreparation = useCallback(
    async (ticketId: number) => {
      const result = await dispatch(startTicketPreparation(ticketId));
      if (startTicketPreparation.fulfilled.match(result)) {
        return result.payload;
      }
      throw new Error(result.error.message || 'Failed to start preparation');
    },
    [dispatch]
  );

  /**
   * Complete a ticket
   */
  const handleCompleteTicket = useCallback(
    async (ticketId: number) => {
      const result = await dispatch(completeTicket(ticketId));
      if (completeTicket.fulfilled.match(result)) {
        return result.payload;
      }
      throw new Error(result.error.message || 'Failed to complete ticket');
    },
    [dispatch]
  );

  /**
   * Update ticket priority
   */
  const handleUpdatePriority = useCallback(
    async (ticketId: number, data: UpdatePriorityRequest) => {
      const result = await dispatch(updateTicketPriority({ ticketId, data }));
      if (updateTicketPriority.fulfilled.match(result)) {
        return result.payload;
      }
      throw new Error(result.error.message || 'Failed to update priority');
    },
    [dispatch]
  );

  /**
   * Fetch kitchen analytics
   */
  const fetchAnalytics = useCallback(
    (period: 'today' | 'week' | 'month' = 'today') => {
      dispatch(fetchKitchenAnalytics(period));
    },
    [dispatch]
  );

  /**
   * Refresh current view
   */
  const refresh = useCallback(() => {
    fetchTickets();
    fetchAnalytics();
  }, [fetchTickets, fetchAnalytics]);

  // Auto-fetch tickets on mount
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Auto-fetch analytics on mount
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    // State
    tickets,
    currentTicket,
    analytics,
    filters,
    loading,
    error,
    pagination,

    // Filtered tickets
    pendingTickets,
    preparingTickets,
    readyTickets,
    urgentTickets,

    // Actions
    fetchTickets,
    fetchTicketDetails,
    updateFilters,
    clearFilters,
    handleAssignTicket,
    handleStartPreparation,
    handleCompleteTicket,
    handleUpdatePriority,
    fetchAnalytics,
    refresh,
  };
};

export default useKitchenManagement;
