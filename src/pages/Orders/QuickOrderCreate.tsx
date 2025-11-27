import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import type { MenuItem } from '@/types/menu';
import type { Table } from '@/types/table';
import { MODAL_BACKDROP_CLASS, MODAL_OVERLAY_BASE_CLASS } from '@/utils/modalStyles';

interface CartItem {
  menu_item_id: number;
  name: string;
  price: number;
  quantity: number;
  special_instructions?: string;
  removed_ingredients?: string[];
  added_extras?: string[];
  originalItem: MenuItem;
}

export default function QuickOrderCreate() {
  const navigate = useNavigate();
  const location = useLocation();
  const preSelectedTableId = location.state?.tableId;
  const { user } = useAuth(); // Get current user (waiter/cashier/manager/owner)

  // Data states
  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);

  // Order states
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedTable, setSelectedTable] = useState<number | ''>(preSelectedTableId || '');
  const [orderType, setOrderType] = useState<'dine-in' | 'takeout' | 'delivery'>('dine-in');
  const [customerName, setCustomerName] = useState('');
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [cart, setCart] = useState<CartItem[]>([]);

  const [searchTerm, setSearchTerm] = useState('');

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
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | null>(null);
  const [collectPaymentNow, setCollectPaymentNow] = useState(false);

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
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
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
    try {
      if (pageNum === 1) {
        setItemsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      // Build filters
      const filters: any = {
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
      console.error('Failed to fetch menu items:', err);
      setError('Failed to load menu items');
    } finally {
      setItemsLoading(false);
      setIsLoadingMore(false);
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
      const existingItemIndex = prevCart.findIndex(cartItem =>
        cartItem.menu_item_id === item.id &&
        cartItem.special_instructions === specialInstructions &&
        JSON.stringify(cartItem.removed_ingredients) === JSON.stringify(removedIngredients) &&
        JSON.stringify(cartItem.added_extras) === JSON.stringify(addedExtras)
      );

      if (existingItemIndex !== -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: newCart[existingItemIndex].quantity + quantity
        };
        return newCart;
      } else {
        const newItem: CartItem = {
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

  const updateQuantity = useCallback((menu_item_id: number, newQuantity: number) => {
    setCart(prevCart => {
      if (newQuantity <= 0) {
        return prevCart.filter(item => item.menu_item_id !== menu_item_id);
      } else {
        return prevCart.map(item =>
          item.menu_item_id === menu_item_id
            ? { ...item, quantity: newQuantity }
            : item
        );
      }
    });
  }, []);

  const removeFromCart = useCallback((menu_item_id: number) => {
    setCart(prevCart => prevCart.filter(item => item.menu_item_id !== menu_item_id));
  }, []);

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

  const handlePriorityChange = useCallback((newPriority: 'normal' | 'high' | 'urgent') => {
    setPriority(newPriority);
  }, []);

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleSubmit = async () => {
    if (cart.length === 0) {
      setError('Please add at least one item');
      return;
    }

    if (orderType === 'dine-in' && !selectedTable) {
      setError('Please select a table');
      return;
    }

    // For takeout/delivery, offer to collect payment now
    if ((orderType === 'takeout' || orderType === 'delivery') && !collectPaymentNow) {
      setShowPaymentModal(true);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const orderData: any = {
        type: orderType,
        table_id: orderType === 'dine-in' ? Number(selectedTable) : undefined,
        customer_name: customerName || undefined,
        priority: priority,
        waiter_id: user?.id,
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

      // If payment collected now, include payment info
      if (collectPaymentNow && paymentMethod) {
        orderData.payment_method = paymentMethod;
        orderData.paid_at = new Date().toISOString();
      }

      await orderAPI.createOrder(orderData);

      if (user?.role === 'waiter') {
        navigate('/tables', {
          state: {
            message: collectPaymentNow
              ? 'Order created and payment collected!'
              : 'Order created successfully!'
          }
        });
      } else {
        navigate('/orders', {
          state: {
            successMessage: collectPaymentNow
              ? 'Order created and payment collected!'
              : 'Order created successfully!'
          }
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentDecision = (collectNow: boolean, method?: 'cash' | 'card') => {
    setCollectPaymentNow(collectNow);
    setPaymentMethod(method || null);
    setShowPaymentModal(false);

    if (collectNow) {
      // Proceed with order creation including payment
      handleSubmit();
    } else {
      // Proceed without payment (pay later)
      handleSubmit();
    }
  };

  const calculateTotal = useCallback(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cart]);

  // Show spinner only during initial bootstrap
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header Bar */}
      <div className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Quick Order</h1>
          <button
            onClick={() => navigate('/orders')}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-3 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Menu Items */}
        <div className="flex-1 flex flex-col bg-white border-r overflow-hidden">
          {/* Search & Categories */}
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

          {/* Category Tabs */}
          <CategoryTabs
            categories={categories}
            selectedCategory={selectedCategory}
            loading={itemsLoading}
            onCategoryChange={handleCategoryChange}
          />

          {/* Menu Items Grid */}
          <div className="flex-1 overflow-y-auto p-4 pb-24 md:pb-4" id="menu-items-container">
            <MenuItemsGrid
              items={filteredItems}
              loading={itemsLoading && page === 1}
              onAddToCart={handleItemClick}
              onCustomize={handleItemCustomize}
            />

            {/* Load More Button */}
            {hasMore && !itemsLoading && (
              <div className="mt-6 flex justify-center pb-4">
                <button
                  onClick={loadMoreItems}
                  disabled={isLoadingMore}
                  className="px-6 py-2 bg-white border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoadingMore ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                      Loading...
                    </>
                  ) : (
                    'Load More Items'
                  )}
                </button>
              </div>
            )}

            {!hasMore && filteredItems.length > 0 && (
              <div className="mt-6 text-center text-sm text-gray-500 pb-4">
                No more items to load
              </div>
            )}
          </div>
        </div>

        {/* Right: Cart - Hidden on mobile, visible on desktop */}
        <div className="hidden md:flex md:w-[360px] lg:w-[400px] flex-shrink-0 h-full bg-white">
          <OrderCart
            cart={cart}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
            onEditItem={handleEditCartItem}
            onPlaceOrder={handleSubmit}
            loading={submitting}
          />
        </div>
      </div>

      {/* Mobile: Fixed Bottom Cart Summary & Place Order Button - OUTSIDE flex container */}
      <div className="block md:hidden fixed inset-x-0 bottom-0 bg-white border-t-2 border-gray-200 shadow-2xl z-[9999] safe-area-inset-bottom">
        <div className="p-4 pb-safe">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold">
                {cart.reduce((total, item) => total + item.quantity, 0)}
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {cart.length} {cart.length === 1 ? 'Item' : 'Items'}
              </span>
            </div>
            <span className="text-lg font-bold text-blue-600">
              {calculateTotal().toFixed(2)} MAD
            </span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={cart.length === 0 || submitting}
            className="w-full bg-blue-600 text-white py-3.5 rounded-lg font-bold text-base hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-lg"
          >
            {submitting ? 'Processing...' : 'Place Order'}
          </button>
        </div>
      </div>

      {/* Add Item Modal */}
      <AddItemModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={closeModal}
        onAdd={addToCart}
        initialValues={editingCartItemIndex !== null ? {
          quantity: cart[editingCartItemIndex].quantity,
          specialInstructions: cart[editingCartItemIndex].special_instructions,
          removedIngredients: cart[editingCartItemIndex].removed_ingredients,
          addedExtras: cart[editingCartItemIndex].added_extras
        } : undefined}
        mode={editingCartItemIndex !== null ? 'edit' : 'add'}
      />

      {/* Payment Collection Modal (for takeout/delivery) */}
      {showPaymentModal && (
        <div className={`${MODAL_OVERLAY_BASE_CLASS} ${MODAL_BACKDROP_CLASS} z-[10000]`}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Collect Payment Now?
            </h3>
            <p className="text-gray-600 mb-6">
              For {orderType} orders, you can collect payment immediately or let the customer pay later.
            </p>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => handlePaymentDecision(true, 'cash')}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                💵 Collect Cash Now
              </button>
              <button
                onClick={() => handlePaymentDecision(true, 'card')}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                💳 Collect Card Payment Now
              </button>
              <button
                onClick={() => handlePaymentDecision(false)}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                ⏳ Collect Payment Later
              </button>
            </div>

            <button
              onClick={() => setShowPaymentModal(false)}
              className="w-full text-gray-500 hover:text-gray-700 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
