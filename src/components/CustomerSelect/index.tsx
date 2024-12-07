import React from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { useCustomers, Customer } from '../../hooks/useCustomers';

interface CustomerSelectProps {
  value: Customer | null;
  onChange: (customer: Customer | null) => void;
}

const CustomerSelect: React.FC<CustomerSelectProps> = ({ value, onChange }) => {
  const { customers } = useCustomers();

  return (
    <Autocomplete
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      options={customers}
      getOptionLabel={(option) => `${option.name} (${option.phone})`}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Selecionar Cliente"
          fullWidth
        />
      )}
      renderOption={(props, option) => (
        <li {...props}>
          <div>
            <div>{option.name}</div>
            <div style={{ fontSize: '0.8em', color: 'gray' }}>
              {option.email} • {option.phone}
            </div>
          </div>
        </li>
      )}
    />
  );
};

export default CustomerSelect;
