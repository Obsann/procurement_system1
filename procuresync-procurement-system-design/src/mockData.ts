import { User, PurchaseRequisition, Supplier, RFQ, PurchaseOrder, GoodsReceipt, Notification, AuditEntry, ApprovalHistoryEntry } from './types';

export const users: User[] = [
  { id: 'u1', name: 'Alex Rivera', email: 'alex@procuresync.com', role: 'requester', department: 'Marketing' },
  { id: 'u2', name: 'Sarah Chen', email: 'sarah@procuresync.com', role: 'budget_holder', department: 'Finance' },
  { id: 'u3', name: 'Marcus Webb', email: 'marcus@procuresync.com', role: 'procurement', department: 'Procurement' },
  { id: 'u4', name: 'Diana Okafor', email: 'diana@procuresync.com', role: 'financial', department: 'Finance' },
  { id: 'u5', name: 'Tom Bradley', email: 'tom@procuresync.com', role: 'warehouse', department: 'Warehouse' },
  { id: 'u6', name: 'Priya Sharma', email: 'priya@procuresync.com', role: 'admin', department: 'IT' },
];

export const currentUserId = 'u3'; // Default to procurement officer for demo

export const requisitions: PurchaseRequisition[] = [
  {
    id: 'pr1', prNumber: 'PR-2024-001', title: 'Marketing Campaign Materials',
    description: 'Print and digital materials for Q2 product launch campaign', department: 'Marketing',
    location: 'Head Office', status: 'SUBMITTED', requesterId: 'u1', requesterName: 'Alex Rivera',
    createdAt: '2024-01-15T10:30:00', updatedAt: '2024-01-15T10:30:00',
    lineItems: [
      { id: 'li1', itemName: 'Brochure Design & Print', description: '5000 A4 full-color brochures', quantity: 5000, unitPrice: 0.85, estimatedTotal: 4250 },
      { id: 'li2', itemName: 'Digital Ad Creative', description: 'Social media ad designs - 10 variants', quantity: 10, unitPrice: 250, estimatedTotal: 2500 },
      { id: 'li3', itemName: 'Banner Stands', description: '3 roll-up banner stands', quantity: 3, unitPrice: 120, estimatedTotal: 360 },
    ],
    totalAmount: 7110,
  },
  {
    id: 'pr2', prNumber: 'PR-2024-002', title: 'IT Infrastructure Upgrade',
    description: 'Server hardware and networking equipment upgrade for data center', department: 'IT',
    location: 'Data Center', status: 'APPROVED', requesterId: 'u6', requesterName: 'Priya Sharma',
    createdAt: '2024-01-18T09:00:00', updatedAt: '2024-01-20T14:30:00',
    lineItems: [
      { id: 'li4', itemName: 'Enterprise Server', description: 'Dell PowerEdge R750xs', quantity: 2, unitPrice: 8500, estimatedTotal: 17000 },
      { id: 'li5', itemName: 'Network Switch', description: 'Cisco Catalyst 9300 48-port', quantity: 4, unitPrice: 3200, estimatedTotal: 12800 },
      { id: 'li6', itemName: 'UPS System', description: 'APC Smart-UPS 3000VA', quantity: 2, unitPrice: 1800, estimatedTotal: 3600 },
    ],
    totalAmount: 33400,
  },
  {
    id: 'pr3', prNumber: 'PR-2024-003', title: 'Office Furniture Refresh',
    description: 'New desks and chairs for expanded team area', department: 'Operations',
    location: 'Floor 3', status: 'DRAFT', requesterId: 'u1', requesterName: 'Alex Rivera',
    createdAt: '2024-01-22T11:00:00', updatedAt: '2024-01-22T11:00:00',
    lineItems: [
      { id: 'li7', itemName: 'Ergonomic Desk', description: 'Adjustable standing desk 120x80', quantity: 15, unitPrice: 450, estimatedTotal: 6750 },
      { id: 'li8', itemName: 'Office Chair', description: 'Herman Miller Aeron chair', quantity: 15, unitPrice: 800, estimatedTotal: 12000 },
    ],
    totalAmount: 18750,
  },
  {
    id: 'pr4', prNumber: 'PR-2024-004', title: 'Safety Equipment Procurement',
    description: 'PPE and safety gear for warehouse team', department: 'Warehouse',
    location: 'Warehouse A', status: 'RETURNED', requesterId: 'u5', requesterName: 'Tom Bradley',
    createdAt: '2024-01-10T08:00:00', updatedAt: '2024-01-14T16:00:00',
    lineItems: [
      { id: 'li9', itemName: 'Safety Helmet', description: 'ANSI Z89.1 certified', quantity: 50, unitPrice: 35, estimatedTotal: 1750 },
      { id: 'li10', itemName: 'Safety Gloves', description: 'Cut-resistant Level A4', quantity: 100, unitPrice: 12, estimatedTotal: 1200 },
      { id: 'li11', itemName: 'Safety Goggles', description: 'Anti-fog, UV protection', quantity: 50, unitPrice: 18, estimatedTotal: 900 },
    ],
    totalAmount: 3850,
  },
  {
    id: 'pr5', prNumber: 'PR-2024-005', title: 'Training Program Materials',
    description: 'Course materials and training supplies for Q1 program', department: 'HR',
    location: 'Training Center', status: 'REJECTED', requesterId: 'u1', requesterName: 'Alex Rivera',
    createdAt: '2024-01-05T13:00:00', updatedAt: '2024-01-08T10:00:00',
    lineItems: [
      { id: 'li12', itemName: 'Training Manuals', description: 'Printed course handbooks', quantity: 200, unitPrice: 15, estimatedTotal: 3000 },
    ],
    totalAmount: 3000,
  },
  {
    id: 'pr6', prNumber: 'PR-2024-006', title: 'Laboratory Equipment',
    description: 'Analytical instruments for R&D lab expansion', department: 'R&D',
    location: 'Lab Building', status: 'SUBMITTED', requesterId: 'u1', requesterName: 'Alex Rivera',
    createdAt: '2024-01-25T09:30:00', updatedAt: '2024-01-25T09:30:00',
    lineItems: [
      { id: 'li13', itemName: 'Spectrophotometer', description: 'UV-Vis NIR spectrophotometer', quantity: 1, unitPrice: 15000, estimatedTotal: 15000 },
      { id: 'li14', itemName: 'Centrifuge', description: 'High-speed refrigerated centrifuge', quantity: 2, unitPrice: 5000, estimatedTotal: 10000 },
    ],
    totalAmount: 25000,
  },
  {
    id: 'pr7', prNumber: 'PR-2024-007', title: 'Warehouse Shelving System',
    description: 'Heavy-duty industrial shelving for new storage area', department: 'Warehouse',
    location: 'Warehouse B', status: 'APPROVED', requesterId: 'u5', requesterName: 'Tom Bradley',
    createdAt: '2024-01-12T07:30:00', updatedAt: '2024-01-16T11:00:00',
    lineItems: [
      { id: 'li15', itemName: 'Steel Shelving Unit', description: '6-tier 2000x1000x600mm', quantity: 20, unitPrice: 280, estimatedTotal: 5600 },
    ],
    totalAmount: 5600,
  },
  {
    id: 'pr8', prNumber: 'PR-2024-008', title: 'Annual Software Licenses',
    description: 'Renewal and new licenses for development tools', department: 'IT',
    location: 'Remote', status: 'SUBMITTED', requesterId: 'u6', requesterName: 'Priya Sharma',
    createdAt: '2024-01-28T14:00:00', updatedAt: '2024-01-28T14:00:00',
    lineItems: [
      { id: 'li16', itemName: 'GitHub Enterprise', description: 'Annual license - 50 seats', quantity: 50, unitPrice: 21, estimatedTotal: 1050 },
      { id: 'li17', itemName: 'Jira Cloud', description: 'Annual license - 100 seats', quantity: 100, unitPrice: 7.75, estimatedTotal: 775 },
    ],
    totalAmount: 1825,
  },
];

