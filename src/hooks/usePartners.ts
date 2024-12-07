import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export interface Partner {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: string;
}

export const usePartners = () => {
  const contacts = useSelector((state: RootState) => state.contacts.contacts);
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    // Filtra apenas contatos do tipo 'parceiro'
    const filteredPartners = contacts
      .filter(contact => contact.type.toLowerCase() === 'parceiro')
      .map(contact => ({
        id: contact.id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        type: contact.type
      }));
    
    setPartners(filteredPartners);
  }, [contacts]);

  return { partners };
};
