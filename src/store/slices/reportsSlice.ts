import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { reportsService, ReportFilter, SalesData, LeadsData } from '../../services/reportsService';

interface ReportsState {
  salesData: SalesData[];
  leadsData: LeadsData[];
  dealsData: LeadsData[];
  topProducts: { name: string; value: number }[];
  revenueTrend: { date: string; value: number }[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ReportsState = {
  salesData: [],
  leadsData: [],
  dealsData: [],
  topProducts: [],
  revenueTrend: [],
  isLoading: false,
  error: null,
};

// Async Thunks
export const fetchSalesDataAsync = createAsyncThunk(
  'reports/fetchSalesData',
  async ({ startDate, endDate }: Partial<ReportFilter>, { rejectWithValue }) => {
    try {
      return await reportsService.getSalesByMonth(startDate || null, endDate || null);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch sales data');
    }
  }
);

export const fetchLeadsDataAsync = createAsyncThunk(
  'reports/fetchLeadsData',
  async (_, { rejectWithValue }) => {
    try {
      return await reportsService.getLeadsBySource();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch leads data');
    }
  }
);

export const fetchDealsDataAsync = createAsyncThunk(
  'reports/fetchDealsData',
  async (_, { rejectWithValue }) => {
    try {
      return await reportsService.getDealsStatus();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch deals data');
    }
  }
);

export const fetchTopProductsAsync = createAsyncThunk(
  'reports/fetchTopProducts',
  async (limit: number = 5, { rejectWithValue }) => {
    try {
      return await reportsService.getTopProducts(limit);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch top products');
    }
  }
);

export const fetchRevenueTrendAsync = createAsyncThunk(
  'reports/fetchRevenueTrend',
  async (months: number = 12, { rejectWithValue }) => {
    try {
      return await reportsService.getRevenueTrend(months);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch revenue trend');
    }
  }
);

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Sales Data
      .addCase(fetchSalesDataAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSalesDataAsync.fulfilled, (state, action) => {
        state.salesData = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchSalesDataAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Leads Data
      .addCase(fetchLeadsDataAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLeadsDataAsync.fulfilled, (state, action) => {
        state.leadsData = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchLeadsDataAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Deals Data
      .addCase(fetchDealsDataAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDealsDataAsync.fulfilled, (state, action) => {
        state.dealsData = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchDealsDataAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Top Products
      .addCase(fetchTopProductsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTopProductsAsync.fulfilled, (state, action) => {
        state.topProducts = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchTopProductsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Revenue Trend
      .addCase(fetchRevenueTrendAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRevenueTrendAsync.fulfilled, (state, action) => {
        state.revenueTrend = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchRevenueTrendAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default reportsSlice.reducer;
