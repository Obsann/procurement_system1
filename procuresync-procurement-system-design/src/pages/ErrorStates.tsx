import { useNavigate } from 'react-router-dom';
import { FileText, ShoppingCart, Package, Users, AlertCircle, Home } from 'lucide-react';
import { EmptyState, Button } from '../components/ui';

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-deep grid-pattern">
      <div className="animate-fadeIn">
        <EmptyState
          icon={<AlertCircle className="w-10 h-10" />}
          title="404 — Page Not Found"
          description="The page you're looking for doesn't exist or has been moved."
          action={<Button variant="primary" icon={<Home className="w-4 h-4" />} onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>}
        />
      </div>
    </div>
  );
}

export function EmptyRequisitions() {
  const navigate = useNavigate();
  return (
    <EmptyState
      icon={<FileText className="w-10 h-10" />}
      title="No Requisitions Yet"
      description="You haven't created any purchase requisitions. Start by creating your first one."
      action={<Button variant="primary" onClick={() => navigate('/requisitions/new')}>Create Requisition</Button>}
    />
  );
}

export function EmptyRFQs() {
  const navigate = useNavigate();
  return (
    <EmptyState
      icon={<ShoppingCart className="w-10 h-10" />}
      title="No RFQs Created"
      description="No Requests for Quotation have been created yet. Generate one from an approved requisition."
      action={<Button variant="primary" onClick={() => navigate('/rfqs/new')}>Create RFQ</Button>}
    />
  );
}

export function EmptyPOs() {
  return (
    <EmptyState
      icon={<Package className="w-10 h-10" />}
      title="No Purchase Orders"
      description="Purchase orders are generated from winning bids. Compare supplier bids to create your first PO."
    />
  );
}

export function EmptySuppliers() {
  return (
    <EmptyState
      icon={<Users className="w-10 h-10" />}
      title="No Suppliers Added"
      description="Add suppliers to your directory to start inviting them to RFQs."
    />
  );
}
