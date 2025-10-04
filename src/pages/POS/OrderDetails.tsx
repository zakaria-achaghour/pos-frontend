import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import Button from '../../components/ui/button/Button';
import { getUser } from '../../app/auth';

// Mock data
const mockOrderDetails = {
  id: 1,
  table_name: 'Table 3',
  status: 'open',
  total: 245.50,
  created_at: '2024-10-04 14:30',
  items: [
    { id: 1, name: 'Caesar Salad', quantity: 2, price: 85.00, line_total: 170.00 },
    { id: 2, name: 'Orange Juice', quantity: 3, price: 25.00, line_total: 75.00 },
  ]
};

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  line_total: number;
}

interface Order {
  id: number;
  table_name: string;
  status: 'open' | 'paid';
  total: number;
  created_at: string;
  items: OrderItem[];
}

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  const user = getUser();

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
                <div key={item.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-500">{item.price.toFixed(2)} MAD each</p>
                  </div>
                  <div className="text-center min-w-[60px]">
                    <span className="text-gray-600">× {item.quantity}</span>
                  </div>
                  <div className="text-right min-w-[100px]">
                    <span className="font-semibold">{item.line_total.toFixed(2)} MAD</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span>{order.total.toFixed(2)} MAD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {canCloseOrder() && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <Button
              onClick={handleCloseOrder}
              disabled={closing}
              className="bg-green-600 hover:bg-green-700"
            >
              {closing ? 'Processing...' : 'Close & Cash Payment'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}