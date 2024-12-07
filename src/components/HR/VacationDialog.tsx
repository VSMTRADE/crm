import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { createVacation, updateVacation, fetchEmployees } from '../../store/slices/hrSlice';
import { Vacation } from '../../types/hr';

interface VacationDialogProps {
  open: boolean;
  onClose: () => void;
  vacation?: Vacation | null;
}

export const VacationDialog: React.FC<VacationDialogProps> = ({
  open,
  onClose,
  vacation,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { employees } = useSelector((state: RootState) => state.hr);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (open) {
      dispatch(fetchEmployees());
    }
  }, [dispatch, open]);

  const validationSchema = Yup.object().shape({
    employee_id: Yup.string().required('Campo obrigatório'),
    start_date: Yup.date().required('Campo obrigatório'),
    end_date: Yup.date()
      .required('Campo obrigatório')
      .min(Yup.ref('start_date'), 'Data final deve ser maior que a data inicial'),
    type: Yup.string().required('Campo obrigatório'),
    status: Yup.string().required('Campo obrigatório'),
    description: Yup.string().nullable(),
  });

  const formik = useFormik({
    initialValues: {
      employee_id: vacation?.employee_id || '',
      start_date: vacation?.start_date ? new Date(vacation.start_date) : null,
      end_date: vacation?.end_date ? new Date(vacation.end_date) : null,
      type: vacation?.type || 'vacation',
      status: vacation?.status || 'pending',
      description: vacation?.description || '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        console.log('Submitting vacation form with values:', values);
        
        const formattedData = {
          employee_id: values.employee_id,
          start_date: values.start_date ? new Date(values.start_date).toISOString().split('T')[0] : null,
          end_date: values.end_date ? new Date(values.end_date).toISOString().split('T')[0] : null,
          type: values.type,
          status: values.status,
          description: values.description || null,
        };
        
        console.log('Formatted data:', formattedData);

        if (!formattedData.employee_id || !formattedData.start_date || !formattedData.end_date) {
          console.error('Missing required fields:', formattedData);
          return;
        }

        if (vacation) {
          console.log('Updating vacation with ID:', vacation.id);
          await dispatch(updateVacation({ id: vacation.id, data: formattedData })).unwrap();
        } else {
          console.log('Creating new vacation');
          await dispatch(createVacation(formattedData)).unwrap();
        }
        onClose();
      } catch (error) {
        console.error('Error saving vacation:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    enableReinitialize: true,
  });

  const handleDateChange = (field: string) => (date: Date | null) => {
    if (date) {
      formik.setFieldValue(field, date);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>
          {vacation ? t('vacations.edit') : t('vacations.add')}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth error={formik.touched.employee_id && Boolean(formik.errors.employee_id)}>
                <InputLabel>{t('fields.employee')}</InputLabel>
                <Select
                  name="employee_id"
                  value={formik.values.employee_id}
                  onChange={formik.handleChange}
                  label={t('fields.employee')}
                  disabled={isSubmitting}
                >
                  {employees?.items?.map((employee) => (
                    <MenuItem key={employee.id} value={employee.id}>
                      {`${employee.first_name} ${employee.last_name}`}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.employee_id && formik.errors.employee_id && (
                  <FormHelperText>{formik.errors.employee_id}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label={t('fields.start_date')}
                value={formik.values.start_date}
                onChange={handleDateChange('start_date')}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: formik.touched.start_date && Boolean(formik.errors.start_date),
                    helperText: formik.touched.start_date && formik.errors.start_date,
                    disabled: isSubmitting,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label={t('fields.end_date')}
                value={formik.values.end_date}
                onChange={handleDateChange('end_date')}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: formik.touched.end_date && Boolean(formik.errors.end_date),
                    helperText: formik.touched.end_date && formik.errors.end_date,
                    disabled: isSubmitting,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={formik.touched.type && Boolean(formik.errors.type)}>
                <InputLabel>{t('fields.type')}</InputLabel>
                <Select
                  name="type"
                  value={formik.values.type}
                  onChange={formik.handleChange}
                  label={t('fields.type')}
                  disabled={isSubmitting}
                >
                  <MenuItem value="vacation">{t('vacations.types.vacation')}</MenuItem>
                  <MenuItem value="sick_leave">{t('vacations.types.sick_leave')}</MenuItem>
                  <MenuItem value="personal_leave">{t('vacations.types.personal_leave')}</MenuItem>
                  <MenuItem value="maternity_leave">{t('vacations.types.maternity_leave')}</MenuItem>
                  <MenuItem value="paternity_leave">{t('vacations.types.paternity_leave')}</MenuItem>
                </Select>
                {formik.touched.type && formik.errors.type && (
                  <FormHelperText>{formik.errors.type}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={formik.touched.status && Boolean(formik.errors.status)}>
                <InputLabel>{t('fields.status')}</InputLabel>
                <Select
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  label={t('fields.status')}
                  disabled={isSubmitting}
                >
                  <MenuItem value="pending">{t('vacations.status.pending')}</MenuItem>
                  <MenuItem value="approved">{t('vacations.status.approved')}</MenuItem>
                  <MenuItem value="rejected">{t('vacations.status.rejected')}</MenuItem>
                  <MenuItem value="cancelled">{t('vacations.status.cancelled')}</MenuItem>
                </Select>
                {formik.touched.status && formik.errors.status && (
                  <FormHelperText>{formik.errors.status}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                name="description"
                label={t('fields.description')}
                value={formik.values.description}
                onChange={formik.handleChange}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
                disabled={isSubmitting}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>{t('common.cancel')}</Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={isSubmitting || !formik.isValid}
          >
            {isSubmitting ? t('common.saving') : t('common.save')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
