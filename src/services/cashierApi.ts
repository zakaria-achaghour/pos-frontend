import cashierAPI from '@/api/cashier';
import type { CashierShift, OpenShiftPayload, CloseShiftPayload, CashierDashboardData } from '@/types/cashier';
import { baseApi, run } from './baseApi';

export interface CashierDashboardArgs {
  scope?: 'self' | 'all';
  cashier_id?: number;
}

export const cashierApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCurrentShift: build.query<CashierShift | null, void>({
      queryFn: () => run(() => cashierAPI.getCurrentShift()),
      providesTags: ['Shifts'],
    }),
    // Also tagged 'Orders': taking payment on an order refreshes the dashboard
    getCashierDashboard: build.query<CashierDashboardData, CashierDashboardArgs>({
      queryFn: (args) => run(() => cashierAPI.getTodayDashboard(args)),
      providesTags: ['Shifts', 'Orders'],
    }),
    openShift: build.mutation<CashierShift, OpenShiftPayload>({
      queryFn: (payload) => run(() => cashierAPI.openShift(payload)),
      invalidatesTags: ['Shifts'],
      // Show the new shift immediately; the invalidation refetch then confirms it
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data: shift } = await queryFulfilled;
          dispatch(cashierApi.util.updateQueryData('getCurrentShift', undefined, () => shift));
        } catch {
          // the mutation error is surfaced by the caller
        }
      },
    }),
    closeShift: build.mutation<CashierShift, CloseShiftPayload>({
      queryFn: (payload) => run(() => cashierAPI.closeShift(payload)),
      invalidatesTags: ['Shifts'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(cashierApi.util.updateQueryData('getCurrentShift', undefined, () => null));
        } catch {
          // the mutation error is surfaced by the caller
        }
      },
    }),
  }),
});

export const {
  useLazyGetCurrentShiftQuery,
  useGetCashierDashboardQuery,
  useOpenShiftMutation,
  useCloseShiftMutation,
} = cashierApi;
