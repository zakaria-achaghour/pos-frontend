/**
 * Dashboard Type Definitions
 * Centralized type definitions for dashboard-related functionality
 */

// ============================================================================
// CORE DASHBOARD TYPES
// ============================================================================

/**
 * Dashboard time period filter options
 */
export type DashboardPeriod = 'today' | 'week' | 'month';

/**
 * Main dashboard metrics interface
 * Contains key performance indicators for the restaurant
 */
export interface DashboardMetrics {
  total_revenue: number;
  total_orders: number;
  paid_orders: number;
  cancelled_orders: number;
  average_order_value: number;
  active_staff: number;
  occupied_tables: number;
  available_tables: number;
}

export interface DashboardPaymentMethodTotal {
  method: string;
  label?: string;
  total: number;
}

export interface DashboardOverviewResponse {
  sales_today: number;
  orders_today: number;
  avg_ticket: number;
  currency?: {
    code: string;
    symbol: string;
    locale?: string;
  };
  payment_methods: DashboardPaymentMethodTotal[];
}

/**
 * Sales chart data structure
 * Used for visualizing sales trends over time
 */
export interface SalesChart {
  labels: string[];
  data: number[];
  revenue: number[];
}

/**
 * Top selling item data structure
 */
export interface TopItem {
  id: number;
  name: string;
  sold_count: number;
  revenue: number;
  category?: string;
}

/**
 * Staff performance metrics
 */
export interface StaffPerformance {
  id: number;
  name: string;
  orders_completed: number;
  revenue_generated: number;
  hours_worked: number;
  performance_score: number;
}

// ============================================================================
// DASHBOARD API TYPES
// ============================================================================

/**
 * API request parameters for dashboard endpoints
 */
export interface DashboardApiParams {
  period?: DashboardPeriod;
  limit?: number;
}

/**
 * Extended dashboard data structure (for mock/development)
 */
export interface ExtendedDashboardData {
  yesterdayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  completionRate: number;
  totalTables: number;
  averageTurnover: number;
  topPerformer: {
    name: string;
    ordersCompleted: number;
    revenue: number;
  };
  paymentMethods: {
    cash: number;
    card: number;
    other: number;
  };
  topItems: Array<{
    name: string;
    sold: number;
    revenue: number;
  }>;
  hourlySales: Array<{
    hour: string;
    sales: number;
    orders: number;
  }>;
}

// ============================================================================
// DASHBOARD COMPONENT PROPS
// ============================================================================

/**
 * Props for dashboard metric cards
 */
export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

/**
 * Props for timeframe selector component
 */
export interface TimeframeSelectorProps {
  selected: DashboardPeriod;
  onChange: (timeframe: DashboardPeriod) => void;
}

/**
 * Props for chart components
 */
export interface ChartDataProps {
  data: SalesChart;
  period: DashboardPeriod;
}
