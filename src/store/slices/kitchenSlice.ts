// Kitchen Management Redux Slice
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/client';
import { parseApiError } from '../utils/errorUtils';
import type { LoadingState, ApiError, PaginationState } from '../types/common';

// Kitchen Ticket Types
export interface KitchenTicket {
  id: number;
  order_id: number;
  ticket_number: string;
  status: 'pending' | 'preparing' | 'ready';
  priority: 'normal' | 'rush' | 'urgent';
  assigned_chef_id?: number;
  cooking_station?: string;
  preparation_time?: number;
  estimated_completion?: string;
  special_instructions?: string;
  restaurant_id: number;
  created_at: string;
  updated_at: string;
  order?: {
    id: number;
    table_id: number;
    status: string;
    total: number;
  };
  assignedChef?: {
    id: number;
    first_name: string;
    last_name: string;
    position: string;
  };
}

export interface KitchenAnalytics {
  total_tickets: number;
  completed_tickets: number;
  pending_tickets: number;
  preparing_tickets: number;
  average_prep_time: number;
  chef_performance: Array<{
    chef_id: number;
    chef_name: string;
    tickets_completed: number;
    average_prep_time: number;
  }>;
  station_utilization: Array<{
    cooking_station: string;
    ticket_count: number;
    avg_prep_time: number;
  }>;
}

export interface KitchenFilters {
  status?: 'pending' | 'preparing' | 'ready';
  priority?: 'normal' | 'rush' | 'urgent';
  cooking_station?: string;
}

export interface AssignTicketRequest {
  chef_id: number;
  cooking_station?: string;
}

export interface UpdatePriorityRequest {
  priority: 'normal' | 'rush' | 'urgent';
}

// State Interface
interface KitchenState {
  tickets: KitchenTicket[];
  currentTicket: KitchenTicket | null;
  analytics: KitchenAnalytics | null;
  pagination: PaginationState;
  loading: LoadingState;
  error: ApiError | null;
  filters: KitchenFilters;
}

// Initial State
const initialState: KitchenState = {
  tickets: [],
  currentTicket: null,
  analytics: null,
  pagination: {
    currentPage: 1,
    lastPage: 1,
    perPage: 15,
    total: 0,
    from: 0,
    to: 0
  },
  loading: {
    isLoading: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false
  },
  error: null,
  filters: {}
};

