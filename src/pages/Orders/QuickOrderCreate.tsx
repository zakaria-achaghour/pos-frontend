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

interface CartItem {
  menu_item_id: number;
  name: string;
  price: number;
  quantity: number;
  special_instructions?: string;
  removed_ingredients?: string[];
  added_extras?: string[];
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
  
  // UI states
  const [loading, setLoading] = useState(true); // Initial bootstrap only
  const [itemsLoading, setItemsLoading] = useState(false); // Category/item fetching
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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
      await fetchMenuItems(null);

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

  const fetchMenuItems = async (categoryId: number | null) => {
    try {
      setItemsLoading(true); // Use separate flag for item fetching
      
      // Build filters
      const filters: any = {
        is_active: true, // Only get active items
      };
      
      // Add category filter if specific category is selected
      if (categoryId !== null) {
        filters.category_id = categoryId;
      }
      
      const menuResponse = await menuAPI.getItems(filters);
      const menuData = menuResponse.data || [];
      
      setMenuItems(menuData);
    } catch (err) {
      console.error('Failed to fetch menu items:', err);
      setError('Failed to load menu items');
    } finally {
      setItemsLoading(false);
    }
  };

  // Handle category change
  const handleCategoryChange = useCallback((categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setSearchTerm(''); // Clear search when changing category
    fetchMenuItems(categoryId);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredItems = useMemo(() => {
    let filtered = menuItems;
    
    // Search filter (local filtering on already fetched items)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [menuItems, searchTerm]);

  // Open modal when clicking on item
  const handleItemClick = useCallback((item: MenuItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  }, []);

  // Add item to cart from modal
  const addToCart = useCallback((
    item: MenuItem, 
    quantity: number, 
    specialInstructions?: string,
    removedIngredients?: string[],
    addedExtras?: string[]
  ) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => 
        cartItem.menu_item_id === item.id && 
        cartItem.special_instructions === specialInstructions &&
        JSON.stringify(cartItem.removed_ingredients) === JSON.stringify(removedIngredients) &&
        JSON.stringify(cartItem.added_extras) === JSON.stringify(addedExtras)
      );

      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.menu_item_id === item.id && 
          cartItem.special_instructions === specialInstructions &&
          JSON.stringify(cartItem.removed_ingredients) === JSON.stringify(removedIngredients) &&
          JSON.stringify(cartItem.added_extras) === JSON.stringify(addedExtras)
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      } else {
        const newItem: CartItem = {
          menu_item_id: item.id,
          name: item.name,
          price: Number(item.price),
          quantity: quantity,
          ...(specialInstructions && { special_instructions: specialInstructions }),
          ...(removedIngredients && removedIngredients.length > 0 && { removed_ingredients: removedIngredients }),
          ...(addedExtras && addedExtras.length > 0 && { added_extras: addedExtras })
        };
        return [...prevCart, newItem];
      }
    });
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedItem(null);
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

      navigate('/orders', {
        state: { 
          successMessage: collectPaymentNow 
            ? 'Order created and payment collected!' 
            : 'Order created successfully!' 
        }
      });
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
          <div className="flex-1 overflow-y-auto p-4 pb-24 md:pb-4">
            <MenuItemsGrid 
              items={filteredItems}
              loading={itemsLoading}
              onAddToCart={handleItemClick}
            />
          </div>
        </div>

        {/* Right: Cart - Hidden on mobile, visible on desktop */}
        <div className="hidden md:flex md:w-[360px] lg:w-[400px] flex-shrink-0 h-full bg-white">
          <OrderCart
            cart={cart}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
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
      />

      {/* Payment Collection Modal (for takeout/delivery) */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
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
