// Receipt-related types
export interface ReceiptItem {
  id: number;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
}

export interface ReceiptData {
  id: number;
  order_number: string;
  date: string;
  time: string;
  
  // Restaurant information
  restaurant: {
    name: string;
    address: string;
    phone: string;
    email?: string;
    tax_number?: string;
    logo_url?: string;
  };
  
  // Table and server information
  table_number?: string;
  server_name?: string;
  
  // Order items
  items: ReceiptItem[];
  
  // Financial details
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount?: number;
  discount_type?: 'percentage' | 'fixed';
  service_charge?: number;
  total: number;
  
  // Payment information
  payment_method: string;
  amount_paid?: number;
  change_amount?: number;
  
  // Additional information
  notes?: string;
  footer_message?: string;
  
  // Timestamps
  created_at: string;
  paid_at?: string;
}

export interface ReceiptTemplate {
  id: number;
  name: string;
  header_logo?: boolean;
  show_restaurant_info: boolean;
  show_tax_number: boolean;
  show_server_name: boolean;
  footer_text?: string;
  paper_size: 'thermal' | 'a4' | 'letter';
  font_size: 'small' | 'medium' | 'large';
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReceiptPrintOptions {
  format: 'html' | 'pdf';
  template_id?: number;
  copies?: number;
}

// API Request/Response types
export interface FetchReceiptResponse {
  success: boolean;
  data: ReceiptData;
  message?: string;
}

export interface DownloadReceiptParams {
  order_id: number;
  format: 'pdf' | 'html';
  template_id?: number;
}
