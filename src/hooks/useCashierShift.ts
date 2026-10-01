import { useCallback, useEffect, useState } from 'react';
import type { CashierShift, OpenShiftPayload, CloseShiftPayload } from '@/types/cashier';
import {
  useLazyGetCurrentShiftQuery,
  useOpenShiftMutation,
  useCloseShiftMutation,
} from '@/services/cashierApi';
import { errorMessage } from '@/lib/errors';

interface UseCashierShiftOptions {
  autoFetch?: boolean;
}

/**
 * Current cashier shift. The shift lives in RTK Query ('Shifts' tag); this hook
 * only holds the error message and the loading flag for open/close actions.
 */
export const useCashierShift = (options: UseCashierShiftOptions = {}) => {
  const { autoFetch = true } = options;
  const [error, setError] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [loadShift, shiftResult] = useLazyGetCurrentShiftQuery();
  const [openShiftMutation] = useOpenShiftMutation();
  const [closeShiftMutation] = useCloseShiftMutation();

  const currentShift: CashierShift | null = shiftResult.data ?? null;

  const fetchCurrentShift = useCallback(async (): Promise<CashierShift | null> => {
    setError(null);
    try {
      return await loadShift(undefined, false).unwrap();
    } catch (err) {
      setError(errorMessage(err, 'Failed to fetch current shift.'));
      return null;
    }
  }, [loadShift]);

  const openShift = useCallback(
    async (payload: OpenShiftPayload) => {
      setIsActionLoading(true);
      setError(null);
      try {
        return await openShiftMutation(payload).unwrap();
      } catch (err) {
        setError(errorMessage(err, 'Failed to open shift.'));
        throw err;
      } finally {
        setIsActionLoading(false);
      }
    },
    [openShiftMutation]
  );

  const closeShift = useCallback(
    async (payload: CloseShiftPayload) => {
      setIsActionLoading(true);
      setError(null);
      try {
        return await closeShiftMutation(payload).unwrap();
      } catch (err) {
        setError(errorMessage(err, 'Failed to close shift.'));
        throw err;
      } finally {
        setIsActionLoading(false);
      }
    },
    [closeShiftMutation]
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
    isLoading: shiftResult.isLoading,
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
