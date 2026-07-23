# PROCUREMENT MANAGEMENT PLATFORM
## Software Engineering Documentation

| Field | Value |
|---|---|
| Document Type | Software Engineering Documentation |
| System | Procurement Management Platform |
| Version | 1.0 |
| Status | Engineering Baseline |
| Source | SCM4Good Procurement Process Documentation, Chapters 01–07 |
| Date | July 21, 2026 |

---

## 1. Document Purpose

This document defines the engineering requirements and technical design of the Procurement Management Platform. The platform is a web-based enterprise system designed to manage the complete procurement lifecycle of an organization, from the initial request for goods or services through to final receipt:

**Purchase Request → Approval → Procurement → Supplier Bidding → Bid Evaluation → Purchase Order → Financial Review → Final Approval → Goods Receipt**

The purpose of this document is to provide a common technical understanding for the following audiences:

- Software developers
- Backend developers
- Frontend developers
- Database engineers
- System architects
- QA engineers
- DevOps engineers
- Product owners
- Business analysts
- Project managers

This document serves as the engineering foundation for system architecture, database design, API development, frontend development, testing, and deployment.

## 2. Executive Summary

The Procurement Management Platform is an internal organizational system that digitizes and controls the purchasing process.

The platform enables an employee or department to request goods or services through a Purchase Requisition (PR). The request passes through the organization's approval process. Once approved, the Procurement team manages the purchasing process by identifying suppliers, sending Requests for Quotations (RFQs), collecting supplier bids, evaluating offers, and selecting the appropriate supplier.

The system then creates a Purchase Order (PO), which passes through financial and management approval before the purchase becomes authorized. Once the supplier delivers the goods, the Warehouse records the receipt and the system can integrate with inventory management.

The platform therefore acts as a centralized system connecting:

- Requesters
- Budget Holders
- Procurement staff
- Suppliers
- Financial reviewers
- Management
- Warehouse staff
- Inventory systems

The platform also supports advanced enterprise requirements, including:

- Multi-location procurement
- Cross-location approval
- Procurement routing
- Purchase Request splitting
- Purchase Order splitting
- Supplier management
- Configurable approval limits
- Notifications
- Attachments
- Audit trails
- Reporting
- Configurable business rules

## 3. System Definition

### 3.1 What the System Is

The Procurement Management Platform is a:

> Workflow-driven procurement management system that controls and tracks the process of requesting, approving, sourcing, purchasing, and receiving goods and services.

The system is not intended to function as a public online marketplace or e-commerce platform. It is primarily an internal enterprise procurement system.

The system's primary purpose is to answer, at any time:

- Who requested this purchase?
- What are they requesting?
- Who approved it?
- Which suppliers were considered?
- What prices did suppliers offer?
- Which supplier was selected?
- How much was approved?
- Who reviewed the financial aspects?
- Who gave final approval?
- Has the supplier delivered?
- Has the organization received the goods?
- Where is the transaction currently in the workflow?

## 4. Business Objective

The primary business objective is to replace fragmented procurement processes with a centralized digital workflow. The platform should reduce reliance on:

- Paper forms
- Email-based approvals
- Manual spreadsheets
- Manual supplier comparisons
- Manually generated purchase orders
- Untracked approval processes
- Disconnected warehouse records

The system should provide:

- Process control
- Procurement transparency
- Approval accountability
- Supplier management
- Competitive bidding
- Financial control
- Multi-location coordination
- Auditability
- Procurement visibility
- Integration with warehouse and inventory processes

## 5. End-to-End Business Process

The primary procurement lifecycle is illustrated below. This lifecycle represents the central workflow of the platform.

```
Employee / Department
        |
        v
Create Purchase Requisition
        |
        v
   Submit Request
        |
        v
Budget Holder Review
        |
        +-- Return / Reject
        |
        v
 Procurement Review
        |
        v
 Supplier Selection
        |
        v
Request for Quotation
        |
        v
   Supplier Bids
        |
        v
   Bid Evaluation
        |
        v
  Winner Selection
        |
        v
   Purchase Order
        |
        v
  Financial Review
        |
        v
   Final Approval
        |
        v
    Pre-Receive
        |
        v
 Supplier Delivery
        |
        v
   Goods Receipt
        |
        v
  Inventory Update
```

## 6. Core Procurement Concepts

### 6.1 Purchase Requisition

A Purchase Requisition (PR) represents an internal request to purchase goods or services.

Example:
```
PR Number: PR-10001
Requester: John Doe
Department: Information Technology
Item: Laptop
Quantity: 10
Estimated Budget: $10,000
Delivery Location: Addis Ababa Office
```

A PR means: "I want to purchase these goods or services." It does not necessarily mean that the purchase has been approved.

### 6.2 Request for Quotation

An RFQ is a formal request sent to suppliers asking them to provide pricing and delivery information.

Example:
```
We need:
10 x Laptop

Please provide:
Unit price
Total price
Delivery time
Freight cost
Tax
Insurance
Quotation validity
```

### 6.3 Bid

A bid is the supplier's response to an RFQ.

Example:
```
Supplier A
10 laptops
Total: $9,500

Supplier B
10 laptops
Total: $8,800

Supplier C
10 laptops
Total: $10,200
```

### 6.4 Purchase Order

A Purchase Order (PO) is the organization's formal purchasing document. It represents:

