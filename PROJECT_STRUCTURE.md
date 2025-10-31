# 📁 POS Frontend Project Structure

## Overview
This document describes the organized structure of the POS frontend application, following a feature-based architecture for better maintainability and scalability.

---

## 🗂️ Directory Structure

```
src/
├── api/                      # API client services
│   ├── auth.ts              # Authentication API
│   ├── menu.ts              # Menu items & categories API
│   ├── tables.ts            # Table management API
│   ├── orders.ts            # Orders API
│   ├── staff.ts             # Staff management API
│   ├── restaurants.ts       # Restaurant management API
│   └── client.ts            # Base API client (axios config)
│
├── store/                   # Redux state management
│   ├── slices/             # Redux slices by feature
│   │   ├── authSlice.ts
│   │   ├── menuSlice.ts
│   │   ├── tableSlice.ts
│   │   ├── orderSlice.ts
│   │   ├── staffSlice.ts
│   │   ├── restaurantSlice.ts
│   │   ├── kitchenSlice.ts
│   │   └── dashboardSlice.ts
│   ├── types/              # Redux type definitions
│   ├── utils/              # Redux utilities
│   ├── hooks.ts            # Typed Redux hooks
│   └── index.ts            # Store configuration
│
├── components/
│   ├── pos/                # All POS-related components
│   │   ├── menu/          # Menu management components
│   │   │   ├── CategoryCard.tsx
│   │   │   ├── CategoryForm.tsx
│   │   │   ├── CategoryModal.tsx
│   │   │   ├── MenuItemCard.tsx
│   │   │   ├── MenuItemForm.tsx
│   │   │   ├── MenuItemModal.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── tables/        # Table management components
│   │   │   ├── TableCard.tsx
│   │   │   ├── TableForm.tsx
│   │   │   ├── TableFilters.tsx
│   │   │   ├── TableStats.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── staff/         # Staff management components
│   │   │   ├── StaffCard.tsx
│   │   │   ├── StaffForm.tsx
│   │   │   ├── StaffModal.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── orders/        # Order components
│   │   │   └── index.ts
│   │   │
│   │   ├── restaurant/    # Restaurant components
│   │   │   └── index.ts
│   │   │
│   │   ├── kitchen/       # Kitchen components
│   │   │   └── index.ts
│   │   │
│   │   ├── dashboard/     # Dashboard components
│   │   │   └── index.ts
│   │   │
│   │   └── index.ts       # Main POS exports
│   │
│   ├── common/            # Shared components
│   ├── auth/              # Authentication components
│   └── ui/                # UI components (buttons, modals, etc.)
│
├── pages/                  # Page components (routes)
│   ├── Dashboard/         # Dashboard pages
│   │   ├── Dashboard.tsx
│   │   ├── OwnerDashboard.tsx
│   │   ├── CashierDashboard.tsx
│   │   ├── DailySummary.tsx
│   │   └── index.ts
│   │
│   ├── Menu/              # Menu management pages
│   │   ├── Categories.tsx
│   │   ├── CategoriesManagement.tsx
│   │   ├── Items.tsx
│   │   ├── MenuItemsManagement.tsx
│   │   └── index.ts
│   │
│   ├── Tables/            # Table management pages
│   │   ├── Tables.tsx
│   │   ├── TableManagement.tsx
│   │   ├── EnhancedTableManagement.tsx
│   │   └── index.ts
│   │
│   ├── Orders/            # Order management pages
│   │   ├── OrdersList.tsx
│   │   ├── EnhancedOrdersList.tsx
│   │   ├── OrderCreate.tsx
│   │   ├── OrderDetails.tsx
│   │   └── index.ts
│   │
│   ├── Staff/             # Staff management pages
│   │   ├── StaffManagement.tsx
│   │   └── index.ts
│   │
│   ├── Restaurant/        # Restaurant management pages
│   │   ├── CreateRestaurant.tsx
│   │   ├── EditRestaurant.tsx
│   │   ├── RestaurantDetails.tsx
│   │   ├── AdminTenants.tsx
│   │   ├── AdminTenantOverview.tsx
│   │   └── index.ts
│   │
│   ├── Kitchen/           # Kitchen pages
│   │   ├── KitchenTickets.tsx
│   │   └── index.ts
│   │
│   └── Auth/              # Authentication pages
│       ├── Login.tsx
│       ├── Register.tsx
│       └── index.ts
│
├── hooks/                 # Custom React hooks
│   ├── useAuthRedux.ts
│   ├── useMenuManagement.ts
│   └── useTableManagement.ts
│
├── types/                 # TypeScript type definitions
│   ├── menu.ts
│   ├── table.ts
│   ├── order.ts
│   ├── staff.ts
│   └── common.ts
│
├── utils/                 # Utility functions
│   └── helpers.ts
│
├── layout/                # Layout components
│   └── MainLayout.tsx
│
└── App.tsx               # Main app component
```

