export const CASHIER_DASHBOARD_REFRESH_EVENT = 'cashier:dashboard:refresh';

export const emitCashierDashboardRefresh = () => {
  window.dispatchEvent(new CustomEvent(CASHIER_DASHBOARD_REFRESH_EVENT));
};
