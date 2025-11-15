// ============================================
// MENU CORE TYPES
// ============================================

import type { PaginationInfo } from './pagination';

// Menu and Category types
export type MenuItemStatus = 'available' | 'unavailable' | 'out-of-stock';
export type CategoryStatus = 'active' | 'inactive';
export type AllergenType = 'nuts' | 'dairy' | 'gluten' | 'seafood' | 'eggs' | 'soy' | 'shellfish';

export interface Allergen {
  type: AllergenType;
  severity: 'mild' | 'moderate' | 'severe';
}

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  image?: string;
  status?: CategoryStatus;
  is_active?: boolean; // backward compatibility
  sortOrder?: number;
  sort_order?: number; // API format
  createdAt?: string;
  updatedAt?: string;
  created_at?: string; // API format
  updated_at?: string; // API format
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  categoryId: number;
  category_id?: number; // API format
  category?: Category;
  image?: string;
  image_url?: string; // API format
  status: MenuItemStatus;
  is_active?: boolean; // API format
  is_available?: boolean; // API format
  preparationTime: number; // in minutes
  preparation_time?: number; // API format
  cost?: number;
  ingredients: string[];
  allergens: Allergen[] | string[]; // string[] for API compatibility
  nutritionalInfo?: NutritionalInfo;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isSpicy: boolean;
  spiceLevel?: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  variants?: MenuItemVariant[];
  sort_order?: number;
  createdAt: string;
  updatedAt: string;
  created_at?: string; // API format
  updated_at?: string; // API format
}

export interface MenuItemVariant {
  id: number;
  name: string;
  price: number;
  description?: string;
}

// Form data interfaces for backward compatibility with existing forms
export interface CategoryFormData {
  name: string;
  description?: string;
  image?: string;
  is_active?: boolean; // backward compatibility
  status?: CategoryStatus;
  sortOrder?: number;
  sort_order?: number;
}

export interface MenuItemFormData {
  name: string;
  description: string;
  price: number;
  category_id: number; // backward compatibility
  categoryId?: number;
  image?: string;
  is_active?: boolean; // backward compatibility  
  status?: MenuItemStatus;
  preparation_time?: number; // backward compatibility
  preparationTime?: number;
  ingredients: string | string[]; // backward compatibility - can be string or array
  allergens: string | string[]; // backward compatibility - can be string or array
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isSpicy?: boolean;
  spiceLevel?: number;
  tags?: string[];
}

// ============================================
// MENU API TYPES
// ============================================

// API-specific interfaces (from api/menu.ts)
export interface CreateCategoryData {
  name: string;
  description?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {}

export interface CreateMenuItemData {
  category_id: number;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  is_active?: boolean;
  is_available?: boolean;
  preparation_time?: number;
  allergens?: string[];
  ingredients?: string[];
  sort_order?: number;
}

export interface UpdateMenuItemData extends Partial<CreateMenuItemData> {}

// API Filter interfaces
export interface CategoryFilters {
  searchTerm?: string;
  status?: CategoryStatus;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

export interface MenuItemFilters {
  category_id?: number;
  category?: number;
  is_active?: boolean;
  is_available?: boolean;
  status?: MenuItemStatus;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  maxPrice?: number;
  minPrice?: number;
  allergens?: AllergenType[];
  searchTerm?: string;
  page?: number;
  limit?: number;
}

// API response interfaces
export interface CategoriesResponse {
  data?: Category[];
  categories?: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

export interface MenuItemsResponse {
  data?: MenuItem[];
  items?: MenuItem[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

// Create/Update request interfaces
export interface CreateMenuItemRequest extends Omit<MenuItemFormData, 'id'> {}
export interface UpdateMenuItemRequest extends Partial<CreateMenuItemRequest> {
  id: number;
}

export interface CreateCategoryRequest extends Omit<CategoryFormData, 'id'> {}
export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  id: number;
}

// ============================================
// MENU COMPONENT PROPS
// ============================================

export interface CategoryFilterOptions {
  searchTerm: string;
  statusFilter: 'all' | 'active' | 'inactive';
}

export interface CategoryFiltersProps {
  filters: CategoryFilterOptions;
  onFiltersChange: (filters: Partial<CategoryFilterOptions>) => void;
  onResetFilters?: () => void;
  totalCategories?: number;
  activeCategories?: number;
}

export interface CategoryFormProps {
  initialData?: Partial<Category>;
  isEdit?: boolean;
  onSubmit: (data: any) => Promise<void> | void;
  onCancel: () => void;
  isLoading?: boolean;
  categories?: Category[];
}

export interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  editingCategory?: Category | null;
  loading?: boolean;
}

export interface CategoryListProps {
  categories: Category[];
  loading?: boolean;
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
  onToggleStatus?: (id: number) => void;
  hasFilters?: boolean;
}

export interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
  onToggleStatus?: (id: number) => void;
  isLoading?: boolean;
  itemCount?: number;
}

export interface MenuItemFilterOptions {
  searchTerm: string;
  categoryFilter: number | 'all';
  statusFilter: 'all' | 'active' | 'inactive';
  availabilityFilter: 'all' | 'available' | 'unavailable';
}

export interface MenuItemFiltersProps {
  filters: MenuItemFilterOptions;
  onFiltersChange: (filters: Partial<MenuItemFilterOptions>) => void;
  onResetFilters?: () => void;
  onReset?: () => void; // Alias for backward compatibility
  onAddItem?: () => void;
  categories: Category[];
  totalItems?: number;
  activeItems?: number;
  totalCount?: number; // Alias for backward compatibility
  filteredCount?: number;
  loading?: boolean;
}

export interface MenuItemFormProps {
  initialData?: Partial<MenuItemFormData>;
  isEdit?: boolean;
  onSubmit: (data: MenuItemFormData) => Promise<void> | void;
  onCancel: () => void;
  isLoading?: boolean;
  categories: Category[];
}

export interface MenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMenuItemRequest) => Promise<void>;
  editingItem?: MenuItem | null;
  categories: Category[];
  loading?: boolean;
}