export const suppliers: Supplier[] = [
  {
    id: 's1', name: 'TechSupply Global', contactPerson: 'James Morton', email: 'james@techsupply.com',
    phone: '+1-555-0101', status: 'ACTIVE', address: '123 Tech Blvd, San Francisco, CA',
    category: 'IT Hardware',
    contacts: [
      { id: 'sc1', name: 'James Morton', role: 'Account Manager', email: 'james@techsupply.com', phone: '+1-555-0101' },
      { id: 'sc2', name: 'Lisa Wang', role: 'Sales Rep', email: 'lisa@techsupply.com', phone: '+1-555-0102' },
    ],
  },
  {
    id: 's2', name: 'PrintMaster Inc', contactPerson: 'Karen Lee', email: 'karen@printmaster.com',
    phone: '+1-555-0201', status: 'ACTIVE', address: '456 Print Ave, Chicago, IL',
    category: 'Print & Media',
    contacts: [
      { id: 'sc3', name: 'Karen Lee', role: 'Director', email: 'karen@printmaster.com', phone: '+1-555-0201' },
    ],
  },
  {
    id: 's3', name: 'SafeGear Solutions', contactPerson: 'Mike Torres', email: 'mike@safegear.com',
    phone: '+1-555-0301', status: 'ACTIVE', address: '789 Safety Rd, Dallas, TX',
    category: 'Safety Equipment',
    contacts: [
      { id: 'sc4', name: 'Mike Torres', role: 'CEO', email: 'mike@safegear.com', phone: '+1-555-0301' },
      { id: 'sc5', name: 'Ana Ruiz', role: 'Sales', email: 'ana@safegear.com', phone: '+1-555-0302' },
    ],
  },
  {
    id: 's4', name: 'OfficeWorks Pro', contactPerson: 'Rachel Green', email: 'rachel@officeworks.com',
    phone: '+1-555-0401', status: 'PENDING', address: '321 Office Park, Boston, MA',
    category: 'Office Furniture',
    contacts: [
      { id: 'sc6', name: 'Rachel Green', role: 'Founder', email: 'rachel@officeworks.com', phone: '+1-555-0401' },
    ],
  },
  {
    id: 's5', name: 'LabEquip Scientific', contactPerson: 'Dr. Alan Foster', email: 'alan@labequip.com',
    phone: '+1-555-0501', status: 'ACTIVE', address: '567 Science Dr, San Diego, CA',
    category: 'Lab Equipment',
    contacts: [
      { id: 'sc7', name: 'Dr. Alan Foster', role: 'Technical Director', email: 'alan@labequip.com', phone: '+1-555-0501' },
      { id: 'sc8', name: 'Beth Collins', role: 'Sales Manager', email: 'beth@labequip.com', phone: '+1-555-0502' },
    ],
  },
  {
    id: 's6', name: 'ShelvingMax Industrial', contactPerson: 'Dave Johnson', email: 'dave@shelvingmax.com',
    phone: '+1-555-0601', status: 'INACTIVE', address: '890 Industrial Way, Detroit, MI',
    category: 'Industrial Storage',
    contacts: [
      { id: 'sc9', name: 'Dave Johnson', role: 'Owner', email: 'dave@shelvingmax.com', phone: '+1-555-0601' },
    ],
  },
];