> The organization has selected this supplier and intends to purchase these goods under these terms.

```
PO Number: PO-50001
Supplier: Supplier B
Item: 10 Laptops
Total: $8,800
Status: Approved
```

### 6.5 Goods Receipt

A Goods Receipt records that the supplier's goods have physically arrived and been accepted by the organization.

Example:
```
Expected: 10 laptops
Received: 10 laptops
Status: Fully Received
```

## 7. System Actors

The system must support role-based access.

### 7.1 Requester / Program Manager

- Create PR
- Add items
- Add descriptions
- Upload attachments
- Save draft
- Submit PR
- View PR status
- Respond to returned PRs
- Track procurement progress

### 7.2 Budget Holder

- Review PR
- Approve PR
- Return PR
- Reject PR
- Review PO
- Approve PO
- Return PO
- Provide comments
- Forward approval when permitted

### 7.3 Local Procurement Manager

- Review approved PRs
- Select suppliers
- Assign suppliers
- Generate RFQs
- Distribute RFQs
- Record supplier bids
- Evaluate bids
- Select winners
- Create POs
- Split PRs
- Split POs
- Submit POs for financial review

### 7.4 Financial Reviewer

- Review PO
- Verify financial information
- Approve financial review
- Return PO
- Add comments

### 7.5 Warehouse User

- View expected deliveries
- View pre-receives
- Record received goods
- Record received quantities
- Record partial receipts
- Generate Goods Receipt Notes

### 7.6 Administrator

- Manage users
- Manage roles
- Manage permissions
- Manage locations
- Configure approval limits
- Configure routing rules
- Configure numbering
- Configure notifications
- Configure procurement rules

### 7.7 Supplier

A supplier participates in procurement activities. Responsibilities may include:

- Receive RFQ
- Review RFQ
- Submit quotation
- Submit bid
- Upload supporting documents

Supplier self-service may be implemented as a future or optional feature.

## 8. Functional Modules

The platform shall consist of the following primary modules:

- Identity and Access Management
- Organization and Location Management
- Purchase Requisition Management
- Approval Management
- Supplier Management
- RFQ Management
- Bid Management
- Purchase Order Management
- Financial Review
- Receiving
- Inventory Integration
- Procurement Splitting
- Multi-Location Procurement
- Routing Engine
- Notification System
- Configuration Management
- Reporting
- Audit Management

## 9. Identity and Access Management

The platform must provide secure authentication and authorization.

### 9.1 Authentication

The system should support:

- Login
- Logout
- Password reset
- Session management
- Secure password storage
- Optional multi-factor authentication

### 9.2 Authorization

The system shall implement Role-Based Access Control (RBAC). The authorization hierarchy is:

```
User
  |
  v
Role
  |
  v
Permissions
  |
  v
Allowed Actions
```

Example permissions:
```
pr.create
pr.view
pr.edit
pr.submit
pr.approve
supplier.create
supplier.view
supplier.edit
rfq.create
rfq.distribute
bid.create
bid.view
bid.evaluate
po.create
po.edit
po.approve
receiving.create
receiving.approve
```

## 10. Organization and Location Management

The system must support multiple organizational locations.

Example:
```
Organization
  |
  +-- Addis Ababa
  +-- Dire Dawa
  +-- Hawassa
  +-- Other Locations
```

Each transaction should maintain location context where applicable. The location may determine:

- Procurement team
- Budget Holder
- Warehouse
- Approval routing
- Supplier availability
- Notification recipients
- Currency configuration
- Procurement rules

## 11. Purchase Requisition Module

The Purchase Requisition module is the starting point of the procurement lifecycle.

### 11.1 PR Creation

The user should be able to create a PR containing:

- Requester
- Department
- Description
- Goods/services type
- Delivery location
- Required delivery date
- Currency
- Freight budget
- Paper PR reference
- Line items
- Attachments

### 11.2 PR Line Items

Each line should contain:

- Product
- Category
- Description
- Quantity
- Unit of measure
- Estimated unit price
- Estimated total

### 11.3 PR Actions

The requester may:

- Create
- Save draft
- Edit
- Submit
- Cancel
- View
- Upload attachments

Actions must depend on the current status and user permissions.

## 12. PR Workflow

The initial PR lifecycle should be:

```
DRAFT
  |
  v
SUBMITTED
  |
  v
BH_ACCEPTED
  |
  v
SENT_TO_LPM
  |
  v
LPM_APPROVED
  |
  v
DISTRIBUTED_FOR_BID
  |
  v
RECEIVED_BIDS
  |
  v
ALL_BIDS_RECEIVED
  |
  v
PO_CREATED
```

Alternative paths:

```
SUBMITTED
  |
  +-- RETURNED -> DRAFT

SUBMITTED
  |
  +-- REJECTED -> REJECTED
```

The workflow engine must prevent unauthorized or invalid transitions.

## 13. Approval Management

Approval must be implemented as a reusable workflow component. Every approval action should record:

- Entity
- Entity ID
- Approver
- Role
- Action
- Comment
- Timestamp
- Previous status
- New status

Supported actions include:

- Approve
- Reject
- Return
- Forward
- Delegate

Approval history must not be deleted when a transaction changes status.

## 14. Approval Limits

Budget Holders may have configurable approval limits.

Example:
```
Budget Holder Approval Limit: $5,000
```

