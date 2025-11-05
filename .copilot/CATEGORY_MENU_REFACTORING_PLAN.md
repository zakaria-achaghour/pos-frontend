# Category & Menu Items Management Refactoring Plan

## Current State
- Categories and Menu Items have custom hooks and components
- They don't follow the same pattern as Staff/Tables/Restaurants
- Components exist but need restructuring

## Target Architecture (Following Staff/Tables/Restaurants Pattern)

### 1. Hooks
**useCategoryManagement.ts**
- ✅ Configurable pagination (initialPerPage parameter)
- ✅ Full CRUD operations
- ✅ Stats (total, active, inactive)
- ✅ Search and filtering
- ✅ Auto-clearing success messages
- ✅ Selection support

**useMenuItemManagement.ts**
- ✅ Similar structure to categories
- ✅ Additional: category relationship
- ✅ Additional: image upload support
- ✅ Additional: availability toggle

### 2. Components Structure

**Categories:**
- CategoryCard.tsx - Individual category display
- CategoryList.tsx - Grid/Table view support
- CategoryFilters.tsx - Search + Status filters + Stats
- index.ts - Barrel export

**Menu Items:**
- MenuItemCard.tsx - Individual item display
- MenuItemList.tsx - Grid/Table view support
- MenuItemFilters.tsx - Search + Category + Status filters + Stats
- index.ts - Barrel export

### 3. Pages
**CategoriesManagement.tsx**
- Use useCategoryManagement hook
- Remove manual state management
- Use reusable components
- Modal for create/edit forms
- Pagination integration

**MenuItemsManagement.tsx**
- Use useMenuItemManagement hook  
- Remove manual state management
- Use reusable components
- Modal for create/edit forms
- Pagination integration

## Next Steps
1. Create/update useCategoryManagement hook ⏳
2. Update Category components (Card, List, Filters)
3. Refactor CategoriesManagement page
4. Create/update useMenuItemManagement hook
5. Update MenuItem components (Card, List, Filters)
6. Refactor MenuItemsManagement page
7. Test all functionality
8. Update documentation

## Benefits
- ✅ Consistent architecture across all resources
- ✅ Reusable components
- ✅ Better state management
- ✅ Cleaner code
- ✅ Easier maintenance
- ✅ Better TypeScript support
