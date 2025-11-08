# Backend Response Adaptation - OrderDetails Component

## Issue Identified
The OrderDetails component was expecting a different data structure than what the actual backend API returns. The backend uses **snake_case** property names and a slightly different structure.

## Backend Response Structure

### Actual Backend Response
```json
{
  "id": 1208,
  "restaurant_id": 1,
  "table_id": 1,
  "waiter_id": null,
  "type": "dine-in",
  "status": "completed",
  "priority": "normal",
  "subtotal": "34.99",
  "tax_amount": "0.00",
  "discount_amount": "0.00",
  "total": "34.99",
  "payment_method": "cash",
  "notes": null,
  "placed_at": null,
  "paid_at": "2025-11-08 13:13:18",
  "created_at": "2025-11-08T13:08:06.000000Z",
  "updated_at": "2025-11-08T13:13:18.000000Z",
  "table": {
    "id": 1,
    "number": "T01",
    "section": "Main Dining"
  },
  "waiter": null,
  "order_items": [
    {
      "id": 3596,
      "order_id": 1208,
      "menu_item_id": 9,
      "quantity": 1,
      "unit_price": "34.99",
      "special_instructions": null,
      "removed_ingredients": ["herbs"],
      "added_extras": ["Extra Cheese"],
      "menu_item": {
        "id": 9,
        "name": "Beef Tenderloin",
        "description": "8oz tenderloin with garlic mashed potatoes",
        "price": "34.99",
        "ingredients": ["beef tenderloin", "potatoes", "garlic", "butter", "cream", "herbs"],
        "category": {
          "id": 3,
          "name": "Main Courses"
        }
      }
    }
  ],
  "kitchen_ticket": {
    "id": 3,
    "ticket_number": "KT-1208-130806",
    "status": "pending"
  }
}
```

## Key Differences Fixed

### 1. Property Naming Convention
| Expected (camelCase) | Actual (snake_case) |
|---------------------|---------------------|
| `orderNumber` | Uses `id` directly |
| `createdAt` | `created_at` |
| `paymentStatus` | Derived from `paid_at` |
| `items` | `order_items` |
| `menuItem` | `menu_item` |
| `menuItemId` | `menu_item_id` |
| `unitPrice` | `unit_price` |
| `totalPrice` | Calculated from `unit_price * quantity` |
| `specialInstructions` | `special_instructions` |
| `tax` | `tax_amount` |
| `discount` | `discount_amount` |

### 2. Data Type Changes
| Field | Expected Type | Actual Type | Fix Applied |
|-------|---------------|-------------|-------------|
| `total` | `number` | `string` | `parseFloat(order.total)` |
| `subtotal` | `number` | `string` | `parseFloat(order.subtotal)` |
| `tax_amount` | `number` | `string` | `parseFloat(order.tax_amount)` |
| `discount_amount` | `number` | `string` | `parseFloat(order.discount_amount)` |
| `unit_price` | `number` | `string` | `parseFloat(item.unit_price)` |

### 3. Payment Status Logic
**Before:** Expected separate `paymentStatus` field with values: `pending`, `processing`, `completed`, `failed`, `refunded`

**After:** Derived from existing fields:
```typescript
const getPaymentStatus = () => {
  if (order?.paid_at && order?.payment_method) {
    return 'completed';
  }
  return 'pending';
};
```

### 4. Customizations Structure
**Before:** Expected `modifiers` array with type `'addition' | 'substitution' | 'removal'`

**After:** Direct arrays in order items:
- `removed_ingredients`: `string[]` - List of removed ingredient names
- `added_extras`: `string[]` - List of added extra names

Display logic updated:
```tsx
{/* Removed Ingredients */}
{item.removed_ingredients && item.removed_ingredients.length > 0 && (
  <p className="text-sm text-red-600 mt-2">
    <span className="font-medium">❌ No:</span> {item.removed_ingredients.join(', ')}
  </p>
)}

{/* Added Extras */}
{item.added_extras && item.added_extras.length > 0 && (
  <p className="text-sm text-green-600 mt-2">
    <span className="font-medium">➕ Extra:</span> {item.added_extras.join(', ')}
  </p>
)}
```

## TypeScript Interface Updates

### Created Backend-Specific Interfaces
```typescript
interface BackendOrderItem {
  id: number;
  order_id: number;
  menu_item_id: number;
  quantity: number;
  unit_price: string;
  special_instructions: string | null;
  removed_ingredients: string[] | null;
  added_extras: string[] | null;
  menu_item: {
    id: number;
    name: string;
    description: string;
    price: string;
    ingredients: string[];
    category: {
      id: number;
      name: string;
    };
  };
}

interface BackendOrder {
  id: number;
  restaurant_id: number;
  table_id: number | null;
  waiter_id: number | null;
  type: string;
  status: string;
  priority: string;
  subtotal: string;
  tax_amount: string;
  discount_amount: string;
  total: string;
  payment_method: string | null;
  notes: string | null;
  placed_at: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  table?: {
    id: number;
    number: string;
    section: string;
  } | null;
  waiter?: {
    id: number;
    name: string;
  } | null;
  order_items: BackendOrderItem[];
}
```

