import React, { useState, useEffect } from 'react';
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
  Paper,
  Typography,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { fetchBenefits, deleteBenefit, fetchEmployees } from '../../../store/hr/hrSlice';
import { BenefitDialog } from './BenefitDialog';
import { formatCurrency, formatDate } from '../../../utils/format';
import { LoadingState } from '../../../components/Common/LoadingState';
import { EmptyState } from '../../../components/Common/EmptyState';

interface Benefit {
  id: string;
  employee_id: string;
  type: string;
  provider: string;
  cost: number;
  start_date: string;
  end_date?: string | null;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
}

const Benefits: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const benefits = useSelector((state: RootState) => {
    const benefitsData = state.hr.benefits;
    return Array.isArray(benefitsData) ? benefitsData : [];
  });
  const employeesState = useSelector((state: RootState) => state.hr.employees);
  const employees = Array.isArray(employeesState) ? employeesState : employeesState?.items || [];
  const loading = useSelector((state: RootState) => state.hr.loading);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBenefit, setSelectedBenefit] = useState<Benefit | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading initial data...');
        await dispatch(fetchEmployees()).unwrap();
        await dispatch(fetchBenefits()).unwrap();
        console.log('Initial data loaded successfully');
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };
    loadData();
  }, [dispatch]);

  useEffect(() => {
    console.log('Employees:', employees);
  }, [employees]);

  const handleOpenDialog = (employeeId?: string) => {
    console.log('handleOpenDialog called with:', employeeId);
    console.log('Current employees:', employees);
    
    if (!employees || employees.length === 0) {
      console.log('No employees available');
      alert(t('benefits.no_employees'));
      return;
    }

    const selectedId = employeeId || employees[0]?.id;
    console.log('Selected employee ID:', selectedId);
    
    if (!selectedId) {
      console.log('No valid employee ID');
      alert(t('benefits.no_employees'));
      return;
    }

    setSelectedEmployeeId(selectedId);
    setOpenDialog(true);
  };

  const handleCloseDialog = async () => {
    console.log('handleCloseDialog called');
    setOpenDialog(false);
    setSelectedBenefit(null);
    setSelectedEmployeeId(null);
    
    try {
      console.log('Refreshing benefits list...');
      await dispatch(fetchBenefits()).unwrap();
    } catch (error) {
      console.error('Error refreshing benefits:', error);
    }
  };

  const handleEdit = (benefit: Benefit) => {
    console.log('handleEdit called with:', benefit);
    setSelectedBenefit(benefit);
    setSelectedEmployeeId(benefit.employee_id);
    setOpenDialog(true);
  };

  const handleDelete = async (id: string) => {
    console.log('handleDelete called with:', id);
    if (window.confirm(t('benefits.delete_confirmation'))) {
      await dispatch(deleteBenefit(id));
      dispatch(fetchBenefits());
    }
  };

  if (loading) {
    console.log('Loading state...');
    return <LoadingState />;
  }

  const benefitsList = benefits;
  console.log('Current benefits:', benefitsList);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          {t('benefits.title')}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            console.log('Add button clicked');
            handleOpenDialog();
          }}
          startIcon={<AddIcon />}
          disabled={!employees || employees.length === 0}
        >
          {t('benefits.add')}
        </Button>
      </Box>
      
      {benefitsList.length === 0 ? (
        <EmptyState
          title={t('benefits.title')}
          message={t('common.no_records')}
        />
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('fields.employee')}</TableCell>
                  <TableCell>{t('fields.type')}</TableCell>
                  <TableCell>{t('fields.provider')}</TableCell>
                  <TableCell>{t('fields.cost')}</TableCell>
                  <TableCell>{t('fields.start_date')}</TableCell>
                  <TableCell>{t('fields.end_date')}</TableCell>
                  <TableCell align="right">{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {benefitsList.map((benefit: Benefit) => (
                  <TableRow key={benefit.id}>
                    <TableCell>
                      {benefit.employee ? 
                        `${benefit.employee.first_name} ${benefit.employee.last_name}` : 
                        '-'
                      }
                    </TableCell>
                    <TableCell>{t(`benefits.types.${benefit.type}`)}</TableCell>
                    <TableCell>{benefit.provider}</TableCell>
                    <TableCell>{formatCurrency(benefit.cost)}</TableCell>
                    <TableCell>{formatDate(new Date(benefit.start_date))}</TableCell>
                    <TableCell>{benefit.end_date ? formatDate(new Date(benefit.end_date)) : '-'}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(benefit)}
                        title={t('common.edit')}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(benefit.id)}
                        title={t('common.delete')}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {openDialog && selectedEmployeeId && (
        <BenefitDialog
          open={openDialog}
          onClose={handleCloseDialog}
          benefit={selectedBenefit}
          employeeId={selectedEmployeeId}
        />
      )}
    </Box>
  );
};

export default Benefits;
