import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useOrderManagement } from '@/hooks/useOrderManagement';
import { useAuth } from '@/hooks/useAuthRedux';
import type { Order } from '@/types/order';
import { getOrderStatusColor, getKitchenStatusIcon } from '@/utils/orderStatus';

export const ActiveOrdersList: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        orders,
        loading,
        fetchOrders,
        updateOrderStatus,
        statusFilter,
        setStatusFilter
    } = useOrderManagement(50); // Fetch more items per page for the list

    // Refresh orders on mount and every 30 seconds
    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 30000);
        return () => clearInterval(interval);
    }, [fetchOrders]);

    // Filter orders for the current waiter and exclude completed/cancelled
    const activeOrders = orders.filter(order => {
        // If we have waiter ID in order, filter by it. 
        // For now, we'll show all active orders if we can't filter by waiter strictly,
        // or assume the API might handle it. 
        // Let's filter by status 'active' (not completed/cancelled)
        const isActive = order.status !== 'completed' && order.status !== 'cancelled';
        return isActive;
    });

    const handleServeOrder = async (e: React.MouseEvent, orderId: number) => {
        e.stopPropagation();
        try {
            await updateOrderStatus(orderId, 'served');
            // fetchOrders will be called automatically or we can call it manually if needed
            // but usually hooks handle state updates. 
            // Let's force a refresh just in case to be snappy
            fetchOrders();
        } catch (error) {
            console.error('Failed to update order status:', error);
        }
    };



    if (loading && activeOrders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-500">Loading orders...</p>
            </div>
        );
    }

    if (activeOrders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Orders</h3>
                <p className="text-gray-500 max-w-xs mx-auto">
                    You don't have any active orders right now. Create a new order from the Tables view.
                </p>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Just now';
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return 'Just now';
        }
    };

    return (
        <div className="space-y-4 pb-20"> {/* pb-20 for bottom nav spacing if needed */}
            {/* Refresh Button */}
            <div className="flex justify-end px-2">
                <button
                    onClick={() => fetchOrders()}
                    className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:text-blue-800 active:scale-95 transition-all"
                >
                    🔄 Refresh
                </button>
            </div>

            {activeOrders.map((order) => (
                <div
                    key={order.id}
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className={`bg-white rounded-xl shadow-sm border-2 p-4 cursor-pointer transition-all hover:shadow-md active:scale-[0.98] ${getOrderStatusColor(order.status).replace('bg-', 'border-').replace('text-', 'border-opacity-50 ')}`}
                >
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-lg text-gray-900">
                                    Order #{order.orderNumber || order.id}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getOrderStatusColor(order.status)}`}>
                                    {getKitchenStatusIcon(order.status)} {order.status.toUpperCase()}
                                </span>
                            </div>
                            <div className="text-sm text-gray-600">
                                Table {order.table?.number || 'N/A'} • {formatDate(order.createdAt)}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="font-bold text-lg text-blue-600">
                                {Number(order.total).toFixed(2)} MAD
                            </div>
                            <div className="text-xs text-gray-500 mb-2">
                                {order.items?.length || 0} items
                            </div>
                            {order.status === 'ready' && (
                                <button
                                    onClick={(e) => handleServeOrder(e, order.id)}
                                    className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-sm"
                                >
                                    🍽️ Serve
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Order Items Preview (First 2 items) */}
                    <div className="space-y-1 border-t pt-3">
                        {order.items?.slice(0, 2).map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                                <span className="text-gray-700">
                                    <span className="font-medium text-gray-900">{item.quantity}x</span> {item.menuItem?.name}
                                </span>
                                <span className="text-gray-500">
                                    {Number(item.totalPrice).toFixed(2)}
                                </span>
                            </div>
                        ))}
                        {(order.items?.length || 0) > 2 && (
                            <div className="text-xs text-gray-500 italic mt-1">
                                + {(order.items?.length || 0) - 2} more items...
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
