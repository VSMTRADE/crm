import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  LinearProgress,
  Divider,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { differenceInDays, isPast, parseISO } from 'date-fns';
import TaskDeadline from '../TaskDeadline';

const DeadlinesDashboard: React.FC = () => {
  const tasks = useSelector((state: RootState) => state.tasks.tasks);

  const getTaskStatus = (dueDate: string) => {
    const today = new Date();
    const dueDateObj = parseISO(dueDate);
    const daysRemaining = differenceInDays(dueDateObj, today);
    const isOverdue = isPast(dueDateObj) && daysRemaining !== 0;

    if (isOverdue) return 'overdue';
    if (daysRemaining === 0) return 'today';
    if (daysRemaining <= 3) return 'upcoming';
    return 'ontrack';
  };

  const tasksByDeadline = tasks.reduce(
    (acc, task) => {
      if (task.status === 'concluido') return acc;
      
      const status = getTaskStatus(task.dueDate);
      acc[status].push(task);
      return acc;
    },
    {
      overdue: [] as typeof tasks,
      today: [] as typeof tasks,
      upcoming: [] as typeof tasks,
      ontrack: [] as typeof tasks,
    }
  );

  const totalActiveTasks = tasks.filter(task => task.status !== 'concluido').length;
  
  const calculateProgress = (count: number) => {
    return totalActiveTasks > 0 ? (count / totalActiveTasks) * 100 : 0;
  };

  const deadlineCategories = [
    {
      title: 'Tarefas Atrasadas',
      tasks: tasksByDeadline.overdue,
      color: '#f44336',
      key: 'overdue',
    },
    {
      title: 'Vencem Hoje',
      tasks: tasksByDeadline.today,
      color: '#ff9800',
      key: 'today',
    },
    {
      title: 'Próximos 3 Dias',
      tasks: tasksByDeadline.upcoming,
      color: '#ffc107',
      key: 'upcoming',
    },
    {
      title: 'No Prazo',
      tasks: tasksByDeadline.ontrack,
      color: '#4caf50',
      key: 'ontrack',
    },
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Monitoramento de Prazos
        </Typography>
        <Grid container spacing={2}>
          {deadlineCategories.map((category) => (
            <Grid item xs={12} key={category.key}>
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle2" color="textSecondary">
                    {category.title}
                  </Typography>
                  <Typography variant="subtitle2" color="textSecondary">
                    {category.tasks.length} de {totalActiveTasks}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={calculateProgress(category.tasks.length)}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: category.color,
                    },
                  }}
                />
              </Box>
              {category.tasks.length > 0 && (
                <Box mb={2}>
                  {category.tasks.map((task) => (
                    <Box
                      key={task.id}
                      sx={{
                        p: 1,
                        mb: 1,
                        borderLeft: `4px solid ${category.color}`,
                        backgroundColor: 'background.paper',
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="subtitle2">{task.title}</Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="textSecondary">
                          {task.partner?.name || 'Sem responsável'}
                        </Typography>
                        <TaskDeadline dueDate={task.dueDate} showFullInfo />
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
              {category.key !== 'ontrack' && <Divider />}
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default DeadlinesDashboard;
