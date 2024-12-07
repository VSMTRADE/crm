import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import contactsReducer from './slices/contactsSlice';
import dealsReducer from './slices/dealsSlice';
import ordersReducer from './slices/ordersSlice';
import settingsReducer from './slices/settingsSlice';
import tasksReducer from './slices/tasksSlice';
import calendarReducer from './slices/calendarSlice';
import notificationsReducer from './slices/notificationsSlice';
import reportsReducer from './slices/reportsSlice';
import employeesReducer from './slices/employeesSlice';
import hrReducer from './slices/hrSlice';
import documentsReducer from './slices/documentsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    contacts: contactsReducer,
    deals: dealsReducer,
    orders: ordersReducer,
    settings: settingsReducer,
    tasks: tasksReducer,
    calendar: calendarReducer,
    notifications: notificationsReducer,
    reports: reportsReducer,
    employees: employeesReducer,
    hr: hrReducer,
    documents: documentsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
