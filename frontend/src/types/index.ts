export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  departmentId?: string;
  locationId?: string;
}

export enum Role {
  ADMIN = 'ADMIN',
  REQUESTER = 'REQUESTER',
  DEPARTMENT_HEAD = 'DEPARTMENT_HEAD',
  PROCUREMENT_OFFICER = 'PROCUREMENT_OFFICER',
  PROCUREMENT_MANAGER = 'PROCUREMENT_MANAGER',
  FINANCE = 'FINANCE',
  RECEIVER = 'RECEIVER',
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

export interface PurchaseRequisition {
  id: string;
  prNumber: string;
  title: string;
  description: string;
  status: PRStatus;
  requesterId: string;
  departmentId: string;
  locationId: string;
  requiredDate: string;
  totalEstimatedAmount: number;
  createdAt: string;
  updatedAt: string;
  lines: PurchaseRequisitionLine[];
  attachments: PurchaseRequisitionAttachment[];
}

export enum PRStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  RETURNED = 'RETURNED',
  REJECTED = 'REJECTED',
  PROCUREMENT_PROCESSING = 'PROCUREMENT_PROCESSING',
  PO_CREATED = 'PO_CREATED',
}

export interface PurchaseRequisitionLine {
  id: string;
  prId: string;
  itemName: string;
  description?: string;
  category: string;
  quantity: number;
  unit: string;
  estimatedPrice: number;
  totalPrice: number;
}

export interface PurchaseRequisitionAttachment {
  id: string;
  prId: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
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

export enum POStatus {
  DRAFT = 'DRAFT',
  FINANCIAL_REVIEW = 'FINANCIAL_REVIEW',
  PO_APPROVED = 'PO_APPROVED',
  RETURNED = 'RETURNED',
  REJECTED = 'REJECTED',
}

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

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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
