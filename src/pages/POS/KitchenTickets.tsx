import { useState, useEffect } from 'react';

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  status: 'pending' | 'preparing' | 'ready';
  notes?: string;
  orderId: number;
  table: string;
}

const KitchenTickets = () => {
  const [items, setItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    // Mock kitchen order items
    const mockItems: OrderItem[] = [
      { id: 1, name: 'Burger Deluxe', quantity: 2, status: 'pending', orderId: 101, table: 'Table 5', notes: 'No onions' },
      { id: 2, name: 'Chicken Wings', quantity: 1, status: 'preparing', orderId: 102, table: 'Table 3' },
      { id: 3, name: 'Caesar Salad', quantity: 1, status: 'ready', orderId: 101, table: 'Table 5' },
      { id: 4, name: 'Fish & Chips', quantity: 1, status: 'pending', orderId: 103, table: 'Table 1' },
      { id: 5, name: 'Pasta Carbonara', quantity: 2, status: 'preparing', orderId: 104, table: 'Table 7' },
    ];
    setItems(mockItems);
  }, []);

  const updateItemStatus = (itemId: number, newStatus: 'pending' | 'preparing' | 'ready') => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, status: newStatus } : item
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-red-100 text-red-800';
      case 'preparing': return 'bg-yellow-100 text-yellow-800';
      case 'ready': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const pendingItems = items.filter(item => item.status === 'pending');
  const preparingItems = items.filter(item => item.status === 'preparing');
  const readyItems = items.filter(item => item.status === 'ready');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kitchen Tickets</h1>
        <p className="text-gray-600">Manage order preparation status</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-red-700">Pending ({pendingItems.length})</h2>
          </div>
          <div className="p-4 space-y-4">
            {pendingItems.map(item => (
              <div key={item.id} className="border border-red-200 rounded-lg p-3 bg-red-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600">Qty: {item.quantity} | {item.table}</p>
                    {item.notes && <p className="text-xs text-red-600 mt-1">Note: {item.notes}</p>}
                  </div>
                  <span className="text-xs text-gray-500">#{item.orderId}</span>
                </div>
                <button
                  onClick={() => updateItemStatus(item.id, 'preparing')}
                  className="w-full py-2 px-3 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                >
                  Start Preparing
                </button>
              </div>
            ))}
            {pendingItems.length === 0 && (
              <p className="text-gray-500 text-center py-4">No pending items</p>
            )}
          </div>
        </div>

        {/* Preparing Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-yellow-700">Preparing ({preparingItems.length})</h2>
          </div>
          <div className="p-4 space-y-4">
            {preparingItems.map(item => (
              <div key={item.id} className="border border-yellow-200 rounded-lg p-3 bg-yellow-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600">Qty: {item.quantity} | {item.table}</p>
                    {item.notes && <p className="text-xs text-yellow-600 mt-1">Note: {item.notes}</p>}
                  </div>
                  <span className="text-xs text-gray-500">#{item.orderId}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateItemStatus(item.id, 'pending')}
                    className="py-2 px-3 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => updateItemStatus(item.id, 'ready')}
                    className="py-2 px-3 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    Ready
                  </button>
                </div>
              </div>
            ))}
            {preparingItems.length === 0 && (
              <p className="text-gray-500 text-center py-4">No items being prepared</p>
            )}
          </div>
        </div>

        {/* Ready Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-green-700">Ready ({readyItems.length})</h2>
          </div>
          <div className="p-4 space-y-4">
            {readyItems.map(item => (
              <div key={item.id} className="border border-green-200 rounded-lg p-3 bg-green-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600">Qty: {item.quantity} | {item.table}</p>
                    {item.notes && <p className="text-xs text-green-600 mt-1">Note: {item.notes}</p>}
                  </div>
                  <span className="text-xs text-gray-500">#{item.orderId}</span>
                </div>
                <div className="text-center">
                  <span className="inline-block py-1 px-3 bg-green-600 text-white text-sm rounded">
                    Ready for Service
                  </span>
                </div>
              </div>
            ))}
            {readyItems.length === 0 && (
              <p className="text-gray-500 text-center py-4">No items ready</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitchenTickets;
