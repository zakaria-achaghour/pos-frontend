import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { tableAPI } from '../../api/tables';
import type { 
  Table, 
  CreateTableRequest, 
  UpdateTableRequest, 
  TableFilters,
  TablesResponse,
  TableAnalytics
} from '../../types/table';
import { parseApiError, formatValidationErrors } from '../utils/errorUtils';
import type { ApiError } from '../types/common';

// Table state interface
interface TableState {
  // Main data
  tables: Table[];
  currentTable: Table | null;
  
  // Pagination
  totalTables: number;
  currentPage: number;
  itemsPerPage: number;
  
  // Analytics data
  analytics: TableAnalytics[];
  
  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isLoadingAnalytics: boolean;
  isUpdatingLayout: boolean;
  
  // Error states
  error: string | null;
  validationErrors: Record<string, string[]>;
  lastError: ApiError | null;
  
  // Filters and UI state
  filters: TableFilters;
  
  selectedTables: number[];
  
  // Layout mode for drag & drop
  isLayoutMode: boolean;
  
  lastUpdated: string | null;
}

const initialState: TableState = {
  tables: [],
  currentTable: null,
  totalTables: 0,
  currentPage: 1,
  itemsPerPage: 20,
  analytics: [],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isLoadingAnalytics: false,
  isUpdatingLayout: false,
  error: null,
  validationErrors: {},
  lastError: null,
  filters: {},
  selectedTables: [],
  isLayoutMode: false,
  lastUpdated: null,
};

// Async thunks
export const fetchTables = createAsyncThunk<
  TablesResponse,
  { page?: number; limit?: number; filters?: TableFilters },
  { rejectValue: ApiError }
