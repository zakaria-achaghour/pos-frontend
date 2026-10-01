import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import sidebarSlice from './slices/sidebarSlice';
import themeSlice from './slices/themeSlice';
import { baseApi } from '@/services/baseApi';

const isDevEnvironment = import.meta.env?.MODE !== 'production';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    sidebar: sidebarSlice,
    theme: themeSlice,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(baseApi.middleware),
  devTools: isDevEnvironment,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
