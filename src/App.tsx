import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ptBR from 'date-fns/locale/pt-BR';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { MainLayout } from './components/Layout/MainLayout';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Deals from './pages/Deals';
import Orders from './pages/Orders';
import Tasks from './pages/Tasks';
import Analytics from './pages/Analytics';
import Financial from './pages/Financial';
import QRCodeGenerator from './pages/QRCodeGenerator';
import Calendar from './pages/Calendar';
import Reports from './pages/Reports';
import Employees from './pages/HR/Employees';
import Vacations from './pages/HR/Vacations';
import TimeEntries from './pages/HR/TimeEntries';
import Benefits from './pages/HR/Benefits';
import Documents from './pages/HR/Documents';
import Settings from './pages/Settings';

function AppContent() {
  return (
    <Routes>
      {/* Rota pública */}
      <Route path="/login" element={<Login />} />
      
      {/* Rotas protegidas - área administrativa */}
      <Route
        path="/admin/*"
        element={
          <PrivateRoute>
            <MainLayout>
              <Routes>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="contacts" element={<Contacts />} />
                <Route path="deals" element={<Deals />} />
                <Route path="orders" element={<Orders />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="reports" element={<Reports />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="financial" element={<Financial />} />
                <Route path="qrcode" element={<QRCodeGenerator />} />
                <Route path="settings" element={<Settings />} />
                
                {/* Rotas de RH */}
                <Route path="hr">
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="employees" element={<Employees />} />
                  <Route path="vacations" element={<Vacations />} />
                  <Route path="time-entries" element={<TimeEntries />} />
                  <Route path="benefits" element={<Benefits />} />
                  <Route path="documents" element={<Documents />} />
                </Route>

                {/* Rota padrão */}
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </MainLayout>
          </PrivateRoute>
        }
      />

      {/* Redirecionar / para /admin/dashboard */}
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
          <CssBaseline />
          <AppContent />
        </LocalizationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
