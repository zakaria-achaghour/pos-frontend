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
  location: TableLocation;
  description?: string;
  features: string[];
  currentOrder?: number;
  assignedWaiter?: number;
  lastCleaned?: string;
  reservations?: TableReservation[];
  createdAt: string;
  updatedAt: string;
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

// Analytics interfaces
export interface TableAnalytics {
  totalTables: number;
  availableTables: number;
  occupiedTables: number;
  reservedTables: number;
  outOfOrderTables: number;
  averageOccupancy: number;
  turnaroundTime: number;
  revenuePerTable: number;
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
export interface CreateTableRequest extends Omit<TableFormData, 'id'> {}
export interface UpdateTableRequest extends Partial<CreateTableRequest> {
  id: number;
}

export interface CreateReservationRequest extends Omit<ReservationFormData, 'id'> {}
export interface UpdateReservationRequest extends Partial<CreateReservationRequest> {
  id: number;
}