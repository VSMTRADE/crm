import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type TransactionType = 'entrada' | 'saida';
export type TransactionCategory = 'vendas' | 'servicos' | 'outros_ganhos' | 'despesas_fixas' | 'despesas_variaveis' | 'impostos' | 'fornecedores' | 'outros_gastos';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  amount: number;
  date: string;
  status: 'pendente' | 'pago' | 'atrasado';
  recurrent: boolean;
  dealId?: string;
  attachments?: string[];
  notes?: string;
}

interface FinanceState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
}

const initialTransactions: Transaction[] = [
  {
    id: '1',
    type: 'entrada',
    category: 'vendas',
    description: 'Projeto Website E-commerce',
    amount: 15000,
    date: '2024-02-15',
    status: 'pago',
    recurrent: false,
    dealId: '1',
  },
  {
    id: '2',
    type: 'entrada',
    category: 'servicos',
    description: 'Consultoria em Marketing',
    amount: 5000,
    date: '2024-01-20',
    status: 'pago',
    recurrent: false,
    dealId: '2',
  },
  {
    id: '3',
    type: 'saida',
    category: 'despesas_fixas',
    description: 'Aluguel Escritório',
    amount: 2500,
    date: '2024-02-01',
    status: 'pago',
    recurrent: true,
  },
  {
    id: '4',
    type: 'saida',
    category: 'despesas_variaveis',
    description: 'Material de Escritório',
    amount: 500,
    date: '2024-02-10',
    status: 'pago',
    recurrent: false,
  },
];

const initialState: FinanceState = {
  transactions: initialTransactions,
  loading: false,
  error: null,
};

const financeSlice = createSlice({
  name: 'finance',
  initialState,
  reducers: {
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.push(action.payload);
    },
    updateTransaction: (state, action: PayloadAction<Transaction>) => {
      const index = state.transactions.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.transactions[index] = action.payload;
      }
    },
    deleteTransaction: (state, action: PayloadAction<string>) => {
      state.transactions = state.transactions.filter(t => t.id !== action.payload);
    },
    setTransactionStatus: (state, action: PayloadAction<{ id: string; status: Transaction['status'] }>) => {
      const transaction = state.transactions.find(t => t.id === action.payload.id);
      if (transaction) {
        transaction.status = action.payload.status;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  addTransaction,
  updateTransaction,
  deleteTransaction,
  setTransactionStatus,
  setLoading,
  setError,
} = financeSlice.actions;

export default financeSlice.reducer;
