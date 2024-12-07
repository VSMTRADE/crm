import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Card,
  CardHeader,
  CardContent,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { fetchVacations, deleteVacation } from '../../../store/slices/hrSlice';
import { VacationDialog } from '../../../components/HR/VacationDialog';
import { ConfirmDialog } from '../../../components/Common/ConfirmDialog';
import { LoadingState } from '../../../components/Common/LoadingState';
import { EmptyState } from '../../../components/Common/EmptyState';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Vacations = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { items: vacations = [], loading } = useSelector((state: RootState) => state.hr.vacations);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedVacation, setSelectedVacation] = React.useState<any>(null);
  const [openConfirm, setOpenConfirm] = React.useState(false);

  React.useEffect(() => {
    dispatch(fetchVacations());
  }, [dispatch]);

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedVacation(null);
    // Recarrega a lista de férias após fechar o diálogo
    dispatch(fetchVacations());
  };

  const handleAdd = () => {
    setSelectedVacation(null);
    setOpenDialog(true);
  };

  const handleEdit = (vacation: any) => {
    setSelectedVacation(vacation);
    setOpenDialog(true);
  };

  const handleDelete = (vacation: any) => {
    setSelectedVacation(vacation);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedVacation) {
      await dispatch(deleteVacation(selectedVacation.id));
      setOpenConfirm(false);
      // Recarrega a lista após deletar
      dispatch(fetchVacations());
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <Box>
      <Card>
        <CardHeader
          title={t('vacations.title')}
          action={
            <Button
              variant="contained"
              color="primary"
              onClick={handleAdd}
              startIcon={<AddIcon />}
            >
              {t('vacations.add')}
            </Button>
          }
        />
        <CardContent>
          {vacations.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('fields.employee')}</TableCell>
                    <TableCell>{t('fields.start_date')}</TableCell>
                    <TableCell>{t('fields.end_date')}</TableCell>
                    <TableCell>{t('fields.type')}</TableCell>
                    <TableCell>{t('fields.status')}</TableCell>
                    <TableCell align="right">{t('common.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vacations.map((vacation: any) => (
                    <TableRow key={vacation.id}>
                      <TableCell>
                        {`${vacation.employee?.first_name} ${vacation.employee?.last_name}`}
                      </TableCell>
                      <TableCell>{format(new Date(vacation.start_date), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                      <TableCell>{format(new Date(vacation.end_date), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                      <TableCell>{t(`vacations.types.${vacation.type}`)}</TableCell>
                      <TableCell>{t(`vacations.status.${vacation.status}`)}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="primary"
                          onClick={() => handleEdit(vacation)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(vacation)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <EmptyState message={t('common.no_records')} />
          )}
        </CardContent>
      </Card>

      <VacationDialog
        open={openDialog}
        onClose={handleCloseDialog}
        vacation={selectedVacation}
      />

      <ConfirmDialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        onConfirm={handleConfirmDelete}
        title={t('vacations.delete')}
        message={t('vacations.delete_confirm')}
      />
    </Box>
  );
};

export default Vacations;
