import { useCallback, useEffect, useState } from 'react';
import cashierAPI from '@/api/cashier';
import type { CashierDashboardData } from '@/types/cashier';
import { CASHIER_DASHBOARD_REFRESH_EVENT } from '@/utils/cashierEvents';

interface UseCashierDashboardOptions {
  scope?: 'self' | 'all';
  pollInterval?: number | null;
  autoFetch?: boolean;
}

export const useCashierDashboard = (
  options: UseCashierDashboardOptions = {},
) => {
  const { scope = 'self', pollInterval = 45000, autoFetch = true } = options;
  const [data, setData] = useState<CashierDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await cashierAPI.getTodayDashboard({ scope });
      setData(response);
      setLastUpdated(new Date().toISOString());
    } catch (err: any) {
      console.error('Failed to fetch cashier dashboard', err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to load cashier dashboard.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    if (!autoFetch) return;
    fetchDashboard();
  }, [autoFetch, fetchDashboard]);

  useEffect(() => {
    if (!pollInterval) return;
    const id = setInterval(fetchDashboard, pollInterval);
    return () => clearInterval(id);
  }, [pollInterval, fetchDashboard]);

  useEffect(() => {
    const handler = () => fetchDashboard();
    window.addEventListener(CASHIER_DASHBOARD_REFRESH_EVENT, handler);
    return () => window.removeEventListener(CASHIER_DASHBOARD_REFRESH_EVENT, handler);
  }, [fetchDashboard]);

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refresh: fetchDashboard,
    setError,
  };
};

export default useCashierDashboard;
