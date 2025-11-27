import apiClient from './client';
import type { ApiResponse } from './client';
import type {
  CashierShift,
  ShiftResponse,
  OpenShiftPayload,
  CloseShiftPayload,
  CashierDashboardData,
} from '@/types/cashier';

const unwrapShift = (payload: any): CashierShift | null => {
  if (!payload) return null;
  if ('shift' in payload) {
    return payload.shift;
  }
  if ('data' in payload && payload.data?.shift !== undefined) {
    return payload.data.shift;
  }
  return payload as CashierShift;
};

export const cashierAPI = {
  getCurrentShift: async (): Promise<CashierShift | null> => {
    const response = await apiClient.get<ApiResponse<ShiftResponse> | ShiftResponse>(
      '/cashier/shifts/current',
    );
    return unwrapShift(response.data);
  },

  openShift: async (payload: OpenShiftPayload): Promise<CashierShift> => {
    const response = await apiClient.post<ApiResponse<CashierShift> | { shift: CashierShift }>(
      '/cashier/shifts/open',
      payload,
    );
    return unwrapShift(response.data) as CashierShift;
  },

  closeShift: async (payload: CloseShiftPayload): Promise<CashierShift> => {
    const response = await apiClient.post<ApiResponse<CashierShift> | { shift: CashierShift }>(
      '/cashier/shifts/close',
      payload,
    );
    return unwrapShift(response.data) as CashierShift;
  },

  getTodayDashboard: async (options: { scope?: 'self' | 'all'; cashier_id?: number } = {}): Promise<CashierDashboardData> => {
    const params = new URLSearchParams();
    if (options.scope) params.append('scope', options.scope);
    if (options.cashier_id) params.append('cashier_id', options.cashier_id.toString());

    const query = params.toString();
    const response = await apiClient.get<ApiResponse<CashierDashboardData> | CashierDashboardData>(
      `/cashier/dashboard/today${query ? `?${query}` : ''}`,
    );

    if ('data' in response.data && response.data.data) {
      return response.data.data;
    }

    return response.data as CashierDashboardData;
  },
};

export default cashierAPI;
