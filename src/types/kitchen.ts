// Kitchen Types
export type KitchenTicketStatus = 'pending' | 'preparing' | 'ready' | 'completed';
export type KitchenPriority = 'normal' | 'high' | 'urgent';
export type CookingStation = 'grill' | 'fryer' | 'salad' | 'dessert' | 'beverages' | 'general';

// Simplified Order Item (for display purposes)
// Note: Items now have individual status. When all items reach same status, order auto-updates
export interface OrderItem {
  id: number;
  menu_item_id: number;
  name: string;
  quantity: number;
  unit_price: string;
  subtotal: string;
  status: 'pending' | 'preparing' | 'ready'; // Item-level status
  special_instructions?: string;
  removed_ingredients?: string[];
  added_extras?: string[];
}

// Simplified Kitchen Order (matches backend response structure)
export interface KitchenOrder {
  id: number;
  ticket_number: string;
  order_id: number;
  table_id?: number;
  table?: {
    id: number;
    number: string;
  };
  type: 'dine-in' | 'takeout' | 'delivery';
  status: 'pending' | 'preparing' | 'ready';
  priority: 'normal' | 'rush' | 'urgent';
  created_at: string;
  estimated_completion?: string;
  special_instructions?: string;
  cooking_station?: string;
  order?: {
    id: number;
    table_id?: number;
    type: string;
    order_items: OrderItem[];
  };
}

// Kitchen Ticket Item
export interface KitchenTicketItem {
  id: number;
  order_item_id: number;
  menu_item_id: number;
  quantity: number;
  special_instructions: string | null;
  removed_ingredients: string[] | null;
  added_extras: string[] | null;
  status: KitchenTicketStatus;
  menu_item: {
    id: number;
    name: string;
    description: string;
    preparation_time: number;
    category: {
      id: number;
      name: string;
    };
  };
}

// Kitchen Ticket
export interface KitchenTicket {
  id: number;
  restaurant_id: number;
  order_id: number;
  ticket_number: string;
  priority: KitchenPriority;
  status: KitchenTicketStatus;
  assigned_chef_id: number | null;
  cooking_station: CookingStation | null;
  started_at: string | null;
  completed_at: string | null;
  preparation_time: number | null;
  special_instructions: string | null;
  created_at: string;
  updated_at: string;
  
  // Relationships
  order: {
    id: number;
    order_number?: string;
    table_id: number | null;
    type: 'dine-in' | 'takeout' | 'delivery';
    customer_name: string | null;
    table?: {
      id: number;
      number: string;
      section: string;
    };
  };
  
  assigned_chef: {
    id: number;
    first_name: string;
    last_name: string;
    role: string;
  } | null;
  
  items: KitchenTicketItem[];
}

// Kitchen Filters
export interface KitchenFilters {
  status?: KitchenTicketStatus;
  priority?: KitchenPriority;
  cooking_station?: CookingStation;
  assigned_chef_id?: number;
  date?: string;
}

// Kitchen Analytics
export interface KitchenAnalytics {
  total_tickets: number;
  pending_tickets: number;
  preparing_tickets: number;
  ready_tickets: number;
  completed_tickets: number;
  average_prep_time: number;
  chef_performance: ChefPerformance[];
  station_utilization: StationUtilization[];
}

export interface ChefPerformance {
  chef_id: number;
  chef_name: string;
  tickets_completed: number;
  average_prep_time: number;
  efficiency_rating: number;
}

export interface StationUtilization {
  cooking_station: CookingStation;
  ticket_count: number;
  avg_prep_time: number;
  utilization_percentage: number;
}

// Request/Response Types
export interface AssignTicketRequest {
  chef_id: number;
  cooking_station?: CookingStation;
}

export interface UpdateTicketStatusRequest {
  status: KitchenTicketStatus;
}

export interface UpdateTicketPriorityRequest {
  priority: KitchenPriority;
}

export interface UpdateItemStatusRequest {
  status: KitchenTicketStatus;
}

// Kitchen Statistics
export interface KitchenStats {
  pending: number;
  preparing: number;
  ready: number;
  urgent_count: number;
  avg_prep_time: string;
}
