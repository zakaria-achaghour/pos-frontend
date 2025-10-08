import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import sidebarSlice from './slices/sidebarSlice';
import themeSlice from './slices/themeSlice';
import staffSlice from './slices/staffSlice';
import restaurantSlice from './slices/restaurantSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    sidebar: sidebarSlice,
    theme: themeSlice,
    staff: staffSlice,
    restaurant: restaurantSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;