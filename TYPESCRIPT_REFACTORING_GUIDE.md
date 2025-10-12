# TypeScript Types Refactoring Guide

## Overview
This document outlines the comprehensive TypeScript types refactoring approach for the POS system, organizing types into dedicated modules for better maintainability, reusability, and type safety.

## File Structure

```
src/types/
├── index.ts          # Main exports and common types
├── staff.ts          # Staff and employee related types
├── menu.ts           # Menu items and categories
├── table.ts          # Table management and reservations
├── order.ts          # Orders, payments, and POS operations
├── customer.ts       # Customer management and CRM
└── restaurant.ts     # Restaurant and business settings
```

## Refactoring Benefits

### 1. **Centralized Type Management**
- All types are organized in dedicated files by domain
- Easy to find and update related types
- Prevents duplicate type definitions across the codebase

### 2. **Better Type Safety**
- Comprehensive type definitions with proper constraints
- Union types for status fields and enums
- Optional and required fields clearly defined

### 3. **Improved Maintainability**
- Changes to types are isolated to specific files
- Breaking changes are easier to track and fix
- Better IDE support with autocomplete and error detection

### 4. **Enhanced Developer Experience**
- Clear naming conventions
- Comprehensive documentation
- Consistent patterns across all type files

## Type Categories

### Base Types (`index.ts`)
Common interfaces and utility types used across the application:
- `BaseEntity` - Base interface with id and timestamps
- `ApiResponse<T>` - Standard API response wrapper
- `PaginatedResponse<T>` - Paginated data responses
- `LoadingState`, `ErrorState` - Async operation states
- Common enums and utility types

### Staff Types (`staff.ts`)
**Already implemented** - Staff management types including:
- `StaffMember` - Complete staff member information
- `StaffRole`, `StaffStatus` - Staff roles and status enums
- `ShiftSchedule`, `PerformanceMetrics` - Work scheduling and performance
- Form data and filter interfaces

### Menu Types (`menu.ts`)
Comprehensive menu and category management:
- `MenuItem` - Complete menu item with nutritional info, allergens
- `Category` - Menu categories with sorting and status
- `AllergenType`, `MenuItemStatus` - Enums for food safety and availability
- Form data interfaces for creating/updating items
- Filter interfaces for searching and sorting

### Table Types (`table.ts`)
Table management and reservation system:
- `Table` - Table information with location, capacity, status
- `TableReservation` - Reservation management
- `TableStatus`, `ReservationStatus` - Status tracking enums
- Analytics interfaces for table utilization
- Form and filter interfaces

### Order Types (`order.ts`)
POS operations, orders, and payments:
- `Order` - Complete order information with items and payments
- `OrderItem` - Individual order items with modifiers
- `Payment` - Payment processing and transaction details
- `Cart`, `POSSession` - Shopping cart and cashier sessions
- Analytics for sales tracking

### Customer Types (`customer.ts`)
Customer relationship management:
- `Customer` - Complete customer profiles
- `CustomerPreferences` - Dietary restrictions, preferences
- `LoyaltyProgram` - Customer loyalty and rewards
- `CustomerVisit` - Visit history and analytics
- Segmentation and analytics interfaces

### Restaurant Types (`restaurant.ts`)
Business and restaurant configuration:
- `Restaurant` - Complete restaurant information
- `BusinessHours`, `RestaurantSettings` - Operating configuration
- `RestaurantBranch` - Multi-location support
- Performance and analytics interfaces

## Usage Patterns

### 1. **Import Strategy**
```typescript
// Import specific types
import { MenuItem, Category } from '@/types/menu';
import { StaffMember, StaffRole } from '@/types/staff';

// Import all from index (recommended for common types)
import { ApiResponse, LoadingState } from '@/types';
```

### 2. **Form Data Pattern**
Each entity has corresponding form data interfaces:
```typescript
interface MenuItemFormData {
  // Only fields needed for forms (no id, timestamps)
  name: string;
  description: string;
  price: number;
  // ... other form fields
}
```

### 3. **Filter Pattern**
Consistent filter interfaces for all entities:
```typescript
interface MenuFilters {
  category?: number;
  status?: MenuItemStatus;
  searchTerm?: string;
  // ... other filter options
}
```

### 4. **API Response Pattern**
Standardized response types:
```typescript
interface MenuItemsResponse {
  items: MenuItem[];
  total: number;
  page: number;
  limit: number;
}
```

## Migration Strategy

### Phase 1: Update Imports (Current Phase)
1. ✅ Create comprehensive type files
2. 🔄 Update existing components to use centralized types
3. 🔄 Remove duplicate type definitions
4. 🔄 Fix import statements

### Phase 2: Enhance Type Safety
1. Add strict type checking to forms
2. Implement proper error handling with typed errors
3. Add runtime type validation where needed

### Phase 3: Advanced Features
1. Add type guards for runtime type checking
2. Implement generic CRUD operations with proper typing
3. Add advanced analytics types

## Best Practices

### 1. **Naming Conventions**
- Use PascalCase for interfaces and types
- Use descriptive names that indicate purpose
- Suffix form data interfaces with `FormData`
- Suffix filter interfaces with `Filters`

### 2. **Type Composition**
- Extend base interfaces when appropriate
- Use union types for status fields
- Prefer composition over inheritance

### 3. **Optional vs Required**
- Mark optional fields with `?`
- Use `Partial<T>` for update operations
- Use `Omit<T, K>` to exclude fields (like id for create operations)

### 4. **Documentation**
- Add JSDoc comments for complex types
- Document business rules and constraints
- Provide examples for complex interfaces

## Example Usage

### Component with Types
```typescript
import React from 'react';
import { MenuItem, MenuFilters } from '@/types/menu';
import { LoadingState } from '@/types';

interface MenuListProps {
  items: MenuItem[];
  filters: MenuFilters;
  loading: LoadingState;
  onFilterChange: (filters: MenuFilters) => void;
  onItemSelect: (item: MenuItem) => void;
}

const MenuList: React.FC<MenuListProps> = ({
  items,
  filters,
  loading,
  onFilterChange,
  onItemSelect
}) => {
  // Component implementation
};
```

### API Hook with Types
```typescript
import { useState, useEffect } from 'react';
import { MenuItem, MenuFilters, MenuItemsResponse } from '@/types/menu';
import { ApiResponse } from '@/types';

export const useMenuItems = (filters: MenuFilters) => {
  const [data, setData] = useState<MenuItemsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hook implementation
  
  return { data, loading, error };
};
```

## Next Steps

1. **Update existing components** to use the new centralized types
2. **Remove duplicate type definitions** from hooks, API files, and slices
3. **Add proper error handling** with typed error interfaces
4. **Implement type guards** for runtime type validation
5. **Add comprehensive testing** for type safety

This refactoring provides a solid foundation for type safety and maintainability throughout the POS system.