import React, { useState } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Button,
  Divider,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAllNotifications,
} from '../../store/slices/notificationsSlice';
import { formatDistanceToNow } from 'date-fns';
import { ptBR, enUS, es } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

export default function NotificationsMenu() {
  const { t, i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const dispatch = useDispatch();
  const notifications = useSelector(
    (state: RootState) => state.notifications.notifications
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Função para obter o locale correto para date-fns
  const getDateLocale = () => {
    switch (i18n.language) {
      case 'en-US':
        return enUS;
      case 'es':
        return es;
      default:
        return ptBR;
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = (id: string) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
    dispatch(clearAllNotifications());
  };

  const handleRemove = (id: string) => {
    dispatch(removeNotification(id));
  };

  const handleClearAll = () => {
    dispatch(clearAllNotifications());
    handleClose();
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'error':
        return '#f44336';
      case 'warning':
        return '#ff9800';
      case 'success':
        return '#4caf50';
      default:
        return '#2196f3';
    }
  };

  const getNotificationTitle = (type: string, originalTitle: string) => {
    switch (type) {
      case 'error':
        return t('notifications.taskOverdue');
      case 'warning':
        return t('notifications.taskToday');
      case 'info':
        return t('notifications.taskTomorrow');
      default:
        return originalTitle;
    }
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 320,
            maxHeight: 400,
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{t('notifications.title')}</Typography>
          {notifications.length > 0 && (
            <Button size="small" onClick={handleMarkAllAsRead}>
              {t('notifications.markAllAsRead')}
            </Button>
          )}
        </Box>
        <Divider />
        {notifications.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="textSecondary">
              {t('notifications.noNotifications')}
            </Typography>
          </MenuItem>
        ) : (
          <>
            {notifications.map((notification) => (
              <MenuItem
                key={notification.id}
                onClick={() => handleMarkAsRead(notification.id)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  py: 1,
                  px: 2,
                  backgroundColor: notification.read ? 'inherit' : 'action.hover',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <CircleIcon
                    sx={{
                      fontSize: 12,
                      mr: 1,
                      color: getNotificationColor(notification.type),
                    }}
                  />
                  <Typography variant="subtitle2" sx={{ flex: 1 }}>
                    {getNotificationTitle(notification.type, notification.title)}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                      locale: getDateLocale(),
                    })}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mt: 0.5, ml: 3 }}
                >
                  {notification.message}
                </Typography>
              </MenuItem>
            ))}
            <Divider />
            <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
              <Button size="small" onClick={handleClearAll} color="error">
                {t('notifications.clearAll')}
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
}