## Display Logic Updates

### Order Header
```tsx
<h2>Order #{order.id}</h2>  {/* Uses id directly, no orderNumber */}
<p>{formatDate(order.created_at)}</p>  {/* snake_case */}
<p>{parseFloat(order.total).toFixed(2)} MAD</p>  {/* String to number conversion */}

{/* Payment status derived from paid_at */}
<span>{order.paid_at ? '💳 Paid' : '⏳ Unpaid'}</span>
```

### Order Items
```tsx
{order.order_items.map((item) => (  {/* order_items not items */}
  <div>
    <h4>{item.menu_item?.name}</h4>  {/* menu_item not menuItem */}
    <p>{parseFloat(item.unit_price).toFixed(2)} MAD</p>  {/* unit_price */}
    
    {/* Special instructions */}
    {item.special_instructions && <p>{item.special_instructions}</p>}
    
    {/* Removed ingredients array */}
    {item.removed_ingredients?.length > 0 && (
      <p>❌ No: {item.removed_ingredients.join(', ')}</p>
    )}
    
    {/* Added extras array */}
    {item.added_extras?.length > 0 && (
      <p>➕ Extra: {item.added_extras.join(', ')}</p>
    )}
    
    {/* Calculate total price */}
    <span>{(parseFloat(item.unit_price) * item.quantity).toFixed(2)} MAD</span>
  </div>
))}
```

### Order Summary
```tsx
<div>Subtotal: {parseFloat(order.subtotal).toFixed(2)} MAD</div>
{parseFloat(order.tax_amount) > 0 && (
  <div>Tax: {parseFloat(order.tax_amount).toFixed(2)} MAD</div>
)}
{parseFloat(order.discount_amount) > 0 && (
  <div>Discount: -{parseFloat(order.discount_amount).toFixed(2)} MAD</div>
)}
<div>Total: {parseFloat(order.total).toFixed(2)} MAD</div>
```

## Payment Processing Updates

### Cash/Card Payment Functions
```typescript
const handleCloseOrder = async () => {
  await orderAPI.closeOrder(order.id, {
    payment_method: 'cash',
    amount_paid: parseFloat(order.total)  // Convert string to number
  });
  fetchOrder();
};

const handleCardPayment = async () => {
  await orderAPI.closeOrder(order.id, {
    payment_method: 'card',
    amount_paid: parseFloat(order.total)  // Convert string to number
  });
  fetchOrder();
};
```

### Permission Check
```typescript
const canProcessPayment = () => {
  return !order?.paid_at &&  // Check if not already paid
         user &&
         ['owner', 'manager', 'cashier'].includes(user.role);
};
```

## Action Button Logic

### Complete Order Condition
```typescript
{order.status === 'served' && order.paid_at && (
  <Button onClick={() => handleUpdateStatus('completed')}>
    ✓ Complete Order
  </Button>
)}
```
- Order must be "served"
- Payment must be completed (`paid_at` is not null)

## Priority Display
```tsx
{order.priority && order.priority !== 'normal' && (
  <span className={getPriorityColor(order.priority)}>
    {getPriorityIcon(order.priority)} Priority: {order.priority.toUpperCase()}
  </span>
)}
```
Only shows priority badge if it's not "normal" (to avoid cluttering UI).

## Testing Results

✅ Order details fetch successfully from backend
✅ All fields display correctly with proper formatting
✅ String to number conversions work properly
✅ Payment status derived correctly from `paid_at` field
✅ Customizations display properly (removed ingredients, added extras)
✅ Order summary calculations accurate
✅ Action buttons work with correct permissions
✅ No TypeScript compilation errors

## Migration Checklist

- [x] Created `BackendOrder` and `BackendOrderItem` interfaces
- [x] Updated state type from `ApiOrder` to `BackendOrder`
- [x] Fixed all property name references (camelCase → snake_case)
- [x] Added `parseFloat()` conversions for string number fields
- [x] Created `getPaymentStatus()` helper function
- [x] Updated customizations display (modifiers → arrays)
- [x] Fixed order items mapping (`order_items`)
- [x] Updated menu item access (`menu_item`)
- [x] Fixed date formatting (`created_at`)
- [x] Updated payment processing functions
- [x] Fixed permission checks
- [x] Updated action button conditions
- [x] Removed tip display (not in backend response)
- [x] All TypeScript errors resolved

## Result

OrderDetails component now correctly handles the actual backend API response structure, displaying all order information including customizations (removed ingredients and added extras) properly. The component maintains all functionality while adapting to the backend's data format.

**Status: ✅ Fully Compatible with Backend API**
