import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useTheme,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Palette as PaletteIcon,
  Notifications as NotificationsIcon,
  Language as LanguageIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  setThemeMode,
  toggleNotifications,
  toggleNotificationSound,
  toggleDesktopNotifications,
  setLanguage,
  toggleAutoLock,
  setLockTimeout,
} from '../../store/slices/settingsSlice';
import { useTranslation } from 'react-i18next';

export default function SettingsMenu() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const dispatch = useDispatch();
  const settings = useSelector((state: RootState) => state.settings);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<string>('');

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenDialog = (type: string) => {
    setDialogType(type);
    setOpenDialog(true);
    handleClose();
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleToggleTheme = () => {
    dispatch(setThemeMode(settings.theme.mode === 'light' ? 'dark' : 'light'));
  };

  const handleToggleNotifications = () => {
    dispatch(toggleNotifications(!settings.notifications.enabled));
  };

  const handleToggleNotificationSound = () => {
    dispatch(toggleNotificationSound(!settings.notifications.sound));
  };

  const handleToggleDesktopNotifications = () => {
    dispatch(toggleDesktopNotifications(!settings.notifications.desktop));
  };

  const handleChangeLanguage = (event: any) => {
    const newLanguage = event.target.value;
    i18n.changeLanguage(newLanguage).then(() => {
      dispatch(setLanguage(newLanguage));
    });
  };

  const handleToggleAutoLock = () => {
    dispatch(toggleAutoLock(!settings.security.autoLock));
  };

  const handleChangeLockTimeout = (event: any) => {
    dispatch(setLockTimeout(Number(event.target.value)));
  };

  const renderDialogContent = () => {
    switch (dialogType) {
      case 'appearance':
        return (
          <>
            <DialogTitle>{t('settings.appearance.title')}</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.theme.mode === 'dark'}
                      onChange={handleToggleTheme}
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PaletteIcon />
                      <Typography>{t('settings.appearance.darkMode')}</Typography>
                    </Box>
                  }
                />
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  {t('settings.appearance.darkModeDescription')}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>{t('user.cancel')}</Button>
            </DialogActions>
          </>
        );
      case 'notifications':
        return (
          <>
            <DialogTitle>{t('settings.notifications.title')}</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.enabled}
                      onChange={handleToggleNotifications}
                    />
                  }
                  label={t('settings.notifications.enable')}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.sound}
                      onChange={handleToggleNotificationSound}
                      disabled={!settings.notifications.enabled}
                    />
                  }
                  label={t('settings.notifications.sound')}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.desktop}
                      onChange={handleToggleDesktopNotifications}
                      disabled={!settings.notifications.enabled}
                    />
                  }
                  label={t('settings.notifications.desktop')}
                />
              </Box>
            </DialogContent>
          </>
        );
      case 'language':
        return (
          <>
            <DialogTitle>{t('settings.language.title')}</DialogTitle>
            <DialogContent>
              <FormControl fullWidth>
                <InputLabel>{t('settings.language.select')}</InputLabel>
                <Select
                  value={settings.language}
                  label={t('settings.language.select')}
                  onChange={handleChangeLanguage}
                >
                  <MenuItem value="pt-BR">{t('settings.language.pt-BR')}</MenuItem>
                  <MenuItem value="en-US">{t('settings.language.en-US')}</MenuItem>
                  <MenuItem value="es">{t('settings.language.es')}</MenuItem>
                </Select>
              </FormControl>
            </DialogContent>
          </>
        );
      case 'security':
        return (
          <>
            <DialogTitle>{t('settings.security.title')}</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.security.autoLock}
                      onChange={handleToggleAutoLock}
                    />
                  }
                  label={t('settings.security.autoLock')}
                />
                <FormControl fullWidth disabled={!settings.security.autoLock}>
                  <InputLabel>{t('settings.security.lockTimeout')}</InputLabel>
                  <Select
                    value={settings.security.lockTimeout}
                    label={t('settings.security.lockTimeout')}
                    onChange={handleChangeLockTimeout}
                  >
                    <MenuItem value={5}>5 {t('settings.security.minutes')}</MenuItem>
                    <MenuItem value={15}>15 {t('settings.security.minutes')}</MenuItem>
                    <MenuItem value={30}>30 {t('settings.security.minutes')}</MenuItem>
                    <MenuItem value={60}>1 {t('settings.security.hour')}</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </DialogContent>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <SettingsIcon />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 250,
          },
        }}
      >
        <MenuItem onClick={() => handleOpenDialog('appearance')}>
          <PaletteIcon sx={{ mr: 2 }} />
          <Typography>{t('settings.appearance.title')}</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleOpenDialog('notifications')}>
          <NotificationsIcon sx={{ mr: 2 }} />
          <Typography>{t('settings.notifications.title')}</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleOpenDialog('language')}>
          <LanguageIcon sx={{ mr: 2 }} />
          <Typography>{t('settings.language.title')}</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleOpenDialog('security')}>
          <SecurityIcon sx={{ mr: 2 }} />
          <Typography>{t('settings.security.title')}</Typography>
        </MenuItem>
      </Menu>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        {renderDialogContent()}
        {dialogType !== 'appearance' && (
          <DialogActions>
            <Button onClick={handleCloseDialog}>{t('user.cancel')}</Button>
            <Button variant="contained" onClick={handleCloseDialog} color="primary">
              {t('user.save')}
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </>
  );
}
