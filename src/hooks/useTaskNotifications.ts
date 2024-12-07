import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { addNotification } from '../store/slices/notificationsSlice';
import { parseISO, isToday, isTomorrow, isPast } from 'date-fns';
import { useNotificationSystem } from './useNotificationSystem';

export function useTaskNotifications() {
  const dispatch = useDispatch();
  const tasks = useSelector((state: RootState) => state.tasks.tasks);
  const { showNotification } = useNotificationSystem();

  useEffect(() => {
    tasks.forEach(task => {
      const dueDate = parseISO(task.dueDate);

      // Verifica tarefas vencidas
      if (isPast(dueDate) && !isToday(dueDate) && task.status !== 'concluido') {
        dispatch(addNotification({
          title: 'Tarefa Atrasada',
          message: `A tarefa "${task.title}" está atrasada.`,
          type: 'error'
        }));
        showNotification(
          'Tarefa Atrasada',
          `A tarefa "${task.title}" está atrasada.`,
          'error'
        );
      }
      // Verifica tarefas que vencem hoje
      else if (isToday(dueDate) && task.status !== 'concluido') {
        dispatch(addNotification({
          title: 'Tarefa para Hoje',
          message: `A tarefa "${task.title}" vence hoje.`,
          type: 'warning'
        }));
        showNotification(
          'Tarefa para Hoje',
          `A tarefa "${task.title}" vence hoje.`,
          'warning'
        );
      }
      // Verifica tarefas que vencem amanhã
      else if (isTomorrow(dueDate) && task.status !== 'concluido') {
        dispatch(addNotification({
          title: 'Tarefa para Amanhã',
          message: `A tarefa "${task.title}" vence amanhã.`,
          type: 'info'
        }));
        showNotification(
          'Tarefa para Amanhã',
          `A tarefa "${task.title}" vence amanhã.`,
          'info'
        );
      }
    });
  }, [tasks, dispatch, showNotification]);
}
