import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Typography,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CloudDownload as CloudDownloadIcon,
} from '@mui/icons-material';
import { LoadingState } from '../../../components/Common/LoadingState';
import { EmptyState } from '../../../components/Common/EmptyState';
import { ConfirmDialog } from '../../../components/Common/ConfirmDialog';
import DocumentDialog from './DocumentDialog';
import { Document } from '../../../types';
import { 
  fetchDocuments, 
  deleteDocument,
  getDocumentUrl 
} from '../../../store/slices/documentsSlice';
import { formatFileSize, formatDate } from '../../../utils/formatters';

const Documents: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { documents, loading, error } = useSelector((state: RootState) => state.documents);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedDocument, setSelectedDocument] = React.useState<Document | null>(null);
  const [openConfirmDialog, setOpenConfirmDialog] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  React.useEffect(() => {
    dispatch(fetchDocuments());
  }, [dispatch]);

  const handleAdd = () => {
    setSelectedDocument(null);
    setOpenDialog(true);
  };

  const handleEdit = (document: Document) => {
    setSelectedDocument(document);
    setOpenDialog(true);
  };

  const handleDelete = (document: Document) => {
    setSelectedDocument(document);
    setOpenConfirmDialog(true);
  };

  const handleDownload = async (document: Document) => {
    try {
      const url = await getDocumentUrl(document.file_path);
      window.open(url, '_blank');
    } catch (error) {
      setSnackbar({
        open: true,
        message: t('documents.download_error'),
        severity: 'error'
      });
    }
  };

  const confirmDelete = async () => {
    if (selectedDocument) {
      try {
        await dispatch(deleteDocument(selectedDocument)).unwrap();
        setSnackbar({
          open: true,
          message: t('documents.delete_success'),
          severity: 'success'
        });
      } catch (error) {
        setSnackbar({
          open: true,
          message: t('documents.delete_error'),
          severity: 'error'
        });
      }
      setOpenConfirmDialog(false);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          {t('documents.title')}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAdd}
          startIcon={<AddIcon />}
        >
          {t('documents.add')}
        </Button>
      </Box>

      {documents.length === 0 ? (
        <EmptyState
          message={t('common.no_records')}
        />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('fields.employee')}</TableCell>
                <TableCell>{t('fields.title')}</TableCell>
                <TableCell>{t('fields.type')}</TableCell>
                <TableCell>{t('fields.size')}</TableCell>
                <TableCell>{t('fields.upload_date')}</TableCell>
                <TableCell>{t('fields.expiry_date')}</TableCell>
                <TableCell align="center">{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((document) => (
                <TableRow key={document.id}>
                  <TableCell>
                    {document.employee
                      ? `${document.employee.first_name} ${document.employee.last_name}`
                      : '-'}
                  </TableCell>
                  <TableCell>{document.title}</TableCell>
                  <TableCell>{t(`document_types.${document.type}`)}</TableCell>
                  <TableCell>{formatFileSize(document.file_size)}</TableCell>
                  <TableCell>{formatDate(document.created_at)}</TableCell>
                  <TableCell>
                    {document.expiry_date ? formatDate(document.expiry_date) : '-'}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton 
                      onClick={() => handleEdit(document)}
                      color="primary"
                      title={t('common.edit')}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDelete(document)}
                      color="error"
                      title={t('common.delete')}
                    >
                      <DeleteIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDownload(document)}
                      color="primary"
                      title={t('common.download')}
                    >
                      <CloudDownloadIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <DocumentDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        document={selectedDocument}
      />

      <ConfirmDialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        onConfirm={confirmDelete}
        title={t('documents.delete_title')}
        content={t('documents.delete_confirmation')}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Documents;
