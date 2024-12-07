import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { calendarService, CalendarEvent, CreateEventInput, UpdateEventInput } from '../../services/calendarService';
import { RootState } from '..';

interface CalendarState {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
}

const initialState: CalendarState = {
  events: [],
  loading: false,
  error: null,
};

// Async Thunks
export const fetchEventsAsync = createAsyncThunk(
  'calendar/fetchEvents',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Buscando eventos...');
      const events = await calendarService.fetchEvents();
      console.log('Eventos encontrados:', events);
      return events;
    } catch (error: any) {
      console.error('Erro ao buscar eventos:', error);
      return rejectWithValue(error.message || 'Failed to fetch events');
    }
  }
);

export const createEventAsync = createAsyncThunk(
  'calendar/createEvent',
  async (input: CreateEventInput, { getState, rejectWithValue }) => {
    try {
      console.log('Criando evento:', input);
      const event = await calendarService.createEvent(input, getState as any);
      console.log('Evento criado:', event);
      return event;
    } catch (error: any) {
      console.error('Erro ao criar evento:', error);
      return rejectWithValue(error.message || 'Failed to create event');
    }
  }
);

export const updateEventAsync = createAsyncThunk(
  'calendar/updateEvent',
  async (input: UpdateEventInput, { rejectWithValue }) => {
    try {
      console.log('Atualizando evento:', input);
      const event = await calendarService.updateEvent(input);
      console.log('Evento atualizado:', event);
      return event;
    } catch (error: any) {
      console.error('Erro ao atualizar evento:', error);
      return rejectWithValue(error.message || 'Failed to update event');
    }
  }
);

export const deleteEventAsync = createAsyncThunk(
  'calendar/deleteEvent',
  async (id: string, { rejectWithValue }) => {
    try {
      console.log('Excluindo evento:', id);
      await calendarService.deleteEvent(id);
      console.log('Evento excluído com sucesso');
      return id;
    } catch (error: any) {
      console.error('Erro ao excluir evento:', error);
      return rejectWithValue(error.message || 'Failed to delete event');
    }
  }
);

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Events
      .addCase(fetchEventsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventsAsync.fulfilled, (state, action) => {
        state.events = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchEventsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch events';
      })
      // Create Event
      .addCase(createEventAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEventAsync.fulfilled, (state, action) => {
        state.events.push(action.payload);
        state.loading = false;
        state.error = null;
      })
      .addCase(createEventAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create event';
      })
      // Update Event
      .addCase(updateEventAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEventAsync.fulfilled, (state, action) => {
        const index = state.events.findIndex(event => event.id === action.payload.id);
        if (index !== -1) {
          state.events[index] = action.payload;
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(updateEventAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update event';
      })
      // Delete Event
      .addCase(deleteEventAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEventAsync.fulfilled, (state, action) => {
        state.events = state.events.filter(event => event.id !== action.payload);
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteEventAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete event';
      });
  },
});

// Selectors
export const selectEvents = (state: RootState) => state.calendar.events;
export const selectCalendarLoading = (state: RootState) => state.calendar.loading;
export const selectCalendarError = (state: RootState) => state.calendar.error;

export default calendarSlice.reducer;
