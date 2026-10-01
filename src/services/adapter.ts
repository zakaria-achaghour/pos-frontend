/**
 * The one place that turns Laravel response shapes into what the screens read.
 *
 * The backend returns:
 *   - paginator objects   { current_page, data: [...], total, ... }   (index endpoints)
 *   - bare models         { id, ... }                                 (show/store/update)
 *   - wrapped payloads    { data: {...}, message }                    (some endpoints)
 *   - decimals as strings "12.50"
 *   - snake_case fields and relations (order_items, menu_item)
 * Every API call should pass through these helpers instead of re-guessing the shape.
 */
import type { Order, OrderItem, OrderStatus, PaymentStatus } from '@/types/order';

export interface Pagination {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number;
  to: number;
}

export interface Page<T> {
  items: T[];
  pagination: Pagination;
}

type Dict = Record<string, unknown>;

const isObject = (v: unknown): v is Dict => typeof v === 'object' && v !== null && !Array.isArray(v);

export const num = (value: unknown, fallback = 0): number => {
  const n = typeof value === 'number' ? value : parseFloat(String(value ?? ''));
  return Number.isFinite(n) ? n : fallback;
};

const str = (value: unknown): string | undefined =>
  value === null || value === undefined ? undefined : String(value);

/** Laravel paginator: `data` is an array next to paging metadata */
const isPaginator = (p: unknown): p is Dict & { data: unknown[] } =>
  isObject(p) && Array.isArray(p['data']) && ('current_page' in p || 'last_page' in p || 'total' in p);

/** Turn any list response (paginator, bare array, or {data: []}) into items + pagination. */
export function toPage<T>(payload: unknown, map: (raw: Dict) => T = (r) => r as T): Page<T> {
  let rawItems: unknown[] = [];
  let meta: Dict = {};

  if (isPaginator(payload)) {
    rawItems = payload.data;
    meta = payload;
  } else if (Array.isArray(payload)) {
    rawItems = payload;
  } else if (isObject(payload) && Array.isArray(payload['data'])) {
    rawItems = payload['data'] as unknown[];
  }

  const items = rawItems.filter(isObject).map(map);
  const perPage = num(meta['per_page'], items.length || 15);
  return {
    items,
    pagination: {
      currentPage: num(meta['current_page'], 1),
      lastPage: num(meta['last_page'], 1),
      perPage,
      total: num(meta['total'], items.length),
      from: num(meta['from'], items.length ? 1 : 0),
      to: num(meta['to'], items.length),
    },
  };
}

/** Unwrap `{ data: model }` when present; return bare models untouched. */
export function toEntity<T>(payload: unknown, map: (raw: Dict) => T = (r) => r as T): T {
  const envelopeKeys = new Set(['data', 'message', 'success', 'status']);
  if (isObject(payload) && isObject(payload['data']) && Object.keys(payload).every((k) => envelopeKeys.has(k))) {
    return map(payload['data'] as Dict);
  }
  return map(isObject(payload) ? payload : {});
}

// ---- Orders -------------------------------------------------------------

const normalizeOrderItem = (raw: Dict): OrderItem => {
  const menuItem = isObject(raw['menu_item']) ? raw['menu_item'] : isObject(raw['menuItem']) ? raw['menuItem'] : undefined;
  const quantity = num(raw['quantity'], 1);
  const unitPrice = num(raw['unit_price'] ?? raw['unitPrice'] ?? menuItem?.['price']);
  return {
    id: num(raw['id']),
    menuItemId: num(raw['menu_item_id'] ?? raw['menuItemId'] ?? menuItem?.['id']),
    ...(menuItem && {
      menuItem: {
        id: num(menuItem['id']),
        name: String(menuItem['name'] ?? ''),
        price: num(menuItem['price']),
        ...(menuItem['image'] ? { image: String(menuItem['image']) } : {}),
      },
    }),
    quantity,
    unitPrice,
    totalPrice: num(raw['total_price'] ?? raw['totalPrice'], unitPrice * quantity),
    ...(raw['special_instructions'] ? { specialInstructions: String(raw['special_instructions']) } : {}),
    status: (str(raw['status']) as OrderStatus | undefined) ?? 'pending',
  };
};

export function normalizeOrder(raw: Dict): Order {
  const id = num(raw['id']);
  const table = isObject(raw['table']) ? raw['table'] : undefined;
  const waiter = isObject(raw['waiter']) ? raw['waiter'] : undefined;
  const itemsRaw = (Array.isArray(raw['order_items']) ? raw['order_items'] : Array.isArray(raw['items']) ? raw['items'] : []) as unknown[];
  const paidAt = raw['paid_at'];
  const paymentMethod = str(raw['payment_method'] ?? raw['paymentMethod']);
  const createdAt = str(raw['placed_at'] ?? raw['created_at'] ?? raw['createdAt']) ?? '';

  const waiterName = waiter
    ? str(waiter['name']) ?? [waiter['first_name'], waiter['last_name']].filter(Boolean).join(' ')
    : '';

  return {
    ...(raw as unknown as Order),
    id,
    orderNumber: str(raw['order_number'] ?? raw['orderNumber']) ?? `#${id}`,
    type: (str(raw['type']) ?? 'dine-in') as Order['type'],
    status: (str(raw['status']) ?? 'pending') as OrderStatus,
    tableId: num(raw['table_id'] ?? table?.['id'], 0) || undefined,
    ...(table && { table: { id: num(table['id']), number: String(table['number'] ?? table['name'] ?? table['id']) } }),
    ...(raw['customer_name'] ? { customer: { id: 0, name: String(raw['customer_name']), phone: '' } } : {}),
    items: itemsRaw.filter(isObject).map(normalizeOrderItem),
    subtotal: num(raw['subtotal']),
    tax: num(raw['tax_amount'] ?? raw['tax']),
    service_charge_amount: num(raw['service_charge_amount']),
    tax_amount: num(raw['tax_amount'] ?? raw['tax']),
    discount: num(raw['discount_amount'] ?? raw['discount']),
    discount_amount: num(raw['discount_amount'] ?? raw['discount']),
    tip: num(raw['tip_amount'] ?? raw['tip']),
    total: num(raw['total']),
    paymentStatus: (paidAt ? 'completed' : 'pending') as PaymentStatus,
    ...(paymentMethod && { paymentMethod: paymentMethod as Order['paymentMethod'], payment_method: paymentMethod }),
    ...(waiter && { serverId: num(waiter['id']), server: { id: num(waiter['id']), name: waiterName } }),
    createdAt,
    updatedAt: str(raw['updated_at'] ?? raw['updatedAt']) ?? createdAt,
  };
}

export const toOrderPage = (payload: unknown): Page<Order> => toPage(payload, normalizeOrder);
export const toOrder = (payload: unknown): Order => toEntity(payload, normalizeOrder);
