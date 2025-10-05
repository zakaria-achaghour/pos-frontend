import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import Button from '../../components/ui/button/Button';
import { getUser } from '../../app/auth';

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

// Enhanced mock data with kitchen status
const mockOrderDetails = {
  id: 1,
  table_name: 'Table 3',
  table_id: 3,
  status: 'open',
  total: 245.50,
  created_at: '2024-10-04 14:30',
  waiter_name: 'John Doe',
  items: [
    { id: 1, name: 'Caesar Salad', quantity: 2, price: 85.00, line_total: 170.00, kitchen_status: 'ready', special_notes: '' },
    { id: 2, name: 'Orange Juice', quantity: 3, price: 25.00, line_total: 75.00, kitchen_status: 'served', special_notes: 'Extra ice' },
    { id: 3, name: 'Grilled Chicken', quantity: 1, price: 150.00, line_total: 150.00, kitchen_status: 'preparing', special_notes: 'Well done' },
  ]
};

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  line_total: number;
  kitchen_status: 'pending' | 'preparing' | 'ready' | 'served';
  special_notes?: string;
}

interface Order {
  id: number;
  table_name: string;
  table_id: number;
  status: 'open' | 'paid';
  total: number;
  created_at: string;
  waiter_name: string;
  items: OrderItem[];
}

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  const user = getUser();

  // Get kitchen status styling
  const getKitchenStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'served':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getKitchenStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'preparing':
        return '👨‍🍳';
      case 'ready':
        return '✅';
      case 'served':
        return '🍽️';
      default:
        return '❓';
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await api.get(`/orders/${id}`);
      // setOrder(response.data);
      
      setTimeout(() => {
        setOrder({ ...mockOrderDetails, id: parseInt(id || '1') });
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error fetching order:', error);
      setLoading(false);
    }
  };

  const handleCloseOrder = async () => {
    try {
      setClosing(true);
      // TODO: Replace with actual API call
      // await api.post(`/orders/${id}/close`, {
      //   method: 'cash',
      //   amount: order?.total
      // });
      
      setTimeout(() => {
        if (order) {
          setOrder({ ...order, status: 'paid' });
        }
        setClosing(false);
      }, 1000);
    } catch (error) {
      console.error('Error closing order:', error);
      setClosing(false);
    }
  };

  const canCloseOrder = () => {
    return order?.status === 'open' && 
           user && 
           ['owner', 'manager', 'cashier'].includes(user.role);
  };

  if (loading) {
    return (
      <div>
        <PageMeta title="Order Details | POS System" description="View order details" />
        <PageBreadcrumb pageTitle="Order Details" />
        <div className="space-y-6 animate-pulse">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/5"></div>
              <div className="h-4 bg-gray-200 rounded w-1/6"></div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div>
        <PageMeta title="Order Details | POS System" description="View order details" />
        <PageBreadcrumb pageTitle="Order Details" />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Order not found</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageMeta title={`Order #${order.id} | POS System`} description="View order details" />
      <PageBreadcrumb pageTitle={`Order #${order.id}`} />
      
      <div className="space-y-6">
        {/* Order Header */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Order #{order.id}</h2>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              order.status === 'open' 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Table:</span>
              <p className="font-medium">{order.table_name}</p>
            </div>
            <div>
              <span className="text-gray-500">Time:</span>
              <p className="font-medium">{order.created_at}</p>
            </div>
            <div>
              <span className="text-gray-500">Total:</span>
              <p className="font-bold text-lg">{order.total.toFixed(2)} MAD</p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Items</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getKitchenStatusColor(item.kitchen_status)}`}>
                          {getKitchenStatusIcon(item.kitchen_status)} {item.kitchen_status.charAt(0).toUpperCase() + item.kitchen_status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{item.price.toFixed(2)} MAD each</p>
                      {item.special_notes && (
                        <p className="text-sm text-blue-600 mt-1">
                          <span className="font-medium">Note:</span> {item.special_notes}
                        </p>
                      )}
                    </div>
                    <div className="text-center min-w-[80px]">
                      <span className="text-gray-600 text-lg">× {item.quantity}</span>
                    </div>
                    <div className="text-right min-w-[120px]">
                      <span className="font-semibold text-lg">{item.line_total.toFixed(2)} MAD</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 pt-6 mt-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-600">Order Total:</span>
                <span className="text-2xl font-bold text-green-600">{order.total.toFixed(2)} MAD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Waiter Actions */}
        {user?.role === 'waiter' && order.status === 'open' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Waiter Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => navigate(`/orders/new?table=${order.table_id}&tableName=${encodeURIComponent(order.table_name)}`)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                ➕ Add More Items
              </Button>
              <Button
                onClick={() => showToast('Kitchen notified about table status', 'info')}
                variant="outline"
              >
                📞 Call Kitchen
              </Button>
              <Button
                onClick={() => {
                  showToast('Order ticket reprinted', 'success');
                }}
                variant="outline"
              >
                🖨️ Re-print Ticket
              </Button>
            </div>
          </div>
        )}

        {/* Actions */}
        {canCloseOrder() && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Actions</h3>
            <div className="flex gap-3">
              <Button
                onClick={handleCloseOrder}
                disabled={closing}
                className="bg-green-600 hover:bg-green-700"
              >
                {closing ? 'Processing...' : '💵 Cash Payment'}
              </Button>
              <Button
                onClick={() => {
                  showToast('Card payment processed', 'success');
                  handleCloseOrder();
                }}
                disabled={closing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                💳 Card Payment
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}