import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography } from '@mui/material';
import { RootState } from '../../../store';

interface LogoProps {
  variant?: 'default' | 'small';
}

export const Logo: React.FC<LogoProps> = ({ variant = 'default' }) => {
  const { logo } = useSelector((state: RootState) => state.settings);
  const defaultLogoText = 'Modern CRM';

  if (logo) {
    return (
      <Box
        component="img"
        src={logo}
        alt={defaultLogoText}
        sx={{
          height: variant === 'small' ? 30 : 40,
          maxWidth: '100%',
          objectFit: 'contain',
        }}
      />
    );
  }

  return (
    <Typography
      variant={variant === 'small' ? 'h6' : 'h5'}
      component="h1"
      sx={{
        fontWeight: 'bold',
        color: 'primary.main',
        textDecoration: 'none',
      }}
    >
      {defaultLogoText}
    </Typography>
  );
};
