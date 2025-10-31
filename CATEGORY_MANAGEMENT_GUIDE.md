# Category Management Implementation Guide

## Overview
Complete refactoring of the category management system following best practices, with proper component separation, API integration, pagination, and filtering capabilities.

## Architecture

### 1. API Layer (`src/api/menu.ts`)
**Enhanced with pagination and filtering support:**

```typescript
// New Interfaces
interface CategoryFilters {
  searchTerm?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

interface CategoriesResponse {
  data: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

**Key Features:**
- Server-side pagination
- Status filtering (active/inactive)
- Search functionality
- Handles both paginated and array responses

### 2. Custom Hook (`src/hooks/useCategoryManagement.ts`)
**Centralized state management for categories:**

```typescript
const {
  categories,              // All categories
  filteredCategories,      // Filtered results
  loading,                 // Loading state
  error,                   // Error messages
  pagination,              // Page, limit, total, totalPages
  filters,                 // Current filters
  fetchCategories,         // Fetch with filters
  createCategory,          // Create new
  updateCategory,          // Update existing
  deleteCategory,          // Delete category
  toggleCategoryStatus,    // Toggle active/inactive
  setFilters,              // Update filters
  resetFilters,            // Clear all filters
  setPage,                 // Change page
  setLimit,                // Change items per page
} = useCategoryManagement();
```

### 3. Component Structure

#### 3.1 CategoryFilters Component
**Location:** `src/components/menu/CategoryFilters.tsx`

**Features:**
- Search by category name
- Filter by status (all/active/inactive)
- Reset filters button
- Results count display
- Active filter indicator

#### 3.2 CategoryList Component
**Location:** `src/components/menu/CategoryList.tsx`

**Features:**
- Grid layout (responsive: 1-2-3-4 columns)
- Loading skeleton
- Empty state with helpful message
- Category cards with:
  - Name and icon
  - Status badge (Active/Inactive)
  - Description preview
  - Menu items count
  - Toggle status button
  - Edit button
  - Delete button (with confirmation)
  - Inactive warning message

#### 3.3 CategoryModal Component
**Location:** `src/components/menu/CategoryModal.tsx`

**Features:**
- Formik + Yup validation
- Create and Edit modes
- Fields:
  - Name (required, 2-50 characters)
  - Description (optional, max 200 characters)
  - Sort Order (integer, min 0)
  - Active status (checkbox)
- Character counters
- Real-time preview
- Inactive warning
- Submit/Cancel buttons

#### 3.4 Main Page Component
**Location:** `src/pages/POS/CategoriesManagement.tsx`

**Features:**
- PageMeta and PageBreadcrumb
- Header with "Add New Category" button
- Filter section
- Error display
- Categories list
- Pagination controls
- Create/Edit modals

### 4. Pagination Component
**Location:** `src/components/common/Pagination.tsx` (already exists)

**Features:**
- Previous/Next buttons
- Page number buttons with ellipsis
- Items per page selector (10/20/50/100)
- Results range display
- Responsive design

## API Endpoints

Based on the API documentation at `http://localhost:8080/api/documentation#/Menu%20Categories`:

### GET /api/categories
Get list of menu categories with pagination and filters

**Query Parameters:**
- `search` (string): Search term for category name
- `is_active` (boolean): Filter by active status
- `page` (integer): Page number
- `limit` (integer): Items per page

**Response:**
```json
{
  "data": {
    "data": [
      {
        "id": 1,
        "name": "Appetizers",
        "description": "Starter dishes",
        "is_active": true,
        "sort_order": 0,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 50,
    "totalPages": 2
  }
}
```

### GET /api/categories/{id}
Get specific menu category

### POST /api/categories
Create new menu category

**Request Body:**
```json
{
  "name": "Appetizers",
  "description": "Starter dishes",
  "is_active": true,
  "sort_order": 0
}
```

### PUT /api/categories/{id}
Update menu category

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "is_active": false,
  "sort_order": 1
}
```

### DELETE /api/categories/{id}
Delete menu category

## Usage Example

```tsx
import CategoriesManagement from './pages/POS/CategoriesManagement';

// In your router
<Route 
  path="/categories" 
  element={
    <ProtectedRoute allowedRoles={['owner', 'manager']}>
      <CategoriesManagement />
    </ProtectedRoute>
  } 
