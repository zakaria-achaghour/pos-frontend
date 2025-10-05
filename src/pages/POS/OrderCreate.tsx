import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '../../context/AuthContext';
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
}

export default function OrderCreate() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

  const addToCart = (item: Item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity === 0) {
      setCart(cart.filter(item => item.id !== id));
    } else {
      setCart(cart.map(item =>
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
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
        items: cart.map(item => ({
          menu_item_id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-left"
                >
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-blue-600 font-semibold">{item.price.toFixed(2)} MAD</div>
                </button>
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
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-xs text-gray-600">{item.price.toFixed(2)} MAD</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-full bg-gray-300 text-gray-700 hover:bg-gray-400 flex items-center justify-center text-sm"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-full bg-blue-500 text-white hover:bg-blue-600 flex items-center justify-center text-sm"
                        >
                          +
                        </button>
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