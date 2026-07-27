import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import api from '../../lib/api';
import { renderWithProviders } from '../../test/renderWithProviders';
import { BidComparison } from './BidComparison';
import { type Bid, type RFQ } from '../../types';

let posted: { url: string; data: unknown }[] = [];

beforeEach(() => {
  posted = [];
  localStorage.clear();
  api.defaults.adapter = (config: AxiosRequestConfig) => {
    if (config.method?.toUpperCase() === 'POST') {
      posted.push({ url: config.url ?? '', data: config.data });
    }
    return Promise.resolve({
      data: { count: 0, next: null, previous: null, results: [] },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    } as AxiosResponse);
  };
});

const rfq: RFQ = {
  id: 'rfq-1',
  rfq_number: 'RFQ-001',
  purchase_requisition: 'pr-1',
  title: 'Laptops',
  description: '',
  submission_deadline: '2026-08-01',
  instructions: '',
  status: 'RESPONDED',
  created_at: '2026-07-01T00:00:00Z',
  invited_suppliers: [],
  lines: [
    {
      id: 'line-1',
      rfq: 'rfq-1',
      pr_line: null,
      item_name: 'Laptop',
      description: '16GB',
      quantity: '2',
      unit_of_measure: 'PCS',
      sort_order: 0,
    },
  ],
};

const bid = (over: Partial<Bid> & { id: string; supplier: string }): Bid => ({
  rfq: 'rfq-1',
  supplier_name: over.supplier,
  bid_date: '2026-07-10',
  expiry_date: null,
  lead_time_days: 10,
  freight_cost: '0.00',
  insurance_cost: '0.00',
  tax_amount: '0.00',
  grand_total: '1000.00',
  is_winner: false,
  notes: '',
  attachments: [],
  created_at: '2026-07-10T00:00:00Z',
  lines: [
    {
      id: `${over.id}-l1`,
      bid: over.id,
      rfq_line: 'line-1',
      quantity_offered: '2',
      unit_price: '500.00',
      total_price: '1000.00',
      notes: '',
    },
  ],
  ...over,
});

const cheap = bid({ id: 'bid-1', supplier: 'Alpha', grand_total: '900.00', lead_time_days: 20 });
const dear = bid({ id: 'bid-2', supplier: 'Beta', grand_total: '1200.00', lead_time_days: 5 });

describe('BidComparison', () => {
  it('shows every quotation side by side', () => {
    renderWithProviders(<BidComparison rfq={rfq} bids={[cheap, dear]} />);

    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByText('Laptop')).toBeInTheDocument();
  });

  it('marks the lowest grand total so the cheapest quote is obvious', () => {
    renderWithProviders(<BidComparison rfq={rfq} bids={[dear, cheap]} />);

    expect(screen.getByText('lowest')).toBeInTheDocument();
  });

  it('blocks awarding until two different suppliers have quoted', () => {
    renderWithProviders(<BidComparison rfq={rfq} bids={[cheap]} />);

    expect(screen.getByText(/two different suppliers/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /award/i })).toBeDisabled();
  });

  it('awards through the select_winner endpoint after confirmation', async () => {
    renderWithProviders(<BidComparison rfq={rfq} bids={[cheap, dear]} />);

    await userEvent.click(screen.getAllByRole('button', { name: /award/i })[0]);
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: /confirm/i }));

    await waitFor(() => expect(posted).toHaveLength(1));
    expect(posted[0].url).toBe('/bids/bid-1/select_winner/');
  });

  it('stops offering an award once a winner exists', () => {
    const won = { ...cheap, is_winner: true };
    renderWithProviders(<BidComparison rfq={rfq} bids={[won, dear]} />);

    expect(screen.getByText('Awarded')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /award/i })).toBeNull();
  });

  it('invites the user to record quotations when none exist', () => {
    renderWithProviders(<BidComparison rfq={rfq} bids={[]} />);

    expect(screen.getByText(/no quotations recorded yet/i)).toBeInTheDocument();
  });
});
