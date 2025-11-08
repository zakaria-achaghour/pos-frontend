# Order & Payment Status Flow

## Important Concept
**Payment Status ≠ Order Status**

Payment and order completion are **independent processes**:
- A customer can pay while food is still being prepared
- Order can be completed (served) but payment still pending
- Payment status: `unpaid` → `paid` → `refunded`
- Order status: `pending` → `accepted` → `preparing` → `ready` → `served` → `completed`

## Order Status Flow

```
pending     → Order created, waiting for kitchen acceptance
    ↓
accepted    → Kitchen accepted, will start preparing
    ↓
preparing   → Food is being prepared
    ↓
ready       → Food is ready for pickup/serving
    ↓
served      → Food delivered to customer
    ↓
completed   → Order fully completed (payment done + served)
```

## Payment Status (Independent)

```
unpaid   → No payment received yet
    ↓
paid     → Payment received (cash/card/mobile)
    ↓
refunded → Payment returned to customer
```

## Real-World Scenarios

### Scenario 1: Pay First, Then Wait for Food
1. Customer orders (status: `pending`)
2. Customer pays immediately (payment: `paid`)
3. Kitchen prepares (status: `preparing`)
4. Food ready (status: `ready`)
5. Food served (status: `served`)
6. Order complete (status: `completed`)

### Scenario 2: Eat First, Pay Later
1. Customer orders (status: `pending`)
2. Kitchen prepares (status: `preparing`, payment: `unpaid`)
3. Food served (status: `served`, payment: `unpaid`)
4. Customer eats
5. Customer pays (payment: `paid`)
6. Order complete (status: `completed`)

### Scenario 3: Fast Food
1. Order + Pay together (status: `pending`, payment: `paid`)
2. Kitchen prepares (status: `preparing`)
3. Food ready (status: `ready`)
4. Customer picks up (status: `served`)
5. Order complete (status: `completed`)

## API Payload Structure

### Create Order
```json
{
  "type": "dine-in",
  "table_id": 1,
  "customer_name": "John Doe",
  "priority": "normal",
  "waiter_id": 5,
  "items": [
    {
      "menu_item_id": 9,
      "quantity": 1,
      "special_instructions": "Extra spicy",
      "removed_ingredients": ["Onions"],
      "added_extras": ["Extra Cheese"]
    }
  ]
}
```

### Update Order Status
```json
{
  "status": "preparing"  // or accepted, ready, served, completed, cancelled
}
```

### Process Payment (Independent)
```json
{
  "payment_method": "cash",  // or card, mobile
  "amount": 245.50,
  "payment_status": "paid"
}
```

## UI Indicators

### Order Status Badges
- 🟤 Pending (gray)
- 🔵 Accepted (blue)
- 🟠 Preparing (orange)
- 🟣 Ready (purple)
- 🔷 Served (indigo)
- 🟢 Completed (green)
- 🔴 Cancelled (red)

### Payment Status Badges
- 🟡 Unpaid (yellow)
- 🟢 Paid (green)
- 🔴 Refunded (red)

## Staff Permissions

### Waiter/Cashier Can:
- Create orders
- Update order status (accepted → preparing → ready → served)
- Process payments
- View order details

### Kitchen Can:
- Update order status (accepted → preparing → ready)
- View order items and customizations

### Manager/Owner Can:
- All above +
- Cancel orders
- Issue refunds
- View analytics

## Frontend Implementation

The QuickOrderCreate component now sends:
- ✅ `priority` (normal/high/urgent)
- ✅ `waiter_id` (staff who created order)
- ✅ `removed_ingredients` (customizations)
- ✅ `added_extras` (customizations)
- ✅ `special_instructions` (notes)

The OrderDetails component should:
- Show both order status AND payment status separately
- Allow payment processing without changing order status
- Allow order status updates without requiring payment
- Only mark as "completed" when BOTH conditions met:
  - Order status = served
  - Payment status = paid
