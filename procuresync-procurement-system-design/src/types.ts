export type UserRole = 'requester' | 'budget_holder' | 'procurement' | 'financial' | 'warehouse' | 'admin';

export type PRStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'RETURNED' | 'REJECTED';
export type RFQStatus = 'DRAFT' | 'SENT' | 'RESPONDED' | 'CLOSED';
export type POStatus = 'PO_CREATED' | 'FINANCIAL_REVIEW' | 'FINANCIAL_APPROVED' | 'FINAL_APPROVAL' | 'PO_APPROVED' | 'GOODS_RECEIVED';
export type GRStatus = 'PARTIAL' | 'COMPLETE';
export type SupplierStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';
export type NotificationType = 'approval' | 'rfq' | 'po' | 'receipt' | 'system';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
}

export interface LineItem {
  id: string;
  itemName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  estimatedTotal: number;
}

export interface PurchaseRequisition {
  id: string;
  prNumber: string;
  title: string;
  description: string;
  department: string;
  location: string;
  status: PRStatus;
  requesterId: string;
  requesterName: string;
  createdAt: string;
  updatedAt: string;
  lineItems: LineItem[];
  totalAmount: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: SupplierStatus;
  address: string;
  category: string;
  contacts: SupplierContact[];
}

export interface SupplierContact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface BidLineItem {
  lineItemId: string;
  unitPrice: number;
  total: number;
}

export interface SupplierBid {
  id: string;
  supplierId: string;
  supplierName: string;
  rfqId: string;
  lineItems: BidLineItem[];
  freight: number;
  insurance: number;
  tax: number;
  grandTotal: number;
  submittedAt: string;
  isWinner: boolean;
}

export interface RFQ {
  id: string;
  rfqNumber: string;
  title: string;
  linkedPRId: string;
  linkedPRNumber: string;
  deadline: string;
  status: RFQStatus;
  supplierCount: number;
  invitedSuppliers: string[];
  lineItems: LineItem[];
  bids: SupplierBid[];
  createdAt: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  linkedPRId: string;
  linkedPRNumber: string;
  supplierId: string;
  supplierName: string;
  totalAmount: number;
  status: POStatus;
  lineItems: LineItem[];
  winningBidId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoodsReceipt {
  id: string;
  grnNumber: string;
  poNumber: string;
  poId: string;
  supplierId: string;
  supplierName: string;
  receivedDate: string;
  status: GRStatus;
  notes: string;
  lineItems: ReceiptLineItem[];
}

export interface ReceiptLineItem {
  lineItemId: string;
  itemName: string;
  expectedQty: number;
  receivedQty: number;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  entityId?: string;
  entityType?: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldStatus: string;
  newStatus: string;
}

export interface ApprovalHistoryEntry {
  id: string;
  action: string;
  actor: string;
  actorRole: string;
  timestamp: string;
  comment?: string;
}

export interface KPIData {
  label: string;
  value: number;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  icon: string;
}
