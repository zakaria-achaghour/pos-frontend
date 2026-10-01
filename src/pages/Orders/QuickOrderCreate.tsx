import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { menuAPI } from '@/api/menu';
import { orderAPI } from '@/api/orders';
import { tableAPI } from '@/api/tables';
import { useAuth } from '@/hooks/useAuthRedux';
import { MenuItemsGrid } from '@/components/pos/orders/MenuItemsGrid';
import { OrderCart } from '@/components/pos/orders/OrderCart';
import { OrderFilters } from '@/components/pos/orders/OrderFilters';
import { CategoryTabs } from '@/components/pos/orders/CategoryTabs';
import { AddItemModal } from '@/components/pos/orders/AddItemModal';
import type { MenuItem, Category, MenuItemFilters } from '@/types/menu';
import type { CreateOrderData } from '@/types/order';
import type { Table } from '@/types/table';
import { useTranslation } from 'react-i18next';
import { Button, Modal, Skeleton, useToast } from '@/components/kit';
import { formatMoney } from '@/lib/money';
import { errorMessage } from '@/lib/errors';

interface CartItem {
  line_id: string;
  menu_item_id: number;
  name: string;
  price: number;
  quantity: number;
  special_instructions?: string;
  removed_ingredients?: string[];
  added_extras?: string[];
  originalItem: MenuItem;
}

// The create endpoint accepts more than the shared CreateOrderData type declares.
type QuickOrderPayload = Omit<CreateOrderData, 'items'> & {
  priority: string;
  waiter_id?: number;
  items: (CreateOrderData['items'][number] & {
    removed_ingredients?: string[];
    added_extras?: string[];
  })[];
};

let cartLineCounter = 0;
const newLineId = () => `line-${Date.now()}-${++cartLineCounter}`;

// Two cart lines are the same line only if item and customizations match
const customizationKey = (
  menuItemId: number,
  instructions?: string,
  removed?: string[],
  extras?: string[]
) => JSON.stringify([
  menuItemId,
  instructions?.trim() || '',
  [...(removed ?? [])].sort(),
  [...(extras ?? [])].sort(),
]);

type PaymentDecision = { collectNow: boolean; method?: 'cash' | 'card' | undefined };

