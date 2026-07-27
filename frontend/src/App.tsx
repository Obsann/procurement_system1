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
import { RFQListPage } from './features/rfqs/RFQListPage';
import { RFQFormPage } from './features/rfqs/RFQFormPage';
import { RFQDetailPage } from './features/rfqs/RFQDetailPage';
import { BidListPage } from './features/rfqs/BidListPage';
// Suppliers
import { SupplierListPage } from './features/suppliers/SupplierListPage';
import { SupplierFormPage } from './features/suppliers/SupplierFormPage';
// Purchase Orders
import { PurchaseOrderListPage } from './features/orders/PurchaseOrderListPage';
import { PurchaseOrderDetailPage } from './features/orders/PurchaseOrderDetailPage';
// Financial Review
import { FinancialReviewListPage } from './features/financial/FinancialReviewListPage';
import { FinancialReviewDetailPage } from './features/financial/FinancialReviewDetailPage';
// Goods Receipts
import { GoodsReceiptListPage } from './features/receiving/GoodsReceiptListPage';
import { GoodsReceiptFormPage } from './features/receiving/GoodsReceiptFormPage';
// Notifications & Settings
import { NotificationsPage } from './features/notifications/NotificationsPage';
import { SettingsPage } from './features/settings/SettingsPage';
// Audit Log (still a generic view — read-only is fine here)
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

          {/* Requisitions */}
          <Route element={<RoleGuard allow={rolesFor('/requisitions')} />}>
            <Route path="/requisitions" element={<RequisitionListPage />} />
            <Route path="/requisitions/new" element={<RequisitionFormPage />} />
            <Route path="/requisitions/:id" element={<RequisitionDetailPage />} />
            <Route path="/requisitions/:id/edit" element={<RequisitionFormPage />} />
          </Route>

          {/* Approvals */}
          <Route element={<RoleGuard allow={rolesFor('/approvals')} />}>
            <Route path="/approvals" element={<ApprovalQueuePage />} />
            <Route path="/approvals/pr/:id" element={<RequisitionReviewPage />} />
            <Route path="/approvals/po/:id" element={<OrderReviewPage />} />
          </Route>

          {/* RFQs */}
          <Route element={<RoleGuard allow={rolesFor('/rfqs')} />}>
            <Route path="/rfqs" element={<RFQListPage />} />
            <Route path="/rfqs/new" element={<RFQFormPage />} />
            <Route path="/rfqs/:id" element={<RFQDetailPage />} />
          </Route>

          {/* Bids */}
          <Route element={<RoleGuard allow={rolesFor('/bids')} />}>
            <Route path="/bids" element={<BidListPage />} />
          </Route>

          {/* Purchase Orders */}
          <Route element={<RoleGuard allow={rolesFor('/purchase-orders')} />}>
            <Route path="/purchase-orders" element={<PurchaseOrderListPage />} />
            <Route path="/purchase-orders/:id" element={<PurchaseOrderDetailPage />} />
          </Route>

          {/* Financial Review */}
          <Route element={<RoleGuard allow={rolesFor('/financial-review')} />}>
            <Route path="/financial-review" element={<FinancialReviewListPage />} />
            <Route path="/financial-review/:id" element={<FinancialReviewDetailPage />} />
          </Route>

          {/* Goods Receipts */}
          <Route element={<RoleGuard allow={rolesFor('/goods-receipts')} />}>
            <Route path="/goods-receipts" element={<GoodsReceiptListPage />} />
            <Route path="/goods-receipts/new" element={<GoodsReceiptFormPage />} />
          </Route>

          {/* Suppliers */}
          <Route element={<RoleGuard allow={rolesFor('/suppliers')} />}>
            <Route path="/suppliers" element={<SupplierListPage />} />
            <Route path="/suppliers/new" element={<SupplierFormPage />} />
            <Route path="/suppliers/:id/edit" element={<SupplierFormPage />} />
          </Route>

          {/* Audit Log — read-only generic view is appropriate */}
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

          {/* Notifications — proper page */}
          <Route path="/notifications" element={<NotificationsPage />} />

          {/* Settings — proper page */}
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>
    </Routes>
  </ToastProvider>
);

export default App;
