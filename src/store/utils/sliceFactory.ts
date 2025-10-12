import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  BaseEntity,
  ListState,
  DetailState,
  CreateActionPayload,
  UpdateActionPayload,
  DeleteActionPayload,
  FetchListPayload,
  AsyncThunkConfig,
  PaginationState,
  FilterState,
} from '../types/common';
import { parseApiError, formatValidationErrors } from '../utils/errorUtils';

// Initial states
export const createInitialListState = <T extends BaseEntity>(): ListState<T> => ({
  items: [],
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
    sortBy: 'id',
    sortOrder: 'desc',
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
});

export const createInitialDetailState = <T extends BaseEntity>(): DetailState<T> => ({
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
});

// Generic async thunk creators
export const createFetchListThunk = <T extends BaseEntity>(
  name: string,
  apiCall: (params: FetchListPayload) => Promise<{ data: T[]; pagination: PaginationState }>
) => {
  return createAsyncThunk<
    { data: T[]; pagination: PaginationState },
    FetchListPayload,
    AsyncThunkConfig
  >(
    `${name}/fetchList`,
    async (params, { rejectWithValue }) => {
      try {
        return await apiCall(params);
      } catch (error: any) {
        return rejectWithValue(parseApiError(error));
      }
    }
  );
};

export const createFetchByIdThunk = <T extends BaseEntity>(
  name: string,
  apiCall: (id: number) => Promise<T>
) => {
  return createAsyncThunk<T, number, AsyncThunkConfig>(
    `${name}/fetchById`,
    async (id, { rejectWithValue }) => {
      try {
        return await apiCall(id);
      } catch (error: any) {
        return rejectWithValue(parseApiError(error));
      }
    }
  );
};

export const createCreateThunk = <T extends BaseEntity, C>(
  name: string,
  apiCall: (data: C) => Promise<T>
) => {
  return createAsyncThunk<T, C, AsyncThunkConfig>(
    `${name}/create`,
    async (data, { rejectWithValue }) => {
      try {
        return await apiCall(data);
      } catch (error: any) {
        return rejectWithValue(parseApiError(error));
      }
    }
  );
};

export const createUpdateThunk = <T extends BaseEntity, U>(
  name: string,
  apiCall: (id: number, data: U) => Promise<T>
) => {
  return createAsyncThunk<T, { id: number; data: U }, AsyncThunkConfig>(
    `${name}/update`,
    async ({ id, data }, { rejectWithValue }) => {
      try {
        return await apiCall(id, data);
      } catch (error: any) {
        return rejectWithValue(parseApiError(error));
      }
    }
  );
};

export const createDeleteThunk = <T extends BaseEntity>(
  name: string,
  apiCall: (id: number) => Promise<void>
) => {
  return createAsyncThunk<number, number, AsyncThunkConfig>(
    `${name}/delete`,
    async (id, { rejectWithValue }) => {
      try {
        await apiCall(id);
        return id;
      } catch (error: any) {
        return rejectWithValue(parseApiError(error));
      }
    }
  );
};

// Common reducers
export const createCommonReducers = <T extends BaseEntity>() => ({
  // Clear errors
  clearError: (state: ListState<T> | DetailState<T>) => {
    state.error = null;
    state.validationErrors = {};
    state.lastError = null;
  },

  // Clear validation errors for specific field
  clearFieldError: (state: ListState<T> | DetailState<T>, action: PayloadAction<string>) => {
    const { [action.payload]: removed, ...rest } = state.validationErrors;
    state.validationErrors = rest;
  },

  // Set filter
  setFilter: (state: ListState<T>, action: PayloadAction<{ key: string; value: any }>) => {
    state.filters.filters[action.payload.key] = action.payload.value;
    state.pagination.currentPage = 1; // Reset to first page
  },

  // Clear filters
  clearFilters: (state: ListState<T>) => {
    state.filters.filters = {};
    state.filters.search = '';
    state.pagination.currentPage = 1;
  },

  // Set search
  setSearch: (state: ListState<T>, action: PayloadAction<string>) => {
    state.filters.search = action.payload;
    state.pagination.currentPage = 1;
  },

  // Set sort
  setSort: (state: ListState<T>, action: PayloadAction<{ sortBy: string; sortOrder: 'asc' | 'desc' }>) => {
    state.filters.sortBy = action.payload.sortBy;
    state.filters.sortOrder = action.payload.sortOrder;
    state.pagination.currentPage = 1;
  },

  // Set page
  setPage: (state: ListState<T>, action: PayloadAction<number>) => {
    state.pagination.currentPage = action.payload;
  },

  // Set page size
  setPageSize: (state: ListState<T>, action: PayloadAction<number>) => {
    state.pagination.perPage = action.payload;
    state.pagination.currentPage = 1;
  },

  // Select items
  selectItems: (state: ListState<T>, action: PayloadAction<number[]>) => {
    state.selectedItems = action.payload;
  },

  // Toggle item selection
  toggleItemSelection: (state: ListState<T>, action: PayloadAction<number>) => {
    const index = state.selectedItems.indexOf(action.payload);
    if (index >= 0) {
      state.selectedItems.splice(index, 1);
    } else {
      state.selectedItems.push(action.payload);
    }
  },

  // Select all items
  selectAllItems: (state: ListState<T>) => {
    state.selectedItems = state.items.map(item => item.id);
  },

  // Clear selection
  clearSelection: (state: ListState<T>) => {
    state.selectedItems = [];
  },
});