// Async Thunks
export const fetchKitchenTickets = createAsyncThunk(
  'kitchen/fetchTickets',
  async (filters: KitchenFilters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.cooking_station) params.append('cooking_station', filters.cooking_station);

      const response = await api.get(`/kitchen/tickets?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const fetchKitchenTicket = createAsyncThunk(
  'kitchen/fetchTicket',
  async (ticketId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/kitchen/tickets/${ticketId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const assignTicket = createAsyncThunk(
  'kitchen/assignTicket',
  async ({ ticketId, data }: { ticketId: number; data: AssignTicketRequest }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/kitchen/tickets/${ticketId}/assign`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const startTicketPreparation = createAsyncThunk(
  'kitchen/startPreparation',
  async (ticketId: number, { rejectWithValue }) => {
    try {
      const response = await api.post(`/kitchen/tickets/${ticketId}/start`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const completeTicket = createAsyncThunk(
  'kitchen/completeTicket',
  async (ticketId: number, { rejectWithValue }) => {
    try {
      const response = await api.post(`/kitchen/tickets/${ticketId}/complete`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const updateTicketPriority = createAsyncThunk(
  'kitchen/updatePriority',
  async ({ ticketId, data }: { ticketId: number; data: UpdatePriorityRequest }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/kitchen/tickets/${ticketId}/priority`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const fetchKitchenAnalytics = createAsyncThunk(
  'kitchen/fetchAnalytics',
  async (period: 'today' | 'week' | 'month' = 'today', { rejectWithValue }) => {
    try {
      const response = await api.get(`/kitchen/analytics?period=${period}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

// Slice
const kitchenSlice = createSlice({
  name: 'kitchen',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<KitchenFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentTicket: (state) => {
      state.currentTicket = null;
    },
    // Real-time updates for kitchen display
    updateTicketStatus: (state, action: PayloadAction<{ id: number; status: KitchenTicket['status'] }>) => {
      const { id, status } = action.payload;
      const ticket = state.tickets.find(t => t.id === id);
      if (ticket) {
        ticket.status = status;
      }
      if (state.currentTicket?.id === id) {
        state.currentTicket.status = status;
      }
    },
    addNewTicket: (state, action: PayloadAction<KitchenTicket>) => {
      state.tickets.unshift(action.payload);
    }
  },
  extraReducers: (builder) => {
    // Fetch Kitchen Tickets
    builder
      .addCase(fetchKitchenTickets.pending, (state) => {
        state.loading.isLoading = true;
        state.error = null;
      })
      .addCase(fetchKitchenTickets.fulfilled, (state, action) => {
        state.loading.isLoading = false;
        state.tickets = action.payload;
      })
      .addCase(fetchKitchenTickets.rejected, (state, action) => {
        state.loading.isLoading = false;
        state.error = action.payload as ApiError;
      })

      // Fetch Single Kitchen Ticket
      .addCase(fetchKitchenTicket.pending, (state) => {
        state.loading.isLoading = true;
        state.error = null;
      })
      .addCase(fetchKitchenTicket.fulfilled, (state, action) => {
        state.loading.isLoading = false;
        state.currentTicket = action.payload;
      })
      .addCase(fetchKitchenTicket.rejected, (state, action) => {
        state.loading.isLoading = false;
        state.error = action.payload as ApiError;
      })

      // Assign Ticket
      .addCase(assignTicket.pending, (state) => {
        state.loading.isUpdating = true;
        state.error = null;
      })
      .addCase(assignTicket.fulfilled, (state, action) => {
        state.loading.isUpdating = false;
        const updatedTicket = action.payload.ticket;
        const index = state.tickets.findIndex(t => t.id === updatedTicket.id);
        if (index !== -1) {
          state.tickets[index] = updatedTicket;
        }
        if (state.currentTicket?.id === updatedTicket.id) {
          state.currentTicket = updatedTicket;
        }
      })
      .addCase(assignTicket.rejected, (state, action) => {
        state.loading.isUpdating = false;
        state.error = action.payload as ApiError;
      })

      // Start Preparation
      .addCase(startTicketPreparation.pending, (state) => {
        state.loading.isUpdating = true;
        state.error = null;
      })
      .addCase(startTicketPreparation.fulfilled, (state, action) => {
        state.loading.isUpdating = false;
        const updatedTicket = action.payload.ticket;
        const index = state.tickets.findIndex(t => t.id === updatedTicket.id);
        if (index !== -1) {
          state.tickets[index] = updatedTicket;
        }
        if (state.currentTicket?.id === updatedTicket.id) {
          state.currentTicket = updatedTicket;
        }
      })
      .addCase(startTicketPreparation.rejected, (state, action) => {
        state.loading.isUpdating = false;
        state.error = action.payload as ApiError;
      })

      // Complete Ticket
      .addCase(completeTicket.pending, (state) => {
        state.loading.isUpdating = true;
        state.error = null;
      })
      .addCase(completeTicket.fulfilled, (state, action) => {
        state.loading.isUpdating = false;
        const updatedTicket = action.payload.ticket;
        const index = state.tickets.findIndex(t => t.id === updatedTicket.id);
        if (index !== -1) {
          state.tickets[index] = updatedTicket;
        }
        if (state.currentTicket?.id === updatedTicket.id) {
          state.currentTicket = updatedTicket;
        }
      })
      .addCase(completeTicket.rejected, (state, action) => {
        state.loading.isUpdating = false;
        state.error = action.payload as ApiError;
      })

      // Update Priority
      .addCase(updateTicketPriority.pending, (state) => {
        state.loading.isUpdating = true;
        state.error = null;
      })
      .addCase(updateTicketPriority.fulfilled, (state, action) => {
        state.loading.isUpdating = false;
        const updatedTicket = action.payload.ticket;
        const index = state.tickets.findIndex(t => t.id === updatedTicket.id);
        if (index !== -1) {
          state.tickets[index] = updatedTicket;
        }
        if (state.currentTicket?.id === updatedTicket.id) {
          state.currentTicket = updatedTicket;
        }
      })
      .addCase(updateTicketPriority.rejected, (state, action) => {
        state.loading.isUpdating = false;
        state.error = action.payload as ApiError;
      })

      // Kitchen Analytics
      .addCase(fetchKitchenAnalytics.pending, (state) => {
        state.loading.isLoading = true;
        state.error = null;
      })
      .addCase(fetchKitchenAnalytics.fulfilled, (state, action) => {
        state.loading.isLoading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchKitchenAnalytics.rejected, (state, action) => {
        state.loading.isLoading = false;
        state.error = action.payload as ApiError;
      });
  },
});

// Actions
export const {
  setFilters,
  clearFilters,
  clearError,
  clearCurrentTicket,
  updateTicketStatus,
  addNewTicket
} = kitchenSlice.actions;

// Selectors
export const selectKitchenTickets = (state: { kitchen: KitchenState }) => state.kitchen.tickets;
export const selectCurrentKitchenTicket = (state: { kitchen: KitchenState }) => state.kitchen.currentTicket;
export const selectKitchenAnalytics = (state: { kitchen: KitchenState }) => state.kitchen.analytics;
export const selectKitchenLoading = (state: { kitchen: KitchenState }) => state.kitchen.loading;
export const selectKitchenError = (state: { kitchen: KitchenState }) => state.kitchen.error;
export const selectKitchenFilters = (state: { kitchen: KitchenState }) => state.kitchen.filters;

// Filtered selectors
export const selectTicketsByStatus = (status: KitchenTicket['status']) => 
  (state: { kitchen: KitchenState }) => 
    state.kitchen.tickets.filter(ticket => ticket.status === status);

export const selectPendingTickets = (state: { kitchen: KitchenState }) =>
  state.kitchen.tickets.filter(ticket => ticket.status === 'pending');

export const selectPreparingTickets = (state: { kitchen: KitchenState }) =>
  state.kitchen.tickets.filter(ticket => ticket.status === 'preparing');

export const selectReadyTickets = (state: { kitchen: KitchenState }) =>
  state.kitchen.tickets.filter(ticket => ticket.status === 'ready');

export const selectUrgentTickets = (state: { kitchen: KitchenState }) =>
  state.kitchen.tickets.filter(ticket => ticket.priority === 'urgent');

export default kitchenSlice.reducer;