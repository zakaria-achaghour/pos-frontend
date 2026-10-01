import assert from 'node:assert/strict';
import axios, { AxiosError, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import apiClient from '../src/api/client';
import { refreshSession } from '../src/api/session';
import { i18nReady, changeLanguage } from '../src/i18n';
import { dynamicT } from '../src/i18n/dynamic';

const response = (config: InternalAxiosRequestConfig, data: unknown, status = 200): AxiosResponse =>
  ({ config, data, status, statusText: String(status), headers: {} });
const reject = (config: InternalAxiosRequestConfig, status: number) => {
  throw new AxiosError('Request failed', undefined, config, undefined, response(config, { message: 'Server English text' }, status));
};

export async function runChecks() {
  await i18nReady;
  localStorage.setItem('auth_token', 'old');
  let refreshes = 0;
  axios.defaults.adapter = async config => {
    refreshes++;
    await new Promise(resolve => setTimeout(resolve, 10));
    return response(config, { access_token: 'fresh' });
  };
  apiClient.defaults.adapter = async config => {
    if (config.headers.Authorization === 'Bearer old') return reject(config, 401);
    return response(config, { ok: true });
  };
  const results = await Promise.all([apiClient.get('/orders'), apiClient.get('/tables'), apiClient.get('/kitchen/tickets')]);
  assert.equal(refreshes, 1, 'Concurrent failures share a refresh');
  assert.equal(results.length, 3);
  assert.equal(localStorage.getItem('auth_token'), 'fresh');

  // A late response for the old JWT reuses the token already refreshed by another request.
  let releaseLate: (() => void) | undefined;
  localStorage.setItem('auth_token', 'old');
  apiClient.defaults.adapter = async config => {
    if (config.url === '/late' && config.headers.Authorization === 'Bearer old') {
      await new Promise<void>(resolve => { releaseLate = resolve; });
      return reject(config, 401);
    }
    return response(config, {});
  };
  const late = apiClient.get('/late');
  await new Promise(resolve => setTimeout(resolve, 0));
  localStorage.setItem('auth_token', 'fresh');
  releaseLate?.();
  await late;
  assert.equal(refreshes, 1, 'Late failures do not refresh again');

  // Login failures are never refreshed, and server prose is localized.
  await changeLanguage('fr');
  apiClient.defaults.adapter = async config => reject(config, 401);
  await assert.rejects(apiClient.post('/login'), error => error instanceof Error && !error.message.includes('Server English'));
  assert.equal(refreshes, 1);
  assert.equal(localStorage.getItem('auth_token'), 'fresh');

  // One retry only, even when the renewed token is rejected.
  localStorage.setItem('auth_token', 'old');
  await assert.rejects(apiClient.get('/orders'));
  assert.equal(refreshes, 2);
  assert.equal(localStorage.getItem('auth_token'), null);

  // Logging out while refresh is in flight must not bring the session back.
  localStorage.setItem('auth_token', 'old');
  const pending = refreshSession('old');
  localStorage.removeItem('auth_token');
  await assert.rejects(pending);
  assert.equal(localStorage.getItem('auth_token'), null);

  // A failed refresh also clears the stale token.
  localStorage.setItem('auth_token', 'expired');
  axios.defaults.adapter = async config => reject(config, 401);
  await assert.rejects(apiClient.get('/orders'));
  assert.equal(localStorage.getItem('auth_token'), null);

  for (const language of ['en', 'fr', 'ar']) {
    await changeLanguage(language);
    assert.notEqual(dynamicT('status.pending'), 'status.pending');
    assert.notEqual(dynamicT('status.not-a-real-status'), 'status.not-a-real-status');
    apiClient.defaults.adapter = async config => {
      throw new AxiosError('Raw English', undefined, config, undefined,
        response(config, { message: 'The value is invalid.', errors: { table_id: ['The table id field is required.'] } }, 422));
    };
    await assert.rejects(apiClient.post('/orders'), error => {
      const e = error as AxiosError<{ message: string; errors: Record<string, string[]> }>;
      assert.notEqual(e.response?.data.message, 'The value is invalid.');
      assert.notEqual(e.response?.data.errors.table_id?.[0], 'The table id field is required.');
      return true;
    });
  }
  process.stdout.write('Session and localization regression checks passed.\n');
}