If the PO is $3,000, the Budget Holder can approve. If the PO is $10,000, the system may require:

- Escalation
- Another approver
- Override with justification

The system must support configurable approval limits and override rules.

## 15. Supplier Management

The Supplier module manages supplier information. A supplier record should contain:

- Supplier ID
- Supplier code
- Legal name
- Display name
- Contact information
- Address
- Tax information
- Status
- Categories
- Locations
- Documents

Supporting records include:

- Supplier contacts
- Supplier documents
- Supplier categories
- Supplier locations

Supplier data should be centrally managed where possible.

## 16. RFQ Management

After PR approval, Procurement can create an RFQ. The RFQ should include:

- RFQ number
- Related PR
- Line items
- Suppliers
- Deadline
- Instructions
- Attachments

RFQ lifecycle:

```
DRAFT
  |
  v
READY
  |
  v
DISTRIBUTED
  |
  v
PARTIALLY_RESPONDED
  |
  v
CLOSED
```

The system should support RFQ generation and distribution.

## 17. Bid Management

Suppliers provide quotations against RFQs. A bid should include:

- Supplier
- RFQ
- Bid date
- Expiry date
- Lead time
- Freight
- Insurance
- Tax
- Grand total
- Attachments

Bid lines should include:

- PR line
- Quantity offered
- Unit cost
- Total
- Partial bid indicator

The system must support partial bids.

## 18. Bid Evaluation

Procurement users must be able to compare supplier bids.

Example:
```
Supplier A   $9,500
Supplier B   $8,800
Supplier C   $10,200
```

The Procurement Manager can select the winning supplier. The selection must be recorded as an auditable action. The system should preserve:

- All bids
- Evaluation result
- Selected supplier
- Selection date
- Selecting user
- Selection justification where required

## 19. Purchase Order Management

The PO is generated from the procurement process. A PO contains:

- PO number
- PR reference
- Supplier
- Winning bid
- Line items
- Quantity
- Unit price
- Freight
- Insurance
- Tax
- Total
- Currency
- Payment terms
- Delivery method
- Delivery location
- Attachments

The PO may be edited before final approval according to permissions.

## 20. PO Workflow

The recommended workflow is:

```
PO_CREATED
  |
  v
SENT_TO_FINANCIAL_REVIEW
  |
  v
FINANCIAL_REVIEW_ACCEPTED
  |
  v
SUBMITTED_TO_BH
  |
  v
PO_APPROVED
```

Alternative paths:

```
FINANCIAL_REVIEW
  |
  +-- RETURNED -> PO_EDIT

BH_REVIEW
  |
  +-- RETURNED -> PO_EDIT
```

## 21. PR Splitting

A PR may be split when different items need to be handled by different procurement categories or processes.

Example:
```
Original PR
Laptop
Office Desk
Printer Paper

Becomes:
PR-001 Laptop
PR-002 Office Desk
PR-003 Printer Paper
```

The system must preserve the parent-child relationship. Required fields may include:

- Parent PR
- Child PR
- Split reason
- Split group
- User
- Timestamp

## 22. PO Splitting

A single procurement event may result in multiple POs.

Example:
```
PR
  |
  +-- Paper -> Supplier A wins
  +-- Toner -> Supplier B wins

Generates:
PO-001 Supplier A Paper
PO-002 Supplier B Toner
```

The system must support one PR to multiple POs. This is a fundamental data model requirement.

## 23. Financial Review

The Financial Reviewer checks the financial aspects of the PO. The workflow is:

```
PO Created
    |
    v
Financial Review
    |
    v
Accept OR Return
```

The system must record:

- Reviewer
- Review date
- Decision
- Comments
- Previous status
- New status

## 24. Multi-Location Procurement

The platform must support procurement across multiple organizational locations. There are two major scenarios.

**Offsite Approval**
A user at one location may approve a transaction originating from another location.

**Publication / Transfer**
A procurement transaction may be transferred or published to another location for processing. The originating location must retain visibility of the transaction.

## 25. Routing Engine

The system should support configurable routing rules.

Example:
```
IF Purchase Value > $5,000
THEN Route to Central Procurement
```

A routing rule may contain:

- Source location
- Destination location
- Minimum amount
- Maximum amount
- Currency
- Priority
- Active/inactive state

Routing rules should be configurable by authorized administrators.

## 26. Receiving and Warehouse Integration

When a PO is approved:

```
PO APPROVED
    |
    v
PRE-RECEIVE CREATED
    |
    v
WAREHOUSE EXPECTS DELIVERY
    |
    v
GOODS ARRIVE
    |
    v
WAREHOUSE RECEIVES GOODS
    |
    v
GRN CREATED
    |
    v
INVENTORY UPDATED
```

The procurement platform should integrate with Warehouse and Inventory systems. The procurement system should not necessarily own the entire inventory system — instead, it should provide integration events and APIs.

## 27. Notification System

The system should automatically notify users when important events occur.

Examples:
```
PR Submitted    -> Notify Budget Holder
PR Approved     -> Notify Procurement
RFQ Distributed -> Notify Suppliers
PO Submitted    -> Notify Financial Reviewer
PO Approved     -> Notify Warehouse
```

Notifications should support:

- Email
- In-app notifications

The notification service should be event-driven.

## 28. Audit Logging

The system must maintain an audit trail.

