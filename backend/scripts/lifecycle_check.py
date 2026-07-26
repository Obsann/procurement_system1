"""Drives the 20-step MVP lifecycle from section 15.1 of the blueprint over HTTP.

The blueprint calls the MVP functionally complete when this scenario runs
"without manual database intervention", so this script talks to a running
server exactly as the frontend would, signing in as the role that owns each
step. Run it against a dev server:

    python manage.py runserver 8000
    python scripts/lifecycle_check.py

It prints one line per step and exits non-zero on the first failure, so it
doubles as a smoke test for the whole workflow.
"""
import json
import sys
import urllib.error
import urllib.request
from datetime import date, timedelta

BASE = 'http://127.0.0.1:8000/api'
PASSWORD = 'demopassword123'

ACCOUNTS = {
    'requester': 'requester@pmp.com',
    'budget': 'budget@pmp.com',
    'procurement': 'procurement@pmp.com',
    'finance': 'finance@pmp.com',
    'warehouse': 'warehouse@pmp.com',
}

PASS, FAIL = '  ok  ', ' FAIL '
step_number = 0
failures = []


def call(method, path, token=None, payload=None):
    body = json.dumps(payload).encode() if payload is not None else None
    request = urllib.request.Request(BASE + path, data=body, method=method)
    request.add_header('Content-Type', 'application/json')
    if token:
        request.add_header('Authorization', f'Bearer {token}')
    try:
        with urllib.request.urlopen(request) as response:
            raw = response.read().decode()
            return response.status, json.loads(raw) if raw else {}
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode()
        try:
            return exc.code, json.loads(raw)
        except json.JSONDecodeError:
            return exc.code, {'raw': raw[:400]}
    except urllib.error.URLError as exc:
        return 0, {'error': f'cannot reach {BASE}: {exc.reason}'}


def step(description, ok, detail=''):
    global step_number
    step_number += 1
    print(f'{PASS if ok else FAIL} {step_number:2}. {description}{" — " + detail if detail else ""}')
    if not ok:
        failures.append(f'{step_number}. {description}: {detail}')
    return ok


def login(who):
    status, data = call('POST', '/auth/login/', payload={'email': ACCOUNTS[who], 'password': PASSWORD})
    if status != 200:
        print(f'{FAIL} cannot sign in as {ACCOUNTS[who]}: {status} {data}')
        print('       Run: python manage.py seed_data')
        sys.exit(1)
    return data['access']


