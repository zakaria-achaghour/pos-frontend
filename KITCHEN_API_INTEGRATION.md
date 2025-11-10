# Kitchen API Integration Guide

## Backend API Contract Implementation

This document describes how the frontend integrates with the Kitchen Management API endpoints.

## API Endpoints

### 1. List Tickets
**Endpoint:** `GET /api/kitchen/tickets`  
**Query Parameters:**
- `status`: `pending` | `preparing` | `ready`
- `priority`: `normal` | `rush` | `urgent`
- `cooking_station`: string (grill, fryer, salad, dessert, beverages, general)

**Response:**
```json
[
  {
    "id": 1,
    "ticket_number": "KT-001",
    "order_id": 123,
    "status": "pending",
    "priority": "normal",
    "cooking_station": "grill",
    "assigned_chef_id": 5,
    "special_instructions": "Extra crispy",
    "created_at": "2025-11-10T10:00:00Z",
    "order": {
      "id": 123,
      "type": "dine-in",
      "table_id": 4,
      "table": {
        "id": 4,
        "number": "5",
        "section": "Main"
      }
    },
    "assigned_chef": {
      "id": 5,
      "first_name": "John",
      "last_name": "Doe",
      "role": "chef"
    },
    "items": [
      {
        "id": 1,
        "quantity": 2,
        "status": "pending",
        "special_instructions": "No onions",
        "removed_ingredients": ["onions"],
        "added_extras": ["extra cheese"],
        "menu_item": {
          "id": 10,
          "name": "Burger",
          "description": "Classic beef burger",
          "preparation_time": 15,
          "category": {
            "id": 1,
            "name": "Mains"
          }
        }
      }
    ]
  }
]
```

### 2. View Single Ticket
**Endpoint:** `GET /api/kitchen/tickets/{id}`  
**Response:** Same structure as single ticket in list above (404 if not in tenant)

### 3. Assign Ticket
**Endpoint:** `POST /api/kitchen/tickets/{id}/assign`  
**Request Body:**
```json
{
  "chef_id": 5,
  "cooking_station": "grill"  // optional
}
```
**Response:** Updated ticket with message  
**Validation:** Chef must belong to same restaurant (422 error otherwise)

### 4. Start Preparation
**Endpoint:** `POST /api/kitchen/tickets/{id}/start`  
**Allowed When:** `status === 'pending'`  
**Effect:** Changes status to `preparing`  
**Response:**
```json
{
  "message": "Ticket preparation started",
  "ticket": { /* updated ticket object */ }
}
```
**Validation:** Returns 422 if ticket is not in `pending` status

### 5. Complete Preparation
**Endpoint:** `POST /api/kitchen/tickets/{id}/complete`  
**Allowed When:** `status === 'preparing'`  
**Effect:** 
- Changes status to `ready`
- Sets `completed_at` timestamp
- Calculates `preparation_time`

**Response:**
```json
{
  "message": "Ticket preparation completed",
  "ticket": { /* updated ticket object with completed_at and preparation_time */ }
}
```
**Validation:** Returns 422 if ticket is not in `preparing` status

### 6. Update Priority
**Endpoint:** `PUT /api/kitchen/tickets/{id}/priority`  
**Request Body:**
```json
{
  "priority": "urgent"  // normal | rush | urgent
}
```
**Response:** Updated ticket  
**Validation:** Returns 422 for invalid priority values

### 7. Analytics
**Endpoint:** `GET /api/kitchen/analytics?period=today`  
**Query Parameters:**
- `period`: `today` | `week` | `month`

**Response:**
```json
{
  "total_tickets": 45,
  "pending_tickets": 5,
  "preparing_tickets": 12,
  "ready_tickets": 8,
  "completed_tickets": 20,
  "average_prep_time": 18.5,
  "chef_performance": [
    {
      "chef_id": 5,
      "chef_name": "John Doe",
      "tickets_completed": 15,
      "average_prep_time": 17.2,
      "efficiency_rating": 92.5
    }
  ],
  "station_utilization": [
    {
      "cooking_station": "grill",
      "ticket_count": 23,
      "avg_prep_time": 19.8,
      "utilization_percentage": 78.5
    }
  ]
}
```