export const rfqs: RFQ[] = [
  {
    id: 'rfq1', rfqNumber: 'RFQ-2024-001', title: 'Marketing Materials RFQ',
    linkedPRId: 'pr1', linkedPRNumber: 'PR-2024-001', deadline: '2024-02-05',
    status: 'RESPONDED', supplierCount: 3,
    invitedSuppliers: ['s2', 's1'],
    lineItems: requisitions[0].lineItems,
    bids: [
      {
        id: 'b1', supplierId: 's2', supplierName: 'PrintMaster Inc', rfqId: 'rfq1',
        lineItems: [
          { lineItemId: 'li1', unitPrice: 0.80, total: 4000 },
          { lineItemId: 'li2', unitPrice: 220, total: 2200 },
          { lineItemId: 'li3', unitPrice: 110, total: 330 },
        ],
        freight: 150, insurance: 50, tax: 378, grandTotal: 6808, submittedAt: '2024-01-28T10:00:00', isWinner: false,
      },
      {
        id: 'b2', supplierId: 's1', supplierName: 'TechSupply Global', rfqId: 'rfq1',
        lineItems: [
          { lineItemId: 'li1', unitPrice: 0.90, total: 4500 },
          { lineItemId: 'li2', unitPrice: 280, total: 2800 },
          { lineItemId: 'li3', unitPrice: 130, total: 390 },
        ],
        freight: 200, insurance: 75, tax: 461.25, grandTotal: 8126.25, submittedAt: '2024-01-29T08:00:00', isWinner: false,
      },
    ],
    createdAt: '2024-01-20T10:00:00',
  },
  {
    id: 'rfq2', rfqNumber: 'RFQ-2024-002', title: 'IT Hardware RFQ',
    linkedPRId: 'pr2', linkedPRNumber: 'PR-2024-002', deadline: '2024-02-10',
    status: 'SENT', supplierCount: 1,
    invitedSuppliers: ['s1'],
    lineItems: requisitions[1].lineItems,
    bids: [],
    createdAt: '2024-01-22T09:00:00',
  },
  {
    id: 'rfq3', rfqNumber: 'RFQ-2024-003', title: 'Lab Equipment RFQ',
    linkedPRId: 'pr6', linkedPRNumber: 'PR-2024-006', deadline: '2024-02-15',
    status: 'DRAFT', supplierCount: 0,
    invitedSuppliers: [],
    lineItems: requisitions[5].lineItems,
    bids: [],
    createdAt: '2024-01-26T14:00:00',
  },
];

