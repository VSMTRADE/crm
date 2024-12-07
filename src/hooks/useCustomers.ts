import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  type: string;
}

export const useCustomers = () => {
  const contacts = useSelector((state: RootState) => state.contacts.contacts);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    // Filtra apenas contatos do tipo 'cliente'
    const filteredCustomers = contacts
      .filter(contact => contact.type.toLowerCase() === 'cliente')
      .map(contact => ({
        id: contact.id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        type: contact.type
      }));
    
    setCustomers(filteredCustomers);
  }, [contacts]);

  return { customers };
};
