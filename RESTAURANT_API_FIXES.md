# Restaurant API Response Structure Fixes

## Problem
The single restaurant API endpoints return data directly (not wrapped in a `data` property like paginated responses), and use different field names than expected by the frontend components.

## API Response Structure

### Single Restaurant Response
```json
{
    "id": 4,
    "name": "Café Lumière",
    "address": "321 French Quarter, Arts District",
    "phone": "+1-555-0404",
    "email": "bonjour@cafelumiere.com",
    "subdomain": "cafe-lumiere",
    "timezone": "America/New_York",
    "currency": "USD", 
    "tax_rate": "8.00",
    "is_active": true,
    "settings": {...},
    "users": [...],
    "created_at": "...",
    "updated_at": "..."
}
```

### Paginated Restaurant List Response
```json
{
    "data": [
        {restaurant1}, {restaurant2}, ...
    ],
    "pagination": {...}
}
```

## Key Differences
1. **Single restaurant**: Data returned directly
2. **Restaurant list**: Data wrapped in `data` property
3. **Status field**: API uses `is_active` (boolean) vs frontend expects `status` ('active'|'inactive')
4. **Owner info**: May be in `users` array instead of direct `owner_*` fields
5. **Tax info**: API has `tax_rate` vs frontend expects `tax_number`

## Changes Made

### 1. Updated API Service (`src/api/restaurants.ts`)

#### Updated Restaurant Interface
- Added `is_active?: boolean`
- Added `subdomain?: string`
- Added `tax_rate?: string`
- Added `settings?` object
- Added `users?` array

#### Fixed API Methods
- **`getRestaurant`**: Returns `response.data` directly (not `response.data.data`)
- **`updateRestaurant`**: Returns `response.data` directly with error handling
- **`createRestaurant`**: Handles both wrapped and direct responses
- **`updateRestaurantStatus`**: Sends `is_active` boolean instead of `status` string

### 2. Updated Edit Restaurant (`src/pages/POS/EditRestaurant.tsx`)

#### Fixed Data Mapping
```typescript
// Extract owner from users array if available
const owner = data.users && data.users.length > 0 ? data.users[0] : null;

setFormData({
  // ... other fields
  tax_number: data.tax_rate || '', // Map tax_rate to tax_number
  owner_name: owner?.name || data.owner_name || '', // Get from users array first
  owner_email: owner?.email || data.owner_email || '',
  status: data.is_active ? 'active' : 'inactive' // Convert boolean to string
});
```

### 3. Updated Restaurant Details (`src/pages/POS/RestaurantDetails.tsx`)

#### Fixed Status Handling
```typescript
// Convert API response to match component expectations
const processedData = {
  ...data,
  status: data.is_active ? 'active' : 'inactive'
};
```

### 4. Updated Restaurant List (`src/pages/POS/AdminTenants.tsx`)

#### Fixed List Data Processing
```typescript
// Convert API response format to match component expectations
const processedRestaurants = response.data.map((restaurant: any) => ({
  ...restaurant,
  status: restaurant.is_active ? 'active' : 'inactive'
}));
```

#### Enhanced Status Toggle
- Added detailed logging for debugging
- Updated local state correctly after API calls
- Added error handling with user feedback

## Backend API Expectations

Based on the response structure, the backend expects:

### Status Update Endpoint
```
PATCH /admin/restaurants/{id}/status
Body: { "is_active": true/false }
```

### Single Restaurant Endpoint
```
GET /admin/restaurants/{id}
Response: Restaurant object directly (no data wrapper)
```

### Update Restaurant Endpoint
```
PUT /admin/restaurants/{id}
Body: Restaurant update data
Response: Updated restaurant object directly
```

## Testing Instructions

1. **Start the application**: `docker compose -f docker-compose.dev.yml up -d`
2. **Visit**: http://localhost:5174/
3. **Login as superadmin**
4. **Navigate to Restaurants**
5. **Test operations**:
   - View restaurant list ✅ (Should work with current API)
   - Click "View" on a restaurant (Will work when backend endpoint exists)
   - Click "Edit" on a restaurant (Will work when backend endpoint exists)
   - Toggle restaurant status ✅ (Should work with confirmation modal)
   - Delete restaurant ✅ (Should work with confirmation modal)

## Next Steps

1. **Backend**: Implement missing endpoints if they don't exist:
   - `GET /admin/restaurants/{id}` for single restaurant details
   - `PUT /admin/restaurants/{id}` for restaurant updates
   - `PATCH /admin/restaurants/{id}/status` for status updates

2. **Frontend**: All frontend changes are complete and ready for testing

3. **Testing**: Test all restaurant operations to ensure they work with the actual API

## Error Handling

All API methods now include:
- Detailed console logging for debugging
- Error response logging with status and data
- User-friendly error messages
- Graceful fallbacks where appropriate

## Console Debugging

Look for these console messages when testing:
- `🔍 Fetching restaurant with ID: X`
- `📡 Single restaurant API response:`
- `🔄 Updating restaurant status for ID: X`
- `❌ Error [operation]:` (for error cases)

This provides detailed information about API interactions for debugging.