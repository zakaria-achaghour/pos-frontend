// Type mappers for converting between API responses and frontend types
import type { Category as ApiCategory, MenuItem as ApiMenuItem } from '../api/menu';
import type { Category, MenuItem } from '../types/menu';

/**
 * Maps API Category (snake_case) to frontend Category (camelCase)
 */
export const mapApiCategoryToFrontend = (apiCategory: ApiCategory): Category => {
  return {
    id: apiCategory.id,
    name: apiCategory.name,
    description: apiCategory.description || '',
    is_active: apiCategory.is_active, // Keep backward compatibility
    status: apiCategory.is_active ? 'active' : 'inactive',
    sortOrder: apiCategory.sort_order || 0,
    createdAt: apiCategory.created_at,
    updatedAt: apiCategory.updated_at,
  };
};

/**
 * Maps frontend Category to API Category format
 */
export const mapFrontendCategoryToApi = (category: Partial<Category>): Partial<ApiCategory> => {
  return {
    name: category.name,
    description: category.description,
    is_active: category.is_active ?? (category.status === 'active'),
    sort_order: category.sortOrder,
  };
};

/**
 * Maps API MenuItem (snake_case) to frontend MenuItem (camelCase)
 */
export const mapApiMenuItemToFrontend = (apiItem: ApiMenuItem): MenuItem => {
  return {
    id: apiItem.id,
    name: apiItem.name,
    description: apiItem.description || '',
    price: apiItem.price,
    categoryId: apiItem.category_id,
    category: apiItem.category ? mapApiCategoryToFrontend(apiItem.category) : undefined,
    image: apiItem.image_url,
    status: apiItem.is_active && apiItem.is_available ? 'available' : 'unavailable',
    preparationTime: apiItem.preparation_time || 15,
    ingredients: apiItem.ingredients || [],
    allergens: (apiItem.allergens || []).map(allergen => ({
      type: allergen as any, // Will need proper mapping based on backend format
      severity: 'mild' as const
    })),
    isVegetarian: false, // Default values - backend doesn't provide these yet
    isVegan: false,
    isGlutenFree: false,
    isSpicy: false,
    tags: [],
    createdAt: apiItem.created_at,
    updatedAt: apiItem.updated_at,
  };
};

/**
 * Maps frontend MenuItem to API MenuItem format
 */
export const mapFrontendMenuItemToApi = (item: Partial<MenuItem>): Partial<ApiMenuItem> => {
  return {
    category_id: item.categoryId,
    name: item.name,
    description: item.description,
    price: item.price,
    is_active: item.status === 'available' || item.status === 'unavailable',
    is_available: item.status === 'available',
    preparation_time: item.preparationTime,
    ingredients: Array.isArray(item.ingredients) ? item.ingredients : 
                 typeof item.ingredients === 'string' ? [item.ingredients] : [],
    allergens: Array.isArray(item.allergens) ? 
               item.allergens.map(a => typeof a === 'string' ? a : a.type) :
               typeof item.allergens === 'string' ? [item.allergens] : [],
    image_url: item.image,
  };
};

/**
 * Maps array of API categories to frontend categories
 */
export const mapApiCategoriesToFrontend = (apiCategories: ApiCategory[]): Category[] => {
  return apiCategories.map(mapApiCategoryToFrontend);
};

/**
 * Maps array of API menu items to frontend menu items
 */
export const mapApiMenuItemsToFrontend = (apiItems: ApiMenuItem[]): MenuItem[] => {
  return apiItems.map(mapApiMenuItemToFrontend);
};

// Helper functions for form data mapping
export const mapFormDataToApiCategory = (formData: any) => {
  return {
    name: formData.name,
    description: formData.description,
    is_active: formData.is_active ?? true,
    sort_order: formData.sortOrder ?? 0,
  };
};

export const mapFormDataToApiMenuItem = (formData: any) => {
  return {
    category_id: formData.category_id || formData.categoryId,
    name: formData.name,
    description: formData.description,
    price: formData.price,
    is_active: formData.is_active ?? true,
    is_available: formData.is_active ?? true,
    preparation_time: formData.preparation_time || formData.preparationTime || 15,
    ingredients: typeof formData.ingredients === 'string' ? 
                 formData.ingredients.split(',').map((s: string) => s.trim()) : 
                 formData.ingredients || [],
    allergens: typeof formData.allergens === 'string' ? 
               formData.allergens.split(',').map((s: string) => s.trim()) : 
               formData.allergens || [],
    image_url: formData.image,
  };
};