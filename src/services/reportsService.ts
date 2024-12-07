import { supabase } from '../config/supabase';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface ReportFilter {
  startDate: Date | null;
  endDate: Date | null;
  type: string;
}

export interface SalesData {
  month: string;
  value: number;
}

export interface LeadsData {
  name: string;
  value: number;
}

class ReportsService {
  async getSalesByMonth(startDate: Date | null, endDate: Date | null): Promise<SalesData[]> {
    const start = startDate || subMonths(new Date(), 11);
    const end = endDate || new Date();

    const { data, error } = await supabase
      .from('orders')
      .select('created_at, value')
      .gte('created_at', startOfMonth(start).toISOString())
      .lte('created_at', endOfMonth(end).toISOString())
      .order('created_at');

    if (error) throw error;

    // Agrupa os dados por mês
    const salesByMonth = new Map<string, number>();
    data?.forEach(order => {
      const month = format(new Date(order.created_at), 'MMMM/yyyy', { locale: ptBR });
      const currentValue = salesByMonth.get(month) || 0;
      salesByMonth.set(month, currentValue + (order.value || 0));
    });

    return Array.from(salesByMonth.entries()).map(([month, value]) => ({
      month,
      value,
    }));
  }

  async getLeadsBySource(): Promise<LeadsData[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('source')
      .eq('type', 'lead');

    if (error) throw error;

    const sourceCounts = new Map<string, number>();
    data?.forEach(contact => {
      const source = contact.source || 'Outros';
      const currentCount = sourceCounts.get(source) || 0;
      sourceCounts.set(source, currentCount + 1);
    });

    return Array.from(sourceCounts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }

  async getDealsStatus(): Promise<LeadsData[]> {
    const { data, error } = await supabase
      .from('deals')
      .select('status')
      .not('status', 'is', null);

    if (error) throw error;

    const statusCounts = new Map<string, number>();
    data?.forEach(deal => {
      const status = deal.status || 'Outros';
      const currentCount = statusCounts.get(status) || 0;
      statusCounts.set(status, currentCount + 1);
    });

    return Array.from(statusCounts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }

  async getTopProducts(limit: number = 5): Promise<{ name: string; value: number }[]> {
    const { data, error } = await supabase
      .from('order_items')
      .select('product_name, quantity')
      .order('quantity', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data?.map(item => ({
      name: item.product_name,
      value: item.quantity,
    })) || [];
  }

  async getRevenueTrend(months: number = 12): Promise<{ date: string; value: number }[]> {
    const startDate = subMonths(new Date(), months - 1);
    const { data, error } = await supabase
      .from('orders')
      .select('created_at, value')
      .gte('created_at', startOfMonth(startDate).toISOString())
      .lte('created_at', endOfMonth(new Date()).toISOString())
      .order('created_at');

    if (error) throw error;

    const revenueByMonth = new Map<string, number>();
    data?.forEach(order => {
      const month = format(new Date(order.created_at), 'MMM/yyyy', { locale: ptBR });
      const currentValue = revenueByMonth.get(month) || 0;
      revenueByMonth.set(month, currentValue + (order.value || 0));
    });

    return Array.from(revenueByMonth.entries()).map(([date, value]) => ({
      date,
      value,
    }));
  }
}

export const reportsService = new ReportsService();
