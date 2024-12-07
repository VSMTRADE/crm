import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Dashboard from '../pages/Dashboard';
import Calendar from '../pages/Calendar';
import Reports from '../pages/Reports';
import Settings from '../pages/Settings';
import Login from '../pages/Login';
import NotFound from '../pages/NotFound';
import HRDashboard from '../pages/HR/Dashboard';
import Employees from '../pages/HR/Employees';
import Vacations from '../pages/HR/Vacations';
import TimeEntries from '../pages/HR/TimeEntries';
import Benefits from '../pages/HR/Benefits';
import Documents from '../pages/HR/Documents';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        
        {/* HR Routes */}
        <Route path="hr">
          <Route index element={<HRDashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="vacations" element={<Vacations />} />
          <Route path="time-entries" element={<TimeEntries />} />
          <Route path="benefits" element={<Benefits />} />
          <Route path="documents" element={<Documents />} />
        </Route>

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
