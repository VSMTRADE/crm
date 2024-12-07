import { supabase } from '../config/supabase';
import { GetState } from '../store';

export type EventType = 'task' | 'meeting' | 'meet_meeting' | 'reminder';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  all_day: boolean;
  type: EventType;
  meet_link?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  task_id?: string;
  contact_id?: string;
  deal_id?: string;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  all_day?: boolean;
  type?: EventType;
  meet_link?: string;
  task_id?: string;
  contact_id?: string;
  deal_id?: string;
}

export interface UpdateEventInput extends Partial<CreateEventInput> {
  id: string;
}

class CalendarService {
  async createEvent(input: CreateEventInput, getState: GetState): Promise<CalendarEvent> {
    const userId = getState().auth.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('calendar_events')
      .insert([{
        ...input,
        created_by: userId,
      }])
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async updateEvent(input: UpdateEventInput): Promise<CalendarEvent> {
    const { id, ...updateData } = input;
    const { data, error } = await supabase
      .from('calendar_events')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async deleteEvent(id: string): Promise<void> {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async fetchEvents(): Promise<CalendarEvent[]> {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .is('deleted_at', null)
      .order('start_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }
}

export const calendarService = new CalendarService();