/>
```

## Key Features

### ✅ Component Separation
- Separate components for filters, list, modal
- Reusable and maintainable code
- Clear responsibility separation

### ✅ API Integration
- Full CRUD operations
- Server-side pagination
- Server-side filtering
- Error handling

### ✅ State Management
- Custom hook for centralized logic
- Loading states
- Error states
- Filter state management

### ✅ User Experience
- Loading skeletons
- Empty states
- Error messages
- Confirmation dialogs
- Real-time preview
- Character counters
- Active filter indicators

### ✅ Form Validation
- Formik + Yup integration
- Required field validation
- Length validation
- Error messages
- Field-level feedback

### ✅ Responsive Design
- Mobile-friendly grid
- Responsive filters
- Touch-friendly buttons
- Adaptive pagination

## Best Practices Applied

1. **TypeScript**: Full type safety with interfaces
2. **Component Reusability**: Modular components
3. **Separation of Concerns**: API, hooks, components separated
4. **Error Handling**: Comprehensive try-catch blocks
5. **Loading States**: Skeleton loaders and disabled states
6. **User Feedback**: Success/error messages, confirmations
7. **Accessibility**: Semantic HTML, labels, ARIA attributes
8. **Performance**: Optimized re-renders, pagination
9. **Code Organization**: Clear folder structure
10. **Documentation**: Inline comments and type definitions

## Testing Checklist

- [ ] Create new category
- [ ] Edit existing category
- [ ] Delete category (with confirmation)
- [ ] Toggle category status
- [ ] Search by name
- [ ] Filter by status
- [ ] Reset filters
- [ ] Pagination navigation
- [ ] Change items per page
- [ ] Form validation (required fields)
- [ ] Form validation (length limits)
- [ ] Loading states
- [ ] Empty states
- [ ] Error handling
- [ ] Mobile responsiveness

## Future Enhancements

1. **Image Upload**: Add category images
2. **Drag & Drop**: Reorder categories by drag-and-drop
3. **Bulk Actions**: Select multiple categories for bulk operations
4. **Export/Import**: CSV export and import functionality
5. **Analytics**: Category performance metrics
6. **Color Picker**: Custom category colors
7. **Icons**: Custom category icons
8. **Tags**: Add tags to categories
9. **Archive**: Archive instead of delete
10. **Activity Log**: Track category changes

## Migration Notes

### From Old Implementation:
The old `Categories.tsx` used `useMenuManagement` hook which was mixing menu items and categories logic. The new implementation:

1. Separates category logic into `useCategoryManagement`
2. Uses dedicated API functions with pagination
3. Follows the same pattern as `StaffManagement`
4. Provides better type safety
5. Includes proper error handling

### Breaking Changes:
- New hook name: `useCategoryManagement` instead of `useMenuManagement`
- New component name: `CategoriesManagement` instead of `Categories`
- API responses now include pagination metadata
- Filter structure changed to match backend expectations

## Troubleshooting

### Issue: Categories not loading
**Solution:** Check API endpoint, ensure authentication token is valid

### Issue: Pagination not working
**Solution:** Verify backend supports pagination parameters

### Issue: Search not working
**Solution:** Check if backend expects `search` or `searchTerm` parameter

### Issue: TypeScript errors with formik/yup
**Solution:** Both packages are installed in package.json, just TypeScript compile-time warnings

## Dependencies

- React 19.2.0
- TypeScript
- Formik 2.4.6
- Yup 1.7.1
- Axios 1.12.2
- Tailwind CSS
- React Router 7.x

## Files Modified/Created

### Created:
- `src/hooks/useCategoryManagement.ts`
- `src/components/menu/CategoryFilters.tsx`
- `src/components/menu/CategoryList.tsx`
- `src/components/menu/CategoryModal.tsx`
- `src/pages/POS/CategoriesManagement.tsx`

### Modified:
- `src/api/menu.ts` - Added pagination and filter support
- `src/App.tsx` - Updated route to use new component

### Existing (Reused):
- `src/components/common/Pagination.tsx`
- `src/components/common/PageMeta.tsx`
- `src/components/common/PageBreadCrumb.tsx`

## Support

For issues or questions:
1. Check console for error messages
2. Verify API documentation matches implementation
3. Test with backend API directly (Postman/Swagger)
4. Check network tab for API responses
5. Review this guide for configuration details
