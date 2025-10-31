# Menu Items Management Implementation Guide

## Overview

Complete implementation of menu items management with filters, pagination, and image upload functionality, following the staff management structure pattern.

## Features

### Core Features
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Server-side pagination with customizable page size
- ✅ Advanced filtering (search, category, status, availability)
- ✅ Image upload functionality
- ✅ Real-time search with debouncing (500ms)
- ✅ Toast notifications with auto-dismiss
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark mode support
- ✅ Loading states and error handling
- ✅ Form validation (Formik + Yup)

### Item Management
- Toggle item status (Active/Inactive)
- Toggle availability (Available/Out of Stock)
- Upload item images (max 5MB)
- Track preparation time
- Manage ingredients and allergens
- Cost and margin calculation
- Sort order management

## Architecture

### 1. Custom Hook: `useMenuItemManagement`
**Location:** `src/hooks/useMenuItemManagement.ts`

**Features:**
- State management for menu items and categories
- Pagination state (page, limit, total, totalPages)
- Filter state (search, category, status, availability)
- CRUD operations with API integration
- Auto-fetch with debounced search (500ms)
- Statistics calculation
- Error handling

**Key Methods:**
```typescript
- fetchMenuItems(): Promise<void>
- fetchCategories(): Promise<void>
- createMenuItem(data): Promise<void>
- updateMenuItem(id, data): Promise<void>
- deleteMenuItem(id): Promise<void>
- toggleItemStatus(id, isActive): Promise<void>
- toggleItemAvailability(id, isAvailable): Promise<void>
- uploadItemImage(id, file): Promise<void>
- setFilters(filters): void
- resetFilters(): void
- setPage(page): void
- setLimit(limit): void
```

### 2. Components Structure

#### 2.1 MenuItemFilters Component
**Location:** `src/components/menu/MenuItemFilters.tsx`

**Features:**
- Search input with loading indicator
- Category dropdown (shows only active categories)
- Status filter (All/Active/Inactive)
- Availability filter (All/Available/Unavailable)
- Reset filters button
- Results counter
- "Add New Item" button
- Active filters badge

#### 2.2 MenuItemList Component
**Location:** `src/components/menu/MenuItemList.tsx`

**Features:**
- Grid layout (responsive: 1/2/3 columns)
- Item cards with:
  - Image display with fallback icon
  - Upload image button
  - Status and availability badges
  - Name, category, price display
  - Cost and margin (if cost provided)
  - Preparation time indicator
  - Allergen count warning
  - Quick action buttons:
    - Toggle status
    - Toggle availability
    - Edit item
    - Delete item
- Loading skeleton (6 cards)
- Empty state (with/without filters)

#### 2.3 MenuItemModal Component
**Location:** `src/components/menu/MenuItemModal.tsx`

**Features:**
- Formik + Yup validation
- Create and Edit modes
- Fields:
  - Name (required, 2-100 characters)
  - Price (required, 0.01-99999.99 MAD)
  - Cost (optional, shows margin %)
  - Category (dropdown, required)
  - Preparation time (1-480 minutes)
  - Description (optional, max 500 characters)
  - Ingredients (comma-separated)
  - Allergens (comma-separated)
  - Active status (checkbox)
  - Available status (checkbox)
  - Sort order (integer, min 0)
- Character counters
- Real-time margin calculation
- Ingredient/allergen counters
- Inactive warning
- Submit/Cancel buttons with loading states

#### 2.4 Main Page Component
**Location:** `src/pages/POS/MenuItemsManagement.tsx`

**Features:**
- PageMeta and PageBreadcrumb
- Header with statistics:
  - Total items
  - Active items
  - Available items
  - Categories count
- Toast notifications
- Filter section
- Items grid
- Pagination controls
- Create/Edit modal
- Image upload (hidden file input)
- Global error display

### 3. API Integration
**Location:** `src/api/menu.ts`

**Endpoints Used:**
```typescript
GET    /api/items          // List items with pagination & filters
GET    /api/items/:id      // Get single item
POST   /api/items          // Create item
PUT    /api/items/:id      // Update item
DELETE /api/items/:id      // Delete item
POST   /api/items/:id/image // Upload item image
GET    /api/categories     // List categories
```

