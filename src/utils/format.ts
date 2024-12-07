import { format as formatFns } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formats a date string or Date object to a localized date string
 * @param date Date string or Date object
 * @param formatStr Optional format string (default: 'dd/MM/yyyy')
 * @returns Formatted date string
 */
export const formatDate = (date: string | Date | null, formatStr: string = 'dd/MM/yyyy'): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return formatFns(dateObj, formatStr, { locale: ptBR });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Formats a date string or Date object to a localized date and time string
 * @param date Date string or Date object
 * @param formatStr Optional format string (default: 'dd/MM/yyyy HH:mm')
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: string | Date | null, formatStr: string = 'dd/MM/yyyy HH:mm'): string => {
  return formatDate(date, formatStr);
};

/**
 * Formats a number as currency in BRL
 * @param value Number to format
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Formats a number with thousand separators
 * @param value Number to format
 * @param decimalPlaces Number of decimal places (default: 2)
 * @returns Formatted number string
 */
export const formatNumber = (value: number, decimalPlaces: number = 2): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(value);
};

/**
 * Formats a phone number to Brazilian format
 * @param phone Phone number string
 * @returns Formatted phone number
 */
export const formatPhone = (phone: string): string => {
  if (!phone) return '';

  // Remove non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // Format according to length
  if (cleaned.length === 11) {
    // Mobile: (99) 99999-9999
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleaned.length === 10) {
    // Landline: (99) 9999-9999
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }

  return phone;
};

/**
 * Formats a CPF number
 * @param cpf CPF string
 * @returns Formatted CPF
 */
export const formatCPF = (cpf: string): string => {
  if (!cpf) return '';

  // Remove non-numeric characters
  const cleaned = cpf.replace(/\D/g, '');

  // Format: 999.999.999-99
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

/**
 * Formats a CNPJ number
 * @param cnpj CNPJ string
 * @returns Formatted CNPJ
 */
export const formatCNPJ = (cnpj: string): string => {
  if (!cnpj) return '';

  // Remove non-numeric characters
  const cleaned = cnpj.replace(/\D/g, '');

  // Format: 99.999.999/9999-99
  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

/**
 * Formats a CEP number
 * @param cep CEP string
 * @returns Formatted CEP
 */
export const formatCEP = (cep: string): string => {
  if (!cep) return '';

  // Remove non-numeric characters
  const cleaned = cep.replace(/\D/g, '');

  // Format: 99999-999
  return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
};
