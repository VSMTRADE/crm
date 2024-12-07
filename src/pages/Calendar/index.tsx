import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useTranslation } from 'react-i18next';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import ptBR from 'date-fns/locale/pt-BR';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { 
  fetchEventsAsync,
  createEventAsync,
  updateEventAsync,
  deleteEventAsync,
  selectEvents,
  selectCalendarLoading,
  selectCalendarError
} from '../../store/slices/calendarSlice';
import { CalendarEvent, EventType } from '../../services/calendarService';

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

const Calendar: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const events = useSelector(selectEvents);
  const loading = useSelector(selectCalendarLoading);
  const error = useSelector(selectCalendarError);
  const [selectedEvent, setSelectedEvent] = useState<Partial<CalendarEvent> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNewEvent, setIsNewEvent] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        await dispatch(fetchEventsAsync()).unwrap();
      } catch (error: any) {
        setSnackbar({
          open: true,
          message: t('calendar.error_fetch'),
          severity: 'error'
        });
      }
    };
    fetchEvents();
  }, [dispatch, t]);

  useEffect(() => {
    if (error) {
      setSnackbar({
        open: true,
        message: error,
        severity: 'error'
      });
    }
  }, [error]);

  // Traduções personalizadas para o react-big-calendar
  const messages = {
    allDay: t('calendar.all_day'),
    previous: t('calendar.previous'),
    next: t('calendar.next'),
    today: t('calendar.today'),
    month: t('calendar.month'),
    week: t('calendar.week'),
    day: t('calendar.day'),
    agenda: t('calendar.agenda'),
    date: t('calendar.date'),
    time: t('calendar.time'),
    event: t('calendar.event'),
    noEventsInRange: t('calendar.no_events'),
    showMore: (total: number) => t('calendar.show_more').replace('{0}', total.toString()),
  };

  const calendarEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    start: new Date(event.start_date),
    end: new Date(event.end_date),
    allDay: event.all_day,
    resource: event,
  }));

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    console.log('Slot selecionado:', { start, end });
    setIsNewEvent(true);
    setSelectedEvent({
      title: '',
      description: '',
      start_date: start.toISOString(),
      end_date: end.toISOString(),
      all_day: false,
      type: 'meeting' as EventType,
    });
    setIsDialogOpen(true);
  };

  const handleSelectEvent = (event: any) => {
    if (event.resource) {
      setIsNewEvent(false);
      setSelectedEvent(event.resource);
      setIsDialogOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedEvent(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleSaveEvent = async () => {
    if (!selectedEvent?.title) {
      setSnackbar({
        open: true,
        message: t('calendar.error_title_required'),
        severity: 'error'
      });
      return;
    }

    if (!selectedEvent?.start_date || !selectedEvent?.end_date) {
      setSnackbar({
        open: true,
        message: t('calendar.error_dates_required'),
        severity: 'error'
      });
      return;
    }

    if (new Date(selectedEvent.end_date) <= new Date(selectedEvent.start_date)) {
      setSnackbar({
        open: true,
        message: t('calendar.error_invalid_dates'),
        severity: 'error'
      });
      return;
    }

    try {
      console.log('Salvando evento:', selectedEvent);
      if (selectedEvent) {
        if (isNewEvent) {
          const result = await dispatch(createEventAsync(selectedEvent)).unwrap();
          console.log('Evento criado:', result);
          setSnackbar({
            open: true,
            message: t('calendar.success_create'),
            severity: 'success'
          });
        } else if (selectedEvent.id) {
          const result = await dispatch(updateEventAsync(selectedEvent as any)).unwrap();
          console.log('Evento atualizado:', result);
          setSnackbar({
            open: true,
            message: t('calendar.success_update'),
            severity: 'success'
          });
        }
      }
      handleCloseDialog();
    } catch (error: any) {
      console.error('Erro ao salvar evento:', error);
      setSnackbar({
        open: true,
        message: error.message || t('calendar.error_save'),
        severity: 'error'
      });
    }
  };

  const handleDeleteEvent = async () => {
    if (selectedEvent?.id) {
      try {
        await dispatch(deleteEventAsync(selectedEvent.id)).unwrap();
        setSnackbar({
          open: true,
          message: t('calendar.success_delete'),
          severity: 'success'
        });
        handleCloseDialog();
      } catch (error: any) {
        console.error('Erro ao excluir evento:', error);
        setSnackbar({
          open: true,
          message: error.message || t('calendar.error_delete'),
          severity: 'error'
        });
      }
    }
  };

  const handleMeetLinkChange = (meetLink: string) => {
    setSelectedEvent(prev => prev ? { ...prev, meet_link: meetLink } : null);
  };

  const createMeetLink = async () => {
    window.open('https://meet.google.com/new', '_blank');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', p: 3 }}>
      <Paper elevation={2} sx={{ height: '100%', p: 2 }}>
        <BigCalendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          messages={messages}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable={true}
          popup={true}
          culture="pt-BR"
          views={['month', 'week', 'day', 'agenda']}
          defaultView="month"
          longPressThreshold={10}
          step={60}
          timeslots={1}
          min={new Date(0, 0, 0, 7, 0, 0)}
          max={new Date(0, 0, 0, 23, 0, 0)}
          formats={{
            timeGutterFormat: (date: Date) => format(date, 'HH:mm', { locale: ptBR }),
            eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) => {
              if (start.getDate() === end.getDate()) {
                return `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;
              }
              return `${format(start, 'dd/MM HH:mm')} - ${format(end, 'dd/MM HH:mm')}`;
            },
            dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) => {
              return `${format(start, 'dd/MM')} - ${format(end, 'dd/MM')}`;
            }
          }}
        />
      </Paper>

      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isNewEvent ? t('calendar.new_event') : t('calendar.edit_event')}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label={t('calendar.title')}
              fullWidth
              required
              value={selectedEvent?.title || ''}
              onChange={(e) => setSelectedEvent(prev => prev ? { ...prev, title: e.target.value } : null)}
              error={!selectedEvent?.title}
              helperText={!selectedEvent?.title ? t('calendar.error_title_required') : ''}
            />

            <TextField
              label={t('calendar.description')}
              fullWidth
              multiline
              rows={4}
              value={selectedEvent?.description || ''}
              onChange={(e) => setSelectedEvent(prev => prev ? { ...prev, description: e.target.value } : null)}
            />

            <FormControl fullWidth>
              <InputLabel>{t('calendar.event_type')}</InputLabel>
              <Select
                value={selectedEvent?.type || 'meeting'}
                onChange={(e) => setSelectedEvent(prev => prev ? {
                  ...prev,
                  type: e.target.value as EventType,
                  meet_link: e.target.value === 'meet_meeting' ? prev.meet_link : undefined
                } : null)}
              >
                <MenuItem value="meeting">{t('calendar.type_meeting')}</MenuItem>
                <MenuItem value="meet_meeting">{t('calendar.type_meet_meeting')}</MenuItem>
                <MenuItem value="task">{t('calendar.type_task')}</MenuItem>
                <MenuItem value="reminder">{t('calendar.type_reminder')}</MenuItem>
              </Select>
            </FormControl>

            <DateTimePicker
              label={t('calendar.start_date')}
              value={selectedEvent?.start_date ? new Date(selectedEvent.start_date) : null}
              onChange={(date) => setSelectedEvent(prev => prev ? { ...prev, start_date: date?.toISOString() || new Date().toISOString() } : null)}
            />

            <DateTimePicker
              label={t('calendar.end_date')}
              value={selectedEvent?.end_date ? new Date(selectedEvent.end_date) : null}
              onChange={(date) => setSelectedEvent(prev => prev ? { ...prev, end_date: date?.toISOString() || new Date().toISOString() } : null)}
            />

            {selectedEvent?.type === 'meet_meeting' && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  {t('calendar.meet_link')}:
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <TextField
                    fullWidth
                    placeholder={t('calendar.enter_meet_link')}
                    value={selectedEvent?.meet_link || ''}
                    onChange={(e) => handleMeetLinkChange(e.target.value)}
                  />
                  <Button
                    variant="contained"
                    onClick={createMeetLink}
                  >
                    {t('calendar.create_meet')}
                  </Button>
                  {selectedEvent?.meet_link && (
                    <Button
                      variant="outlined"
                      onClick={() => window.open(selectedEvent.meet_link, '_blank')}
                    >
                      {t('calendar.join_meet')}
                    </Button>
                  )}
                </Box>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          {!isNewEvent && (
            <Button onClick={handleDeleteEvent} color="error">
              {t('common.delete')}
            </Button>
          )}
          <Button onClick={handleCloseDialog}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSaveEvent} variant="contained">
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Calendar;