export default function QuickOrderCreate() {
  const navigate = useNavigate();
  const location = useLocation();
  const preSelectedTableId = location.state?.tableId;
  const { user } = useAuth(); // Get current user (waiter/cashier/manager/owner)
  const { t } = useTranslation();
  const toast = useToast();
  const [cartSheetOpen, setCartSheetOpen] = useState(false);

  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);

  // Order states
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedTable, setSelectedTable] = useState<number | ''>(preSelectedTableId || '');
  const [orderType, setOrderType] = useState<'dine-in' | 'takeout' | 'delivery'>('dine-in');
  const [customerName, setCustomerName] = useState('');
  const [priority, setPriority] = useState<'normal' | 'rush' | 'urgent'>('normal');
  const [cart, setCart] = useState<CartItem[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const isFirstSearchRun = useRef(true);
  const menuRequestId = useRef(0);

  // Pagination state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const ITEMS_PER_PAGE = 12;

  // UI states
  const [loading, setLoading] = useState(true); // Initial bootstrap only
  const [itemsLoading, setItemsLoading] = useState(false); // Category/item fetching
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCartItemIndex, setEditingCartItemIndex] = useState<number | null>(null);

  // Payment states (for pay-at-creation scenarios)
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch categories and tables in parallel
      const [categoriesResponse, tablesResponse] = await Promise.all([
        menuAPI.getCategories({ is_active: true }), // Only get active categories
        tableAPI.getTables()
      ]);

      // Handle categories response
      const categoriesData = categoriesResponse.data || [];
      setCategories(categoriesData);

      // Fetch all active menu items initially (for "All" category)
      // fetchMenuItems(null); // Removed explicit call here as useEffect for searchTerm will trigger it initially or we call it explicitly with defaults
      await fetchMenuItems(null, 1, '', true);

      // Handle tables
      const tablesData = Array.isArray(tablesResponse) ? tablesResponse : tablesResponse.data || [];
      const availableTables = tablesData.filter((table: Table) =>
        table.status === 'available' || table.status === 'occupied'
      );
      setTables(availableTables);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError(t('order.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    // The initial load already fetched items; only react to real search changes
    if (isFirstSearchRun.current) {
      isFirstSearchRun.current = false;
      return undefined;
    }
    const timer = setTimeout(() => {
      setPage(1);
      fetchMenuItems(selectedCategory, 1, searchTerm, true);
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const fetchMenuItems = async (
    categoryId: number | null,
    pageNum: number = 1,
    search: string = '',
    reset: boolean = false
  ) => {
    // Only the latest request may update state (a slow older response must not overwrite a newer one)
    const requestId = ++menuRequestId.current;
    try {
      if (pageNum === 1) {
        setItemsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      // Build filters
      const filters: MenuItemFilters & { search?: string } = {
        is_active: true,
        page: pageNum,
        limit: ITEMS_PER_PAGE,
      };

      if (categoryId !== null) {
        filters.category_id = categoryId;
      }

      if (search) {
        filters.search = search;
      }

      const menuResponse = await menuAPI.getItems(filters);
      if (requestId !== menuRequestId.current) return;

      // Handle response format (support both array and paginated object)
      let newItems: MenuItem[] = [];
      let totalItems = 0;

      if (Array.isArray(menuResponse)) {
        // Fallback for array response (shouldn't happen with updated API but good for safety)
        newItems = menuResponse;
        totalItems = menuResponse.length;
      } else {
        newItems = menuResponse.data || [];
        totalItems = menuResponse.total || 0;
      }

      if (reset) {
        setMenuItems(newItems);
      } else {
        setMenuItems(prev => [...prev, ...newItems]);
      }

      // Check if we have more items
      // If we got fewer items than limit, or if total items reached
      const currentCount = reset ? newItems.length : menuItems.length + newItems.length;
      setHasMore(newItems.length === ITEMS_PER_PAGE && currentCount < totalItems);

    } catch (err) {
      if (requestId !== menuRequestId.current) return;
      console.error('Failed to fetch menu items:', err);
      setError('Failed to load menu items');
    } finally {
      if (requestId === menuRequestId.current) {
        setItemsLoading(false);
        setIsLoadingMore(false);
      }
    }
  };

  const loadMoreItems = () => {
    if (!itemsLoading && !isLoadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMenuItems(selectedCategory, nextPage, searchTerm, false);
    }
  };

  // Handle category change
  const handleCategoryChange = useCallback((categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setSearchTerm(''); // Clear search when changing category
    setPage(1);
    fetchMenuItems(categoryId, 1, '', true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Removed local filtering since we now do server-side filtering
  const filteredItems = menuItems;

  // Add item to cart
  const addToCart = useCallback((
    item: MenuItem,
    quantity: number,
    specialInstructions?: string,
    removedIngredients?: string[],
    addedExtras?: string[]
  ) => {
    setCart(prevCart => {
      // If editing, replace the item at the specific index
      if (editingCartItemIndex !== null) {
        const newCart = [...prevCart];
        newCart[editingCartItemIndex] = {
          line_id: newCart[editingCartItemIndex]?.line_id ?? newLineId(),
          menu_item_id: item.id,
          name: item.name,
          price: Number(item.price),
          quantity: quantity,
          ...(specialInstructions && { special_instructions: specialInstructions }),
          ...(removedIngredients && removedIngredients.length > 0 && { removed_ingredients: removedIngredients }),
          ...(addedExtras && addedExtras.length > 0 && { added_extras: addedExtras }),
          originalItem: item
        };
        return newCart;
      }

      // Normal add logic
      const newKey = customizationKey(item.id, specialInstructions, removedIngredients, addedExtras);
      const existingItemIndex = prevCart.findIndex(cartItem =>
        customizationKey(
          cartItem.menu_item_id,
          cartItem.special_instructions,
          cartItem.removed_ingredients,
          cartItem.added_extras
        ) === newKey
      );

      if (existingItemIndex !== -1) {
        const newCart = [...prevCart];
        const existingItem = newCart[existingItemIndex]!;
        newCart[existingItemIndex] = {
          ...existingItem,
          quantity: existingItem.quantity + quantity
        };
        return newCart;
      } else {
        const newItem: CartItem = {
          line_id: newLineId(),
          menu_item_id: item.id,
          name: item.name,
          price: Number(item.price),
          quantity: quantity,
          ...(specialInstructions && { special_instructions: specialInstructions }),
          ...(removedIngredients && removedIngredients.length > 0 && { removed_ingredients: removedIngredients }),
          ...(addedExtras && addedExtras.length > 0 && { added_extras: addedExtras }),
          originalItem: item
        };
        return [...prevCart, newItem];
      }
    });

    // Reset editing state
    setEditingCartItemIndex(null);
  }, [editingCartItemIndex]);

  // Quick Add: Add item directly to cart when clicking
  const handleItemClick = useCallback((item: MenuItem) => {
    addToCart(item, 1);
  }, [addToCart]);

  // Customize: Open modal for customization
  const handleItemCustomize = useCallback((item: MenuItem) => {
    setSelectedItem(item);
    setEditingCartItemIndex(null); // Ensure we are not in edit mode
    setIsModalOpen(true);
  }, []);

  const handleEditCartItem = useCallback((index: number) => {
    const itemToEdit = cart[index];
    if (itemToEdit && itemToEdit.originalItem) {
      setSelectedItem(itemToEdit.originalItem);
      setEditingCartItemIndex(index);
      setIsModalOpen(true);
    }
  }, [cart]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setEditingCartItemIndex(null);
  }, []);

  const updateQuantity = useCallback((lineId: string, newQuantity: number) => {
    setCart(prevCart => {
      if (newQuantity <= 0) {
        return prevCart.filter(item => item.line_id !== lineId);
      } else {
        return prevCart.map(item =>
          item.line_id === lineId
            ? { ...item, quantity: newQuantity }
            : item
        );
      }
    });
  }, []);

  // Removing a line is easy to do by accident on a touch screen, so offer Undo instead of a confirm dialog
  const removeFromCart = useCallback((lineId: string) => {
    const index = cart.findIndex(item => item.line_id === lineId);
    const removed = cart[index];
    if (!removed) return;
    setCart(prevCart => prevCart.filter(item => item.line_id !== lineId));
    toast.info(t('cart.removed', { name: removed.name }), {
      actionLabel: t('cart.undo'),
      onAction: () => setCart(prevCart => {
        const next = [...prevCart];
        next.splice(Math.min(index, next.length), 0, removed);
        return next;
      }),
    });
  }, [cart, toast, t]);

  const clearCart = useCallback(() => {
    const previous = cart;
    if (previous.length === 0) return;
    setCart([]);
    toast.info(t('cart.cleared'), { actionLabel: t('cart.undo'), onAction: () => setCart(previous) });
  }, [cart, toast, t]);

  // Filter handlers
  const handleOrderTypeChange = useCallback((type: 'dine-in' | 'takeout' | 'delivery') => {
    setOrderType(type);
  }, []);

  const handleTableChange = useCallback((tableId: number) => {
    setSelectedTable(tableId);
  }, []);

  const handleCustomerNameChange = useCallback((name: string) => {
    setCustomerName(name);
  }, []);

  const handlePriorityChange = useCallback((newPriority: 'normal' | 'rush' | 'urgent') => {
    setPriority(newPriority);
  }, []);

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const submitOrder = async (paymentDecision?: PaymentDecision) => {
    if (cart.length === 0) {
      setError(t('order.errors.addItem'));
      return;
    }

    if (orderType === 'dine-in' && !selectedTable) {
      setError(t('order.errors.selectTable'));
      return;
    }

    // For takeout/delivery, offer to collect payment now
    if ((orderType === 'takeout' || orderType === 'delivery') && !paymentDecision) {
      setShowPaymentModal(true);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const orderData: QuickOrderPayload = {
        type: orderType,
        table_id: orderType === 'dine-in' ? Number(selectedTable) : undefined,
        customer_name: customerName || undefined,
        priority: priority,
        // The API resolves the signed-in waiter to a staff ID.
        items: cart.map(item => ({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          special_instructions: item.special_instructions || undefined,
          removed_ingredients: item.removed_ingredients && item.removed_ingredients.length > 0
            ? item.removed_ingredients
            : undefined,
          added_extras: item.added_extras && item.added_extras.length > 0
            ? item.added_extras
            : undefined,
        })),
      };

      const createdOrder = await orderAPI.createOrder(orderData);

      // The create endpoint ignores payment fields, so record the payment separately
      let paymentCollected = false;
      if (paymentDecision?.collectNow && paymentDecision.method) {
        try {
          await orderAPI.updatePayment(createdOrder.id, {
            payment_method: paymentDecision.method,
            payment_status: 'completed',
          });
          paymentCollected = true;
        } catch (paymentErr) {
          console.error('Order created but payment failed:', paymentErr);
        }
      }
      const paymentFailed = !!paymentDecision?.collectNow && !paymentCollected;
      const doneMessage = paymentCollected
        ? t('order.done.paid')
        : paymentFailed
          ? t('order.done.paymentFailed')
          : t('order.done.created');

      if (user?.role === 'waiter') {
        navigate('/tables', {
          state: {
            message: doneMessage
          }
        });
      } else {
        navigate('/orders', {
          state: {
            successMessage: doneMessage
          }
        });
      }
    } catch (err) {
      setError(errorMessage(err, t('order.errors.createFailed')));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = () => submitOrder();

  const handlePaymentDecision = (collectNow: boolean, method?: 'cash' | 'card') => {
    setShowPaymentModal(false);
    submitOrder({ collectNow, method });
  };

  const calculateTotal = useCallback(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cart]);

  const itemCount = cart.reduce((n, item) => n + item.quantity, 0);
  const subtotal = calculateTotal();
  const tableForSummary = tables.find(table => table.id === selectedTable);
  const typeLabel = t(orderType === 'dine-in' ? 'order.type.dineIn' : orderType === 'takeout' ? 'order.type.takeout' : 'order.type.delivery');
  const cartSummary = {
    typeLabel,
    tableLabel: orderType === 'dine-in' && tableForSummary ? t('order.tableNumber', { n: tableForSummary.number }) : undefined,
  };
  const placeLabel = orderType === 'dine-in' ? t('order.sendToKitchen') : t('order.placeOrder');

  // Show skeleton only during initial bootstrap
  if (loading) {
    return (
      <div className="grid gap-4 lg:grid-cols-[1fr_24rem]" role="status" aria-label={t('common.loading')}>
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const editingCartLine = editingCartItemIndex !== null ? cart[editingCartItemIndex] : undefined;

  const cartPanel = (
    <OrderCart
      cart={cart}
      onUpdateQuantity={updateQuantity}
      onRemoveItem={removeFromCart}
      onEditItem={(index) => { setCartSheetOpen(false); handleEditCartItem(index); }}
      onClear={clearCart}
      onPlaceOrder={() => { setCartSheetOpen(false); handleSubmit(); }}
      loading={submitting}
      placeLabel={placeLabel}
      summary={cartSummary}
    />
  );

  return (
    <div className="pb-24 lg:pb-0">
      {/* Title row */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-fg">{t('order.title')}</h1>
        <Button variant="secondary" size="md" onClick={() => navigate(user?.role === 'waiter' ? '/tables' : '/orders')}>
          {t('common.back')}
        </Button>
      </div>

      {error && (
        <div role="alert" className="mb-4 rounded-xl bg-danger/15 px-4 py-3 text-base font-medium text-danger">
          {error}
        </div>
      )}

      {/* Three zones: category rail | menu | cart. The rail and cart only appear when there is room. */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_24rem] xl:grid-cols-[11rem_minmax(0,1fr)_24rem]">
        {/* Category rail (wide screens) */}
        <aside className="hidden xl:block">
          <div className="sticky top-24">
            <CategoryTabs
              categories={categories}
              selectedCategory={selectedCategory}
              loading={itemsLoading}
              onCategoryChange={handleCategoryChange}
              orientation="vertical"
            />
          </div>
        </aside>

        {/* Menu */}
        <section className="min-w-0 space-y-4" aria-label={t('menu.title')}>
          <OrderFilters
            orderType={orderType}
            selectedTable={selectedTable}
            customerName={customerName}
            priority={priority}
            searchTerm={searchTerm}
            tables={tables}
            onOrderTypeChange={handleOrderTypeChange}
            onTableChange={handleTableChange}
            onCustomerNameChange={handleCustomerNameChange}
            onPriorityChange={handlePriorityChange}
            onSearchChange={handleSearchChange}
          />

          {/* Category chips (below xl the rail is hidden) */}
          <div className="xl:hidden">
            <CategoryTabs
              categories={categories}
              selectedCategory={selectedCategory}
              loading={itemsLoading}
              onCategoryChange={handleCategoryChange}
            />
          </div>

          <MenuItemsGrid
            items={filteredItems}
            loading={itemsLoading && page === 1}
            onAddToCart={handleItemClick}
            onCustomize={handleItemCustomize}
          />

          {hasMore && !itemsLoading && (
            <div className="flex justify-center pb-4">
              <Button variant="secondary" size="lg" loading={isLoadingMore} onClick={loadMoreItems}>
                {isLoadingMore ? t('common.loading') : t('menu.loadMore')}
              </Button>
            </div>
          )}
        </section>

        {/* Cart (lg and up): sticky beside the menu */}
        <aside
          className="sticky top-24 hidden max-h-[calc(100dvh-7rem)] overflow-hidden rounded-2xl border border-line shadow-sm lg:block"
          aria-label={t('cart.title')}
        >
          {cartPanel}
        </aside>
      </div>

      {/* Below lg: sticky summary bar that opens the cart as a bottom sheet */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface p-3 shadow-2xl lg:hidden">
        <Button size="xl" fullWidth onClick={() => setCartSheetOpen(true)}>
          <span className="flex w-full items-center justify-between gap-3">
            <span>{t('cart.viewCart')} · {t('cart.itemCount', { count: itemCount })}</span>
            <span className="tabular-nums">{formatMoney(subtotal)}</span>
          </span>
        </Button>
      </div>

      <Modal
        isOpen={cartSheetOpen}
        onClose={() => setCartSheetOpen(false)}
        title={t('cart.title')}
        size="lg"
        closeLabel={t('common.close')}
        className="h-[85dvh] max-h-[85dvh]"
      >
        <div className="-mx-5 -my-4 h-[calc(85dvh-5rem)]">{cartPanel}</div>
      </Modal>

      {/* Add Item Modal */}
      <AddItemModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={closeModal}
        onAdd={addToCart}
        initialValues={editingCartLine ? {
          quantity: editingCartLine.quantity,
          specialInstructions: editingCartLine.special_instructions,
          removedIngredients: editingCartLine.removed_ingredients,
          addedExtras: editingCartLine.added_extras
        } : undefined}
        mode={editingCartItemIndex !== null ? 'edit' : 'add'}
      />

      {/* Payment decision (takeout / delivery) */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title={t('order.payNow.title')}
        size="sm"
        closeLabel={t('common.close')}
      >
        <p className="mb-5 text-fg-muted">{t('order.payNow.hint', { type: typeLabel.toLowerCase() })}</p>
        <div className="space-y-3">
          <Button size="xl" fullWidth variant="success" onClick={() => handlePaymentDecision(true, 'cash')}>
            {t('order.payNow.cash')}
          </Button>
          <Button size="xl" fullWidth variant="primary" onClick={() => handlePaymentDecision(true, 'card')}>
            {t('order.payNow.card')}
          </Button>
          <Button size="xl" fullWidth variant="secondary" onClick={() => handlePaymentDecision(false)}>
            {t('order.payNow.later')}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
