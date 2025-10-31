# Type Consolidation Guide

## Overview
This guide explains how types are organized and consolidated to avoid duplication across the codebase. All types are centralized in the `src/types/` directory and can be imported from a single entry point or specific type files.

## Type Directory Structure

```
src/types/
├── index.ts              # Main entry point - exports all types
├── components.ts         # Component prop types (NEW)
├── menu.ts              # Menu and category types
├── table.ts             # Table management types
├── staff.ts             # Staff and employee types
├── order.ts             # Order and payment types
├── customer.ts          # Customer types
└── restaurant.ts        # Restaurant settings types
```

## Type Categories

### 1. Base Types (`index.ts`)
Common utility types used across all features:

```typescript
// Import from:
import type { 
  BaseEntity,
  ApiResponse,
  PaginatedResponse,
  LoadingState,
  ErrorState,
  ValidationError,
  PaginationParams,
  FilterState
} from '@/types';
```

**When to use:**
- Building API responses
- Managing loading/error states
- Implementing pagination
- Creating generic filters

### 2. Component Props Types (`components.ts`)
Centralized component interface definitions:

#### Menu Component Props
```typescript
import type {
  // Filter Props
  CategoryFilterOptions,
  CategoryFiltersProps,
  MenuItemFilterOptions,
  MenuItemFiltersProps,
  
  // Form Props
  CategoryFormProps,
  MenuItemFormProps,
  
  // Modal Props
  CategoryModalProps,
  MenuItemModalProps,
  
  // List Props
  CategoryListProps,
  MenuItemListProps,
  
  // Card Props
  CategoryCardProps,
  ItemCardProps,
} from '@/types/components';
```

#### Table Component Props
```typescript
import type {
  TableFiltersProps,
  TableFormProps,
  TableListProps,
  TableCardProps,
  TableStatsData,
  TableStatsProps,
  EnhancedTableStatsProps,
} from '@/types/components';
```

#### Staff Component Props
```typescript
import type {
  StaffFiltersProps,
  StaffFormProps,
  StaffEditFormProps,
  StaffModalProps,
  StaffListProps,
  StaffCardProps,
  StaffPerformanceViewProps,
  StaffScheduleViewProps,
} from '@/types/components';
```

#### Common UI Component Props
```typescript
import type {
  PaginationProps,
  ModalProps,
  ConfirmDialogProps,
  ToastProps,
  LoadingSpinnerProps,
  EmptyStateProps,
  ErrorBoundaryProps,
} from '@/types/components';
```

#### Form Component Props
```typescript
import type {
  FormFieldProps,
  SelectFieldProps,
  TextAreaFieldProps,
  CheckboxFieldProps,
  RadioGroupProps,
  FileUploadProps,
} from '@/types/components';
```

#### Filter and Search Props
```typescript
import type {
  SearchBarProps,
  FilterBarProps,
  SortProps,
} from '@/types/components';
```

### 3. Domain Types

#### Menu Types (`menu.ts`)
```typescript
import type {
  MenuItem,
  Category,
  MenuItemFormData,
  CategoryFormData,
  MenuItemStatus,
  CategoryStatus,
  CreateMenuItemRequest,
  UpdateMenuItemRequest,
} from '@/types/menu';
```

#### Table Types (`table.ts`)
```typescript
import type {
  Table,
  TableStatus,
  TableFormData,
  Reservation,
  TableAssignment,
} from '@/types/table';
```

#### Staff Types (`staff.ts`)
```typescript
import type {
  StaffMember,
  StaffRole,
  StaffStatus,
  StaffFormData,
  ShiftSchedule,
  PerformanceMetrics,
} from '@/types/staff';
```

## Import Best Practices

### ✅ DO: Import from centralized types

```typescript
// Good - Single import statement
import type { 
  MenuItem, 
  MenuItemFormProps, 
  CategoryFilterOptions 
} from '@/types';

// Good - Specific import when needed
import type { MenuItemModalProps } from '@/types/components';
```

### ❌ DON'T: Define types locally in components

```typescript
// Bad - Duplicate type definition
interface MenuItemFormProps {
  initialData?: Partial<MenuItem>;
  isEdit?: boolean;
  // ...
}
```

### ✅ DO: Use generic types when possible

```typescript
// Good - Reusing generic type
import type { FormFieldProps } from '@/types/components';

const EmailField: React.FC<FormFieldProps> = (props) => {
  // ...
};
```

## Migration Checklist

When refactoring a component to use consolidated types:

1. **Identify Local Interfaces**
   ```bash
   # Search for interfaces in your component
   grep -n "^interface " src/components/pos/menu/MyComponent.tsx
   ```

2. **Check if Type Exists**
   - Check `src/types/components.ts` for component props
   - Check domain-specific files (`menu.ts`, `table.ts`, etc.) for data types

3. **Import Consolidated Type**
   ```typescript
   // Before
   interface MenuItemCardProps {
     item: MenuItem;
     onEdit: (item: MenuItem) => void;
   }
   
   // After
   import type { ItemCardProps } from '@/types/components';
   // Use ItemCardProps instead
   ```

4. **Remove Local Interface**
   - Delete the local interface definition
   - Update component to use imported type

5. **Verify Functionality**
   - Check TypeScript errors: `npm run type-check`
   - Test component functionality

