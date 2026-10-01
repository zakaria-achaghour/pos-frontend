import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import type { AxiosError } from 'axios';
import { handleApiError } from '@/api/client';

export interface ApiError {
  status?: number;
  message: string;
  errors?: Record<string, string[]>;
}

export const toApiError = (e: unknown): ApiError => {
  const err = e as AxiosError<{ errors?: Record<string, string[]> }>;
  const status = err.response?.status;
  const errors = err.response?.data?.errors;
  return {
    ...(status !== undefined && { status }),
    message: err.response ? handleApiError(err) : err.message || 'An unexpected error occurred.',
    ...(errors && { errors }),
  };
};

/** Wrap an axios call into the { data } | { error } shape RTK Query expects. */
export async function run<T>(fn: () => Promise<T>): Promise<{ data: T } | { error: ApiError }> {
  try {
    return { data: await fn() };
  } catch (e) {
    return { error: toApiError(e) };
  }
}

/**
 * One API slice for the whole app. Requests go through the shared axios client
 * (src/api/client.ts), so auth headers and 401 handling stay in one place.
 * Tags decide what refetches: e.g. changing an order status invalidates
 * Orders, Tables and Kitchen together.
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fakeBaseQuery<ApiError>(),
  tagTypes: ['Orders', 'Tables', 'Kitchen', 'Menu', 'Categories', 'Staff', 'Roles', 'Permissions', 'Restaurants', 'Shifts'],
  keepUnusedDataFor: 60,
  refetchOnReconnect: true,
  endpoints: () => ({}),
});

/** Default polling for live screens (kitchen, orders, tables) */
export const LIVE_POLL_MS = 15000;