## Frontend Implementation

### API Client (`src/api/kitchen.ts`)
```typescript
import kitchenAPI from '@/api/kitchen';

// List tickets with filters
const tickets = await kitchenAPI.getTickets({
  status: 'pending',
  priority: 'urgent',
  cooking_station: 'grill'
});

// Get single ticket
const ticket = await kitchenAPI.getTicket(ticketId);

// Assign ticket
await kitchenAPI.assignTicket(ticketId, {
  chef_id: 5,
  cooking_station: 'grill'
});

// Start preparation (pending → preparing)
await kitchenAPI.startPreparation(ticketId);

// Complete preparation (preparing → ready)
await kitchenAPI.completeTicket(ticketId);

// Update priority
await kitchenAPI.updatePriority(ticketId, { priority: 'urgent' });

// Get analytics
const analytics = await kitchenAPI.getAnalytics('today');
```

### Component Usage (`src/pages/Kitchen/KitchenManagement.tsx`)

The main component:
1. **Fetches tickets** with status and priority filters
2. **Displays ticket cards** with order details, items, and assigned chef
3. **Shows ticket-level actions** based on current status:
   - `pending` → "Start Prep" button
   - `preparing` → "Complete Prep" button
   - `ready` → "Ready for Service" badge
4. **Displays item details** with menu item info, category, prep time, and customizations
5. **Shows preparation time** for planning and tracking
6. **Displays assigned chef** if ticket is assigned

## Status Transitions

**Valid Transitions:**
```
pending → preparing → ready
```

**Invalid Transitions (return 422 error):**
- Starting a ticket that's not `pending`
- Completing a ticket that's not `preparing`
- Any other direct status changes

## Error Handling

### 422 Validation Errors
Display user-friendly messages:
- "Ticket must be in pending status to start preparation"
- "Ticket must be in preparing status to complete"
- "Invalid chef ID or cooking station"
- "Invalid priority value"

### 404 Errors
- "Ticket not found or doesn't belong to your restaurant"

### Implementation
```typescript
try {
  await kitchenAPI.startPreparation(ticketId);
} catch (err: any) {
  setError(
    err.response?.data?.message || 
    'Failed to start preparation. Ticket must be in pending status.'
  );
}
```

## Multi-Tenancy

All endpoints require:
- **Bearer token** authentication
- **Restaurant scoping** - only tickets from user's restaurant are accessible
- Backend automatically filters by restaurant_id from auth token

## Sorting & Ordering

**Backend handles sorting:**
- Primary sort: `priority` (urgent > rush > normal)
- Secondary sort: `created_at` (oldest first)

**No client-side sorting needed** unless custom view required (e.g., group by station)

## UI Filters

### Status Filter
Maps to `status` query parameter:
- All Orders
- Pending
- Preparing  
- Ready

### Priority Filter
Maps to `priority` query parameter:
- All Priorities
- Normal
- Rush
- Urgent

### Station Filter (Future)
Maps to `cooking_station` query parameter for station-specific views

## Analytics Integration

Use analytics endpoint for:
- **Dashboard widgets** showing ticket counts by status
- **Chef performance** metrics and leaderboards
- **Station utilization** for capacity planning
- **Average prep times** for performance tracking

## Best Practices

1. **Refresh after actions** - Always fetch tickets after status updates
2. **Handle 422 errors gracefully** - Show clear validation feedback
3. **Display ticket details** - Surface nested order info (table, items, categories)
4. **Show assigned chef** - Display chef name when ticket is assigned
5. **Prep time indicator** - Show menu item preparation time for planning
6. **Error dismissal** - Allow users to dismiss error messages
7. **Loading states** - Show loading spinners during API calls
8. **Empty states** - Show friendly messages when no tickets match filters

## Type Definitions

All types are defined in `src/types/kitchen.ts`:
- `KitchenTicket` - Main ticket structure
- `KitchenTicketItem` - Individual ticket items with menu item details
- `KitchenFilters` - Filter parameters for listing
- `KitchenAnalytics` - Analytics response structure
- `AssignTicketRequest` - Chef assignment payload
- `UpdateTicketPriorityRequest` - Priority update payload
