import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  type CategoriesArgs,
} from '@/services/menuApi';
import { errorMessage, validationErrors as getValidationErrors } from '@/lib/errors';
import type {
  Category,
  CreateCategoryData,
  UpdateCategoryData,
  CategoryFilter,
  CategoryStats,
  PaginationInfo,
  UseCategoryManagementReturn
} from '../types/menu';

const NO_CATEGORIES: Category[] = [];

export const useCategoryManagement = (initialPerPage: number = 10): UseCategoryManagementReturn => {
  // Selection / editing state
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  // UI State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<CategoryFilter>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPageState] = useState(initialPerPage);
  const [pendingActions, setPendingActions] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  // Auto-clear success messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
    return;
  }, [successMessage]);

  // Search is sent to the server after a short pause; clearing it applies immediately
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), searchTerm ? 300 : 0);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const queryArgs = useMemo(() => {
    const params: NonNullable<CategoriesArgs> = { page, limit: perPage };
    if (statusFilter !== 'all') params.is_active = statusFilter === 'active';
    if (debouncedSearch) params.searchTerm = debouncedSearch;
    return params;
  }, [page, perPage, statusFilter, debouncedSearch]);

  const { data, isLoading, error: queryError, refetch } = useGetCategoriesQuery(queryArgs, {
    refetchOnMountOrArgChange: true,
  });
  const [createCategoryMutation] = useCreateCategoryMutation();
  const [updateCategoryMutation] = useUpdateCategoryMutation();
  const [deleteCategoryMutation] = useDeleteCategoryMutation();

  const categories = data?.data ?? NO_CATEGORIES;

  const pagination = useMemo<PaginationInfo>(
    () => ({
      currentPage: data ? data.page || 1 : page,
      lastPage: data?.totalPages || 1,
      perPage: data?.limit || perPage,
      total: data?.total || 0,
    }),
    [data, page, perPage]
  );

  const categoryStats = useMemo<CategoryStats>(
    () => ({
      total: data?.total || 0,
      active: categories.filter((c) => c.is_active).length,
      inactive: categories.filter((c) => !c.is_active).length,
    }),
    [data, categories]
  );

  // Loading is true for the first load or an action, not for background refetches
  const loading = isLoading || pendingActions > 0;
  const error = actionError ?? (queryError ? errorMessage(queryError, 'Failed to fetch categories') : null);

  const clearError = () => setActionError(null);
  const clearSuccessMessage = () => setSuccessMessage(null);

  const fetchCategories = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const goToPage = (nextPage: number) => {
    setPage(nextPage);
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
      const message = errorMessage(err, opts.fallback);
      setActionError(message);
      const fieldErrors = opts.validate ? getValidationErrors(err) : undefined;
      if (fieldErrors) setValidationErrors(fieldErrors);
      throw new Error(message);
    } finally {
      setPendingActions((n) => n - 1);
    }
  };

  const createCategory = (data: CreateCategoryData) =>
    perform(() => createCategoryMutation(data).unwrap(), {
      success: `Category "${data.name}" created successfully!`,
      fallback: 'Failed to create category',
      validate: true,
    });

  const updateCategory = (id: number, data: UpdateCategoryData) =>
    perform(() => updateCategoryMutation({ id, data }).unwrap(), {
      success: `Category "${data.name}" updated successfully!`,
      fallback: 'Failed to update category',
      validate: true,
    });

  const deleteCategory = (id: number) =>
    perform(() => deleteCategoryMutation(id).unwrap(), {
      success: 'Category deleted successfully!',
      fallback: 'Failed to delete category',
    });

  const updateCategoryStatus = (id: number, isActive: boolean) =>
    perform(() => updateCategoryMutation({ id, data: { is_active: isActive } }).unwrap(), {
      success: `Category ${isActive ? 'activated' : 'deactivated'} successfully!`,
      fallback: 'Failed to update category status',
    });

  const toggleItemSelection = (id: number) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAllItems = () => {
    setSelectedItems(categories.map(c => c.id));
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  return {
    categories,
    filteredCategories: categories,
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