Example:
```
User: John Doe
Action: APPROVE_PO
Entity: PO-5001
Old Status: SUBMITTED_TO_BH
New Status: PO_APPROVED
Date: 2026-07-21
Comment: Approved within budget.
```

Audit logs should be append-only. They should record important actions including:

- Creation
- Editing
- Submission
- Approval
- Rejection
- Return
- Supplier selection
- Bid evaluation
- PO creation
- PO cancellation
- Receiving

## 29. Core Data Model

The core data model should contain the following entities:

```
User, Role, Permission, Organization, Location

PurchaseRequisition, PurchaseRequisitionLine,
PurchaseRequisitionAttachment, PurchaseRequisitionStatusHistory

Approval, ApprovalLimit

Supplier, SupplierContact, SupplierDocument, SupplierLocation

RFQ, RFQLine, RFQSupplier

Bid, BidLine, BidAttachment

PurchaseOrder, PurchaseOrderLine, PurchaseOrderStatusHistory

FinancialReview

PreReceive, GoodsReceipt, GoodsReceiptLine

RoutingRule, Notification, NotificationTemplate

PaymentTerm, DeliveryMethod, Currency, ExchangeRate

Configuration, ProcurementSwitch

AuditLog
```

## 30. Core Data Relationships

The main relationship structure is:

```
User
  |
  v
Purchase Requisition
  |
  +-- PR Lines
  +-- Approval History
  +-- RFQ
  |     +-- Suppliers
  |     +-- Bids
  |
  +-- Purchase Orders
        +-- Financial Review
        +-- Approval
        +-- Pre-Receive
              |
              v
        Goods Receipt
              |
              v
          Inventory
```

The platform must support:

```
One PR -> Multiple RFQs -> Multiple Suppliers -> Multiple Bids -> Multiple POs
```

## 31. Recommended Database Structure

A relational database should be used. The recommended primary database is PostgreSQL. The database should contain logical domains, described below.

**Identity**
```
users
roles
permissions
user_roles
```

**Organization**
```
organizations
locations
```

**Procurement**
```
purchase_requisitions
purchase_requisition_lines
purchase_requisition_attachments
purchase_requisition_status_history
```

**Supplier**
```
suppliers
supplier_contacts
supplier_documents
supplier_locations
```

**RFQ / Bidding**
```
rfqs
rfq_lines
rfq_suppliers
bids
bid_lines
bid_attachments
```

**Purchase Orders**
```
purchase_orders
purchase_order_lines
purchase_order_status_history
```

**Approval**
```
approvals
approval_limits
financial_reviews
```

**Receiving**
```
pre_receives
goods_receipts
goods_receipt_lines
```

**Configuration**
```
routing_rules
payment_terms
delivery_methods
currencies
configurations
procurement_switches
```

**Cross-Cutting**
```
notifications
notification_templates
audit_logs
```

## 32. Workflow Engine

The workflow engine is the most important technical component of the platform. Each workflow entity should have:

- Current Status
- Current Owner
- Available Actions
- Allowed Roles
- Next Status

Example:
```
PO-5001
Current Status: SUBMITTED_TO_BH
Current Owner: Budget Holder
Allowed Actions:
  APPROVE
  RETURN
  REJECT
```

If the user clicks APPROVE, the system changes SUBMITTED_TO_BH → PO_APPROVED. If the user clicks RETURN, the system changes SUBMITTED_TO_BH → PO_EDIT_REQUIRED.

The workflow engine should be centralized so that workflow rules are not duplicated throughout the codebase.

## 33. Frontend Application

The web application should contain the following primary screens:

```
Login
Dashboard

Purchase Requisitions
  - List
  - Create
  - Details
  - Approval History

Suppliers
  - List
  - Create
  - Details

RFQs
  - List
  - Create
  - Details

Bids
  - List
  - Details
  - Comparison

Purchase Orders
  - List
  - Create
  - Details

Approvals
Financial Review

Receiving
  - Pre-Receives
  - Goods Receipts

Reports

Administration
  - Users
  - Roles
  - Locations
  - Approval Limits
  - Routing
  - Configuration
```

## 34. Role-Based Dashboards

The dashboard must change based on the logged-in user's role.

**Requester Dashboard**
- My Draft Requests
- Pending Requests
- Returned Requests
- Approved Requests
- Completed Purchases

**Budget Holder Dashboard**
- Requests Awaiting Approval
- POs Awaiting Approval
- Returned Transactions
- Approval History

**Procurement Dashboard**
- PRs Awaiting Processing
- RFQs
- Bids Awaiting Evaluation
- POs Awaiting Creation
- POs Awaiting Financial Review

**Financial Dashboard**
- POs Awaiting Financial Review
- Returned POs
- Approved POs

**Warehouse Dashboard**
- Expected Deliveries
- Pending Receipts
- Partial Receipts
- Completed Receipts

## 35. API Architecture

The backend should expose a RESTful API or equivalent service interface:

```
/api/v1/auth
/api/v1/users
/api/v1/organizations
/api/v1/locations
/api/v1/purchase-requisitions
/api/v1/suppliers
/api/v1/rfqs
/api/v1/bids
/api/v1/purchase-orders
/api/v1/approvals
/api/v1/financial-reviews
/api/v1/pre-receives
/api/v1/goods-receipts
/api/v1/routing-rules
/api/v1/notifications
/api/v1/reports
/api/v1/configuration
```

Example PR endpoints:

