# Table Management System

A comprehensive table management solution for restaurant POS systems built with React, TypeScript, and Redux Toolkit.

## Features

### 🍽️ Complete Table Management
- **CRUD Operations**: Create, read, update, and delete tables
- **Real-time Status Updates**: Available, occupied, reserved, maintenance, cleaning, out-of-order
- **Flexible Table Configuration**: Support for different shapes (round, square, rectangle, booth)
- **Capacity Management**: Define seating capacity for each table
- **Location Tracking**: Organize tables by section and floor
- **Table Features**: Mark tables with special features (wheelchair accessible, outdoor, high-top, etc.)

### 🔍 Advanced Filtering & Search
- **Quick Search**: Search by table number, ID, or section
- **Status Filtering**: Filter by table status
- **Capacity Filtering**: Filter by exact capacity or capacity range
- **Location Filtering**: Filter by section or floor
- **Shape Filtering**: Filter by table shape
- **Active Filter Display**: See all applied filters with easy removal

### 📊 Pagination & Views
- **Flexible Pagination**: Configurable items per page (10, 20, 50, 100)
- **Multiple View Modes**: Grid and list views
- **Bulk Operations**: Select multiple tables for bulk status updates
- **Responsive Design**: Works seamlessly on desktop and mobile

### 🎨 Modern UI/UX
- **Dark Mode Support**: Full dark/light theme compatibility
- **Responsive Design**: Mobile-first responsive layout
- **Interactive Components**: Hover states, loading indicators, animations
- **Accessibility**: WCAG compliant with proper ARIA labels

## Project Structure

```
src/
├── components/
│   ├── tables/
│   │   ├── TableForm.tsx          # Create/edit table form
│   │   ├── TableCard.tsx          # Individual table card display
│   │   ├── TableList.tsx          # Table list/grid container
│   │   └── TableFilters.tsx       # Advanced filtering component
│   ├── common/
│   │   └── Pagination.tsx         # Reusable pagination component
│   └── ui/
│       └── button/
│           └── Button.tsx         # Reusable button component
├── pages/
│   └── table-management/
│       ├── TableManagement.tsx    # Main table management page
│       ├── TableManagementPage.tsx # Page wrapper
│       ├── CreateTablePage.tsx    # Dedicated table creation page
│       ├── EditTablePage.tsx      # Dedicated table editing page
│       └── index.ts               # Export barrel
├── store/
│   └── slices/
│       └── tableSlice.ts          # Redux state management
├── api/
│   └── tables.ts                  # API communication layer
└── types/
    └── table.ts                   # TypeScript type definitions
```

## Type System

### Core Types

```typescript
// Table Status Options
type TableStatus = 'available' | 'occupied' | 'reserved' | 'maintenance' | 'cleaning' | 'out-of-order';

// Table Shape Options
type TableShape = 'round' | 'square' | 'rectangle' | 'booth';

// Table Features
type TableFeature = 'wheelchair_accessible' | 'outdoor' | 'high_top' | 'booth' | 'bar_seating' | 'private';

// Main Table Interface
interface Table {
  id: number;
  number: string;
  capacity: number;
  status: TableStatus;
  shape: TableShape;
  location: {
    section: string;
    floor: number;
    coordinates?: { x: number; y: number };
  };
  features: TableFeature[];
  description?: string;
  reservations?: Reservation[];
  currentOrder?: Order;
  lastCleaned?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Form & Filter Types

```typescript
// Form Data for Create/Update
interface TableFormData {
  number: string;
  capacity: number;
  shape: TableShape;
  status: TableStatus;
  section: string;
  floor: number;
  description?: string;
  features: TableFeature[];
}

// Comprehensive Filtering Options
interface TableFilters {
  status?: TableStatus;
  searchTerm?: string;
  capacity?: number;
  minCapacity?: number;
  maxCapacity?: number;
  section?: string;
  floor?: number;
  shape?: TableShape;
}
```

## Redux State Management

### State Structure

```typescript
interface TableState {
  // Core Data
  tables: Table[];
  totalTables: number;
  currentTable: Table | null;
  
  // Pagination
  currentPage: number;
  itemsPerPage: number;
  
  // Filtering
  filters: TableFilters;
  
  // Selection & UI
  selectedTables: number[];
  isLayoutMode: boolean;
  