>(
  'tables/fetchTables',
  async ({ page = 1, limit = 20, filters }, { rejectWithValue }) => {
    try {
      return await tableAPI.getTables({ page, limit, filters: filters || {} });
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const fetchTable = createAsyncThunk<
  Table,
  number,
  { rejectValue: ApiError }
>(
  'tables/fetchTable',
  async (id, { rejectWithValue }) => {
    try {
      return await tableAPI.getTable(id);
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const createTable = createAsyncThunk<
  Table,
  CreateTableRequest,
  { rejectValue: ApiError }
>(
  'tables/createTable',
  async (tableData, { rejectWithValue }) => {
    try {
      return await tableAPI.createTable(tableData);
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const updateTable = createAsyncThunk<
  Table,
  { id: number; data: Partial<UpdateTableRequest> },
  { rejectValue: ApiError }
>(
  'tables/updateTable',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await tableAPI.updateTable(id, data);
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const deleteTable = createAsyncThunk<
  number,
  number,
  { rejectValue: ApiError }
>(
  'tables/deleteTable',
  async (id, { rejectWithValue }) => {
    try {
      await tableAPI.deleteTable(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const updateTableStatusAsync = createAsyncThunk<
  Table,
  { id: number; status: Table['status'] },
  { rejectValue: ApiError }
>(
  'tables/updateTableStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      return await tableAPI.updateTableStatus(id, status);
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const bulkUpdateStatus = createAsyncThunk<
  Table[],
  { tableIds: number[]; status: Table['status'] },
  { rejectValue: ApiError }
>(
  'tables/bulkUpdateStatus',
  async ({ tableIds, status }, { rejectWithValue }) => {
    try {
      return await tableAPI.bulkUpdateStatus(tableIds, status);
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const fetchAnalytics = createAsyncThunk<
  TableAnalytics[],
  'today' | 'week' | 'month',
  { rejectValue: ApiError }
>(
  'tables/fetchAnalytics',
  async (period, { rejectWithValue }) => {
    try {
      return await tableAPI.getAnalytics(period);
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

// Slice
const tableSlice = createSlice({
  name: 'tables',
  initialState,
  reducers: {
    // Error management
    clearError: (state) => {
      state.error = null;
      state.validationErrors = {};
      state.lastError = null;
    },

    clearFieldError: (state, action: PayloadAction<string>) => {
      const { [action.payload]: removed, ...rest } = state.validationErrors;
      state.validationErrors = rest;
    },

    // Current table management
    setCurrentTable: (state, action: PayloadAction<Table | null>) => {
      state.currentTable = action.payload;
    },

    clearCurrentTable: (state) => {
      state.currentTable = null;
    },

    // Filter management
    setStatusFilter: (state, action: PayloadAction<Table['status'] | undefined>) => {
      if (action.payload === undefined) {
        delete state.filters.status;
      } else {
        state.filters.status = action.payload;
      }
    },

    setSearchTerm: (state, action: PayloadAction<string | undefined>) => {
      const searchTerm = action.payload?.trim();
      if (!searchTerm) {
        delete state.filters.searchTerm;
      } else {
        state.filters.searchTerm = searchTerm;
      }
    },

    setCapacityFilter: (state, action: PayloadAction<number | undefined>) => {
      if (action.payload === undefined) {
        delete state.filters.capacity;
      } else {
        state.filters.capacity = action.payload;
      }
    },

    setCapacityRange: (state, action: PayloadAction<{ min?: number; max?: number }>) => {
      if (action.payload.min === undefined) {
        delete state.filters.minCapacity;
      } else {
        state.filters.minCapacity = action.payload.min;
      }
      if (action.payload.max === undefined) {
        delete state.filters.maxCapacity;
      } else {
        state.filters.maxCapacity = action.payload.max;
      }
    },

    setSectionFilter: (state, action: PayloadAction<string | undefined>) => {
      if (action.payload === undefined) {
        delete state.filters.section;
      } else {
        state.filters.section = action.payload;
      }
    },

    setFloorFilter: (state, action: PayloadAction<number | undefined>) => {
      if (action.payload === undefined) {
        delete state.filters.floor;
      } else {
        state.filters.floor = action.payload;
      }
    },

    setShapeFilter: (state, action: PayloadAction<Table['shape'] | undefined>) => {
      if (action.payload === undefined) {
        delete state.filters.shape;
      } else {
        state.filters.shape = action.payload;
      }
    },

    clearFilters: (state) => {
      state.filters = {};
    },

    // Pagination
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },

    setItemsPerPage: (state, action: PayloadAction<number>) => {
      state.itemsPerPage = action.payload;
    },

    // Selection management
    selectTables: (state, action: PayloadAction<number[]>) => {
      state.selectedTables = action.payload;
    },

    toggleTableSelection: (state, action: PayloadAction<number>) => {
      const index = state.selectedTables.indexOf(action.payload);
      if (index >= 0) {
        state.selectedTables.splice(index, 1);
      } else {
        state.selectedTables.push(action.payload);
      }
    },

    selectAllTables: (state) => {
      state.selectedTables = state.tables.map(table => table.id);
    },

    clearSelection: (state) => {
      state.selectedTables = [];
    },

    // Layout management
    toggleLayoutMode: (state) => {
      state.isLayoutMode = !state.isLayoutMode;
    },

    setLayoutMode: (state, action: PayloadAction<boolean>) => {
      state.isLayoutMode = action.payload;
    },

    // Optimistic updates for drag & drop
    updateTablePosition: (state, action: PayloadAction<{ id: number; x: number; y: number }>) => {
      const table = state.tables.find(t => t.id === action.payload.id);
      if (table && table.location?.coordinates) {
        table.location.coordinates.x = action.payload.x;
        table.location.coordinates.y = action.payload.y;
      }
    },

    // Real-time status updates
    updateTableStatus: (state, action: PayloadAction<{ id: number; status: Table['status'] }>) => {
      const table = state.tables.find(t => t.id === action.payload.id);
      if (table) {
        table.status = action.payload.status;
      }
      if (state.currentTable && state.currentTable.id === action.payload.id) {
        state.currentTable.status = action.payload.status;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch tables
    builder
      .addCase(fetchTables.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTables.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tables = action.payload.tables;
        state.totalTables = action.payload.total;
        state.currentPage = action.payload.page;
        state.itemsPerPage = action.payload.limit;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(fetchTables.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch tables';
        state.lastError = action.payload || null;
      });

    // Fetch single table
    builder
      .addCase(fetchTable.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTable.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTable = action.payload;
        
        // Update in tables list if present
        const index = state.tables.findIndex(table => table.id === action.payload.id);
        if (index >= 0) {
          state.tables[index] = action.payload;
        }
        
        state.lastUpdated = new Date().toISOString();
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(fetchTable.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch table';
        state.lastError = action.payload || null;
      });

    // Create table
    builder
      .addCase(createTable.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(createTable.fulfilled, (state, action) => {
        state.isCreating = false;
        state.tables.push(action.payload);
        state.currentTable = action.payload;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(createTable.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload?.message || 'Failed to create table';
        state.lastError = action.payload || null;
        if (action.payload?.validationErrors) {
          state.validationErrors = formatValidationErrors(action.payload.validationErrors);
        }
      });

    // Update table
    builder
      .addCase(updateTable.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(updateTable.fulfilled, (state, action) => {
        state.isUpdating = false;
        const updatedTable = action.payload;
        
        // Update in tables list
        const index = state.tables.findIndex(table => table.id === updatedTable.id);
        if (index >= 0) {
          state.tables[index] = updatedTable;
        }
        
        // Update current table if it's the same
        if (state.currentTable && state.currentTable.id === updatedTable.id) {
          state.currentTable = updatedTable;
        }
        
        state.lastUpdated = new Date().toISOString();
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(updateTable.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload?.message || 'Failed to update table';
        state.lastError = action.payload || null;
        if (action.payload?.validationErrors) {
          state.validationErrors = formatValidationErrors(action.payload.validationErrors);
        }
      });

    // Delete table
    builder
      .addCase(deleteTable.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteTable.fulfilled, (state, action) => {
        state.isDeleting = false;
        const deletedId = action.payload;
        
        state.tables = state.tables.filter(table => table.id !== deletedId);
        state.selectedTables = state.selectedTables.filter(id => id !== deletedId);
        
        if (state.currentTable && state.currentTable.id === deletedId) {
          state.currentTable = null;
        }
        
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(deleteTable.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload?.message || 'Failed to delete table';
        state.lastError = action.payload || null;
      });

    // Fetch analytics
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.isLoadingAnalytics = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.isLoadingAnalytics = false;
        state.analytics = action.payload;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.isLoadingAnalytics = false;
        state.error = action.payload?.message || 'Failed to fetch analytics';
        state.lastError = action.payload || null;
      });

    // Update table status
    builder
      .addCase(updateTableStatusAsync.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateTableStatusAsync.fulfilled, (state, action) => {
        state.isUpdating = false;
        const updatedTable = action.payload;
        
        // Update in tables list
        const index = state.tables.findIndex(table => table.id === updatedTable.id);
        if (index >= 0) {
          state.tables[index] = updatedTable;
        }
        
        // Update current table if it's the same
        if (state.currentTable && state.currentTable.id === updatedTable.id) {
          state.currentTable = updatedTable;
        }
        
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(updateTableStatusAsync.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload?.message || 'Failed to update table status';
        state.lastError = action.payload || null;
      });

    // Bulk update status
    builder
      .addCase(bulkUpdateStatus.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(bulkUpdateStatus.fulfilled, (state, action) => {
        state.isUpdating = false;
        const updatedTables = action.payload;
        
        // Update tables in the list
        updatedTables.forEach(updatedTable => {
          const index = state.tables.findIndex(table => table.id === updatedTable.id);
          if (index >= 0) {
            state.tables[index] = updatedTable;
          }
        });
        
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(bulkUpdateStatus.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload?.message || 'Failed to bulk update tables';
        state.lastError = action.payload || null;
      });
  },
});

// Selectors
export const selectTables = (state: { tables: TableState }) => state.tables;
export const selectTablesList = (state: { tables: TableState }) => state.tables.tables;
export const selectCurrentTable = (state: { tables: TableState }) => state.tables.currentTable;
export const selectTablesLoading = (state: { tables: TableState }) => state.tables.isLoading;
export const selectTablesCreating = (state: { tables: TableState }) => state.tables.isCreating;
export const selectTablesUpdating = (state: { tables: TableState }) => state.tables.isUpdating;
export const selectTablesDeleting = (state: { tables: TableState }) => state.tables.isDeleting;
export const selectTablesError = (state: { tables: TableState }) => state.tables.error;
export const selectTablesValidationErrors = (state: { tables: TableState }) => state.tables.validationErrors;
export const selectSelectedTables = (state: { tables: TableState }) => state.tables.selectedTables;
export const selectTablesFilters = (state: { tables: TableState }) => state.tables.filters;
export const selectIsLayoutMode = (state: { tables: TableState }) => state.tables.isLayoutMode;
export const selectTableAnalytics = (state: { tables: TableState }) => state.tables.analytics;

// Computed selectors
export const selectAvailableTables = (state: { tables: TableState }) => 
  state.tables.tables.filter(table => table.status === 'available');

export const selectOccupiedTables = (state: { tables: TableState }) => 
  state.tables.tables.filter(table => table.status === 'occupied');

export const selectTablesByStatus = (status: Table['status']) => 
  (state: { tables: TableState }) => 
    state.tables.tables.filter(table => table.status === status);

export const selectFilteredTables = (state: { tables: TableState }) => {
  let filtered = state.tables.tables;
  
  if (state.tables.filters.status) {
    filtered = filtered.filter(table => table.status === state.tables.filters.status);
  }
  
  if (state.tables.filters.searchTerm) {
    const search = state.tables.filters.searchTerm.toLowerCase();
    filtered = filtered.filter(table => 
      table.number.toLowerCase().includes(search) ||
      table.id.toString().includes(search) ||
      table.location.section.toLowerCase().includes(search)
    );
  }

  if (state.tables.filters.capacity) {
    filtered = filtered.filter(table => table.capacity === state.tables.filters.capacity);
  }

  if (state.tables.filters.minCapacity) {
    filtered = filtered.filter(table => table.capacity >= state.tables.filters.minCapacity!);
  }

  if (state.tables.filters.maxCapacity) {
    filtered = filtered.filter(table => table.capacity <= state.tables.filters.maxCapacity!);
  }

  if (state.tables.filters.section) {
    filtered = filtered.filter(table => table.location.section === state.tables.filters.section);
  }

  if (state.tables.filters.floor) {
    filtered = filtered.filter(table => table.location.floor === state.tables.filters.floor);
  }

  if (state.tables.filters.shape) {
    filtered = filtered.filter(table => table.shape === state.tables.filters.shape);
  }
  
  return filtered;
};

export const selectTableById = (id: number) => 
  (state: { tables: TableState }) => 
    state.tables.tables.find(table => table.id === id);

// Actions
export const {
  clearError,
  clearFieldError,
  setCurrentTable,
  clearCurrentTable,
  setStatusFilter,
  setSearchTerm,
  setCapacityFilter,
  setCapacityRange,
  setSectionFilter,
  setFloorFilter,
  setShapeFilter,
  clearFilters,
  setCurrentPage,
  setItemsPerPage,
  selectTables: selectTablesAction,
  toggleTableSelection,
  selectAllTables,
  clearSelection,
  toggleLayoutMode,
  setLayoutMode,
  updateTablePosition,
  updateTableStatus,
} = tableSlice.actions;

export default tableSlice.reducer;
