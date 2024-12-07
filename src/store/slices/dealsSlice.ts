import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Deal {
  id: string;
  title: string;
  description?: string;
  value?: number;
  status: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  contact_id?: string;
  responsible_id?: string;
  expected_close_date?: string;
  probability?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  // Campos relacionados
  contacts?: {
    id: string;
    name: string;
    email: string;
  };
  responsible?: {
    id: string;
    email: string;
    name: string;
  };
}

interface DealsState {
  deals: Deal[];
  loading: boolean;
  error: string | null;
}

const initialState: DealsState = {
  deals: [],
  loading: false,
  error: null,
};

const dealsSlice = createSlice({
  name: 'deals',
  initialState,
  reducers: {
    setDeals: (state, action: PayloadAction<Deal[]>) => {
      state.deals = action.payload;
    },
    addDeal: (state, action: PayloadAction<Deal>) => {
      state.deals.unshift(action.payload);
    },
    updateDeal: (state, action: PayloadAction<Deal>) => {
      const index = state.deals.findIndex(deal => deal.id === action.payload.id);
      if (index !== -1) {
        state.deals[index] = action.payload;
      }
    },
    deleteDeal: (state, action: PayloadAction<string>) => {
      state.deals = state.deals.filter(deal => deal.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setDeals,
  addDeal,
  updateDeal,
  deleteDeal,
  setLoading,
  setError,
} = dealsSlice.actions;

export default dealsSlice.reducer;