export const purchaseOrders: PurchaseOrder[] = [
  {
    id: 'po1', poNumber: 'PO-2024-001', linkedPRId: 'pr2', linkedPRNumber: 'PR-2024-002',
    supplierId: 's1', supplierName: 'TechSupply Global', totalAmount: 34500,
    status: 'FINANCIAL_REVIEW', lineItems: requisitions[1].lineItems,
    winningBidId: 'b3', createdAt: '2024-01-24T10:00:00', updatedAt: '2024-01-24T10:00:00',
  },
  {
    id: 'po2', poNumber: 'PO-2024-002', linkedPRId: 'pr7', linkedPRNumber: 'PR-2024-007',
    supplierId: 's6', supplierName: 'ShelvingMax Industrial', totalAmount: 6000,
    status: 'PO_APPROVED', lineItems: requisitions[6].lineItems,
    winningBidId: 'b4', createdAt: '2024-01-20T08:00:00', updatedAt: '2024-01-22T12:00:00',
  },
  {
    id: 'po3', poNumber: 'PO-2024-003', linkedPRId: 'pr1', linkedPRNumber: 'PR-2024-001',
    supplierId: 's2', supplierName: 'PrintMaster Inc', totalAmount: 6808,
    status: 'FINANCIAL_APPROVED', lineItems: requisitions[0].lineItems,
    winningBidId: 'b1', createdAt: '2024-01-28T14:00:00', updatedAt: '2024-01-29T10:00:00',
  },
  {
    id: 'po4', poNumber: 'PO-2024-004', linkedPRId: 'pr8', linkedPRNumber: 'PR-2024-008',
    supplierId: 's1', supplierName: 'TechSupply Global', totalAmount: 2000,
    status: 'PO_CREATED', lineItems: requisitions[7].lineItems,
    winningBidId: 'b5', createdAt: '2024-01-30T09:00:00', updatedAt: '2024-01-30T09:00:00',
  },
];

export const goodsReceipts: GoodsReceipt[] = [
  {
    id: 'gr1', grnNumber: 'GRN-2024-001', poNumber: 'PO-2024-002', poId: 'po2',
    supplierId: 's6', supplierName: 'ShelvingMax Industrial', receivedDate: '2024-01-28',
    status: 'COMPLETE', notes: 'All items received in good condition',
    lineItems: [
      { lineItemId: 'li15', itemName: 'Steel Shelving Unit', expectedQty: 20, receivedQty: 20 },
    ],
  },
  {
    id: 'gr2', grnNumber: 'GRN-2024-002', poNumber: 'PO-2024-001', poId: 'po1',
    supplierId: 's1', supplierName: 'TechSupply Global', receivedDate: '2024-02-01',
    status: 'PARTIAL', notes: 'Servers received, switches pending',
    lineItems: [
      { lineItemId: 'li4', itemName: 'Enterprise Server', expectedQty: 2, receivedQty: 2 },
      { lineItemId: 'li5', itemName: 'Network Switch', expectedQty: 4, receivedQty: 0 },
      { lineItemId: 'li6', itemName: 'UPS System', expectedQty: 2, receivedQty: 0 },
    ],
  },
];

