import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../../hooks/useAuthRedux';
import { tableAPI } from '../../api/tables';
import type { Table, TableFilters } from '../../types/table';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

// Extended types for tables with order details
interface OrderDetails {
  id: number;
  status: string;
  time: string;
  items: number;
  total: number;
}

interface ExtendedTable extends Omit<Table, 'currentOrder'> {
  currentOrder?: OrderDetails;
}

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
const mockOrders = {
  1: { id: 101, total: 245.50, items: 3, status: 'preparing' as const, time: '14:30' },
  3: { id: 102, total: 189.00, items: 2, status: 'ready' as const, time: '15:15' },
  6: { id: 103, total: 156.25, items: 4, status: 'served' as const, time: '13:45' },
};

export default function Tables() {
  const [tables, setTables] = useState<ExtendedTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'occupied' | 'reserved'>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 100, // Increased limit to fetch more tables per page
    total: 0
  });
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
  }, [statusFilter, searchTerm, pagination.page]);

  // Fetch tables from API with filters
  const fetchTables = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      
      // Build filters object
      const filters: TableFilters = {};
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      if (searchTerm) {
        filters.searchTerm = searchTerm;
      }
      
      console.log('Fetching tables with params:', {
        page: pagination.page,
        limit: pagination.limit,
        filters
      });
      
      // Fetch from API
      const response = await tableAPI.getTables({
        page: pagination.page,
        limit: pagination.limit,
        filters
      });
      
      console.log('API Response:', {
        tables: response.tables.length,
        page: response.page,
        limit: response.limit,
        total: response.total
      });
      
      // Add mock order data for occupied tables (until orders API is integrated)
      const tablesWithOrders = response.tables.map(table => ({
        ...table,
        currentOrder: (table.status === 'occupied' && mockOrders[table.id as keyof typeof mockOrders]) 
          ? mockOrders[table.id as keyof typeof mockOrders]
          : undefined
      })) as any;
      
      setTables(tablesWithOrders);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total
      });
      setLastRefresh(new Date());
      setError(null);
      if (!silent) setLoading(false);
    } catch (err: any) {
      console.error('Error fetching tables:', err);
      setError('Failed to load tables. Please try again.');
      if (!silent) setLoading(false);
    }
  };

  // Filter tables based on search and status (client-side for additional filtering)
  const filteredTables = tables;

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
    fetchTables();
  };

  const handleTableClick = (table: ExtendedTable) => {
    if (user?.role === 'waiter') {
      if (table.status === 'available') {
        // For waiters, go directly to order creation for available tables
        showToast(`Creating order for Table ${table.number} 🍽️`, 'info');
        navigate(`/orders/new?table=${table.id}&tableName=${encodeURIComponent(`Table ${table.number}`)}`);
      } else if (table.status === 'occupied' && table.currentOrder) {
        // For occupied tables, view existing order
        showToast(`Viewing order #${table.currentOrder.id} for Table ${table.number}`, 'info');
        navigate(`/orders/${table.currentOrder.id}`);
      }
    } else {
      // For managers/owners, might go to table management or order creation
      navigate(`/orders/new?table=${table.id}&tableName=${encodeURIComponent(`Table ${table.number}`)}`);
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
                <h3 className="font-semibold text-gray-900">Table {table.number}</h3>
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

      {/* Pagination */}
      {Math.ceil(pagination.total / pagination.limit) > 1 && (
        <div className="mt-6 bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1 || loading}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit) || loading}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">
                  {pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1}
                </span>
                {' '}-{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>
                {' '}of{' '}
                <span className="font-medium">{pagination.total}</span> tables
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1 || loading}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  ‹
                </button>
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit) || loading}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  ›
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}