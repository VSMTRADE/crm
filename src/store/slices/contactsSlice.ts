import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../services/database';

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  notes?: string;
  type: string;
  created_at?: string;
  updated_at?: string;
}

interface ContactsState {
  contacts: Contact[];
  loading: boolean;
  error: string | null;
}

const initialState: ContactsState = {
  contacts: [],
  loading: false,
  error: null
};

// Async thunk for fetching contacts
export const fetchContactsAsync = createAsyncThunk(
  'contacts/fetchContacts',
  async () => {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  }
);

// Async thunk for creating a contact
export const createContactAsync = createAsyncThunk(
  'contacts/createContact',
  async (contact: Omit<Contact, 'id'>) => {
    const { data, error } = await supabase
      .from('contacts')
      .insert([contact])
      .single();

    if (error) throw error;
    return data;
  }
);

// Async thunk for updating a contact
export const updateContactAsync = createAsyncThunk(
  'contacts/updateContact',
  async ({ id, contact }: { id: string; contact: Partial<Contact> }) => {
    const { data, error } = await supabase
      .from('contacts')
      .update(contact)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }
);

// Async thunk for deleting a contact
export const deleteContactAsync = createAsyncThunk(
  'contacts/deleteContact',
  async (id: string) => {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return id;
  }
);

const contactsSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch contacts
    builder.addCase(fetchContactsAsync.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchContactsAsync.fulfilled, (state, action) => {
      state.loading = false;
      state.contacts = action.payload.filter(contact => contact && contact.id);
    });
    builder.addCase(fetchContactsAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch contacts';
    });

    // Create contact
    builder.addCase(createContactAsync.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createContactAsync.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload && action.payload.id) {
        state.contacts.push(action.payload);
      }
    });
    builder.addCase(createContactAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to create contact';
    });

    // Update contact
    builder.addCase(updateContactAsync.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateContactAsync.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload && action.payload.id) {
        const index = state.contacts.findIndex(contact => contact.id === action.payload.id);
        if (index !== -1) {
          state.contacts[index] = action.payload;
        }
      }
    });
    builder.addCase(updateContactAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to update contact';
    });

    // Delete contact
    builder.addCase(deleteContactAsync.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteContactAsync.fulfilled, (state, action) => {
      state.loading = false;
      state.contacts = state.contacts.filter(contact => contact.id !== action.payload);
    });
    builder.addCase(deleteContactAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to delete contact';
    });
  }
});

export const { clearError } = contactsSlice.actions;
export default contactsSlice.reducer;
