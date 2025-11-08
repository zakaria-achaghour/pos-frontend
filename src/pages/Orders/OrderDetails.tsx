import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import Button from '../../components/ui/button/Button';
import { getUser } from '../../app/auth';
import { orderAPI } from '@/api/orders';

// Backend response structure (snake_case)
interface BackendOrderItem {
  id: number;
  order_id: number;
  menu_item_id: number;
  quantity: number;
  unit_price: string;
  special_instructions: string | null;
  removed_ingredients: string[] | null;
  added_extras: string[] | null;
  menu_item: {
    id: number;
    name: string;
    description: string;
    price: string;
    ingredients: string[];
    category: {
      id: number;
      name: string;
    };
  };
}

interface BackendOrder {
  id: number;
  restaurant_id: number;
  table_id: number | null;
  waiter_id: number | null;
  type: string;
  status: string;
  priority: string;
  subtotal: string;
  tax_amount: string;
  discount_amount: string;
  total: string;
  payment_method: string | null;
  notes: string | null;
  placed_at: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  table?: {
    id: number;
    number: string;
    section: string;
  } | null;
  waiter?: {
    id: number;
    name: string;
  } | null;
  order_items: BackendOrderItem[];
}

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

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<BackendOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const user = getUser();

  // Get order status styling
  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'ready':
        return 'bg-purple-100 text-purple-800';
      case 'served':
        return 'bg-indigo-100 text-indigo-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get payment status styling
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-orange-100 text-orange-800';
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

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const orderData = await orderAPI.getOrder(parseInt(id || '0'));
      console.log('✅ Order data received:', orderData);
      setOrder(orderData as unknown as BackendOrder);
      console.log('✅ Order state updated');
    } catch (error) {
      console.error('❌ Error fetching order:', error);
      showToast('Failed to load order details', 'error');
    } finally {
      setLoading(false);
      console.log('✅ Loading set to false');
    }
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCloseOrder = async () => {
    try {
      setProcessing(true);
      if (!order) return;
      
      await orderAPI.closeOrder(order.id, {
        payment_method: 'cash',
        amount_paid: parseFloat(order.total)
      });
      
      showToast('Payment processed successfully', 'success');
      fetchOrder(); // Refresh order data
    } catch (error) {
      console.error('Error processing payment:', error);
      showToast('Failed to process payment', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleCardPayment = async () => {
    try {
      setProcessing(true);
      if (!order) return;
      
      await orderAPI.closeOrder(order.id, {
        payment_method: 'card',
        amount_paid: parseFloat(order.total)
      });
      
      showToast('Card payment processed successfully', 'success');
      fetchOrder(); // Refresh order data
    } catch (error) {
      console.error('Error processing card payment:', error);
      showToast('Failed to process card payment', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      setProcessing(true);
      if (!order) return;
      
      await orderAPI.updateOrderStatus(order.id, newStatus);
      showToast(`Order status updated to ${newStatus}`, 'success');
      fetchOrder(); // Refresh order data
    } catch (error) {
      console.error('Error updating order status:', error);
      showToast('Failed to update order status', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const canProcessPayment = () => {
    // Check if payment is not completed (paid_at is null or payment_method is null)
    return !order?.paid_at &&
           user &&
           ['owner', 'manager', 'cashier'].includes(user.role);
  };

  const getPaymentStatus = () => {
    if (order?.paid_at && order?.payment_method) {
      return 'completed';
    }
    return 'pending';
  };

  const getTableDisplay = () => {
    if (order?.table) {
      return `Table ${order.table.number}`;
    }
    return order?.type === 'takeout' ? 'Takeout' : order?.type === 'delivery' ? 'Delivery' : 'N/A';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Order #{order.id}</h2>
              <p className="text-sm text-gray-500 mt-1">Order ID: {order.id}</p>
            </div>
            <div className="flex gap-2">
              {/* Order Status Badge */}
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getOrderStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
              {/* Payment Status Badge */}
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(getPaymentStatus())}`}>
                {order.paid_at ? '💳 Paid' : '⏳ Unpaid'}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Table:</span>
              <p className="font-medium">{getTableDisplay()}</p>
            </div>
            <div>
              <span className="text-gray-500">Time:</span>
              <p className="font-medium">{formatDate(order.created_at)}</p>
            </div>
            <div>
              <span className="text-gray-500">Type:</span>
              <p className="font-medium capitalize">{order.type}</p>
            </div>
            <div>
              <span className="text-gray-500">Total:</span>
              <p className="font-bold text-lg">{parseFloat(order.total).toFixed(2)} MAD</p>
            </div>
          </div>

          {order.priority && order.priority !== 'normal' && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                order.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                order.priority === 'high' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {order.priority === 'urgent' ? '🔴' : order.priority === 'high' ? '🟡' : '🔵'} Priority: {order.priority.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Items</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {order.order_items.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-gray-900">
                          {item.menu_item?.name || `Item #${item.menu_item_id}`}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                          {getKitchenStatusIcon(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{parseFloat(item.unit_price).toFixed(2)} MAD each</p>
                      
                      {/* Special Instructions */}
                      {item.special_instructions && (
                        <p className="text-sm text-blue-600 mt-2">
                          <span className="font-medium">📝 Note:</span> {item.special_instructions}
                        </p>
                      )}
                      
                      {/* Removed Ingredients */}
                      {item.removed_ingredients && item.removed_ingredients.length > 0 && (
                        <p className="text-sm text-red-600 mt-2">
                          <span className="font-medium">❌ No:</span> {item.removed_ingredients.join(', ')}
                        </p>
                      )}
                      
                      {/* Added Extras */}
                      {item.added_extras && item.added_extras.length > 0 && (
                        <p className="text-sm text-green-600 mt-2">
                          <span className="font-medium">➕ Extra:</span> {item.added_extras.join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="text-center min-w-[80px]">
                      <span className="text-gray-600 text-lg">× {item.quantity}</span>
                    </div>
                    <div className="text-right min-w-[120px]">
                      <span className="font-semibold text-lg">{(parseFloat(item.unit_price) * item.quantity).toFixed(2)} MAD</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Order Summary */}
            <div className="border-t border-gray-200 pt-6 mt-6 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{parseFloat(order.subtotal).toFixed(2)} MAD</span>
              </div>
              {parseFloat(order.tax_amount) > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium">{parseFloat(order.tax_amount).toFixed(2)} MAD</span>
                </div>
              )}
              {parseFloat(order.discount_amount) > 0 && (
                <div className="flex justify-between items-center text-sm text-green-600">
                  <span>Discount:</span>
                  <span className="font-medium">-{parseFloat(order.discount_amount).toFixed(2)} MAD</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                <span className="text-lg font-medium text-gray-600">Order Total:</span>
                <span className="text-2xl font-bold text-green-600">{parseFloat(order.total).toFixed(2)} MAD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Status Actions */}
        {user && ['owner', 'manager', 'waiter'].includes(user.role) && 
         order.status !== 'completed' && order.status !== 'cancelled' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Order Status</h3>
            <div className="flex flex-wrap gap-3">
              {order.status === 'pending' && (
                <Button
                  onClick={() => handleUpdateStatus('accepted')}
                  disabled={processing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  ✅ Accept Order
                </Button>
              )}
              {(order.status === 'accepted' || order.status === 'pending') && (
                <Button
                  onClick={() => handleUpdateStatus('preparing')}
                  disabled={processing}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  👨‍🍳 Start Preparing
                </Button>
              )}
              {order.status === 'preparing' && (
                <Button
                  onClick={() => handleUpdateStatus('ready')}
                  disabled={processing}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  ✅ Mark Ready
                </Button>
              )}
              {order.status === 'ready' && (
                <Button
                  onClick={() => handleUpdateStatus('served')}
                  disabled={processing}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  🍽️ Mark Served
                </Button>
              )}
              {order.status === 'served' && order.paid_at && (
                <Button
                  onClick={() => handleUpdateStatus('completed')}
                  disabled={processing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  ✓ Complete Order
                </Button>
              )}
              <Button
                onClick={() => handleUpdateStatus('cancelled')}
                disabled={processing}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                ❌ Cancel Order
              </Button>
            </div>
          </div>
        )}

        {/* Payment Actions */}
        {canProcessPayment() && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Actions</h3>
            <div className="flex gap-3">
              <Button
                onClick={handleCloseOrder}
                disabled={processing}
                className="bg-green-600 hover:bg-green-700"
              >
                {processing ? 'Processing...' : '💵 Cash Payment'}
              </Button>
              <Button
                onClick={handleCardPayment}
                disabled={processing}
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