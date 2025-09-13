import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

let isRefreshing = false;
let refreshQueue: Array<() => void> = [];

function queueRefresh(cb: () => void) {
  refreshQueue.push(cb);
}

function flushQueue() {
  refreshQueue.forEach((cb) => cb());
  refreshQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { response, config } = error || {};
    if (response?.status === 401 && !config.__isRetry) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          await fetch("/api/auth/refresh", { credentials: "include" });
          flushQueue();
        } finally {
          isRefreshing = false;
        }
      }
      await new Promise<void>((resolve) => queueRefresh(resolve));
      return api({ ...config, __isRetry: true });
    }
    return Promise.reject(error);
  }
);

export default api;

