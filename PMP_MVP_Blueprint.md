# Procurement Management Platform
## Minimum Viable Product (MVP) Blueprint
### Version 1.0

## Table of Contents

1. [Introduction](#1-introduction)
2. [MVP Goal](#2-mvp-goal)
3. [MVP Scope](#3-mvp-scope)
4. [Out of Scope](#4-out-of-scope)
5. [Core Procurement Workflow](#5-core-procurement-workflow)
6. [User Roles](#6-user-roles)
7. [MVP Functional Modules](#7-mvp-functional-modules)
8. [Business Rules](#8-business-rules)
9. [Workflow States](#9-workflow-states)
10. [Technology Stack](#10-technology-stack)
11. [High-Level Architecture](#11-high-level-architecture)
12. [Database Overview](#12-database-overview)
13. [API Overview](#13-api-overview)
14. [Security](#14-security)
15. [MVP Success Criteria](#15-mvp-success-criteria)
16. [Development Roadmap](#16-development-roadmap)
17. [Post-MVP Roadmap](#17-post-mvp-roadmap)
18. [Conclusion](#18-conclusion)

---

## 1. Introduction

The Procurement Management Platform (PMP) is a web-based application designed to digitize and streamline the procurement process within organizations. The platform replaces manual procurement procedures with a centralized workflow that enables users to create purchase requests, obtain approvals, manage supplier quotations, generate purchase orders, and record goods received.

This document defines the Minimum Viable Product (MVP) for the platform. The MVP focuses on delivering a complete procurement workflow while intentionally limiting advanced enterprise capabilities. Its purpose is to validate the core procurement process, demonstrate business value, and provide a solid architectural foundation for future releases.

## 2. MVP Goal

The objective of the MVP is to deliver a fully functional procurement workflow that allows an organization to complete one procurement transaction from initiation to completion.

The MVP will demonstrate:

- Digital purchase requisition management
- Role-based approval workflow
- Supplier quotation management
- Purchase order generation
- Financial review
- Goods receipt recording
- Audit logging throughout the process

Rather than maximizing the number of features, the MVP prioritizes workflow completeness, usability, and maintainability.

## 3. MVP Scope

The first release includes only the functionality required to support the end-to-end procurement lifecycle.

### 3.1 Included Modules

- Authentication
- User Management
- Role Management
- Purchase Requisition Management
- Approval Workflow
- Supplier Management
- Request for Quotation (RFQ)
- Bid Management
- Bid Comparison
- Purchase Order Management
- Financial Review
- Goods Receipt
- Notifications
- Audit Trail

> ℹ️ Every included module contributes directly to completing the procurement workflow.

## 4. Out of Scope

The following capabilities are intentionally excluded from the MVP to reduce implementation complexity and maintain focus on the core procurement workflow.

- Multi-tenant deployment
- Multi-location procurement
- Automated routing engine
- Approval delegation
- Supplier self-registration portal
- ERP integration
- Inventory synchronization
- Mobile application
- Procurement analytics
- Advanced reporting
- AI-powered procurement features
- Multi-currency support
- Electronic signatures
- Vendor performance management

> ⚠️ These features are intentionally deferred. They will be considered in future releases after the MVP has been validated.

## 5. Core Procurement Workflow

The MVP supports the following end-to-end business process:

1. Login
2. Create Purchase Requisition
3. Submit Purchase Requisition
4. Budget Holder Approval
5. Procurement Review
6. Create RFQ
7. Receive Supplier Quotations
8. Compare Bids
9. Select Winning Supplier
10. Generate Purchase Order
11. Financial Review
12. Final Approval
13. Goods Receipt
14. Procurement Completed

> ℹ️ Each workflow transition updates the transaction status, records an audit log entry, and grants control to the next authorized user.

## 6. User Roles

The MVP supports six primary user roles. Each role has clearly defined responsibilities to ensure secure access and controlled progression of the procurement workflow.

### 6.1 Requester

Initiates procurement by creating and submitting Purchase Requisitions.

- Create Purchase Requisitions
- Save requisitions as drafts
- Edit draft requisitions
- Submit requisitions for approval
- View requisition status
- View approval history

### 6.2 Budget Holder

Responsible for validating procurement requests against the available budget.

- Review submitted Purchase Requisitions
- Approve requests
- Return requests for correction
- Reject requests
- View approval history

### 6.3 Procurement Officer

Manages supplier sourcing and purchasing activities after requisitions are approved.

- Review approved requisitions
- Create Requests for Quotations (RFQs)
- Select suppliers
- Record supplier quotations
- Compare supplier bids
- Select the winning supplier
- Generate Purchase Orders
- Submit Purchase Orders for financial review

### 6.4 Financial Reviewer

Verifies the financial accuracy and compliance of Purchase Orders.

- Review Purchase Orders
- Approve financial review
- Return Purchase Orders for correction
- Add review comments

### 6.5 Warehouse Officer

Confirms delivery and records received goods.

- View approved Purchase Orders
- Record received quantities
- Process partial receipts
- Complete goods receipt
- Generate Goods Receipt records

### 6.6 System Administrator

Manages system access and basic platform configuration.

- Manage users
- Assign roles
- Manage departments
- Manage suppliers
- Configure system settings
- Monitor audit logs

## 7. MVP Functional Modules

The MVP consists of the following functional modules. Together, these modules provide the minimum functionality required to execute a complete procurement transaction.

| Module | Description |
|---|---|
| Authentication | User login, logout, and session management. |
| User Management | Manage system users and their profiles. |
| Role Management | Assign and manage user roles and permissions. |
| Purchase Requisition | Create, edit, submit, and track procurement requests. |
| Approval Workflow | Review, approve, reject, or return Purchase Requisitions. |
| Supplier Management | Register and manage supplier information. |
| RFQ Management | Create and manage Requests for Quotations. |
| Bid Management | Record supplier quotations and bids. |
| Bid Evaluation | Compare quotations and select the winning supplier. |
| Purchase Order | Generate and manage Purchase Orders. |
| Financial Review | Verify financial information before final approval. |
| Goods Receipt | Record delivery of purchased goods. |
| Notification Service | Notify users of workflow events. |
| Audit Trail | Maintain a history of all critical actions. |

## 8. Business Rules

The following rules govern the behavior of the MVP.

**BR-01 Purchase Requisition**
A Purchase Requisition must contain at least one line item before submission.

**BR-02 Draft Editing**
Only the Requester may edit a Purchase Requisition while it is in Draft status.

**BR-03 Submission**
A Purchase Requisition cannot be modified after submission unless it is returned for correction.

**BR-04 Approval**
Only users assigned the Budget Holder role may approve Purchase Requisitions.

**BR-05 RFQ Creation**
An RFQ can only be created after a Purchase Requisition has been approved.

**BR-06 Supplier Quotations**
An RFQ must contain quotations from at least two suppliers before bid evaluation.

**BR-07 Supplier Selection**
Only one supplier may be selected as the winning supplier for each RFQ.

**BR-08 Purchase Order**
A Purchase Order is automatically generated from the selected supplier quotation.

**BR-09 Financial Review**
Every Purchase Order must pass financial review before final approval.

**BR-10 Goods Receipt**
Goods can only be received after the Purchase Order has been fully approved.

**BR-11 Audit Logging**
Every approval, rejection, return, supplier selection, Purchase Order creation, and Goods Receipt must be recorded in the audit history.

**BR-12 Notifications**
The system must notify the next responsible user whenever a workflow stage is completed.

## 9. Workflow States

The Procurement Management Platform uses workflow states to control the lifecycle of procurement transactions.

### 9.1 Purchase Requisition States

- **DRAFT** — Initial state; editable by Requester.
- **SUBMITTED** — Awaiting Budget Holder review.
- **APPROVED** — Approved; moves to procurement processing.
- **RETURNED** — Returned for correction; reverts to Draft.
- **PROCUREMENT PROCESSING** — Under active procurement activity.

### 9.2 RFQ States

- **DRAFT** — RFQ being prepared.
- **SENT** — Dispatched to suppliers.
- **RESPONDED** — Quotations received.
- **CLOSED** — Bid evaluation complete.

### 9.3 Purchase Order States

- **PO_CREATED** — Purchase Order generated.
- **FINANCIAL_REVIEW** — Under financial verification.
- **FINANCIAL_APPROVED** — Financially approved.
- **FINAL_APPROVAL** — Awaiting final sign-off.
- **PO_APPROVED** — Fully approved; ready for delivery.
- **GOODS_RECEIVED** — Goods confirmed received; procurement closed.

> ℹ️ Each state transition is validated by the system, restricted by user role, recorded in the audit trail, and triggers notifications to the next responsible user.

## 10. Technology Stack

The MVP uses a modern web technology stack prioritizing maintainability, security, scalability, and rapid development.

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript |
| Build Tool | Vite |
| UI Framework | Tailwind CSS |
| Component Library | shadcn/ui |
| State Management | Redux Toolkit + RTK Query |
| Forms | React Hook Form + Zod |
| Backend | Django 5 |
| API Framework | Django REST Framework |
| Database | PostgreSQL |
| Authentication | JWT Authentication |
| File Storage | MinIO (S3 Compatible) |
| Cache | Redis |
| Background Tasks | Celery |
| API Documentation | OpenAPI / Swagger |
| Version Control | Git + GitHub |
| Containerization | Docker |
| Reverse Proxy | Nginx |

### Development Principles

- Modular architecture
- Separation of concerns
- RESTful API design
- Role-Based Access Control (RBAC)
- Secure authentication
- Reusable components
- API-first development
- Audit-first workflow

## 11. High-Level Architecture

The platform follows a client-server architecture where the frontend communicates with the backend through secure REST APIs.

- **React Web Application (Frontend)** — Handles all presentation logic. Zero business rules.
- **HTTPS / REST API** — Secure communication layer between client and server.
- **Django REST Framework API** — Handles business rules, validation, and authorization.
- **Authentication Service** — JWT-based session management.
- **Procurement Services** — Core workflow modules (Requisition → RFQ → PO → GR).
- **Notification Service** — Event-driven alerts via Celery background tasks.
- **PostgreSQL** — Primary relational database; stores all procurement records.
- **MinIO** — S3-compatible object storage for uploaded documents.
- **Redis** — Cache layer and message broker for background tasks.

> ⚠️ The frontend contains only presentation logic. All business rules, workflow validation, authorization, and data processing are handled exclusively by the backend.

## 12. Database Overview

The MVP uses PostgreSQL as the primary relational database. The schema is designed around the procurement lifecycle to ensure complete traceability from request creation to goods receipt.

### 12.1 Core Entities

| Entity | Purpose |
|---|---|
| User | System users |
| Role | User roles |
| Department | Organizational departments |
| Supplier | Supplier information |
| Purchase Requisition | Procurement requests |
| Purchase Requisition Item | Requested products or services |
| Approval | Approval records |
| RFQ | Request for Quotation |
| RFQ Supplier | Suppliers invited to quote |
| Bid | Supplier quotation |
| Purchase Order | Approved purchase order |
| Purchase Order Item | Ordered products |
| Financial Review | Financial verification |
| Goods Receipt | Received goods |
| Goods Receipt Item | Received quantities |
| Notification | User notifications |
| Audit Log | Workflow history |

### 12.2 Relationship Model

Every procurement transaction can be traced throughout its lifecycle via the following entity chain:

```
User → Purchase Requisition
Purchase Requisition → Purchase Requisition Items
Purchase Requisition → Approval History
Purchase Requisition → RFQ
RFQ → RFQ Suppliers
RFQ → Bids
RFQ → Purchase Order
Purchase Order → Financial Review
Purchase Order → Goods Receipt
All Actions → Audit Log
```

## 13. API Overview

The backend exposes RESTful APIs that allow the frontend to interact with procurement resources. All endpoints require authentication except the login endpoint.

**Authentication**
```
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/profile
```

**Purchase Requisitions**
```
GET    /api/requisitions
POST   /api/requisitions
GET    /api/requisitions/{id}
PUT    /api/requisitions/{id}
DELETE /api/requisitions/{id}
POST   /api/requisitions/{id}/submit
```

**Approvals**
```
GET  /api/approvals
POST /api/approvals/{id}/approve
POST /api/approvals/{id}/return
POST /api/approvals/{id}/reject
```

**Suppliers**
```
GET    /api/suppliers
POST   /api/suppliers
PUT    /api/suppliers/{id}
DELETE /api/suppliers/{id}
```

**RFQs**
```
GET  /api/rfqs
POST /api/rfqs
GET  /api/rfqs/{id}
POST /api/rfqs/{id}/close
```

**Bids**
```
GET  /api/bids
POST /api/bids
GET  /api/bids/{id}
POST /api/bids/{id}/select
```

**Purchase Orders**
```
GET  /api/purchase-orders
POST /api/purchase-orders
GET  /api/purchase-orders/{id}
POST /api/purchase-orders/{id}/submit
```

**Goods Receipt**
```
GET  /api/goods-receipts
POST /api/goods-receipts
GET  /api/goods-receipts/{id}
```

## 14. Security

Security is integrated into every layer of the platform to protect procurement data and ensure that only authorized users can perform workflow actions.

**Authentication**
The platform uses JWT (JSON Web Tokens) for secure user authentication. Every authenticated request must include a valid access token.

**Authorization**
Access to system resources is controlled using Role-Based Access Control (RBAC). Each role is granted only the permissions required to perform its responsibilities.

**Password Security**
User passwords are never stored in plain text. Passwords are securely hashed before being saved in the database.

**Input Validation**
All user input is validated on the server before processing. Invalid or malicious requests are rejected with appropriate error responses.

**File Upload Security**
Uploaded documents are validated for file type and size before being stored.

**Audit Logging**
All critical workflow actions are recorded in the audit log, including:

- Login
- Purchase Requisition submission
- Approval decisions
- Supplier selection
- Purchase Order creation
- Financial review
- Goods receipt

**API Protection**
All API endpoints are protected using authentication and permission checks. Unauthorized requests receive appropriate HTTP status codes.

> ⚠️ The MVP security model is intentionally minimal. MFA, SSO, and advanced security policies are planned for future releases.

## 15. MVP Success Criteria

The MVP shall be considered functionally complete when the following end-to-end procurement scenario can be executed successfully without manual database intervention.

### 15.1 Procurement Lifecycle Checklist

1. A user logs into the system.
2. The Requester creates a Purchase Requisition.
3. The Requester adds one or more procurement items.
4. The Purchase Requisition is submitted.
5. The Budget Holder reviews the request.
6. The Budget Holder approves the request.
7. The Procurement Officer views the approved request.
8. The Procurement Officer creates an RFQ.
9. At least two supplier quotations are recorded.
10. The quotations are compared.
11. A winning supplier is selected.
12. A Purchase Order is generated.
13. The Financial Reviewer reviews the Purchase Order.
14. The Purchase Order receives financial approval.
15. The Purchase Order receives final approval.
16. The Warehouse Officer records received goods.
17. A Goods Receipt record is generated.
18. Users can view the complete procurement history.
19. All workflow actions are visible in the audit log.
20. Notifications are delivered to the appropriate users at each workflow stage.

### 15.2 Functional Acceptance Checklist

| Requirement | Status |
|---|---|
| User Authentication | ✅ |
| Role-Based Access Control | ✅ |
| Purchase Requisition Creation | ✅ |
| Approval Workflow | ✅ |
| Supplier Management | ✅ |
| RFQ Management | ✅ |
| Bid Recording | ✅ |
| Bid Evaluation | ✅ |
| Purchase Order Generation | ✅ |
| Financial Review | ✅ |
| Goods Receipt | ✅ |
| Notifications | ✅ |
| Audit Logging | ✅ |

## 16. Development Roadmap

The MVP will be implemented incrementally to ensure each module is completed, tested, and integrated before introducing the next.

| Phase | Deliverables |
|---|---|
| Phase 1 | Project setup, authentication, user management, role management |
| Phase 2 | Purchase Requisition module |
| Phase 3 | Approval workflow |
| Phase 4 | Supplier management and RFQ |
| Phase 5 | Bid management and evaluation |
| Phase 6 | Purchase Order management |
| Phase 7 | Financial review |
| Phase 8 | Goods receipt |
| Phase 9 | Notifications and audit trail |
| Phase 10 | Testing, bug fixing, deployment, and demonstration |

## 17. Post-MVP Roadmap

After successful validation of the MVP, the platform can be expanded through additional enterprise capabilities.

### Phase 2 — Workflow Enhancements

- Approval delegation
- Configurable approval workflows
- Multi-level approval chains
- Procurement templates
- Procurement categories
- Purchase request duplication

### Phase 3 — Enterprise Features

- Multi-organization support
- Multi-location procurement
- Department budgets
- Cost center management
- Procurement planning
- Inventory integration
- ERP integration

### Phase 4 — Supplier Ecosystem

- Supplier self-service portal
- Online quotation submission
- Supplier performance evaluation
- Supplier compliance management
- Vendor document management

### Phase 5 — Analytics & Intelligence

- Procurement dashboard
- Spending analytics
- Budget utilization reports
- Supplier performance analytics
- Procurement forecasting
- AI-assisted supplier recommendations
- AI anomaly detection

### Phase 6 — Government Integration

- National e-Procurement integration
- Digital signature integration
- Government identity provider integration
- Electronic document exchange
- Financial management system integration
- Compliance reporting

## 18. Conclusion

The Procurement Management Platform MVP establishes the minimum functional foundation required to digitize an organization's procurement lifecycle. By focusing on the essential workflow — from purchase requisition through approvals, supplier selection, purchase order generation, and goods receipt — the MVP validates the platform's core business value while minimizing implementation complexity.

The architecture, technology stack, and modular design have been selected to support future growth without requiring significant redesign. Additional enterprise capabilities such as ERP integration, advanced workflow automation, analytics, and supplier self-service can be introduced incrementally in future releases.

Successful completion of the MVP demonstrates that procurement activities can be managed digitally through a secure, role-based, and auditable workflow, providing a reliable foundation for enterprise and government-scale procurement operations.

---

### Final MVP Summary

| Section | Status |
|---|---|
| Introduction | ✅ |
| MVP Goal | ✅ |
| MVP Scope | ✅ |
| Out of Scope | ✅ |
| Core Workflow | ✅ |
| User Roles | ✅ |
| Functional Modules | ✅ |
| Business Rules | ✅ |
| Workflow States | ✅ |
| Technology Stack | ✅ |
| High-Level Architecture | ✅ |
| Database Overview | ✅ |
| API Overview | ✅ |
| Security | ✅ |
| MVP Success Criteria | ✅ |
| Development Roadmap | ✅ |
| Post-MVP Roadmap | ✅ |
| Conclusion | ✅ |
