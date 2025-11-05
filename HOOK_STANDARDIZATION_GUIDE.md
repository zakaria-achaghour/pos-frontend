# Hook Standardization Guide

## Overview
This document outlines the standardized structure for resource management hooks (Staff, Tables, Menu Items, etc.)

## Shared Interface

A new generic interface `UseResourceManagementReturn` has been created in `src/types/components.ts`:

```typescript
export interface UseResourceManagementReturn<
  TResource,
  TFormData,
  TStatus,
  TFilter,
  TStats
> {
  // Data
  items: TResource[];
  filteredItems: TResource[];
  selectedItem: TResource | null;
  editingItem: TResource | null;

  // UI State
  viewMode: 'grid' | 'list';
  filter: TFilter;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  validationErrors: Record<string, string[]>;
  pagination: PaginationInfo;
  selectedItems: number[];

  // Actions
  fetchItems: (page?: number) => Promise<void>;
  createItem: (data: TFormData) => Promise<void>;
  updateItem: (id: number, data: Partial<TFormData>) => Promise<void>;
  deleteItem: (id: number) => Promise<void>;
  updateItemStatus: (id: number, status: TStatus) => Promise<void>;
  bulkUpdateStatus: (ids: number[], status: TStatus) => Promise<void>;
  goToPage: (page: number) => void;

  // UI Actions
  setViewMode: (mode: 'grid' | 'list') => void;
  setFilter: (filter: TFilter) => void;
  setSelectedItem: (item: TResource | null) => void;
  setEditingItem: (item: TResource | null) => void;
  clearError: () => void;
  clearSuccessMessage: () => void;
  toggleItemSelection: (id: number) => void;
  clearSelection: () => void;

  // Computed values
  stats: TStats;
}
```

## Implementation Status

### ✅ useStaffManagement.ts
**Status:** COMPLETE

The hook now:
- Extends `UseResourceManagementReturn` with staff-specific types
- Provides both base properties (`items`, `filteredItems`) and aliases (`staff`, `filteredStaff`)
- Includes all required base methods plus staff-specific `clockInOut`
- Has selection management (`selectedItems`, `toggleItemSelection`, `clearSelection`)
- Implements `bulkUpdateStatus` for bulk operations

**Interface:**
```typescript
interface UseStaffManagementReturn extends UseResourceManagementReturn<
  StaffMember,
  StaffFormData,
  StaffStatus,
  StaffFilter,
  StaffStats
> {
  // Staff-specific extensions and backward-compatible aliases
  viewMode: ViewMode; // 'grid' | 'performance' | 'schedule'
  clockInOut: (id: number) => Promise<void>;
  staff: StaffMember[];
  // ... other aliases
}
```

### ⚠️ useTableManagement.ts  
**Status:** IN PROGRESS - Needs Completion

The hook interface has been defined but implementation needs:

1. **Add Missing State:**
   ```typescript
   const [selectedTable, setSelectedTable] = useState<Table | null>(null);
   const [editingTable, setEditingTable] = useState<Table | null>(null);
   const [selectedItems, setSelectedItems] = useState<number[]>([]);
   const [error, setError] = useState<string | null>(null);
   const [successMessage, setSuccessMessage] = useState<string | null>(null);
   const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
   ```

2. **Add Bulk Operations:**
   ```typescript
   const bulkUpdateStatus = async (ids: number[], status: TableStatus): Promise<void> => {
     if (ids.length === 0) return;
     setLoading(true);
     try {
       await Promise.all(ids.map(id => updateTableStatus(id, status)));
       setSuccessMessage(`Successfully updated ${ids.length} table(s)`);
       clearSelection();
     } catch (err: any) {
       setError(err.message || 'Failed to update tables');
     } finally {
       setLoading(false);
     }
   };
   ```

3. **Add Selection Management:**
   ```typescript
   const toggleItemSelection = (id: number) => {
     setSelectedItems(prev =>
       prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
     );
   };

   const clearSelection = () => {
     setSelectedItems([]);
   };
   ```

4. **Update Return Statement:**
   ```typescript
   return {
     // Base properties
     items: tables,
     filteredItems: filteredTables,
     selectedItem: selectedTable,
     editingItem: editingTable,
     filter: statusFilter,
     selectedItems,
     
     // Aliases for backward compatibility
     tables,
     filteredTables,
     selectedTable,
     editingTable,
     statusFilter,
     
     // UI State
     viewMode,
     loading,
     error,
     successMessage,
     validationErrors,
     pagination,
     
     // Actions
     fetchItems: fetchTables,
     createItem: createTable,
     updateItem: updateTable,
     deleteItem: deleteTable,
     updateItemStatus: updateTableStatus,
     bulkUpdateStatus,
     goToPage,
     
     // Aliases
     fetchTables,
     createTable,
     updateTable,
     deleteTable,
     updateTableStatus,
     
     // UI Actions
     setViewMode,
     setFilter: setStatusFilter,
     setSelectedItem: setSelectedTable,
     setEditingItem: setEditingTable,
     setStatusFilter,
     setSelectedTable,
     setEditingTable,
     clearError,
     clearSuccessMessage,
     toggleItemSelection,
     clearSelection,
     
     // Stats
     stats: tableStats,
     tableStats,
   };
   ```

## Benefits of Standardization

1. **Consistency:** All resource management hooks follow the same pattern
2. **Reusability:** Common logic can be extracted into shared utilities
3. **Type Safety:** Generic interface ensures type correctness
4. **Backward Compatibility:** Aliases maintain existing code functionality
5. **Predictability:** Developers know what to expect from any resource hook
6. **Bulk Operations:** Standardized selection and bulk update capabilities

## Future Hooks

When creating new resource management hooks (e.g., `useMenuManagement`, `useOrderManagement`), follow this pattern:

```typescript
interface UseMenuManagementReturn extends UseResourceManagementReturn<
  MenuItem,
  MenuItemFormData,
  MenuItemStatus,
  MenuFilter,
  MenuStats
> {
  // Add resource-specific extensions here
}
```

## Testing Checklist

For each hook, verify:
- [ ] Extends `UseResourceManagementReturn` with correct types
- [ ] Provides both base properties and resource-specific aliases
- [ ] Implements all required CRUD operations
- [ ] Includes bulk operations (`bulkUpdateStatus`, `toggleItemSelection`, `clearSelection`)
- [ ] Has proper error handling and success messages
- [ ] Auto-clears messages after timeout
- [ ] Server-side filtering and pagination
- [ ] Computed stats are accurate
- [ ] TypeScript compiles without errors
- [ ] Existing components still work with aliases

