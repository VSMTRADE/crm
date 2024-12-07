import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Autocomplete,
  Grid,
  Card,
  CardContent,
  IconButton,
  useTheme,
  useMediaQuery,
  Paper,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Person as PersonIcon } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { 
  fetchTasksAsync,
  createTaskAsync,
  updateTaskAsync,
  deleteTaskAsync,
  completeTaskAsync,
  reopenTaskAsync,
  selectTasks,
  selectTasksLoading,
  selectTasksError
} from '../../store/slices/tasksSlice';
import { fetchContactsAsync } from '../../store/slices/contactsSlice';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Task } from '../../services/tasksService';
import { usersService, User } from '../../services/usersService';
import TaskDeadline from '../../components/TaskDeadline';
import DeadlinesDashboard from '../../components/DeadlinesDashboard';
import PartnerSelect from '../../components/PartnerSelect';
import { usePartners } from '../../hooks/usePartners';

const ItemTypes = {
  TASK: 'task',
};

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onStatusChange }) => {
  const theme = useTheme();
  const contacts = useSelector((state: RootState) => state.contacts.contacts);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.TASK,
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const assignedContact = task.assigned_to_contact 
    ? contacts.find(contact => contact.id === task.assigned_to_contact)
    : null;

  const getAssigneeName = () => {
    if (task.assigned_to_user && task.assignedUser) {
      return task.assignedUser.full_name || task.assignedUser.email;
    }
    if (task.assigned_to_contact && assignedContact) {
      return assignedContact.name;
    }
    return 'Não atribuído';
  };

  return (
    <div
      ref={drag}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <Card sx={{ mb: 2, backgroundColor: theme.palette.background.paper }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h6">{task.title}</Typography>
            <Box>
              <IconButton size="small" onClick={() => onEdit(task)}>
                <EditIcon />
              </IconButton>
              <IconButton size="small" color="error" onClick={() => onDelete(task.id)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            {task.description}
          </Typography>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="textSecondary">
              Prazo: {format(new Date(task.due_date), "dd 'de' MMMM", { locale: ptBR })}
            </Typography>
            <TaskDeadline dueDate={task.due_date} />
          </Box>
          <Box mt={1}>
            <Chip
              icon={<PersonIcon />}
              label={getAssigneeName()}
              size="small"
              color={task.assigned_to_user || task.assigned_to_contact ? "primary" : "default"}
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>
    </div>
  );
};

interface TaskColumnProps {
  status: Task['status'];
  title: string;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
  backgroundColor: string;
}

const TaskColumn: React.FC<TaskColumnProps> = ({
  status,
  title,
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
  backgroundColor,
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.TASK,
    drop: (item: { id: string }) => {
      onStatusChange(item.id, status);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <Paper
      ref={drop}
      sx={{
        p: 2,
        backgroundColor,
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        transition: 'background-color 0.2s',
        opacity: isOver ? 0.8 : 1,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
        {title}
        <Typography component="span" sx={{ ml: 1, color: 'text.primary' }}>
          ({tasks.length})
        </Typography>
      </Typography>
      <Box sx={{ flex: 1 }}>
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
          />
        ))}
      </Box>
    </Paper>
  );
};

const TasksPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const tasks = useSelector(selectTasks);
  const loading = useSelector(selectTasksLoading);
  const error = useSelector(selectTasksError);
  const dispatch = useDispatch();
  const [users, setUsers] = useState<User[]>([]);
  const { partners } = usePartners();

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending' as Task['status'],
    priority: 'medium' as Task['priority'],
    due_date: new Date().toISOString(),
    assigned_to_contact: null as string | null,
  });

  useEffect(() => {
    dispatch(fetchTasksAsync() as any);
    dispatch(fetchContactsAsync() as any);
    loadUsers();
  }, [dispatch]);

  const loadUsers = async () => {
    try {
      const fetchedUsers = await usersService.fetchUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTask(null);
    setFormData({
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      due_date: new Date().toISOString(),
      assigned_to_contact: null,
    });
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      due_date: task.due_date || new Date().toISOString(),
      assigned_to_contact: task.assigned_to_contact || null,
    });
    setOpenDialog(true);
  };

  const handleSaveTask = async () => {
    try {
      if (selectedTask) {
        await dispatch(updateTaskAsync({
          id: selectedTask.id,
          ...formData,
        }) as any);
      } else {
        await dispatch(createTaskAsync(formData) as any);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await dispatch(deleteTaskAsync(id) as any);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      try {
        await dispatch(updateTaskAsync({
          id: taskId,
          status: newStatus,
        }) as any);
      } catch (error) {
        console.error('Error updating task status:', error);
      }
    }
  };

  const columns = [
    {
      status: 'pending' as Task['status'],
      title: 'A Fazer',
      backgroundColor: '#fff3e0'
    },
    {
      status: 'in_progress' as Task['status'],
      title: 'Em Andamento',
      backgroundColor: '#FFDD4A'
    },
    {
      status: 'completed' as Task['status'],
      title: 'Concluído',
      backgroundColor: '#c6efce'
    }
  ];

  const tasksByStatus = {
    pending: tasks.filter((task) => task.status === 'pending'),
    in_progress: tasks.filter((task) => task.status === 'in_progress'),
    completed: tasks.filter((task) => task.status === 'completed')
  };

  if (loading) {
    return <Typography>Carregando...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Tarefas</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
          >
            Nova Tarefa
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <DeadlinesDashboard />
          </Grid>

          {columns.map((column) => (
            <Grid item key={column.status} xs={12} md={4}>
              <TaskColumn
                status={column.status}
                title={column.title}
                tasks={tasksByStatus[column.status]}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
                backgroundColor={column.backgroundColor}
              />
            </Grid>
          ))}
        </Grid>

        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle>
            {selectedTask ? 'Editar Tarefa' : 'Nova Tarefa'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Título"
                    fullWidth
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, title: e.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Descrição"
                    fullWidth
                    multiline
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Data de Entrega"
                    type="date"
                    fullWidth
                    value={formData.due_date.split('T')[0]}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, due_date: new Date(e.target.value).toISOString() }))
                    }
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <PartnerSelect
                    value={partners.find(partner => partner.id === formData.assigned_to_contact) || null}
                    onChange={(partner) =>
                      setFormData(prev => ({ ...prev, assigned_to_contact: partner?.id || null }))
                    }
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button
              onClick={handleSaveTask}
              variant="contained"
              color="primary"
              disabled={!formData.title || !formData.due_date}
            >
              Salvar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DndProvider>
  );
};

export default TasksPage;
