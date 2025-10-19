import { useState, useCallback } from 'react';
import { useAuth } from './useAuthRedux';
import type { 
  Category, 
  MenuItem, 
  CategoryFormData, 
  MenuItemFormData, 
  MenuFilters as BaseMenuFilters,
  CategoryStatus,
  MenuItemStatus
} from '@/types/menu';

// Extended filters for backward compatibility
export interface MenuFilters extends Omit<BaseMenuFilters, 'status'> {
  search: string;
  category_id: number | 'all';
  status: 'all' | 'active' | 'inactive';
  price_range: 'all' | 'low' | 'medium' | 'high';
}

// Mock initial data
const initialCategories: Category[] = [
  { id: 1, name: 'Appetizers', description: 'Starter dishes', is_active: true },
  { id: 2, name: 'Main Courses', description: 'Primary dishes', is_active: true },
  { id: 3, name: 'Desserts', description: 'Sweet treats', is_active: true },
  { id: 4, name: 'Beverages', description: 'Drinks and refreshments', is_active: true },
  { id: 5, name: 'Salads', description: 'Fresh salads', is_active: false },
];

const initialMenuItems: MenuItem[] = [
  { 
    id: 1, 
    name: 'Caesar Salad', 
    price: 85.00, 
    category_id: 1, 
    category_name: 'Appetizers', 
    is_active: true,
    description: 'Fresh romaine lettuce with Caesar dressing',
    preparation_time: 10,
    ingredients: ['Romaine lettuce', 'Caesar dressing', 'Croutons', 'Parmesan cheese'],
    allergens: ['Dairy', 'Gluten']
  },
  { 
    id: 2, 
    name: 'Grilled Chicken', 
    price: 150.00, 
    category_id: 2, 
    category_name: 'Main Courses', 
    is_active: true,
    description: 'Juicy grilled chicken breast with herbs',
    preparation_time: 25,
    ingredients: ['Chicken breast', 'Herbs', 'Olive oil'],
    allergens: []
  },
  { 
    id: 3, 
    name: 'Chocolate Cake', 
    price: 65.00, 
    category_id: 3, 
    category_name: 'Desserts', 
    is_active: false,
    description: 'Rich chocolate cake with chocolate frosting',
    preparation_time: 5,
    ingredients: ['Chocolate', 'Flour', 'Sugar', 'Eggs'],
    allergens: ['Dairy', 'Gluten', 'Eggs']
  },
  { 
    id: 4, 
    name: 'Orange Juice', 
    price: 25.00, 
    category_id: 4, 
    category_name: 'Beverages', 
    is_active: true,
    description: 'Fresh squeezed orange juice',
    preparation_time: 2,
    ingredients: ['Fresh oranges'],
    allergens: []
  },
];

