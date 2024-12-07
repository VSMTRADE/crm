import React, { useState, useEffect } from 'react';
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
  Alert,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { uploadDocument, type Document } from '../../../store/hr/documentsSlice';
import { useEmployees } from '../../../hooks/useEmployees';

interface DocumentDialogProps {
  open: boolean;
  onClose: () => void;
  document?: Document | null;
}

const DOCUMENT_TYPES = [
  'contract',
  'id',
  'resume',
  'certification',
  'training',
  'evaluation',
  'other'
] as const;

type DocumentType = typeof DOCUMENT_TYPES[number];

interface FormData {
  employee_id: string;
  type: DocumentType;
  title: string;
  description: string;
  file: File | null;
  expiry_date: Date | null;
}

const DocumentDialog: React.FC<DocumentDialogProps> = ({
  open,
  onClose,
  document,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { employees, loading: loadingEmployees } = useEmployees();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const initialFormData: FormData = {
    employee_id: document?.employee_id || '',
    type: (document?.type as DocumentType) || 'contract',
    title: document?.title || '',
    description: document?.description || '',
    file: null,
    expiry_date: document?.expiry_date ? new Date(document.expiry_date) : null,
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);

  useEffect(() => {
    if (open) {
      setFormData(initialFormData);
      setError(null);
    }
  }, [open, document]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (!formData.employee_id) {
        throw new Error(t('validation.employee_required'));
      }

      if (!formData.file) {
        throw new Error(t('validation.file_required'));
      }

      if (!formData.title.trim()) {
        throw new Error(t('validation.title_required'));
      }

      await dispatch(uploadDocument({
        file: formData.file,
        employeeId: formData.employee_id,
        title: formData.title,
        type: formData.type,
        description: formData.description,
        expiryDate: formData.expiry_date?.toISOString(),
      })).unwrap();
      
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error_occurred'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFormData({ ...formData, file: event.target.files[0] });
    }
  };

  const handleDateChange = (date: Date | null) => {
    setFormData({ ...formData, expiry_date: date });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{ sx: { minHeight: '50vh' } }}
    >
      <DialogTitle>
        {document
          ? t('documents.edit_title')
          : t('documents.add_title')}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <TextField
                  select
                  label={t('fields.employee')}
                  value={formData.employee_id}
                  onChange={handleChange('employee_id')}
                  required
                  disabled={loadingEmployees}
                >
                  {loadingEmployees ? (
                    <MenuItem disabled>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={20} />
                        <Typography>{t('common.loading')}</Typography>
                      </Box>
                    </MenuItem>
                  ) : (
                    employees.map((employee) => (
                      <MenuItem key={employee.id} value={employee.id}>
                        {`${employee.first_name} ${employee.last_name}`}
                      </MenuItem>
                    ))
                  )}
                </TextField>
              </FormControl>
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
                  {DOCUMENT_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {t(`document_types.${type}`)}
                    </MenuItem>
                  ))}
                </TextField>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label={t('fields.title')}
                value={formData.title}
                onChange={handleChange('title')}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label={t('fields.description')}
                multiline
                rows={4}
                value={formData.description}
                onChange={handleChange('description')}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                type="file"
                onChange={handleFileChange}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                required={!document}
              />
              {document && (
                <Typography variant="caption" color="textSecondary">
                  {t('documents.leave_empty_no_change')}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label={t('fields.expiry_date')}
                  value={formData.expiry_date}
                  onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      helperText: t('documents.expiry_date_helper')
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={submitting}>
            {t('common.cancel')}
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={submitting}
            startIcon={submitting && <CircularProgress size={20} />}
          >
            {submitting ? t('common.saving') : t('common.save')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default DocumentDialog;
