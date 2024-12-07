import { Box, CircularProgress } from '@mui/material';

export const LoadingState = () => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="400px"
    >
      <CircularProgress />
    </Box>
  );
};
