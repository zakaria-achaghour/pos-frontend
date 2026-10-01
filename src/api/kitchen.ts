import apiClient from './client';
import type { PaginatedResponse } from './client';
import type {
  KitchenTicket,
  KitchenTicketItem,
  KitchenTicketStatus,
  KitchenFilters,
  KitchenAnalytics,
  AssignTicketRequest,
  UpdateTicketPriorityRequest,
} from '@/types/kitchen';
import { asApiError } from '@/utils/apiError';

/**
 * Helper to unwrap API responses that may or may not be wrapped in { data: ... }
 */
function unwrapResponse<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

/** Order item as returned by the backend (before mapping to KitchenTicketItem). */
interface RawOrderItem {
  id: number;
  menu_item_id: number;
  quantity: number;
  special_instructions: string | null;
  removed_ingredients: string[] | null;
  added_extras: string[] | null;
  state?: KitchenTicketStatus;
  menu_item: {
    id: number;
    name: string;
    description: string;
    preparation_time: number;
    category_id: number;
  };
}

/** Ticket as returned by the backend: order carries `order_items` instead of `items`. */
type RawKitchenTicket = Omit<KitchenTicket, 'items' | 'order'> & {
  order?: KitchenTicket['order'] & { order_items?: RawOrderItem[] };
};

export const kitchenAPI = {
  /**
   * Get all kitchen tickets with filters and pagination
   */
  getTickets: async (filters: KitchenFilters & { 
    page?: number; 
    per_page?: number;
  } = {}): Promise<PaginatedResponse<KitchenTicket>> => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
      
      const response = await apiClient.get(`/kitchen/tickets?${params}`);
      
      // Transform backend response to match frontend KitchenTicket type
      const transformTicket = (ticket: RawKitchenTicket): KitchenTicket => {
        // Map order_items to items array with proper structure
        const items = ticket.order?.order_items?.map((orderItem): KitchenTicketItem => ({
          id: orderItem.id,
          order_item_id: orderItem.id,
          menu_item_id: orderItem.menu_item_id,
          quantity: orderItem.quantity,
          special_instructions: orderItem.special_instructions,
          removed_ingredients: orderItem.removed_ingredients,
          added_extras: orderItem.added_extras,
          status: orderItem.state || ticket.status, // Use item state or fallback to ticket status
          menu_item: {
            id: orderItem.menu_item.id,
            name: orderItem.menu_item.name,
            description: orderItem.menu_item.description,
            preparation_time: orderItem.menu_item.preparation_time,
            category: {
              id: orderItem.menu_item.category_id,
              name: 'Category' // Backend doesn't include category name, you may need to add it
            }
          }
        })) || [];

        return {
          ...ticket,
          items
        } as KitchenTicket;
      };
      
      // Handle both paginated response and direct array response
      if (response.data.data && Array.isArray(response.data.data)) {
        return {
          ...response.data,
          data: response.data.data.map(transformTicket)
        } as PaginatedResponse<KitchenTicket>;
      } else if (Array.isArray(response.data)) {
        // Direct array response - create pagination structure
        return {
          data: response.data.map(transformTicket),
          current_page: 1,
          last_page: 1,
          per_page: response.data.length,
          total: response.data.length,
          from: 1,
          to: response.data.length
        };
      }
      
      return {
        ...response.data,
        data: response.data.data.map(transformTicket)
      } as PaginatedResponse<KitchenTicket>;
    } catch (errorRaw) {
      const error = asApiError(errorRaw);
      console.error('❌ Error fetching kitchen tickets:', error);
      throw error;
    }
  },

  /**
   * Get single kitchen ticket
   */
  getTicket: async (id: number): Promise<KitchenTicket> => {
    const response = await apiClient.get(`/kitchen/tickets/${id}`);
    const ticket = unwrapResponse<RawKitchenTicket>(response.data);
    
    // Transform backend response to match frontend type
    const items = ticket.order?.order_items?.map((orderItem): KitchenTicketItem => ({
      id: orderItem.id,
      order_item_id: orderItem.id,
      menu_item_id: orderItem.menu_item_id,
      quantity: orderItem.quantity,
      special_instructions: orderItem.special_instructions,
      removed_ingredients: orderItem.removed_ingredients,
      added_extras: orderItem.added_extras,
      status: orderItem.state || ticket.status,
      menu_item: {
        id: orderItem.menu_item.id,
        name: orderItem.menu_item.name,
        description: orderItem.menu_item.description,
        preparation_time: orderItem.menu_item.preparation_time,
        category: {
          id: orderItem.menu_item.category_id,
          name: 'Category'
        }
      }
    })) || [];

    return {
      ...ticket,
      items
    } as KitchenTicket;
  },

  /**
   * Assign ticket to chef and station
   */
  assignTicket: async (ticketId: number, data: AssignTicketRequest): Promise<KitchenTicket> => {
    const response = await apiClient.post(`/kitchen/tickets/${ticketId}/assign`, data);
    return unwrapResponse<KitchenTicket>(response.data);
  },

  /**
   * Start ticket preparation (pending → preparing)
   */
  startPreparation: async (ticketId: number): Promise<KitchenTicket> => {
    const response = await apiClient.post(`/kitchen/tickets/${ticketId}/start`);
    return unwrapResponse<KitchenTicket>(response.data);
  },

  /**
   * Complete ticket preparation (preparing → ready)
   * Sets status to ready, fills completed_at and preparation_time
   */
  completeTicket: async (ticketId: number): Promise<KitchenTicket> => {
    const response = await apiClient.post(`/kitchen/tickets/${ticketId}/complete`);
    return unwrapResponse<KitchenTicket>(response.data);
  },

  /**
   * Update ticket priority
   */
  updatePriority: async (ticketId: number, data: UpdateTicketPriorityRequest): Promise<KitchenTicket> => {
    const response = await apiClient.put(`/kitchen/tickets/${ticketId}/priority`, data);
    return unwrapResponse<KitchenTicket>(response.data);
  },

  /**
   * Get kitchen analytics
   */
  getAnalytics: async (period: 'today' | 'week' | 'month' = 'today'): Promise<KitchenAnalytics> => {
    const response = await apiClient.get(`/kitchen/analytics?period=${period}`);
    return unwrapResponse<KitchenAnalytics>(response.data);
  },
};

export default kitchenAPI;
