import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import {
  fetchEmployeesAsync,
  deleteEmployeeAsync,
  clearError
} from '../../../store/slices/employeesSlice';
import { Employee } from '../../../services/employeesService';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import EmployeeDialog from './EmployeeDialog';
import DeleteConfirmDialog from '../../../components/DeleteConfirmDialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Employees = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { employees, isLoading, error } = useSelector((state: RootState) => state.employees);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    dispatch(fetchEmployeesAsync());
  }, [dispatch]);

  const handleAdd = () => {
    setSelectedEmployee(null);
    setDialogOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDialogOpen(true);
  };

  const handleDelete = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedEmployee) {
      await dispatch(deleteEmployeeAsync(selectedEmployee.id));
      setDeleteDialogOpen(false);
      setSelectedEmployee(null);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedEmployee(null);
  };

  const handleCloseError = () => {
    dispatch(clearError());
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">{t('employees.title')}</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          {t('employees.add')}
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('fields.name')}</TableCell>
              <TableCell>{t('fields.email')}</TableCell>
              <TableCell>{t('fields.phone')}</TableCell>
              <TableCell>{t('fields.position')}</TableCell>
              <TableCell>{t('fields.department')}</TableCell>
              <TableCell>{t('fields.hire_date')}</TableCell>
              <TableCell>{t('fields.status')}</TableCell>
              <TableCell align="right">{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>
                  {`${employee.first_name} ${employee.last_name}`}
                </TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>{employee.phone}</TableCell>
                <TableCell>{employee.position}</TableCell>
                <TableCell>{employee.department}</TableCell>
                <TableCell>
                  {format(new Date(employee.hire_date), 'dd/MM/yyyy', { locale: ptBR })}
                </TableCell>
                <TableCell>
                  {employee.status === 'active' ? (
                    <Typography color="primary">Ativo</Typography>
                  ) : (
                    <Typography color="error">Inativo</Typography>
                  )}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    color="primary"
                    onClick={() => handleEdit(employee)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(employee)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <EmployeeDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        employee={selectedEmployee}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t('employees.delete_title')}
        content={t('employees.delete_confirmation')}
      />

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
      >
        <Alert onClose={handleCloseError} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Employees;
