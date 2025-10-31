import { useState, useEffect, useCallback } from 'react';
import { menuAPI } from '../api/menu';
import type { MenuItem, CreateMenuItemData, UpdateMenuItemData, MenuItemFilters, Category } from '../api/menu';

export interface MenuItemFilterOptions {
  searchTerm: string;
  categoryFilter: number | 'all';
  statusFilter: 'all' | 'active' | 'inactive';
  availabilityFilter: 'all' | 'available' | 'unavailable';
}

interface UseMenuItemManagementReturn {
  // Data
  menuItems: MenuItem[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  
  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  // Filters
  filters: MenuItemFilterOptions;
  
  // Actions
  fetchMenuItems: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  createMenuItem: (data: CreateMenuItemData) => Promise<void>;
  updateMenuItem: (id: number, data: UpdateMenuItemData) => Promise<void>;
  deleteMenuItem: (id: number) => Promise<void>;
  toggleItemStatus: (id: number, isActive: boolean) => Promise<void>;
  toggleItemAvailability: (id: number, isAvailable: boolean) => Promise<void>;
  uploadItemImage: (id: number, file: File) => Promise<void>;
  setFilters: (filters: MenuItemFilterOptions) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  
  // Stats
  stats: {
    total: number;
    active: number;
    inactive: number;
    available: number;
    unavailable: number;
  };
}

const DEFAULT_FILTERS: MenuItemFilterOptions = {
  searchTerm: '',
  categoryFilter: 'all',
  statusFilter: 'all',
  availabilityFilter: 'all',
};

export const useMenuItemManagement = (): UseMenuItemManagementReturn => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<MenuItemFilterOptions>(DEFAULT_FILTERS);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  // Calculate stats
  const stats = {
    total: pagination.total,
    active: menuItems.filter(item => item.is_active).length,
    inactive: menuItems.filter(item => !item.is_active).length,
    available: menuItems.filter(item => item.is_available).length,
    unavailable: menuItems.filter(item => !item.is_available).length,
  };

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await menuAPI.getCategories({ limit: 100 });
      setCategories(response.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  // Fetch menu items with current state
  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiFilters: MenuItemFilters = {
        page: pagination.page,
        limit: pagination.limit,
      };

      // Add category filter
      if (filters.categoryFilter !== 'all') {
        apiFilters.category_id = Number(filters.categoryFilter);
      }

      // Add status filter
      if (filters.statusFilter !== 'all') {
        apiFilters.is_active = filters.statusFilter === 'active';
      }

      // Add availability filter
      if (filters.availabilityFilter !== 'all') {
        apiFilters.is_available = filters.availabilityFilter === 'available';
      }

      // Add search term
      if (filters.searchTerm) {
        apiFilters.searchTerm = filters.searchTerm;
      }

      console.log('Fetching menu items with filters:', apiFilters);

      const response = await menuAPI.getItems(apiFilters);
      
      console.log('Menu items response:', {
        dataCount: response.data?.length,
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages
      });
      
      setMenuItems(response.data || []);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (err) {
      console.error('Error fetching menu items:', err);
      setError('Failed to fetch menu items. Please try again.');
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Create menu item
  const createMenuItem = async (data: CreateMenuItemData) => {
    try {
      setLoading(true);
      setError(null);
      await menuAPI.createItem(data);
      await fetchMenuItems();
    } catch (err: any) {
      console.error('Error creating menu item:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create menu item. Please check your connection and try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Update menu item
  const updateMenuItem = async (id: number, data: UpdateMenuItemData) => {
    try {
      setLoading(true);
      setError(null);
      await menuAPI.updateItem(id, data);
      await fetchMenuItems();
    } catch (err: any) {
      console.error('Error updating menu item:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update menu item. Please check your connection and try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Delete menu item
  const deleteMenuItem = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await menuAPI.deleteItem(id);
      await fetchMenuItems();
    } catch (err: any) {
      console.error('Error deleting menu item:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete menu item. This item may be in active orders.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Toggle menu item status
  const toggleItemStatus = async (id: number, isActive: boolean) => {
    try {
      setLoading(true);
      setError(null);
      await menuAPI.updateItem(id, { is_active: isActive });
      await fetchMenuItems();
    } catch (err: any) {
      console.error('Error toggling menu item status:', err);
      const errorMessage = err.response?.data?.message || err.message || `Failed to ${isActive ? 'activate' : 'deactivate'} menu item. Please try again.`;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Toggle menu item availability
  const toggleItemAvailability = async (id: number, isAvailable: boolean) => {
    try {
      setLoading(true);
      setError(null);
      await menuAPI.updateItem(id, { is_available: isAvailable });
      await fetchMenuItems();
    } catch (err: any) {
      console.error('Error toggling menu item availability:', err);
      const errorMessage = err.response?.data?.message || err.message || `Failed to set item as ${isAvailable ? 'available' : 'unavailable'}. Please try again.`;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Upload item image
  const uploadItemImage = async (id: number, file: File) => {
    try {
      setLoading(true);
      setError(null);
      await menuAPI.uploadItemImage(id, file);
      await fetchMenuItems();
    } catch (err: any) {
      console.error('Error uploading item image:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to upload image. Please try again with a valid image file.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Set filters
  const setFilters = (newFilters: MenuItemFilterOptions) => {
    setFiltersState(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page when filters change
  };

  // Reset filters
  const resetFilters = () => {
    setFiltersState(DEFAULT_FILTERS);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  };

  // Set page
  const setPage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  // Set limit
  const setLimit = (limit: number) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 })); // Reset to first page when limit changes
  };

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Fetch menu items when dependencies change
  useEffect(() => {
    // Debounce search to avoid too many API calls
    const timer = setTimeout(() => {
      fetchMenuItems();
    }, filters.searchTerm ? 500 : 0); // 500ms debounce for search, immediate for others

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, filters.searchTerm, filters.categoryFilter, filters.statusFilter, filters.availabilityFilter]);

  return {
    menuItems,
    categories,
    loading,
    error,
    pagination,
    filters,
    fetchMenuItems,
    fetchCategories,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleItemStatus,
    toggleItemAvailability,
    uploadItemImage,
    setFilters,
    resetFilters,
    setPage,
    setLimit,
    stats,
  };
};

export default useMenuItemManagement;
