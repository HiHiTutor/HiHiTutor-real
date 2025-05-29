import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CaseState, Case } from '../../types';

const initialState: CaseState = {
  cases: [],
  selectedCase: null,
  loading: false,
  error: null,
};

const caseSlice = createSlice({
  name: 'cases',
  initialState,
  reducers: {
    setCases: (state, action: PayloadAction<Case[]>) => {
      state.cases = action.payload;
    },
    setSelectedCase: (state, action: PayloadAction<Case>) => {
      state.selectedCase = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setCases, setSelectedCase, setLoading, setError } = caseSlice.actions;
export default caseSlice.reducer; 