import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import caseReducer from './slices/caseSlice';
import statisticsReducer from './slices/statisticsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    cases: caseReducer,
    statistics: statisticsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 