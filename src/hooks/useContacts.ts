import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { fetchContactsAsync } from '../store/slices/contactsSlice';

export const useContacts = () => {
  const dispatch = useDispatch();
  const { contacts, loading, error } = useSelector((state: RootState) => state.contacts);

  useEffect(() => {
    dispatch(fetchContactsAsync());
  }, [dispatch]);

  return { contacts, loading, error };
};
