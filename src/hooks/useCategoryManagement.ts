import { useState, useEffect } from 'react';
import { menuAPI } from '../api/menu';
import type { 
  Category, 
  CreateCategoryData, 
  UpdateCategoryData,
  CategoryFilter,
  CategoryStats,
  PaginationInfo,
  UseCategoryManagementReturn
} from '../types/menu';

export const useCategoryManagement = (initialPerPage: number = 10): UseCategoryManagementReturn => {
  // Data State
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  
  // UI State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<CategoryFilter>('all');
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
  const [categoryStats, setCategoryStats] = useState<CategoryStats>({
    total: 0,
    active: 0,
    inactive: 0,
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

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiParams: Record<string, any> = {
        page: pagination.currentPage,
        limit: pagination.perPage,
      };

      if (statusFilter !== 'all') {
        apiParams['is_active'] = statusFilter === 'active';
      }

      if (searchTerm) {
        apiParams['searchTerm'] = searchTerm;
      }

      const response = await menuAPI.getCategories(apiParams);
      
      const categoriesData = response.data || [];
      setCategories(categoriesData);
      setFilteredCategories(categoriesData);

      setPagination({
        currentPage: response.page || 1,
        lastPage: response.totalPages || 1,
        perPage: response.limit || pagination.perPage,
        total: response.total || 0,
      });

      const stats: CategoryStats = {
        total: response.total || 0,
        active: categoriesData.filter((c: Category) => c.is_active).length,
        inactive: categoriesData.filter((c: Category) => !c.is_active).length,
      };
      setCategoryStats(stats);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCategories();
    }, searchTerm ? 300 : 0);
    return () => clearTimeout(timer);
  }, [pagination.currentPage, pagination.perPage, statusFilter, searchTerm]);

  const goToPage = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const setPerPage = (perPage: number) => {
    setPagination(prev => ({ ...prev, perPage, currentPage: 1 }));
  };

  const createCategory = async (data: CreateCategoryData) => {
    try {
      setLoading(true);
      setError(null);
      setValidationErrors({});
      
      await menuAPI.createCategory(data);
      
      setSuccessMessage(`Category "${data.name}" created successfully!`);
      await fetchCategories();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create category';
      setError(errorMessage);
      
      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
      }
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id: number, data: UpdateCategoryData) => {
    try {
      setLoading(true);
      setError(null);
      setValidationErrors({});
      
      await menuAPI.updateCategory(id, data);
      
      setCategories(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
      setFilteredCategories(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
      
      setSuccessMessage(`Category "${data.name}" updated successfully!`);
      await fetchCategories();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update category';
      setError(errorMessage);
      
      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
      }
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      await menuAPI.deleteCategory(id);
      
      setSuccessMessage('Category deleted successfully!');
      await fetchCategories();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete category';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateCategoryStatus = async (id: number, isActive: boolean) => {
    try {
      setLoading(true);
      setError(null);
      
      await menuAPI.updateCategory(id, { is_active: isActive });
      
      setSuccessMessage(`Category ${isActive ? 'activated' : 'deactivated'} successfully!`);
      await fetchCategories();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update category status';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleItemSelection = (id: number) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAllItems = () => {
    setSelectedItems(filteredCategories.map(c => c.id));
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  return {
    categories,
    filteredCategories,
    selectedCategory,
    editingCategory,
    selectedItems,
    viewMode,
    statusFilter,
    searchTerm,
    loading,
    error,
    successMessage,
    validationErrors,
    pagination,
    categoryStats,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    updateCategoryStatus,
    setSelectedCategory,
    setEditingCategory,
    toggleItemSelection,
    selectAllItems,
    clearSelection,
    goToPage,
    setPerPage,
    setViewMode,
    setStatusFilter,
    setSearchTerm,
    clearError,
    clearSuccessMessage,
  };
};

export default useCategoryManagement;