```
POST  /purchase-requisitions
GET   /purchase-requisitions
GET   /purchase-requisitions/{id}
PATCH /purchase-requisitions/{id}
POST  /purchase-requisitions/{id}/submit
POST  /purchase-requisitions/{id}/approve
POST  /purchase-requisitions/{id}/return
POST  /purchase-requisitions/{id}/reject
POST  /purchase-requisitions/{id}/cancel
POST  /purchase-requisitions/{id}/split
```

## 36. Integration Architecture

The Procurement Platform should be designed to integrate with external systems. Potential integrations include:

```
Procurement Platform
  |
  +-- Finance / ERP
  +-- Warehouse
  +-- Inventory
  +-- Email
  +-- Identity Provider
```

Integration mechanisms may include:

- REST APIs
- Webhooks
- Event queues
- Scheduled synchronization

## 37. Security Requirements

The system must implement:

- Secure authentication
- Password hashing
- Role-based authorization
- Permission checks
- HTTPS
- Input validation
- SQL injection protection
- File upload validation
- Secure file storage
- Audit logging
- Session management
- Rate limiting
- API authentication
- Access control by organization/location

Sensitive procurement data must only be accessible to authorized users.

## 38. Non-Functional Requirements

**Performance**
Normal user operations should respond quickly under expected organizational load.

**Availability**
The platform should support high availability appropriate for an enterprise application.

**Scalability**
The system should support:

- Multiple locations
- Thousands of users
- Large numbers of PRs
- Large supplier databases
- Large document volumes

**Maintainability**
The codebase should use modular architecture with clear separation of concerns.

**Reliability**
Workflow transitions must be transactional. For example, when approving a PO, the following operations must be handled reliably as a single unit:

```
Update PO Status
+ Create Approval Record
+ Create Audit Record
+ Create Notification
```

## 39. Recommended Technology Architecture

A recommended modern stack is:

**Frontend**
```
React
TypeScript
Next.js
```

**Backend**
```
NestJS
TypeScript
REST API
```

**Database**
```
PostgreSQL
```

**Cache / Queue**
```
Redis
```

**File Storage**
```
S3-compatible object storage
```

**Authentication**
```
OAuth 2.0
OpenID Connect
```

**Deployment**
```
Docker
CI/CD
Cloud Infrastructure
```

The system should initially be implemented as a:

> Modular Monolith — rather than immediately implementing microservices.

Logical modules should be separated within the application. Future high-volume components can later be extracted into independent services.

## 40. Recommended Software Architecture

The backend should follow a layered architecture:

```
Presentation Layer
        |
        v
API / Controllers
        |
        v
Application Services
        |
        v
Domain Services
        |
        v
Repositories
        |
        v
Database
```

Cross-cutting services:

- Authentication
- Authorization
- Workflow
- Notifications
- Audit
- File Storage
- Integration

## 41. Minimum Viable Product (MVP) Scope

### 41.1 MVP Objective

The objective of the Minimum Viable Product (MVP) is to deliver a functional end-to-end procurement workflow that demonstrates and validates the core business process of the Procurement Management Platform.

The MVP must allow an organization to digitally manage a procurement transaction from the initial Purchase Requisition through approval, supplier quotation, bid evaluation, Purchase Order creation, approval, and basic goods receiving.

The MVP is intended to validate the core procurement workflow and provide a working foundation for future expansion. The MVP should prioritize workflow completeness and functional usability over advanced configuration, complex integrations, and enterprise-scale automation.

The core MVP workflow is:

```
User Login
    |
    v
Create Purchase Requisition
    |
    v
Submit Purchase Requisition
    |
    v
Budget Holder Approval
    |
    v
Procurement Review
    |
    v
Create RFQ
    |
    v
Record Supplier Quotations / Bids
    |
    v
Compare Bids
    |
    v
Select Winning Supplier
    |
    v
Create Purchase Order
    |
    v
Financial Review
    |
    v
Final Approval
    |
    v
Pre-Receive
    |
    v
Goods Receipt
```

At the end of the MVP, a complete procurement transaction must be traceable from its initial request through final approval and receipt of goods.

### 41.2 MVP Implementation Principles

The MVP shall be developed using the following principles:

1. The complete core procurement workflow must be functional from beginning to end.
2. Each workflow step must have a clear status.
3. Users must only be able to perform actions permitted by their role and the current workflow status.
4. All important workflow actions must be recorded in the audit history.
5. The system should use simple, predefined business rules during the MVP phase.
6. Advanced configuration should be deferred until after the core workflow is validated.
7. External system integrations should not block MVP completion.
8. The MVP should use a modular architecture that allows future features to be added without redesigning the core system.
9. The MVP should prioritize a working end-to-end workflow over a large number of incomplete features.

### 41.3 MVP User Roles

The MVP shall support the following core user roles.

**1. Requester**

The Requester can:

- Log into the system
- Create Purchase Requisitions
- Add PR line items
- Save PRs as drafts
- Edit draft PRs
- Submit PRs
- View submitted PRs
- View PR status
- View approval history

**2. Budget Holder**

The Budget Holder can:

- View Purchase Requisitions awaiting approval
- Review PR details
- Approve PRs
- Return PRs for correction
- Reject PRs
- View approval history

**3. Procurement Officer / Procurement Manager**

The Procurement user can:

