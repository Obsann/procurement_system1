import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import api from '../../lib/api';
import { renderWithProviders } from '../../test/renderWithProviders';
import { RFQFormPage } from './RFQFormPage';

let posted: { url: string; data: any }[] = [];

const approvedPR = {
  id: 'pr-1',
  pr_number: 'PR-001',
  title: 'Laptop refresh',
  description: 'Replace out-of-warranty machines',
  status: 'APPROVED',
  lines: [
    {
      id: 'prline-1',
      item_name: 'Laptop',
      description: '16GB RAM',
      quantity: '10.00',
      unit_of_measure: 'PCS',
      estimated_unit_price: '1450.00',
    },
  ],
};

const suppliers = [
  { id: 'sup-1', legal_name: 'Alpha Supplies', supplier_code: 'S1', status: 'ACTIVE' },
  { id: 'sup-2', legal_name: 'Beta Trading', supplier_code: 'S2', status: 'ACTIVE' },
];

const page = (results: unknown[]) => ({ count: results.length, next: null, previous: null, results });

beforeEach(() => {
  posted = [];
  localStorage.clear();
  api.defaults.adapter = (config: AxiosRequestConfig) => {
    const url = config.url ?? '';
    if (config.method?.toUpperCase() === 'POST') {
      const data = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
      posted.push({ url, data });
      return Promise.resolve({
        data: { id: 'rfq-9', rfq_number: 'RFQ-009' },
        status: 201,
        statusText: 'Created',
        headers: {},
        config,
      } as AxiosResponse);
    }
    const body = url.startsWith('/requisitions/')
      ? page([approvedPR])
      : url.startsWith('/suppliers/')
        ? page(suppliers)
        : page([]);
    return Promise.resolve({
      data: body,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    } as AxiosResponse);
  };
});

/** The option list arrives after the label, so wait for the option itself. */
const chooseApprovedPR = async () => {
  await screen.findByRole('option', { name: /PR-001 — Laptop refresh/ });
  await userEvent.selectOptions(screen.getByLabelText(/approved requisition/i), 'pr-1');
};

describe('RFQFormPage', () => {
  it('only offers approved requisitions, per BR-05', async () => {
    renderWithProviders(<RFQFormPage />);

    expect(
      await screen.findByRole('option', { name: /PR-001 — Laptop refresh/ }),
    ).toBeInTheDocument();
  });

  it('adopts the requisition line items so they are not retyped', async () => {
    renderWithProviders(<RFQFormPage />);

    await chooseApprovedPR();

    await waitFor(() => expect(screen.getByDisplayValue('Laptop')).toBeInTheDocument());
    expect(screen.getByDisplayValue('16GB RAM')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
  });

  it('refuses to create an RFQ with fewer than two suppliers invited', async () => {
    renderWithProviders(<RFQFormPage />);

    await chooseApprovedPR();
    await userEvent.type(await screen.findByLabelText(/submission deadline/i), '2026-09-01');
    await userEvent.click(await screen.findByLabelText(/Alpha Supplies/));

    await userEvent.click(screen.getByRole('button', { name: /create rfq/i }));

    expect(await screen.findByText(/at least two suppliers/i)).toBeInTheDocument();
    expect(posted).toHaveLength(0);
  });

  it('posts the RFQ with its lines and invited suppliers', async () => {
    renderWithProviders(<RFQFormPage />);

    await chooseApprovedPR();
    await userEvent.type(await screen.findByLabelText(/submission deadline/i), '2026-09-01');
    await userEvent.click(await screen.findByLabelText(/Alpha Supplies/));
    await userEvent.click(await screen.findByLabelText(/Beta Trading/));

    await userEvent.click(screen.getByRole('button', { name: /create rfq/i }));

    await waitFor(() => expect(posted).toHaveLength(1));
    expect(posted[0].url).toBe('/rfqs/');
    expect(posted[0].data.purchase_requisition).toBe('pr-1');
    expect(posted[0].data.supplier_ids).toEqual(['sup-1', 'sup-2']);
    expect(posted[0].data.lines).toHaveLength(1);
    expect(posted[0].data.lines[0]).toMatchObject({ item_name: 'Laptop', pr_line: 'prline-1' });
  });
});
