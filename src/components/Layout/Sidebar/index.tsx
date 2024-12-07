import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Toolbar,
  useTheme,
  useMediaQuery,
  Collapse,
  ListItemButton,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  BeachAccess as VacationIcon,
  AccessTime as TimeIcon,
  LocalHospital as BenefitsIcon,
  Description as DocumentsIcon,
  Contacts as ContactsIcon,
  ShoppingCart as OrdersIcon,
  MonetizationOn as DealsIcon,
  Assignment as TasksIcon,
  CalendarMonth as CalendarIcon,
  Assessment as ReportsIcon,
  ExpandLess,
  ExpandMore,
  Work as HRIcon,
} from '@mui/icons-material';
import { useState } from 'react';

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

const drawerWidth = 240;

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onClose }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));
  const [hrMenuOpen, setHrMenuOpen] = useState(location.pathname.startsWith('/admin/hr'));

  const mainMenuItems = [
    { path: '/admin/dashboard', icon: <DashboardIcon />, label: t('sidebar.dashboard') },
    { path: '/admin/contacts', icon: <ContactsIcon />, label: t('sidebar.contacts') },
    { path: '/admin/deals', icon: <DealsIcon />, label: t('sidebar.deals') },
    { path: '/admin/orders', icon: <OrdersIcon />, label: t('sidebar.orders') },
    { path: '/admin/tasks', icon: <TasksIcon />, label: t('sidebar.tasks') },
    { path: '/admin/calendar', icon: <CalendarIcon />, label: t('sidebar.calendar') },
    { path: '/admin/reports', icon: <ReportsIcon />, label: t('sidebar.reports') },
  ];

  const hrMenuItems = [
    { path: '/admin/hr/employees', icon: <PeopleIcon />, label: t('sidebar.hr_employees') },
    { path: '/admin/hr/vacations', icon: <VacationIcon />, label: t('sidebar.hr_vacations') },
    { path: '/admin/hr/time-entries', icon: <TimeIcon />, label: t('sidebar.hr_time_entries') },
    { path: '/admin/hr/benefits', icon: <BenefitsIcon />, label: t('sidebar.hr_benefits') },
    { path: '/admin/hr/documents', icon: <DocumentsIcon />, label: t('sidebar.hr_documents') },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    if (!isDesktop) onClose();
  };

  const drawer = (
    <div>
      <Toolbar /> {/* Espaçamento para o header fixo */}
      <List>
        {/* Menu Principal */}
        {mainMenuItems.map((item) => (
          <ListItem
            button
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => handleNavigate(item.path)}
          >
            <ListItemIcon
              sx={{
                color: location.pathname === item.path ? 'primary.main' : 'inherit',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              sx={{
                color: location.pathname === item.path ? 'primary.main' : 'inherit',
              }}
            />
          </ListItem>
        ))}

        {/* Menu RH */}
        <ListItemButton onClick={() => setHrMenuOpen(!hrMenuOpen)}>
          <ListItemIcon>
            <HRIcon />
          </ListItemIcon>
          <ListItemText primary={t('sidebar.hr')} />
          {hrMenuOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        
        <Collapse in={hrMenuOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {hrMenuItems.map((item) => (
              <ListItem
                button
                key={item.path}
                selected={location.pathname === item.path}
                onClick={() => handleNavigate(item.path)}
                sx={{ pl: 4 }}
              >
                <ListItemIcon
                  sx={{
                    color: location.pathname === item.path ? 'primary.main' : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  sx={{
                    color: location.pathname === item.path ? 'primary.main' : 'inherit',
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Collapse>
      </List>
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};
