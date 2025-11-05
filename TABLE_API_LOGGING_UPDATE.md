# Table API Logging Update

## Overview
Updated `src/api/tables.ts` to match the logging and error handling pattern used in `src/api/staff.ts` for consistency across the codebase.

## Changes Made

### 1. Enhanced Console Logging with Emojis
All API methods now include comprehensive console logging with emoji prefixes for better developer experience:

- **🔍** - Fetching/Reading operations
- **➕** - Create operations  
- **🔄** - Update operations
- **🗑️** - Delete operations
- **📡** - API response received
- **✅** - Success confirmation
- **❌** - Error logging

### 2. Consistent Error Handling
All catch blocks now use:
```typescript
catch (error: any) {
  console.error('❌ Error message:', error);
  // throw or return default
}
```

### 3. Updated Methods

#### Read Operations (🔍)
- `getTables()` - Added entry and response logging
- `getTable()` - Added entry and response logging
- `getTableAnalytics()` - Added entry and response logging
- `getTableAnalyticsById()` - Added entry and response logging
- `getTableOccupancyRates()` - Added entry and response logging
- `getTableRevenue()` - Added entry and response logging
- `getTablePerformanceAnalytics()` - Added entry and response logging
- `getSpecificTableAnalytics()` - Added entry and response logging

#### Create Operations (➕)
- `createTable()` - Added entry and response logging

#### Update Operations (🔄)
- `updateTable()` - Added entry and response logging
- `updateTableStatus()` - Added entry and response logging
- `bulkUpdateStatus()` - Added entry and response logging
- `updateLayout()` - Added entry and success logging

#### Delete Operations (🗑️)
- `deleteTable()` - Added entry and success logging

## Benefits

### 1. Better Developer Experience
- Easy to track API calls in browser console
- Emoji prefixes make logs visually scannable
- Clear indication of request → response flow

### 2. Easier Debugging
- Can see exact parameters being sent
- Can see exact responses received
- Errors are clearly marked and easy to spot

### 3. Consistency
- Now matches the pattern used in `staff.ts`
- All API files will follow the same logging convention
- Easier for team members to understand codebase

### 4. Professional Logging
- Console groups can be used to expand/collapse related logs
- Clear separation between different operation types
- Helpful for troubleshooting API integration issues

## Example Log Output

### Creating a Table
```
➕ Creating table with data: {table_number: 5, seats: 4, status: "available"}
📡 Create table API response: {data: {id: 15, table_number: 5, ...}}
```

### Fetching Tables
```
🔍 Fetching tables with params: {page: 1, limit: 10, filters: {...}}
📡 Tables API response: {data: [...], total: 45, page: 1}
```

### Error Example
```
🔄 Updating table: 10 with updates: {status: "occupied"}
❌ Error updating table 10: AxiosError: Network Error
```

## Testing

### Manual Testing
1. Open browser console
2. Navigate to Table Management page
3. Perform CRUD operations
4. Observe structured logging with emojis

### What to Look For
- ✅ Entry logs appear before API calls
- ✅ Response logs appear after successful calls
- ✅ Error logs appear on failures
- ✅ Emojis make logs easy to scan

## Related Files
- `src/api/staff.ts` - Reference implementation (pattern source)
- `src/api/tables.ts` - Updated file (this change)
- `src/hooks/useTableManagement.ts` - Consumer of this API

## Next Steps
Consider applying this same logging pattern to:
- `src/api/menu.ts`
- `src/api/orders.ts`
- `src/api/restaurants.ts`
- `src/api/dashboard.ts`

## Notes
- All changes are backward compatible
- No breaking changes to API interfaces
- Only logging and error handling improvements
- Error types changed from `error` to `error: any` for better access to error properties