---

## 🎯 Feature Organization Pattern

Each feature follows this structure:

```
Feature/
├── API Layer (src/api/feature.ts)
│   └── HTTP requests to backend
│
├── Redux Layer (src/store/slices/featureSlice.ts)
│   └── State management with thunks
│
├── Types (src/types/feature.ts)
│   └── TypeScript interfaces
│
├── Components (src/components/pos/feature/)
│   └── Reusable UI components
│
├── Pages (src/pages/Feature/)
│   └── Route-level page components
│
└── Hooks (src/hooks/useFeature.ts)
    └── Custom hooks for feature logic
```

---

## 📝 Import Examples

### Before Restructuring
```typescript
// ❌ Old way - unclear imports
import CategoryCard from '../../components/menu/CategoryCard';
import TableCard from '../../components/tables/TableCard';
```

### After Restructuring
```typescript
// ✅ New way - clean barrel exports
import { CategoryCard, MenuItemModal } from '@/components/pos/menu';
import { TableCard, TableStats } from '@/components/pos/tables';
import { StaffCard, StaffForm } from '@/components/pos/staff';

// Or for pages
import { Dashboard, OwnerDashboard } from '@/pages/Dashboard';
import { MenuItemsManagement } from '@/pages/Menu';
import { TableManagement } from '@/pages/Tables';
```

---

## 🔄 Data Flow Lifecycle

```
User Action (UI)
    ↓
Component Event Handler
    ↓
Custom Hook / Redux Dispatch
    ↓
Redux Thunk (Async Action)
    ↓
API Client Service
    ↓
Backend API
    ↓
Redux Store Update
    ↓
Component Re-render
    ↓
UI Update
```

---

## ✅ Benefits of This Structure

1. **Feature-Based Organization**: Related files are grouped together
2. **Clear Separation of Concerns**: Each layer has a specific responsibility
3. **Easy to Navigate**: Predictable structure makes finding files easier
4. **Scalable**: Easy to add new features without cluttering
5. **Maintainable**: Changes to one feature don't affect others
6. **Testable**: Each layer can be tested independently
7. **Reusable**: Components are properly organized for reuse

---

## 📚 Adding a New Feature

To add a new feature (e.g., "Inventory"), follow these steps:

1. **Create Types** (`src/types/inventory.ts`)
2. **Create API Service** (`src/api/inventory.ts`)
3. **Create Redux Slice** (`src/store/slices/inventorySlice.ts`)
4. **Create Components** (`src/components/pos/inventory/`)
5. **Create Pages** (`src/pages/Inventory/`)
6. **Create Custom Hook** (`src/hooks/useInventoryManagement.ts`)
7. **Update Routes** in your routing configuration

---

## 🔍 Finding Files

- **Need a component?** → Check `src/components/pos/{feature}/`
- **Need a page?** → Check `src/pages/{Feature}/`
- **Need API calls?** → Check `src/api/{feature}.ts`
- **Need state management?** → Check `src/store/slices/{feature}Slice.ts`
- **Need types?** → Check `src/types/{feature}.ts`

---

## 📌 Notes

- All POS-specific components are under `src/components/pos/`
- Each feature folder has an `index.ts` for clean barrel exports
- Pages are organized by feature, not by role (Dashboard, Menu, etc.)
- The old `pages/POS/` folder has been removed
- Redux slices remain in `src/store/slices/` for centralized state management

---

*Last Updated: October 31, 2025*
