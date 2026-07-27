import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import api from '../../lib/api';
import { renderWithProviders } from '../../test/renderWithProviders';
import { BidFormDrawer } from './BidFormDrawer';
import { type RFQ } from '../../types';

let posted: { url: string; data: any }[] = [];

beforeEach(() => {
  posted = [];
  localStorage.clear();
  api.defaults.adapter = (config: AxiosRequestConfig) => {
    if (config.method?.toUpperCase() === 'POST') {
      const data = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
      posted.push({ url: config.url ?? '', data });
      return Promise.resolve({
        data: { id: 'bid-1' },
        status: 201,
        statusText: 'Created',
        headers: {},
        config,
      } as AxiosResponse);
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
  status: 'SENT',
  created_at: '2026-07-01T00:00:00Z',
  invited_suppliers: [
    { id: 'inv-1', supplier: 'sup-1', supplier_name: 'Alpha', invited_at: '', responded: false },
    { id: 'inv-2', supplier: 'sup-2', supplier_name: 'Beta', invited_at: '', responded: false },
  ],
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

const open = (quoted: string[] = []) =>
  renderWithProviders(
    <BidFormDrawer rfq={rfq} open onClose={() => {}} quotedSupplierIds={quoted} />,
  );

describe('BidFormDrawer', () => {
  it('seeds the quantity from the RFQ line', () => {
    open();

    expect(screen.getByLabelText(/^quantity$/i)).toHaveValue(2);
  });

  it('adds freight, insurance and tax into the grand total', async () => {
    open();

    await userEvent.type(screen.getByLabelText(/unit price/i), '500');
    await userEvent.clear(screen.getByLabelText(/freight/i));
    await userEvent.type(screen.getByLabelText(/freight/i), '75');

    // 2 x 500 + 75
    await waitFor(() => expect(screen.getByText('$1,075.00')).toBeInTheDocument());
  });

  it('will not save a quotation with a line left unpriced', async () => {
    open();

    await userEvent.selectOptions(screen.getByLabelText(/supplier/i), 'sup-1');
    await userEvent.click(screen.getByRole('button', { name: /save quotation/i }));

    expect(await screen.findByText(/every line needs a unit price/i)).toBeInTheDocument();
    expect(posted).toHaveLength(0);
  });

  it('will not save without naming the supplier', async () => {
    open();

    await userEvent.type(screen.getByLabelText(/unit price/i), '500');
    await userEvent.click(screen.getByRole('button', { name: /save quotation/i }));

    expect(await screen.findByText(/which supplier/i)).toBeInTheDocument();
    expect(posted).toHaveLength(0);
  });

  it('posts the quotation with a line per RFQ line', async () => {
    open();

    await userEvent.selectOptions(screen.getByLabelText(/supplier/i), 'sup-1');
    await userEvent.type(screen.getByLabelText(/unit price/i), '500');
    await userEvent.click(screen.getByRole('button', { name: /save quotation/i }));

    await waitFor(() => expect(posted).toHaveLength(1));
    expect(posted[0].url).toBe('/bids/');
    expect(posted[0].data).toMatchObject({ rfq: 'rfq-1', supplier: 'sup-1', grand_total: '1000.00' });
    expect(posted[0].data.lines).toEqual([
      { rfq_line: 'line-1', quantity_offered: '2', unit_price: '500', total_price: '1000.00' },
    ]);
  });

  it('does not offer a supplier that has already quoted', () => {
    open(['sup-1']);

    expect(screen.queryByRole('option', { name: 'Alpha' })).toBeNull();
    expect(screen.getByRole('option', { name: 'Beta' })).toBeInTheDocument();
  });
});