## Common Patterns

### Pattern 1: Filter Components
```typescript
import type { CategoryFilterOptions, CategoryFiltersProps } from '@/types/components';

export const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  filters,
  onFiltersChange,
  onResetFilters,
}) => {
  // Component implementation
};
```

### Pattern 2: Form Components
```typescript
import type { MenuItemFormProps, MenuItemFormData } from '@/types';

export const MenuItemForm: React.FC<MenuItemFormProps> = ({
  initialData,
  isEdit,
  onSubmit,
  onCancel,
  isLoading,
  categories,
}) => {
  // Component implementation
};
```

### Pattern 3: List Components
```typescript
import type { MenuItemListProps, MenuItem } from '@/types';

export const MenuItemList: React.FC<MenuItemListProps> = ({
  menuItems,
  loading,
  onEdit,
  onDelete,
}) => {
  // Component implementation
};
```

### Pattern 4: Modal Components
```typescript
import type { MenuItemModalProps } from '@/types/components';

export const MenuItemModal: React.FC<MenuItemModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingItem,
  categories,
  loading,
}) => {
  // Component implementation
};
```

## Type Naming Conventions

### Props Types
- Format: `{ComponentName}Props`
- Example: `CategoryFiltersProps`, `MenuItemFormProps`

### Data Types
- Format: `{Entity}` or `{Entity}Data`
- Example: `MenuItem`, `TableStatsData`

### Filter Types
- Format: `{Entity}FilterOptions` or `{Entity}FiltersProps`
- Example: `MenuItemFilterOptions`, `CategoryFiltersProps`

### Form Types
- Format: `{Entity}FormData` or `{Entity}FormProps`
- Example: `MenuItemFormData`, `MenuItemFormProps`

### Request/Response Types
- Format: `Create{Entity}Request`, `Update{Entity}Request`
- Example: `CreateMenuItemRequest`, `UpdateCategoryRequest`

## Quick Reference

| Component Type | Import From | Example |
|---------------|-------------|---------|
| Filter Props | `@/types/components` | `CategoryFiltersProps` |
| Form Props | `@/types/components` | `MenuItemFormProps` |
| Modal Props | `@/types/components` | `CategoryModalProps` |
| List Props | `@/types/components` | `MenuItemListProps` |
| Card Props | `@/types/components` | `ItemCardProps` |
| Data Types | `@/types/menu` | `MenuItem`, `Category` |
| Form Data | `@/types/menu` | `MenuItemFormData` |
| API Types | `@/types/menu` | `CreateMenuItemRequest` |
| Base Types | `@/types` | `ApiResponse`, `LoadingState` |

## Benefits

### 1. **No Duplication**
- Single source of truth for each type
- Easier to maintain and update

### 2. **Better IntelliSense**
- IDE autocomplete works better
- Easier to discover available props

### 3. **Consistency**
- Same interface across all components
- Reduced bugs from type mismatches

### 4. **Easier Refactoring**
- Change type once, applies everywhere
- TypeScript catches all usages

### 5. **Better Documentation**
- Types serve as documentation
- Easy to understand component contracts

## Examples

### Before Consolidation
```typescript
// components/pos/menu/CategoryCard.tsx
interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
}

// components/pos/menu/CategoryFilters.tsx
interface CategoryFilterOptions {
  searchTerm: string;
  statusFilter: 'all' | 'active' | 'inactive';
}

interface CategoryFiltersProps {
  filters: CategoryFilterOptions;
  onFiltersChange: (filters: Partial<CategoryFilterOptions>) => void;
}

// Duplicated across multiple files! ❌
```

### After Consolidation
```typescript
// components/pos/menu/CategoryCard.tsx
import type { CategoryCardProps } from '@/types/components';

export const CategoryCard: React.FC<CategoryCardProps> = (props) => {
  // Implementation
};

// components/pos/menu/CategoryFilters.tsx
import type { CategoryFiltersProps } from '@/types/components';

export const CategoryFilters: React.FC<CategoryFiltersProps> = (props) => {
  // Implementation
};

// All types in one place! ✅
```

## Next Steps

1. **Update Existing Components**: Gradually migrate components to use consolidated types
2. **Add Missing Types**: If you need a new component prop type, add it to `components.ts`
3. **Document Custom Types**: Add JSDoc comments for complex type definitions
4. **Type-Check Regularly**: Run `npm run type-check` to catch issues early

## Commands

```bash
# Check for local interface definitions
grep -r "^interface " src/components/pos/

# Check TypeScript errors
npm run type-check

# Find components using old types
grep -r "interface.*Props" src/components/

# Find components to migrate
find src/components/pos -name "*.tsx" -type f
```

## Summary

- ✅ All component props are in `src/types/components.ts`
- ✅ All domain types are in their respective files (`menu.ts`, `table.ts`, etc.)
- ✅ Import from `@/types` or `@/types/components`
- ✅ Never define types locally in components
- ✅ Use consistent naming conventions
- ✅ Document complex types with JSDoc comments

For more details, refer to:
- `PROJECT_STRUCTURE.md` - Project organization
- `IMPORT_GUIDE.md` - Import path reference
- `TYPESCRIPT_INTEGRATION_COMPLETE.md` - TypeScript setup
