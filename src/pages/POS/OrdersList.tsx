import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { useAuth } from '../../hooks/useAuthRedux';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import Button from '../../components/ui/button/Button';

// Mock data with enhanced order information for cashiers
const mockOrders = [
  { 
    id: 1, 
    table_name: 'Table 1', 
    total: 245.50, 
    status: 'ready_to_pay', 
    created_at: '2024-10-04 14:30',
    waiter_name: 'John Doe',
    items_count: 3
  },
  { 
    id: 2, 
    table_name: 'Table 3', 
    total: 189.00, 
    status: 'paid', 
    created_at: '2024-10-04 13:15',
    waiter_name: 'Jane Smith',
    payment_method: 'Card',
    items_count: 2
  },
  { 
    id: 3, 
    table_name: 'Table 5', 
    total: 312.75, 
    status: 'preparing', 
    created_at: '2024-10-04 15:45',
    waiter_name: 'John Doe',
    items_count: 5
  },
  { 
    id: 4, 
    table_name: 'Table 2', 
    total: 156.25, 
    status: 'ready_to_pay', 
    created_at: '2024-10-04 12:00',
    waiter_name: 'Alice Johnson',
    items_count: 2
  },
];

interface Order {
  id: number;
  table_name: string;
  total: number;
  status: 'preparing' | 'ready_to_pay' | 'paid';
  created_at: string;
  waiter_name: string;
  payment_method?: string;
  items_count: number;
}

export default function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState<number | null>(null);
  const [activeStatus, setActiveStatus] = useState<'preparing' | 'ready_to_pay' | 'paid' | 'all'>('ready_to_pay');
  const { user } = useAuth();
  const location = useLocation();
  const successMessage = location.state?.message;

  // For cashiers, default to orders ready for payment
  useEffect(() => {
    if (user?.role === 'cashier') {
      setActiveStatus('ready_to_pay');
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [activeStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await api.get(`/orders?status=${activeStatus === 'all' ? '' : activeStatus}`);
      
      setTimeout(() => {
        const filteredOrders = activeStatus === 'all' 
          ? mockOrders 
          : mockOrders.filter(order => order.status === activeStatus);
        setOrders(filteredOrders);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const processPayment = async (orderId: number, paymentMethod: 'cash' | 'card') => {
    try {
      setProcessingPayment(orderId);
      
      // TODO: Replace with actual API call
      // await api.post(`/orders/${orderId}/payment`, { payment_method: paymentMethod });
      
      // Simulate payment processing
      setTimeout(() => {
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
              ? { ...order, status: 'paid' as const, payment_method: paymentMethod }
              : order
          )
        );
        setProcessingPayment(null);
      }, 1500);
    } catch (error) {
      console.error('Error processing payment:', error);
      setProcessingPayment(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'inline-block px-2 py-1 rounded-full text-xs font-medium';
    if (status === 'preparing') {
      return `${baseClasses} bg-blue-100 text-blue-800`;
    }
    if (status === 'ready_to_pay') {
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    }
    if (status === 'paid') {
      return `${baseClasses} bg-green-100 text-green-800`;
    }
    return `${baseClasses} bg-gray-100 text-gray-800`;
  };

  if (loading) {
    return (
      <div>
        <PageMeta title="Orders | POS System" description="Manage orders" />
        <PageBreadcrumb pageTitle="Orders" />
        <div className="bg-white rounded-xl shadow p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getCashierStats = () => {
    const readyToPay = orders.filter(o => o.status === 'ready_to_pay').length;
    const totalRevenue = orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.filter(o => o.status === 'paid').length;
    
    return { readyToPay, totalRevenue, totalOrders };
  };

  const getPageTitle = () => {
    if (user?.role === 'cashier') {
      return 'Payment Processing';
    }
    return 'Orders';
  };

  return (
    <div>
      <PageMeta title={`${getPageTitle()} | POS System`} description="Manage orders and payments" />
      <PageBreadcrumb pageTitle={getPageTitle()} />
      
      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">✅ {successMessage}</p>
        </div>
      )}
      
      {/* Cashier Welcome */}
      {user?.role === 'cashier' && (
        <div className="mb-6 space-y-4">
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">💰</span>
              <div>
                <p className="text-orange-800 font-medium">Welcome {user.name}!</p>
                <p className="text-orange-700 text-sm">Process payments and manage customer transactions below.</p>
              </div>
            </div>
          </div>
          
          {/* Cashier Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-800">{getCashierStats().readyToPay}</div>
              <div className="text-sm text-yellow-600">Ready to Pay</div>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-800">{getCashierStats().totalRevenue.toFixed(2)} MAD</div>
              <div className="text-sm text-green-600">Revenue Today</div>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-800">{getCashierStats().totalOrders}</div>
              <div className="text-sm text-blue-600">Orders Completed</div>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">{getPageTitle()}</h2>
            {user?.role === 'cashier' ? (
              <Link to="/tables">
                <Button>🍽️ Select Table & Create Order</Button>
              </Link>
            ) : (
              <Link to="/orders/new">
                <Button>New Order</Button>
              </Link>
            )}
          </div>
          
          {/* Status Tabs - Cashier focused */}
          <div className="flex gap-2">
            {(user?.role === 'cashier' ? [
              { key: 'ready_to_pay', label: '💳 Ready to Pay', priority: true },
              { key: 'preparing', label: '🍳 Preparing' },
              { key: 'paid', label: '✅ Paid' },
              { key: 'all', label: 'All' }
            ] : [
              { key: 'preparing', label: 'Preparing' },
              { key: 'ready_to_pay', label: 'Ready to Pay' },
              { key: 'paid', label: 'Paid' },
              { key: 'all', label: 'All' }
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveStatus(tab.key as 'preparing' | 'ready_to_pay' | 'paid' | 'all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeStatus === tab.key
                    ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                } ${
                  tab.priority && user?.role === 'cashier' ? 'ring-2 ring-orange-200' : ''
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Order #</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Table</th>
                    {user?.role === 'cashier' && (
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Waiter</th>
                    )}
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Items</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Total</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Time</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900 font-medium">#{order.id}</td>
                      <td className="py-3 px-4 text-gray-900">{order.table_name}</td>
                      {user?.role === 'cashier' && (
                        <td className="py-3 px-4 text-gray-600">{order.waiter_name}</td>
                      )}
                      <td className="py-3 px-4 text-gray-600">{order.items_count} items</td>
                      <td className="py-3 px-4 text-gray-900 font-semibold">{order.total.toFixed(2)} MAD</td>
                      <td className="py-3 px-4">
                        <span className={getStatusBadge(order.status)}>
                          {order.status === 'ready_to_pay' ? 'Ready to Pay' : 
                           order.status === 'preparing' ? 'Preparing' :
                           order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        {order.payment_method && (
                          <div className="text-xs text-gray-500 mt-1">
                            💳 {order.payment_method}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">{order.created_at}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/orders/${order.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View
                          </Link>
                          {user?.role === 'cashier' && order.status === 'ready_to_pay' && (
                            <div className="flex space-x-1">
                              <button
                                onClick={() => processPayment(order.id, 'cash')}
                                disabled={processingPayment === order.id}
                                className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 disabled:opacity-50"
                              >
                                {processingPayment === order.id ? '...' : '💵 Cash'}
                              </button>
                              <button
                                onClick={() => processPayment(order.id, 'card')}
                                disabled={processingPayment === order.id}
                                className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:opacity-50"
                              >
                                {processingPayment === order.id ? '...' : '💳 Card'}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}