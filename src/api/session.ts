import axios from 'axios';
import { apiConfig } from '@/config';

let pending: { token: string; promise: Promise<string> } | undefined;

/** Coalesce concurrent 401s. Refresh uses a separate client to avoid interceptor recursion. */
export function refreshSession(token: string): Promise<string> {
  if (pending?.token === token) return pending.promise;
  const promise = axios.post<{ access_token: string }>('/refresh', undefined, {
    baseURL: apiConfig.baseUrl,
    timeout: apiConfig.timeout,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  }).then(({ data }) => {
    if (!data.access_token) throw new Error('Invalid refresh response');
    // A logout or a different login while refreshing must not resurrect the old session.
    if (localStorage.getItem('auth_token') !== token) throw new Error('Session changed');
    localStorage.setItem('auth_token', data.access_token);
    return data.access_token;
  }).finally(() => {
    if (pending?.promise === promise) pending = undefined;
  });
  pending = { token, promise };
  return promise;
}

export function expireSession(token: string): void {
  if (localStorage.getItem('auth_token') !== token) return;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  if (window.location.pathname !== '/login') window.location.assign('/login');
}
