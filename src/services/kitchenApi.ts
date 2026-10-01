import kitchenAPI from '@/api/kitchen';
import type { KitchenTicket, KitchenAnalytics, KitchenFilters } from '@/types/kitchen';
import { baseApi, run } from './baseApi';

type TicketPage = Awaited<ReturnType<typeof kitchenAPI.getTickets>>;
export type KitchenListArgs = KitchenFilters & { date?: string; page?: number; per_page?: number };

export const kitchenApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getKitchenTickets: build.query<TicketPage, KitchenListArgs>({
      queryFn: (args) => run(() => kitchenAPI.getTickets(args)),
      providesTags: ['Kitchen'],
    }),

    getKitchenTicket: build.query<KitchenTicket, number>({
      queryFn: (id) => run(() => kitchenAPI.getTicket(id)),
      providesTags: ['Kitchen'],
    }),

    getKitchenAnalytics: build.query<KitchenAnalytics, 'today' | 'week' | 'month'>({
      queryFn: (period) => run(() => kitchenAPI.getAnalytics(period)),
      providesTags: ['Kitchen'],
    }),

    // Ticket actions change order status too, so orders and tables refetch as well
    startPreparation: build.mutation<KitchenTicket, number>({
      queryFn: (id) => run(() => kitchenAPI.startPreparation(id)),
      invalidatesTags: ['Kitchen', 'Orders', 'Tables'],
    }),

    completeTicket: build.mutation<KitchenTicket, number>({
      queryFn: (id) => run(() => kitchenAPI.completeTicket(id)),
      invalidatesTags: ['Kitchen', 'Orders', 'Tables'],
    }),
  }),
});

export const {
  useGetKitchenTicketsQuery,
  useLazyGetKitchenTicketQuery,
  useGetKitchenAnalyticsQuery,
  useStartPreparationMutation,
  useCompleteTicketMutation,
} = kitchenApi;
