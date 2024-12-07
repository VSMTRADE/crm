import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  Box,
  Grid,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Analytics = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const contacts = useSelector((state: RootState) => state.contacts.contacts);
  const deals = useSelector((state: RootState) => state.deals.deals);
  const tasks = useSelector((state: RootState) => state.tasks.tasks);

  // Estatísticas gerais
  const totalContacts = contacts.length;
  const totalDeals = deals.length;
  const totalTasks = tasks.length;
  const totalDealValue = deals.reduce((sum, deal) => sum + (Number(deal.value) || 0), 0);

  // Dados para o gráfico de status dos negócios
  const dealsByStatus = deals.reduce((acc: { [key: string]: number }, deal) => {
    acc[deal.status] = (acc[deal.status] || 0) + 1;
    return acc;
  }, {});

  const dealStatusData = Object.entries(dealsByStatus).map(([status, count]) => ({
    name: status === 'em_andamento' ? 'Em Andamento' : 
          status === 'ganho' ? 'Ganho' : 
          status === 'perdido' ? 'Perdido' : 
          status === 'prospecto' ? 'Prospecto' : status,
    value: count,
  }));

  // Dados para o gráfico de tarefas por status
  const tasksByStatus = tasks.reduce((acc: { [key: string]: number }, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});

  const taskStatusData = Object.entries(tasksByStatus).map(([status, count]) => ({
    name: status === 'a_fazer' ? 'A Fazer' :
          status === 'em_andamento' ? 'Em Andamento' :
          status === 'concluido' ? 'Concluído' : status,
    value: count,
  }));

  // Dados para o gráfico de valor dos negócios por mês
  const currentDate = new Date();
  const lastSixMonths = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    return {
      month: format(date, 'MMM', { locale: ptBR }),
      start: startOfMonth(date),
      end: endOfMonth(date),
    };
  }).reverse();

  const dealValueByMonth = lastSixMonths.map(({ month, start, end }) => ({
    month,
    value: deals
      .filter(deal => {
        const dealDate = parseISO(deal.createdAt || new Date().toISOString());
        return isWithinInterval(dealDate, { start, end });
      })
      .reduce((sum, deal) => sum + (Number(deal.value) || 0), 0),
  }));

  // Cores para os gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Análises
      </Typography>

      {/* Cards com métricas principais */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Total de Contatos</Typography>
            <Typography variant="h4">{totalContacts}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Total de Negócios</Typography>
            <Typography variant="h4">{totalDeals}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Total de Tarefas</Typography>
            <Typography variant="h4">{totalTasks}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Valor Total de Negócios</Typography>
            <Typography variant="h4">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(totalDealValue)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3}>
        {/* Gráfico de Pizza - Status dos Negócios */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Status dos Negócios
            </Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={dealStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {dealStatusData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Gráfico de Pizza - Status das Tarefas */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Status das Tarefas
            </Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={taskStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {taskStatusData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Gráfico de Linha - Valor dos Negócios por Mês */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Valor dos Negócios por Mês
            </Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={dealValueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis
                    tickFormatter={(value) =>
                      new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        notation: 'compact',
                      }).format(value)
                    }
                  />
                  <Tooltip
                    formatter={(value: any) =>
                      new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(value)
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Valor"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;
