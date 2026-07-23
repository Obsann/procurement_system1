# Team Roles & Responsibilities
### Procurement Management Platform — Obsan & Mary

## 1. Purpose

This document lays out how Obsan and Mary are splitting the work on the Procurement Management Platform. Both are equal partners on this project — the split below is about dividing the work sensibly, not about seniority or hierarchy.

## 2. Areas of Focus

| Person | Primary Focus |
|---|---|
| Obsan | Leads authentication & security, database structure, purchase order generation, audit trail, purchase requisition and RFQ features, frontend patterns, project tracking, and deployment. |
| Mary | Leads access permissions & system architecture, approval and bid logic, financial review, supplier and goods receipt features, notifications, and final release testing. |

Each of them handles a full mix of technical, feature, and coordination work — the aim is a genuinely even split, not one person doing the "hard parts" while the other does the rest.

## 3. Who's Leading What

Split evenly across both people, with each getting a balanced mix of technical depth, feature work, and coordination work.

| Area | Leading | Notes |
|---|---|---|
| Login & authentication | Obsan | Security-sensitive; Obsan takes point here. |
| Access permissions & system architecture | Mary | Sets the technical foundation the app builds on. |
| Database structure | Obsan | Shapes how everything else fits together. |
| Approval workflow logic | Mary | Encodes the core business rules. |
| Bid comparison & supplier selection | Mary | Feeds directly into the purchase order. |
| Purchase Order generation | Obsan | Financial logic; handled carefully. |
| Financial Review step | Mary | Tied to money approval. |
| Audit trail / activity logging | Obsan | Needs to be complete and reliable by design. |
| Purchase Requisition screens | Obsan | Handles this feature end to end. |
| Supplier Management screens | Mary | Handles this feature end to end. |
| RFQ creation & supplier invites | Obsan | Handles this end to end, with Mary's input on bid logic. |
| Goods Receipt recording | Mary | Handles this feature end to end. |
| Notifications | Mary | Handles this feature end to end. |
| Frontend components & layout patterns | Obsan | Sets the shared design patterns both use. |
| Project tracking, task breakdown, timeline | Obsan | Keeps the plan visible for both. |
| Deployment & server setup | Obsan | Sets up the pipeline; reviewed together before go-live. |
| End-to-end testing / release readiness | Mary | Confirms the full flow works before shipping. |
| Final go/no-go before release | Both | Joint decision — neither ships alone. |

## 4. Done Together

A few things stay joint by design, since no single person should be the only check on them:

- Final release sign-off — both agree before anything ships
- Code review — each reviews the other's pull requests
- Any change to the data model or core business rules — discussed together first
- Deployment configuration — set up by one, reviewed by the other

## 5. A Quick Check-In, Not a Roadblock

For either of them — a fast message to the other before pushing ahead on these saves rework later:

- 💬 Changing anything in the data model or a core business rule.
- 💬 Anything that shifts the project timeline or scope.
- 💬 Any issue that shows up after deploying.

## 6. How Reviews Work

- Every change goes through a pull request and a review from the other person before merging.
- Neither person merges their own work without the other's review.
- Anything touching money, security, or the database gets a manual walkthrough by both, in addition to automated tests.
- Release decisions are made together — a true two-key sign-off.

## 7. This Will Evolve

This split reflects a fair starting point, not a fixed structure. As the project moves forward, Obsan and Mary can rebalance areas between them as interests and strengths become clearer — always as equal partners in the project.
