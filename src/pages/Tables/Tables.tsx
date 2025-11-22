import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import PaginationWithText from '@/components/ui/pagination/PaginationWithText';
import { useTableManagement } from '@/hooks/useTableManagement';
import { useAuth } from '@/hooks/useAuthRedux';
import type { Table } from '@/types/table';
import { ActiveOrdersList } from '@/components/waiter/ActiveOrdersList';

export default function Tables() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'tables' | 'orders'>('tables');

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
    goToPage = () => { },
    fetchTables = () => Promise.resolve(),

    // UI Actions
    setStatusFilter = () => { },

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
        fetchTables();
        setLastRefresh(new Date());
      }, 30000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, fetchTables]);

  // Show success message from navigation state
  useEffect(() => {
    if (location.state?.message) {
      // Message will auto-clear
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Manual refresh handler
  const handleManualRefresh = async () => {
    await fetchTables();
    setLastRefresh(new Date());
  };

  // Handle table click - navigate to orders if available
  const handleTableClick = (table: Table) => {
    if (table.status === 'available') {
      navigate('/orders/new', {
        state: {
          tableId: table.id,
          tableNumber: table.number
        }
      });
    } else if (table.status === 'occupied' && table.currentOrder) {
      navigate(`/orders/${table.currentOrder}`);
    }
  };

  const getPageTitle = () => {
    if (user?.role === 'waiter') {
      return activeTab === 'tables' ? 'Select Table' : 'My Active Orders';
    }
    return 'Tables';
  };

  const getPageDescription = () => {
    if (user?.role === 'waiter') {
      return activeTab === 'tables'
        ? 'Select a table to create a new order'
        : 'Track status of your active orders';
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
  if (loading && tables.length === 0 && activeTab === 'tables') {
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
  if (error && activeTab === 'tables') {
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
    <div className="pb-20"> {/* Padding for potential bottom nav or just spacing */}
      <PageMeta
        title={`${getPageTitle()} | POS System`}
        description={getPageDescription()}
      />

      {/* Waiter Navigation Tabs */}
      {user?.role === 'waiter' && (
        <div className="sticky top-0 z-10 bg-gray-50 pt-2 pb-4 -mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex p-1 bg-white rounded-xl shadow-sm border border-gray-200">
            <button
              onClick={() => setActiveTab('tables')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'tables'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              🍽️ Tables
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'orders'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              📋 My Orders
            </button>
          </div>
        </div>
      )}

      {/* Non-waiter breadcrumb */}
      {user?.role !== 'waiter' && <PageBreadcrumb pageTitle={getPageTitle()} />}

      {/* Success Message */}
      {location.state?.message && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">✅ {location.state.message}</p>
        </div>
      )}

      {/* TABLES VIEW */}
      {activeTab === 'tables' && (
        <>
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
              <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto">
                {[
                  { key: 'all', label: 'All', icon: '🍽️' },
                  { key: 'available', label: 'Free', icon: '✅' },
                  { key: 'occupied', label: 'Busy', icon: '🔴' },
                  { key: 'reserved', label: 'Rsvd', icon: '📅' }
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setStatusFilter(filter.key as typeof statusFilter)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${statusFilter === filter.key
                        ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {filter.icon} {filter.label}
                  </button>
                ))}
              </div>

              {/* Refresh Button */}
              <div className="hidden lg:flex items-center gap-2">
                <button
                  onClick={handleManualRefresh}
                  disabled={loading}
                  className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                >
                  🔄 Refresh
                </button>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="mt-4 flex gap-4 text-sm overflow-x-auto">
              <div className="text-gray-600 whitespace-nowrap">
                Total: <span className="font-medium">{tableStats.total}</span>
              </div>
              <div className="text-green-600 whitespace-nowrap">
                Free: <span className="font-medium">{tableStats.available}</span>
              </div>
              <div className="text-red-600 whitespace-nowrap">
                Busy: <span className="font-medium">{tableStats.occupied}</span>
              </div>
            </div>
          </div>

          {/* Waiter Welcome Message - Only show if no tabs or below tabs */}
          {user?.role === 'waiter' && !activeTab && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 font-medium">👋 Welcome {user.name}!</p>
              <p className="text-blue-600 text-sm">Select a table below to create a new order for your customers.</p>
            </div>
          )}

          {/* Table Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {displayedTables.map((table: Table) => (
              <div
                key={table.id}
                onClick={() => handleTableClick(table)}
                className={`bg-white rounded-xl shadow cursor-pointer hover:shadow-lg transition-all duration-200 border-2 flex flex-col ${table.status === 'available'
                    ? 'border-green-200 hover:border-green-300'
                    : table.status === 'occupied'
                      ? 'border-red-200 hover:border-red-300'
                      : 'border-yellow-200 hover:border-yellow-300'
                  } hover:scale-105 active:scale-95`}
              >
                {/* Table Header */}
                <div className={`p-3 rounded-t-xl flex-1 ${table.status === 'occupied'
                    ? 'bg-red-50'
                    : table.status === 'reserved'
                      ? 'bg-yellow-50'
                      : 'bg-green-50'
                  }`}>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg text-gray-900">T-{table.number}</h3>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${table.status === 'occupied'
                        ? 'bg-red-100 text-red-800'
                        : table.status === 'reserved'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                      {table.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    <p>👥 {table.capacity}p</p>
                  </div>
                </div>

                {/* Table Body */}
                <div className="p-3 border-t border-gray-100">
                  {table.status === 'occupied' && table.currentOrder ? (
                    <div className="text-center">
                      <div className="text-xs font-bold text-gray-700 mb-1">Order #{table.currentOrder}</div>
                      <button className="w-full py-1.5 bg-blue-100 text-blue-700 rounded text-xs font-bold">
                        View
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      {table.status === 'available' ? (
                        <button className="w-full py-1.5 bg-green-100 text-green-700 rounded text-xs font-bold">
                          + Order
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Unavailable</span>
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
        </>
      )}

      {/* ORDERS VIEW */}
      {activeTab === 'orders' && (
        <ActiveOrdersList />
      )}
    </div>
  );
}