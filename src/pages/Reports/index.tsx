import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import {
  fetchSalesDataAsync,
  fetchLeadsDataAsync,
  fetchDealsDataAsync,
  fetchTopProductsAsync,
  fetchRevenueTrendAsync,
} from '../../store/slices/reportsSlice';
import { ReportFilter } from '../../services/reportsService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Reports: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const salesData = useSelector((state: RootState) => state.reports.salesData);
  const leadsData = useSelector((state: RootState) => state.reports.leadsData);
  const dealsData = useSelector((state: RootState) => state.reports.dealsData);
  const topProducts = useSelector((state: RootState) => state.reports.topProducts);
  const revenueTrend = useSelector((state: RootState) => state.reports.revenueTrend);
  const loading = useSelector((state: RootState) => state.reports.isLoading);
  const error = useSelector((state: RootState) => state.reports.error);

  const [filters, setFilters] = useState<ReportFilter>({
    startDate: null,
    endDate: null,
    type: 'all',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          dispatch(fetchSalesDataAsync({ startDate: filters.startDate, endDate: filters.endDate })).unwrap(),
          dispatch(fetchLeadsDataAsync()).unwrap(),
          dispatch(fetchDealsDataAsync()).unwrap(),
          dispatch(fetchTopProductsAsync(5)).unwrap(),
          dispatch(fetchRevenueTrendAsync(12)).unwrap(),
        ]);
      } catch (error) {
        console.error('Error loading reports:', error);
      }
    };

    loadData();
  }, [dispatch, filters.startDate, filters.endDate]);

  const handleExport = (format: 'pdf' | 'excel') => {
    // TODO: Implementar exportação de relatórios
    console.log(`Exporting as ${format}...`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Paper elevation={0} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            {t('reports.title')}
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              onClick={() => handleExport('pdf')}
            >
              {t('reports.export_pdf')}
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleExport('excel')}
            >
              {t('reports.export_excel')}
            </Button>
          </Stack>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Filtros */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <DatePicker
                label={t('reports.start_date')}
                value={filters.startDate}
                onChange={(date) => setFilters({ ...filters, startDate: date })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <DatePicker
                label={t('reports.end_date')}
                value={filters.endDate}
                onChange={(date) => setFilters({ ...filters, endDate: date })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>{t('reports.type')}</InputLabel>
                <Select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                >
                  <MenuItem value="all">{t('reports.type_all')}</MenuItem>
                  <MenuItem value="sales">{t('reports.type_sales')}</MenuItem>
                  <MenuItem value="leads">{t('reports.type_leads')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Gráficos */}
        <Grid container spacing={3}>
          {/* Vendas por Mês */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardHeader title={t('reports.sales_by_month')} />
              <CardContent>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={salesData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" name={t('reports.sales')} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Leads por Fonte */}
          <Grid item xs={12} lg={4}>
            <Card>
              <CardHeader title={t('reports.leads_by_source')} />
              <CardContent>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={leadsData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {leadsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Status dos Negócios */}
          <Grid item xs={12} lg={4}>
            <Card>
              <CardHeader title={t('reports.deals_by_status')} />
              <CardContent>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dealsData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {dealsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Top Produtos */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardHeader title={t('reports.top_products')} />
              <CardContent>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topProducts}
                      layout="vertical"
                      margin={{
                        top: 5,
                        right: 30,
                        left: 100,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#82ca9d" name={t('reports.quantity')} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Tendência de Receita */}
          <Grid item xs={12}>
            <Card>
              <CardHeader title={t('reports.revenue_trend')} />
              <CardContent>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={revenueTrend}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="value" stroke="#8884d8" name={t('reports.revenue')} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Reports;
