/**
 * Component Props Types
 * Centralized type definitions for component props
 * 
 * Note: Feature-specific component props have been moved to their feature type files:
 * - Staff props: src/types/staff.ts
 * - Menu props: src/types/menu.ts
 * - Table props: src/types/table.ts
 * 
 * This file now only contains truly shared/common UI component props.
 */

// ============================================
// COMMON UI COMPONENT PROPS
// ============================================

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (items: number) => void;
  showItemsPerPage?: boolean;
  className?: string;
}

export interface PaginationInfo {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
}

// ============================================
// RESOURCE MANAGEMENT HOOK INTERFACE
// ============================================

/**
 * Generic interface for resource management hooks (staff, tables, menu items, etc.)
 * Provides a consistent structure for CRUD operations and UI state management
 */
export interface UseResourceManagementReturn<
  TResource,
  TFormData,
  TStatus,
  TFilter,
  TStats
> {
  // Data
  items: TResource[];
  filteredItems: TResource[];
  selectedItem: TResource | null;
  editingItem: TResource | null;

  // UI State
  viewMode: 'grid' | 'list';
  filter: TFilter;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  validationErrors: Record<string, string[]>;
  pagination: PaginationInfo;
  selectedItems: number[];

  // Actions
  fetchItems: (page?: number) => Promise<void>;
  createItem: (data: TFormData) => Promise<void>;
  updateItem: (id: number, data: Partial<TFormData>) => Promise<void>;
  deleteItem: (id: number) => Promise<void>;
  updateItemStatus: (id: number, status: TStatus) => Promise<void>;
  bulkUpdateStatus: (ids: number[], status: TStatus) => Promise<void>;
  goToPage: (page: number) => void;

  // UI Actions
  setViewMode: (mode: 'grid' | 'list') => void;
  setFilter: (filter: TFilter) => void;
  setSelectedItem: (item: TResource | null) => void;
  setEditingItem: (item: TResource | null) => void;
  clearError: () => void;
  clearSuccessMessage: () => void;
  toggleItemSelection: (id: number) => void;
  clearSelection: () => void;

  // Computed values
  stats: TStats;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export interface ToastProps {
  id?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  title?: string;
  duration?: number;
  onClose?: () => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  fullScreen?: boolean;
  message?: string;
}

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

// ============================================
// FORM COMPONENT PROPS
// ============================================

export interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'time' | 'datetime-local';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helpText?: string;
  className?: string;
}

export interface SelectFieldProps extends Omit<FormFieldProps, 'type'> {
  options: Array<{ value: string | number; label: string; disabled?: boolean }>;
  multiple?: boolean;
  searchable?: boolean;
}

export interface TextAreaFieldProps extends Omit<FormFieldProps, 'type'> {
  rows?: number;
  maxLength?: number;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export interface CheckboxFieldProps {
  name: string;
  label: string;
  checked?: boolean;
  disabled?: boolean;
  error?: string;
  onChange?: (checked: boolean) => void;
}

export interface RadioGroupProps {
  name: string;
  label?: string;
  options: Array<{ value: string | number; label: string; disabled?: boolean }>;
  value?: string | number;
  error?: string;
  onChange?: (value: string | number) => void;
  direction?: 'horizontal' | 'vertical';
}

export interface FileUploadProps {
  name: string;
  label?: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  preview?: boolean;
  error?: string;
  onChange?: (files: File[]) => void;
  onError?: (error: string) => void;
}

// ============================================
// FILTER AND SEARCH PROPS
// ============================================

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  showClearButton?: boolean;
  className?: string;
}

export interface FilterBarProps {
  filters: Record<string, any>;
  onFilterChange: (key: string, value: any) => void;
  onClearFilters: () => void;
  children?: React.ReactNode;
  className?: string;
}

export interface SortProps {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  options: Array<{ value: string; label: string }>;
}
