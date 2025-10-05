import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

// Toast notification function
const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  // Simple toast implementation - can be enhanced with a proper toast library
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white font-medium ${
    type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
  }`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    document.body.removeChild(toast);
  }, 3000);
};

// Mock data - replace with actual API call
const mockTables = [
  { id: 1, name: 'Table 1', capacity: 4, status: 'available' },
  { id: 2, name: 'Table 2', capacity: 2, status: 'occupied' },
  { id: 3, name: 'Table 3', capacity: 6, status: 'available' },
  { id: 4, name: 'Table 4', capacity: 4, status: 'occupied' },
  { id: 5, name: 'Table 5', capacity: 8, status: 'available' },
  { id: 6, name: 'Table 6', capacity: 2, status: 'available' },
];

interface Table {
  id: number;
  name: string;
  capacity: number;
  status: 'available' | 'occupied';
  currentOrder?: {
    id: number;
    total: number;
    items: number;
    status: 'preparing' | 'ready' | 'served';
    time: string;
  };
}

export default function Tables() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'occupied'>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;
  const messageType = location.state?.type || 'info';

  // Show success message if redirected from order creation
  useEffect(() => {
    if (successMessage) {
      showToast(successMessage, messageType as 'success' | 'error' | 'info');
      // Clear the message from location state
      window.history.replaceState({}, document.title);
    }
  }, [successMessage, messageType]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchTables(true); // silent refresh
      }, 30000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  // Initial data fetch
  useEffect(() => {
    fetchTables();
  }, []);

  // Filter tables based on search and status
  const filteredTables = tables.filter((table) => {
    const matchesSearch = table.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || table.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Get order status color styling
  const getOrderStatusColor = (status: string) => {
    switch (status) {
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

  // Manual refresh handler
  const handleManualRefresh = () => {
    setLoading(true);
    fetchTables();
  };

  const fetchTables = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      // TODO: Replace with actual API call
      // const response = await api.get('/tables');
      // setTables(response.data);
      
      // Simulate API delay
      setTimeout(() => {
        // Enhanced mock data with order information
        const enhancedMockTables = [
          { id: 1, name: 'Table 1', capacity: 4, status: 'occupied', 
            currentOrder: { id: 101, total: 245.50, items: 3, status: 'preparing', time: '14:30' } },
          { id: 2, name: 'Table 2', capacity: 2, status: 'available' },
          { id: 3, name: 'Table 3', capacity: 6, status: 'occupied',
            currentOrder: { id: 102, total: 189.00, items: 2, status: 'ready', time: '15:15' } },
          { id: 4, name: 'Table 4', capacity: 4, status: 'available' },
          { id: 5, name: 'Table 5', capacity: 8, status: 'available' },
          { id: 6, name: 'Table 6', capacity: 2, status: 'occupied',
            currentOrder: { id: 103, total: 156.25, items: 4, status: 'served', time: '13:45' } },
        ];
        setTables(enhancedMockTables);
        setLastRefresh(new Date());
        if (!silent) setLoading(false);
      }, silent ? 200 : 800);
    } catch (err) {
      setError('Failed to load tables');
      if (!silent) setLoading(false);
    }
  };

  const handleTableClick = (table: Table) => {
    if (user?.role === 'waiter') {
      if (table.status === 'available') {
        // For waiters, go directly to order creation for available tables
        showToast(`Creating order for ${table.name} 🍽️`, 'info');
        navigate(`/orders/new?table=${table.id}&tableName=${encodeURIComponent(table.name)}`);
      } else if (table.status === 'occupied' && table.currentOrder) {
        // For occupied tables, view existing order
        showToast(`Viewing order #${table.currentOrder.id} for ${table.name}`, 'info');
        navigate(`/orders/${table.currentOrder.id}`);
      }
    } else {
      // For managers/owners, might go to table management or order creation
      navigate(`/orders/new?table=${table.id}&tableName=${encodeURIComponent(table.name)}`);
    }
  };

  const getPageTitle = () => {
    if (user?.role === 'waiter') {
      return 'Select Table - Create Order';
    }
    return 'Tables';
  };

  const getPageDescription = () => {
    if (user?.role === 'waiter') {
      return 'Select a table to create a new order';
    }
    return 'Restaurant table management';
  };

  if (loading) {
    return (
      <div>
        <PageMeta
          title="Tables | POS System"
          description="Restaurant table management"
        />
        <PageBreadcrumb pageTitle="Tables" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white p-4 rounded-xl shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageMeta
          title="Tables | POS System"
          description="Restaurant table management"
        />
        <PageBreadcrumb pageTitle="Tables" />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageMeta
        title={`${getPageTitle()} | POS System`}
        description={getPageDescription()}
      />
      <PageBreadcrumb pageTitle={getPageTitle()} />
      
      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">✅ {successMessage}</p>
        </div>
      )}
      
      {/* Search and Filter Controls */}
      <div className="mb-6 bg-white rounded-xl shadow p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search tables..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400">🔍</span>
              </div>
            </div>
          </div>
          
          {/* Filter Buttons */}
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'All Tables', icon: '🍽️' },
              { key: 'available', label: 'Available', icon: '✅' },
              { key: 'occupied', label: 'Occupied', icon: '🔴' }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setStatusFilter(filter.key as 'all' | 'available' | 'occupied')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === filter.key
                    ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.icon} {filter.label}
              </button>
            ))}
          </div>
          
          {/* Refresh Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleManualRefresh}
              className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              🔄 Refresh
            </button>
            <div className="text-xs text-gray-500">
              Last: {lastRefresh.toLocaleTimeString()}
            </div>
          </div>
        </div>
        
        {/* Stats Summary */}
        <div className="mt-4 flex gap-4 text-sm">
          <div className="text-gray-600">
            Total: <span className="font-medium">{filteredTables.length}</span>
          </div>
          <div className="text-green-600">
            Available: <span className="font-medium">{filteredTables.filter(t => t.status === 'available').length}</span>
          </div>
          <div className="text-red-600">
            Occupied: <span className="font-medium">{filteredTables.filter(t => t.status === 'occupied').length}</span>
          </div>
        </div>
      </div>
      
      {user?.role === 'waiter' && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 font-medium">👋 Welcome {user.name}!</p>
          <p className="text-blue-600 text-sm">Select a table below to create a new order for your customers.</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTables.map((table) => (
          <div
            key={table.id}
            onClick={() => handleTableClick(table)}
            className={`bg-white rounded-xl shadow cursor-pointer hover:shadow-lg transition-all duration-200 border-2 ${
              table.status === 'available'
                ? 'border-green-200 hover:border-green-300'
                : 'border-red-200 hover:border-red-300'
            } ${user?.role === 'waiter' ? 'hover:scale-105' : ''}`}
          >
            {/* Table Header */}
            <div className={`p-4 rounded-t-xl ${
              table.status === 'occupied' ? 'bg-red-50' : 'bg-green-50'
            }`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{table.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  table.status === 'occupied' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {table.status === 'occupied' ? '🔴 Occupied' : '✅ Available'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                👥 Capacity: {table.capacity} guests
              </p>
            </div>

            {/* Table Body */}
            <div className="p-4">
              {table.status === 'occupied' && table.currentOrder ? (
                /* Occupied Table Information Panel */
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Current Order</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getOrderStatusColor(table.currentOrder.status)}`}>
                        {table.currentOrder.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Order #:</span>
                        <span className="font-medium ml-1">{table.currentOrder.id}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Time:</span>
                        <span className="font-medium ml-1">{table.currentOrder.time}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Items:</span>
                        <span className="font-medium ml-1">{table.currentOrder.items}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Total:</span>
                        <span className="font-bold ml-1 text-green-600">${table.currentOrder.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <button className="w-full py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium">
                    View/Edit Order
                  </button>
                </div>
              ) : (
                /* Available Table Action */
                <div className="text-center py-4">
                  <div className="text-gray-400 mb-2 text-2xl">🍽️</div>
                  {user?.role === 'waiter' && (
                    <>
                      <button className="w-full py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium mb-2">
                        Create New Order
                      </button>
                      <div className="text-xs text-blue-600 font-medium">
                        📝 Click to create order
                      </div>
                    </>
                  )}
                  {user?.role !== 'waiter' && (
                    <div className="text-sm text-gray-600">Table Available</div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}