export const useMenuManagement = () => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [filters, setFilters] = useState<MenuFilters>({
    search: '',
    category_id: 'all',
    status: 'all',
    price_range: 'all'
  });

  const { user } = useAuth();

  // Clear message after 3 seconds
  const clearMessage = useCallback(() => {
    setTimeout(() => setMessage(null), 3000);
  }, []);

  // Show message
  const showMessage = useCallback((text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setMessage({ text, type });
    clearMessage();
  }, [clearMessage]);

  // Filter menu items based on current filters
  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         item.description?.toLowerCase().includes(filters.search.toLowerCase());
    const matchesCategory = filters.category_id === 'all' || item.category_id === filters.category_id;
    const matchesStatus = filters.status === 'all' || 
                         (filters.status === 'active' && item.is_active) ||
                         (filters.status === 'inactive' && !item.is_active);
    
    let matchesPriceRange = true;
    if (filters.price_range !== 'all') {
      if (filters.price_range === 'low') matchesPriceRange = item.price < 50;
      else if (filters.price_range === 'medium') matchesPriceRange = item.price >= 50 && item.price < 150;
      else if (filters.price_range === 'high') matchesPriceRange = item.price >= 150;
    }
    
    return matchesSearch && matchesCategory && matchesStatus && matchesPriceRange;
  });

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(filters.search.toLowerCase()) ||
    category.description.toLowerCase().includes(filters.search.toLowerCase())
  );

  // Get menu statistics
  const menuStats = {
    totalItems: menuItems.length,
    activeItems: menuItems.filter(item => item.is_active).length,
    inactiveItems: menuItems.filter(item => !item.is_active).length,
    totalCategories: categories.length,
    activeCategories: categories.filter(cat => cat.is_active).length,
    averagePrice: Math.round(menuItems.reduce((sum, item) => sum + item.price, 0) / menuItems.length),
    priceRange: {
      min: Math.min(...menuItems.map(item => item.price)),
      max: Math.max(...menuItems.map(item => item.price))
    }
  };

  // Category CRUD operations
  const createCategory = useCallback(async (formData: CategoryFormData): Promise<boolean> => {
    if (!formData.name.trim()) {
      showMessage('Please enter a category name', 'error');
      return false;
    }

    // Check for duplicate names
    if (categories.some(cat => cat.name.toLowerCase() === formData.name.toLowerCase())) {
      showMessage('A category with this name already exists', 'error');
      return false;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newCategory: Category = {
        id: Math.max(...categories.map(c => c.id), 0) + 1,
        name: formData.name.trim(),
        description: formData.description.trim(),
        is_active: formData.is_active ?? true
      };

      setCategories(prev => [...prev, newCategory]);
      showMessage(`Category "${newCategory.name}" created successfully!`, 'success');
      return true;
    } catch (error) {
      showMessage('Failed to create category', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [categories, showMessage]);

  const updateCategory = useCallback(async (categoryId: number, formData: CategoryFormData): Promise<boolean> => {
    const existingCategory = categories.find(c => c.id === categoryId);
    if (!existingCategory) {
      showMessage('Category not found', 'error');
      return false;
    }

    if (!formData.name.trim()) {
      showMessage('Please enter a category name', 'error');
      return false;
    }

    // Check for duplicate names (excluding current category)
    if (categories.some(c => c.id !== categoryId && c.name.toLowerCase() === formData.name.toLowerCase())) {
      showMessage('A category with this name already exists', 'error');
      return false;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedCategory: Category = {
        ...existingCategory,
        name: formData.name.trim(),
        description: formData.description.trim(),
        is_active: formData.is_active ?? true
      };

      setCategories(prev => prev.map(cat => 
        cat.id === categoryId ? updatedCategory : cat
      ));
      
      showMessage(`Category "${updatedCategory.name}" updated successfully!`, 'success');
      return true;
    } catch (error) {
      showMessage('Failed to update category', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [categories, showMessage]);

  const deleteCategory = useCallback(async (categoryId: number): Promise<boolean> => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) {
      showMessage('Category not found', 'error');
      return false;
    }

    // Check if category has menu items
    const itemsInCategory = menuItems.filter(item => item.category_id === categoryId);
    if (itemsInCategory.length > 0) {
      showMessage(`Cannot delete category with ${itemsInCategory.length} menu items`, 'error');
      return false;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCategories(prev => prev.filter(c => c.id !== categoryId));
      showMessage(`Category "${category.name}" deleted successfully!`, 'success');
      return true;
    } catch (error) {
      showMessage('Failed to delete category', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [categories, menuItems, showMessage]);

  // Menu Item CRUD operations
  const createMenuItem = useCallback(async (formData: MenuItemFormData): Promise<boolean> => {
    if (!formData.name.trim()) {
      showMessage('Please enter a menu item name', 'error');
      return false;
    }

    const category = categories.find(c => c.id === formData.category_id);
    if (!category) {
      showMessage('Please select a valid category', 'error');
      return false;
    }

    // Check for duplicate names
    if (menuItems.some(item => item.name.toLowerCase() === formData.name.toLowerCase())) {
      showMessage('A menu item with this name already exists', 'error');
      return false;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newMenuItem: MenuItem = {
        id: Math.max(...menuItems.map(item => item.id), 0) + 1,
        name: formData.name.trim(),
        price: formData.price,
        category_id: formData.category_id,
        category_name: category.name,
        is_active: formData.is_active,
        description: formData.description?.trim() || undefined,
        preparation_time: formData.preparation_time || undefined,
        ingredients: formData.ingredients ? formData.ingredients.split(',').map(i => i.trim()) : undefined,
        allergens: formData.allergens ? formData.allergens.split(',').map(a => a.trim()) : undefined
      };

      setMenuItems(prev => [...prev, newMenuItem]);
      showMessage(`Menu item "${newMenuItem.name}" created successfully!`, 'success');
      return true;
    } catch (error) {
      showMessage('Failed to create menu item', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [categories, menuItems, showMessage]);

  const updateMenuItem = useCallback(async (itemId: number, formData: MenuItemFormData): Promise<boolean> => {
    const existingItem = menuItems.find(item => item.id === itemId);
    if (!existingItem) {
      showMessage('Menu item not found', 'error');
      return false;
    }

    if (!formData.name.trim()) {
      showMessage('Please enter a menu item name', 'error');
      return false;
    }

    const category = categories.find(c => c.id === formData.category_id);
    if (!category) {
      showMessage('Please select a valid category', 'error');
      return false;
    }

    // Check for duplicate names (excluding current item)
    if (menuItems.some(item => item.id !== itemId && item.name.toLowerCase() === formData.name.toLowerCase())) {
      showMessage('A menu item with this name already exists', 'error');
      return false;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedMenuItem: MenuItem = {
        ...existingItem,
        name: formData.name.trim(),
        price: formData.price,
        category_id: formData.category_id,
        category_name: category.name,
        is_active: formData.is_active,
        description: formData.description?.trim() || undefined,
        preparation_time: formData.preparation_time || undefined,
        ingredients: formData.ingredients ? formData.ingredients.split(',').map(i => i.trim()) : undefined,
        allergens: formData.allergens ? formData.allergens.split(',').map(a => a.trim()) : undefined
      };

      setMenuItems(prev => prev.map(item => 
        item.id === itemId ? updatedMenuItem : item
      ));
      
      showMessage(`Menu item "${updatedMenuItem.name}" updated successfully!`, 'success');
      return true;
    } catch (error) {
      showMessage('Failed to update menu item', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [categories, menuItems, showMessage]);

  const deleteMenuItem = useCallback(async (itemId: number): Promise<boolean> => {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) {
      showMessage('Menu item not found', 'error');
      return false;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setMenuItems(prev => prev.filter(i => i.id !== itemId));
      showMessage(`Menu item "${item.name}" deleted successfully!`, 'success');
      return true;
    } catch (error) {
      showMessage('Failed to delete menu item', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [menuItems, showMessage]);

  // Toggle item/category status
  const toggleMenuItemStatus = useCallback(async (itemId: number): Promise<boolean> => {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) {
      showMessage('Menu item not found', 'error');
      return false;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setMenuItems(prev => prev.map(i => 
        i.id === itemId ? { ...i, is_active: !i.is_active } : i
      ));
      
      showMessage(`Menu item "${item.name}" ${!item.is_active ? 'activated' : 'deactivated'}`, 'success');
      return true;
    } catch (error) {
      showMessage('Failed to update menu item status', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [menuItems, showMessage]);

  const toggleCategoryStatus = useCallback(async (categoryId: number): Promise<boolean> => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) {
      showMessage('Category not found', 'error');
      return false;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setCategories(prev => prev.map(c => 
        c.id === categoryId ? { ...c, is_active: !c.is_active } : c
      ));
      
      showMessage(`Category "${category.name}" ${!category.is_active ? 'activated' : 'deactivated'}`, 'success');
      return true;
    } catch (error) {
      showMessage('Failed to update category status', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [categories, showMessage]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<MenuFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      category_id: 'all',
      status: 'all',
      price_range: 'all'
    });
  }, []);

  // Get item by ID
  const getMenuItemById = useCallback((id: number) => {
    return menuItems.find(item => item.id === id);
  }, [menuItems]);

  // Get category by ID
  const getCategoryById = useCallback((id: number) => {
    return categories.find(category => category.id === id);
  }, [categories]);

  return {
    // State
    categories,
    menuItems,
    filteredCategories,
    filteredMenuItems,
    loading,
    message,
    filters,
    menuStats,
    user,

    // Category Actions
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,

    // Menu Item Actions
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleMenuItemStatus,

    // Filter Actions
    updateFilters,
    resetFilters,

    // Helpers
    getMenuItemById,
    getCategoryById,
    showMessage,
  };
};