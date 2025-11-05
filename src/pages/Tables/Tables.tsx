import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import PaginationWithText from '@/components/ui/pagination/PaginationWithText';
import { useTableManagement } from '@/hooks/useTableManagement';
import { useAuth } from '@/hooks/useAuthRedux';
import type { Table } from '@/types/table';

export default function Tables() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Destructure data and actions from the useTableManagement hook
  const {
    // Data
    tables = [],
    
    // UI State
    statusFilter = 'all',
    loading = false,
    error,
    pagination = { currentPage: 1, lastPage: 1, total: 0, perPage: 15 },
    
    // Actions
    goToPage = () => {},
    
    // UI Actions
    setStatusFilter = () => {},
    
    // Computed values
    tableStats = { total: 0, available: 0, occupied: 0, reserved: 0 },
  } = useTableManagement(20) as any; // 20 tables per page

  const [autoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');

  // Auto-refresh every 30 seconds
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        setLastRefresh(new Date());
        // Hook will auto-fetch on filter/page changes
      }, 30000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  // Show success message from navigation state
  useEffect(() => {
    if (location.state?.message) {
      // Message will auto-clear
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Manual refresh handler
  const handleManualRefresh = () => {
    setLastRefresh(new Date());
    window.location.reload(); // Simple refresh
  };

  // Handle table click - navigate to orders if available
  const handleTableClick = (table: Table) => {
    if (table.status === 'available') {
      navigate('/cashier/orders/new', {
        state: {
          tableId: table.id,
          tableNumber: table.number
        }
      });
    } else if (table.status === 'occupied' && table.currentOrder) {
      navigate(`/cashier/orders/${table.currentOrder}`);
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
    return 'Restaurant table overview';
  };

  // Filter tables by search term (client-side)
  const displayedTables = tables.filter((table: Table) => 
    searchTerm === '' || 
    table.number.toString().includes(searchTerm) ||
    table.section?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Loading state
  if (loading && tables.length === 0) {
    return (
      <div>
        <PageMeta
          title="Tables | POS System"
          description="Restaurant tables"
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

  // Error state
  if (error) {
    return (
      <div>
        <PageMeta
          title="Tables | POS System"
          description="Restaurant tables"
        />
        <PageBreadcrumb pageTitle="Tables" />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div>
      <PageMeta
        title={`${getPageTitle()} | POS System`}
        description={getPageDescription()}
      />
      <PageBreadcrumb pageTitle={getPageTitle()} />
      
      {/* Success Message */}
      {location.state?.message && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">✅ {location.state.message}</p>
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
              { key: 'occupied', label: 'Occupied', icon: '🔴' },
              { key: 'reserved', label: 'Reserved', icon: '📅' }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setStatusFilter(filter.key as typeof statusFilter)}
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
              disabled={loading}
              className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
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
            Total: <span className="font-medium">{tableStats.total}</span>
          </div>
          <div className="text-green-600">
            Available: <span className="font-medium">{tableStats.available}</span>
          </div>
          <div className="text-red-600">
            Occupied: <span className="font-medium">{tableStats.occupied}</span>
          </div>
        </div>
      </div>
      
      {/* Waiter Welcome Message */}
      {user?.role === 'waiter' && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 font-medium">👋 Welcome {user.name}!</p>
          <p className="text-blue-600 text-sm">Select a table below to create a new order for your customers.</p>
        </div>
      )}
      
      {/* Table Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {displayedTables.map((table: Table) => (
          <div
            key={table.id}
            onClick={() => handleTableClick(table)}
            className={`bg-white rounded-xl shadow cursor-pointer hover:shadow-lg transition-all duration-200 border-2 ${
              table.status === 'available'
                ? 'border-green-200 hover:border-green-300'
                : table.status === 'occupied'
                ? 'border-red-200 hover:border-red-300'
                : 'border-yellow-200 hover:border-yellow-300'
            } hover:scale-105`}
          >
            {/* Table Header */}
            <div className={`p-4 rounded-t-xl ${
              table.status === 'occupied' 
                ? 'bg-red-50' 
                : table.status === 'reserved' 
                ? 'bg-yellow-50' 
                : 'bg-green-50'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg text-gray-900">Table {table.number}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  table.status === 'occupied' 
                    ? 'bg-red-100 text-red-800' 
                    : table.status === 'reserved'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {table.status === 'occupied' && '🔴'}
                  {table.status === 'available' && '✅'}
                  {table.status === 'reserved' && '📅'}
                  {table.status === 'cleaning' && '🧹'}
                </span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>👥 {table.capacity} guests</p>
                {table.section && <p>📍 {table.section}</p>}
              </div>
            </div>

            {/* Table Body */}
            <div className="p-4">
              {table.status === 'occupied' && table.currentOrder ? (
                <div className="space-y-2">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <span className="text-sm font-medium text-gray-700">Order #{table.currentOrder}</span>
                  </div>
                  <button className="w-full py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium">
                    View Order
                  </button>
                </div>
              ) : (
                <div className="text-center py-2">
                  <div className="text-gray-400 mb-2 text-3xl">🍽️</div>
                  {table.status === 'available' && (
                    <>
                      <button className="w-full py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium">
                        Create Order
                      </button>
                      <div className="text-xs text-blue-600 font-medium mt-1">
                        📝 Click to start
                      </div>
                    </>
                  )}
                  {table.status === 'reserved' && (
                    <div className="text-sm text-yellow-700 font-medium">Reserved</div>
                  )}
                  {table.status === 'cleaning' && (
                    <div className="text-sm text-blue-700 font-medium">Being Cleaned</div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.lastPage > 1 && (
        <div className="mt-6">
          <PaginationWithText
            totalPages={pagination.lastPage}
            initialPage={pagination.currentPage}
            onPageChange={goToPage}
          />
        </div>
      )}
    </div>
  );
}