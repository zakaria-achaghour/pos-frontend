import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { menuAPI } from '../../api/menu';
import type { Category, MenuItem, CreateCategoryData, UpdateCategoryData, CreateMenuItemData, UpdateMenuItemData } from '../../api/menu';
import type { ListState, DetailState, ApiError } from '../types/common';
import { parseApiError, formatValidationErrors } from '../utils/errorUtils';

// Extended types for menu state
interface MenuListState extends ListState<MenuItem> {
  categories: Category[];
  selectedCategory: number | null;
}

interface CategoryState extends ListState<Category> {}

interface MenuDetailState extends DetailState<MenuItem> {}

// Initial states
const initialMenuState: MenuListState = {
  items: [],
  categories: [],
  selectedCategory: null,
  selectedItems: [],
  pagination: {
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
    total: 0,
    from: 0,
    to: 0,
  },
  filters: {
    search: '',
    sortBy: 'name',
    sortOrder: 'asc',
    filters: {},
  },
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  validationErrors: {},
  lastError: null,
  lastUpdated: null,
};

const initialCategoryState: CategoryState = {
  items: [],
  selectedItems: [],
  pagination: {
    currentPage: 1,
    lastPage: 1,
    perPage: 50,
    total: 0,
    from: 0,
    to: 0,
  },
  filters: {
    search: '',
    sortBy: 'sort_order',
    sortOrder: 'asc',
    filters: {},
  },
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  validationErrors: {},
  lastError: null,
  lastUpdated: null,
};

const initialMenuDetailState: MenuDetailState = {
  item: null,
  history: [],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  validationErrors: {},
  lastError: null,
  lastUpdated: null,
};

// Async thunks for categories
export const fetchCategories = createAsyncThunk<
  Category[],
  void,
  { rejectValue: ApiError }
