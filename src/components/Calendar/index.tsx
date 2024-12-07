import React from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Task } from '../../services/tasksService';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Box, Paper } from '@mui/material';

const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarProps {
  onEventClick?: (task: Task) => void;
}

const Calendar: React.FC<CalendarProps> = ({ onEventClick }) => {
  const tasks = useSelector((state: RootState) => state.tasks.tasks);

  const events = tasks.map(task => ({
    id: task.id,
    title: task.title,
    start: new Date(task.due_date),
    end: new Date(task.due_date),
    allDay: true,
    resource: task,
  }));

  const handleEventClick = (event: any) => {
    if (onEventClick && event.resource) {
      onEventClick(event.resource);
    }
  };

  const messages = {
    allDay: 'Dia inteiro',
    previous: 'Anterior',
    next: 'Próximo',
    today: 'Hoje',
    month: 'Mês',
    week: 'Semana',
    day: 'Dia',
    agenda: 'Agenda',
    date: 'Data',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'Não há eventos neste período.',
  };

  return (
    <Paper elevation={2} sx={{ p: 2, height: '80vh' }}>
      <Box sx={{ height: '100%' }}>
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          messages={messages}
          onSelectEvent={handleEventClick}
          culture="pt-BR"
        />
      </Box>
    </Paper>
  );
};

export default Calendar;
