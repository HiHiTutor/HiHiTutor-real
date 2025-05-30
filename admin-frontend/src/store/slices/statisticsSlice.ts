import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StatisticsState, DashboardStatistics } from '../../types';

const initialState: StatisticsState = {
  statistics: null,
  loading: false,
  error: null,
};

const statisticsSlice = createSlice({
  name: 'statistics',
  initialState,
  reducers: {
    setStatistics: (state, action: PayloadAction<DashboardStatistics>) => {
      state.statistics = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setStatistics, setLoading, setError } = statisticsSlice.actions;
export default statisticsSlice.reducer; 