import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  CardContent,
  CardHeader,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import { RootState } from '../../../store';
import { updateThemeMode } from '../../../store/slices/settingsSlice';

export const ThemeSettings: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { themeMode } = useSelector((state: RootState) => state.settings);

  const handleThemeModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updateThemeMode(event.target.value as 'light' | 'dark' | 'system'));
  };

  return (
    <Card>
      <CardHeader title={t('settings.theme.title')} />
      <CardContent>
        <FormControl component="fieldset">
          <RadioGroup
            aria-label="theme-mode"
            name="theme-mode"
            value={themeMode}
            onChange={handleThemeModeChange}
          >
            <FormControlLabel
              value="light"
              control={<Radio />}
              label={t('settings.theme.mode.light')}
            />
            <FormControlLabel
              value="dark"
              control={<Radio />}
              label={t('settings.theme.mode.dark')}
            />
            <FormControlLabel
              value="system"
              control={<Radio />}
              label={t('settings.theme.mode.system')}
            />
          </RadioGroup>
        </FormControl>
      </CardContent>
    </Card>
  );
};
