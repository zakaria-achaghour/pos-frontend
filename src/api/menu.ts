import apiClient from './client';
import { toPage, toEntity } from '@/services/adapter';
import type {
  Category,
  MenuItem,
  CreateCategoryData,
  UpdateCategoryData,
  CreateMenuItemData,
  UpdateMenuItemData,
  CategoryFilters,
  MenuItemFilters,
  CategoriesResponse,
  MenuItemsResponse,
} from '../types/menu';

// Page size is the backend's `per_page` (it also accepts `limit`)
const DEFAULT_LIMIT = 50;

type WithImage = { imageFile?: File | null };

/** Build multipart form data (the API reads the image from the `image` field). */
const toFormData = (data: object, file: File, method?: 'PUT'): FormData => {
  const form = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (key === 'imageFile' || value === undefined || value === null) return;
    if (Array.isArray(value)) value.forEach((v) => form.append(`${key}[]`, String(v)));
    else if (typeof value === 'boolean') form.append(key, value ? '1' : '0');
    else form.append(key, String(value));
  });
  form.append('image', file);
  // Laravel only parses multipart bodies on POST, so updates are tunnelled
  if (method) form.append('_method', method);
  return form;
};

const stripImage = <T extends WithImage>(data: T): Omit<T, 'imageFile'> => {
  const { imageFile: _imageFile, ...rest } = data;
  return rest;
};

const toList = <T>(payload: unknown, page: number, limit: number) => {
  const { items, pagination } = toPage<T>(payload);
  return {
    data: items,
    total: pagination.total,
    page: pagination.currentPage || page,
    limit: pagination.perPage || limit,
    totalPages: pagination.lastPage,
  };
};

// Menu API service
export const menuAPI = {
  // Category endpoints
  /**
   * Get categories (paginated). `search` and `is_active` are filtered server-side.
   */
  getCategories: async (filters: CategoryFilters = {}): Promise<CategoriesResponse> => {
    const limit = filters.limit ?? DEFAULT_LIMIT;
    const response = await apiClient.get('/categories', {
      params: {
        search: filters.searchTerm || undefined,
        is_active: filters.is_active,
        page: filters.page,
        per_page: limit,
      },
    });
    return toList<Category>(response.data, filters.page ?? 1, limit);
  },

  getCategory: async (id: number): Promise<Category> => {
    const response = await apiClient.get(`/categories/${id}`);
    return toEntity<Category>(response.data);
  },

  createCategory: async (categoryData: CreateCategoryData): Promise<Category> => {
    const response = await apiClient.post('/categories', categoryData);
    return toEntity<Category>(response.data);
  },

  updateCategory: async (id: number, updates: UpdateCategoryData): Promise<Category> => {
    const response = await apiClient.put(`/categories/${id}`, updates);
    return toEntity<Category>(response.data);
  },

  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },

  // Menu Item endpoints
  /**
   * Get menu items (paginated). `category_id`, `is_available` and `search` are filtered server-side.
   * `search` is accepted as an alias for `searchTerm`.
   */
  getItems: async (filters: MenuItemFilters & { search?: string } = {}): Promise<MenuItemsResponse> => {
    const limit = filters.limit ?? DEFAULT_LIMIT;
    const response = await apiClient.get('/items', {
      params: {
        category_id: filters.category_id || undefined,
        is_available: filters.is_available,
        search: filters.searchTerm || filters.search || undefined,
        page: filters.page,
        per_page: limit,
      },
    });
    return toList<MenuItem>(response.data, filters.page ?? 1, limit);
  },

  getItem: async (id: number): Promise<MenuItem> => {
    const response = await apiClient.get(`/items/${id}`);
    return toEntity<MenuItem>(response.data);
  },

  /**
   * Create a menu item. If `imageFile` is set it is sent in the same multipart request.
   */
  createItem: async (itemData: CreateMenuItemData & WithImage): Promise<MenuItem> => {
    const response = itemData.imageFile
      ? await apiClient.post('/items', toFormData(itemData, itemData.imageFile))
      : await apiClient.post('/items', stripImage(itemData));
    return toEntity<MenuItem>(response.data);
  },

  /**
   * Update a menu item. If `imageFile` is set it is sent in the same multipart request.
   */
  updateItem: async (id: number, updates: UpdateMenuItemData & WithImage): Promise<MenuItem> => {
    const response = updates.imageFile
      ? await apiClient.post(`/items/${id}`, toFormData(updates, updates.imageFile, 'PUT'))
      : await apiClient.put(`/items/${id}`, stripImage(updates));
    return toEntity<MenuItem>(response.data);
  },

  deleteItem: async (id: number): Promise<void> => {
    await apiClient.delete(`/items/${id}`);
  },

  /**
   * Replace only the image of an existing item (the API has no dedicated image route).
   */
  uploadItemImage: async (id: number, file: File): Promise<MenuItem> => {
    const response = await apiClient.post(`/items/${id}`, toFormData({}, file, 'PUT'));
    return toEntity<MenuItem>(response.data);
  },
};

export default menuAPI;