  // Loading States
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  
  // Error Handling
  error: string | null;
  validationErrors: Record<string, string>;
  
  // Analytics
  analytics: TableAnalytics;
}
```

### Available Actions

#### Async Thunks
- `fetchTables` - Load tables with pagination and filters
- `fetchTable` - Load single table details
- `createTable` - Create new table
- `updateTable` - Update existing table
- `deleteTable` - Delete table
- `updateTableStatusAsync` - Quick status update
- `bulkUpdateStatus` - Update multiple table statuses

#### Synchronous Actions
- `setCurrentPage` - Update current page
- `setItemsPerPage` - Change items per page
- `setStatusFilter` - Filter by status
- `setSearchTerm` - Set search query
- `setCapacityFilter` - Filter by capacity
- `setCapacityRange` - Filter by capacity range
- `setSectionFilter` - Filter by section
- `setFloorFilter` - Filter by floor
- `setShapeFilter` - Filter by shape
- `clearFilters` - Clear all filters
- `toggleTableSelection` - Select/deselect table
- `selectAllTables` - Select all visible tables
- `clearSelection` - Clear all selections

### Selectors

```typescript
// Basic Selectors
selectTables           // Complete table state
selectTablesList       // Array of tables
selectCurrentTable     // Currently selected table
selectTablesLoading    // Loading state
selectTablesError      // Error messages
selectSelectedTables   // Selected table IDs
selectTablesFilters    // Current filters

// Computed Selectors
selectFilteredTables   // Tables after applying filters
selectAvailableTables  // Only available tables
selectOccupiedTables   // Only occupied tables
selectTablesByStatus   // Tables by specific status
selectTableById        // Single table by ID
```

## API Integration

### Endpoints

```typescript
// GET /api/tables - Fetch tables with pagination and filters
getTables(params: {
  page?: number;
  limit?: number;
  filters?: TableFilters;
}): Promise<PaginatedResponse<Table>>

// GET /api/tables/:id - Fetch single table
getTable(id: number): Promise<Table>

// POST /api/tables - Create new table
createTable(data: CreateTableRequest): Promise<Table>

// PUT /api/tables/:id - Update table
updateTable(id: number, data: UpdateTableRequest): Promise<Table>

// DELETE /api/tables/:id - Delete table
deleteTable(id: number): Promise<void>

// PATCH /api/tables/:id/status - Quick status update
updateTableStatus(id: number, status: TableStatus): Promise<Table>

// PATCH /api/tables/bulk-status - Bulk status update
bulkUpdateTableStatus(data: {
  tableIds: number[];
  status: TableStatus;
}): Promise<Table[]>
```

## Component Usage

### TableManagement (Main Component)

```tsx
import { TableManagement } from '../pages/table-management';

function App() {
  return (
    <div className="min-h-screen">
      <TableManagement />
    </div>
  );
}
```

### Individual Components

```tsx
// Table Form
<TableForm
  table={table}              // Optional: existing table for editing
  onSubmit={handleSubmit}     // Form submission handler
  onCancel={handleCancel}     // Cancel handler
  isLoading={isLoading}       // Loading state
  serverErrors={errors}       // Server validation errors
/>

// Table Filters
<TableFilters
  filters={filters}           // Current filter values
  onFiltersChange={handleFiltersChange}  // Filter change handler
  onReset={handleReset}       // Reset filters handler
  totalCount={totalCount}     // Total table count
  filteredCount={filteredCount}  // Filtered table count
/>

// Table List
<TableList
  tables={tables}             // Array of tables
  onEdit={handleEdit}         // Edit handler
  onDelete={handleDelete}     // Delete handler
  onStatusChange={handleStatusChange}  // Status change handler
  onSelectTable={handleSelect}  // Table selection handler (optional)
  selectedTables={selectedIds}  // Selected table IDs (optional)
  isLoading={isLoading}       // Loading state
  viewMode="grid"             // 'grid' | 'list'
/>

// Pagination
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  totalItems={totalItems}
  itemsPerPage={itemsPerPage}
  onPageChange={handlePageChange}
  onItemsPerPageChange={handleItemsPerPageChange}
