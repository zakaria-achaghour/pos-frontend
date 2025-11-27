export interface CashierShift {
  id: number;
  cashier_id: number;
  cashier_name?: string;
  started_at: string;
  opened_at?: string | null;
  ended_at?: string | null;
  opening_amount: number;
  closing_amount?: number | null;
  opening_note?: string | null;
  closing_note?: string | null;
}

export interface ShiftResponse {
  shift: CashierShift | null;
}

export interface OpenShiftPayload {
  opening_amount: number;
  note?: string;
}

export interface CloseShiftPayload {
  closing_amount: number;
  note?: string;
}

export interface CashierDashboardOrder {
  id: number;
  order_number: string;
  table_label?: string | null;
  total: number;
  payment_method: string;
  paid_at: string;
}

export interface CashierTotalsByMethod {
  method: string;
  amount: number;
}

export interface CashierDashboardTotals {
  overall: number;
  by_method: CashierTotalsByMethod[] | Record<string, number>;
}

export interface CashierDashboardData {
  totals: CashierDashboardTotals;
  shift?: CashierShift | null;
  orders: CashierDashboardOrder[];
}