// Common extra reducers for async actions
export const createAsyncReducers = <T extends BaseEntity>(
  fetchListThunk: any,
  fetchByIdThunk: any,
  createThunk: any,
  updateThunk: any,
  deleteThunk: any
) => (builder: any) => {
  // Fetch list
  builder
    .addCase(fetchListThunk.pending, (state: ListState<T>) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(fetchListThunk.fulfilled, (state: ListState<T>, action: any) => {
      state.isLoading = false;
      state.items = action.payload.data;
      state.pagination = action.payload.pagination;
      state.lastUpdated = new Date().toISOString();
      state.error = null;
      state.validationErrors = {};
    })
    .addCase(fetchListThunk.rejected, (state: ListState<T>, action: any) => {
      state.isLoading = false;
      state.error = action.payload?.message || 'Failed to fetch items';
      state.lastError = action.payload;
      if (action.payload?.validationErrors) {
        state.validationErrors = formatValidationErrors(action.payload.validationErrors);
      }
    });

  // Fetch by ID
  builder
    .addCase(fetchByIdThunk.pending, (state: DetailState<T>) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(fetchByIdThunk.fulfilled, (state: DetailState<T>, action: any) => {
      state.isLoading = false;
      state.item = action.payload;
      
      // Add to history if not already present
      const existingIndex = state.history.findIndex(item => item.id === action.payload.id);
      if (existingIndex >= 0) {
        state.history[existingIndex] = action.payload;
      } else {
        state.history.unshift(action.payload);
        // Keep only last 10 items in history
        if (state.history.length > 10) {
          state.history = state.history.slice(0, 10);
        }
      }
      
      state.lastUpdated = new Date().toISOString();
      state.error = null;
      state.validationErrors = {};
    })
    .addCase(fetchByIdThunk.rejected, (state: DetailState<T>, action: any) => {
      state.isLoading = false;
      state.error = action.payload?.message || 'Failed to fetch item';
      state.lastError = action.payload;
    });

  // Create
  builder
    .addCase(createThunk.pending, (state: ListState<T> | DetailState<T>) => {
      state.isCreating = true;
      state.error = null;
      state.validationErrors = {};
    })
    .addCase(createThunk.fulfilled, (state: any, action: any) => {
      state.isCreating = false;
      
      if ('items' in state) {
        // List state
        state.items.unshift(action.payload);
        state.pagination.total += 1;
      } else {
        // Detail state
        state.item = action.payload;
        state.history.unshift(action.payload);
        if (state.history.length > 10) {
          state.history = state.history.slice(0, 10);
        }
      }
      
      state.lastUpdated = new Date().toISOString();
      state.error = null;
      state.validationErrors = {};
    })
    .addCase(createThunk.rejected, (state: ListState<T> | DetailState<T>, action: any) => {
      state.isCreating = false;
      state.error = action.payload?.message || 'Failed to create item';
      state.lastError = action.payload;
      if (action.payload?.validationErrors) {
        state.validationErrors = formatValidationErrors(action.payload.validationErrors);
      }
    });

  // Update
  builder
    .addCase(updateThunk.pending, (state: ListState<T> | DetailState<T>) => {
      state.isUpdating = true;
      state.error = null;
      state.validationErrors = {};
    })
    .addCase(updateThunk.fulfilled, (state: any, action: any) => {
      state.isUpdating = false;
      const updatedItem = action.payload;
      
      if ('items' in state) {
        // List state
        const index = state.items.findIndex((item: T) => item.id === updatedItem.id);
        if (index >= 0) {
          state.items[index] = updatedItem;
        }
      } else {
        // Detail state
        if (state.item && state.item.id === updatedItem.id) {
          state.item = updatedItem;
        }
        
        // Update in history
        const historyIndex = state.history.findIndex((item: T) => item.id === updatedItem.id);
        if (historyIndex >= 0) {
          state.history[historyIndex] = updatedItem;
        }
      }
      
      state.lastUpdated = new Date().toISOString();
      state.error = null;
      state.validationErrors = {};
    })
    .addCase(updateThunk.rejected, (state: ListState<T> | DetailState<T>, action: any) => {
      state.isUpdating = false;
      state.error = action.payload?.message || 'Failed to update item';
      state.lastError = action.payload;
      if (action.payload?.validationErrors) {
        state.validationErrors = formatValidationErrors(action.payload.validationErrors);
      }
    });

  // Delete
  builder
    .addCase(deleteThunk.pending, (state: ListState<T> | DetailState<T>) => {
      state.isDeleting = true;
      state.error = null;
    })
    .addCase(deleteThunk.fulfilled, (state: any, action: any) => {
      state.isDeleting = false;
      const deletedId = action.payload;
      
      if ('items' in state) {
        // List state
        state.items = state.items.filter((item: T) => item.id !== deletedId);
        state.selectedItems = state.selectedItems.filter((id: number) => id !== deletedId);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      } else {
        // Detail state
        if (state.item && state.item.id === deletedId) {
          state.item = null;
        }
        state.history = state.history.filter((item: T) => item.id !== deletedId);
      }
      
      state.lastUpdated = new Date().toISOString();
      state.error = null;
    })
    .addCase(deleteThunk.rejected, (state: ListState<T> | DetailState<T>, action: any) => {
      state.isDeleting = false;
      state.error = action.payload?.message || 'Failed to delete item';
      state.lastError = action.payload;
    });
};