import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Paper,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  SelectChangeEvent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Transaction, TransactionType, TransactionCategory, addTransaction, updateTransaction, deleteTransaction } from '../../store/slices/financeSlice';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ENTRADA_CATEGORIES = [
  { value: 'vendas', label: 'Vendas' },
  { value: 'servicos', label: 'Serviços' },
  { value: 'outros_ganhos', label: 'Outros Ganhos' },
];

const SAIDA_CATEGORIES = [
  { value: 'despesas_fixas', label: 'Despesas Fixas' },
  { value: 'despesas_variaveis', label: 'Despesas Variáveis' },
  { value: 'impostos', label: 'Impostos' },
  { value: 'fornecedores', label: 'Fornecedores' },
  { value: 'outros_gastos', label: 'Outros Gastos' },
];

const FinancialControl: React.FC = () => {
  const dispatch = useDispatch();
  const transactions = useSelector((state: RootState) => state.finance.transactions);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<Partial<Transaction>>({
    description: '',
    amount: 0,
    type: 'entrada',
    category: 'vendas',
    date: new Date().toISOString().split('T')[0],
    status: 'pendente',
    recurrent: false,
  });

  const handleTypeChange = (event: SelectChangeEvent) => {
    const newType = event.target.value as TransactionType;
    const defaultCategory = newType === 'entrada' ? 'vendas' : 'despesas_fixas';
    
    setCurrentTransaction(prev => ({
      ...prev,
      type: newType,
      category: defaultCategory,
    }));
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    const newCategory = event.target.value as TransactionCategory;
    setCurrentTransaction(prev => ({
      ...prev,
      category: newCategory,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentTransaction(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (event: SelectChangeEvent) => {
    setCurrentTransaction(prev => ({
      ...prev,
      status: event.target.value,
    }));
  };

  const resetForm = () => {
    setCurrentTransaction({
      description: '',
      amount: 0,
      type: 'entrada',
      category: 'vendas',
      date: new Date().toISOString().split('T')[0],
      status: 'pendente',
      recurrent: false,
    });
  };

  const handleOpenDialog = () => {
    setIsEditing(false);
    resetForm();
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setIsEditing(false);
    resetForm();
  };

  const handleEdit = (transaction: Transaction) => {
    setIsEditing(true);
    setCurrentTransaction(transaction);
    setOpenDialog(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      dispatch(deleteTransaction(id));
    }
  };

  const handleSave = () => {
    if (isEditing && currentTransaction.id) {
      dispatch(updateTransaction(currentTransaction as Transaction));
    } else {
      const newTransaction = {
        ...currentTransaction,
        id: Date.now().toString(),
      } as Transaction;
      dispatch(addTransaction(newTransaction));
    }
    handleCloseDialog();
  };

  const calculateTotal = (type: TransactionType) => {
    return transactions
      .filter((t) => t.type === type)
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const totalEntradas = calculateTotal('entrada');
  const totalSaidas = calculateTotal('saida');
  const saldoAtual = totalEntradas - totalSaidas;

  const getTransactionsByMonth = () => {
    const monthlyData: { [key: string]: { entrada: number; saida: number } } = {};

    transactions.forEach((transaction) => {
      const monthYear = format(new Date(transaction.date), 'MMM yyyy', { locale: ptBR });
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { entrada: 0, saida: 0 };
      }

      if (transaction.type === 'entrada') {
        monthlyData[monthYear].entrada += transaction.amount;
      } else {
        monthlyData[monthYear].saida += transaction.amount;
      }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      ...data,
    }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4">Controle Financeiro</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
            >
              Nova Transação
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, bgcolor: '#094074', color: 'white' }}>
            <Typography variant="h6">Saldo Atual</Typography>
            <Typography variant="h4">
              {formatCurrency(saldoAtual)}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, bgcolor: '#B3E9C7', color: 'black' }}>
            <Typography variant="h6">Total Entradas</Typography>
            <Typography variant="h4">
              {formatCurrency(totalEntradas)}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, bgcolor: '#C1292E', color: 'white' }}>
            <Typography variant="h6">Total Saídas</Typography>
            <Typography variant="h4">
              {formatCurrency(totalSaidas)}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Histórico de Transações</Typography>
              {transactions.map((transaction) => (
                <Box
                  key={transaction.id}
                  sx={{
                    p: 2,
                    mb: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1">{transaction.description}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {format(new Date(transaction.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Categoria: {transaction.category.replace('_', ' ')}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Status: {transaction.status}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography
                      variant="h6"
                      color={transaction.type === 'entrada' ? 'success.main' : 'error.main'}
                    >
                      {transaction.type === 'entrada' ? '+' : '-'} {formatCurrency(Number(transaction.amount))}
                    </Typography>
                    <Box>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(transaction)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(transaction.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>
              ))}
              {transactions.length === 0 && (
                <Typography color="textSecondary" align="center">
                  Nenhuma transação registrada
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Análise de Transações</Typography>
              <Box sx={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={getTransactionsByMonth()}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis
                      tickFormatter={(value) =>
                        new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                          notation: 'compact',
                        }).format(value)
                      }
                    />
                    <ChartTooltip
                      formatter={(value: number) =>
                        new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(value)
                      }
                    />
                    <Legend />
                    <Bar dataKey="entrada" name="Entradas" fill="#2ecc71" />
                    <Bar dataKey="saida" name="Saídas" fill="#e74c3c" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isEditing ? 'Editar Transação' : 'Nova Transação'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Descrição"
              name="description"
              value={currentTransaction.description}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Valor"
              name="amount"
              type="number"
              value={currentTransaction.amount}
              onChange={handleInputChange}
              fullWidth
              InputProps={{
                startAdornment: 'R$',
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={currentTransaction.type}
                onChange={handleTypeChange}
                label="Tipo"
              >
                <MenuItem value="entrada">Entrada</MenuItem>
                <MenuItem value="saida">Saída</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Categoria</InputLabel>
              <Select
                value={currentTransaction.category}
                onChange={handleCategoryChange}
                label="Categoria"
              >
                {currentTransaction.type === 'entrada'
                  ? ENTRADA_CATEGORIES.map(category => (
                      <MenuItem key={category.value} value={category.value}>
                        {category.label}
                      </MenuItem>
                    ))
                  : SAIDA_CATEGORIES.map(category => (
                      <MenuItem key={category.value} value={category.value}>
                        {category.label}
                      </MenuItem>
                    ))
                }
              </Select>
            </FormControl>
            <TextField
              label="Data"
              name="date"
              type="date"
              value={currentTransaction.date}
              onChange={handleInputChange}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={currentTransaction.status}
                onChange={handleStatusChange}
                label="Status"
              >
                <MenuItem value="pendente">Pendente</MenuItem>
                <MenuItem value="pago">Pago</MenuItem>
                <MenuItem value="atrasado">Atrasado</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            {isEditing ? 'Atualizar' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FinancialControl;
