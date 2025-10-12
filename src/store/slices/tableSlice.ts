import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { tableAPI } from '../../api/tables';
import type { Table, CreateTableData, UpdateTableData, TableAnalytics, OccupancyData } from '../../api/tables';
import { parseApiError, formatValidationErrors } from '../utils/errorUtils';
import type { ApiError } from '../types/common';

// Table state interface
interface TableState {
  // Main data
  tables: Table[];
  currentTable: Table | null;
  
  // Analytics data
  analytics: TableAnalytics[];
  occupancyData: OccupancyData | null;
  
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
  filters: {
    status?: 'available' | 'occupied' | 'reserved' | 'maintenance';
    search: string;
  };
  
  selectedTables: number[];
  
  // Layout mode for drag & drop
  isLayoutMode: boolean;
  
  lastUpdated: string | null;
}

const initialState: TableState = {
  tables: [],
  currentTable: null,
  analytics: [],
  occupancyData: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isLoadingAnalytics: false,
  isUpdatingLayout: false,
  error: null,
  validationErrors: {},
  lastError: null,
  filters: {
    search: '',
  },
  selectedTables: [],
  isLayoutMode: false,
  lastUpdated: null,
};

// Async thunks
export const fetchTables = createAsyncThunk<
  Table[],
  void,
  { rejectValue: ApiError }
>(
  'tables/fetchTables',
  async (_, { rejectWithValue }) => {
    try {
      return await tableAPI.getTables();
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
  CreateTableData,
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
  { id: number; data: UpdateTableData },
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

export const fetchOccupancyData = createAsyncThunk<
  OccupancyData,
  void,
  { rejectValue: ApiError }
>(
  'tables/fetchOccupancyData',
  async (_, { rejectWithValue }) => {
    try {
      return await tableAPI.getOccupancyRates();
    } catch (error: any) {
      return rejectWithValue(parseApiError(error));
    }
  }
);

export const updateLayout = createAsyncThunk<
  void,
  { id: number; position_x: number; position_y: number }[],
  { rejectValue: ApiError }
>(
  'tables/updateLayout',
  async (tables, { rejectWithValue }) => {
    try {
      await tableAPI.updateLayout(tables);
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
    setStatusFilter: (state, action: PayloadAction<'available' | 'occupied' | 'reserved' | 'maintenance' | undefined>) => {
      state.filters.status = action.payload;
    },

    setSearch: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
    },

    clearFilters: (state) => {
      state.filters = { search: '' };
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
    updateTablePosition: (state, action: PayloadAction<{ id: number; position_x: number; position_y: number }>) => {
      const table = state.tables.find(t => t.id === action.payload.id);
      if (table) {
        table.position_x = action.payload.position_x;
        table.position_y = action.payload.position_y;
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
        state.tables = action.payload;
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

    // Fetch occupancy data
    builder
      .addCase(fetchOccupancyData.pending, (state) => {
        state.isLoadingAnalytics = true;
        state.error = null;
      })
      .addCase(fetchOccupancyData.fulfilled, (state, action) => {
        state.isLoadingAnalytics = false;
        state.occupancyData = action.payload;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchOccupancyData.rejected, (state, action) => {
        state.isLoadingAnalytics = false;
        state.error = action.payload?.message || 'Failed to fetch occupancy data';
        state.lastError = action.payload || null;
      });

    // Update layout
    builder
      .addCase(updateLayout.pending, (state) => {
        state.isUpdatingLayout = true;
        state.error = null;
      })
      .addCase(updateLayout.fulfilled, (state) => {
        state.isUpdatingLayout = false;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(updateLayout.rejected, (state, action) => {
        state.isUpdatingLayout = false;
        state.error = action.payload?.message || 'Failed to update layout';
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
export const selectOccupancyData = (state: { tables: TableState }) => state.tables.occupancyData;

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
  
  if (state.tables.filters.search) {
    const search = state.tables.filters.search.toLowerCase();
    filtered = filtered.filter(table => 
      table.name.toLowerCase().includes(search) ||
      table.id.toString().includes(search)
    );
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
  setSearch,
  clearFilters,
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