import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardHeader,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@mui/material';

export const LanguageSettings: React.FC = () => {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newLanguage = event.target.value;
    i18n.changeLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  return (
    <Card>
      <CardHeader title={t('settings.language.title')} />
      <CardContent>
        <FormControl component="fieldset">
          <RadioGroup
            aria-label="language"
            name="language"
            value={i18n.language}
            onChange={handleLanguageChange}
          >
            <FormControlLabel
              value="pt-BR"
              control={<Radio />}
              label={t('settings.language.pt_BR')}
            />
            <FormControlLabel
              value="en"
              control={<Radio />}
              label={t('settings.language.en')}
            />
          </RadioGroup>
        </FormControl>
      </CardContent>
    </Card>
  );
};
