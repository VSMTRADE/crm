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
  MenuItem,
  FormControl,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { createVacation, updateVacation } from '../../../store/hr/hrSlice';

interface VacationDialogProps {
  open: boolean;
  onClose: () => void;
  vacation?: any;
  employeeId: string;
}

const VacationDialog: React.FC<VacationDialogProps> = ({
  open,
  onClose,
  vacation,
  employeeId,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = React.useState({
    employeeId: employeeId,
    startDate: vacation?.startDate || null,
    endDate: vacation?.endDate || null,
    type: vacation?.type || 'vacation',
    notes: vacation?.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (vacation) {
      await dispatch(updateVacation({ id: vacation.id, ...formData }));
    } else {
      await dispatch(createVacation(formData));
    }
    onClose();
  };

  const handleChange = (field: string) => (event: any) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {vacation ? t('vacations.edit') : t('vacations.add')}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label={t('fields.start_date')}
                  value={formData.startDate}
                  onChange={(date) => setFormData({ ...formData, startDate: date })}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label={t('fields.end_date')}
                  value={formData.endDate}
                  onChange={(date) => setFormData({ ...formData, endDate: date })}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <TextField
                  select
                  label={t('fields.type')}
                  value={formData.type}
                  onChange={handleChange('type')}
                  required
                >
                  {Object.entries(t('vacation_types', { returnObjects: true })).map(
                    ([key, value]) => (
                      <MenuItem key={key} value={key}>
                        {value}
                      </MenuItem>
                    )
                  )}
                </TextField>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={t('fields.notes')}
                multiline
                rows={4}
                value={formData.notes}
                onChange={handleChange('notes')}
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

export default VacationDialog;
