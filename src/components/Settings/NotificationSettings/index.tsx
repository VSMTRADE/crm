import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  CardContent,
  CardHeader,
  FormControlLabel,
  Switch,
  Stack,
} from '@mui/material';
import { RootState } from '../../../store';
import { updateNotificationSettings } from '../../../store/slices/settingsSlice';

export const NotificationSettings: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { notifications } = useSelector((state: RootState) => state.settings);

  const handleNotificationChange = (type: 'email' | 'push' | 'sms') => {
    dispatch(updateNotificationSettings({
      ...notifications,
      [type]: !notifications[type],
    }));
  };

  return (
    <Card>
      <CardHeader title={t('settings.notifications.title')} />
      <CardContent>
        <Stack spacing={2}>
          <FormControlLabel
            control={
              <Switch
                checked={notifications.email}
                onChange={() => handleNotificationChange('email')}
              />
            }
            label={t('settings.notifications.email')}
          />
          <FormControlLabel
            control={
              <Switch
                checked={notifications.push}
                onChange={() => handleNotificationChange('push')}
              />
            }
            label={t('settings.notifications.push')}
          />
          <FormControlLabel
            control={
              <Switch
                checked={notifications.sms}
                onChange={() => handleNotificationChange('sms')}
              />
            }
            label={t('settings.notifications.sms')}
          />
        </Stack>
      </CardContent>
    </Card>
  );
};