- View approved PRs
- Review PR details
- Create RFQs
- Select suppliers for RFQs
- Record supplier quotations or bids
- Compare supplier bids
- Select a winning supplier
- Create Purchase Orders
- Submit POs for financial review

**4. Financial Reviewer**

The Financial Reviewer can:

- View POs awaiting financial review
- Review PO financial information
- Approve financial review
- Return POs for correction
- Add review comments

**5. Final Approver / Budget Holder**

The Final Approver can:

- Review POs
- Approve POs
- Return POs
- Reject POs
- View approval history

**6. Warehouse User**

The Warehouse User can:

- View approved Purchase Orders awaiting delivery
- View expected deliveries
- Create or process Pre-Receives
- Record received quantities
- Record partial or complete receipt
- Create Goods Receipt records

**7. System Administrator**

The Administrator can:

- Manage users
- Assign roles
- Manage basic locations
- Manage basic system configuration

### 41.4 MVP Functional Modules

The MVP shall include the following modules.

**Module 1 — Authentication and Authorization**

The system shall provide:

- User login
- Logout
- Password management
- Role-based access control
- Basic permission enforcement

**Module 2 — User and Organization Management**

The MVP shall provide basic management of:

- Users
- Roles
- Departments
- Locations

The MVP may use a simplified organizational structure. Complex organizational hierarchies and dynamic organizational rules are outside the initial MVP scope.

**Module 3 — Purchase Requisition Management**

The MVP shall allow users to:

- Create a PR
- Add PR line items
- Enter quantities
- Enter estimated prices
- Add descriptions
- Specify delivery location
- Specify required delivery date
- Upload basic attachments
- Save a PR as draft
- Edit a draft
- Submit a PR
- View PR details
- View PR status

The minimum PR lifecycle shall be:

```
DRAFT
  |
  v
SUBMITTED
  |
  v
APPROVED
  |
  v
PROCUREMENT_PROCESSING
```

Alternative outcomes:
```
SUBMITTED -> RETURNED -> DRAFT
SUBMITTED -> REJECTED
```

**Module 4 — Purchase Requisition Approval**

The MVP shall implement a basic Budget Holder approval workflow. The Budget Holder shall be able to:

- Approve
- Return
- Reject

Every approval action must record:

- User
- Role
- Action
- Date and time
- Comment
- Previous status
- New status

**Module 5 — Supplier Management**

The MVP shall provide basic supplier management. Supplier records shall include:

- Supplier name
- Supplier code
- Contact person
- Email
- Phone
- Address
- Status

The MVP shall support:

- Create supplier
- View supplier
- Edit supplier
- Activate/deactivate supplier

Advanced supplier onboarding, supplier self-registration, supplier scoring, and supplier performance management are outside the MVP scope.

**Module 6 — RFQ Management**

The Procurement user shall be able to create an RFQ based on an approved PR. The RFQ shall contain:

- RFQ number
- Related PR
- Required items
- Quantities
- Supplier(s)
- Submission deadline
- Instructions
- Attachments

The MVP shall support the basic RFQ lifecycle:

```
DRAFT
  |
  v
SENT
  |
  v
RESPONDED
  |
  v
CLOSED
```

For the initial MVP, RFQ distribution may be performed manually or through a basic email notification mechanism. A full external supplier portal is not required for the MVP.

**Module 7 — Bid / Quotation Management**

The MVP shall allow Procurement users to record supplier quotations or bids. Each bid shall contain:

- Supplier
- RFQ
- Bid date
- Validity date
- Delivery time
- Freight cost
- Tax
- Total price
- Supporting attachment

Bid line items shall contain:

- Item
- Quantity
- Unit price
- Total price

The MVP shall support multiple supplier bids for the same RFQ.

**Module 8 — Bid Evaluation**

The MVP shall provide a basic bid comparison interface. Procurement users shall be able to compare:

```
Supplier
Unit Price
Total Price
Delivery Time
Freight
Tax
Grand Total
```

The Procurement user shall be able to select the winning supplier. The system must record:

- Winning supplier
- Selected bid
- Selection date
- Selecting user
- Selection justification, if required

The MVP does not require an advanced weighted scoring engine.

**Module 9 — Purchase Order Management**

The system shall generate a Purchase Order based on the selected supplier bid. The PO shall contain:

- PO number
- Related PR
- Supplier
- Selected bid
- PO line items
- Quantities
- Unit prices
- Freight
- Tax
- Total amount
- Currency
- Delivery location
- Payment terms
- Delivery method

The MVP shall support viewing and editing the PO before final approval, subject to user permissions.

**Module 10 — Financial Review**

The Financial Reviewer shall be able to:

- View submitted POs
- Review financial information
- Approve financial review
- Return the PO
- Add comments

The MVP shall implement a simple financial review workflow. Complex ERP financial validation and automated accounting integration are outside the MVP scope.

**Module 11 — Final Purchase Order Approval**

After financial review, the PO shall be submitted to the Final Approver. The Final Approver shall be able to:

- Approve
- Return
- Reject

The minimum PO workflow shall be:

```
PO_CREATED
  |
  v
FINANCIAL_REVIEW
  |
  v
FINANCIAL_APPROVED
  |
  v
FINAL_APPROVAL
  |
  v
PO_APPROVED
```

Alternative paths:
```
FINANCIAL_REVIEW -> RETURNED -> PO_EDIT
FINAL_APPROVAL -> REJECTED
```

