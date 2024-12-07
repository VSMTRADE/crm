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
  Card,
  CardHeader,
  CardContent,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { fetchTimeEntries, deleteTimeEntry } from '../../../store/hr/hrSlice';
import { TimeEntryDialog } from './TimeEntryDialog';
import { ConfirmDialog } from '../../../components/Common/ConfirmDialog';
import { LoadingState } from '../../../components/Common/LoadingState';
import { EmptyState } from '../../../components/Common/EmptyState';
import { formatDate } from '../../../utils/format';

const TimeEntries = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { timeEntries = [], loading } = useSelector((state: RootState) => state.hr);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedTimeEntry, setSelectedTimeEntry] = React.useState<any>(null);
  const [openConfirm, setOpenConfirm] = React.useState(false);

  React.useEffect(() => {
    dispatch(fetchTimeEntries());
  }, [dispatch]);

  const handleAdd = () => {
    setSelectedTimeEntry(null);
    setOpenDialog(true);
  };

  const handleEdit = (timeEntry: any) => {
    setSelectedTimeEntry(timeEntry);
    setOpenDialog(true);
  };

  const handleDelete = (timeEntry: any) => {
    setSelectedTimeEntry(timeEntry);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (selectedTimeEntry) {
      dispatch(deleteTimeEntry(selectedTimeEntry.id));
      setOpenConfirm(false);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <Box>
      <Card>
        <CardHeader
          title={t('time_entries.title')}
          action={
            <Button
              variant="contained"
              color="primary"
              onClick={handleAdd}
              startIcon={<AddIcon />}
            >
              {t('time_entries.add')}
            </Button>
          }
        />
        <CardContent>
          {timeEntries.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('fields.date')}</TableCell>
                    <TableCell>{t('fields.check_in')}</TableCell>
                    <TableCell>{t('fields.check_out')}</TableCell>
                    <TableCell>{t('fields.total_hours')}</TableCell>
                    <TableCell align="right">{t('common.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {timeEntries.map((timeEntry: any) => (
                    <TableRow key={timeEntry.id}>
                      <TableCell>{formatDate(timeEntry.date)}</TableCell>
                      <TableCell>{timeEntry.checkIn}</TableCell>
                      <TableCell>{timeEntry.checkOut}</TableCell>
                      <TableCell>{timeEntry.totalHours}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(timeEntry)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(timeEntry)}
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

      <TimeEntryDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        timeEntry={selectedTimeEntry}
      />

      <ConfirmDialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        onConfirm={handleConfirmDelete}
        title={t('time_entries.delete')}
        message={t('time_entries.delete_confirm')}
      />
    </Box>
  );
};

export default TimeEntries;
