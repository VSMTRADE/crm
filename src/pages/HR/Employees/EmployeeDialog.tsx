import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import {
  createEmployeeAsync,
  updateEmployeeAsync,
  fetchManagersAsync
} from '../../../store/slices/employeesSlice';
import { Employee, EmployeeFormData } from '../../../services/employeesService';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  FormHelperText,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import { useFormik } from 'formik';

interface EmployeeDialogProps {
  open: boolean;
  onClose: () => void;
  employee: Employee | null;
}

const departments = [
  'Tecnologia',
  'Recursos Humanos',
  'Financeiro',
  'Comercial',
  'Marketing',
  'Operações',
  'Administrativo',
];

const statusOptions = [
  { value: 'active', label: 'employees.status.active' },
  { value: 'inactive', label: 'employees.status.inactive' },
  { value: 'on_leave', label: 'employees.status.on_leave' },
];

const EmployeeDialog: React.FC<EmployeeDialogProps> = ({ open, onClose, employee }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { managers, error, employees } = useSelector((state: RootState) => state.employees);
  const formik = useFormik({
    initialValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      hire_date: format(new Date(), 'yyyy-MM-dd'),
      position: '',
      department: '',
      salary: 0,
      status: 'active',
      manager_id: undefined,
    },
    onSubmit: async (values) => {
      try {
        if (employee) {
          await dispatch(updateEmployeeAsync({ id: employee.id, employee: values })).unwrap();
        } else {
          await dispatch(createEmployeeAsync(values)).unwrap();
        }
        onClose();
      } catch (error) {
        console.error('Error saving employee:', error);
      }
    },
  });

  useEffect(() => {
    if (open) {
      if (employee) {
        formik.setValues({
          first_name: employee.first_name,
          last_name: employee.last_name,
          email: employee.email,
          phone: employee.phone || '',
          hire_date: employee.hire_date,
          position: employee.position,
          department: employee.department,
          salary: employee.salary || 0,
          status: employee.status,
          manager_id: employee.manager_id,
        });
      } else {
        formik.setValues({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          hire_date: format(new Date(), 'yyyy-MM-dd'),
          position: '',
          department: '',
          salary: 0,
          status: 'active',
          manager_id: undefined,
        });
      }
      dispatch(fetchManagersAsync());
    }
  }, [open, employee, dispatch]);

  const handleDateChange = (date: Date | null) => {
    if (date) {
      formik.setValues({
        ...formik.values,
        hire_date: format(date, 'yyyy-MM-dd'),
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>
          {employee ? t('employees.edit') : t('employees.add')}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('fields.first_name')}
                name="first_name"
                value={formik.values.first_name}
                onChange={formik.handleChange}
                error={formik.touched.first_name && Boolean(formik.errors.first_name)}
                helperText={formik.touched.first_name && formik.errors.first_name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('fields.last_name')}
                name="last_name"
                value={formik.values.last_name}
                onChange={formik.handleChange}
                error={formik.touched.last_name && Boolean(formik.errors.last_name)}
                helperText={formik.touched.last_name && formik.errors.last_name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('fields.email')}
                name="email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('fields.phone')}
                name="phone"
                value={formik.values.phone}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label={t('fields.hire_date')}
                value={formik.values.hire_date ? new Date(formik.values.hire_date) : null}
                onChange={handleDateChange}
                slotProps={{ 
                  textField: { 
                    fullWidth: true, 
                    required: true,
                    label: t('fields.hire_date')
                  } 
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('fields.position')}
                name="position"
                value={formik.values.position}
                onChange={formik.handleChange}
                error={formik.touched.position && Boolean(formik.errors.position)}
                helperText={formik.touched.position && formik.errors.position}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>{t('fields.department')}</InputLabel>
                <Select
                  name="department"
                  value={formik.values.department}
                  onChange={formik.handleChange}
                  label={t('fields.department')}
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('fields.salary')}
                name="salary"
                type="number"
                value={formik.values.salary}
                onChange={formik.handleChange}
                InputProps={{
                  startAdornment: t('fields.salary_prefix'),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="status-label">{t('fields.status')}</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  error={formik.touched.status && Boolean(formik.errors.status)}
                  label={t('fields.status')}
                >
                  <MenuItem value="active">{t('employees.status.active')}</MenuItem>
                  <MenuItem value="inactive">{t('employees.status.inactive')}</MenuItem>
                  <MenuItem value="on_leave">{t('employees.status.on_leave')}</MenuItem>
                </Select>
                {formik.touched.status && formik.errors.status && (
                  <FormHelperText error>{formik.errors.status}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="manager-label">{t('fields.manager')}</InputLabel>
                <Select
                  labelId="manager-label"
                  id="manager_id"
                  name="manager_id"
                  value={formik.values.manager_id || ''}
                  onChange={formik.handleChange}
                  error={formik.touched.manager_id && Boolean(formik.errors.manager_id)}
                  label={t('fields.manager')}
                >
                  <MenuItem value="">{t('common.none')}</MenuItem>
                  {employees
                    .filter((emp) => emp.id !== employee?.id)
                    .map((emp) => (
                      <MenuItem key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name}
                      </MenuItem>
                    ))}
                </Select>
                {formik.touched.manager_id && formik.errors.manager_id && (
                  <FormHelperText error>{formik.errors.manager_id}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="contained" color="primary">
            {t('common.save')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EmployeeDialog;
