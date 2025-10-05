import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import Button from '../../components/ui/button/Button';

// Enhanced mock data with more details
const mockOrders = [
  { 
    id: 1, 
    table_name: 'Table 1', 
    total: 245.50, 
    status: 'ready_to_pay', 
    created_at: '2024-10-04 14:30',
    waiter_name: 'John Doe',
    items_count: 3,
    payment_method: null,
    customer_count: 2,
    has_discount: false,
    discount_amount: 0,
    tips: 0
  },
  { 
    id: 2, 
    table_name: 'Table 3', 
    total: 189.00, 
    status: 'paid', 
    created_at: '2024-10-04 13:15',
    waiter_name: 'Jane Smith',
    payment_method: 'Card',
    items_count: 2,
    customer_count: 1,
    has_discount: true,
    discount_amount: 21.00,
    tips: 18.90
  },
  { 
    id: 3, 
    table_name: 'Table 5', 
    total: 312.75, 
    status: 'preparing', 
    created_at: '2024-10-04 15:45',
    waiter_name: 'John Doe',
    items_count: 5,
    customer_count: 4,
    has_discount: false,
    discount_amount: 0,
    tips: 0
  },
  { 
    id: 4, 
    table_name: 'Table 2', 
    total: 156.25, 
    status: 'ready_to_pay', 
    created_at: '2024-10-04 12:00',
    waiter_name: 'Alice Johnson',
    items_count: 2,
    customer_count: 1,
    has_discount: false,
    discount_amount: 0,
    tips: 0
  },
  { 
    id: 5, 
    table_name: 'Table 7', 
    total: 98.50, 
    status: 'ready_to_pay', 
    created_at: '2024-10-04 16:20',
    waiter_name: 'Mike Wilson',
    items_count: 1,
    customer_count: 1,
    has_discount: false,
    discount_amount: 0,
    tips: 0
  }
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
  customer_count: number;
  has_discount: boolean;
  discount_amount: number;
  tips: number;
}

interface PaymentModal {
  orderId: number;
  orderTotal: number;
  paymentMethod: 'cash' | 'card';
  amountReceived: number;
  tips: number;
  discount: number;
  splitPayment: boolean;
  splitAmounts: { cash: number; card: number };
}

