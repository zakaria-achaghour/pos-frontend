// Common Redux types and interfaces
export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  validationErrors?: ValidationError[];
}

export interface LoadingState {
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export interface ErrorState {
  error: string | null;
  validationErrors: Record<string, string[]>;
  lastError: ApiError | null;
}

export interface BaseAsyncState extends LoadingState, ErrorState {
  lastUpdated: string | null;
}

export interface PaginationState {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number;
  to: number;
}

export interface FilterState {
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  filters: Record<string, any>;
}

export interface ListState<T extends BaseEntity> extends BaseAsyncState {
  items: T[];
  selectedItems: number[];
  pagination: PaginationState;
  filters: FilterState;
}

export interface DetailState<T extends BaseEntity> extends BaseAsyncState {
  item: T | null;
  history: T[];
}

// Action payload types
export interface CreateActionPayload<T> {
  data: Omit<T, keyof BaseEntity>;
}

export interface UpdateActionPayload<T> {
  id: number;
  data: Partial<Omit<T, keyof BaseEntity>>;
}

export interface DeleteActionPayload {
  id: number;
}

export interface FetchListPayload {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

// Utility types for async thunks
export interface AsyncThunkConfig {
  rejectValue: ApiError;
}