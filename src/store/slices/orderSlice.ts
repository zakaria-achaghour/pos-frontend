import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { orderAPI } from '../../api/orders';
import type { Order, OrderItem, CreateOrderData, AddItemData, CloseOrderData } from '../../api/orders';
import type { PaginatedResponse } from '../../api/client';
import { parseApiError, formatValidationErrors } from '../utils/errorUtils';
import type { ApiError } from '../types/common';

// Order state interfaces
interface OrderState {
  // List data
  orders: Order[];
  currentOrder: Order | null;
  
  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isAddingItem: boolean;
  isUpdatingItem: boolean;
  isRemovingItem: boolean;
  isClosing: boolean;
  
  // Error states
  error: string | null;
  validationErrors: Record<string, string[]>;
  lastError: ApiError | null;
  
  // Pagination
  pagination: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
    from: number;
    to: number;
  };
  
  // Filters
  filters: {
    status?: string;
    table_id?: number;
    date_from?: string;
    date_to?: string;
    search: string;
  };
  
  // Selection
  selectedOrders: number[];
  
  // UI state
  lastUpdated: string | null;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isAddingItem: false,
  isUpdatingItem: false,
  isRemovingItem: false,
  isClosing: false,
  error: null,
  validationErrors: {},
  lastError: null,
  pagination: {
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
    total: 0,
    from: 0,
    to: 0,
  },
  filters: {
    search: '',
  },
  selectedOrders: [],
  lastUpdated: null,
};

// Async thunks
export const fetchOrders = createAsyncThunk<
  PaginatedResponse<Order>,
  {
    status?: string;
    table_id?: number;
    date_from?: string;
    date_to?: string;
    page?: number;
    per_page?: number;
  },
  { rejectValue: ApiError }
