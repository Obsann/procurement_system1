import { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContext, ToastContainer } from './components/ui';
import { Layout } from './components/Layout';
import { LoginPage, ForgotPasswordPage } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { MyRequisitions, CreateRequisition, RequisitionDetail } from './pages/Requisitions';
import { PendingApprovals, ApprovalDetail } from './pages/Approvals';
import { RFQManagement, CreateRFQ } from './pages/RFQPages';
import { BidsComparison } from './pages/BidsComparison';
import { PurchaseOrders } from './pages/PurchaseOrders';
import { FinancialReview } from './pages/FinancialReview';
import { GoodsReceipts, CreateGoodsReceipt } from './pages/GoodsReceipts';
import { SupplierDirectory } from './pages/SupplierDirectory';
import { Notifications } from './pages/Notifications';
import { AuditLog } from './pages/AuditLog';
import { Settings } from './pages/Settings';
import { NotFoundPage } from './pages/ErrorStates';
import type { UserRole } from './types';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Start logged in for demo
  const [userRole, setUserRole] = useState<UserRole>('procurement');
  const [toasts, setToasts] = useState<{ id: string; type: 'success' | 'error' | 'warning' | 'info'; message: string }[]>([]);

  const addToast = useCallback((type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setIsLoggedIn(true);
    addToast('success', `Signed in as ${role}`);
  };

  const handleRoleChange = (role: UserRole) => {
    setUserRole(role);
    addToast('info', `Switched to ${role} view`);
  };

  if (!isLoggedIn) {
    return (
      <BrowserRouter>
        <ToastContext.Provider value={{ addToast }}>
          <ToastContainer toasts={toasts} onRemove={removeToast} />
          <Routes>
            <Route path="/" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastContext.Provider>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <ToastContext.Provider value={{ addToast }}>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <Layout userRole={userRole} onRoleChange={handleRoleChange}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard userRole={userRole} />} />
            <Route path="/requisitions" element={<MyRequisitions />} />
            <Route path="/requisitions/new" element={<CreateRequisition />} />
            <Route path="/requisitions/edit/:id" element={<RequisitionDetail />} />
            <Route path="/approvals" element={<PendingApprovals />} />
            <Route path="/approvals/:id" element={<ApprovalDetail />} />
            <Route path="/rfqs" element={<RFQManagement />} />
            <Route path="/rfqs/new" element={<CreateRFQ />} />
            <Route path="/bids" element={<BidsComparison />} />
            <Route path="/purchase-orders" element={<PurchaseOrders />} />
            <Route path="/financial-review" element={<FinancialReview />} />
            <Route path="/goods-receipts" element={<GoodsReceipts />} />
            <Route path="/goods-receipts/new" element={<CreateGoodsReceipt />} />
            <Route path="/suppliers" element={<SupplierDirectory />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/audit" element={<AuditLog />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </ToastContext.Provider>
    </BrowserRouter>
  );
}

export default App;
