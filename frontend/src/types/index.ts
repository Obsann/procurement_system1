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

/** Mirrors RFQ.STATUS_CHOICES. */
export type RFQStatus = 'DRAFT' | 'SENT' | 'RESPONDED' | 'CLOSED';

/** Mirrors RFQSerializer; decimals arrive as strings. */
export interface RFQ {
  id: string;
  rfq_number: string;
  purchase_requisition: string;
  title: string;
  description: string;
  submission_deadline: string;
  instructions: string;
  status: RFQStatus;
  lines: RFQLine[];
  invited_suppliers: RFQSupplier[];
  created_at: string;
}

export interface RFQLine {
  id: string;
  rfq: string;
  pr_line: string | null;
  item_name: string;
  description: string;
  quantity: string;
  unit_of_measure: string;
  sort_order: number;
}

export interface RFQSupplier {
  id: string;
  supplier: string;
  supplier_name: string;
  invited_at: string;
  responded: boolean;
}

/** Payload for creating an RFQ; supplier_ids is write-only on the serializer. */
export interface RFQInput {
  purchase_requisition: string;
  title: string;
  description?: string;
  submission_deadline: string;
  instructions?: string;
  supplier_ids: string[];
  lines: {
    item_name: string;
    description?: string;
    quantity: string;
    unit_of_measure?: string;
    pr_line?: string | null;
  }[];
}

/** Mirrors BidSerializer. */
export interface Bid {
  id: string;
  rfq: string;
  supplier: string;
  supplier_name: string;
  bid_date: string;
  expiry_date: string | null;
  lead_time_days: number | null;
  freight_cost: string;
  insurance_cost: string;
  tax_amount: string;
  grand_total: string;
  is_winner: boolean;
  notes: string;
  lines: BidLine[];
  attachments: BidAttachment[];
  created_at: string;
}

export interface BidLine {
  id: string;
  bid: string;
  rfq_line: string | null;
  quantity_offered: string;
  unit_price: string;
  total_price: string;
  notes: string;
}

export interface BidAttachment {
  id: string;
  file: string;
  file_name: string;
  created_at: string;
}

/** Payload for recording a supplier quotation. */
export interface BidInput {
  rfq: string;
  supplier: string;
  bid_date: string;
  expiry_date?: string | null;
  lead_time_days?: number | null;
  freight_cost: string;
  insurance_cost: string;
  tax_amount: string;
  grand_total: string;
  notes?: string;
  lines: {
    rfq_line: string;
    quantity_offered: string;
    unit_price: string;
    total_price: string;
    notes?: string;
  }[];
}

/** Mirrors PurchaseOrder.STATUS_CHOICES. */
export type POStatus =
  | 'PO_CREATED'
  | 'FINANCIAL_REVIEW'
  | 'FINANCIAL_APPROVED'
  | 'FINAL_APPROVAL'
  | 'PO_APPROVED'
  | 'REJECTED'
  | 'PARTIALLY_RECEIVED'
  | 'GOODS_RECEIVED';

/** Mirrors PurchaseOrderSerializer; decimals arrive as strings. */
export interface PurchaseOrder {
  id: string;
  po_number: string;
  purchase_requisition: string;
  pr_number: string;
  rfq: string | null;
  winning_bid: string | null;
  supplier: string;
  supplier_name: string;
  status: POStatus;
  currency: string;
  subtotal: string;
  freight_cost: string;
  insurance_cost: string;
  tax_amount: string;
  total_amount: string;
  payment_terms: string;
  delivery_method: string;
  delivery_location: string | null;
  notes: string;
  lines: PurchaseOrderLine[];
  submitted_at: string | null;
  approved_at: string | null;
  created_at: string;
}

export interface PurchaseOrderLine {
  id: string;
  purchase_order: string;
  item_name: string;
  description: string;
  quantity: string;
  unit_price: string;
  total_price: string;
  sort_order: number;
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