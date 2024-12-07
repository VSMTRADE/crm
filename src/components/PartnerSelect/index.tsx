import React from 'react';
import { Autocomplete, TextField, Box, Typography } from '@mui/material';
import { usePartners, Partner } from '../../hooks/usePartners';

interface PartnerSelectProps {
  value: Partner | null;
  onChange: (partner: Partner | null) => void;
}

const PartnerSelect: React.FC<PartnerSelectProps> = ({ value, onChange }) => {
  const { partners } = usePartners();

  return (
    <Autocomplete
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      options={partners}
      getOptionLabel={(option) => option.name}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Atribuir a Parceiro"
          fullWidth
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          <Box>
            <Typography variant="body1">{option.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {option.email} • {option.phone}
            </Typography>
          </Box>
        </Box>
      )}
      isOptionEqualToValue={(option, value) => option.id === value.id}
    />
  );
};

export default PartnerSelect;
