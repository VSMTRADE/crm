import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { createTimeEntry, updateTimeEntry } from '../../../store/hr/hrSlice';

interface TimeEntryDialogProps {
  open: boolean;
  onClose: () => void;
  timeEntry?: any;
}

export const TimeEntryDialog = ({
  open,
  onClose,
  timeEntry,
}: TimeEntryDialogProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  
  const [formData, setFormData] = React.useState({
    employeeId: timeEntry?.employeeId || '',
    checkIn: timeEntry?.checkIn ? new Date(timeEntry.checkIn) : null,
    checkOut: timeEntry?.checkOut ? new Date(timeEntry.checkOut) : null,
    breakStart: timeEntry?.breakStart ? new Date(timeEntry.breakStart) : null,
    breakEnd: timeEntry?.breakEnd ? new Date(timeEntry.breakEnd) : null,
    notes: timeEntry?.notes || '',
  });

  React.useEffect(() => {
    if (timeEntry) {
      setFormData({
        employeeId: timeEntry.employeeId,
        checkIn: timeEntry.checkIn ? new Date(timeEntry.checkIn) : null,
        checkOut: timeEntry.checkOut ? new Date(timeEntry.checkOut) : null,
        breakStart: timeEntry.breakStart ? new Date(timeEntry.breakStart) : null,
        breakEnd: timeEntry.breakEnd ? new Date(timeEntry.breakEnd) : null,
        notes: timeEntry.notes || '',
      });
    } else {
      setFormData({
        employeeId: '',
        checkIn: null,
        checkOut: null,
        breakStart: null,
        breakEnd: null,
        notes: '',
      });
    }
  }, [timeEntry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      checkIn: formData.checkIn?.toISOString(),
      checkOut: formData.checkOut?.toISOString(),
      breakStart: formData.breakStart?.toISOString(),
      breakEnd: formData.breakEnd?.toISOString(),
    };

    if (timeEntry) {
      dispatch(updateTimeEntry({ id: timeEntry.id, ...payload }));
    } else {
      dispatch(createTimeEntry(payload));
    }
    onClose();
  };

  const handleChange = (field: string) => (event: any) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {timeEntry ? t('time_entries.edit') : t('time_entries.add')}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label={t('fields.check_in')}
                  value={formData.checkIn}
                  onChange={(date) => setFormData({ ...formData, checkIn: date })}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label={t('fields.check_out')}
                  value={formData.checkOut}
                  onChange={(date) => setFormData({ ...formData, checkOut: date })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label={t('fields.break_start')}
                  value={formData.breakStart}
                  onChange={(date) => setFormData({ ...formData, breakStart: date })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label={t('fields.break_end')}
                  value={formData.breakEnd}
                  onChange={(date) => setFormData({ ...formData, breakEnd: date })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={t('fields.notes')}
                value={formData.notes}
                onChange={handleChange('notes')}
                multiline
                rows={3}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" variant="contained" color="primary">
            {t('common.save')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
