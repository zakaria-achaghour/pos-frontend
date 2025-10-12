// Common utility types and shared interfaces
export interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface TimestampedEntity extends BaseEntity {
  createdBy?: number;
  updatedBy?: number;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: ValidationError[];
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: any;
}

// Loading and async states
export interface LoadingState {
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export interface ErrorState {
  error: string | null;
  validationErrors: ValidationError[];
}

export interface AsyncState extends LoadingState, ErrorState {
  lastFetch?: string;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Filters
export interface BaseFilters {
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterState extends BaseFilters {
  activeFilters: Record<string, any>;
  isFiltered: boolean;
}

// Generic list state
export interface ListState<T extends BaseEntity> extends AsyncState {
  items: T[];
  pagination: PaginationState;
  filters: FilterState;
  selectedItems: number[];
  selectedItem: T | null;
}

// Generic detail state
export interface DetailState<T extends BaseEntity> extends AsyncState {
  item: T | null;
  isEditing: boolean;
}

// Form states
export interface FormState<T = any> {
  data: T;
  errors: Record<string, string>;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
}

// Modal states
export interface ModalState {
  isOpen: boolean;
  type?: string;
  data?: any;
}

// Theme and UI
export type Theme = 'light' | 'dark' | 'auto';
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Variant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type Status = 'idle' | 'loading' | 'success' | 'error';

// Notification types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  createdAt: string;
}

// User permissions
export type Permission = 
  | 'read:menu' | 'write:menu' | 'delete:menu'
  | 'read:orders' | 'write:orders' | 'delete:orders'
  | 'read:tables' | 'write:tables' | 'delete:tables'
  | 'read:staff' | 'write:staff' | 'delete:staff'
  | 'read:customers' | 'write:customers' | 'delete:customers'
  | 'read:analytics' | 'write:analytics'
  | 'read:settings' | 'write:settings'
  | 'manage:restaurant' | 'manage:payments';

export interface UserPermissions {
  permissions: Permission[];
  canAccess: (permission: Permission) => boolean;
  canAccessAny: (permissions: Permission[]) => boolean;
  canAccessAll: (permissions: Permission[]) => boolean;
}

// File upload types
export interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

export interface ImageUpload extends FileUpload {
  preview: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

// Search and autocomplete
export interface SearchResult<T = any> {
  id: string | number;
  title: string;
  subtitle?: string;
  description?: string;
  type: string;
  data: T;
  relevance: number;
}

export interface AutocompleteOption {
  value: string | number;
  label: string;
  description?: string;
  disabled?: boolean;
  group?: string;
}

// Address and location
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  accuracy?: number;
}

// Date and time utilities
export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface TimeRange {
  startTime: string;
  endTime: string;
}

export interface DateTimeRange extends DateRange, TimeRange {}

// Currency and money
export interface Money {
  amount: number;
  currency: string;
  formatted: string;
}

export interface TaxCalculation {
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}

// Generic CRUD operations
export interface CrudOperations<T, CreateData, UpdateData> {
  list: (params?: any) => Promise<PaginatedResponse<T>>;
  get: (id: number) => Promise<T>;
  create: (data: CreateData) => Promise<T>;
  update: (id: number, data: UpdateData) => Promise<T>;
  delete: (id: number) => Promise<void>;
}

// Export all types
export * from './staff';
export * from './menu';
export * from './table';
export * from './order';
export * from './customer';
export * from './restaurant';