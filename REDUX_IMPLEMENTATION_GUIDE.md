# Redux State Management Documentation

This document provides a comprehensive guide to the Redux state management system implemented in this POS frontend application.

## Overview

The Redux setup provides a robust, type-safe state management solution with comprehensive error handling, validation, and real-time data management for a Point of Sale (POS) system.

## Architecture

### Core Components

1. **Store Configuration** (`src/store/index.ts`)
2. **Type Definitions** (`src/store/types/common.ts`)
3. **Error Utilities** (`src/store/utils/errorUtils.ts`)
4. **Slice Factory** (`src/store/utils/sliceFactory.ts`)
5. **Custom Hooks** (`src/store/hooks.ts`)

### State Slices

#### 1. Authentication (`authSlice.ts`)
- User authentication state
- Role-based access control
- Token management
- Login/logout functionality

#### 2. Menu Management (`menuSlice.ts`)
- Menu items and categories
- CRUD operations for menu items
- Category filtering
- Image upload handling

#### 3. Order Management (`orderSlice.ts`)
- Order creation and management
- Order items manipulation
- Payment processing
- Order status tracking

#### 4. Table Management (`tableSlice.ts`)
- Table status and layout
- Real-time occupancy tracking
- Drag & drop layout management
- Table analytics

#### 5. Dashboard (`dashboardSlice.ts`)
- Real-time metrics
- Sales analytics
- Staff performance
- Auto-refresh capabilities

#### 6. Staff Management (`staffSlice.ts`)
- Staff CRUD operations
- Role management
- Performance tracking

#### 7. Restaurant Configuration (`restaurantSlice.ts`)
- Restaurant settings
- Configuration management

#### 8. UI State (`themeSlice.ts`, `sidebarSlice.ts`)
- Theme management
- Sidebar state
- UI preferences

## Error Handling & Validation

### Validation Error Structure

```typescript
interface ValidationError {
  field: string;
  message: string;
}

interface ApiError {
  message: string;
  code?: string;
  status?: number;
  validationErrors?: ValidationError[];
}
```

### Error Utilities

The `errorUtils.ts` file provides utilities for:
- Parsing API errors
- Formatting validation errors
- Field-specific error handling
- Error type checking

### Usage Examples

#### Handling Validation Errors in Components

```typescript
import { useFieldError, useAsyncState } from '../store/hooks';

const MyComponent = () => {
  const fieldError = useFieldError('menu', 'name');
  const { isCreating, validationErrors } = useAsyncState('menu');
  
  return (
    <div>
      <input 
        className={fieldError ? 'error' : ''}
        // ... other props
      />
      {fieldError && <span className="error">{fieldError}</span>}
    </div>
  );
};
```

## Custom Hooks

### Basic Hooks

```typescript
// Typed dispatch and selector
const dispatch = useAppDispatch();
const state = useAppSelector(selector);

// Slice-specific hooks
const authState = useAuth();
const menuState = useMenu();
const ordersState = useOrders();
```

### Validation Hooks

```typescript
// Get validation errors for a slice
const validationErrors = useValidationErrors('menu');

// Get error for a specific field
const nameError = useFieldError('menu', 'name');

// Check if field has errors
const hasNameError = useHasError('menu', 'name');
```

### Loading State Hooks

```typescript
// Individual loading states
const isLoading = useIsLoading('menu');
const isCreating = useIsCreating('menu');
const isUpdating = useIsUpdating('menu');
const isDeleting = useIsDeleting('menu');

// Combined async state
const { 
  isLoading, 
  isCreating, 
  isProcessing, 
  error, 
  validationErrors 
} = useAsyncState('menu');
```

## API Integration

### Async Thunks Pattern

Each slice follows a consistent pattern for API calls:

```typescript
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
```

### Error Handling in Thunks

All thunks use the `parseApiError` utility to standardize error handling:

```typescript
// In extra reducers
.addCase(createMenuItem.rejected, (state, action) => {
  state.isCreating = false;
  state.error = action.payload?.message || 'Failed to create menu item';
  state.lastError = action.payload || null;
  if (action.payload?.validationErrors) {
    state.validationErrors = formatValidationErrors(action.payload.validationErrors);
  }
});
```

## Real-time Updates

### WebSocket Integration

