import { supabase } from '../config/supabase';
import { RootState } from '../store';

export interface Order {
  id?: string;
  title: string;
  description?: string;
  value: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  contact_id: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price?: number;
}

export const fetchOrders = async () => {
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      contacts (
        id,
        name,
        email,
        company
      ),
      order_items (*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }

  return orders;
};

export const createOrder = async (orderData: Order, getState: () => RootState) => {
  const state = getState();
  const user = state.auth.user;
  if (!user) throw new Error('User not authenticated');

  // Prepare order data
  const { items, ...orderDetails } = orderData;
  const order = {
    ...orderDetails,
    user_id: user.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Insert order
  const { data: newOrder, error: orderError } = await supabase
    .from('orders')
    .insert([order])
    .single();

  if (orderError) {
    console.error('Error creating order:', orderError);
    throw orderError;
  }

  // Insert order items if they exist
  if (items && items.length > 0) {
    const orderItems = items.map(item => ({
      ...item,
      order_id: newOrder.id,
      total_price: item.quantity * item.unit_price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      throw itemsError;
    }
  }

  return newOrder;
};

export const updateOrder = async (id: string, orderData: Partial<Order>) => {
  const { items, ...orderDetails } = orderData;
  const order = {
    ...orderDetails,
    updated_at: new Date().toISOString()
  };

  // Update order
  const { data: updatedOrder, error: orderError } = await supabase
    .from('orders')
    .update(order)
    .eq('id', id)
    .single();

  if (orderError) {
    console.error('Error updating order:', orderError);
    throw orderError;
  }

  // Update order items if they exist
  if (items) {
    // First delete existing items
    const { error: deleteError } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', id);

    if (deleteError) {
      console.error('Error deleting order items:', deleteError);
      throw deleteError;
    }

    // Then insert new items
    const orderItems = items.map(item => ({
      ...item,
      order_id: id,
      total_price: item.quantity * item.unit_price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error updating order items:', itemsError);
      throw itemsError;
    }
  }

  return updatedOrder;
};

export const deleteOrder = async (id: string) => {
  // Delete order items first
  const { error: itemsError } = await supabase
    .from('order_items')
    .delete()
    .eq('order_id', id);

  if (itemsError) {
    console.error('Error deleting order items:', itemsError);
    throw itemsError;
  }

  // Then delete the order
  const { error: orderError } = await supabase
    .from('orders')
    .delete()
    .eq('id', id);

  if (orderError) {
    console.error('Error deleting order:', orderError);
    throw orderError;
  }
};
