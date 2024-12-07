import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  styled,
  Snackbar,
  Alert
} from '@mui/material';
import { Person, ExitToApp, Lock, Edit } from '@mui/icons-material';
import { uploadAvatar } from '../../services/uploadService';
import { updateProfile, logout } from '../../store/slices/authSlice';
import { RootState } from '../../store';

const VisuallyHiddenInput = styled('input')`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1px;
`;

export default function UserMenu() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatar || '/default-avatar.png');
  const [isUploading, setIsUploading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenProfileDialog = () => {
    setOpenProfileDialog(true);
    handleClose();
  };

  const handleCloseProfileDialog = () => {
    setOpenProfileDialog(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setIsUploading(true);
        
        // Criar URL temporária para preview
        const previewUrl = URL.createObjectURL(file);
        setAvatarUrl(previewUrl);
        
        // Fazer upload do arquivo
        const uploadedAvatarUrl = await uploadAvatar(file);
        
        // Atualizar o perfil do usuário com a nova URL do avatar
        dispatch(updateProfile({ avatar: uploadedAvatarUrl }));
        
        setSnackbar({
          open: true,
          message: t('user.uploadSuccess'),
          severity: 'success'
        });
      } catch (error) {
        console.error('Error uploading avatar:', error);
        setSnackbar({
          open: true,
          message: t('user.uploadError'),
          severity: 'error'
        });
        
        // Reverter para o avatar anterior em caso de erro
        setAvatarUrl(user?.avatar || '/default-avatar.png');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleLogout = () => {
    // Limpar o estado do Redux
    dispatch(logout());
    
    // Limpar token do localStorage
    localStorage.removeItem('token');
    
    // Redirecionar para a página de login
    navigate('/login');
    
    // Fechar o menu
    handleClose();
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{ ml: 2 }}
        aria-controls={Boolean(anchorEl) ? 'account-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
      >
        <Avatar
          src={avatarUrl}
          sx={{ width: 32, height: 32 }}
        />
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={Boolean(anchorEl)}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleOpenProfileDialog}>
          <Person sx={{ mr: 1 }} />
          {t('user.profile')}
        </MenuItem>
        <MenuItem>
          <Lock sx={{ mr: 1 }} />
          {t('user.changePassword')}
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ExitToApp sx={{ mr: 1 }} />
          {t('user.logout')}
        </MenuItem>
      </Menu>

      <Dialog 
        open={openProfileDialog} 
        onClose={handleCloseProfileDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('user.editProfile')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3, mt: 2 }}>
            <Box sx={{ position: 'relative', mb: 2 }}>
              <Avatar
                src={avatarUrl}
                sx={{
                  width: 120,
                  height: 120,
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.8
                  }
                }}
                onClick={handleAvatarClick}
              />
              <IconButton
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: 'background.paper',
                  boxShadow: 1,
                  '&:hover': { backgroundColor: 'background.paper' }
                }}
                size="small"
                onClick={handleAvatarClick}
                disabled={isUploading}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Box>
            <Typography variant="caption" color="textSecondary">
              {t('user.clickToUpload')}
            </Typography>
            <VisuallyHiddenInput
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </Box>
          {/* Outros campos do perfil aqui */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProfileDialog}>{t('user.cancel')}</Button>
          <Button variant="contained" color="primary">
            {t('user.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