export interface MenuItemListProps {
  menuItems?: MenuItem[]; // Original prop name
  items?: MenuItem[]; // Alias for backward compatibility
  loading?: boolean;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: number, name: string) => void;
  onToggleAvailability?: (id: number, currentStatus: boolean) => void;
  onToggleStatus?: (id: number, currentStatus: boolean, name: string) => void;
  onUploadImage?: (id: number) => void;
  hasFilters?: boolean;
}

export interface ItemCardProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: number) => void;
}

export interface MenuFiltersProps {
  filters: any; // MenuFilters type from hooks
  onFiltersChange: (filters: Partial<any>) => void;
  onReset: () => void;
  totalItemsCount: number;
  filteredItemsCount: number;
  totalCategoriesCount: number;
  categories: Array<{ id: number; name: string; is_active?: boolean }>;
  viewMode?: 'items' | 'categories';
  onViewModeChange?: (mode: 'items' | 'categories') => void;
}

// ============================================
// MENU MANAGEMENT HOOK TYPES
// ============================================

export type CategoryFilter = 'all' | 'active' | 'inactive';
export type MenuItemFilter = 'all' | 'active' | 'inactive';

export interface CategoryStats {
  total: number;
  active: number;
  inactive: number;
}

export interface MenuItemStats {
  total: number;
  active: number;
  inactive: number;
  available: number;
  unavailable: number;
}

// Category Management Hook Return Type
export interface UseCategoryManagementReturn {
  // Data
  categories: Category[];
  filteredCategories: Category[];
  selectedCategory: Category | null;
  editingCategory: Category | null;
  selectedItems: number[];

  // UI State
  viewMode: 'grid' | 'list';
  statusFilter: CategoryFilter;
  searchTerm: string;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  validationErrors: Record<string, string[]>;
  pagination: PaginationInfo;
  categoryStats: CategoryStats;

  // CRUD Actions
  fetchCategories: () => Promise<void>;
  createCategory: (data: CreateCategoryData) => Promise<void>;
  updateCategory: (id: number, data: UpdateCategoryData) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  updateCategoryStatus: (id: number, isActive: boolean) => Promise<void>;

  // Selection Actions
  setSelectedCategory: (category: Category | null) => void;
  setEditingCategory: (category: Category | null) => void;
  toggleItemSelection: (id: number) => void;
  selectAllItems: () => void;
  clearSelection: () => void;

  // Pagination Actions
  goToPage: (page: number) => void;
  setPerPage: (perPage: number) => void;

  // Filter Actions
  setViewMode: (mode: 'grid' | 'list') => void;
  setStatusFilter: (filter: CategoryFilter) => void;
  setSearchTerm: (term: string) => void;
  clearError: () => void;
  clearSuccessMessage: () => void;
}

// Menu Item Management Hook Return Type
export interface UseMenuItemManagementReturn {
  // Data
  menuItems: MenuItem[];
  filteredMenuItems: MenuItem[];
  categories: Category[];
  selectedMenuItem: MenuItem | null;
  editingMenuItem: MenuItem | null;
  selectedItems: number[];

  // UI State
  viewMode: 'grid' | 'list';
  statusFilter: MenuItemFilter;
  categoryFilter: number | 'all';
  availabilityFilter: 'all' | 'available' | 'unavailable';
  searchTerm: string;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  validationErrors: Record<string, string[]>;
  pagination: PaginationInfo;
  menuItemStats: MenuItemStats;

  // CRUD Actions
  fetchMenuItems: () => Promise<void>;
  createMenuItem: (data: CreateMenuItemData) => Promise<void>;
  updateMenuItem: (id: number, data: UpdateMenuItemData) => Promise<void>;
  deleteMenuItem: (id: number) => Promise<void>;
  updateMenuItemStatus: (id: number, isActive: boolean) => Promise<void>;
  updateMenuItemAvailability: (id: number, isAvailable: boolean) => Promise<void>;
  uploadMenuItemImage: (id: number, file: File) => Promise<void>;

  // Selection Actions
  setSelectedMenuItem: (item: MenuItem | null) => void;
  setEditingMenuItem: (item: MenuItem | null) => void;
  toggleItemSelection: (id: number) => void;
  selectAllItems: () => void;
  clearSelection: () => void;

  // Pagination Actions
  goToPage: (page: number) => void;
  setPerPage: (perPage: number) => void;

  // Filter Actions
  setViewMode: (mode: 'grid' | 'list') => void;
  setStatusFilter: (filter: MenuItemFilter) => void;
  setCategoryFilter: (categoryId: number | 'all') => void;
  setAvailabilityFilter: (filter: 'all' | 'available' | 'unavailable') => void;
  setSearchTerm: (term: string) => void;
  clearError: () => void;
  clearSuccessMessage: () => void;
}
