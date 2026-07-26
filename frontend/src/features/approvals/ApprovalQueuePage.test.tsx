import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLocation } from 'react-router-dom';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import api from '../../lib/api';
import { renderWithProviders } from '../../test/renderWithProviders';
import { ApprovalQueuePage } from './ApprovalQueuePage';
import { type PurchaseOrder, type PurchaseRequisition } from '../../types';

const DAY = 86_400_000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY).toISOString();

const submittedPR: PurchaseRequisition = {
  id: 'pr-1',
  pr_number: 'PR-2026-0007',
  requester: 'u-1',
  requester_name: 'Ada Lovelace',
  department: 'd-1',
  department_name: 'Engineering',
  title: 'Server rack',
  description: 'One 42U rack',
  delivery_location: null,
  required_delivery_date: '2026-09-01',
  currency: 'USD',
  status: 'SUBMITTED',
  total_estimated_amount: '15750.50',
  lines: [],
  attachments: [],
  submitted_at: daysAgo(4),
  approved_at: null,
  created_at: daysAgo(5),
};

const finalApprovalPO: PurchaseOrder = {
  id: 'po-1',
  po_number: 'PO-2026-0003',
  purchase_requisition: 'pr-9',
  pr_number: 'PR-2026-0002',
  rfq: null,
  winning_bid: null,
  supplier: 's-1',
  supplier_name: 'Acme Supplies',
  status: 'FINAL_APPROVAL',
  currency: 'USD',
  subtotal: '9000.00',
  freight_cost: '250.00',
  insurance_cost: '0.00',
  tax_amount: '750.00',
  total_amount: '10000.00',
  payment_terms: 'Net 30',
  delivery_method: 'Road',
  delivery_location: null,
  notes: '',
  lines: [],
  submitted_at: daysAgo(1),
  approved_at: null,
  created_at: daysAgo(2),
};

let requestedUrls: { url: string; params: unknown }[] = [];

beforeEach(() => {
  requestedUrls = [];
  localStorage.clear();
  api.defaults.adapter = (config: AxiosRequestConfig) => {
    const url = config.url ?? '';
    requestedUrls.push({ url, params: config.params });
    const results = url.includes('purchase-orders') ? [finalApprovalPO] : [submittedPR];
    return Promise.resolve({
      data: { count: results.length, next: null, previous: null, results },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    } as AxiosResponse);
  };
});

describe('ApprovalQueuePage', () => {
  it('asks the API only for records that are actually awaiting a decision', async () => {
    renderWithProviders(<ApprovalQueuePage />);
    await screen.findByText('PR-2026-0007');

    const prCall = requestedUrls.find((r) => r.url.includes('requisitions'));
    const poCall = requestedUrls.find((r) => r.url.includes('purchase-orders'));

    expect(prCall?.params).toMatchObject({ status: 'SUBMITTED' });
    expect(poCall?.params).toMatchObject({ status: 'FINAL_APPROVAL' });
  });

  it('lists submitted requisitions with the requester and formatted amount', async () => {
    renderWithProviders(<ApprovalQueuePage />);

    expect(await screen.findByText('PR-2026-0007')).toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('$15,750.50')).toBeInTheDocument();
  });

  it('shows how long each record has been waiting', async () => {
    renderWithProviders(<ApprovalQueuePage />);

    expect(await screen.findByText('4d')).toBeInTheDocument();
  });

  it('switches to purchase orders awaiting final approval', async () => {
    renderWithProviders(<ApprovalQueuePage />);
    await screen.findByText('PR-2026-0007');

    await userEvent.click(screen.getByRole('tab', { name: /purchase orders/i }));

    expect(await screen.findByText('PO-2026-0003')).toBeInTheDocument();
    expect(screen.getByText('Acme Supplies')).toBeInTheDocument();
    expect(screen.getByText('$10,000.00')).toBeInTheDocument();
  });

  it('routes to the matching review page for the entity type', async () => {
    // The app renders inside a MemoryRouter, so read the route from the router.
    const ShowPath: React.FC = () => <output>{useLocation().pathname}</output>;
    renderWithProviders(
      <>
        <ApprovalQueuePage />
        <ShowPath />
      </>,
    );

    const row = (await screen.findByText('PR-2026-0007')).closest('tr')!;
    await userEvent.click(within(row).getByRole('button', { name: /review/i }));

    expect(await screen.findByText('/approvals/pr/pr-1')).toBeInTheDocument();
  });

  it('routes purchase orders to the order review page', async () => {
    const ShowPath: React.FC = () => <output>{useLocation().pathname}</output>;
    renderWithProviders(
      <>
        <ApprovalQueuePage />
        <ShowPath />
      </>,
    );
    await screen.findByText('PR-2026-0007');
    await userEvent.click(screen.getByRole('tab', { name: /purchase orders/i }));

    const row = (await screen.findByText('PO-2026-0003')).closest('tr')!;
    await userEvent.click(within(row).getByRole('button', { name: /review/i }));

    expect(await screen.findByText('/approvals/po/po-1')).toBeInTheDocument();
  });
});