export const notifications: Notification[] = [
  { id: 'n1', type: 'approval', title: 'PR Approval Required', message: 'PR-2024-001 "Marketing Campaign Materials" needs your approval', timestamp: '2024-01-30T09:00:00', read: false, entityId: 'pr1', entityType: 'pr' },
  { id: 'n2', type: 'rfq', title: 'New Bid Received', message: 'PrintMaster Inc submitted a bid for RFQ-2024-001', timestamp: '2024-01-28T10:00:00', read: false, entityId: 'rfq1', entityType: 'rfq' },
  { id: 'n3', type: 'po', title: 'PO Financial Review', message: 'PO-2024-001 requires financial review', timestamp: '2024-01-24T10:00:00', read: false, entityId: 'po1', entityType: 'po' },
  { id: 'n4', type: 'receipt', title: 'Partial Delivery', message: 'PO-2024-001 received partially - switches and UPS pending', timestamp: '2024-02-01T14:00:00', read: true, entityId: 'gr2', entityType: 'gr' },
  { id: 'n5', type: 'system', title: 'System Update', message: 'ProcureSync v2.4 has been deployed with new features', timestamp: '2024-01-20T08:00:00', read: true },
  { id: 'n6', type: 'approval', title: 'PR Approved', message: 'PR-2024-002 "IT Infrastructure Upgrade" has been approved by Sarah Chen', timestamp: '2024-01-20T14:30:00', read: true, entityId: 'pr2', entityType: 'pr' },
  { id: 'n7', type: 'po', title: 'PO Approved', message: 'PO-2024-002 has been fully approved and sent to ShelvingMax Industrial', timestamp: '2024-01-22T12:00:00', read: true, entityId: 'po2', entityType: 'po' },
  { id: 'n8', type: 'rfq', title: 'RFQ Deadline Approaching', message: 'RFQ-2024-002 deadline is in 3 days', timestamp: '2024-01-07T09:00:00', read: false, entityId: 'rfq2', entityType: 'rfq' },
  { id: 'n9', type: 'approval', title: 'PR Returned', message: 'PR-2024-004 "Safety Equipment" has been returned for revision', timestamp: '2024-01-14T16:00:00', read: true, entityId: 'pr4', entityType: 'pr' },
  { id: 'n10', type: 'system', title: 'Password Policy Update', message: 'New password requirements have been enforced', timestamp: '2024-01-15T08:00:00', read: true },
];

