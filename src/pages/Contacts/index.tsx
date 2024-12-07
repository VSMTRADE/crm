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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import store from '../../store';
import { addContact, updateContact, deleteContact } from '../../store/slices/contactsSlice';
import { contactsService } from '../../services/contactsService';

interface ContactFormData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  type: 'lead' | 'cliente' | 'parceiro';
  status?: 'active' | 'inactive';
}

const initialFormData: ContactFormData = {
  name: '',
  email: '',
  phone: '',
  company: '',
  type: 'lead',
  status: 'active',
};

const contactTypeColors = {
  lead: '#f1c40f',
  cliente: '#2ecc71',
  parceiro: '#3498db',
};

const contactTypeLabels = {
  lead: 'Lead',
  cliente: 'Cliente',
  parceiro: 'Parceiro',
};

export default function Contacts() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const dispatch = useDispatch();
  const contacts = useSelector((state: RootState) => state.contacts.contacts);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>(initialFormData);
  const [isEditing, setIsEditing] = useState(false);

  // Carregar contatos do Supabase quando o componente montar
  useEffect(() => {
    contactsService.fetchContacts(dispatch);
  }, [dispatch]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFormData(initialFormData);
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      // Validar dados obrigatórios
      if (!formData.name || !formData.email) {
        return;
      }

      const contactData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim(),
        company: formData.company?.trim(),
        type: formData.type,
      };

      if (isEditing && formData.id) {
        await contactsService.updateContact(dispatch, { ...contactData, id: formData.id });
      } else {
        await contactsService.createContact(dispatch, () => store.getState(), contactData);
      }
      handleClose();
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  };

  const handleEdit = (contact: any) => {
    setFormData(contact);
    setIsEditing(true);
    handleOpen();
  };

  const handleDelete = async (id: string) => {
    try {
      await contactsService.deleteContact(dispatch, id);
    } catch (error) {
      console.error('Erro ao deletar contato:', error);
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Nome',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'phone',
      headerName: 'Telefone',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'company',
      headerName: 'Empresa',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'type',
      headerName: 'Tipo',
      flex: 1,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={contactTypeLabels[params.value as keyof typeof contactTypeLabels]}
          sx={{
            bgcolor: contactTypeColors[params.value as keyof typeof contactTypeColors],
            color: 'white',
            fontWeight: 'bold',
            '&:hover': {
              transform: 'scale(1.05)',
            },
            transition: 'transform 0.2s ease-in-out',
          }}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <IconButton
            onClick={() => handleEdit(params.row)}
            color="primary"
            sx={{
              '&:hover': {
                bgcolor: theme.palette.primary.light,
                color: 'white',
              },
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => handleDelete(params.row.id)}
            color="error"
            sx={{
              '&:hover': {
                bgcolor: theme.palette.error.light,
                color: 'white',
              },
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  // Visualização em cards para dispositivos móveis
  const MobileView = () => (
    <Grid container spacing={2}>
      {contacts.map((contact) => (
        <Grid item xs={12} key={contact.id}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {contact.name}
              </Typography>
              <Typography color="textSecondary" gutterBottom>
                {contact.email}
              </Typography>
              <Typography color="textSecondary" gutterBottom>
                {contact.phone}
              </Typography>
              <Typography color="textSecondary" gutterBottom>
                {contact.company}
              </Typography>
              <Box mt={1}>
                <IconButton
                  onClick={() => handleEdit(contact)}
                  color="primary"
                  size="small"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => handleDelete(contact.id)}
                  color="error"
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

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
          Contatos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
          fullWidth={isMobile}
        >
          Novo Contato
        </Button>
      </Box>

      {isMobile ? (
        <MobileView />
      ) : (
        <Box sx={{ height: 'calc(100vh - 200px)', width: '100%' }}>
          <DataGrid
            rows={contacts.filter((contact) => contact.id)}
            columns={columns}
            disableRowSelectionOnClick
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
              },
            }}
            pageSizeOptions={[5, 10, 25]}
            sx={{
              '& .MuiDataGrid-cell': {
                wordBreak: 'break-word',
              },
              '& .MuiDataGrid-columnHeader': {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
              },
            }}
          />
        </Box>
      )}

      <Dialog
        open={open}
        onClose={handleClose}
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{isEditing ? 'Editar Contato' : 'Novo Contato'}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField
              name="name"
              label="Nome"
              value={formData.name}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              name="email"
              label="Email"
              value={formData.email}
              onChange={handleInputChange}
              fullWidth
              required
              type="email"
            />
            <TextField
              name="phone"
              label="Telefone"
              value={formData.phone}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="company"
              label="Empresa"
              value={formData.company}
              onChange={handleInputChange}
              fullWidth
            />
            <FormControl fullWidth required>
              <InputLabel>Tipo de Contato</InputLabel>
              <Select
                name="type"
                value={formData.type}
                label="Tipo de Contato"
                onChange={handleInputChange}
              >
                <MenuItem value="lead">Lead</MenuItem>
                <MenuItem value="cliente">Cliente</MenuItem>
                <MenuItem value="parceiro">Parceiro</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.name || !formData.email}
          >
            {isEditing ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
