import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuthRedux';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  status: 'pending' | 'preparing' | 'ready';
  notes?: string;
}

interface KitchenOrder {
  id: number;
  tableNumber: string;
  orderTime: Date;
  items: OrderItem[];
}

const KitchenTickets = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'preparing' | 'ready'>('all');

  // Initialize simple mock data
  useEffect(() => {
    const mockOrders: KitchenOrder[] = [
      {
        id: 101,
        tableNumber: 'Table 5',
        orderTime: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
        items: [
          {
            id: 1,
            name: 'Margherita Pizza',
            quantity: 2,
            status: 'pending',
            notes: 'Extra cheese'
          },
          {
            id: 2,
            name: 'Caesar Salad',
            quantity: 1,
            status: 'preparing'
          }
        ]
      },
      {
        id: 102,
        tableNumber: 'Table 3',
        orderTime: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
        items: [
          {
            id: 3,
            name: 'Grilled Salmon',
            quantity: 1,
            status: 'preparing',
            notes: 'Well done'
          },
          {
            id: 4,
            name: 'Chocolate Cake',
            quantity: 1,
            status: 'ready'
          }
        ]
      }
    ];
    
    setOrders(mockOrders);
  }, []);

  // Simple utility functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-red-100 text-red-800';
      case 'preparing': return 'bg-yellow-100 text-yellow-800';
      case 'ready': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const updateItemStatus = (orderId: number, itemId: number, newStatus: 'pending' | 'preparing' | 'ready') => {
    setOrders(orders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          items: order.items.map(item => 
            item.id === itemId ? { ...item, status: newStatus } : item
          )
        };
      }
      return order;
    }));
  };

  // Filter orders by date and status
  const filteredOrders = orders.filter(order => {
    const orderDate = order.orderTime.toISOString().split('T')[0];
    const matchesDate = orderDate === selectedDate;
    
    if (filterStatus === 'all') return matchesDate;
    
    const hasMatchingItems = order.items.some(item => item.status === filterStatus);
    return matchesDate && hasMatchingItems;
  });

  const getElapsedTime = (orderTime: Date) => {
    const diff = Date.now() - orderTime.getTime();
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageMeta title="Kitchen Tickets | POS System" description="Kitchen order management" />
      <PageBreadcrumb pageTitle="Kitchen Tickets" />
      
      {/* Simple Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Kitchen Orders</h1>
        <p className="text-gray-600">Manage order preparation</p>
      </div>

      {/* Simple Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-4 items-center">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Display */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-4xl mb-4">🍽️</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No orders found</h3>
            <p className="text-gray-500">No orders match the selected filters.</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="bg-white rounded-lg shadow">
              {/* Order Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">{order.tableNumber} - Order #{order.id}</h3>
                    <p className="text-sm text-gray-600">Ordered {getElapsedTime(order.orderTime)}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-4">
                <div className="space-y-3">
                  {order.items.map(item => (
                    <div key={item.id} className={`border rounded-lg p-3 ${getStatusColor(item.status)}`}>
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <span className="text-sm text-gray-600">× {item.quantity}</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                          </div>
                          
                          {item.notes && (
                            <div className="text-sm text-gray-600 mt-1">
                              <strong>Note:</strong> {item.notes}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 ml-4">
                          {item.status === 'pending' && (
                            <button
                              onClick={() => updateItemStatus(order.id, item.id, 'preparing')}
                              className="bg-yellow-600 text-white px-3 py-1 text-sm rounded hover:bg-yellow-700"
                            >
                              Start
                            </button>
                          )}
                          
                          {item.status === 'preparing' && (
                            <button
                              onClick={() => updateItemStatus(order.id, item.id, 'ready')}
                              className="bg-green-600 text-white px-3 py-1 text-sm rounded hover:bg-green-700"
                            >
                              Ready
                            </button>
                          )}
                          
                          {item.status === 'ready' && (
                            <div className="bg-green-600 text-white px-3 py-1 text-sm rounded">
                              Completed
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default KitchenTickets;