export const auditLog: AuditEntry[] = [
  { id: 'a1', timestamp: '2024-01-30T09:00:00', actor: 'Sarah Chen', actorId: 'u2', action: 'Pending Approval', entityType: 'PR', entityId: 'PR-2024-001', oldStatus: 'SUBMITTED', newStatus: 'SUBMITTED' },
  { id: 'a2', timestamp: '2024-01-28T10:00:00', actor: 'Marcus Webb', actorId: 'u3', action: 'RFQ Sent', entityType: 'RFQ', entityId: 'RFQ-2024-001', oldStatus: 'DRAFT', newStatus: 'SENT' },
  { id: 'a3', timestamp: '2024-01-29T08:00:00', actor: 'TechSupply Global', actorId: 's1', action: 'Bid Submitted', entityType: 'RFQ', entityId: 'RFQ-2024-001', oldStatus: 'SENT', newStatus: 'RESPONDED' },
  { id: 'a4', timestamp: '2024-01-20T14:30:00', actor: 'Sarah Chen', actorId: 'u2', action: 'Approved', entityType: 'PR', entityId: 'PR-2024-002', oldStatus: 'SUBMITTED', newStatus: 'APPROVED' },
  { id: 'a5', timestamp: '2024-01-24T10:00:00', actor: 'Marcus Webb', actorId: 'u3', action: 'PO Created', entityType: 'PO', entityId: 'PO-2024-001', oldStatus: '-', newStatus: 'PO_CREATED' },
  { id: 'a6', timestamp: '2024-01-24T12:00:00', actor: 'Marcus Webb', actorId: 'u3', action: 'PO Sent for Review', entityType: 'PO', entityId: 'PO-2024-001', oldStatus: 'PO_CREATED', newStatus: 'FINANCIAL_REVIEW' },
  { id: 'a7', timestamp: '2024-01-14T16:00:00', actor: 'Sarah Chen', actorId: 'u2', action: 'Returned', entityType: 'PR', entityId: 'PR-2024-004', oldStatus: 'SUBMITTED', newStatus: 'RETURNED' },
  { id: 'a8', timestamp: '2024-01-08T10:00:00', actor: 'Sarah Chen', actorId: 'u2', action: 'Rejected', entityType: 'PR', entityId: 'PR-2024-005', oldStatus: 'SUBMITTED', newStatus: 'REJECTED' },
  { id: 'a9', timestamp: '2024-01-28T14:00:00', actor: 'Marcus Webb', actorId: 'u3', action: 'PO Created from Bid', entityType: 'PO', entityId: 'PO-2024-003', oldStatus: '-', newStatus: 'PO_CREATED' },
  { id: 'a10', timestamp: '2024-01-22T12:00:00', actor: 'Diana Okafor', actorId: 'u4', action: 'Financially Approved', entityType: 'PO', entityId: 'PO-2024-002', oldStatus: 'FINANCIAL_APPROVED', newStatus: 'PO_APPROVED' },
  { id: 'a11', timestamp: '2024-01-28T08:00:00', actor: 'Tom Bradley', actorId: 'u5', action: 'Goods Received', entityType: 'GRN', entityId: 'GRN-2024-001', oldStatus: '-', newStatus: 'COMPLETE' },
  { id: 'a12', timestamp: '2024-02-01T14:00:00', actor: 'Tom Bradley', actorId: 'u5', action: 'Partial Receipt', entityType: 'GRN', entityId: 'GRN-2024-002', oldStatus: '-', newStatus: 'PARTIAL' },
];

export const approvalHistory: ApprovalHistoryEntry[] = [
  { id: 'ah1', action: 'Submitted', actor: 'Alex Rivera', actorRole: 'Requester', timestamp: '2024-01-15T10:30:00' },
  { id: 'ah2', action: 'Returned', actor: 'Sarah Chen', actorRole: 'Budget Holder', timestamp: '2024-01-16T09:00:00', comment: 'Need to clarify specifications for brochure design' },
  { id: 'ah3', action: 'Resubmitted', actor: 'Alex Rivera', actorRole: 'Requester', timestamp: '2024-01-17T11:00:00', comment: 'Updated specifications as requested' },
  { id: 'ah4', action: 'Approved', actor: 'Sarah Chen', actorRole: 'Budget Holder', timestamp: '2024-01-18T14:00:00', comment: 'Specifications are clear now. Approved.' },
];

export const activityFeed = [
  { id: 'act1', message: 'Sarah Chen approved PR-2024-002', timestamp: '2024-01-20T14:30:00', type: 'approval' },
  { id: 'act2', message: 'Marcus Webb created RFQ-2024-001', timestamp: '2024-01-20T10:00:00', type: 'rfq' },
  { id: 'act3', message: 'PrintMaster Inc submitted bid for RFQ-2024-001', timestamp: '2024-01-28T10:00:00', type: 'bid' },
  { id: 'act4', message: 'PO-2024-001 sent for financial review', timestamp: '2024-01-24T12:00:00', type: 'po' },
  { id: 'act5', message: 'Tom Bradley recorded GRN-2024-001', timestamp: '2024-01-28T08:00:00', type: 'receipt' },
  { id: 'act6', message: 'Alex Rivera submitted PR-2024-008', timestamp: '2024-01-28T14:00:00', type: 'pr' },
];

export const departments = ['Marketing', 'IT', 'Finance', 'Operations', 'Warehouse', 'HR', 'R&D', 'Legal'];
export const locations = ['Head Office', 'Data Center', 'Floor 3', 'Warehouse A', 'Warehouse B', 'Training Center', 'Lab Building', 'Remote'];

export const roleLabels: Record<string, string> = {
  requester: 'Requester',
  budget_holder: 'Budget Holder',
  procurement: 'Procurement Officer',
  financial: 'Financial Reviewer',
  warehouse: 'Warehouse Officer',
  admin: 'Administrator',
};