**Module 12 — Receiving**

The MVP shall provide basic receiving functionality. After PO approval:

```
PO_APPROVED
  |
  v
PRE_RECEIVE
  |
  v
GOODS_RECEIVED
```

Warehouse users shall be able to:

- View approved POs
- View expected deliveries
- Record received quantities
- Record partial receipts
- Record complete receipts
- Create Goods Receipt records

The MVP shall support:
```
Expected Quantity
Received Quantity
Remaining Quantity
```

Example:
```
PO Quantity: 100
Received Quantity: 60
Remaining Quantity: 40
```

The system should therefore support partial receiving.

**Module 13 — Audit Trail**

The MVP shall maintain an audit trail for all critical workflow actions. The audit log shall record:

- User
- Action
- Entity type
- Entity ID
- Previous status
- New status
- Timestamp
- Comment, where applicable

At minimum, the following actions must be audited:

- PR creation
- PR submission
- PR approval
- PR return
- PR rejection
- RFQ creation
- Bid submission/entry
- Bid evaluation
- Supplier selection
- PO creation
- Financial review
- PO approval
- PO return
- PO rejection
- Goods receipt

**Module 14 — Notifications**

The MVP shall provide basic notifications for major workflow events. At minimum:

```
PR Submitted   -> Notify Budget Holder
PR Approved    -> Notify Procurement
RFQ Created    -> Notify Relevant Users
PO Submitted   -> Notify Financial Reviewer
PO Approved    -> Notify Warehouse
```

Notifications may initially be implemented as:

- In-app notifications
- Basic email notifications

Advanced notification templates and configurable notification rules are outside the MVP scope.

### 41.5 MVP Workflow

The complete MVP workflow shall be:

```
REQUESTER
    |
    v
CREATE PURCHASE REQUEST
    |
    v
SUBMIT PR
    |
    v
BUDGET HOLDER REVIEW
    |         |
 APPROVE  RETURN / REJECT
    |
    v
PROCUREMENT REVIEW
    |
    v
CREATE RFQ
    |
    v
RECORD SUPPLIER BIDS
    |
    v
COMPARE BIDS
    |
    v
SELECT WINNING BID
    |
    v
CREATE PURCHASE ORDER
    |
    v
FINANCIAL REVIEW
    |         |
 APPROVE    RETURN
    |
    v
FINAL APPROVAL
    |
    v
PO APPROVED
    |
    v
PRE-RECEIVE
    |
    v
GOODS RECEIVED
    |
    v
PROCUREMENT COMPLETE
```

This workflow represents the minimum end-to-end process that must work in the MVP.

### 41.6 MVP Database Requirements

The MVP database shall include, at minimum:

```
users, roles, permissions, user_roles
organizations, locations
purchase_requisitions, purchase_requisition_lines,
purchase_requisition_attachments
approvals, approval_history
suppliers, supplier_contacts
rfqs, rfq_lines, rfq_suppliers
bids, bid_lines, bid_attachments
purchase_orders, purchase_order_lines
financial_reviews
pre_receives
goods_receipts, goods_receipt_lines
notifications
audit_logs
```

The database shall preserve relationships between:

```
PR -> RFQ -> Bid -> PO -> Goods Receipt
```

The MVP must support the traceability of a procurement transaction across the complete lifecycle.

### 41.7 MVP Scope Limitations

The following capabilities are explicitly excluded from the initial MVP and shall be implemented in later phases:

- Complex multi-location routing
- Automated procurement routing engine
- PR splitting
- PO splitting
- Supplier self-registration portal
- Advanced supplier performance management
- Advanced bid scoring
- Complex approval delegation
- Advanced approval limit configuration
- Multi-currency exchange rate automation
- ERP integration
- Full Finance system integration
- Full Warehouse Management System integration
- Full Inventory Management System integration
- Automated inventory synchronization
- Advanced analytics
- Advanced reporting
- Advanced workflow configuration
- Complex procurement rule configuration
- Advanced supplier portal
- Mobile application

These features shall be designed for future compatibility but shall not delay MVP delivery.

### 41.8 One-Week MVP Delivery Target

The MVP may be targeted for completion within one development week only if the scope is strictly controlled and the objective is a functional demonstration or internal prototype rather than a fully production-hardened enterprise platform.

The one-week target shall focus exclusively on proving the following:

```
Login
  |
  v
Create PR
  |
  v
Approve PR
  |
  v
Create RFQ
  |
  v
Record Bids
  |
  v
Compare Bids
  |
  v
Select Supplier
  |
  v
Create PO
  |
  v
Financial Review
  |
  v
Final Approval
  |
  v
Goods Receipt
```

The one-week MVP shall use:

- Predefined roles
- Simple approval rules
- Limited organizational configuration
- Manual supplier management
- Manual bid entry
- Basic notifications
- Basic audit logging
- Simplified receiving

The one-week MVP shall not attempt to implement the complete enterprise feature set described in the overall platform architecture.

### 41.9 MVP Definition of Done

The MVP shall be considered functionally complete when a test user can execute the following scenario without manual database intervention:

