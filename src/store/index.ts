import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import sidebarSlice from './slices/sidebarSlice';
import themeSlice from './slices/themeSlice';
import staffSlice from './slices/staffSlice';
import restaurantSlice from './slices/restaurantSlice';
import menuSlice from './slices/menuSlice';
import orderSlice from './slices/orderSlice';
import tableSlice from './slices/tableSlice';
import dashboardSlice from './slices/dashboardSlice';
import kitchenSlice from './slices/kitchenSlice';
import attendanceSlice from './slices/attendanceSlice';
import scheduleSlice from './slices/scheduleSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    sidebar: sidebarSlice,
    theme: themeSlice,
    staff: staffSlice,
    restaurant: restaurantSlice,
    menu: menuSlice,
    orders: orderSlice,
    tables: tableSlice,
    dashboard: dashboardSlice,
    kitchen: kitchenSlice,
    attendance: attendanceSlice,
    schedules: scheduleSlice,
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