/>
```

## Styling & Theme

### CSS Classes

The components use Tailwind CSS with consistent class patterns:

- **Layout**: `flex`, `grid`, `space-y-*`, `gap-*`
- **Colors**: `bg-gray-*`, `text-gray-*`, `border-gray-*`
- **Dark Mode**: `dark:bg-*`, `dark:text-*`, `dark:border-*`
- **Interactive**: `hover:*`, `focus:*`, `transition-*`
- **Responsive**: `sm:*`, `md:*`, `lg:*`, `xl:*`

### Color Scheme

```css
/* Status Colors */
.status-available { @apply bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200; }
.status-occupied { @apply bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200; }
.status-reserved { @apply bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200; }
.status-maintenance { @apply bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200; }
.status-cleaning { @apply bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200; }
.status-out-of-order { @apply bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200; }
```

## Error Handling

### Form Validation

```typescript
// Client-side validation using Yup
const tableValidationSchema = yup.object({
  number: yup.string().required('Table number is required'),
  capacity: yup.number().min(1, 'Capacity must be at least 1').required('Capacity is required'),
  shape: yup.string().oneOf(['round', 'square', 'rectangle', 'booth']).required('Shape is required'),
  status: yup.string().oneOf(Object.values(TableStatus)).required('Status is required'),
  section: yup.string().required('Section is required'),
  floor: yup.number().min(1, 'Floor must be at least 1').required('Floor is required')
});
```

### Error Display

- **Form Errors**: Displayed inline below form fields
- **API Errors**: Shown in error banners at the top of pages
- **Validation Errors**: Real-time validation with error messages
- **Network Errors**: Graceful fallback with retry options

## Performance Optimizations

### Memoization

```typescript
// Component memoization
const TableCard = React.memo(({ table, onEdit, onDelete }) => {
  // Component implementation
});

// Selector memoization
const selectFilteredTables = createSelector(
  [selectTablesList, selectTablesFilters],
  (tables, filters) => applyFilters(tables, filters)
);
```

### Pagination

- **Server-side Pagination**: Only load current page data
- **Optimistic Updates**: Immediate UI updates for better UX
- **Caching**: Redux state caching for previously loaded pages

### Bundle Optimization

- **Code Splitting**: Lazy load table management components
- **Tree Shaking**: Import only used utilities
- **Memoized Selectors**: Prevent unnecessary re-renders

## Testing

### Unit Tests

```typescript
// Component tests
describe('TableForm', () => {
  it('should validate required fields', () => {
    // Test implementation
  });
  
  it('should submit form with valid data', () => {
    // Test implementation
  });
});

// Redux tests
describe('tableSlice', () => {
  it('should handle fetchTables.fulfilled', () => {
    // Test implementation
  });
  
  it('should apply filters correctly', () => {
    // Test implementation
  });
});
```

### Integration Tests

```typescript
// API integration tests
describe('Table API', () => {
  it('should fetch tables with pagination', async () => {
    // Test implementation
  });
  
  it('should create table successfully', async () => {
    // Test implementation
  });
});
```

## Deployment

### Build Configuration

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "type-check": "tsc --noEmit"
  }
}
```

### Environment Variables

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=30000

# Feature Flags
VITE_ENABLE_TABLE_ANALYTICS=true
VITE_ENABLE_BULK_OPERATIONS=true
```

## Contributing

### Code Style

- Use TypeScript strict mode
- Follow ESLint configuration
- Use Prettier for formatting
- Write descriptive commit messages
- Add JSDoc comments for complex functions

### Pull Request Process

1. Create feature branch from `main`
2. Implement changes with tests
3. Ensure all tests pass
4. Update documentation if needed
5. Submit pull request with description

## Future Enhancements

### Planned Features

- **Table Layout Designer**: Visual drag-and-drop table arrangement
- **Real-time Synchronization**: WebSocket integration for live updates
- **Table Analytics**: Occupancy rates, turnover times, revenue per table
- **Mobile App**: React Native companion app for staff
- **Integration APIs**: Connect with reservation systems and kitchen displays
- **Advanced Reporting**: Export capabilities, custom reports
- **Multi-location Support**: Manage tables across multiple restaurant locations

### Technical Improvements

- **Performance**: Virtual scrolling for large table lists
- **Accessibility**: Enhanced screen reader support
- **Offline Support**: PWA capabilities with offline functionality
- **Internationalization**: Multi-language support
- **Advanced Caching**: Redis integration for better performance
- **Audit Logging**: Track all table changes for compliance

---

## License

MIT License - see LICENSE file for details.

## Support

For questions or issues, please open a GitHub issue or contact the development team.