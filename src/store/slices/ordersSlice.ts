import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Order, OrderItem, createOrder, updateOrder as updateOrderService, deleteOrder as deleteOrderService, fetchOrders } from '../../services/ordersService';

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  orders: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchOrdersAsync = createAsyncThunk(
  'orders/fetchOrders',
  async () => {
    const orders = await fetchOrders();
    return orders;
  }
);

export const createOrderAsync = createAsyncThunk(
  'orders/createOrder',
  async (orderData: Order) => {
    const newOrder = await createOrder(orderData);
    return newOrder;
  }
);

export const updateOrderAsync = createAsyncThunk(
  'orders/updateOrder',
  async ({ id, orderData }: { id: string; orderData: Partial<Order> }) => {
    const updatedOrder = await updateOrderService(id, orderData);
    return updatedOrder;
  }
);

export const deleteOrderAsync = createAsyncThunk(
  'orders/deleteOrder',
  async (id: string) => {
    await deleteOrderService(id);
    return id;
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch orders
    builder.addCase(fetchOrdersAsync.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchOrdersAsync.fulfilled, (state, action) => {
      state.loading = false;
      state.orders = action.payload;
    });
    builder.addCase(fetchOrdersAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch orders';
    });

    // Create order
    builder.addCase(createOrderAsync.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createOrderAsync.fulfilled, (state, action) => {
      state.loading = false;
      state.orders.unshift(action.payload);
    });
    builder.addCase(createOrderAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to create order';
    });

    // Update order
    builder.addCase(updateOrderAsync.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateOrderAsync.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.orders.findIndex((order) => order.id === action.payload.id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
    });
    builder.addCase(updateOrderAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to update order';
    });

    // Delete order
    builder.addCase(deleteOrderAsync.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteOrderAsync.fulfilled, (state, action) => {
      state.loading = false;
      state.orders = state.orders.filter((order) => order.id !== action.payload);
    });
    builder.addCase(deleteOrderAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to delete order';
    });
  },
});

export const { clearError } = ordersSlice.actions;
export default ordersSlice.reducer;
