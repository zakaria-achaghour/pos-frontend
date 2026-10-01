import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  useGetRestaurantsQuery,
  useCreateRestaurantMutation,
  useUpdateRestaurantMutation,
  useDeleteRestaurantMutation,
  useUpdateRestaurantStatusMutation,
  type RestaurantsArgs,
} from '@/services/restaurantsApi';
import { errorMessage, validationErrors as getValidationErrors } from '@/lib/errors';
import type {
  Restaurant,
  RestaurantFormData,
  RestaurantStatus,
  CreateRestaurantData,
  UpdateRestaurantData
} from '../types/restaurant';
import type { PaginationInfo, UseResourceManagementReturn } from '@/types/components';

export type RestaurantFilter = 'all' | RestaurantStatus;

interface RestaurantStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  suspended: number;
}

interface UseRestaurantManagementReturn extends UseResourceManagementReturn<
  Restaurant,
  RestaurantFormData,
  RestaurantStatus,
  RestaurantFilter,
  RestaurantStats
> {
  // Restaurant-specific extensions and aliases
  restaurants: Restaurant[];
  filteredRestaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  editingRestaurant: Restaurant | null;
  statusFilter: RestaurantFilter;
  searchTerm: string;
  setStatusFilter: (filter: RestaurantFilter) => void;
  setSearchTerm: (term: string) => void;
  setSelectedRestaurant: (restaurant: Restaurant | null) => void;
  setEditingRestaurant: (restaurant: Restaurant | null) => void;
  fetchRestaurants: (page?: number) => Promise<void>;
  createRestaurant: (data: RestaurantFormData) => Promise<void>;
  updateRestaurant: (id: number, data: Partial<RestaurantFormData>) => Promise<void>;
  deleteRestaurant: (id: number) => Promise<void>;
  updateRestaurantStatus: (id: number, status: RestaurantStatus) => Promise<void>;
  restaurantStats: RestaurantStats;
  setPerPage: (perPage: number) => void;
}

const NO_RESTAURANTS: Restaurant[] = [];

