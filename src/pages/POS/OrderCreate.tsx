import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '../../hooks/useAuthRedux';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import Button from '../../components/ui/button/Button';

// Toast notification function
const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white font-medium transition-all ${
    type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
  }`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    if (document.body.contains(toast)) {
      document.body.removeChild(toast);
    }
  }, 3000);
};

// Mock data
const mockCategories = [
  { id: 1, name: 'Appetizers' },
  { id: 2, name: 'Main Courses' },
  { id: 3, name: 'Desserts' },
  { id: 4, name: 'Beverages' },
];

const mockItems = [
  { id: 1, name: 'Caesar Salad', price: 85.00, category_id: 1 },
  { id: 2, name: 'Bruschetta', price: 65.00, category_id: 1 },
  { id: 3, name: 'Grilled Chicken', price: 150.00, category_id: 2 },
  { id: 4, name: 'Pasta Carbonara', price: 120.00, category_id: 2 },
  { id: 5, name: 'Chocolate Cake', price: 65.00, category_id: 3 },
  { id: 6, name: 'Orange Juice', price: 25.00, category_id: 4 },
];

interface Category {
  id: number;
  name: string;
}

interface Item {
  id: number;
  name: string;
  price: number;
  category_id: number;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export default function OrderCreate() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [tempNotes, setTempNotes] = useState<string>('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get('table');
  const tableName = searchParams.get('tableName') || `Table ${tableId}`;

  // Redirect if no table is selected for waiters
  useEffect(() => {
    if (user?.role === 'waiter' && !tableId) {
      navigate('/tables');
    }
  }, [user, tableId, navigate]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchItems();
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await api.get('/categories');
      setTimeout(() => {
        setCategories(mockCategories);
        setLoading(false);
        setSelectedCategory(mockCategories[0]?.id || null);
      }, 800);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await api.get(`/items?category_id=${selectedCategory}`);
      const filteredItems = mockItems.filter(item => item.category_id === selectedCategory);
      setItems(filteredItems);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const addToCart = (item: Item, notes: string = '') => {
    const existingItem = cart.find((cartItem: CartItem) => cartItem.id === item.id && cartItem.notes === notes);
    if (existingItem) {
      setCart(cart.map((cartItem: CartItem) =>
        cartItem.id === item.id && cartItem.notes === notes
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1, notes }]);
    }
    // Reset the expanded state after adding to cart
    setExpandedItem(null);
    setTempNotes('');
  };

  const toggleItemExpansion = (itemId: number) => {
    if (expandedItem === itemId) {
      setExpandedItem(null);
      setTempNotes('');
    } else {
      setExpandedItem(itemId);
      setTempNotes('');
    }
  };

  const updateQuantity = (cartIndex: number, quantity: number) => {
    if (quantity === 0) {
      setCart(cart.filter((_, index) => index !== cartIndex));
    } else {
      setCart(cart.map((item: CartItem, index) =>
        index === cartIndex ? { ...item, quantity } : item
      ));
    }
  };

  const getTotal = () => {
    return cart.reduce((total: number, item: CartItem) => total + (item.price * item.quantity), 0);
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      showToast('Please add items to the cart before placing order', 'error');
      return;
    }

    try {
      setSubmitting(true);
      
      // TODO: Replace with actual API calls
      const orderData = {
        table_id: tableId,
        table_name: tableName,
        waiter_id: user?.role === 'waiter' ? user.id : null,
        waiter_name: user?.name,
        items: cart.map((item: CartItem) => ({
          menu_item_id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes || ''
        })),
        total: getTotal(),
        status: 'pending'
      };
      
      console.log('Creating order:', orderData);
      
      // Simulate API calls
      setTimeout(() => {
        const orderId = Math.floor(Math.random() * 1000) + 100;
        
        showToast(`Order #${orderId} created successfully! 🍽️`, 'success');
        
        // For waiters, redirect back to tables after successful order
        if (user?.role === 'waiter') {
          navigate('/tables', { 
            state: { 
              message: `Order #${orderId} created successfully for ${tableName}! 🎉`,
              type: 'success'
            }
          });
        } else {
          navigate(`/orders/${orderId}`);
        }
      }, 1000);
    } catch (error) {
      console.error('Error placing order:', error);
      showToast('Failed to create order. Please try again.', 'error');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageMeta title="New Order | POS System" description="Create new order" />
        <PageBreadcrumb pageTitle="New Order" />
        <div className="animate-pulse">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3">
              <div className="bg-gray-200 h-64 rounded-xl"></div>
            </div>
            <div className="col-span-6">
              <div className="bg-gray-200 h-64 rounded-xl"></div>
            </div>
            <div className="col-span-3">
              <div className="bg-gray-200 h-64 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageMeta title={`New Order - ${tableName} | POS System`} description="Create new order" />
      <PageBreadcrumb pageTitle={`New Order - ${tableName}`} />
      
      {/* Table Information Header */}
      {tableId && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-blue-900">🍽️ {tableName}</h2>
              <p className="text-blue-700">Creating order for {tableName}</p>
              {user?.role === 'waiter' && (
                <p className="text-sm text-blue-600">Waiter: {user.name}</p>
              )}
            </div>
            <button
              onClick={() => navigate('/tables')}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              Change Table
            </button>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-12 gap-4">
        {/* Categories - Left Column */}
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Items - Middle Column */}
        <div className="col-span-12 lg:col-span-6">
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="text-lg font-semibold mb-4">
              {categories.find(c => c.id === selectedCategory)?.name || 'Items'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  {/* Item Header */}
                  <div className="p-4">
                    <div className="font-medium text-gray-900 mb-1">{item.name}</div>
                    <div className="text-blue-600 font-semibold mb-3">{item.price.toFixed(2)} MAD</div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => addToCart(item, '')}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        Quick Add
                      </button>
                      <button
                        onClick={() => toggleItemExpansion(item.id)}
                        className={`px-3 py-2 text-sm rounded transition-colors ${
                          expandedItem === item.id 
                            ? 'bg-orange-100 text-orange-700 border border-orange-300' 
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {expandedItem === item.id ? '📝 Close' : '📝 Notes'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Notes Section */}
                  {expandedItem === item.id && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quick Options
                        </label>
                        <div className="flex flex-wrap gap-1">
                          {['Extra cheese', 'No tomatoes', 'No onions', 'Well done', 'Medium rare', 'Spicy'].map((option) => (
                            <button
                              key={option}
                              onClick={() => setTempNotes(prev => 
                                prev ? `${prev}, ${option}` : option
                              )}
                              className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Custom Notes
                        </label>
                        <textarea
                          value={tempNotes}
                          onChange={(e: any) => setTempNotes(e.target.value)}
                          placeholder="Add special instructions..."
                          className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                          rows={2}
                        />
                      </div>
                      
                      <button
                        onClick={() => addToCart(item, tempNotes.trim())}
                        className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                      >
                        Add with Notes
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cart - Right Column */}
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-white rounded-xl shadow p-4 sticky top-4">
            <h3 className="text-lg font-semibold mb-4">Cart</h3>
            
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Cart is empty</p>
            ) : (
              <>
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {cart.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="p-2 bg-gray-50 rounded">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-xs text-gray-600">{item.price.toFixed(2)} MAD</div>
                          {item.notes && (
                            <div className="text-xs text-orange-600 mt-1 italic">📝 {item.notes}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(index, item.quantity - 1)}
                            className="w-6 h-6 rounded-full bg-gray-300 text-gray-700 hover:bg-gray-400 flex items-center justify-center text-sm"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(index, item.quantity + 1)}
                            className="w-6 h-6 rounded-full bg-blue-500 text-white hover:bg-blue-600 flex items-center justify-center text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold mb-4">
                    <span>Total:</span>
                    <span>{getTotal().toFixed(2)} MAD</span>
                  </div>
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={submitting || cart.length === 0}
                    className="w-full"
                  >
                    {submitting ? 'Placing Order...' : 'Place Order'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}