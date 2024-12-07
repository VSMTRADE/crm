import { supabase } from '../config/supabase';
import { Contact } from '../store/slices/contactsSlice';
import { AppDispatch, RootState } from '../store';
import { 
  fetchContactsAsync,
  createContactAsync,
  updateContactAsync,
  deleteContactAsync
} from '../store/slices/contactsSlice';

export const contactsService = {
  async fetchContacts(dispatch: AppDispatch) {
    dispatch(fetchContactsAsync());
  },

  async createContact(dispatch: AppDispatch, getState: () => RootState, contact: Omit<Contact, 'id'>) {
    const state = getState();
    const user = state.auth.user;
    if (!user) throw new Error('User not authenticated');

    const contactWithUserId = {
      ...contact,
      user_id: user.id
    };

    dispatch(createContactAsync(contactWithUserId));
  },

  async updateContact(dispatch: AppDispatch, contact: Contact) {
    dispatch(updateContactAsync({ id: contact.id, contact }));
  },

  async deleteContact(dispatch: AppDispatch, id: string) {
    dispatch(deleteContactAsync(id));
  }
};