export const useRestaurantManagement = (initialPerPage: number = 10): UseRestaurantManagementReturn => {
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  // UI State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [statusFilter, setStatusFilterState] = useState<RestaurantFilter>('all');
  const [searchTerm, setSearchTermState] = useState<string>('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPageState] = useState(initialPerPage);
  const [pendingActions, setPendingActions] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  // Server data (status and search are filtered server-side)
  const queryArgs = useMemo(() => {
    const params: Record<string, string | number | boolean> = { page, per_page: perPage };
    if (statusFilter !== 'all') params['status'] = statusFilter;
    if (searchTerm) params['search'] = searchTerm;
    return params as NonNullable<RestaurantsArgs>;
  }, [page, perPage, statusFilter, searchTerm]);

  const { data, isLoading, error: queryError, refetch } = useGetRestaurantsQuery(queryArgs, {
    refetchOnMountOrArgChange: true,
  });
  const [createMutation] = useCreateRestaurantMutation();
  const [updateMutation] = useUpdateRestaurantMutation();
  const [deleteMutation] = useDeleteRestaurantMutation();
  const [statusMutation] = useUpdateRestaurantStatusMutation();

  const restaurants = useMemo<Restaurant[]>(
    () =>
      data
        ? data.data.map((restaurant) => ({
            ...restaurant,
            status: (restaurant.is_active ? 'active' : 'inactive') as RestaurantStatus,
          }))
        : NO_RESTAURANTS,
    [data]
  );

  const pagination = useMemo<PaginationInfo>(
    () => ({
      currentPage: data ? data.current_page || page : page,
      lastPage: data?.last_page || 1,
      perPage: data?.per_page || perPage,
      total: data?.total || 0,
    }),
    [data, page, perPage]
  );

  const restaurantStats = useMemo<RestaurantStats>(
    () => ({
      total: data?.total || 0,
      active: restaurants.filter((r) => r.status === 'active').length,
      inactive: restaurants.filter((r) => r.status === 'inactive').length,
      pending: 0, // API doesn't have pending status
      suspended: 0, // API doesn't have suspended status
    }),
    [data, restaurants]
  );

  // Loading is true for the first load or an action, not for background refetches
  const loading = isLoading || pendingActions > 0;
  const error = actionError ?? (queryError ? errorMessage(queryError, 'Failed to fetch restaurants') : null);

  // Auto-clear messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
    return;
  }, [successMessage]);

  const clearError = () => setActionError(null);
  const clearSuccessMessage = () => setSuccessMessage(null);

  const setStatusFilter = useCallback((filter: RestaurantFilter) => {
    setStatusFilterState(filter);
    setPage(1);
  }, []);

  const setSearchTerm = useCallback((term: string) => {
    setSearchTermState(term);
    setPage(1);
  }, []);

  // Go to a page (default 1), or just refetch when already there
  const fetchRestaurants = useCallback(
    async (target: number = 1) => {
      if (target !== page) {
        setPage(target);
        return;
      }
      await refetch();
    },
    [page, refetch]
  );

  const goToPage = (target: number) => {
    setPage(target);
  };

  const setPerPage = (next: number) => {
    setPerPageState(next);
    setPage(1);
  };

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
      setActionError(errorMessage(err, opts.fallback));
      const fieldErrors = opts.validate ? getValidationErrors(err) : undefined;
      if (fieldErrors) setValidationErrors(fieldErrors);
      throw err;
    } finally {
      setPendingActions((n) => n - 1);
    }
  };

  const createRestaurant = async (formData: RestaurantFormData): Promise<void> => {
    if (!formData.name.trim()) {
      setActionError('Please enter a restaurant name');
      return;
    }
    await perform(() => createMutation(formData as unknown as CreateRestaurantData).unwrap(), {
      success: `Restaurant "${formData.name}" created successfully!`,
      fallback: 'Failed to create restaurant',
      validate: true,
    });
  };

  const updateRestaurant = (id: number, updates: Partial<RestaurantFormData>): Promise<void> =>
    perform(() => updateMutation({ id, data: updates as unknown as UpdateRestaurantData }).unwrap(), {
      success: 'Restaurant updated successfully!',
      fallback: 'Failed to update restaurant',
      validate: true,
    });

  const deleteRestaurant = (id: number): Promise<void> =>
    perform(() => deleteMutation(id).unwrap(), {
      success: 'Restaurant deleted successfully!',
      fallback: 'Failed to delete restaurant',
    });

  const updateRestaurantStatus = (id: number, status: RestaurantStatus): Promise<void> =>
    perform(() => statusMutation({ id, status: status as 'active' | 'inactive' }).unwrap(), {
      success: `Restaurant ${status === 'active' ? 'activated' : 'deactivated'} successfully!`,
      fallback: 'Failed to update restaurant status',
    });

  // Bulk status update
  const bulkUpdateStatus = async (ids: number[], status: RestaurantStatus): Promise<void> => {
    setPendingActions((n) => n + 1);
    setActionError(null);
    try {
      await Promise.all(ids.map(id => updateRestaurantStatus(id, status)));
      setSuccessMessage(`${ids.length} restaurants updated successfully!`);
      setSelectedItems([]);
    } catch (err) {
      setActionError('Failed to update some restaurants');
      throw err;
    } finally {
      setPendingActions((n) => n - 1);
    }
  };

  // Selection handlers
  const toggleItemSelection = (id: number) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  return {
    // Base properties
    items: restaurants,
    filteredItems: restaurants,
    selectedItem: selectedRestaurant,
    editingItem: editingRestaurant,
    filter: statusFilter,
    selectedItems,
    
    // Aliases for backward compatibility
    restaurants,
    filteredRestaurants: restaurants,
    selectedRestaurant,
    editingRestaurant,
    statusFilter,
    searchTerm,
    
    // UI State
    viewMode,
    loading,
    error,
    successMessage,
    validationErrors,
    pagination,
    
    // Actions - base
    fetchItems: fetchRestaurants,
    createItem: createRestaurant,
    updateItem: updateRestaurant,
    deleteItem: deleteRestaurant,
    updateItemStatus: updateRestaurantStatus,
    bulkUpdateStatus,
    goToPage,
    
    // Actions - aliases
    fetchRestaurants,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    updateRestaurantStatus,
    
    // UI Actions - base
    setViewMode,
    setFilter: setStatusFilter,
    setSelectedItem: setSelectedRestaurant,
    setEditingItem: setEditingRestaurant,
    clearError,
    clearSuccessMessage,
    toggleItemSelection,
    clearSelection,
    setPerPage,
    
    // UI Actions - aliases
    setStatusFilter,
    setSearchTerm,
    setSelectedRestaurant,
    setEditingRestaurant,
    
    // Stats
    stats: restaurantStats,
    restaurantStats,
  };
};
