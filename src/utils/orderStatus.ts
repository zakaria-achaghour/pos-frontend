/**
 * Get the color class for a given order status
 */
export const getOrderStatusColor = (status: string): string => {
    switch (status) {
        case 'pending':
            return 'bg-gray-100 text-gray-800';
        case 'accepted':
            return 'bg-blue-100 text-blue-800';
        case 'preparing':
            return 'bg-orange-100 text-orange-800';
        case 'ready':
            return 'bg-purple-100 text-purple-800';
        case 'served':
            return 'bg-indigo-100 text-indigo-800';
        case 'completed':
            return 'bg-green-100 text-green-800';
        case 'cancelled':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

/**
 * Get the color class for a given payment status
 */
export const getPaymentStatusColor = (status: string): string => {
    switch (status) {
        case 'pending':
            return 'bg-yellow-100 text-yellow-800';
        case 'processing':
            return 'bg-blue-100 text-blue-800';
        case 'completed':
            return 'bg-green-100 text-green-800';
        case 'failed':
            return 'bg-red-100 text-red-800';
        case 'refunded':
            return 'bg-orange-100 text-orange-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

/**
 * Get the icon for a given kitchen status
 */
export const getKitchenStatusIcon = (status: string): string => {
    switch (status) {
        case 'pending':
            return '⏳';
        case 'preparing':
            return '👨‍🍳';
        case 'ready':
            return '✅';
        case 'served':
            return '🍽️';
        default:
            return '❓';
    }
};

/**
 * Get a formatted label for the order status
 */
export const getOrderStatusLabel = (status: string): string => {
    if (!status) return '';
    return status.charAt(0).toUpperCase() + status.slice(1);
};
