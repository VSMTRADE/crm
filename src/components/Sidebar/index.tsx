import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ContactPage as ContactsIcon,
  MonetizationOn as DealsIcon,
  ShoppingCart as OrdersIcon,
  Task as TasksIcon,
  BarChart as AnalyticsIcon,
  AccountBalance as FinancialIcon,
  QrCode as QrCodeIcon,
  PeopleAlt as PeopleIcon,
  BeachAccess as VacationIcon,
  AccessTime as TimeIcon,
  LocalHospital as BenefitsIcon,
  Folder as DocumentsIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const menuItems = [
  { text: 'dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
  { text: 'contacts', icon: <ContactsIcon />, path: '/admin/contacts' },
  { text: 'deals', icon: <DealsIcon />, path: '/admin/deals' },
  { text: 'orders', icon: <OrdersIcon />, path: '/admin/orders' },
  { text: 'tasks', icon: <TasksIcon />, path: '/admin/tasks' },
  { text: 'analytics', icon: <AnalyticsIcon />, path: '/admin/analytics' },
  { text: 'financial', icon: <FinancialIcon />, path: '/admin/financial' },
  { text: 'qr_code', icon: <QrCodeIcon />, path: '/admin/qrcode' },
  { 
    text: 'human_resources',
    icon: <PeopleIcon />,
    children: [
      { text: 'hr_dashboard', icon: <DashboardIcon />, path: '/admin/hr/dashboard' },
      { text: 'employees', icon: <PeopleIcon />, path: '/admin/hr/employees' },
      { text: 'vacations', icon: <VacationIcon />, path: '/admin/hr/vacations' },
      { text: 'time_entries', icon: <TimeIcon />, path: '/admin/hr/time-entries' },
      { text: 'benefits', icon: <BenefitsIcon />, path: '/admin/hr/benefits' },
      { text: 'documents', icon: <DocumentsIcon />, path: '/admin/hr/documents' },
    ],
  },
];

const Sidebar = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const isChildSelected = (children: typeof menuItems[0]['children']) => {
    if (!children) return false;
    return children.some(child => location.pathname === child.path);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar>
        <Box component="img" src="/logo.png" alt="Logo" sx={{ height: 40 }} />
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <React.Fragment key={item.text}>
            {item.children ? (
              <>
                <ListItem disablePadding>
                  <ListItemButton selected={isChildSelected(item.children)}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={t(`sidebar.${item.text}`, { lng: i18n.language })} />
                  </ListItemButton>
                </ListItem>
                <List component="div" disablePadding>
                  {item.children.map((child) => (
                    <ListItem key={child.text} disablePadding>
                      <ListItemButton
                        component={Link}
                        to={child.path}
                        selected={location.pathname === child.path}
                        sx={{ pl: 4 }}
                      >
                        <ListItemIcon>{child.icon}</ListItemIcon>
                        <ListItemText primary={t(`sidebar.${child.text}`, { lng: i18n.language })} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </>
            ) : (
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={location.pathname === item.path}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={t(`sidebar.${item.text}`, { lng: i18n.language })} />
                </ListItemButton>
              </ListItem>
            )}
          </React.Fragment>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
