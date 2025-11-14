import { useCallback, useEffect, useState } from 'react';
import cashierAPI from '@/api/cashier';
import type {
  CashierShift,
  OpenShiftPayload,
  CloseShiftPayload,
} from '@/types/cashier';

interface UseCashierShiftOptions {
  autoFetch?: boolean;
}

export const useCashierShift = (options: UseCashierShiftOptions = {}) => {
  const { autoFetch = true } = options;
  const [currentShift, setCurrentShift] = useState<CashierShift | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentShift = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const shift = await cashierAPI.getCurrentShift();
      setCurrentShift(shift);
      return shift;
    } catch (err: any) {
      console.error('Failed to fetch current shift', err);
      setError(err?.message || 'Failed to fetch current shift.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openShift = useCallback(
    async (payload: OpenShiftPayload) => {
      try {
        setIsActionLoading(true);
        setError(null);
        const shift = await cashierAPI.openShift(payload);
        setCurrentShift(shift);
        return shift;
      } catch (err: any) {
        console.error('Failed to open shift', err);
        setError(err?.response?.data?.message || err?.message || 'Failed to open shift.');
        throw err;
      } finally {
        setIsActionLoading(false);
      }
    },
    [],
  );

  const closeShift = useCallback(
    async (payload: CloseShiftPayload) => {
      try {
        setIsActionLoading(true);
        setError(null);
        const shift = await cashierAPI.closeShift(payload);
        setCurrentShift(null);
        return shift;
      } catch (err: any) {
        console.error('Failed to close shift', err);
        setError(err?.response?.data?.message || err?.message || 'Failed to close shift.');
        throw err;
      } finally {
        setIsActionLoading(false);
      }
    },
    [],
  );

  const requireShift = useCallback(async () => {
    if (currentShift) return true;
    const freshShift = await fetchCurrentShift();
    return !!freshShift;
  }, [currentShift, fetchCurrentShift]);

  useEffect(() => {
    if (autoFetch) {
      fetchCurrentShift();
    }
  }, [autoFetch, fetchCurrentShift]);

  return {
    currentShift,
    isLoading,
    isActionLoading,
    error,
    setError,
    refresh: fetchCurrentShift,
    openShift,
    closeShift,
    requireShift,
  };
};

export default useCashierShift;
