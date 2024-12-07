import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Chip,
  Stack,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachMoney,
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import store from '../../store';
import { dealsService } from '../../services/dealsService';
import { contactsService } from '../../services/contactsService';

interface DealFormData {
  id?: string;
  title: string;
  description?: string;
  value?: number;
  status: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  contact_id?: string;
  responsible_id?: string;
  expected_close_date?: string;
  probability?: number;
  notes?: string;
}

const initialFormData: DealFormData = {
  title: '',
  description: '',
  value: 0,
  status: 'prospecting',
  contact_id: '',
  expected_close_date: new Date().toISOString().split('T')[0],
  probability: 0,
  notes: ''
};

const statusColors = {
  prospecting: '#3498db',
  qualification: '#f1c40f',
  proposal: '#e67e22',
  negotiation: '#9b59b6',
  closed_won: '#2ecc71',
  closed_lost: '#e74c3c',
};

const statusLabels = {
  prospecting: 'Prospecção',
  qualification: 'Qualificação',
  proposal: 'Proposta',
  negotiation: 'Negociação',
  closed_won: 'Ganho',
  closed_lost: 'Perdido',
};

export default function Deals() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const dispatch = useDispatch();
  const deals = useSelector((state: RootState) => state.deals.deals);
  const contacts = useSelector((state: RootState) => state.contacts.contacts);
  
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<DealFormData>(initialFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Carregar negócios e contatos quando o componente montar
    dealsService.fetchDeals(dispatch);
    contactsService.fetchContacts(dispatch);
  }, [dispatch]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFormData(initialFormData);
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const formatCurrency = (value: string | number) => {
    if (typeof value === 'number') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    }
    
    const numericValue = value.replace(/\D/g, '');
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Number(numericValue) / 100);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const numericValue = Number(rawValue) / 100;
    setFormData((prev) => ({ ...prev, value: numericValue }));
  };

  const handleEdit = (deal: any) => {
    setFormData({
      id: deal.id,
      title: deal.title || '',
      value: deal.value || 0,
      status: deal.status || 'prospecting',
      contact_id: deal.contact_id || '',
      description: deal.description || '',
      expected_close_date: deal.expected_close_date || new Date().toISOString().split('T')[0],
      probability: deal.probability || 0,
      notes: deal.notes || ''
    });
    setIsEditing(true);
    handleOpen();
  };

  const handleSubmit = async () => {
    try {
      // Validar dados obrigatórios
      if (!formData.title || !formData.contact_id || !formData.expected_close_date) {
        console.error('Missing required fields:', { 
          title: formData.title, 
          contact_id: formData.contact_id, 
          expected_close_date: formData.expected_close_date 
        });
        return;
      }

      const dealData = {
        title: formData.title.trim(),
        description: formData.description?.trim(),
        value: formData.value ? Number(formData.value) : null,
        status: formData.status,
        contact_id: formData.contact_id,
        expected_close_date: formData.expected_close_date,
        probability: formData.probability ? Number(formData.probability) : null,
        notes: formData.notes?.trim()
      };

      console.log('Submitting deal data:', dealData);

      if (isEditing && formData.id) {
        await dealsService.updateDeal(dispatch, formData.id, dealData);
      } else {
        await dealsService.createDeal(dispatch, () => store.getState(), dealData);
      }
      handleClose();
    } catch (error) {
      console.error('Error saving deal:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dealsService.deleteDeal(dispatch, id);
    } catch (error) {
      console.error('Error deleting deal:', error);
    }
  };

  const filterDealsByDate = (deals: any[]) => {
    if (!dateFilter.startDate && !dateFilter.endDate) return deals;

    return deals.filter(deal => {
      const dealStartDate = new Date(deal.expected_close_date);
      dealStartDate.setHours(0, 0, 0, 0); // Normaliza para início do dia

      let startDate = null;
      let endDate = null;

      if (dateFilter.startDate) {
        startDate = new Date(dateFilter.startDate);
        startDate.setHours(0, 0, 0, 0); // Normaliza para início do dia
      }

      if (dateFilter.endDate) {
        endDate = new Date(dateFilter.endDate);
        endDate.setHours(23, 59, 59, 999); // Normaliza para fim do dia
      }

      if (startDate && endDate) {
        return dealStartDate >= startDate && dealStartDate <= endDate;
      } else if (startDate) {
        return dealStartDate >= startDate;
      } else if (endDate) {
        return dealStartDate <= endDate;
      }

      return true;
    });
  };

  const filteredDeals = filterDealsByDate(deals);

  const totalDeals = filteredDeals.length;
  const totalValue = filteredDeals.reduce((sum, deal) => sum + deal.value, 0);

  const handleClearFilters = () => {
    setDateFilter({
      startDate: '',
      endDate: '',
    });
  };

  const DealCard = ({ deal }: { deal: any }) => (
    <Card 
      sx={{ 
        mb: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        },
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'background.paper',
      }}
    >
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 'medium',
              fontSize: '1rem',
              lineHeight: 1.2,
              mb: 1,
              flexGrow: 1,
              mr: 1
            }}
          >
            {deal.title}
          </Typography>
          <Chip
            label={statusLabels[deal.status]}
            sx={{
              bgcolor: statusColors[deal.status],
              color: 'white',
              fontWeight: 'bold',
              fontSize: '0.75rem',
              height: '24px',
              flexShrink: 0,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'scale(1.05)',
              }
            }}
          />
        </Box>
        <Typography 
          color="primary" 
          variant="h6" 
          sx={{ 
            fontWeight: 'bold',
            mb: 2,
            fontSize: '1.1rem'
          }}
        >
          {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(deal.value)}
        </Typography>
        <Box 
          display="flex" 
          flexDirection="column" 
          gap={1} 
          mb={2}
          sx={{ flexGrow: 1 }}
        >
          <Typography variant="body2" color="textSecondary">
            <strong>Início:</strong> {new Date(deal.expected_close_date).toLocaleDateString('pt-BR')}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            <strong>Cliente:</strong> {contacts.find(c => c.id === deal.contact_id)?.name || 'N/A'}
          </Typography>
          {deal.description && (
            <Typography 
              variant="body2" 
              color="textSecondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {deal.description}
            </Typography>
          )}
        </Box>
        <Box 
          mt="auto" 
          display="flex" 
          gap={1} 
          sx={{ 
            borderTop: 1,
            borderColor: 'divider',
            pt: 1
          }}
        >
          <IconButton 
            onClick={() => handleEdit(deal)} 
            color="primary" 
            size="small"
            sx={{ 
              '&:hover': { 
                bgcolor: theme.palette.primary.light,
                color: 'white'
              }
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton 
            onClick={() => handleDelete(deal.id)} 
            color="error" 
            size="small"
            sx={{ 
              '&:hover': { 
                bgcolor: theme.palette.error.light,
                color: 'white'
              }
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );

  const groupedDeals = filteredDeals.reduce((acc: any, deal) => {
    if (!acc[deal.status]) {
      acc[deal.status] = [];
    }
    acc[deal.status].push(deal);
    return acc;
  }, {});

  return (
    <Box p={2}>
      <Box
        display="flex"
        flexDirection={isMobile ? 'column' : 'row'}
        justifyContent="space-between"
        alignItems={isMobile ? 'stretch' : 'center'}
        mb={3}
        gap={2}
      >
        <Typography variant="h4" sx={{ fontSize: isMobile ? '1.5rem' : '2rem' }}>
          Negócios
        </Typography>
        <Box display="flex" gap={1} flexWrap="wrap">
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{ minWidth: isMobile ? '100%' : 'auto' }}
          >
            Filtros
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpen}
            sx={{ minWidth: isMobile ? '100%' : 'auto' }}
          >
            Novo Negócio
          </Button>
        </Box>
      </Box>

      {/* Painel de Filtros */}
      <Box
        component={Paper}
        sx={{
          p: 2,
          mb: 3,
          display: showFilters ? 'block' : 'none',
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'background.paper',
        }}
      >
        <Stack spacing={2}>
          <Stack 
            direction={isMobile ? "column" : "row"} 
            spacing={2} 
            alignItems={isMobile ? "stretch" : "center"}
          >
            <TextField
              label="Data Inicial"
              type="date"
              value={dateFilter.startDate}
              onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth={isMobile}
              sx={{ minWidth: isMobile ? 'auto' : '200px' }}
            />
            <TextField
              label="Data Final"
              type="date"
              value={dateFilter.endDate}
              onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth={isMobile}
              sx={{ minWidth: isMobile ? 'auto' : '200px' }}
            />
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              fullWidth={isMobile}
            >
              Limpar Filtros
            </Button>
          </Stack>
          
          {(dateFilter.startDate || dateFilter.endDate) && (
            <Box 
              sx={{ 
                display: 'flex', 
                gap: 3, 
                flexWrap: 'wrap',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                p: 1,
                borderRadius: 1
              }}
            >
              <Typography variant="body2" color="textSecondary">
                <strong>Negócios encontrados:</strong> {totalDeals}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Valor total:</strong> {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(totalValue)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Período:</strong> {dateFilter.startDate ? new Date(dateFilter.startDate).toLocaleDateString('pt-BR') : 'Início'} até {dateFilter.endDate ? new Date(dateFilter.endDate).toLocaleDateString('pt-BR') : 'Hoje'}
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>

      <Grid container spacing={2}>
        {Object.entries(statusLabels).map(([status, label]) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            lg={3}
            key={status}
          >
            <Box
              sx={{
                bgcolor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : theme.palette.background.paper,
                borderRadius: 1,
                p: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: theme.shadows[1],
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                gap={1}
                mb={2}
                sx={{
                  bgcolor: statusColors[status as keyof typeof statusColors],
                  color: 'white',
                  p: 1,
                  borderRadius: 1,
                  boxShadow: theme.shadows[2],
                }}
              >
                <AttachMoney />
                <Typography variant="subtitle1" fontWeight="bold">
                  {label}
                </Typography>
                <Chip 
                  label={groupedDeals[status]?.length || 0}
                  size="small"
                  sx={{ 
                    ml: 'auto',
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
              </Box>
              <Box 
                sx={{ 
                  overflowY: 'auto',
                  maxHeight: 'calc(100vh - 300px)',
                  flexGrow: 1,
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '4px',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    },
                  },
                }}
              >
                {groupedDeals[status]?.map((deal: any) => (
                  <DealCard key={deal.id} deal={deal} />
                ))}
                {(!groupedDeals[status] || groupedDeals[status].length === 0) && (
                  <Typography 
                    color="textSecondary" 
                    sx={{ 
                      textAlign: 'center',
                      fontStyle: 'italic',
                      py: 2
                    }}
                  >
                    Nenhum negócio neste status
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={open}
        onClose={handleClose}
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {isEditing ? 'Editar Negócio' : 'Novo Negócio'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={2}>
            <TextField
              name="title"
              label="Título"
              value={formData.title || ''}
              onChange={handleInputChange}
              fullWidth
              required
              error={!formData.title}
              helperText={!formData.title && 'Campo obrigatório'}
            />
            <TextField
              name="value"
              label="Valor"
              value={formatCurrency(formData.value || 0)}
              onChange={handleValueChange}
              fullWidth
              required
              error={!formData.value}
              helperText={!formData.value && 'Campo obrigatório'}
            />
            <FormControl fullWidth required error={!formData.status}>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status || 'prospecting'}
                label="Status"
                onChange={handleInputChange}
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: statusColors[value as keyof typeof statusColors],
                        }}
                      />
                      {label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required error={!formData.contact_id}>
              <InputLabel>Cliente</InputLabel>
              <Select
                name="contact_id"
                value={formData.contact_id || ''}
                label="Cliente"
                onChange={handleInputChange}
              >
                {contacts.map((contact) => (
                  <MenuItem key={contact.id} value={contact.id}>
                    <Box display="flex" flexDirection="column">
                      <Typography>{contact.name}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {contact.company}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {!formData.contact_id && (
                <Typography color="error" variant="caption" sx={{ mt: 0.5, ml: 1.5 }}>
                  Campo obrigatório
                </Typography>
              )}
            </FormControl>
            <TextField
              name="expected_close_date"
              label="Data de Fechamento"
              type="date"
              value={formData.expected_close_date || new Date().toISOString().split('T')[0]}
              onChange={handleInputChange}
              fullWidth
              required
              error={!formData.expected_close_date}
              helperText={!formData.expected_close_date && 'Campo obrigatório'}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              name="description"
              label="Descrição"
              value={formData.description || ''}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={4}
            />
            <TextField
              name="probability"
              label="Probabilidade (%)"
              type="number"
              value={formData.probability || 0}
              onChange={handleInputChange}
              fullWidth
              InputProps={{
                inputProps: {
                  min: 0,
                  max: 100
                }
              }}
            />
            <TextField
              name="notes"
              label="Observações"
              value={formData.notes || ''}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={4}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleClose} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.title || !formData.value || !formData.contact_id || !formData.expected_close_date}
          >
            {isEditing ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
