import { useState, useCallback, useEffect } from 'react';
import { restaurantAPI } from '../api/restaurants';
import type { 
  Restaurant, 
  RestaurantFormData,
  RestaurantStatus
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

export const useRestaurantManagement = (initialPerPage: number = 10): UseRestaurantManagementReturn => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  
  // UI State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [statusFilter, setStatusFilter] = useState<RestaurantFilter>('all');
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
  const [restaurantStats, setRestaurantStats] = useState<RestaurantStats>({
    total: 0,
    active: 0,
    inactive: 0,
    pending: 0,
    suspended: 0,
  });

  // Auto-clear messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
    return;
  }, [successMessage]);

  const clearError = () => setError(null);
  const clearSuccessMessage = () => setSuccessMessage(null);

  // Fetch restaurants from API
  const fetchRestaurants = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Fetching restaurants with params:', {
        page,
        per_page: pagination.perPage,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined,
      });

      const apiParams: Record<string, any> = {
        page,
        per_page: pagination.perPage,
      };

      // Build query params
      if (statusFilter !== 'all') {
        apiParams['status'] = statusFilter;
      }

      if (searchTerm) {
        apiParams['search'] = searchTerm;
      }

      const response = await restaurantAPI.getRestaurants(apiParams);

      console.log('📡 Restaurants API response:', response);

      // Map API response to local format
      const mappedRestaurants = response.data.map((restaurant: any) => ({
        ...restaurant,
        status: restaurant.is_active ? 'active' : 'inactive',
      }));

      setRestaurants(mappedRestaurants);
      setPagination({
        currentPage: response.current_page || page,
        lastPage: response.last_page || 1,
        perPage: response.per_page || pagination.perPage,
        total: response.total || 0,
      });

      // Calculate stats
      const stats: RestaurantStats = {
        total: response.total || 0,
        active: mappedRestaurants.filter((r: Restaurant) => r.status === 'active').length,
        inactive: mappedRestaurants.filter((r: Restaurant) => r.status === 'inactive').length,
        pending: 0, // API doesn't have pending status
        suspended: 0, // API doesn't have suspended status
      };
      setRestaurantStats(stats);

      console.log('✅ Restaurants loaded:', mappedRestaurants.length);
    } catch (err: any) {
      console.error('❌ Error fetching restaurants:', err);
      setError(err.response?.data?.message || 'Failed to fetch restaurants');
    } finally {
      setLoading(false);
    }
  }, [pagination.perPage, statusFilter, searchTerm]);

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchRestaurants(1);
  }, [statusFilter, searchTerm]);

  // Filtered restaurants (client-side backup if needed)
  const filteredRestaurants = restaurants;

  // Pagination helper
  const goToPage = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    fetchRestaurants(page);
  };

  // Set items per page
  const setPerPage = (perPage: number) => {
    setPagination(prev => ({ ...prev, perPage, currentPage: 1 }));
    // Will trigger refetch via useEffect
  };

  // Create new restaurant
  const createRestaurant = useCallback(async (formData: RestaurantFormData): Promise<void> => {
    if (!formData.name.trim()) {
      setError('Please enter a restaurant name');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log('➕ Creating restaurant:', formData);
      const newRestaurant = await restaurantAPI.createRestaurant(formData as any);
      
      // Add to local state
      setRestaurants(prev => [newRestaurant, ...prev]);
      setSuccessMessage(`Restaurant "${formData.name}" created successfully!`);
      console.log('✅ Restaurant created:', newRestaurant);
      
      // Refresh list
      await fetchRestaurants(pagination.currentPage);
    } catch (err: any) {
      console.error('❌ Error creating restaurant:', err);
      const errorMessage = err.response?.data?.message || 'Failed to create restaurant';
      setError(errorMessage);
      
      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRestaurants, pagination.currentPage]);

  // Update restaurant
  const updateRestaurant = useCallback(async (id: number, updates: Partial<RestaurantFormData>): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Updating restaurant:', id, updates);
      const updatedRestaurant = await restaurantAPI.updateRestaurant(id, updates as any);
      
      // Update local state
      setRestaurants(prev =>
        prev.map(restaurant =>
          restaurant.id === id ? { ...restaurant, ...updatedRestaurant } : restaurant
        )
      );
      setSuccessMessage(`Restaurant updated successfully!`);
      console.log('✅ Restaurant updated:', updatedRestaurant);
      
      // Refresh list
      await fetchRestaurants(pagination.currentPage);
    } catch (err: any) {
      console.error('❌ Error updating restaurant:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update restaurant';
      setError(errorMessage);
      
      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRestaurants, pagination.currentPage]);

  // Delete restaurant
  const deleteRestaurant = useCallback(async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      console.log('🗑️ Deleting restaurant:', id);
      await restaurantAPI.deleteRestaurant(id);
      
      // Remove from local state
      setRestaurants(prev => prev.filter(restaurant => restaurant.id !== id));
      setSuccessMessage('Restaurant deleted successfully!');
      console.log('✅ Restaurant deleted');
      
      // Refresh list
      await fetchRestaurants(pagination.currentPage);
    } catch (err: any) {
      console.error('❌ Error deleting restaurant:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete restaurant';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRestaurants, pagination.currentPage]);

  // Update restaurant status
  const updateRestaurantStatus = useCallback(async (id: number, status: RestaurantStatus): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Updating restaurant status:', id, status);
      const updatedRestaurant = await restaurantAPI.updateRestaurantStatus(id, status as 'active' | 'inactive');
      
      // Update local state
      setRestaurants(prev =>
        prev.map(restaurant =>
          restaurant.id === id ? { ...restaurant, ...updatedRestaurant, status } : restaurant
        )
      );
      setSuccessMessage(`Restaurant ${status === 'active' ? 'activated' : 'deactivated'} successfully!`);
      console.log('✅ Restaurant status updated');
    } catch (err: any) {
      console.error('❌ Error updating restaurant status:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update restaurant status';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Bulk status update
  const bulkUpdateStatus = useCallback(async (ids: number[], status: RestaurantStatus): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all(ids.map(id => updateRestaurantStatus(id, status)));
      setSuccessMessage(`${ids.length} restaurants updated successfully!`);
      setSelectedItems([]);
    } catch (err: any) {
      console.error('❌ Error in bulk status update:', err);
      setError('Failed to update some restaurants');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateRestaurantStatus]);

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
    filteredItems: filteredRestaurants,
    selectedItem: selectedRestaurant,
    editingItem: editingRestaurant,
    filter: statusFilter,
    selectedItems,
    
    // Aliases for backward compatibility
    restaurants,
    filteredRestaurants,
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
