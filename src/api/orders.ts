import apiClient, { ApiResponse, PaginatedResponse } from './client';

// Order types
export interface OrderItem {
  id: number;
  menu_item_id: number;
  menu_item: {
    id: number;
    name: string;
    price: number;
    category: string;
  };
  quantity: number;
  price: number;
  special_instructions?: string;
  status: 'pending' | 'preparing' | 'ready' | 'served';
}

export interface Order {
  id: number;
  table_id: number;
  table: {
    id: number;
    name: string;
    capacity: number;
  };
  customer_name?: string;
  status: 'active' | 'completed' | 'cancelled';
  subtotal: number;
  tax: number;
  total: number;
  payment_method?: 'cash' | 'card' | 'other';
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface CreateOrderData {
  table_id: number;
  customer_name?: string;
  items: {
    menu_item_id: number;
    quantity: number;
    special_instructions?: string;
  }[];
}

export interface AddItemData {
  menu_item_id: number;
  quantity: number;
  special_instructions?: string;
}

export interface CloseOrderData {
  payment_method: 'cash' | 'card' | 'other';
  amount_paid: number;
}

// Order API service
export const orderAPI = {
  /**
   * Get orders with optional filters
   */
  getOrders: async (filters: {
    status?: string;
    table_id?: number;
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
    const response = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
    return response.data.data;
  },

  /**
   * Create new order
   */
  createOrder: async (orderData: CreateOrderData): Promise<Order> => {
    const response = await apiClient.post<ApiResponse<Order>>('/orders', orderData);
    return response.data.data;
  },

  /**
   * Add item to existing order
   */
  addItem: async (orderId: number, itemData: AddItemData): Promise<OrderItem> => {
    const response = await apiClient.post<ApiResponse<OrderItem>>(`/orders/${orderId}/items`, itemData);
    return response.data.data;
  },

  /**
   * Update order item
   */
  updateItem: async (orderId: number, itemId: number, updates: Partial<AddItemData>): Promise<OrderItem> => {
    const response = await apiClient.put<ApiResponse<OrderItem>>(`/orders/${orderId}/items/${itemId}`, updates);
    return response.data.data;
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
    const response = await apiClient.post<ApiResponse<Order>>(`/orders/${orderId}/close`, paymentData);
    return response.data.data;
  }
};

export default orderAPI;