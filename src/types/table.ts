// ============================================
// TABLE CORE TYPES
// ============================================

// Table management types
export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning' | 'out-of-order' | 'maintenance';
export type TableShape = 'round' | 'square' | 'rectangular' | 'rectangle'; // Added 'rectangle' for backward compatibility
export type ReservationStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed';

export interface TableLocation {
  section: string;
  floor: number;
  coordinates?: {
    x: number;
    y: number;
  };
}

export interface Table {
  id: number;
  number: string;
  capacity: number;
  shape: TableShape;
  status: TableStatus;
  section?: string; // Direct from API
  floor?: number; // Direct from API
  grid_x?: number; // Direct from API
  grid_y?: number; // Direct from API
  location?: TableLocation; // Legacy/optional nested structure
  description?: string;
  features?: string[];
  currentOrder?: number;
  assignedWaiter?: number;
  lastCleaned?: string;
  reservations?: TableReservation[];
  createdAt?: string;
  updatedAt?: string;
  created_at?: string; // API uses snake_case
  updated_at?: string; // API uses snake_case
  restaurant_id?: number;
  qr_code?: string;
}

export interface TableReservation {
  id: number;
  tableId: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  guestCount: number;
  reservationDate: string;
  reservationTime: string;
  duration: number; // in minutes
  status: ReservationStatus;
  specialRequests?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Form data interfaces
export interface TableFormData {
  number: string;
  capacity: number;
  shape: TableShape;
  status: TableStatus;
  section: string;
  floor: number;
  description?: string;
  features: string[];
  coordinates?: {
    x: number;
    y: number;
  };
}

export interface ReservationFormData {
  tableId: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  guestCount: number;
  reservationDate: string;
  reservationTime: string;
  duration: number;
  specialRequests?: string;
  notes?: string;
}

// ============================================
// TABLE API TYPES
// ============================================

// Filter and search interfaces
export interface TableFilters {
  status?: TableStatus;
  capacity?: number;
  minCapacity?: number;
  maxCapacity?: number;
  section?: string;
  floor?: number;
  shape?: TableShape;
  assignedWaiter?: number;
  searchTerm?: string;
}

export interface ReservationFilters {
  status?: ReservationStatus;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  tableId?: number;
  guestCount?: number;
  searchTerm?: string;
}

// API response interfaces
export interface TablesResponse {
  tables: Table[];
  total: number;
  page: number;
  limit: number;
}

export interface ReservationsResponse {
  reservations: TableReservation[];
  total: number;
  page: number;
  limit: number;
}

// Analytics interfaces (matching backend response)
export interface TableAnalytics {
  table_id: number;
  table_number: string;
  capacity: number;
  total_seatings: number;
  total_revenue: number;
  average_revenue_per_seating: number;
  average_occupancy_rate: number;
  average_duration: number;
}

// Aggregate statistics interface
export interface TableStatistics {
  total: number;
  available: number;
  occupied: number;
  reserved: number;
  cleaning: number;
  maintenance: number;
  outOfOrder: number;
  totalCapacity: number;
  occupancyRate: number;
}

export interface TableUtilization {
  tableId: number;
  tableNumber: string;
  totalReservations: number;
  totalRevenue: number;
  averageOccupancyTime: number;
  utilizationRate: number;
}

// Create/Update request interfaces
export interface CreateTableRequest {
  number: string;
  capacity: number;
  shape: TableShape;
  status: TableStatus;
  location: {
    section: string;
    floor: number;
    coordinates?: {
      x: number;
      y: number;
    };
  };
  description?: string;
  features: string[];
}

export interface UpdateTableRequest extends Partial<CreateTableRequest> {
  id: number;
}

export interface CreateReservationRequest extends Omit<ReservationFormData, 'id'> {}
export interface UpdateReservationRequest extends Partial<CreateReservationRequest> {
  id: number;
}

// ============================================
// TABLE COMPONENT PROPS
// ============================================

/** Filter values displayed by the table filter bar. */
export interface TableFilterValues {
  search?: string;
  status?: string;
  shape?: string;
  location?: string;
  minCapacity?: number | string;
  maxCapacity?: number | string;
}

export interface TableFiltersProps {
  filters: TableFilterValues;
  onFilterChange: (key: string, value: string | number | undefined) => void;
  onClearFilters: () => void;
  statusOptions?: Array<{ value: TableStatus; label: string }>;
}

export interface TableFormProps {
  initialData?: Partial<TableFormData>;
  table?: Table; // Alias for backward compatibility
  isEdit?: boolean;
  onSubmit: (data: TableFormData) => Promise<void> | void;
  onCancel: () => void;
  isLoading?: boolean;
  serverErrors?: Record<string, string[]>;
}

export interface TableListProps {
  tables: Table[];
  loading?: boolean;
  onEdit: (table: Table) => void;
  onDelete: (id: number, name: string) => void;
  onStatusChange?: (id: number, status: TableStatus) => void;
  onSelect?: (id: number) => void;
  selectedIds?: number[];
}

export interface TableCardProps {
  table: Table;
  onEdit: (table: Table) => void;
  onDelete: (id: number) => void;
  onStatusChange?: (status: TableStatus) => void;
  isSelected?: boolean;
  onSelect?: () => void;
}

export interface TableStatsData {
  total: number;
  available: number;
  occupied: number;
  reserved: number;
  cleaning: number;
  occupancyRate: number;
  averagePartySize?: number;
  turnoverRate?: number;
}

export interface TableStatsProps {
  stats: TableStatsData;
  loading?: boolean;
  className?: string;
}

export interface EnhancedTableStatsProps {
  className?: string;
}
