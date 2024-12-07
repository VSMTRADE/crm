import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  Typography,
  Grid,
} from '@mui/material';
import { BrandingSettings } from '../../components/Settings/BrandingSettings';
import { ThemeSettings } from '../../components/Settings/ThemeSettings';
import { NotificationSettings } from '../../components/Settings/NotificationSettings';
import { SecuritySettings } from '../../components/Settings/SecuritySettings';
import { LanguageSettings } from '../../components/Settings/LanguageSettings';

const Settings = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="lg">
      <Box py={3}>
        <Typography variant="h4" gutterBottom>
          {t('settings.title')}
        </Typography>

        <Grid container spacing={3}>
          {/* Branding Settings */}
          <Grid item xs={12}>
            <BrandingSettings />
          </Grid>

          {/* Theme Settings */}
          <Grid item xs={12} md={6}>
            <ThemeSettings />
          </Grid>

          {/* Notification Settings */}
          <Grid item xs={12} md={6}>
            <NotificationSettings />
          </Grid>

          {/* Language Settings */}
          <Grid item xs={12} md={6}>
            <LanguageSettings />
          </Grid>

          {/* Security Settings */}
          <Grid item xs={12} md={6}>
            <SecuritySettings />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Settings;