**Filter Parameters:**
- `search`: string - Search in item name/description
- `category_id`: number - Filter by category
- `is_active`: boolean - Filter by status
- `is_available`: boolean - Filter by availability
- `page`: number - Page number
- `limit`: number - Items per page

**Response Format:**
```json
{
  "data": {
    "data": [
      {
        "id": 1,
        "name": "Grilled Chicken",
        "description": "Juicy grilled chicken breast",
        "price": 150.00,
        "cost": 80.00,
        "category_id": 2,
        "category": {
          "id": 2,
          "name": "Main Courses",
          "is_active": true
        },
        "is_active": true,
        "is_available": true,
        "image_url": "https://example.com/images/chicken.jpg",
        "preparation_time": 25,
        "ingredients": ["Chicken breast", "Herbs", "Olive oil"],
        "allergens": [],
        "sort_order": 0,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 45,
    "page": 1,
    "limit": 12,
    "totalPages": 4
  }
}
```

## Usage

### Basic Implementation

```tsx
import MenuItemsManagement from './pages/POS/MenuItemsManagement';

// In your router
<Route 
  path="/items" 
  element={
    <ProtectedRoute allowedRoles={['owner', 'manager']}>
      <MenuItemsManagement />
    </ProtectedRoute>
  } 
/>
```

### Using the Hook Directly

```tsx
import { useMenuItemManagement } from '../hooks/useMenuItemManagement';

function MyComponent() {
  const {
    menuItems,
    categories,
    loading,
    pagination,
    filters,
    stats,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    setFilters,
    setPage,
  } = useMenuItemManagement();

  // Use the data and methods
}
```

## Image Upload

### Features
- File type validation (images only)
- Size validation (max 5MB)
- Click on camera icon to upload
- Progress indication
- Success/error notifications
- Auto-refresh after upload

### Implementation
```tsx
const handleUploadImage = (id: number, name: string) => {
  setUploadingItemId(id);
  fileInputRef.current?.click();
};

const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file || !uploadingItemId) return;

  // Validate file type
  if (!file.type.startsWith('image/')) {
    showToast('Please select a valid image file', 'error');
    return;
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showToast('Image size must be less than 5MB', 'error');
    return;
  }

  try {
    await uploadItemImage(uploadingItemId, file);
    showToast('Image uploaded successfully!', 'success');
  } catch (error: any) {
    showToast(error.message, 'error');
  }
};
```

## Filtering & Search

### Search
- Searches in item name and description
- Debounced (500ms) to reduce API calls
- Shows loading indicator during search
- Clears on reset

### Filters
- **Category:** Dropdown with active categories only
- **Status:** All / Active / Inactive
- **Availability:** All / Available / Unavailable
- **Reset:** Clears all filters at once

### Filter Behavior
- All filters trigger immediate API call (except search)
- Resetting page to 1 when filters change
- Active filters badge indicator
- Results counter shows filtered/total

## Pagination

### Features
- Server-side pagination
- Customizable items per page (10, 20, 50, 100)
- Previous/Next buttons
- Page numbers with ellipsis
- Showing "X to Y of Z" info
- Auto-hide when total items = 0
- Navigation buttons hide when only 1 page

### Configuration
Default: 12 items per page (matches 3-column grid)

## Validation Rules

### Item Name
- Required
- Min: 2 characters
- Max: 100 characters

### Price
- Required
- Min: 0.01 MAD
- Max: 99,999.99 MAD

### Cost
- Optional
- Min: 0 MAD
- Max: 99,999.99 MAD
- Shows profit margin when provided

### Category
- Required
- Must be active category

### Preparation Time
- Optional
- Min: 1 minute
- Max: 480 minutes (8 hours)

### Description
- Optional
- Max: 500 characters

### Ingredients/Allergens
- Optional
- Comma-separated list
- Trimmed and filtered

## Statistics

### Calculated Stats
- **Total Items:** From pagination total
- **Active Items:** Count of is_active=true in current page
- **Inactive Items:** Count of is_active=false in current page
- **Available Items:** Count of is_available=true in current page
- **Unavailable Items:** Count of is_available=false in current page

Note: Active/inactive counts are from current page data, not total database.

## Error Handling

