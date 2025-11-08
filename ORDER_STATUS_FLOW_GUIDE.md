# Order Status Flow - Complete Guide

## Overview
This guide explains how orders flow through the system from creation to completion, with special handling for prepaid orders (takeout/delivery).

---

## Order Status Workflow

### The Kitchen Status Progression
```
pending → accepted → preparing → ready → served → completed
                                              ↓
                                         cancelled
```

**Each status represents:**
- `pending` - Order just created, awaiting kitchen acknowledgment
- `accepted` - Kitchen has acknowledged the order
- `preparing` - Food is being prepared
- `ready` - Food is ready for pickup/serving
- `served` - Food has been delivered to customer
- `completed` - Order fully completed (requires payment AND served)
- `cancelled` - Order cancelled at any stage

---

## Payment Status (Independent from Order Status)

Payment can happen at **any point** in the order lifecycle:

### Payment Timing Scenarios

#### 1. Pay After Eating (Traditional Dine-In)
```
Order Created → Kitchen Workflow → Served → Payment → Completed
   (unpaid)      (still unpaid)    (unpaid)  (paid)   (complete)
```

#### 2. Pay at Counter (Takeout/Delivery)
```
Order Created → Payment → Kitchen Workflow → Ready → Picked Up → Completed
   (paid)       (paid)     (paid)             (paid)   (paid)     (complete)
```

#### 3. Fast Food (Pay First, Then Prepare)
```
Order Created → Payment → Preparing → Ready → Served → Completed
   (paid)       (paid)     (paid)      (paid)  (paid)   (complete)
```

---

## Implementation Details

### 1. Order Creation with Payment

#### QuickOrderCreate Component
When creating takeout/delivery orders, the system now offers to collect payment immediately:

```tsx
// Payment collection modal appears for takeout/delivery
if (orderType === 'takeout' || orderType === 'delivery') {
  // Modal shows options:
  // - 💵 Collect Cash Now
  // - 💳 Collect Card Payment Now  
  // - ⏳ Collect Payment Later
}
```

#### Backend Payload (Prepaid Order)
```json
{
  "type": "takeout",
  "customer_name": "John Doe",
  "priority": "normal",
  "waiter_id": 5,
  "payment_method": "cash",
  "paid_at": "2025-11-08T14:30:00Z",
  "items": [...]
}
```

#### Backend Payload (Pay Later)
```json
{
  "type": "takeout",
  "customer_name": "John Doe",
  "priority": "normal",
  "waiter_id": 5,
  "items": [...]
}
```
*Note: No `payment_method` or `paid_at` - payment collected later*

---

### 2. OrderDetails Component Behavior

The OrderDetails page automatically adapts based on payment status:

#### A. Unpaid Order Display
```tsx
// Payment Status Badge
<span className="bg-yellow-100 text-yellow-800">
  ⏳ Unpaid
</span>

// Payment Actions Section (Visible)
<div>
  <h3>Payment Actions</h3>
  <button>💵 Cash Payment</button>
  <button>💳 Card Payment</button>
</div>
```

#### B. Prepaid Order Display
```tsx
// Payment Status Badge
<span className="bg-green-100 text-green-800">
  💳 Paid
</span>

// Payment Actions Section (Hidden)
// canProcessPayment() returns false because order.paid_at exists
```

#### C. Order Status Actions (Always Visible Until Completed)
```tsx
// Kitchen can still update status even if paid
{order.status === 'pending' && (
  <button>✅ Accept Order</button>
)}
{order.status === 'preparing' && (
  <button>✅ Mark Ready</button>
)}
{order.status === 'ready' && (
  <button>🍽️ Mark Served</button>
)}
// Complete button only shows when BOTH served AND paid
{order.status === 'served' && order.paid_at && (
  <button>✓ Complete Order</button>
)}
```

---

## Permission Logic

### Payment Collection (Creation Time)
**Who can collect payment during order creation:**
- ✅ Cashiers
- ✅ Managers
- ✅ Owners

### Payment Processing (After Creation)
**Who can process payment in OrderDetails:**
```typescript
const canProcessPayment = () => {
  return !order?.paid_at &&  // Not already paid
         user &&
         ['owner', 'manager', 'cashier'].includes(user.role);
};
```

### Order Status Updates
**Who can update kitchen status:**
```typescript
user && ['owner', 'manager', 'waiter'].includes(user.role)
```

---

## UI Flow Examples

### Example 1: Takeout with Immediate Payment

1. **Cashier creates order** (QuickOrderCreate)
   - Selects "Takeout"
   - Adds items: Pizza, Soda
   - Clicks "Place Order"

2. **Payment modal appears**
   - Cashier clicks "💵 Collect Cash Now"
   - Order created with `paid_at` set

3. **Kitchen sees order** (OrderDetails)
   - Status: `pending` 
   - Payment: `💳 Paid`
   - Kitchen clicks "✅ Accept Order"

4. **Kitchen prepares** 
   - Status changes: `accepted` → `preparing` → `ready`
   - Payment badge stays: `💳 Paid`

5. **Customer picks up**
   - Staff clicks "🍽️ Mark Served"
   - Then clicks "✓ Complete Order"
   - Order finished!

---

### Example 2: Dine-In with Pay After

1. **Waiter creates order** (QuickOrderCreate)
   - Selects "Dine-In"
   - Selects Table A1
   - Adds items: Steak, Wine
   - Clicks "Place Order"
   - *No payment modal* (dine-in default is pay later)

2. **Kitchen receives order** (OrderDetails)
   - Status: `pending`
   - Payment: `⏳ Unpaid`
   - Kitchen workflow: `pending` → `accepted` → `preparing` → `ready` → `served`

3. **Food served to table**
   - Status: `served`
   - Payment: `⏳ Unpaid`
   - Payment buttons visible

