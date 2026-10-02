/**
 * Get the color class for a given order status
 */
export const getOrderStatusColor = (status: string): string => {
    switch (status) {
        case 'pending':
            return 'bg-surface-2 text-fg';
        case 'accepted':
            return 'bg-primary/10 text-primary';
        case 'preparing':
            return 'bg-warning/10 text-warning';
        case 'ready':
            return 'bg-sec-staff/10 text-sec-staff';
        case 'served':
            return 'bg-primary/10 text-primary';
        case 'completed':
            return 'bg-success/10 text-success';
        case 'cancelled':
            return 'bg-danger/10 text-danger';
        default:
            return 'bg-surface-2 text-fg';
    }
};

/**
 * Get the color class for a given payment status
 */
export const getPaymentStatusColor = (status: string): string => {
    switch (status) {
        case 'pending':
            return 'bg-warning/10 text-warning';
        case 'processing':
            return 'bg-primary/10 text-primary';
        case 'completed':
            return 'bg-success/10 text-success';
        case 'failed':
            return 'bg-danger/10 text-danger';
        case 'refunded':
            return 'bg-warning/10 text-warning';
        default:
            return 'bg-surface-2 text-fg';
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
