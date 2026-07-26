/** Mirrors `Role.ROLE_CHOICES` in apps/accounts/models.py. */
export type Role =
  | 'REQUESTER'
  | 'BUDGET_HOLDER'
  | 'PROCUREMENT_OFFICER'
  | 'FINANCIAL_REVIEWER'
  | 'WAREHOUSE_OFFICER'
  | 'ADMIN'
  | 'SYSTEM_ADMINISTRATOR';

export interface UserRole {
  id: string;
  name: Role;
  description?: string;
}

/** Mirrors `UserSerializer` in apps/accounts/serializers.py. */
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  department?: string | null;
  department_name?: string | null;
  roles: UserRole[];
  is_active: boolean;
  date_joined: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface Organization {
  id: string;
  name: string;
}

export interface Department {
  id: string;
  name: string;
  headId?: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
}

export type PRStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'RETURNED'
  | 'REJECTED'
  | 'PROCUREMENT_PROCESSING';

/**
 * Mirrors PurchaseRequisitionSerializer. DRF renders DecimalField as a string,
 * so monetary and quantity fields are typed as such rather than as numbers.
 */
export interface PurchaseRequisition {
  id: string;
  pr_number: string;
  requester: string;
  requester_name: string;
  department: string | null;
  department_name: string | null;
  title: string;
  description: string;
  delivery_location: string | null;
  required_delivery_date: string | null;
  currency: string;
  status: PRStatus;
  total_estimated_amount: string;
  lines: PurchaseRequisitionLine[];
  attachments: PurchaseRequisitionAttachment[];
  submitted_at: string | null;
  approved_at: string | null;
  created_at: string;
}

export interface PurchaseRequisitionLine {
  id: string;
  item_name: string;
  description?: string;
  category?: string;
  quantity: string;
  unit_of_measure?: string;
  estimated_unit_price: string;
  estimated_total: string;
  sort_order?: number;
}

/** Payload shape for creating or updating a line; the API computes the total. */
export type PurchaseRequisitionLineInput = Omit<
  PurchaseRequisitionLine,
  'id' | 'estimated_total'
>;

/** Writable fields on a requisition; everything else is server-assigned. */
export interface PurchaseRequisitionInput {
  title: string;
  description: string;
  department: string;
  delivery_location: string | null;
  required_delivery_date: string | null;
  currency: string;
  lines: PurchaseRequisitionLineInput[];
}

export interface PurchaseRequisitionAttachment {
  id: string;
  file: string;
  file_name: string;
  file_size: number;
  created_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  contacts: SupplierContact[];
}

export interface SupplierContact {
  id: string;
  supplierId: string;
  name: string;
  email: string;
  phone: string;
}

export interface RFQ {
  id: string;
  rfqNumber: string;
  prId: string;
  status: string;
  deadlineDate: string;
  instructions: string;
  createdAt: string;
  lines: RFQLine[];
  suppliers: RFQSupplier[];
}

export interface RFQLine {
  id: string;
  rfqId: string;
  prLineId: string;
  itemName: string;
  quantity: number;
  unit: string;
}

export interface RFQSupplier {
  id: string;
  rfqId: string;
  supplierId: string;
  status: string;
}

export interface Bid {
  id: string;
  rfqId: string;
  supplierId: string;
  status: string;
  totalAmount: number;
  submittedAt: string;
  lines: BidLine[];
}

export interface BidLine {
  id: string;
  bidId: string;
  rfqLineId: string;
  unitPrice: number;
  totalPrice: number;
  remarks: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  prId: string;
  supplierId: string;
  status: POStatus;
  totalAmount: number;
  createdAt: string;
  lines: PurchaseOrderLine[];
}

export type POStatus = 
  | 'DRAFT' 
  | 'FINANCIAL_REVIEW' 
  | 'PO_APPROVED' 
  | 'RETURNED' 
  | 'REJECTED';

export interface PurchaseOrderLine {
  id: string;
  poId: string;
  prLineId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Approval {
  id: string;
  entityType: string;
  entityId: string;
  approverId: string;
  status: string;
  comment?: string;
  createdAt: string;
}

export interface FinancialReview {
  id: string;
  poId: string;
  reviewerId: string;
  status: string;
  comment?: string;
  createdAt: string;
}

export interface GoodsReceipt {
  id: string;
  grNumber: string;
  poId: string;
  receiverId: string;
  receivedDate: string;
  status: string;
  lines: GoodsReceiptLine[];
}

export interface GoodsReceiptLine {
  id: string;
  grId: string;
  poLineId: string;
  receivedQuantity: number;
  condition: string;
  remarks?: string;
}

export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  userId: string;
  action: string;
  oldStatus?: string;
  newStatus?: string;
  comment?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/** Mirrors apps/core/pagination.py (DRF PageNumberPagination). */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface TokenRefreshRequest {
  refreshToken: string;
}