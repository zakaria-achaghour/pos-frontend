import { useState, useEffect } from 'react';
import { menuAPI } from '../api/menu';
import type { 
  MenuItem,
  Category,
  CreateMenuItemData, 
  UpdateMenuItemData,
  MenuItemFilter,
  MenuItemStats,
  PaginationInfo,
  UseMenuItemManagementReturn
} from '../types/menu';


export const useMenuItemManagement = (initialPerPage: number = 12): UseMenuItemManagementReturn => {
  // Data State
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredMenuItems, setFilteredMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  
  // UI State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<MenuItemFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<number | 'all'>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'unavailable'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    lastPage: 1,
    perPage: initialPerPage,
    total: 0,
  });
  const [menuItemStats, setMenuItemStats] = useState<MenuItemStats>({
    total: 0,
    active: 0,
    inactive: 0,
    available: 0,
    unavailable: 0,
  });

  // Auto-clear success messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
    return;
  }, [successMessage]);

  const clearError = () => setError(null);
  const clearSuccessMessage = () => setSuccessMessage(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await menuAPI.getCategories();
        const categoriesData = Array.isArray(response) ? response : response.data || [];
        setCategories(categoriesData);
      } catch (err: any) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch menu items
  const fetchMenuItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        page: pagination.currentPage,
        limit: pagination.perPage,
      };

      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.is_active = statusFilter === 'active';
      if (categoryFilter !== 'all') params.category_id = categoryFilter;
      if (availabilityFilter !== 'all') params.is_available = availabilityFilter === 'available';

      const response = await menuAPI.getItems(params);
      
      const itemsData = Array.isArray(response) ? response : response.data || [];
      setMenuItems(itemsData);
      
      // Calculate stats
      const stats: MenuItemStats = {
        total: itemsData.length,
        active: itemsData.filter((item: MenuItem) => item.is_active).length,
        inactive: itemsData.filter((item: MenuItem) => !item.is_active).length,
        available: itemsData.filter((item: MenuItem) => item.is_available).length,
        unavailable: itemsData.filter((item: MenuItem) => !item.is_available).length,
      };
      setMenuItemStats(stats);

      // Update pagination
      if (!Array.isArray(response) && response.total !== undefined) {
        setPagination({
          currentPage: response.page || 1,
          lastPage: response.totalPages || 1,
          perPage: response.limit || pagination.perPage,
          total: response.total,
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch menu items');
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchMenuItems();
  }, [statusFilter, categoryFilter, availabilityFilter, pagination.currentPage, pagination.perPage, searchTerm]);

  // Filter menu items
  useEffect(() => {
    let filtered = [...menuItems];

    // Apply filters
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => 
        statusFilter === 'active' ? item.is_active : !item.is_active
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category_id === categoryFilter);
    }

    if (availabilityFilter !== 'all') {
      filtered = filtered.filter(item => 
        availabilityFilter === 'available' ? item.is_available : !item.is_available
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term)
      );
    }

    setFilteredMenuItems(filtered);
  }, [menuItems, statusFilter, categoryFilter, availabilityFilter, searchTerm]);

  // Pagination actions
  const goToPage = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const setPerPage = (perPage: number) => {
    setPagination(prev => ({ ...prev, perPage, currentPage: 1 }));
  };

  // Create menu item
  const createMenuItem = async (data: CreateMenuItemData) => {
    setLoading(true);
    setError(null);
    setValidationErrors({});
    try {
      const newItem = await menuAPI.createItem(data);
      setMenuItems(prev => [newItem, ...prev]);
      setSuccessMessage(`Menu item "${data.name}" created successfully!`);
      await fetchMenuItems();
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
      }
      setError(err.response?.data?.message || err.message || 'Failed to create menu item');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update menu item
  const updateMenuItem = async (id: number, data: UpdateMenuItemData) => {
    setLoading(true);
    setError(null);
    setValidationErrors({});
    try {
      const updatedItem = await menuAPI.updateItem(id, data);
      setMenuItems(prev => prev.map(item => item.id === id ? updatedItem : item));
      setSuccessMessage(`Menu item "${data.name}" updated successfully!`);
      if (editingMenuItem?.id === id) {
        setEditingMenuItem(null);
      }
      await fetchMenuItems();
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
      }
      setError(err.response?.data?.message || err.message || 'Failed to update menu item');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete menu item
  const deleteMenuItem = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await menuAPI.deleteItem(id);
      setMenuItems(prev => prev.filter(item => item.id !== id));
      setSuccessMessage('Menu item deleted successfully!');
      await fetchMenuItems();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete menu item');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update menu item status
  const updateMenuItemStatus = async (id: number, isActive: boolean) => {
    setLoading(true);
    setError(null);
    try {
      await menuAPI.updateItem(id, { is_active: isActive });
      setMenuItems(prev => prev.map(item => 
        item.id === id ? { ...item, is_active: isActive } : item
      ));
      setSuccessMessage(`Menu item ${isActive ? 'activated' : 'deactivated'} successfully!`);
      await fetchMenuItems();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update menu item status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update menu item availability
  const updateMenuItemAvailability = async (id: number, isAvailable: boolean) => {
    setLoading(true);
    setError(null);
    try {
      await menuAPI.updateItem(id, { is_available: isAvailable });
      setMenuItems(prev => prev.map(item => 
        item.id === id ? { ...item, is_available: isAvailable } : item
      ));
      setSuccessMessage(`Menu item marked as ${isAvailable ? 'available' : 'unavailable'}!`);
      await fetchMenuItems();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update menu item availability');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Upload menu item image
  const uploadMenuItemImage = async (id: number, file: File) => {
    setLoading(true);
    setError(null);
    try {
      await menuAPI.uploadItemImage(id, file);
      setSuccessMessage('Image uploaded successfully!');
      await fetchMenuItems();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to upload image');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Selection actions
  const toggleItemSelection = (id: number) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const selectAllItems = () => {
    setSelectedItems(filteredMenuItems.map(item => item.id));
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  return {
    // Data
    menuItems,
    filteredMenuItems,
    categories,
    selectedMenuItem,
    editingMenuItem,
    selectedItems,

    // UI State
    viewMode,
    statusFilter,
    categoryFilter,
    availabilityFilter,
    searchTerm,
    loading,
    error,
    successMessage,
    validationErrors,
    pagination,
    menuItemStats,

    // CRUD Actions
    fetchMenuItems,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    updateMenuItemStatus,
    updateMenuItemAvailability,
    uploadMenuItemImage,

    // Selection Actions
    setSelectedMenuItem,
    setEditingMenuItem,
    toggleItemSelection,
    selectAllItems,
    clearSelection,

    // Pagination Actions
    goToPage,
    setPerPage,

    // Filter Actions
    setViewMode,
    setStatusFilter,
    setCategoryFilter,
    setAvailabilityFilter,
    setSearchTerm,
    clearError,
    clearSuccessMessage,
  };
};
