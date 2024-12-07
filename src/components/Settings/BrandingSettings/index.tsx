import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Button,
  Typography,
  IconButton,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { updateLogo } from '../../../store/slices/settingsSlice';

export const BrandingSettings = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { logo } = useSelector((state: RootState) => state.settings);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar o arquivo
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      setSnackbar({
        open: true,
        message: t('settings.branding.logo.error.type'),
        severity: 'error',
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB
      setSnackbar({
        open: true,
        message: t('settings.branding.logo.error.size'),
        severity: 'error',
      });
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        await dispatch(updateLogo(base64String));
        setSnackbar({
          open: true,
          message: t('settings.branding.logo.success'),
          severity: 'success',
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setSnackbar({
        open: true,
        message: t('settings.branding.logo.error.upload'),
        severity: 'error',
      });
    }
  };

  const handleRemoveLogo = async () => {
    try {
      await dispatch(updateLogo(null));
      setSnackbar({
        open: true,
        message: t('settings.branding.logo.success'),
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: t('settings.branding.logo.error.upload'),
        severity: 'error',
      });
    }
  };

  return (
    <Card>
      <CardHeader title={t('settings.branding.title')} />
      <CardContent>
        <Box display="flex" flexDirection="column" gap={2}>
          <Typography variant="subtitle1" gutterBottom>
            {t('settings.branding.current_logo')}
          </Typography>
          <Box
            sx={{
              width: '100%',
              height: 100,
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            {logo ? (
              <img
                src={logo}
                alt="Logo"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
              />
            ) : (
              <Typography color="textSecondary">
                {t('settings.branding.logo')}
              </Typography>
            )}
          </Box>

          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              component="label"
              startIcon={<UploadIcon />}
            >
              {t('settings.branding.upload_logo')}
              <input
                type="file"
                hidden
                accept="image/png,image/jpeg"
                onChange={handleFileChange}
              />
            </Button>
            {logo && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleRemoveLogo}
              >
                {t('settings.branding.remove_logo')}
              </Button>
            )}
          </Box>

          <Typography variant="caption" color="textSecondary">
            {t('settings.branding.logo_requirements')}
          </Typography>
        </Box>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </CardContent>
    </Card>
  );
};
