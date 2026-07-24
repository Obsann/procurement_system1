import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from './features/auth/AuthGuard';
import { LoginPage } from './features/auth/LoginPage';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { ResourceListPage } from './features/operations/ResourceListPage';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AuthGuard />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/requisitions" element={<ResourceListPage title="Requisitions" endpoint="/requisitions/" emptyMessage="No requisitions have been created." actions={[{ label: 'Submit', path: (row) => `/requisitions/${row.id}/submit/` }]} />} />
          <Route path="/suppliers" element={<ResourceListPage title="Suppliers" endpoint="/suppliers/" emptyMessage="No suppliers have been registered." />} />
          <Route path="/rfqs" element={<ResourceListPage title="Requests for Quotation" endpoint="/rfqs/" emptyMessage="No RFQs have been created." actions={[{ label: 'Send', path: (row) => `/rfqs/${row.id}/send/` }, { label: 'Close', path: (row) => `/rfqs/${row.id}/close/` }]} />} />
          <Route path="/bids" element={<ResourceListPage title="Bids" endpoint="/bids/" emptyMessage="No bids have been received." actions={[{ label: 'Select winner', path: (row) => `/bids/${row.id}/select_winner/` }]} />} />
          <Route path="/purchase-orders" element={<ResourceListPage title="Purchase Orders" endpoint="/purchase-orders/" emptyMessage="No purchase orders have been created." actions={[{ label: 'Submit for review', path: (row) => `/purchase-orders/${row.id}/submit-for-review/` }]} />} />
          <Route path="/goods-receipts" element={<ResourceListPage title="Goods Receipts" endpoint="/goods-receipts/" emptyMessage="No goods receipts have been recorded." />} />
          <Route path="/audit-log" element={<ResourceListPage title="Audit Log" endpoint="/audit-logs/" emptyMessage="No audit events are available." readOnly />} />
          <Route path="/approvals" element={<ResourceListPage title="Approvals" endpoint="/approvals/" emptyMessage="No approval decisions have been recorded." readOnly />} />
          <Route path="/settings" element={<ResourceListPage title="Notifications" endpoint="/notifications/" emptyMessage="You have no notifications." />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