### API Errors
- Network errors with retry suggestions
- Validation errors displayed inline
- Permission errors with clear messages
- Server errors with fallback messages

### User Errors
- Invalid file type (images only)
- File too large (max 5MB)
- Missing required fields
- Invalid data formats

### Error Display
- Toast notifications for operations
- Inline errors in forms
- Global error banner for critical issues
- Context-aware error messages

## Toast Notifications

### Types
- **Success:** Green with checkmark
- **Error:** Red with X icon
- **Info:** Blue with info icon
- **Warning:** Yellow with warning icon

### Features
- Auto-dismiss (3 seconds)
- Manual close button
- Slide-in animation
- Context-aware messages
- Item name included in messages

### Examples
```typescript
showToast('Menu item "Grilled Chicken" created successfully!', 'success');
showToast('Menu item "Pizza" activated successfully!', 'success');
showToast('Menu item "Burger" marked as out of stock!', 'success');
showToast('Failed to upload image. Please try again.', 'error');
```

## Best Practices

### Performance
- Debounced search (500ms)
- Lazy image loading
- Pagination for large datasets
- Optimistic UI updates where possible

### UX/UI
- Loading states for all operations
- Empty states with helpful messages
- Confirmation dialogs for destructive actions
- Context-aware filter messages
- Responsive design for all screen sizes

### Security
- Role-based access (owner, manager only)
- File type validation
- File size validation
- API error handling
- Input sanitization

## Troubleshooting

### Issue: Pagination not showing
**Solution:**
1. Check browser console for API response
2. Verify backend returns proper pagination metadata
3. Check if `totalPages > 0` in response
4. Ensure backend supports pagination parameters

### Issue: Search not working
**Solution:**
1. Check if backend supports `search` parameter
2. Verify 500ms debounce is working
3. Check network tab for API calls
4. Ensure search field is not disabled

### Issue: Image upload failing
**Solution:**
1. Verify file is valid image format
2. Check file size (max 5MB)
3. Ensure backend supports multipart/form-data
4. Check API endpoint `/api/items/:id/image`

### Issue: Filters not triggering API call
**Solution:**
1. Check useEffect dependencies in hook
2. Verify filters state is updating
3. Check if API supports filter parameters
4. Review network tab for API calls

## Files Created/Modified

### Created:
- `src/hooks/useMenuItemManagement.ts`
- `src/components/menu/MenuItemFilters.tsx`
- `src/components/menu/MenuItemList.tsx`
- `src/components/menu/MenuItemModal.tsx`
- `src/pages/POS/MenuItemsManagement.tsx`

### Modified:
- `src/App.tsx` - Updated route to use new component
- `src/api/menu.ts` - Enhanced with pagination/filter support (already done)

### Existing (Reused):
- `src/components/common/Pagination.tsx`
- `src/components/common/Toast.tsx`
- `src/components/common/PageMeta.tsx`
- `src/components/common/PageBreadCrumb.tsx`

## Comparison with Staff Management

### Similarities
- Same component structure (Filters, List, Modal, Main Page)
- Custom hook for state management
- Server-side pagination
- Debounced search
- Toast notifications
- CRUD operations
- Role-based access

### Differences
- Image upload functionality (not in staff)
- Availability toggle (menu-specific)
- Cost/margin calculation (menu-specific)
- Allergen warnings (menu-specific)
- Category filtering (menu-specific)
- Preparation time (menu-specific)

## Future Enhancements

### Planned Features
- [ ] Bulk operations (activate/deactivate multiple items)
- [ ] Duplicate item functionality
- [ ] Image preview/crop before upload
- [ ] Drag-and-drop image upload
- [ ] Export items to CSV/Excel
- [ ] Import items from CSV
- [ ] Item variants (sizes, options)
- [ ] Price history tracking
- [ ] Nutritional information
- [ ] Advanced analytics dashboard

### Performance Improvements
- [ ] Virtual scrolling for large lists
- [ ] Image optimization/compression
- [ ] Caching with React Query
- [ ] Optimistic updates
- [ ] Background sync

## Support

For issues or questions:
1. Check console for error messages
2. Verify API documentation matches implementation
3. Test with backend API directly (Postman/Swagger)
4. Check network tab for API responses
5. Review this guide for configuration details

## License

Part of the POS System - All rights reserved