The system supports real-time updates for:
- Order status changes
- Table occupancy
- Payment notifications
- Staff activities

### Optimistic Updates

For better UX, some actions use optimistic updates:

```typescript
// Example: Table position updates during drag & drop
updateTablePosition: (state, action) => {
  const table = state.tables.find(t => t.id === action.payload.id);
  if (table) {
    table.position_x = action.payload.position_x;
    table.position_y = action.payload.position_y;
  }
}
```

## Best Practices

### 1. Type Safety

Always use typed hooks and properly type async thunks:

```typescript
// Good
const dispatch = useAppDispatch();
const menuState = useAppSelector(state => state.menu);

// Better
const menuState = useMenu();
```

### 2. Error Handling

Always handle errors at the component level:

```typescript
const handleSubmit = async () => {
  try {
    await dispatch(createMenuItem(data)).unwrap();
    // Success handling
  } catch (error) {
    // Error is already in Redux state
    console.error('Failed to create item:', error);
  }
};
```

### 3. Loading States

Use the provided loading hooks for better UX:

```typescript
const { isProcessing } = useAsyncState('menu');

return (
  <button disabled={isProcessing}>
    {isProcessing ? 'Saving...' : 'Save'}
  </button>
);
```

### 4. Validation Display

Use validation hooks for form validation:

```typescript
const nameError = useFieldError('menu', 'name');
const hasError = useHasError('menu');

return (
  <div className={hasError ? 'form-error' : ''}>
    <input className={nameError ? 'input-error' : ''} />
    {nameError && <span>{nameError}</span>}
  </div>
);
```

## State Structure

### Menu Slice Example

```typescript
interface MenuState {
  // Data
  items: MenuItem[];
  categories: Category[];
  selectedCategory: number | null;
  
  // UI State
  selectedItems: number[];
  pagination: PaginationState;
  filters: FilterState;
  
  // Async State
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  
  // Error State
  error: string | null;
  validationErrors: Record<string, string[]>;
  lastError: ApiError | null;
  
  // Metadata
  lastUpdated: string | null;
}
```

## Testing

### Testing Redux Logic

```typescript
import { configureStore } from '@reduxjs/toolkit';
import menuReducer, { createMenuItem } from '../slices/menuSlice';

const createTestStore = () => {
  return configureStore({
    reducer: { menu: menuReducer }
  });
};

test('should handle menu item creation', async () => {
  const store = createTestStore();
  const itemData = { name: 'Test Item', price: 10.99 };
  
  await store.dispatch(createMenuItem(itemData));
  
  const state = store.getState();
  expect(state.menu.items).toHaveLength(1);
  expect(state.menu.error).toBeNull();
});
```

## Performance Considerations

### 1. Memoization

Use selectors with memoization for computed values:

```typescript
export const selectFilteredMenuItems = createSelector(
  [selectMenuItems, selectSelectedCategory],
  (items, categoryId) => {
    return categoryId 
      ? items.filter(item => item.category_id === categoryId)
      : items;
  }
);
```

### 2. Pagination

Implement server-side pagination to avoid loading large datasets:

```typescript
const { pagination } = useMenu();
const handlePageChange = (page: number) => {
  dispatch(fetchMenuItems({ page, perPage: pagination.perPage }));
};
```

### 3. Debounced Search

Implement debounced search for better performance:

```typescript
const [searchTerm, setSearchTerm] = useState('');

useEffect(() => {
  const timer = setTimeout(() => {
    dispatch(setSearch(searchTerm));
  }, 300);
  
  return () => clearTimeout(timer);
}, [searchTerm, dispatch]);
```

## Docker Integration

The Redux system works seamlessly with the Docker development environment:

```bash
# Access the container
docker exec -it pos-frontend-dev sh

# The API is available at
http://localhost:8080/api/documentation
```

## Conclusion

This Redux setup provides a comprehensive, type-safe, and scalable state management solution for the POS application. It includes:

- ✅ Comprehensive error handling and validation
- ✅ Type safety throughout
- ✅ Custom hooks for common patterns
- ✅ Real-time data support
- ✅ Optimistic updates
- ✅ Consistent API integration
- ✅ Performance optimizations

For questions or additional features, refer to the individual slice files or create new slices following the established patterns.