import { useSelector } from 'react-redux';
import { createTheme } from '@mui/material';
import { RootState } from '../store';

export const useTheme = () => {
  const themeMode = useSelector((state: RootState) => state.settings.theme.mode);

  const theme = createTheme({
    palette: {
      mode: themeMode,
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
      background: {
        default: themeMode === 'light' ? '#f5f5f5' : '#121212',
        paper: themeMode === 'light' ? '#ffffff' : '#1e1e1e',
      },
    },
    components: {
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: themeMode === 'light' ? '#ffffff' : '#1e1e1e',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: themeMode === 'light' ? '#1976d2' : '#1e1e1e',
          },
        },
      },
    },
  });

  return { theme };
};
