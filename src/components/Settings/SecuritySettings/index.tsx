import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Stack,
  Typography,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { RootState } from '../../../store';
import { updateSecuritySettings } from '../../../store/slices/settingsSlice';

export const SecuritySettings: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { security } = useSelector((state: RootState) => state.settings);

  const handleTwoFactorChange = () => {
    dispatch(updateSecuritySettings({
      ...security,
      twoFactorEnabled: !security.twoFactorEnabled,
    }));
  };

  const handleChangePassword = () => {
    // TODO: Implementar lógica de alteração de senha
    console.log('Change password clicked');
  };

  return (
    <Card>
      <CardHeader title={t('settings.security.title')} />
      <CardContent>
        <Stack spacing={3}>
          <div>
            <Typography variant="subtitle1" gutterBottom>
              {t('settings.security.password.title')}
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleChangePassword}
            >
              {t('settings.security.password.change')}
            </Button>
          </div>

          <div>
            <Typography variant="subtitle1" gutterBottom>
              {t('settings.security.two_factor.title')}
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={security.twoFactorEnabled}
                  onChange={handleTwoFactorChange}
                />
              }
              label={
                security.twoFactorEnabled
                  ? t('settings.security.two_factor.disable')
                  : t('settings.security.two_factor.enable')
              }
            />
          </div>
        </Stack>
      </CardContent>
    </Card>
  );
};