4. **Customer requests bill**
   - Cashier opens OrderDetails
   - Clicks "💵 Cash Payment"
   - Payment: `💳 Paid`

5. **Complete order**
   - "✓ Complete Order" button now visible
   - Cashier clicks it
   - Order status: `completed`

---

### Example 3: Delivery with Card Payment

1. **Manager creates delivery order**
   - Type: Delivery
   - Customer: Jane Smith
   - Items: Burger, Fries
   - Clicks "Place Order"

2. **Payment modal**
   - Manager clicks "💳 Collect Card Payment Now"
   - Card processed
   - Order created with payment info

3. **Kitchen workflow**
   - `pending` → `accepted` → `preparing` → `ready`
   - All stages show `💳 Paid` badge

4. **Delivery**
   - Driver picks up (status: `ready`)
   - Delivers to customer
   - Updates status to `served`
   - Then `completed`

---

## Backend Requirements

### Order Creation Endpoint
```
POST /api/orders
```

**Request Body (with payment):**
```json
{
  "type": "takeout",
  "customer_name": "John Doe",
  "priority": "normal",
  "waiter_id": 5,
  "payment_method": "cash",
  "paid_at": "2025-11-08T14:30:00Z",
  "items": [
    {
      "menu_item_id": 9,
      "quantity": 1,
      "special_instructions": "Extra spicy"
    }
  ]
}
```

**Response:**
```json
{
  "id": 1208,
  "type": "takeout",
  "status": "pending",
  "payment_method": "cash",
  "paid_at": "2025-11-08T14:30:00Z",
  "total": "34.99",
  ...
}
```

### Order Status Update
```
PUT /api/orders/:id
```

**Request Body:**
```json
{
  "status": "preparing"
}
```

### Payment Processing (After Creation)
```
POST /api/orders/:id/close
```

**Request Body:**
```json
{
  "payment_method": "cash",
  "amount_paid": 34.99
}
```

**Response:**
```json
{
  "id": 1208,
  "status": "served",
  "payment_method": "cash",
  "paid_at": "2025-11-08T15:00:00Z",
  ...
}
```

---

## Decision Tree

### Should payment be collected at creation?

```
Is order type takeout or delivery?
├─ YES → Show payment modal
│         ├─ Cashier chooses "Collect Now"
│         │  → Include payment_method + paid_at in payload
│         │  → Kitchen workflow proceeds
│         │  → Payment buttons hidden in OrderDetails
│         │  → Complete when served
│         │
│         └─ Cashier chooses "Pay Later"
│            → Normal order creation
│            → Kitchen workflow proceeds
│            → Payment buttons visible in OrderDetails
│            → Complete when served + paid
│
└─ NO (Dine-In) → Normal order creation
                  → Kitchen workflow proceeds
                  → Payment buttons visible in OrderDetails
                  → Complete when served + paid
```

---

## Status Badge Display

### Order Status Badges
| Status | Badge Color | Icon | Display Text |
|--------|------------|------|--------------|
| pending | Gray | ⏳ | Pending |
| accepted | Blue | ✅ | Accepted |
| preparing | Orange | 👨‍🍳 | Preparing |
| ready | Purple | ✅ | Ready |
| served | Indigo | 🍽️ | Served |
| completed | Green | ✓ | Completed |
| cancelled | Red | ❌ | Cancelled |

### Payment Status Badges
| Status | Badge Color | Icon | Display Text |
|--------|------------|------|--------------|
| Unpaid | Yellow | ⏳ | Unpaid |
| Paid | Green | 💳 | Paid |

---

## Key Takeaways

1. ✅ **Payment is independent from kitchen workflow**
   - You can pay before, during, or after food preparation
   - Kitchen statuses proceed regardless of payment status

2. ✅ **Prepaid orders still go through kitchen stages**
   - Even if paid at creation, order moves: pending → preparing → ready → served
   - This ensures kitchen visibility and tracking

3. ✅ **UI automatically adapts**
   - Payment buttons hidden when `paid_at` exists
   - Complete button only appears when both served AND paid
   - No manual UI configuration needed

4. ✅ **Flexible payment timing**
   - Takeout/Delivery: Option to pay at creation
   - Dine-In: Default pay after eating
   - All scenarios supported

5. ✅ **Order only completes when both conditions met**
   ```typescript
   canComplete = order.status === 'served' && order.paid_at !== null
   ```

---

## Common Questions

### Q: Can I skip kitchen stages for prepaid orders?
**A:** Only if you don't need kitchen tracking. For instant digital products, you could create orders with `status: 'completed'` and `paid_at` set. For physical food orders, always use the kitchen workflow.

### Q: What if customer pays during preparation?
**A:** No problem! Staff can process payment at any time in OrderDetails. The `paid_at` field gets set, payment buttons disappear, and when food is served the complete button appears.

### Q: Can waiters collect payment?
**A:** No, only cashiers/managers/owners can process payments. Waiters can update kitchen status but not handle money.

### Q: What happens if order is cancelled after payment?
**A:** Order status becomes `cancelled`, but `paid_at` remains. You'll need a refund process to handle this scenario (see PAYMENT_ORDER_FLOW.md for refund documentation).

### Q: Can I force immediate completion?
**A:** Yes, on the backend. Set both `status: 'completed'` and `paid_at` during creation. The frontend will render everything as complete and hide all action buttons.

---

## Related Documentation
- `PAYMENT_ORDER_FLOW.md` - Detailed payment workflow
- `QUICK_ORDER_GUIDE.md` - Order creation process
- `ORDER_DETAILS_API_INTEGRATION.md` - OrderDetails component
- `BACKEND_RESPONSE_ADAPTATION.md` - API response handling

**Status: ✅ Complete Implementation**
