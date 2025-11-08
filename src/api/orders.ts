import apiClient from './client';
import type { ApiResponse, PaginatedResponse } from './client';
import type { 
  Order, 
  OrderItem,
  CreateOrderData, 
  AddOrderItemData, 
  PaymentMethod 
} from '../types/order';

// Re-export types for backward compatibility
export type { Order, OrderItem, CreateOrderData };

export interface AddItemData extends AddOrderItemData {}

export interface CloseOrderData {
  payment_method: PaymentMethod;
  amount_paid: number;
}

/**
 * Helper to unwrap API responses that may or may not be wrapped in { data: ... }
 */
function unwrapResponse<T>(payload: ApiResponse<T> | T): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiResponse<T>).data;
  }
  return payload as T;
}

// Order API service
export const orderAPI = {
  /**
   * Get orders with optional filters
   */
  getOrders: async (filters: {
    status?: string;
    type?: string;
    table_id?: number;
    search?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    per_page?: number;
  } = {}): Promise<PaginatedResponse<Order>> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const response = await apiClient.get<PaginatedResponse<Order>>(`/orders?${params}`);
    return response.data;
  },

  /**
   * Get single order
   */
  getOrder: async (id: number): Promise<Order> => {
    const response = await apiClient.get(`/orders/${id}`);
    return unwrapResponse<Order>(response.data);
  },

  /**
   * Create new order
   */
  createOrder: async (orderData: CreateOrderData): Promise<Order> => {
    const response = await apiClient.post('/orders', orderData);
    return unwrapResponse<Order>(response.data);
  },

  /**
   * Add item to existing order
   */
  addItem: async (orderId: number, itemData: AddItemData): Promise<OrderItem> => {
    const response = await apiClient.post(`/orders/${orderId}/items`, itemData);
    return unwrapResponse<OrderItem>(response.data);
  },

  /**
   * Update order item
   */
  updateItem: async (orderId: number, itemId: number, updates: Partial<AddItemData>): Promise<OrderItem> => {
    const response = await apiClient.put(`/orders/${orderId}/items/${itemId}`, updates);
    return unwrapResponse<OrderItem>(response.data);
  },

  /**
   * Remove item from order
   */
  removeItem: async (orderId: number, itemId: number): Promise<void> => {
    await apiClient.delete(`/orders/${orderId}/items/${itemId}`);
  },

  /**
   * Close/pay order
   */
  closeOrder: async (orderId: number, paymentData: CloseOrderData): Promise<Order> => {
    const response = await apiClient.post(`/orders/${orderId}/close`, paymentData);
    return unwrapResponse<Order>(response.data);
  },

  /**
   * Update order status
   */
  updateOrderStatus: async (orderId: number, status: string): Promise<Order> => {
    const response = await apiClient.put(`/orders/${orderId}`, { status });
    return unwrapResponse<Order>(response.data);
  },

  /**
   * Update payment information
   */
  updatePayment: async (orderId: number, paymentData: {
    payment_method?: string;
    payment_status?: string;
    amount_received?: number;
    tip_amount?: number;
    discount_amount?: number;
  }): Promise<Order> => {
    const response = await apiClient.patch(`/orders/${orderId}/payment`, paymentData);
    return unwrapResponse<Order>(response.data);
  },
};

export default orderAPI;
