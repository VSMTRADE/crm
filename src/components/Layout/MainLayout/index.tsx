import React, { useState } from 'react';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import { Header } from '../Header';
import { Sidebar } from '../Sidebar';
import { useDispatch } from 'react-redux';
import { initializeLogo } from '../../../store/slices/settingsSlice';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const dispatch = useDispatch();

  // Inicializa o logotipo ao carregar o layout
  React.useEffect(() => {
    dispatch(initializeLogo());
  }, [dispatch]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* Header */}
      <Header onToggleDrawer={handleDrawerToggle} />

      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - 240px)` },
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Toolbar /> {/* Espaçamento para o header fixo */}
        {children}
      </Box>
    </Box>
  );
};
