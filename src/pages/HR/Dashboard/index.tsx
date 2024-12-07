import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import {
  PeopleAlt as PeopleIcon,
  BeachAccess as VacationIcon,
  AccessTime as TimeIcon,
  LocalHospital as BenefitsIcon,
} from '@mui/icons-material';

const HRDashboard: React.FC = () => {
  const { t } = useTranslation();
  const {
    employees,
    vacations,
    timeEntries,
    benefits,
  } = useSelector((state: RootState) => state.hr);

  // Cálculos para o dashboard
  const activeEmployees = employees.filter(emp => emp.status === 'active').length;
  const pendingVacations = vacations.filter(vac => vac.status === 'pending').length;
  const todayTimeEntries = timeEntries.filter(
    entry => entry.date === new Date().toISOString().split('T')[0]
  ).length;
  const activeBenefits = benefits.filter(ben => ben.status === 'active').length;

  const summaryCards = [
    {
      title: t('hr_dashboard.totalEmployees'),
      value: activeEmployees,
      icon: <PeopleIcon fontSize="large" color="primary" />,
    },
    {
      title: t('hr_dashboard.pendingVacations'),
      value: pendingVacations,
      icon: <VacationIcon fontSize="large" color="secondary" />,
    },
    {
      title: t('hr_dashboard.todayTimeEntries'),
      value: todayTimeEntries,
      icon: <TimeIcon fontSize="large" color="info" />,
    },
    {
      title: t('hr_dashboard.activeBenefits'),
      value: activeBenefits,
      icon: <BenefitsIcon fontSize="large" color="success" />,
    },
  ];

  // Lista de funcionários de férias
  const employeesOnVacation = vacations
    .filter(vac => vac.status === 'approved')
    .map(vac => {
      const employee = employees.find(emp => emp.id === vac.employeeId);
      return {
        ...vac,
        employeeName: employee?.name || '',
      };
    });

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        {t('hr_dashboard.title')}
      </Typography>

      <Grid container spacing={3} mb={3}>
        {summaryCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    {card.title}
                  </Typography>
                  <Typography variant="h4">{card.value}</Typography>
                </Box>
                {card.icon}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title={t('hr_dashboard.employeesOnVacation')} />
            <CardContent>
              <List>
                {employeesOnVacation.length > 0 ? (
                  employeesOnVacation.map((vacation, index) => (
                    <React.Fragment key={vacation.id}>
                      {index > 0 && <Divider />}
                      <ListItem>
                        <ListItemText
                          primary={vacation.employeeName}
                          secondary={`${t('hr_dashboard.from')} ${new Date(vacation.startDate).toLocaleDateString()} ${t('hr_dashboard.to')} ${new Date(vacation.endDate).toLocaleDateString()}`}
                        />
                      </ListItem>
                    </React.Fragment>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText
                      primary={t('hr_dashboard.noEmployeesOnVacation')}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title={t('hr_dashboard.recentTimeEntries')} />
            <CardContent>
              <List>
                {timeEntries.length > 0 ? (
                  timeEntries
                    .slice(0, 5)
                    .map((entry, index) => {
                      const employee = employees.find(emp => emp.id === entry.employeeId);
                      return (
                        <React.Fragment key={entry.id}>
                          {index > 0 && <Divider />}
                          <ListItem>
                            <ListItemText
                              primary={employee?.name}
                              secondary={`${t('hr_dashboard.timeIn')}: ${entry.timeIn} - ${t('hr_dashboard.timeOut')}: ${entry.timeOut}`}
                            />
                          </ListItem>
                        </React.Fragment>
                      );
                    })
                ) : (
                  <ListItem>
                    <ListItemText
                      primary={t('hr_dashboard.noTimeEntries')}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HRDashboard;
