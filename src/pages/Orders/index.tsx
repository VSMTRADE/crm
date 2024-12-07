import React, { useState, useEffect } from 'react';
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
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import store from '../../store';
import { 
  fetchOrdersAsync,
  createOrderAsync,
  updateOrderAsync,
  deleteOrderAsync,
  OrderStatus
} from '../../store/slices/ordersSlice';
import { Order, OrderItem } from '../../services/ordersService';
import { useContacts } from '../../hooks/useContacts';

const OrderManagement: React.FC = () => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state: RootState) => state.orders);
  const { contacts } = useContacts();
  const store = useSelector((state: RootState) => state);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedContact, setSelectedContact] = useState<string>('');
  const [currentOrder, setCurrentOrder] = useState<Partial<Order>>({
    title: '',
    description: '',
    value: 0,
    status: 'pending' as OrderStatus,
    contact_id: '',
    items: []
  });
  const [currentItem, setCurrentItem] = useState<Partial<OrderItem>>({
    product_name: '',
    quantity: 1,
    unit_price: 0,
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    dispatch(fetchOrdersAsync());
  }, [dispatch]);

  const statusColors: Record<OrderStatus, 'warning' | 'info' | 'success' | 'error'> = {
    pending: 'warning',
    processing: 'info',
    completed: 'success',
    cancelled: 'error'
  };

  const handleAddItem = () => {
    if (currentItem.product_name && currentItem.quantity && currentItem.unit_price) {
      const newItem: OrderItem = {
        product_name: currentItem.product_name,
        quantity: currentItem.quantity,
        unit_price: currentItem.unit_price,
        total_price: currentItem.quantity * currentItem.unit_price
      };

      setCurrentOrder(prev => ({
        ...prev,
        items: [...(prev.items || []), newItem],
        value: (prev.value || 0) + newItem.total_price
      }));

      setCurrentItem({
        product_name: '',
        quantity: 1,
        unit_price: 0
      });
    }
  };

  const handleRemoveItem = (index: number) => {
    const items = currentOrder.items || [];
    const removedItem = items[index];
    
    setCurrentOrder(prev => ({
      ...prev,
      items: items.filter((_, i) => i !== index),
      value: (prev.value || 0) - (removedItem.total_price || 0)
    }));
  };

  const handleSave = async () => {
    if (!currentOrder.title || !currentOrder.contact_id) {
      return;
    }

    try {
      if (isEditing && currentOrder.id) {
        await dispatch(updateOrderAsync({ 
          id: currentOrder.id, 
          orderData: currentOrder 
        }));
      } else {
        await dispatch(createOrderAsync({
          ...currentOrder,
          user_id: store.auth.user?.id
        }));
      }
      handleClose();
    } catch (error) {
      console.error('Error saving order:', error);
    }
  };

  const handleEdit = (order: Order) => {
    setCurrentOrder(order);
    setSelectedContact(order.contact_id);
    setIsEditing(true);
    setOpenDialog(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteOrderAsync(id));
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const handleClose = () => {
    setOpenDialog(false);
    setCurrentOrder({
      title: '',
      description: '',
      value: 0,
      status: 'pending',
      contact_id: '',
      items: []
    });
    setSelectedContact('');
    setIsEditing(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h4" component="h1">
              Pedidos
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
            >
              Novo Pedido
            </Button>
          </Grid>
        </Grid>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {orders.map((order) => (
          <Grid item xs={12} key={order.id}>
            <Card>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h6">{order.title}</Typography>
                    <Typography color="textSecondary" gutterBottom>
                      Cliente: {contacts.find(c => c.id === order.contact_id)?.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} container justifyContent="flex-end">
                    <Box display="flex" gap={1} alignItems="center">
                      <Chip
                        label={order.status}
                        color={statusColors[order.status as OrderStatus]}
                      />
                      <Typography variant="h6">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(order.value)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" gap={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleEdit(order)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleDelete(order.id!)}
                      >
                        Excluir
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{isEditing ? 'Editar Pedido' : 'Novo Pedido'}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={2}>
            <TextField
              label="Título"
              value={currentOrder.title}
              onChange={(e) => setCurrentOrder({ ...currentOrder, title: e.target.value })}
              fullWidth
              required
            />
            
            <FormControl fullWidth required>
              <InputLabel>Cliente</InputLabel>
              <Select
                value={currentOrder.contact_id}
                label="Cliente"
                onChange={(e) => setCurrentOrder({ ...currentOrder, contact_id: e.target.value })}
              >
                {contacts.map((contact) => (
                  <MenuItem key={contact.id} value={contact.id}>
                    {contact.name} - {contact.company}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={currentOrder.status}
                label="Status"
                onChange={(e) => setCurrentOrder({ ...currentOrder, status: e.target.value as OrderStatus })}
              >
                <MenuItem value="pending">Pendente</MenuItem>
                <MenuItem value="processing">Em Processamento</MenuItem>
                <MenuItem value="completed">Concluído</MenuItem>
                <MenuItem value="cancelled">Cancelado</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Descrição"
              value={currentOrder.description}
              onChange={(e) => setCurrentOrder({ ...currentOrder, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />

            <Typography variant="h6">Itens do Pedido</Typography>
            
            <Box display="flex" gap={2}>
              <TextField
                label="Produto"
                value={currentItem.product_name}
                onChange={(e) => setCurrentItem({ ...currentItem, product_name: e.target.value })}
                fullWidth
              />
              <TextField
                label="Quantidade"
                type="number"
                value={currentItem.quantity}
                onChange={(e) => setCurrentItem({ ...currentItem, quantity: Number(e.target.value) })}
                sx={{ width: 120 }}
              />
              <TextField
                label="Preço Unitário"
                type="number"
                value={currentItem.unit_price}
                onChange={(e) => setCurrentItem({ ...currentItem, unit_price: Number(e.target.value) })}
                sx={{ width: 120 }}
              />
              <Button variant="contained" onClick={handleAddItem}>
                Adicionar
              </Button>
            </Box>

            {currentOrder.items && currentOrder.items.map((item, index) => (
              <Paper key={index} sx={{ p: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs>
                    <Typography>{item.product_name}</Typography>
                  </Grid>
                  <Grid item>
                    <Typography>Qtd: {item.quantity}</Typography>
                  </Grid>
                  <Grid item>
                    <Typography>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(item.unit_price)}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography>
                      Total: {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(item.total_price || 0)}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleRemoveItem(index)}
                    >
                      Remover
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            ))}

            <Typography variant="h6">
              Total do Pedido: {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(currentOrder.value || 0)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" disabled={!currentOrder.title || !currentOrder.contact_id}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrderManagement;
