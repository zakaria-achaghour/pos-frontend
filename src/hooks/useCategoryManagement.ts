import { useState, useEffect } from 'react';
import { menuAPI } from '../api/menu';
import type { Category, CreateCategoryData, UpdateCategoryData, CategoryFilters } from '../api/menu';

export interface CategoryFilterOptions {
  searchTerm: string;
  statusFilter: 'all' | 'active' | 'inactive';
}

interface UseCategoryManagementReturn {
  // Data
  categories: Category[];
  filteredCategories: Category[];
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
  filters: CategoryFilterOptions;
  
  // Actions
  fetchCategories: () => Promise<void>;
  createCategory: (data: CreateCategoryData) => Promise<void>;
  updateCategory: (id: number, data: UpdateCategoryData) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  toggleCategoryStatus: (id: number, isActive: boolean) => Promise<void>;
  setFilters: (filters: CategoryFilterOptions) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
}

const DEFAULT_FILTERS: CategoryFilterOptions = {
  searchTerm: '',
  statusFilter: 'all',
};

export const useCategoryManagement = (): UseCategoryManagementReturn => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<CategoryFilterOptions>(DEFAULT_FILTERS);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  // Fetch categories with current state
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiFilters: CategoryFilters = {
        page: pagination.page,
        limit: pagination.limit,
      };

      // Add status filter
      if (filters.statusFilter !== 'all') {
        apiFilters.is_active = filters.statusFilter === 'active';
      }

      // Add search term
      if (filters.searchTerm) {
        apiFilters.searchTerm = filters.searchTerm;
      }

      console.log('Fetching categories with filters:', apiFilters);

      const response = await menuAPI.getCategories(apiFilters);
      
      console.log('Categories response:', {
        dataCount: response.data?.length,
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages
      });
      
      setCategories(response.data || []);
      setFilteredCategories(response.data || []);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to fetch categories. Please try again.');
      setCategories([]);
      setFilteredCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Create category
  const createCategory = async (data: CreateCategoryData) => {
    try {
      setLoading(true);
      setError(null);
      await menuAPI.createCategory(data);
      await fetchCategories();
    } catch (err: any) {
      console.error('Error creating category:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create category. Please check your connection and try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Update category
  const updateCategory = async (id: number, data: UpdateCategoryData) => {
    try {
      setLoading(true);
      setError(null);
      await menuAPI.updateCategory(id, data);
      await fetchCategories();
    } catch (err: any) {
      console.error('Error updating category:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update category. Please check your connection and try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const deleteCategory = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await menuAPI.deleteCategory(id);
      await fetchCategories();
    } catch (err: any) {
      console.error('Error deleting category:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete category. This category may have menu items attached to it.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Toggle category status
  const toggleCategoryStatus = async (id: number, isActive: boolean) => {
    try {
      setLoading(true);
      setError(null);
      await menuAPI.updateCategory(id, { is_active: isActive });
      await fetchCategories();
    } catch (err: any) {
      console.error('Error toggling category status:', err);
      const errorMessage = err.response?.data?.message || err.message || `Failed to ${isActive ? 'activate' : 'deactivate'} category. Please try again.`;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Set filters
  const setFilters = (newFilters: CategoryFilterOptions) => {
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

  // Fetch categories when dependencies change
  useEffect(() => {
    // Debounce search to avoid too many API calls
    const timer = setTimeout(() => {
      fetchCategories();
    }, filters.searchTerm ? 500 : 0); // 500ms debounce for search, immediate for others

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, filters.searchTerm, filters.statusFilter]);

  return {
    categories,
    filteredCategories,
    loading,
    error,
    pagination,
    filters,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    setFilters,
    resetFilters,
    setPage,
    setLimit,
  };
};

export default useCategoryManagement;