export default function EnhancedOrdersList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState<number | null>(null);
  const [activeStatus, setActiveStatus] = useState<'preparing' | 'ready_to_pay' | 'paid' | 'all'>('ready_to_pay');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState<PaymentModal | null>(null);
  const [showRefundModal, setShowRefundModal] = useState<{ orderId: number; amount: number } | null>(null);
  const [showDiscountModal, setShowDiscountModal] = useState<{ orderId: number; total: number } | null>(null);
  const { user } = useAuth();
  const location = useLocation();
  const successMessage = location.state?.message;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch (e.key.toLowerCase()) {
        case 'c':
          // Find first ready to pay order and process cash
          const firstCashOrder = orders.find(o => o.status === 'ready_to_pay');
          if (firstCashOrder) quickPayment(firstCashOrder.id, 'cash');
          break;
        case 'k':
          // Find first ready to pay order and process card
          const firstCardOrder = orders.find(o => o.status === 'ready_to_pay');
          if (firstCardOrder) quickPayment(firstCardOrder.id, 'card');
          break;
        case 'r':
          if (!e.shiftKey) fetchOrders();
          break;
      }
      
      if (e.shiftKey && e.key.toLowerCase() === 'p') {
        printDailySummary();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [orders]);

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
      setTimeout(() => {
        let filteredOrders = activeStatus === 'all' 
          ? mockOrders 
          : mockOrders.filter(order => order.status === activeStatus);
        
        // Apply search filter
        if (searchTerm) {
          filteredOrders = filteredOrders.filter(order => 
            order.id.toString().includes(searchTerm) ||
            order.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.waiter_name.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        setOrders(filteredOrders);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const quickPayment = (orderId: number, method: 'cash' | 'card') => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    if (method === 'cash') {
      setShowPaymentModal({
        orderId,
        orderTotal: order.total,
        paymentMethod: 'cash',
        amountReceived: order.total,
        tips: 0,
        discount: 0,
        splitPayment: false,
        splitAmounts: { cash: 0, card: 0 }
      });
    } else {
      // Card payment - immediate processing
      processPayment(orderId, 'card', order.total, 0, 0);
    }
  };

  const processPayment = async (
    orderId: number, 
    paymentMethod: 'cash' | 'card', 
    amount: number,
    tips: number,
    discount: number,
    splitAmounts?: { cash: number; card: number }
  ) => {
    try {
      setProcessingPayment(orderId);
      
      // Simulate payment processing
      setTimeout(() => {
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
              ? { 
                  ...order, 
                  status: 'paid' as const, 
                  payment_method: splitAmounts ? 'Split' : (paymentMethod === 'cash' ? 'Cash' : 'Card'),
                  tips,
                  discount_amount: discount
                }
              : order
          )
        );
        
        // Show success toast with payment summary
        showPaymentSummary(orderId, paymentMethod, amount, tips, discount, splitAmounts);
        setProcessingPayment(null);
        setShowPaymentModal(null);
      }, 1000);
    } catch (error) {
      console.error('Error processing payment:', error);
      setProcessingPayment(null);
    }
  };

  const showPaymentSummary = (
    orderId: number, 
    method: string, 
    amount: number, 
    tips: number, 
    discount: number,
    splitAmounts?: { cash: number; card: number }
  ) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const summaryHtml = `
      <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div class="text-green-800 font-bold text-lg mb-2">✅ Payment Complete</div>
        <div class="space-y-1 text-sm">
          <div>🧾 Order #${orderId} - ${order.table_name}</div>
          <div>💳 Method: ${splitAmounts ? `Split (Cash: ${splitAmounts.cash}, Card: ${splitAmounts.card})` : method}</div>
          <div>💵 Amount: MAD ${amount.toFixed(2)}</div>
          ${tips > 0 ? `<div>💰 Tips: MAD ${tips.toFixed(2)}</div>` : ''}
          ${discount > 0 ? `<div>🏷️ Discount: MAD ${discount.toFixed(2)}</div>` : ''}
          <div>👨‍🍳 Waiter: ${order.waiter_name}</div>
        </div>
      </div>
    `;
    
    // Create temporary toast
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 z-50 max-w-sm';
    toast.innerHTML = summaryHtml;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 5000);
  };

  const applyDiscount = (orderId: number, discountType: 'percentage' | 'amount', value: number) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const discountAmount = discountType === 'percentage' 
      ? (order.total * value / 100)
      : value;
    
    setOrders(prevOrders => 
      prevOrders.map(o => 
        o.id === orderId 
          ? { ...o, has_discount: true, discount_amount: discountAmount, total: o.total - discountAmount }
          : o
      )
    );
    
    setShowDiscountModal(null);
  };

  const refundOrder = (orderId: number, reason: string) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId 
          ? { ...order, status: 'preparing' as const, payment_method: undefined }
          : order
      )
    );
    
    console.log(`Order ${orderId} refunded. Reason: ${reason}`);
    setShowRefundModal(null);
  };

  const printDailySummary = () => {
    const summary = {
      totalOrders: orders.filter(o => o.status === 'paid').length,
      totalRevenue: orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + o.total, 0),
      cashRevenue: orders.filter(o => o.status === 'paid' && o.payment_method === 'Cash').reduce((sum, o) => sum + o.total, 0),
      cardRevenue: orders.filter(o => o.status === 'paid' && o.payment_method === 'Card').reduce((sum, o) => sum + o.total, 0),
      totalTips: orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + o.tips, 0)
    };
    
    console.log('Daily Summary:', summary);
    // In real implementation, this would trigger actual printing
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    switch (status) {
      case 'preparing':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'ready_to_pay':
        return `${baseClasses} bg-red-100 text-red-800 animate-pulse`;
      case 'paid':
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const readyToPayCount = orders.filter(o => o.status === 'ready_to_pay').length;

  return (
    <div>
      <PageMeta title="Enhanced Orders | POS System" description="Advanced order management with payment features" />
      <PageBreadcrumb pageTitle="Orders Management" />
      
      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">✅ {successMessage}</p>
        </div>
      )}

      {/* Cashier Welcome */}
      {user?.role === 'cashier' && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">💰 Payment Processing Dashboard</h2>
              <p className="text-blue-100">Ready to process {readyToPayCount} orders</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{readyToPayCount}</div>
              <div className="text-blue-100">Ready to Pay</div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Orders {readyToPayCount > 0 && `(${readyToPayCount} Ready)`}
            </h2>
            
            {/* Search Bar */}
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Search orders, tables, waiters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Button onClick={fetchOrders}>🔄 Refresh</Button>
              {user?.role === 'cashier' && (
                <Button onClick={printDailySummary} variant="outline">
                  🖨️ Print Summary
                </Button>
              )}
            </div>
          </div>
          
          {/* Status Tabs */}
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'ready_to_pay', label: `💳 Ready to Pay ${readyToPayCount > 0 ? `(${readyToPayCount})` : ''}`, priority: true },
              { key: 'preparing', label: '🍳 Preparing' },
              { key: 'paid', label: '✅ Paid' },
              { key: 'all', label: 'All' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveStatus(tab.key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeStatus === tab.key
                    ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                } ${
                  tab.priority && readyToPayCount > 0 ? 'ring-2 ring-orange-200 bg-orange-50' : ''
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🍽️</div>
              <p className="text-gray-500">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Order #</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Table</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Waiter</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Items</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Total</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Time</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr 
                      key={order.id} 
                      className={`border-b border-gray-100 hover:bg-gray-50 ${
                        order.status === 'ready_to_pay' ? 'bg-yellow-50 border-yellow-200' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-gray-900 font-medium">#{order.id}</td>
                      <td className="py-3 px-4 text-gray-900">
                        {order.table_name}
                        <div className="text-xs text-gray-500">{order.customer_count} guests</div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{order.waiter_name}</td>
                      <td className="py-3 px-4 text-gray-600">{order.items_count} items</td>
                      <td className="py-3 px-4">
                        <div className="text-gray-900 font-semibold">
                          MAD {order.total.toFixed(2)}
                          {order.has_discount && (
                            <div className="text-xs text-green-600">
                              💰 Discount: MAD {order.discount_amount.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </td>
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
                            🧾 View
                          </Link>
                          
                          {order.status === 'ready_to_pay' && (
                            <div className="flex space-x-1">
                              <button
                                onClick={() => quickPayment(order.id, 'cash')}
                                disabled={processingPayment === order.id}
                                className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 disabled:opacity-50"
                              >
                                {processingPayment === order.id ? '...' : '💵 Cash'}
                              </button>
                              <button
                                onClick={() => quickPayment(order.id, 'card')}
                                disabled={processingPayment === order.id}
                                className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:opacity-50"
                              >
                                {processingPayment === order.id ? '...' : '💳 Card'}
                              </button>
                              <button
                                onClick={() => setShowDiscountModal({ orderId: order.id, total: order.total })}
                                className="px-2 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600"
                              >
                                🏷️ Discount
                              </button>
                            </div>
                          )}
                          
                          {order.status === 'paid' && user?.role === 'cashier' && (
                            <button
                              onClick={() => setShowRefundModal({ orderId: order.id, amount: order.total })}
                              className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                            >
                              ❌ Refund
                            </button>
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

      {/* Enhanced Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
            <h3 className="text-xl font-bold mb-4">💰 Process Payment</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Order #{showPaymentModal.orderId}</div>
                <div className="text-lg font-semibold">Total: MAD {showPaymentModal.orderTotal.toFixed(2)}</div>
              </div>
              
              {/* Payment Method Toggle */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setShowPaymentModal(prev => prev ? { ...prev, paymentMethod: 'cash', splitPayment: false } : null)}
                  className={`p-3 rounded-lg text-sm font-medium ${
                    showPaymentModal.paymentMethod === 'cash' && !showPaymentModal.splitPayment
                      ? 'bg-green-100 text-green-700 border-2 border-green-300'
                      : 'bg-gray-100 text-gray-700 border-2 border-transparent'
                  }`}
                >
                  💵 Cash
                </button>
                <button
                  onClick={() => setShowPaymentModal(prev => prev ? { ...prev, paymentMethod: 'card', splitPayment: false } : null)}
                  className={`p-3 rounded-lg text-sm font-medium ${
                    showPaymentModal.paymentMethod === 'card' && !showPaymentModal.splitPayment
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                      : 'bg-gray-100 text-gray-700 border-2 border-transparent'
                  }`}
                >
                  💳 Card
                </button>
                <button
                  onClick={() => setShowPaymentModal(prev => prev ? { 
                    ...prev, 
                    splitPayment: true,
                    splitAmounts: { cash: prev.orderTotal / 2, card: prev.orderTotal / 2 }
                  } : null)}
                  className={`p-3 rounded-lg text-sm font-medium ${
                    showPaymentModal.splitPayment
                      ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                      : 'bg-gray-100 text-gray-700 border-2 border-transparent'
                  }`}
                >
                  🔄 Split
                </button>
              </div>
              
              {/* Split Payment Details */}
              {showPaymentModal.splitPayment && (
                <div className="space-y-3 p-4 bg-purple-50 rounded-lg">
                  <div className="text-sm font-medium text-purple-800">Split Payment</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Cash Amount</label>
                      <input
                        type="number"
                        value={showPaymentModal.splitAmounts.cash}
                        onChange={(e) => setShowPaymentModal(prev => prev ? {
                          ...prev,
                          splitAmounts: { ...prev.splitAmounts, cash: parseFloat(e.target.value) || 0 }
                        } : null)}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Card Amount</label>
                      <input
                        type="number"
                        value={showPaymentModal.splitAmounts.card}
                        onChange={(e) => setShowPaymentModal(prev => prev ? {
                          ...prev,
                          splitAmounts: { ...prev.splitAmounts, card: parseFloat(e.target.value) || 0 }
                        } : null)}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Cash Payment Details */}
              {showPaymentModal.paymentMethod === 'cash' && !showPaymentModal.splitPayment && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount Received</label>
                  <input
                    type="number"
                    value={showPaymentModal.amountReceived}
                    onChange={(e) => setShowPaymentModal(prev => prev ? { ...prev, amountReceived: parseFloat(e.target.value) || 0 } : null)}
                    className="w-full p-3 border border-gray-300 rounded-lg text-lg font-mono"
                    placeholder="Enter amount received"
                  />
                  <div className="mt-2 text-sm text-gray-600">
                    Change: MAD {Math.max(0, showPaymentModal.amountReceived - showPaymentModal.orderTotal).toFixed(2)}
                  </div>
                </div>
              )}
              
              {/* Tips */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tips (Optional)</label>
                <div className="flex gap-2 mb-2">
                  {[10, 15, 20].map(percent => (
                    <button
                      key={percent}
                      onClick={() => setShowPaymentModal(prev => prev ? { 
                        ...prev, 
                        tips: prev.orderTotal * (percent / 100) 
                      } : null)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
                    >
                      {percent}%
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={showPaymentModal.tips}
                  onChange={(e) => setShowPaymentModal(prev => prev ? { ...prev, tips: parseFloat(e.target.value) || 0 } : null)}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Custom tip amount"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPaymentModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (showPaymentModal.splitPayment) {
                    processPayment(
                      showPaymentModal.orderId,
                      'card', // Split payment
                      showPaymentModal.orderTotal,
                      showPaymentModal.tips,
                      showPaymentModal.discount,
                      showPaymentModal.splitAmounts
                    );
                  } else {
                    processPayment(
                      showPaymentModal.orderId,
                      showPaymentModal.paymentMethod,
                      showPaymentModal.orderTotal,
                      showPaymentModal.tips,
                      showPaymentModal.discount
                    );
                  }
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                ✅ Process Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4">🏷️ Apply Discount</h3>
            
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                Order #{showDiscountModal.orderId} - Total: MAD {showDiscountModal.total.toFixed(2)}
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {[5, 10, 15].map(percent => (
                  <button
                    key={percent}
                    onClick={() => applyDiscount(showDiscountModal.orderId, 'percentage', percent)}
                    className="p-3 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200"
                  >
                    {percent}% OFF
                  </button>
                ))}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Custom Amount</label>
                <input
                  type="number"
                  placeholder="Enter discount amount"
                  className="w-full p-2 border border-gray-300 rounded"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const value = parseFloat((e.target as HTMLInputElement).value);
                      if (value > 0) {
                        applyDiscount(showDiscountModal.orderId, 'amount', value);
                      }
                    }
                  }}
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDiscountModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4 text-red-700">❌ Refund Order</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="text-sm text-red-600">Order #{showRefundModal.orderId}</div>
                <div className="text-lg font-semibold text-red-700">Amount: MAD {showRefundModal.amount.toFixed(2)}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Refund</label>
                <select className="w-full p-2 border border-gray-300 rounded">
                  <option>Customer Request</option>
                  <option>Wrong Order</option>
                  <option>Kitchen Error</option>
                  <option>Payment Error</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRefundModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => refundOrder(showRefundModal.orderId, 'Customer Request')}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                ✅ Confirm Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}