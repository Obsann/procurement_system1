import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from './features/auth/AuthGuard';
import { LoginPage } from './features/auth/LoginPage';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardPage } from './features/dashboard/DashboardPage';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AuthGuard />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          {/* Add other routes here as they are developed */}
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
