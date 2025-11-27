import React from 'react';
import type { OrderListProps } from '@/types/order';
import { getOrderStatusColor } from '@/utils/orderStatus';

const OrderList: React.FC<OrderListProps> = ({
  items,
  orders: ordersProp,
  loading,
  onEdit,
  onDelete,
  onViewDetails,
  onUpdateStatus,
  onPayment,
  hasFilters,
}) => {
  // Use orders or items, whichever is provided
  const ordersToDisplay = ordersProp || items || [];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (ordersToDisplay.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {hasFilters ? 'No orders found' : 'No orders yet'}
        </h3>
        <p className="text-gray-500 text-center max-w-md">
          {hasFilters
            ? 'Try adjusting your filters or search criteria to find orders.'
            : 'Orders will appear here once they are created. Start by creating a new order from a table.'}
        </p>
      </div>
    );
  }



  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'dine-in':
        return '🍽️';
      case 'takeout':
        return '🥡';
      case 'delivery':
        return '🚚';
      default:
        return '📦';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {ordersToDisplay.map((order) => (
        <div
          key={order.id}
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {order.orderNumber || `Order #${order.id}`}
                </h3>
                <p className="text-sm text-gray-600">
                  {getTypeIcon(order.type)} {order.type?.replace('-', ' ').toUpperCase()}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${getOrderStatusColor(
                  order.status
                )}`}
              >
                {order.status.toUpperCase()}
              </span>
            </div>

            {order.table && (
              <p className="text-sm text-gray-700 font-medium">
                🪑 {order.table.number}
              </p>
            )}
          </div>

          {/* Body */}
          <div className="p-4 space-y-3">
            {/* Customer Info */}
            {order.customer && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">👤 Customer:</span>
                <span className="font-medium text-gray-900">{order.customer.name}</span>
              </div>
            )}

            {/* Server Info */}
            {order.server && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">👨‍🍳 Server:</span>
                <span className="font-medium text-gray-900">{order.server.name}</span>
              </div>
            )}

            {/* Items Count */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">📦 Items:</span>
              <span className="font-medium text-gray-900">{order.items?.length || 0}</span>
            </div>

            {/* Total Amount */}
            <div className="pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Total:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {Number(order.total).toFixed(2)} MAD
                </span>
              </div>
              {order.subtotal && (
                <div className="text-xs text-gray-500 mt-1">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{Number(order.subtotal).toFixed(2)} MAD</span>
                  </div>
                  {(order.tax_amount || order.tax) && Number(order.tax_amount || order.tax) > 0 && (
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>{Number(order.tax_amount || order.tax).toFixed(2)} MAD</span>
                    </div>
                  )}
                  {(order.discount_amount || order.discount) && Number(order.discount_amount || order.discount) > 0 && (
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span>-{Number(order.discount_amount || order.discount).toFixed(2)} MAD</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Payment Status */}
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm text-gray-600">Payment:</span>
              <div className="flex flex-col items-end gap-1">
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${order.payment_method || order.paymentMethod
                    ? 'bg-green-100 text-green-700'
                    : 'bg-orange-100 text-orange-700'
                    }`}
                >
                  {order.payment_method || order.paymentMethod ? 'Paid' : 'Ready to Pay'}
                </span>
                {(order.payment_method || order.paymentMethod) && (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    {(order.payment_method === 'cash' || order.paymentMethod === 'cash') && '💵 Cash'}
                    {(order.payment_method === 'card' || order.paymentMethod === 'card') && '💳 Card'}
                    {(order.payment_method === 'mobile' || order.paymentMethod === 'mobile') && '📱 Mobile'}
                    {(order.payment_method === 'split' || order.paymentMethod === 'split') && '➗ Split'}
                  </span>
                )}
              </div>
            </div>

            {/* Timestamp */}
            <div className="text-xs text-gray-500 pt-2">
              <div>Created: {new Date(order.createdAt).toLocaleString()}</div>
              {order.updatedAt && order.updatedAt !== order.createdAt && (
                <div>Updated: {new Date(order.updatedAt).toLocaleString()}</div>
              )}
            </div>
          </div>

          {/* Footer - Action Buttons */}
          <div className="p-4 bg-gray-50 border-t space-y-2">
            {/* Status Update Buttons */}
            {onUpdateStatus && order.status !== 'completed' && order.status !== 'cancelled' && (
              <div className="grid grid-cols-2 gap-2">
                {order.status === 'pending' && (
                  <button
                    onClick={() => onUpdateStatus(order.id, 'accepted', order.orderNumber || `#${order.id}`)}
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                  >
                    ✓ Accept
                  </button>
                )}
                {order.status === 'accepted' && (
                  <button
                    onClick={() => onUpdateStatus(order.id, 'preparing', order.orderNumber || `#${order.id}`)}
                    className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
                  >
                    👨‍🍳 Preparing
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button
                    onClick={() => onUpdateStatus(order.id, 'ready', order.orderNumber || `#${order.id}`)}
                    className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-200 transition-colors"
                  >
                    ✓ Ready
                  </button>
                )}
                {order.status === 'ready' && (
                  <button
                    onClick={() => onUpdateStatus(order.id, 'served', order.orderNumber || `#${order.id}`)}
                    className="px-3 py-2 bg-teal-100 text-teal-700 rounded-lg text-sm font-medium hover:bg-teal-200 transition-colors"
                  >
                    🍽️ Served
                  </button>
                )}
                {order.status === 'served' && (
                  <button
                    onClick={() => onUpdateStatus(order.id, 'completed', order.orderNumber || `#${order.id}`)}
                    className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                  >
                    ✓ Complete
                  </button>
                )}
                <button
                  onClick={() => onUpdateStatus(order.id, 'cancelled', order.orderNumber || `#${order.id}`)}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                >
                  ✕ Cancel
                </button>
              </div>
            )}

            {/* Payment Button - Show if payment is not processed yet */}
            {onPayment && !order.payment_method && !order.paymentMethod && order.status !== 'cancelled' && (
              <button
                onClick={() => onPayment(order)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                title="Process payment"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                💵 Process Payment ({Number(order.total).toFixed(2)} MAD)
              </button>
            )}

            {/* View/Edit/Delete Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onViewDetails(order)}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                title="View details"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View
              </button>

              <button
                onClick={() => onEdit(order)}
                disabled={order.status !== 'pending' && order.status !== 'accepted'}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${order.status === 'pending' || order.status === 'accepted'
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                title={order.status === 'pending' || order.status === 'accepted' ? 'Edit order' : 'Cannot edit order after preparing'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>

              <button
                onClick={() => onDelete(order.id, order.orderNumber || `#${order.id}`)}
                disabled={order.status !== 'pending' && order.status !== 'accepted'}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${order.status === 'pending' || order.status === 'accepted'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                title={order.status === 'pending' || order.status === 'accepted' ? 'Delete order' : 'Cannot delete order after preparing'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderList;
