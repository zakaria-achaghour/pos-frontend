import apiClient from '@/api/client';
import type { Order, CreateOrderData, AddOrderItemData, OrderStatus } from '@/types/order';
import { baseApi, run } from './baseApi';
import { toOrder, toOrderPage, type Page } from './adapter';

export interface OrderListArgs {
  page?: number;
  per_page?: number;
  status?: string;
  type?: string;
  table_id?: number;
  waiter_id?: number;
  mine?: 0 | 1;
  search?: string;
  date_from?: string;
  date_to?: string;
}

export interface PaymentArgs {
  id: number;
  payment_method: string;
  payment_status: string;
  amount_received?: number;
  tip_amount?: number;
  discount_amount?: number;
}

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getOrders: build.query<Page<Order>, OrderListArgs | void>({
      queryFn: (args) =>
        run(async () => toOrderPage((await apiClient.get('/orders', { params: args ?? {} })).data)),
      providesTags: (result) => [
        { type: 'Orders', id: 'LIST' },
        ...(result?.items ?? []).map((o) => ({ type: 'Orders' as const, id: o.id })),
      ],
    }),

    getOrder: build.query<Order, number>({
      queryFn: (id) => run(async () => toOrder((await apiClient.get(`/orders/${id}`)).data)),
      providesTags: (_r, _e, id) => [{ type: 'Orders', id }],
    }),

    createOrder: build.mutation<Order, CreateOrderData>({
      queryFn: (body) => run(async () => toOrder((await apiClient.post('/orders', body)).data)),
      invalidatesTags: [{ type: 'Orders', id: 'LIST' }, 'Tables', 'Kitchen'],
    }),

    updateOrder: build.mutation<Order, { id: number; data: Record<string, unknown> }>({
      queryFn: ({ id, data }) => run(async () => toOrder((await apiClient.put(`/orders/${id}`, data)).data)),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Orders', id }, { type: 'Orders', id: 'LIST' }],
    }),

    // PATCH /orders/{id}/status also frees the table, creates the kitchen ticket and sets paid_at
    updateOrderStatus: build.mutation<Order, { id: number; status: OrderStatus | string }>({
      queryFn: ({ id, status }) =>
        run(async () => toOrder((await apiClient.patch(`/orders/${id}/status`, { status })).data)),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Orders', id }, { type: 'Orders', id: 'LIST' }, 'Tables', 'Kitchen'],
    }),

    updatePayment: build.mutation<Order, PaymentArgs>({
      queryFn: ({ id, ...body }) =>
        run(async () => toOrder((await apiClient.patch(`/orders/${id}/payment`, body)).data)),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Orders', id }, { type: 'Orders', id: 'LIST' }, 'Tables'],
    }),

    addOrderItem: build.mutation<unknown, { orderId: number; item: AddOrderItemData }>({
      queryFn: ({ orderId, item }) => run(async () => (await apiClient.post(`/orders/${orderId}/items`, item)).data),
      invalidatesTags: (_r, _e, { orderId }) => [{ type: 'Orders', id: orderId }, { type: 'Orders', id: 'LIST' }, 'Kitchen'],
    }),

    removeOrderItem: build.mutation<unknown, { orderId: number; itemId: number }>({
      queryFn: ({ orderId, itemId }) =>
        run(async () => (await apiClient.delete(`/orders/${orderId}/items/${itemId}`)).data),
      invalidatesTags: (_r, _e, { orderId }) => [{ type: 'Orders', id: orderId }, { type: 'Orders', id: 'LIST' }, 'Kitchen'],
    }),

    closeOrder: build.mutation<unknown, { orderId: number; payment_method: string; amount_paid: number }>({
      queryFn: ({ orderId, ...body }) => run(async () => (await apiClient.post(`/orders/${orderId}/close`, body)).data),
      invalidatesTags: (_r, _e, { orderId }) => [{ type: 'Orders', id: orderId }, { type: 'Orders', id: 'LIST' }, 'Tables'],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useUpdateOrderStatusMutation,
  useUpdatePaymentMutation,
  useAddOrderItemMutation,
  useRemoveOrderItemMutation,
  useCloseOrderMutation,
} = ordersApi;
