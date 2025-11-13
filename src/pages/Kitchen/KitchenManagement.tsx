import React from 'react';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { TimeIcon, AlertIcon, BoltIcon } from '@/icons';
import PaginationWithText from '@/components/ui/pagination/PaginationWithText';
import { useKitchenManagement } from '@/hooks/useKitchenManagement';

/**
 * Kitchen Management Page
 * Displays all kitchen tickets with item-level detail and real backend API integration
 * 
 * Backend API Status Flow:
 * - POST /tickets/{id}/start → Changes status from 'pending' to 'preparing'
 * - POST /tickets/{id}/complete → Changes status from 'preparing' to 'ready'
 * 
 * Note: Backend does NOT support individual item status updates.
 * Items inherit the ticket's overall status. The backend manages ticket-level status only.
 * 
 * Data Structure:
 * - Backend returns: ticket.order.order_items[]
 * - API transforms to: ticket.items[] (for frontend compatibility)
 * - Each item includes: menu_item details, quantity, status, customizations
 * 
 * Ticket Status Flow:
 * pending → [Start Prep] → preparing → [Complete Prep] → ready
 */
const KitchenManagement: React.FC = () => {
  const {
    tickets,
    loading,
    error,
    filters,
    pagination,
    autoRefresh,
    setAutoRefresh,
    updateFilters,
    clearError,
    fetchTickets,
    handleStartPreparation,
    handleCompletePreparation,
    goToPage,
  } = useKitchenManagement();

  const selectedDate = filters.date ?? new Date().toISOString().split('T')[0];
  const statusFilter = filters.status ?? 'all';
  const priorityFilter = filters.priority ?? 'all';
  const isLoading = loading.list;

  // Utility functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'preparing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'ready':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'rush':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      default:
        return '';
    }
  };

  const getElapsedTime = (createdAt: string) => {
    const diff = Date.now() - new Date(createdAt).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  // Use tickets directly from backend (already filtered by date on server)
  const displayTickets = tickets;

  const handlePageChange = (page: number) => {
    goToPage(page)
      .catch(() => {
        /* error handled via hook */
      })
      .finally(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <PageMeta title="Kitchen Management | POS System" description="Kitchen order management" />
      <PageBreadcrumb pageTitle="Kitchen Management" />
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Kitchen Orders</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage order preparation and track status</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) =>
                updateFilters({ date: e.target.value || undefined })
              }
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer hover:border-gray-400 dark:hover:border-gray-500"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Status</label>
            <select 
              value={statusFilter}
              onChange={(e) => {
                const value = e.target.value;
                updateFilters({
                  status:
                    value === 'all'
                      ? undefined
                      : (value as 'pending' | 'preparing' | 'ready'),
                });
              }}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer hover:border-gray-400 dark:hover:border-gray-500"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Priority</label>
            <select 
              value={priorityFilter}
              onChange={(e) => {
                const value = e.target.value;
                updateFilters({
                  priority:
                    value === 'all'
                      ? undefined
                      : (value as 'normal' | 'rush' | 'urgent'),
                });
              }}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer hover:border-gray-400 dark:hover:border-gray-500"
            >
              <option value="all">All Priorities</option>
              <option value="normal">Normal</option>
              <option value="rush">Rush</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="ml-auto">
            <div className="flex items-center gap-2">
              {/* Auto-refresh toggle */}
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span>Auto-refresh</span>
              </label>
              
              <button
                onClick={() => {
                  fetchTickets().catch(() => {
                    /* handled inside hook */
                  });
                }}
                disabled={isLoading}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition-colors shadow-sm hover:shadow flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-800 dark:text-red-200">{error}</p>
          <button 
            onClick={clearError}
            className="text-red-600 dark:text-red-400 text-sm underline mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && displayTickets.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : displayTickets.length === 0 ? (
        /* Empty State */
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="text-4xl mb-4">🍽️</div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No tickets found</h3>
          <p className="text-gray-500 dark:text-gray-400">No tickets match the selected filters.</p>
        </div>
      ) : (
        /* Tickets Display */
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing <span className="font-semibold text-gray-900 dark:text-white">{pagination.from}</span> to{' '}
                <span className="font-semibold text-gray-900 dark:text-white">{pagination.to}</span>{' '}
                of <span className="font-semibold text-gray-900 dark:text-white">{pagination.total}</span> tickets
              </p>
            </div>
          </div>

          {displayTickets.map(ticket => (
            <div key={ticket.id} className="bg-white dark:bg-gray-800 rounded-lg shadow">
              {/* Ticket Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                        {ticket.order.table?.number ? `Table ${ticket.order.table.number}` : 
                         ticket.order.type === 'takeout' ? 'Takeout' : 'Delivery'} - Ticket #{ticket.ticket_number}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                      {ticket.priority !== 'normal' && (
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority === 'urgent' ? <AlertIcon className="h-3 w-3" /> : <BoltIcon className="h-3 w-3" />}
                          {ticket.priority.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <TimeIcon className="h-4 w-4" />
                        {getElapsedTime(ticket.created_at)}
                      </span>
                      {ticket.cooking_station && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                          {ticket.cooking_station}
                        </span>
                      )}
                      {ticket.assigned_chef && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs">
                          👨‍🍳 {ticket.assigned_chef.first_name} {ticket.assigned_chef.last_name}
                        </span>
                      )}
                      <span className="text-xs">Order #{ticket.order_id}</span>
                    </div>
                  </div>

                  {/* Ticket-level Actions */}
                  <div className="flex gap-2">
                    {ticket.status === 'pending' && (
                      <button
                        onClick={() => handleStartPreparation(ticket.id)}
                        className="bg-yellow-600 text-white px-4 py-2 text-sm rounded hover:bg-yellow-700 font-medium transition-colors"
                      >
                        Start Prep
                      </button>
                    )}
                    {ticket.status === 'preparing' && (
                      <button
                        onClick={() => handleCompletePreparation(ticket.id)}
                        className="bg-green-600 text-white px-4 py-2 text-sm rounded hover:bg-green-700 font-medium transition-colors"
                      >
                        Complete Prep
                      </button>
                    )}
                    {ticket.status === 'ready' && (
                      <div className="bg-green-600 text-white px-4 py-2 text-sm rounded font-medium">
                        ✓ Ready for Service
                      </div>
                    )}
                  </div>
                </div>

                {/* Special Instructions */}
                {ticket.special_instructions && (
                  <div className="mt-3 flex items-start gap-2 bg-orange-50 dark:bg-orange-900/20 rounded p-2">
                    <AlertIcon className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Ticket Note:</strong> {ticket.special_instructions}
                    </p>
                  </div>
                )}
              </div>

              {/* Ticket Items */}
              <div className="p-4">
                <div className="space-y-3">
                  {ticket.items && ticket.items.length > 0 ? (
                    ticket.items.map(item => (
                      <div key={item.id} className={`border-2 rounded-lg p-3 ${getStatusColor(item.status)} border-current`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900 dark:text-white">{item.menu_item.name}</h4>
                              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">× {item.quantity}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                                {item.status}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {item.menu_item.category.name}
                              </span>
                            </div>
                            
                            {item.menu_item.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{item.menu_item.description}</p>
                            )}
                            
                            {/* Preparation time */}
                            {item.menu_item.preparation_time && (
                              <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                <TimeIcon className="h-3 w-3" />
                                ~{item.menu_item.preparation_time} min
                              </div>
                            )}
                            
                            {/* Customizations */}
                            {item.special_instructions && (
                              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                <strong>Note:</strong> {item.special_instructions}
                              </div>
                            )}
                            {item.removed_ingredients && item.removed_ingredients.length > 0 && (
                              <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                                <strong>Remove:</strong> {item.removed_ingredients.join(', ')}
                              </div>
                            )}
                            {item.added_extras && item.added_extras.length > 0 && (
                              <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                                <strong>Add:</strong> {item.added_extras.join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No items in this ticket</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {pagination.last_page > 1 && (
            <div className="mt-6">
              <PaginationWithText
                totalPages={pagination.last_page}
                initialPage={pagination.current_page}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KitchenManagement;
