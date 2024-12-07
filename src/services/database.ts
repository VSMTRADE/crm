export { supabase } from '../config/supabase';

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category_id?: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export interface Sale {
  id: string;
  customer_id: string;
  total_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  payment_method?: string;
  notes?: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export const databaseService = {
  // Categories
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*');
    
    if (error) throw error;
    return data;
  },

  async createCategory(category: Omit<Category, 'id'>) {
    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .single();
    
    if (error) throw error;
    return data;
  },

  // Products
  async getProducts() {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name
        )
      `);
    
    if (error) throw error;
    return data;
  },

  async createProduct(product: Omit<Product, 'id'>) {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateProduct(id: string, product: Partial<Omit<Product, 'id'>>) {
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Customers
  async getCustomers() {
    const { data, error } = await supabase
      .from('customers')
      .select('*');
    
    if (error) throw error;
    return data;
  },

  async createCustomer(customer: Omit<Customer, 'id'>) {
    const { data, error } = await supabase
      .from('customers')
      .insert([customer])
      .single();
    
    if (error) throw error;
    return data;
  },

  // Sales
  async getSales() {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        customers (
          id,
          name
        ),
        sale_items (
          *,
          products (
            id,
            name
          )
        )
      `);
    
    if (error) throw error;
    return data;
  },

  async createSale(sale: Omit<Sale, 'id'>, items: Omit<SaleItem, 'id' | 'sale_id'>[]) {
    const { data: newSale, error: saleError } = await supabase
      .from('sales')
      .insert([sale])
      .single();

    if (saleError) throw saleError;

    const saleItems = items.map(item => ({
      ...item,
      sale_id: newSale.id
    }));

    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItems);

    if (itemsError) throw itemsError;

    return newSale;
  }
};