>(
  'menu/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      return await menuAPI.getCategories();
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const createCategory = createAsyncThunk<
  Category,
  CreateCategoryData,
  { rejectValue: ApiError }
>(
  'menu/createCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      return await menuAPI.createCategory(categoryData);
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const updateCategory = createAsyncThunk<
  Category,
  { id: number; data: UpdateCategoryData },
  { rejectValue: ApiError }
>(
  'menu/updateCategory',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await menuAPI.updateCategory(id, data);
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const deleteCategory = createAsyncThunk<
  number,
  number,
  { rejectValue: ApiError }
>(
  'menu/deleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      await menuAPI.deleteCategory(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

// Async thunks for menu items
export const fetchMenuItems = createAsyncThunk<
  MenuItem[],
  { category_id?: number; is_active?: boolean; is_available?: boolean },
  { rejectValue: ApiError }
>(
  'menu/fetchMenuItems',
  async (filters, { rejectWithValue }) => {
    try {
      return await menuAPI.getItems(filters);
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const fetchMenuItem = createAsyncThunk<
  MenuItem,
  number,
  { rejectValue: ApiError }
>(
  'menu/fetchMenuItem',
  async (id, { rejectWithValue }) => {
    try {
      return await menuAPI.getItem(id);
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const createMenuItem = createAsyncThunk<
  MenuItem,
  CreateMenuItemData,
  { rejectValue: ApiError }
>(
  'menu/createMenuItem',
  async (itemData, { rejectWithValue }) => {
    try {
      return await menuAPI.createItem(itemData);
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const updateMenuItem = createAsyncThunk<
  MenuItem,
  { id: number; data: UpdateMenuItemData },
  { rejectValue: ApiError }
>(
  'menu/updateMenuItem',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await menuAPI.updateItem(id, data);
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const deleteMenuItem = createAsyncThunk<
  number,
  number,
  { rejectValue: ApiError }
>(
  'menu/deleteMenuItem',
  async (id, { rejectWithValue }) => {
    try {
      await menuAPI.deleteItem(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const uploadMenuItemImage = createAsyncThunk<
  { id: number; image_url: string },
  { id: number; file: File },
  { rejectValue: ApiError }
>(
  'menu/uploadMenuItemImage',
  async ({ id, file }, { rejectWithValue }) => {
    try {
      const result = await menuAPI.uploadItemImage(id, file);
      return { id, image_url: result.image_url };
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

// Menu slice
const menuSlice = createSlice({
  name: 'menu',
  initialState: initialMenuState,
  reducers: {
    // Clear errors
    clearError: (state) => {
      state.error = null;
      state.validationErrors = {};
      state.lastError = null;
    },

    // Clear field error
    clearFieldError: (state, action) => {
      const { [action.payload]: removed, ...rest } = state.validationErrors;
      state.validationErrors = rest;
    },

    // Set selected category
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },

    // Set filter
    setFilter: (state, action) => {
      state.filters.filters[action.payload.key] = action.payload.value;
      state.pagination.currentPage = 1;
    },

    // Set search
    setSearch: (state, action) => {
      state.filters.search = action.payload;
      state.pagination.currentPage = 1;
    },

    // Clear filters
    clearFilters: (state) => {
      state.filters.filters = {};
      state.filters.search = '';
      state.selectedCategory = null;
      state.pagination.currentPage = 1;
    },

    // Select items
    selectItems: (state, action) => {
      state.selectedItems = action.payload;
    },

    // Toggle item selection
    toggleItemSelection: (state, action) => {
      const index = state.selectedItems.indexOf(action.payload);
      if (index >= 0) {
        state.selectedItems.splice(index, 1);
      } else {
        state.selectedItems.push(action.payload);
      }
    },

    // Clear selection
    clearSelection: (state) => {
      state.selectedItems = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch categories
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch categories';
        state.lastError = action.payload || null;
      });

    // Create category
    builder
      .addCase(createCategory.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.isCreating = false;
        state.categories.push(action.payload);
        state.lastUpdated = new Date().toISOString();
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload?.message || 'Failed to create category';
        state.lastError = action.payload || null;
        if (action.payload?.validationErrors) {
          state.validationErrors = formatValidationErrors(action.payload.validationErrors);
        }
      });

    // Update category
    builder
      .addCase(updateCategory.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.categories.findIndex(cat => cat.id === action.payload.id);
        if (index >= 0) {
          state.categories[index] = action.payload;
        }
        state.lastUpdated = new Date().toISOString();
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload?.message || 'Failed to update category';
        state.lastError = action.payload || null;
        if (action.payload?.validationErrors) {
          state.validationErrors = formatValidationErrors(action.payload.validationErrors);
        }
      });

    // Delete category
    builder
      .addCase(deleteCategory.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.categories = state.categories.filter(cat => cat.id !== action.payload);
        if (state.selectedCategory === action.payload) {
          state.selectedCategory = null;
        }
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload?.message || 'Failed to delete category';
        state.lastError = action.payload || null;
      });

    // Fetch menu items
    builder
      .addCase(fetchMenuItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMenuItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(fetchMenuItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch menu items';
        state.lastError = action.payload || null;
      });

    // Create menu item
    builder
      .addCase(createMenuItem.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(createMenuItem.fulfilled, (state, action) => {
        state.isCreating = false;
        state.items.unshift(action.payload);
        state.lastUpdated = new Date().toISOString();
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(createMenuItem.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload?.message || 'Failed to create menu item';
        state.lastError = action.payload || null;
        if (action.payload?.validationErrors) {
          state.validationErrors = formatValidationErrors(action.payload.validationErrors);
        }
      });

    // Update menu item
    builder
      .addCase(updateMenuItem.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(updateMenuItem.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index >= 0) {
          state.items[index] = action.payload;
        }
        state.lastUpdated = new Date().toISOString();
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(updateMenuItem.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload?.message || 'Failed to update menu item';
        state.lastError = action.payload || null;
        if (action.payload?.validationErrors) {
          state.validationErrors = formatValidationErrors(action.payload.validationErrors);
        }
      });

    // Delete menu item
    builder
      .addCase(deleteMenuItem.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteMenuItem.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.items = state.items.filter(item => item.id !== action.payload);
        state.selectedItems = state.selectedItems.filter(id => id !== action.payload);
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(deleteMenuItem.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload?.message || 'Failed to delete menu item';
        state.lastError = action.payload || null;
      });

    // Upload menu item image
    builder
      .addCase(uploadMenuItemImage.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(uploadMenuItemImage.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index >= 0) {
          state.items[index].image_url = action.payload.image_url;
        }
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(uploadMenuItemImage.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload?.message || 'Failed to upload image';
        state.lastError = action.payload || null;
        if (action.payload?.validationErrors) {
          state.validationErrors = formatValidationErrors(action.payload.validationErrors);
        }
      });
  },
});

// Selectors
export const selectMenu = (state: { menu: MenuListState }) => state.menu;
export const selectMenuItems = (state: { menu: MenuListState }) => state.menu.items;
export const selectCategories = (state: { menu: MenuListState }) => state.menu.categories;
export const selectSelectedCategory = (state: { menu: MenuListState }) => state.menu.selectedCategory;
export const selectMenuLoading = (state: { menu: MenuListState }) => state.menu.isLoading;
export const selectMenuCreating = (state: { menu: MenuListState }) => state.menu.isCreating;
export const selectMenuUpdating = (state: { menu: MenuListState }) => state.menu.isUpdating;
export const selectMenuDeleting = (state: { menu: MenuListState }) => state.menu.isDeleting;
export const selectMenuError = (state: { menu: MenuListState }) => state.menu.error;
export const selectMenuValidationErrors = (state: { menu: MenuListState }) => state.menu.validationErrors;
export const selectSelectedItems = (state: { menu: MenuListState }) => state.menu.selectedItems;

// Filtered selectors
export const selectMenuItemsByCategory = (categoryId: number | null) => 
  (state: { menu: MenuListState }) => {
    if (categoryId === null) {
      return state.menu.items;
    }
    return state.menu.items.filter(item => item.category_id === categoryId);
  };

export const selectAvailableMenuItems = (state: { menu: MenuListState }) => 
  state.menu.items.filter(item => item.is_active && item.is_available);

export const selectActiveCategories = (state: { menu: MenuListState }) => 
  state.menu.categories.filter(category => category.is_active);

export const {
  clearError,
  clearFieldError,
  setSelectedCategory,
  setFilter,
  setSearch,
  clearFilters,
  selectItems,
  toggleItemSelection,
  clearSelection,
} = menuSlice.actions;

export default menuSlice.reducer;