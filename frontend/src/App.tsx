import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthGuard } from './features/auth/AuthGuard';
import { RoleGuard } from './features/auth/RoleGuard';
import { LoginPage } from './features/auth/LoginPage';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { RequisitionListPage } from './features/requisitions/RequisitionListPage';
import { RequisitionFormPage } from './features/requisitions/RequisitionFormPage';
import { RequisitionDetailPage } from './features/requisitions/RequisitionDetailPage';
import { ApprovalQueuePage } from './features/approvals/ApprovalQueuePage';
import { RequisitionReviewPage } from './features/approvals/RequisitionReviewPage';
import { OrderReviewPage } from './features/approvals/OrderReviewPage';
import { ResourceListPage } from './features/operations/ResourceListPage';
import { ToastProvider } from './components/ui';
import { navItems } from './components/layout/navigation';
import { type Role } from './types';

/** Keeps route protection and sidebar visibility driven by one definition. */
const rolesFor = (path: string): Role[] =>
  navItems.find((item) => item.path === path)?.roles ?? [];

const App: React.FC = () => (
  <ToastProvider>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AuthGuard />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route element={<RoleGuard allow={rolesFor('/requisitions')} />}>
            <Route path="/requisitions" element={<RequisitionListPage />} />
            <Route path="/requisitions/new" element={<RequisitionFormPage />} />
            <Route path="/requisitions/:id" element={<RequisitionDetailPage />} />
            <Route path="/requisitions/:id/edit" element={<RequisitionFormPage />} />
          </Route>

          <Route element={<RoleGuard allow={rolesFor('/approvals')} />}>
            <Route path="/approvals" element={<ApprovalQueuePage />} />
            <Route path="/approvals/pr/:id" element={<RequisitionReviewPage />} />
            <Route path="/approvals/po/:id" element={<OrderReviewPage />} />
          </Route>

          <Route element={<RoleGuard allow={rolesFor('/rfqs')} />}>
            <Route
              path="/rfqs"
              element={
                <ResourceListPage
                  title="Requests for Quotation"
                  endpoint="/rfqs/"
                  emptyMessage="No RFQs have been created."
                  actions={[
                    { label: 'Send', path: (row) => `/rfqs/${row.id}/send/` },
                    { label: 'Close', path: (row) => `/rfqs/${row.id}/close/` },
                  ]}
                />
              }
            />
          </Route>

          <Route element={<RoleGuard allow={rolesFor('/bids')} />}>
            <Route
              path="/bids"
              element={
                <ResourceListPage
                  title="Bids"
                  endpoint="/bids/"
                  emptyMessage="No bids have been received."
                  actions={[
                    { label: 'Select winner', path: (row) => `/bids/${row.id}/select_winner/` },
                  ]}
                />
              }
            />
          </Route>

          <Route element={<RoleGuard allow={rolesFor('/purchase-orders')} />}>
            <Route
              path="/purchase-orders"
              element={
                <ResourceListPage
                  title="Purchase Orders"
                  endpoint="/purchase-orders/"
                  emptyMessage="No purchase orders have been created."
                  actions={[
                    {
                      label: 'Submit for review',
                      path: (row) => `/purchase-orders/${row.id}/submit-for-review/`,
                    },
                  ]}
                />
              }
            />
          </Route>

          <Route element={<RoleGuard allow={rolesFor('/financial-review')} />}>
            <Route
              path="/financial-review"
              element={
                <ResourceListPage
                  title="Financial Review"
                  endpoint="/financial-reviews/"
                  emptyMessage="No purchase orders are awaiting financial review."
                />
              }
            />
          </Route>

          <Route element={<RoleGuard allow={rolesFor('/goods-receipts')} />}>
            <Route
              path="/goods-receipts"
              element={
                <ResourceListPage
                  title="Goods Receipts"
                  endpoint="/goods-receipts/"
                  emptyMessage="No goods receipts have been recorded."
                />
              }
            />
          </Route>

          <Route element={<RoleGuard allow={rolesFor('/suppliers')} />}>
            <Route
              path="/suppliers"
              element={
                <ResourceListPage
                  title="Suppliers"
                  endpoint="/suppliers/"
                  emptyMessage="No suppliers have been registered."
                />
              }
            />
          </Route>

          <Route element={<RoleGuard allow={rolesFor('/audit-log')} />}>
            <Route
              path="/audit-log"
              element={
                <ResourceListPage
                  title="Audit Log"
                  endpoint="/audit-logs/"
                  emptyMessage="No audit events are available."
                  readOnly
                />
              }
            />
          </Route>

          <Route
            path="/notifications"
            element={
              <ResourceListPage
                title="Notifications"
                endpoint="/notifications/"
                emptyMessage="You have no notifications."
                readOnly
              />
            }
          />
          <Route
            path="/settings"
            element={
              <ResourceListPage
                title="Settings"
                endpoint="/notifications/"
                emptyMessage="Nothing to configure yet."
                readOnly
              />
            }
          />
        </Route>
      </Route>
    </Routes>
  </ToastProvider>
);

export default App;
