import { useCallback, useEffect, useMemo, useState } from 'react';
import { useGetCashierDashboardQuery } from '@/services/cashierApi';
import { CASHIER_DASHBOARD_REFRESH_EVENT } from '@/utils/cashierEvents';
import { errorMessage } from '@/lib/errors';

interface UseCashierDashboardOptions {
  scope?: 'self' | 'all';
  pollInterval?: number | null;
  autoFetch?: boolean;
}

/**
 * Today's cashier dashboard. Polled by RTK Query, refreshed by the dashboard event,
 * and refetched automatically when orders change (shared 'Orders' tag).
 */
export const useCashierDashboard = (options: UseCashierDashboardOptions = {}) => {
  const { scope = 'self', pollInterval = 45000, autoFetch = true } = options;
  const [dismissedError, setDismissedError] = useState<unknown>(null);

  const { data, isLoading, error: queryError, fulfilledTimeStamp, refetch } = useGetCashierDashboardQuery(
    { scope },
    {
      skip: !autoFetch,
      pollingInterval: pollInterval || 0,
      skipPollingIfUnfocused: true,
      refetchOnMountOrArgChange: true,
    }
  );

  const refresh = useCallback(async () => {
    setDismissedError(null);
    if (autoFetch) await refetch();
  }, [autoFetch, refetch]);

  useEffect(() => {
    if (!autoFetch) return undefined;
    const handler = () => {
      refetch();
    };
    window.addEventListener(CASHIER_DASHBOARD_REFRESH_EVENT, handler);
    return () => window.removeEventListener(CASHIER_DASHBOARD_REFRESH_EVENT, handler);
  }, [autoFetch, refetch]);

  const lastUpdated = useMemo(
    () => (fulfilledTimeStamp ? new Date(fulfilledTimeStamp).toISOString() : null),
    [fulfilledTimeStamp]
  );

  const error =
    queryError && queryError !== dismissedError ? errorMessage(queryError, 'Failed to load cashier dashboard.') : null;

  // setError(null) dismisses the current error; setting a message is not needed by callers
  const setError = useCallback(
    (_value: string | null) => {
      setDismissedError(queryError);
    },
    [queryError]
  );

  return {
    data: data ?? null,
    isLoading,
    error,
    lastUpdated,
    refresh,
    setError,
  };
};

export default useCashierDashboard;