1. User logs into the system.
2. Requester creates a Purchase Requisition.
3. Requester adds at least one item.
4. Requester submits the PR.
5. Budget Holder receives the PR.
6. Budget Holder approves the PR.
7. Procurement user views the approved PR.
8. Procurement user creates an RFQ.
9. Procurement user records quotations from at least two suppliers.
10. Procurement user compares the quotations.
11. Procurement user selects a winning supplier.
12. System creates a Purchase Order.
13. Financial Reviewer reviews the PO.
14. Financial Reviewer approves the PO.
15. Final Approver approves the PO.
16. Warehouse user sees the expected delivery.
17. Warehouse user records the received goods.
18. System creates a Goods Receipt.
19. The complete transaction history can be viewed.
20. The audit trail shows all critical workflow actions.

The successful completion of this scenario demonstrates that the platform's core procurement lifecycle is operational.

### 41.10 Post-MVP Development

After successful MVP validation, the platform should enter the next development phase. The Post-MVP roadmap should prioritize:

**Phase 2 — Enterprise Workflow**

- Multi-location procurement
- Cross-location approvals
- PR splitting
- PO splitting
- Approval limits
- Delegation
- Routing rules

**Phase 3 — Integrations**

- Finance / ERP
- Warehouse
- Inventory
- Identity Provider
- Email services

**Phase 4 — Supplier Portal**

- Supplier login
- RFQ access
- Online quotation submission
- Supplier document management

**Phase 5 — Advanced Management**

- Advanced reporting
- Procurement analytics
- Supplier performance
- Advanced bid evaluation
- Configurable workflow
- Advanced notifications

### MVP Summary

The MVP is not the complete Procurement Management Platform.

The MVP is the smallest functional version that proves the organization's core procurement process works digitally from request to receipt.

The MVP's success criterion is therefore:

> A user must be able to create a purchase request, obtain approval, conduct a basic supplier quotation process, select a supplier, generate and approve a purchase order, and record the receipt of the purchased goods, with role-based access and an auditable history throughout the process.

## 42. Advanced Features

After the MVP, the platform should implement:

- PR splitting
- PO splitting
- Multi-location procurement
- Cross-location approval
- Automatic routing
- Supplier self-registration
- PR templates
- Advanced notifications
- Advanced reports
- Configurable procurement rules
- Multi-currency support
- Exchange rate management
- Advanced integrations

## 43. Development Roadmap

The recommended implementation sequence is:

1. **Foundation**
   - Project setup
   - Database
   - Authentication
   - RBAC

2. **Organization**
   - Organizations
   - Locations

3. **PR**
   - Creation
   - Editing
   - Submission
   - Workflow

4. **Approval**
   - BH approval
   - Return
   - Audit

5. **Procurement**
   - Supplier management
   - RFQ
   - Bids

6. **PO**
   - Winner selection
   - PO generation
   - PO workflow

7. **Finance**
   - Financial review
   - Final approval

8. **Receiving**
   - Pre-receive
   - GRN
   - Inventory integration

9. **Enterprise Features**
   - Multi-location
   - Routing
   - Splitting
   - Advanced reporting

10. **Production Hardening**
    - Security
    - Performance
    - Monitoring
    - Disaster recovery

## 44. Core Engineering Principle

The Procurement Management Platform should be built around a centralized workflow model. The fundamental system pattern is:

```
ENTITY + STATUS + OWNER + ROLE + PERMISSION + ACTION + NEXT STATUS + AUDIT HISTORY
```

For example:
```
PO-5001
Status: SUBMITTED_TO_BH
Owner: Budget Holder
Available Actions:
  Approve
  Return
  Reject
```

The system must determine what the user can do based on:

```
User + Role + Permission + Location + Entity Status
```

This approach ensures that the procurement lifecycle is controlled and predictable.

## 45. Final System Architecture Summary

The Procurement Management Platform can be summarized as:

```
PROCUREMENT PLATFORM
       |
       v
IDENTITY & ACCESS
       |
       v
PURCHASE REQUEST
       |
       v
   APPROVAL
       |
       v
 PROCUREMENT
       |
       v
SUPPLIER / RFQ / BIDS
       |
       v
 BID EVALUATION
       |
       v
PURCHASE ORDER
       |
       v
FINANCIAL REVIEW
       |
       v
 FINAL APPROVAL
       |
       v
  PRE-RECEIVE
       |
       v
GOODS RECEIPT
       |
       v
   INVENTORY
```

Across the entire system, the following cross-cutting services apply uniformly:

```
CROSS-CUTTING SERVICES
Workflow Engine
Role-Based Access Control
Notifications
Audit Logging
Multi-Location
Routing Rules
Configuration
Reporting
Attachments
Integrations
```

### Final Engineering Definition

The system being built is a:

> Role-based, workflow-driven Procurement Management Platform that digitizes the complete procurement lifecycle from Purchase Requisition through approval, supplier sourcing, RFQ and bid management, Purchase Order creation and approval, and finally goods receiving and inventory integration.

**Core business objects:** PR → RFQ → Bid → PO → Goods Receipt

**Core technical engine:** Users → Roles → Permissions → Workflow → Status Transitions → Approvals → Audit Trail

**Core enterprise capabilities:** Multi-Location → Routing → Notifications → Configuration → Reporting → Integrations

---

This document is the high-level engineering baseline. The next level of engineering documentation should break this down into the actual implementation specifications: a complete database ERD, detailed database tables and fields, API endpoint specifications with request/response schemas, complete workflow state machines, use cases, frontend screen specifications, and acceptance criteria for every module.
