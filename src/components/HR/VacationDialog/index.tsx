import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { RootState } from '../../../store';
import { addVacation, updateVacation } from '../../../store/hr/hrSlice';

interface VacationDialogProps {
  open: boolean;
  onClose: () => void;
  vacation?: any;
}

export const VacationDialog = ({ open, onClose, vacation }: VacationDialogProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { employees } = useSelector((state: RootState) => state.hr);

  const [formData, setFormData] = useState({
    employeeId: '',
    startDate: null,
    endDate: null,
    type: 'vacation',
    status: 'pending',
  });

  useEffect(() => {
    if (vacation) {
      setFormData({
        employeeId: vacation.employeeId,
        startDate: new Date(vacation.startDate),
        endDate: new Date(vacation.endDate),
        type: vacation.type,
        status: vacation.status,
      });
    } else {
      setFormData({
        employeeId: '',
        startDate: null,
        endDate: null,
        type: 'vacation',
        status: 'pending',
      });
    }
  }, [vacation]);

  const handleSubmit = () => {
    const payload = {
      ...formData,
      startDate: formData.startDate?.toISOString(),
      endDate: formData.endDate?.toISOString(),
    };

    if (vacation) {
      dispatch(updateVacation({ id: vacation.id, ...payload }));
    } else {
      dispatch(addVacation(payload));
    }

    onClose();
  };

  const handleChange = (field: string) => (event: any) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {vacation ? t('vacations.edit') : t('vacations.add')}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>{t('fields.employee')}</InputLabel>
              <Select
                value={formData.employeeId}
                onChange={handleChange('employeeId')}
                label={t('fields.employee')}
              >
                {employees?.map((employee: any) => (
                  <MenuItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <DatePicker
              label={t('fields.start_date')}
              value={formData.startDate}
              onChange={(date) => setFormData({ ...formData, startDate: date })}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <DatePicker
              label={t('fields.end_date')}
              value={formData.endDate}
              onChange={(date) => setFormData({ ...formData, endDate: date })}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>{t('fields.type')}</InputLabel>
              <Select
                value={formData.type}
                onChange={handleChange('type')}
                label={t('fields.type')}
              >
                <MenuItem value="vacation">{t('vacation_types.vacation')}</MenuItem>
                <MenuItem value="sick_leave">{t('vacation_types.sick_leave')}</MenuItem>
                <MenuItem value="personal_leave">{t('vacation_types.personal_leave')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>{t('fields.status')}</InputLabel>
              <Select
                value={formData.status}
                onChange={handleChange('status')}
                label={t('fields.status')}
              >
                <MenuItem value="pending">{t('status.pending')}</MenuItem>
                <MenuItem value="approved">{t('status.approved')}</MenuItem>
                <MenuItem value="rejected">{t('status.rejected')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
