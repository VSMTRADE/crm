import { Grid, Paper, Typography, Box, useTheme } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  People as PeopleIcon,
  BusinessCenter as BusinessIcon,
  Assignment as TaskIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { 
  format, 
  isToday,
  startOfMonth,
  endOfMonth,
  parseISO,
  subMonths,
  startOfDay
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Dashboard() {
  const theme = useTheme();
  const contacts = useSelector((state: RootState) => state.contacts.contacts);
  const deals = useSelector((state: RootState) => state.deals.deals);
  const tasks = useSelector((state: RootState) => state.tasks.tasks);

  // Cálculo das métricas
  const totalContacts = contacts.length;
  
  // Negócios ativos são todos que não estão ganhos ou perdidos
  const activeDeals = deals.filter(deal => 
    !['ganho', 'perdido'].includes(deal.status)
  ).length;
  
  // Tarefas para hoje - usando startOfDay para comparação precisa
  const tasksForToday = tasks.filter(task => {
    if (!task.due_date) return false;
    const taskDate = parseISO(task.due_date);
    const today = new Date();
    return format(taskDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
  }).length;

  // Cálculo da receita total (todos os negócios ganhos)
  const totalRevenue = deals
    .filter(deal => deal.status === 'ganho')
    .reduce((total, deal) => total + deal.value, 0);

  const statsCards = [
    {
      title: 'Total de Contatos',
      value: totalContacts,
      icon: PeopleIcon,
      color: theme.palette.primary.main,
    },
    {
      title: 'Negócios Ativos',
      value: activeDeals,
      icon: BusinessIcon,
      color: theme.palette.success.main,
    },
    {
      title: 'Tarefas para Hoje',
      value: tasksForToday,
      icon: TaskIcon,
      color: theme.palette.warning.main,
    },
    {
      title: 'Receita Total',
      value: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(totalRevenue),
      icon: MoneyIcon,
      color: theme.palette.info.main,
    },
  ];

  // Dados para o gráfico de receita dos últimos 6 meses
  const revenueData = deals.reduce((acc: any[], deal) => {
    try {
      const date = parseISO(deal.endDate || deal.createdAt || new Date().toISOString());
      const monthYear = format(date, 'MMM yyyy', { locale: ptBR });
      
      const existingMonth = acc.find(item => item.name === monthYear);
      if (existingMonth) {
        existingMonth.valor += deal.value || 0;
        existingMonth.ganhos += deal.status === 'ganho' ? (deal.value || 0) : 0;
        existingMonth.emAndamento += ['novo', 'em_andamento', 'negociacao'].includes(deal.status) ? (deal.value || 0) : 0;
        existingMonth.perdidos += deal.status === 'perdido' ? (deal.value || 0) : 0;
      } else {
        acc.push({
          name: monthYear,
          valor: deal.value || 0,
          ganhos: deal.status === 'ganho' ? (deal.value || 0) : 0,
          emAndamento: ['novo', 'em_andamento', 'negociacao'].includes(deal.status) ? (deal.value || 0) : 0,
          perdidos: deal.status === 'perdido' ? (deal.value || 0) : 0,
        });
      }
      return acc;
    } catch (error) {
      console.error('Error processing deal:', deal, error);
      return acc;
    }
  }, []).sort((a, b) => a.sortDate - b.sortDate);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Painel
      </Typography>
      
      <Grid container spacing={3}>
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={card.title}>
              <Paper
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
                elevation={3}
              >
                <Box display="flex" alignItems="center" mb={2}>
                  <Icon sx={{ color: card.color, fontSize: 40, mr: 1 }} />
                  <Typography variant="h6" color="textSecondary">
                    {card.title}
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {card.value}
                </Typography>
              </Paper>
            </Grid>
          );
        })}

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }} elevation={3}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Visão Geral da Receita
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: theme.palette.text.primary }}
                  />
                  <YAxis 
                    tick={{ fill: theme.palette.text.primary }}
                    tickFormatter={(value) => 
                      new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        notation: 'compact',
                        maximumFractionDigits: 1,
                      }).format(value)
                    }
                  />
                  <Tooltip 
                    formatter={(value: number) => 
                      new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(value)
                    }
                  />
                  <Bar 
                    dataKey="ganhos" 
                    name="Ganhos"
                    fill={theme.palette.success.main}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="emAndamento" 
                    name="Em Andamento"
                    fill={theme.palette.primary.main}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="perdidos" 
                    name="Perdidos"
                    fill={theme.palette.error.main}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
