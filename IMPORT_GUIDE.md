# 📦 Import Guide - Quick Reference

## Using `@/` Path Alias

All imports now use the `@/` alias for cleaner, more maintainable code.

---

## 🎨 Components

### POS Components

```typescript
// Menu components
import { 
  CategoryCard, 
  CategoryFilters, 
  CategoryForm,
  CategoryList,
  CategoryModal,
  ItemCard,
  MenuFilters,
  MenuItemFilters,
  MenuItemForm,
  MenuItemList,
  MenuItemModal 
} from '@/components/pos/menu';

// Table components
import { 
  TableCard, 
  TableFilters, 
  TableForm,
  TableList,
  TableStats,
  EnhancedTableStats 
} from '@/components/pos/tables';

// Staff components
import { 
  StaffCard, 
  StaffEditForm,
  StaffFilters,
  StaffForm,
  StaffList,
  StaffModal,
  StaffPerformanceView,
  StaffScheduleView 
} from '@/components/pos/staff';
```

### Common Components

```typescript
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Pagination from '@/components/common/Pagination';
import Toast from '@/components/common/Toast';
```

### UI Components

```typescript
import Button from '@/components/ui/button/Button';
import Alert from '@/components/ui/alert/Alert';
```

---

## 📄 Pages

```typescript
// Dashboard pages
import Dashboard from '@/pages/Dashboard/Dashboard';
import OwnerDashboard from '@/pages/Dashboard/OwnerDashboard';
import CashierDashboard from '@/pages/Dashboard/CashierDashboard';
import DailySummary from '@/pages/Dashboard/DailySummary';

// Menu pages
import CategoriesManagement from '@/pages/Menu/CategoriesManagement';
import MenuItemsManagement from '@/pages/Menu/MenuItemsManagement';
import Categories from '@/pages/Menu/Categories';
import Items from '@/pages/Menu/Items';

// Table pages
import TableManagement from '@/pages/Tables/TableManagement';
import EnhancedTableManagement from '@/pages/Tables/EnhancedTableManagement';
import Tables from '@/pages/Tables/Tables';

// Order pages
import OrdersList from '@/pages/Orders/OrdersList';
import OrderCreate from '@/pages/Orders/OrderCreate';
import OrderDetails from '@/pages/Orders/OrderDetails';

// Staff pages
import StaffManagement from '@/pages/Staff/StaffManagement';

// Restaurant pages
import CreateRestaurant from '@/pages/Restaurant/CreateRestaurant';
import EditRestaurant from '@/pages/Restaurant/EditRestaurant';
import RestaurantDetails from '@/pages/Restaurant/RestaurantDetails';

// Kitchen pages
import KitchenTickets from '@/pages/Kitchen/KitchenTickets';

// Auth pages
import Login from '@/pages/Auth/Login';
import Unauthorized from '@/pages/Auth/Unauthorized';
```

---

## 🔧 Hooks

```typescript
import { useAuth } from '@/hooks/useAuthRedux';
import { useCategoryManagement } from '@/hooks/useCategoryManagement';
import { useMenuItemManagement } from '@/hooks/useMenuItemManagement';
import { useStaffManagement } from '@/hooks/useStaffManagement';
import { useTableManagement } from '@/hooks/useTableManagement';
```

---

## 🏪 Redux Store

```typescript
// Store
import type { AppDispatch, RootState } from '@/store';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

// Slices
import { 
  fetchCategories, 
  createCategory 
} from '@/store/slices/menuSlice';

import { 
  fetchTables, 
  createTable 
} from '@/store/slices/tableSlice';

import { 
  fetchStaff, 
  createStaff 
} from '@/store/slices/staffSlice';
```

---

## 📡 API

```typescript
import { menuAPI } from '@/api/menu';
import { tablesAPI } from '@/api/tables';
import { staffAPI } from '@/api/staff';
import { ordersAPI } from '@/api/orders';
import { restaurantsAPI } from '@/api/restaurants';
```

---

## 📝 Types

```typescript
import type { Category, MenuItem, CreateMenuItemData } from '@/api/menu';
import type { Table, TableFormData, TableStatus } from '@/types/table';
import type { StaffMember, CreateStaffData } from '@/types/staff';
import type { Order, OrderItem } from '@/types/order';
```

---

## 🎯 Layout

```typescript
import AppLayout from '@/layout/AppLayout';
```

---

## 🛠️ Utils

```typescript
import { formatCurrency } from '@/utils/formatters';
import { parseApiError } from '@/store/utils/errorUtils';
```

---

## ⚡ Benefits

1. **Absolute Imports**: No more `../../../` mess
2. **Autocomplete**: Better IDE support
3. **Refactor Safe**: Easy to move files around
4. **Consistent**: Same pattern across the app
5. **Readable**: Clear what you're importing from

---

## 📋 Migration Checklist

When creating new files:

- ✅ Use `@/` for all imports
- ✅ Import from barrel files (`index.ts`) when available
- ✅ Keep components in appropriate `pos/` subfolder
- ✅ Keep pages in feature-based folders
- ✅ Use TypeScript types from `@/types` or `@/api`

---

*Last Updated: October 31, 2025*
