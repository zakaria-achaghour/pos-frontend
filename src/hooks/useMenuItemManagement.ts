import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  useGetMenuItemsQuery,
  useGetCategoriesQuery,
  useCreateMenuItemMutation,
  useUpdateMenuItemMutation,
  useDeleteMenuItemMutation,
  useUploadMenuItemImageMutation,
  type MenuItemsArgs,
} from '@/services/menuApi';
import { errorMessage, validationErrors as getValidationErrors } from '@/lib/errors';
import type {
  MenuItem,
  Category,
  MenuItemFormData,
  MenuItemFilter,
  MenuItemStats,
  PaginationInfo,
  UseMenuItemManagementReturn
} from '../types/menu';

const NO_ITEMS: MenuItem[] = [];
const NO_CATEGORIES: Category[] = [];

export const useMenuItemManagement = (initialPerPage: number = 12): UseMenuItemManagementReturn => {
  // Selection / editing state
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  // UI State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<MenuItemFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<number | 'all'>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'unavailable'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPageState] = useState(initialPerPage);
  const [pendingActions, setPendingActions] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  // Server data
  const queryArgs = useMemo(() => {
    const params: NonNullable<MenuItemsArgs> = { page, limit: perPage };
    if (searchTerm) params.search = searchTerm;
    if (statusFilter !== 'all') params.is_active = statusFilter === 'active';
    if (categoryFilter !== 'all') params.category_id = categoryFilter;
    if (availabilityFilter !== 'all') params.is_available = availabilityFilter === 'available';
    return params;
  }, [page, perPage, searchTerm, statusFilter, categoryFilter, availabilityFilter]);

  const { data, isLoading, error: queryError, refetch } = useGetMenuItemsQuery(queryArgs, {
    refetchOnMountOrArgChange: true,
  });
  const { data: categoriesData } = useGetCategoriesQuery({}, { refetchOnMountOrArgChange: true });

  const [createItem] = useCreateMenuItemMutation();
  const [updateItem] = useUpdateMenuItemMutation();
  const [deleteItem] = useDeleteMenuItemMutation();
  const [uploadImage] = useUploadMenuItemImageMutation();

  const menuItems = data?.data ?? NO_ITEMS;
  const categories = categoriesData?.data ?? NO_CATEGORIES;

  const pagination = useMemo<PaginationInfo>(
    () => ({
      currentPage: data ? data.page || 1 : page,
      lastPage: data?.totalPages || 1,
      perPage: data?.limit || perPage,
      total: data?.total ?? 0,
    }),
    [data, page, perPage]
  );

  const menuItemStats = useMemo<MenuItemStats>(
    () => ({
      total: menuItems.length,
      active: menuItems.filter((item) => item.is_active).length,
      inactive: menuItems.filter((item) => !item.is_active).length,
      available: menuItems.filter((item) => item.is_available).length,
      unavailable: menuItems.filter((item) => !item.is_available).length,
    }),
    [menuItems]
  );

  // Loading is true for the first load or an action, not for background refetches
  const loading = isLoading || pendingActions > 0;
  const error = actionError ?? (queryError ? errorMessage(queryError, 'Failed to fetch menu items') : null);

  // Auto-clear success messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
    return;
  }, [successMessage]);

  const clearError = () => setActionError(null);
  const clearSuccessMessage = () => setSuccessMessage(null);

  const fetchMenuItems = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Run a mutation with loading / error / success / validation handling
  const perform = async (
    action: () => Promise<unknown>,
    opts: { success: string; fallback: string; validate?: boolean }
  ) => {
    setPendingActions((n) => n + 1);
    setActionError(null);
    if (opts.validate) setValidationErrors({});
    try {
      await action();
      setSuccessMessage(opts.success);
    } catch (err) {
      const fieldErrors = opts.validate ? getValidationErrors(err) : undefined;
      if (fieldErrors) setValidationErrors(fieldErrors);
      setActionError(errorMessage(err, opts.fallback));
      throw err;
    } finally {
      setPendingActions((n) => n - 1);
    }
  };

  // Client-side filtering on top of the server page
  const filteredMenuItems = useMemo(() => {
    let filtered = [...menuItems];

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

    return filtered;
  }, [menuItems, statusFilter, categoryFilter, availabilityFilter, searchTerm]);

  // Pagination actions
  const goToPage = (nextPage: number) => {
    setPage(nextPage);
  };

  const setPerPage = (next: number) => {
    setPerPageState(next);
    setPage(1);
  };

  const createMenuItem = (formData: MenuItemFormData) =>
    perform(() => createItem(formData).unwrap(), {
      success: `Menu item "${formData.name}" created successfully!`,
      fallback: 'Failed to create menu item',
      validate: true,
    });

  const updateMenuItem = (id: number, formData: MenuItemFormData) =>
    perform(
      async () => {
        await updateItem({ id, data: formData }).unwrap();
        if (editingMenuItem?.id === id) setEditingMenuItem(null);
      },
      {
        success: `Menu item "${formData.name}" updated successfully!`,
        fallback: 'Failed to update menu item',
        validate: true,
      }
    );

  const deleteMenuItem = (id: number) =>
    perform(() => deleteItem(id).unwrap(), {
      success: 'Menu item deleted successfully!',
      fallback: 'Failed to delete menu item',
    });

  const updateMenuItemStatus = (id: number, isActive: boolean) =>
    perform(() => updateItem({ id, data: { is_active: isActive } }).unwrap(), {
      success: `Menu item ${isActive ? 'activated' : 'deactivated'} successfully!`,
      fallback: 'Failed to update menu item status',
    });

  const updateMenuItemAvailability = (id: number, isAvailable: boolean) =>
    perform(() => updateItem({ id, data: { is_available: isAvailable } }).unwrap(), {
      success: `Menu item marked as ${isAvailable ? 'available' : 'unavailable'}!`,
      fallback: 'Failed to update menu item availability',
    });

  const uploadMenuItemImage = (id: number, file: File) =>
    perform(() => uploadImage({ id, file }).unwrap(), {
      success: 'Image uploaded successfully!',
      fallback: 'Failed to upload image',
    });

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