def main():
    tokens = {}
    status, data = call('POST', '/auth/login/', payload={'email': ACCOUNTS['requester'], 'password': PASSWORD})
    if status == 0:
        print(data['error'])
        sys.exit(1)
    step('A user logs into the system', status == 200, '' if status == 200 else str(data))
    for who in ACCOUNTS:
        tokens[who] = login(who)

    # 2-3. Requisition with line items. The API requires an explicit department
    # even though the requester already has one, so read it off the profile.
    _, profile = call('GET', '/auth/profile/', tokens['requester'])
    due = (date.today() + timedelta(days=30)).isoformat()
    status, pr = call('POST', '/requisitions/', tokens['requester'], {
        'title': 'Lifecycle check requisition',
        'description': 'Created by scripts/lifecycle_check.py',
        'department': profile.get('department'),
        'required_delivery_date': due,
        'lines': [
            {'item_name': 'Network switch', 'description': '48-port', 'quantity': '2', 'estimated_unit_price': '900.00'},
            {'item_name': 'Patch cables', 'description': 'Cat6, 2m', 'quantity': '50', 'estimated_unit_price': '4.00'},
        ],
    })
    if not step('The Requester creates a Purchase Requisition', status == 201, '' if status == 201 else str(pr)):
        return report()
    pr_id = pr['id']
    step('The Requester adds one or more procurement items', len(pr.get('lines', [])) == 2,
         f"{len(pr.get('lines', []))} lines")

    status, data = call('POST', f'/requisitions/{pr_id}/submit/', tokens['requester'])
    if not step('The Purchase Requisition is submitted', status == 200, '' if status == 200 else str(data)):
        return report()

    # 5-6. Budget holder sees it and approves.
    status, queue = call('GET', '/requisitions/?status=SUBMITTED', tokens['budget'])
    visible = any(row['id'] == pr_id for row in queue.get('results', []))
    step('The Budget Holder reviews the request', visible,
         '' if visible else 'requisition not visible to the approver')

    status, data = call('POST', '/approvals/approve/', tokens['budget'],
                        {'entity_type': 'PR', 'entity_id': pr_id, 'comment': 'Within budget.'})
    if not step('The Budget Holder approves the request', status == 200, '' if status == 200 else str(data)):
        return report()

    # 7. Procurement officer sees the approved requisition.
    status, approved = call('GET', '/requisitions/?status=APPROVED', tokens['procurement'])
    step('The Procurement Officer views the approved request',
         any(row['id'] == pr_id for row in approved.get('results', [])))

    # Suppliers are a precondition for an RFQ; create two if none exist.
    supplier_ids = []
    for name in ('Lifecycle Supplier A', 'Lifecycle Supplier B'):
        status, existing = call('GET', f'/suppliers/?search={name.replace(" ", "%20")}', tokens['procurement'])
        match = next((s for s in existing.get('results', []) if s['legal_name'] == name), None)
        if match:
            supplier_ids.append(match['id'])
            continue
        status, supplier = call('POST', '/suppliers/', tokens['procurement'], {
            'legal_name': name, 'contact_person': 'Sales', 'email': f'{name.split()[-1].lower()}@example.com',
            'phone': '+251900000000',
        })
        if status != 201:
            step(f'create supplier {name}', False, str(supplier))
            return report()
        supplier_ids.append(supplier['id'])

    # 8. RFQ.
    status, rfq = call('POST', '/rfqs/', tokens['procurement'], {
        'purchase_requisition': pr_id,
        'title': 'RFQ for lifecycle check',
        'description': 'Network hardware',
        'submission_deadline': (date.today() + timedelta(days=7)).isoformat(),
        'supplier_ids': supplier_ids,
        'lines': [
            {'item_name': 'Network switch', 'description': '48-port', 'quantity': '2'},
            {'item_name': 'Patch cables', 'description': 'Cat6, 2m', 'quantity': '50'},
        ],
    })
    if not step('The Procurement Officer creates an RFQ', status == 201, '' if status == 201 else str(rfq)):
        return report()
    rfq_id = rfq['id']
    rfq_lines = rfq.get('lines', [])
    call('POST', f'/rfqs/{rfq_id}/send/', tokens['procurement'])

    # 9. Two supplier quotations.
    bid_ids = []
    for index, supplier_id in enumerate(supplier_ids):
        unit = 880 + index * 40
        status, bid = call('POST', '/bids/', tokens['procurement'], {
            'rfq': rfq_id,
            'supplier': supplier_id,
            'bid_date': date.today().isoformat(),
            'lead_time_days': 14 + index,
            'freight_cost': '50.00',
            'insurance_cost': '0.00',
            'tax_amount': '0.00',
            'grand_total': str(unit * 2 + 50 * 4 + 50),
            'lines': [
                {'rfq_line': rfq_lines[0]['id'], 'quantity_offered': '2',
                 'unit_price': str(unit), 'total_price': str(unit * 2)},
                {'rfq_line': rfq_lines[1]['id'], 'quantity_offered': '50',
                 'unit_price': '4.00', 'total_price': '200.00'},
            ],
        })
        if status != 201:
            step('At least two supplier quotations are recorded', False, str(bid))
            return report()
        bid_ids.append(bid['id'])
    step('At least two supplier quotations are recorded', len(bid_ids) == 2)

    # 10. Compare.
    status, comparison = call('GET', f'/bids/?rfq={rfq_id}', tokens['procurement'])
    step('The quotations are compared', status == 200 and len(comparison.get('results', [])) >= 2,
         f"{len(comparison.get('results', []))} bids returned" if status == 200 else str(comparison))

    # 11. Winner.
    status, data = call('POST', f'/bids/{bid_ids[0]}/select_winner/', tokens['procurement'])
    if not step('A winning supplier is selected', status == 200, '' if status == 200 else str(data)):
        return report()

    # 12. PO.
    status, po = call('POST', '/purchase-orders/generate-from-bid/', tokens['procurement'], {'bid_id': bid_ids[0]})
    if not step('A Purchase Order is generated', status == 201, '' if status == 201 else str(po)):
        return report()
    po_id = po['id']

    call('POST', f'/purchase-orders/{po_id}/submit-for-review/', tokens['procurement'])

    # 13-14. Financial review.
    status, queue = call('GET', '/purchase-orders/?status=FINANCIAL_REVIEW', tokens['finance'])
    step('The Financial Reviewer reviews the Purchase Order',
         any(row['id'] == po_id for row in queue.get('results', [])))

    status, data = call('POST', '/financial-reviews/review/', tokens['finance'],
                        {'purchase_order': po_id, 'decision': 'APPROVED', 'comments': 'Funds available.'})
    if not step('The Purchase Order receives financial approval', status == 200, '' if status == 200 else str(data)):
        return report()

    # 15. Final approval by the budget holder.
    status, data = call('POST', f'/purchase-orders/{po_id}/submit-final/', tokens['procurement'])
    if status != 200:
        step('The Purchase Order receives final approval', False,
             f'cannot reach FINAL_APPROVAL: {data}')
    else:
        status, data = call('POST', '/approvals/approve/', tokens['budget'],
                            {'entity_type': 'PO', 'entity_id': po_id, 'comment': 'Approved.'})
        step('The Purchase Order receives final approval', status == 200, '' if status == 200 else str(data))

    # 16-17. Goods receipt.
    status, po_now = call('GET', f'/purchase-orders/{po_id}/', tokens['warehouse'])
    po_lines = po_now.get('lines', [])
    status, receipt = call('POST', '/goods-receipts/', tokens['warehouse'], {
        'purchase_order': po_id,
        'received_date': date.today().isoformat(),
        'notes': 'Lifecycle check receipt',
        # expected_quantity duplicates the ordered quantity the server already
        # holds on the PO line, but the serializer requires it from the client.
        'lines': [
            {'po_line': line['id'], 'expected_quantity': line['quantity'],
             'received_quantity': line['quantity']}
            for line in po_lines
        ],
    })
    receipted = status == 201
    step('The Warehouse Officer records received goods', receipted, '' if receipted else str(receipt))
    step('A Goods Receipt record is generated', receipted and bool(receipt.get('grn_number')),
         receipt.get('grn_number', '') if receipted else '')

    # 18-20.
    status, history = call('GET', f'/approvals/?entity_type=PR&entity_id={pr_id}', tokens['requester'])
    step('Users can view the complete procurement history',
         status == 200 and len(history.get('results', [])) >= 1)

    status, audit = call('GET', '/audit-logs/', tokens['budget'])
    step('All workflow actions are visible in the audit log',
         status == 200 and audit.get('count', 0) > 0,
         f"{audit.get('count', 0)} entries" if status == 200 else str(audit))

    # Notifications fan forward to whoever acts next. The originator is also an
    # "appropriate user" for the outcome of their own request, so check both.
    _, approver_notes = call('GET', '/notifications/', tokens['budget'])
    _, requester_notes = call('GET', '/notifications/', tokens['requester'])
    forward = approver_notes.get('count', 0) > 0
    back = requester_notes.get('count', 0) > 0
    step('Notifications are delivered to the appropriate users', forward and back,
         f"next-actor {approver_notes.get('count', 0)}, originator {requester_notes.get('count', 0)}"
         + ('' if back else ' — the requester is never told the outcome of their own request'))

    report()


def report():
    print()
    if failures:
        print(f'{len(failures)} of {step_number} steps failed:')
        for failure in failures:
            print(f'  - {failure}')
        sys.exit(1)
    print(f'All {step_number} lifecycle steps passed.')


if __name__ == '__main__':
    main()
