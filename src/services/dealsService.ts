import { supabase } from '../config/supabase';
import { AppDispatch, RootState } from '../store';
import { setDeals, setLoading, setError, addDeal, updateDeal, deleteDeal } from '../store/slices/dealsSlice';

export interface Deal {
  id: string;
  title: string;
  description?: string;
  value?: number;
  status: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  contact_id?: string;
  user_id?: string;
  expected_close_date?: string;
  probability?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export const dealsService = {
  async fetchDeals(dispatch: AppDispatch) {
    try {
      dispatch(setLoading(true));
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          contacts (
            id,
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      dispatch(setDeals(data));
    } catch (error) {
      console.error('Error fetching deals:', error);
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  },

  async createDeal(dispatch: AppDispatch, getState: () => RootState, deal: Omit<Deal, 'id' | 'user_id'>) {
    try {
      dispatch(setLoading(true));
      
      const state = getState();
      const user = state.auth.user;
      if (!user) throw new Error('User not authenticated');
      
      // Log dos dados antes de enviar
      console.log('Creating deal with data:', deal);
      
      // Validar e limpar os dados
      const cleanDeal = {
        ...deal,
        user_id: user.id,
        description: deal.description || null,
        value: deal.value ? Number(deal.value) : null,
        contact_id: deal.contact_id || null,
        expected_close_date: deal.expected_close_date || null,
        probability: deal.probability ? Number(deal.probability) : null,
        notes: deal.notes || null
      };

      console.log('Cleaned deal data:', cleanDeal);

      const { data, error } = await supabase
        .from('deals')
        .insert(cleanDeal)
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }

      // Buscar os dados relacionados separadamente
      const { data: dealWithRelations, error: relationsError } = await supabase
        .from('deals')
        .select(`
          *,
          contacts (
            id,
            name,
            email
          )
        `)
        .eq('id', data.id)
        .single();

      if (relationsError) throw relationsError;
      
      dispatch(addDeal(dealWithRelations));
      return dealWithRelations;
    } catch (error) {
      console.error('Error creating deal:', error);
      dispatch(setError(error.message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  },

  async updateDeal(dispatch: AppDispatch, id: string, deal: Partial<Omit<Deal, 'id' | 'user_id'>>) {
    try {
      dispatch(setLoading(true));
      
      // Validar e limpar os dados
      const cleanDeal = {
        title: deal.title,
        description: deal.description || null,
        value: deal.value ? Number(deal.value) : null,
        status: deal.status,
        contact_id: deal.contact_id || null,
        expected_close_date: deal.expected_close_date || null,
        probability: deal.probability ? Number(deal.probability) : null,
        notes: deal.notes || null
      };

      const { data, error } = await supabase
        .from('deals')
        .update(cleanDeal)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;

      // Buscar os dados relacionados separadamente
      const { data: dealWithRelations, error: relationsError } = await supabase
        .from('deals')
        .select(`
          *,
          contacts (
            id,
            name,
            email
          )
        `)
        .eq('id', data.id)
        .single();

      if (relationsError) throw relationsError;
      
      dispatch(updateDeal(dealWithRelations));
      return dealWithRelations;
    } catch (error) {
      console.error('Error updating deal:', error);
      dispatch(setError(error.message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  },

  async deleteDeal(dispatch: AppDispatch, id: string) {
    try {
      dispatch(setLoading(true));
      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      dispatch(deleteDeal(id));
    } catch (error) {
      console.error('Error deleting deal:', error);
      dispatch(setError(error.message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
};
