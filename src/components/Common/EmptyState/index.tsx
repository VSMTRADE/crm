import { Box, Typography } from '@mui/material';
import { InboxOutlined } from '@mui/icons-material';

interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
}

export const EmptyState = ({ message, icon }: EmptyStateProps) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="200px"
      py={4}
    >
      {icon || <InboxOutlined sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />}
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};
