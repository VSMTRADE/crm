import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
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
  InputLabel,
  Select,
  FormHelperText,
  CircularProgress,
} from '@mui/material';
import { createBenefit, updateBenefit, fetchBenefits } from '../../../store/hr/hrSlice';
import { format } from 'date-fns';

interface Benefit {
  id: string;
  employee_id: string;
  type: string;
  provider: string;
  cost: number;
  start_date: string;
  end_date?: string | null;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
}

interface BenefitDialogProps {
  open: boolean;
  onClose: () => void;
  benefit?: Benefit | null;
  employeeId: string;
}

export const BenefitDialog: React.FC<BenefitDialogProps> = ({
  open,
  onClose,
  benefit,
  employeeId,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const employeesState = useSelector((state: RootState) => state.hr.employees);
  const employees = Array.isArray(employeesState) ? employeesState : employeesState?.items || [];
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  console.log('BenefitDialog rendered with:', { open, benefit, employeeId });
  console.log('Current employees:', employees);

  const [formData, setFormData] = useState({
    employee_id: employeeId,
    type: benefit?.type || '',
    provider: benefit?.provider || '',
    cost: benefit?.cost || 0,
    start_date: benefit?.start_date || format(new Date(), 'yyyy-MM-dd'),
    end_date: benefit?.end_date || '',
    description: benefit?.description || '',
  });

  useEffect(() => {
    console.log('employeeId changed:', employeeId);
    if (employeeId) {
      setFormData(prev => ({
        ...prev,
        employee_id: employeeId,
      }));
    }
  }, [employeeId]);

  useEffect(() => {
    console.log('benefit changed:', benefit);
    if (benefit) {
      setFormData({
        employee_id: benefit.employee_id,
        type: benefit.type,
        provider: benefit.provider,
        cost: benefit.cost,
        start_date: benefit.start_date,
        end_date: benefit.end_date || '',
        description: benefit.description || '',
      });
    }
  }, [benefit]);

  const validate = () => {
    console.log('Validating form data:', formData);
    const newErrors: Record<string, boolean> = {};
    if (!formData.employee_id) newErrors.employee_id = true;
    if (!formData.type) newErrors.type = true;
    if (!formData.provider) newErrors.provider = true;
    if (!formData.cost || formData.cost <= 0) newErrors.cost = true;
    if (!formData.start_date) newErrors.start_date = true;
    if (formData.end_date && new Date(formData.end_date) <= new Date(formData.start_date)) {
      newErrors.end_date = true;
    }

    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    if (!validate()) {
      console.log('Form validation failed');
      return;
    }

    // Format the data before submission
    const submissionData = {
      ...formData,
      cost: Number(formData.cost),
      start_date: format(new Date(formData.start_date), 'yyyy-MM-dd'),
      end_date: formData.end_date ? format(new Date(formData.end_date), 'yyyy-MM-dd') : null,
    };

    console.log('Formatted submission data:', submissionData);

    setLoading(true);
    try {
      let result;
      if (benefit?.id) {
        console.log('Updating benefit:', benefit.id);
        result = await dispatch(updateBenefit({ ...submissionData, id: benefit.id })).unwrap();
        console.log('Update result:', result);
      } else {
        console.log('Creating new benefit with data:', submissionData);
        result = await dispatch(createBenefit(submissionData)).unwrap();
        console.log('Create result:', result);
      }
      
      if (!result) {
        throw new Error('No data returned from the server');
      }

      console.log('Operation successful, fetching updated benefits list');
      await dispatch(fetchBenefits()).unwrap();
      console.log('Benefit saved and list updated successfully');
      onClose();
    } catch (error: any) {
      console.error('Error saving benefit:', error);
      console.error('Error payload:', error.payload);
      
      let errorMessage = t('common.error_saving');
      
      if (error.payload) {
        if (error.payload.message) {
          errorMessage += `\nMessage: ${error.payload.message}`;
        }
        if (error.payload.details) {
          errorMessage += `\nDetails: ${error.payload.details}`;
        }
        if (error.payload.hint) {
          errorMessage += `\nHint: ${error.payload.hint}`;
        }
      } else if (error.message) {
        errorMessage += `\n${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof typeof formData) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    const value = field === 'cost' ? Number(event.target.value) : event.target.value;
    console.log('Field changed:', field, 'New value:', value);
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  if (!employeeId || !open) {
    console.log('Dialog not rendered - missing employeeId or not open');
    return null;
  }

  return (
    <Dialog 
      open={open} 
      onClose={loading ? undefined : onClose} 
      maxWidth="sm" 
      fullWidth
      disableEscapeKeyDown={loading}
    >
      <DialogTitle>
        {benefit ? t('benefits.edit') : t('benefits.add')}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth error={errors.employee_id}>
                <InputLabel>{t('fields.employee')}</InputLabel>
                <Select
                  value={formData.employee_id}
                  onChange={handleChange('employee_id')}
                  label={t('fields.employee')}
                  disabled={loading}
                >
                  {employees?.map((employee) => (
                    <MenuItem key={employee.id} value={employee.id}>
                      {`${employee.first_name} ${employee.last_name}`}
                    </MenuItem>
                  ))}
                </Select>
                {errors.employee_id && (
                  <FormHelperText>{t('validation.required')}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth error={errors.type}>
                <InputLabel>{t('fields.type')}</InputLabel>
                <Select
                  value={formData.type}
                  onChange={handleChange('type')}
                  label={t('fields.type')}
                  disabled={loading}
                >
                  <MenuItem value="health">{t('benefits.types.health')}</MenuItem>
                  <MenuItem value="dental">{t('benefits.types.dental')}</MenuItem>
                  <MenuItem value="life">{t('benefits.types.life')}</MenuItem>
                  <MenuItem value="meal">{t('benefits.types.meal')}</MenuItem>
                  <MenuItem value="transport">{t('benefits.types.transport')}</MenuItem>
                </Select>
                {errors.type && (
                  <FormHelperText>{t('validation.required')}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={t('fields.provider')}
                value={formData.provider}
                onChange={handleChange('provider')}
                fullWidth
                error={errors.provider}
                helperText={errors.provider && t('validation.required')}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={t('fields.cost')}
                type="number"
                value={formData.cost}
                onChange={handleChange('cost')}
                fullWidth
                error={errors.cost}
                helperText={errors.cost && t('validation.required')}
                inputProps={{ min: 0, step: 0.01 }}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={t('fields.start_date')}
                type="date"
                value={formData.start_date}
                onChange={handleChange('start_date')}
                fullWidth
                error={errors.start_date}
                helperText={errors.start_date && t('validation.required')}
                InputLabelProps={{ shrink: true }}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={t('fields.end_date')}
                type="date"
                value={formData.end_date}
                onChange={handleChange('end_date')}
                fullWidth
                error={errors.end_date}
                helperText={errors.end_date && t('validation.end_date_after_start')}
                InputLabelProps={{ shrink: true }}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={t('fields.description')}
                value={formData.description}
                onChange={handleChange('description')}
                fullWidth
                multiline
                rows={3}
                disabled={loading}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? t('common.saving') : t('common.save')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