>(
  'orders/fetchOrders',
  async (filters, { rejectWithValue }) => {
    try {
      return await orderAPI.getOrders(filters);
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const fetchOrder = createAsyncThunk<
  Order,
  number,
  { rejectValue: ApiError }
>(
  'orders/fetchOrder',
  async (id, { rejectWithValue }) => {
    try {
      return await orderAPI.getOrder(id);
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const createOrder = createAsyncThunk<
  Order,
  CreateOrderData,
  { rejectValue: ApiError }
>(
  'orders/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      return await orderAPI.createOrder(orderData);
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const addOrderItem = createAsyncThunk<
  { orderId: number; item: OrderItem },
  { orderId: number; itemData: AddItemData },
  { rejectValue: ApiError }
>(
  'orders/addOrderItem',
  async ({ orderId, itemData }, { rejectWithValue }) => {
    try {
      const item = await orderAPI.addItem(orderId, itemData);
      return { orderId, item };
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const updateOrderItem = createAsyncThunk<
  { orderId: number; item: OrderItem },
  { orderId: number; itemId: number; updates: Partial<AddItemData> },
  { rejectValue: ApiError }
>(
  'orders/updateOrderItem',
  async ({ orderId, itemId, updates }, { rejectWithValue }) => {
    try {
      const item = await orderAPI.updateItem(orderId, itemId, updates);
      return { orderId, item };
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const removeOrderItem = createAsyncThunk<
  { orderId: number; itemId: number },
  { orderId: number; itemId: number },
  { rejectValue: ApiError }
>(
  'orders/removeOrderItem',
  async ({ orderId, itemId }, { rejectWithValue }) => {
    try {
      await orderAPI.removeItem(orderId, itemId);
      return { orderId, itemId };
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const closeOrder = createAsyncThunk<
  Order,
  { orderId: number; paymentData: CloseOrderData },
  { rejectValue: ApiError }
>(
  'orders/closeOrder',
  async ({ orderId, paymentData }, { rejectWithValue }) => {
    try {
      return await orderAPI.closeOrder(orderId, paymentData);
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

// Slice
const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    // Error management
    clearError: (state) => {
      state.error = null;
      state.validationErrors = {};
      state.lastError = null;
    },

    clearFieldError: (state, action: PayloadAction<string>) => {
      const { [action.payload]: removed, ...rest } = state.validationErrors;
      state.validationErrors = rest;
    },

    // Current order management
    setCurrentOrder: (state, action: PayloadAction<Order | null>) => {
      state.currentOrder = action.payload;
    },

    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },

    // Filter management
    setFilter: (state, action: PayloadAction<{ key: keyof OrderState['filters']; value: any }>) => {
      state.filters[action.payload.key] = action.payload.value;
      state.pagination.currentPage = 1;
    },

    clearFilters: (state) => {
      state.filters = { search: '' };
      state.pagination.currentPage = 1;
    },

    setSearch: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.pagination.currentPage = 1;
    },

    // Pagination
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload;
    },

    setPageSize: (state, action: PayloadAction<number>) => {
      state.pagination.perPage = action.payload;
      state.pagination.currentPage = 1;
    },

    // Selection
    selectOrders: (state, action: PayloadAction<number[]>) => {
      state.selectedOrders = action.payload;
    },

    toggleOrderSelection: (state, action: PayloadAction<number>) => {
      const index = state.selectedOrders.indexOf(action.payload);
      if (index >= 0) {
        state.selectedOrders.splice(index, 1);
      } else {
        state.selectedOrders.push(action.payload);
      }
    },

    selectAllOrders: (state) => {
      state.selectedOrders = state.orders.map(order => order.id);
    },

    clearSelection: (state) => {
      state.selectedOrders = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch orders
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.data;
        state.pagination = {
          currentPage: action.payload.current_page,
          lastPage: action.payload.last_page,
          perPage: action.payload.per_page,
          total: action.payload.total,
          from: action.payload.from,
          to: action.payload.to,
        };
        state.lastUpdated = new Date().toISOString();
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch orders';
        state.lastError = action.payload || null;
      });

    // Fetch single order
    builder
      .addCase(fetchOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
        
        // Update in orders list if present
        const index = state.orders.findIndex(order => order.id === action.payload.id);
        if (index >= 0) {
          state.orders[index] = action.payload;
        }
        
        state.lastUpdated = new Date().toISOString();
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(fetchOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch order';
        state.lastError = action.payload || null;
      });

    // Create order
    builder
      .addCase(createOrder.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isCreating = false;
        state.orders.unshift(action.payload);
        state.currentOrder = action.payload;
        state.pagination.total += 1;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload?.message || 'Failed to create order';
        state.lastError = action.payload || null;
        if (action.payload?.validationErrors) {
          state.validationErrors = formatValidationErrors(action.payload.validationErrors);
        }
      });

    // Add order item
    builder
      .addCase(addOrderItem.pending, (state) => {
        state.isAddingItem = true;
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(addOrderItem.fulfilled, (state, action) => {
        state.isAddingItem = false;
        const { orderId, item } = action.payload;
        
        // Update current order
        if (state.currentOrder && state.currentOrder.id === orderId) {
          state.currentOrder.items.push(item);
          // Recalculate totals (you might want to get these from the API)
          state.currentOrder.subtotal += item.price * item.quantity;
          state.currentOrder.total = state.currentOrder.subtotal + state.currentOrder.tax;
        }
        
        // Update in orders list
        const orderIndex = state.orders.findIndex(order => order.id === orderId);
        if (orderIndex >= 0) {
          state.orders[orderIndex].items.push(item);
          state.orders[orderIndex].subtotal += item.price * item.quantity;
          state.orders[orderIndex].total = state.orders[orderIndex].subtotal + state.orders[orderIndex].tax;
        }
        
        state.lastUpdated = new Date().toISOString();
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(addOrderItem.rejected, (state, action) => {
        state.isAddingItem = false;
        state.error = action.payload?.message || 'Failed to add item to order';
        state.lastError = action.payload || null;
        if (action.payload?.validationErrors) {
          state.validationErrors = formatValidationErrors(action.payload.validationErrors);
        }
      });

    // Update order item
    builder
      .addCase(updateOrderItem.pending, (state) => {
        state.isUpdatingItem = true;
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(updateOrderItem.fulfilled, (state, action) => {
        state.isUpdatingItem = false;
        const { orderId, item } = action.payload;
        
        // Update current order
        if (state.currentOrder && state.currentOrder.id === orderId) {
          const itemIndex = state.currentOrder.items.findIndex(i => i.id === item.id);
          if (itemIndex >= 0) {
            state.currentOrder.items[itemIndex] = item;
          }
        }
        
        // Update in orders list
        const orderIndex = state.orders.findIndex(order => order.id === orderId);
        if (orderIndex >= 0) {
          const itemIndex = state.orders[orderIndex].items.findIndex(i => i.id === item.id);
          if (itemIndex >= 0) {
            state.orders[orderIndex].items[itemIndex] = item;
          }
        }
        
        state.lastUpdated = new Date().toISOString();
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(updateOrderItem.rejected, (state, action) => {
        state.isUpdatingItem = false;
        state.error = action.payload?.message || 'Failed to update order item';
        state.lastError = action.payload || null;
        if (action.payload?.validationErrors) {
          state.validationErrors = formatValidationErrors(action.payload.validationErrors);
        }
      });

    // Remove order item
    builder
      .addCase(removeOrderItem.pending, (state) => {
        state.isRemovingItem = true;
        state.error = null;
      })
      .addCase(removeOrderItem.fulfilled, (state, action) => {
        state.isRemovingItem = false;
        const { orderId, itemId } = action.payload;
        
        // Update current order
        if (state.currentOrder && state.currentOrder.id === orderId) {
          state.currentOrder.items = state.currentOrder.items.filter(item => item.id !== itemId);
        }
        
        // Update in orders list
        const orderIndex = state.orders.findIndex(order => order.id === orderId);
        if (orderIndex >= 0) {
          state.orders[orderIndex].items = state.orders[orderIndex].items.filter(item => item.id !== itemId);
        }
        
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(removeOrderItem.rejected, (state, action) => {
        state.isRemovingItem = false;
        state.error = action.payload?.message || 'Failed to remove order item';
        state.lastError = action.payload || null;
      });

    // Close order
    builder
      .addCase(closeOrder.pending, (state) => {
        state.isClosing = true;
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(closeOrder.fulfilled, (state, action) => {
        state.isClosing = false;
        const closedOrder = action.payload;
        
        // Update current order
        if (state.currentOrder && state.currentOrder.id === closedOrder.id) {
          state.currentOrder = closedOrder;
        }
        
        // Update in orders list
        const orderIndex = state.orders.findIndex(order => order.id === closedOrder.id);
        if (orderIndex >= 0) {
          state.orders[orderIndex] = closedOrder;
        }
        
        state.lastUpdated = new Date().toISOString();
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(closeOrder.rejected, (state, action) => {
        state.isClosing = false;
        state.error = action.payload?.message || 'Failed to close order';
        state.lastError = action.payload || null;
        if (action.payload?.validationErrors) {
          state.validationErrors = formatValidationErrors(action.payload.validationErrors);
        }
      });
  },
});

// Selectors
export const selectOrders = (state: { orders: OrderState }) => state.orders;
export const selectOrdersList = (state: { orders: OrderState }) => state.orders.orders;
export const selectCurrentOrder = (state: { orders: OrderState }) => state.orders.currentOrder;
export const selectOrdersLoading = (state: { orders: OrderState }) => state.orders.isLoading;
export const selectOrdersCreating = (state: { orders: OrderState }) => state.orders.isCreating;
export const selectOrdersError = (state: { orders: OrderState }) => state.orders.error;
export const selectOrdersValidationErrors = (state: { orders: OrderState }) => state.orders.validationErrors;
export const selectOrdersPagination = (state: { orders: OrderState }) => state.orders.pagination;
export const selectOrdersFilters = (state: { orders: OrderState }) => state.orders.filters;
export const selectSelectedOrders = (state: { orders: OrderState }) => state.orders.selectedOrders;

// Computed selectors
export const selectActiveOrders = (state: { orders: OrderState }) => 
  state.orders.orders.filter(order => order.status === 'active');

export const selectOrdersByTable = (tableId: number) => 
  (state: { orders: OrderState }) => 
    state.orders.orders.filter(order => order.table_id === tableId);

export const selectOrdersByStatus = (status: string) => 
  (state: { orders: OrderState }) => 
    state.orders.orders.filter(order => order.status === status);

export const selectTotalOrdersValue = (state: { orders: OrderState }) => 
  state.orders.orders.reduce((total, order) => total + order.total, 0);

// Actions
export const {
  clearError,
  clearFieldError,
  setCurrentOrder,
  clearCurrentOrder,
  setFilter,
  clearFilters,
  setSearch,
  setPage,
  setPageSize,
  selectOrders: selectOrdersAction,
  toggleOrderSelection,
  selectAllOrders,
  clearSelection,
} = orderSlice.actions;

export default orderSlice.reducer;