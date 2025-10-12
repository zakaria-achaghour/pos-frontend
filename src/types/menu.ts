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
  createdAt?: string;
  updatedAt?: string;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  categoryId: number;
  category?: Category;
  image?: string;
  status: MenuItemStatus;
  preparationTime: number; // in minutes
  ingredients: string[];
  allergens: Allergen[];
  nutritionalInfo?: NutritionalInfo;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isSpicy: boolean;
  spiceLevel?: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  variants?: MenuItemVariant[];
  createdAt: string;
  updatedAt: string;
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

// Filter and search interfaces
export interface MenuFilters {
  category?: number;
  status?: MenuItemStatus;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  maxPrice?: number;
  minPrice?: number;
  allergens?: AllergenType[];
  searchTerm?: string;
}

export interface CategoryFilters {
  status?: CategoryStatus;
  searchTerm?: string;
}

// API response interfaces
export interface MenuItemsResponse {
  items: MenuItem[];
  total: number;
  page: number;
  limit: number;
}

export interface CategoriesResponse {
  categories: Category[];
  total: number;
  page: number;
  limit: number;
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