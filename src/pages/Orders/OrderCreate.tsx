import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { menuAPI } from '@/api/menu';
import { orderAPI } from '@/api/orders';
import { tableAPI } from '@/api/tables';
import type { MenuItem } from '@/types/menu';
import type { Table } from '@/types/table';

interface CartItem {
  menu_item_id: number;
  name: string;
  price: number;
  quantity: number;
  special_instructions?: string;
}

export default function OrderCreate() {
  const navigate = useNavigate();
  const location = useLocation();
  const preSelectedTableId = location.state?.tableId;

  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedTable, setSelectedTable] = useState<number | ''>(preSelectedTableId || '');
  const [orderType, setOrderType] = useState<'dine-in' | 'takeout' | 'delivery'>('dine-in');
  const [customerName, setCustomerName] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [expandedCartItem, setExpandedCartItem] = useState<number | null>(null);
  const [tempNotes, setTempNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'digital-wallet' | ''>('');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed'>('pending');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [menuResponse, tablesResponse] = await Promise.all([
        menuAPI.getItems(),
        tableAPI.getTables()
      ]);

      const menuData = Array.isArray(menuResponse) ? menuResponse : menuResponse.data || [];
      const availableItems = menuData.filter((item: MenuItem) => item.is_active && item.is_available);
      setMenuItems(availableItems);

      const uniqueCategories = Array.from(
        new Map(
          availableItems
            .filter((item: MenuItem) => item.category)
            .map((item: MenuItem) => [item.category!.id, item.category])
        ).values()
      );
      setCategories(uniqueCategories);
      if (uniqueCategories.length > 0) {
        setSelectedCategory(uniqueCategories[0].id);
      }

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

  const getFilteredItems = () => {
    if (!selectedCategory) return menuItems;
    return menuItems.filter(item => item.categoryId === selectedCategory);
  };

  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find(cartItem => cartItem.menu_item_id === item.id);
    
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.menu_item_id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, {
        menu_item_id: item.id,
        name: item.name,
        price: Number(item.price),
        quantity: 1,
      }]);
    }
  };

  const updateQuantity = (menu_item_id: number, delta: number) => {
    setCart(cart.map(item => {
      if (item.menu_item_id === menu_item_id) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (menu_item_id: number) => {
    setCart(cart.filter(item => item.menu_item_id !== menu_item_id));
  };

  const toggleNotes = (menu_item_id: number) => {
    if (expandedCartItem === menu_item_id) {
      setExpandedCartItem(null);
      setTempNotes('');
    } else {
      const item = cart.find(i => i.menu_item_id === menu_item_id);
      setExpandedCartItem(menu_item_id);
      setTempNotes(item?.special_instructions || '');
    }
  };

  const saveNotes = (menu_item_id: number) => {
    setCart(cart.map(item =>
      item.menu_item_id === menu_item_id
        ? { ...item, special_instructions: tempNotes }
        : item
    ));
    setExpandedCartItem(null);
    setTempNotes('');
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleSubmit = async () => {
    if (cart.length === 0) {
      setError('Please add at least one item to the cart');
      return;
    }

    if (orderType === 'dine-in' && !selectedTable) {
      setError('Please select a table for dine-in orders');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const orderData: any = {
        type: orderType,
        table_id: orderType === 'dine-in' ? Number(selectedTable) : undefined,
        customer_name: customerName || undefined,
        payment_method: paymentMethod || undefined,
        payment_status: paymentStatus,
        items: cart.map(item => ({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          special_instructions: item.special_instructions || undefined,
        })),
      };

      await orderAPI.createOrder(orderData);
      
      navigate('/orders', { 
        state: { successMessage: 'Order created successfully!' }
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageMeta 
        title={`New Order - ${selectedTable ? `Table ${tables.find(t => t.id === selectedTable)?.number}` : 'No table'}`}
        description="Create a new order"
      />
      <PageBreadcrumb pageTitle={`New Order - ${selectedTable ? `Table ${tables.find(t => t.id === selectedTable)?.number}` : 'No table'}`} />

      <div className="p-4 sm:p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
              >
                <option value="dine-in">🍽️ Dine-in</option>
                <option value="takeout">🥡 Takeout</option>
                <option value="delivery">🚚 Delivery</option>
              </select>
            </div>

            {orderType === 'dine-in' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Table</label>
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                >
                  <option value="">Select table</option>
                  {tables.map(table => (
                    <option key={table.id} value={table.id}>
                      Table {table.number}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Name (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
              />
            </div>
          </div>

          {/* Payment Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
              >
                <option value="">Select method (optional)</option>
                <option value="cash">💵 Cash</option>
                <option value="card">💳 Card</option>
                <option value="digital-wallet">📱 Digital Wallet</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
              >
                <option value="pending">⏳ Pending</option>
                <option value="completed">✅ Completed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Categories</h2>
              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors font-medium ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                {categories.find(c => c.id === selectedCategory)?.name || 'Menu Items'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {getFilteredItems().map(item => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <span className="text-blue-600 font-bold text-lg">
                        {Number(item.price).toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={() => addToCart(item)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-base"
                    >
                      Quick Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-gray-900">Cart</h2>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Clear
                  </button>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  Cart is empty
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
                    {cart.map(item => (
                      <div key={item.menu_item_id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{item.name}</h4>
                            <p className="text-sm text-gray-600">
                              {item.price.toFixed(2)} MAD × {item.quantity}
                            </p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.menu_item_id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <button
                            onClick={() => updateQuantity(item.menu_item_id, -1)}
                            className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300 font-bold"
                          >
                            -
                          </button>
                          <span className="flex-1 text-center font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.menu_item_id, 1)}
                            className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300 font-bold"
                          >
                            +
                          </button>
                          <button
                            onClick={() => toggleNotes(item.menu_item_id)}
                            className="ml-2 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                          >
                            📝 Notes
                          </button>
                        </div>

                        {expandedCartItem === item.menu_item_id && (
                          <div className="mt-2">
                            <textarea
                              value={tempNotes}
                              onChange={(e) => setTempNotes(e.target.value)}
                              placeholder="Special instructions..."
                              rows={2}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              onClick={() => saveNotes(item.menu_item_id)}
                              className="mt-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Save Notes
                            </button>
                          </div>
                        )}

                        {item.special_instructions && expandedCartItem !== item.menu_item_id && (
                          <p className="text-sm text-gray-600 italic mt-1">
                            Note: {item.special_instructions}
                          </p>
                        )}

                        <div className="text-right font-bold text-blue-600">
                          {(item.price * item.quantity).toFixed(2)} MAD
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-xl font-bold mb-4">
                      <span>Total:</span>
                      <span className="text-blue-600">{calculateTotal().toFixed(2)} MAD</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => navigate('/orders')}
                        className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                        disabled={submitting}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? 'Creating...' : 'Create Order'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
