// Order and POS types
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
export type OrderType = 'dine-in' | 'takeout' | 'delivery';
export type PaymentMethod = 'cash' | 'card' | 'digital-wallet' | 'split';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

export interface OrderItem {
  id: number;
  menuItemId: number;
  menuItem?: {
    id: number;
    name: string;
    price: number;
    image?: string;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions?: string;
  modifiers?: OrderModifier[];
  status: OrderStatus;
}

export interface OrderModifier {
  id: number;
  name: string;
  price: number;
  type: 'addition' | 'substitution' | 'removal';
}

export interface Order {
  id: number;
  orderNumber: string;
  type: OrderType;
  status: OrderStatus;
  tableId?: number;
  table?: {
    id: number;
    number: string;
  };
  customerId?: number;
  customer?: {
    id: number;
    name: string;
    phone: string;
  };
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  tip: number;
  total: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  serverId?: number;
  server?: {
    id: number;
    name: string;
  };
  kitchenNotes?: string;
  customerNotes?: string;
  estimatedReadyTime?: string;
  actualReadyTime?: string;
  servedTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: number;
  orderId: number;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  cardLast4?: string;
  tips: number;
  cashReceived?: number;
  changeGiven?: number;
  processedBy: number;
  processedAt: string;
  refundedAmount?: number;
  refundedAt?: string;
  refundReason?: string;
}

// Cart and POS session types
export interface CartItem {
  menuItemId: number;
  menuItem: {
    id: number;
    name: string;
    price: number;
    image?: string;
    category: string;
  };
  quantity: number;
  specialInstructions?: string;
  modifiers: OrderModifier[];
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  tableId?: number;
  customerId?: number;
}

export interface POSSession {
  id: number;
  cashierId: number;
  startTime: string;
  endTime?: string;
  startingCash: number;
  endingCash?: number;
  totalSales: number;
  totalTransactions: number;
  cashSales: number;
  cardSales: number;
  tips: number;
  isActive: boolean;
}

// Form data interfaces
export interface OrderFormData {
  type: OrderType;
  tableId?: number;
  customerId?: number;
  items: {
    menuItemId: number;
    quantity: number;
    specialInstructions?: string;
    modifiers?: OrderModifier[];
  }[];
  kitchenNotes?: string;
  customerNotes?: string;
}

export interface PaymentFormData {
  orderId: number;
  amount: number;
  method: PaymentMethod;
  tips: number;
  cashReceived?: number;
  cardLast4?: string;
  transactionId?: string;
}

// Filter and search interfaces
export interface OrderFilters {
  status?: OrderStatus;
  type?: OrderType;
  tableId?: number;
  serverId?: number;
  paymentStatus?: PaymentStatus;
  dateFrom?: string;
  dateTo?: string;
  minTotal?: number;
  maxTotal?: number;
  searchTerm?: string;
}

export interface PaymentFilters {
  status?: PaymentStatus;
  method?: PaymentMethod;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  cashierId?: number;
}

// Analytics interfaces
export interface OrderAnalytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  completedOrders: number;
  cancelledOrders: number;
  pendingOrders: number;
  averagePreparationTime: number;
  popularItems: {
    menuItemId: number;
    name: string;
    orderCount: number;
    revenue: number;
  }[];
}

export interface SalesAnalytics {
  totalSales: number;
  cashSales: number;
  cardSales: number;
  totalTips: number;
  transactionCount: number;
  averageTransactionValue: number;
  hourlyBreakdown: {
    hour: number;
    sales: number;
    transactions: number;
  }[];
}

// API response interfaces
export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
}

export interface PaymentsResponse {
  payments: Payment[];
  total: number;
  page: number;
  limit: number;
}

// Create/Update request interfaces
export interface CreateOrderRequest extends Omit<OrderFormData, 'id'> {}
export interface UpdateOrderRequest extends Partial<CreateOrderRequest> {
  id: number;
}

export interface CreatePaymentRequest extends Omit<PaymentFormData, 'id'> {}
export interface UpdatePaymentRequest extends Partial<CreatePaymentRequest> {
  id: number;
}