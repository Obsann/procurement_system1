import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import api from '../../lib/api';
import { renderWithProviders } from '../../test/renderWithProviders';
import { RequisitionListPage } from './RequisitionListPage';
import { type PurchaseRequisition } from '../../types';

/** Shaped exactly as PurchaseRequisitionSerializer renders it. */
const draft: PurchaseRequisition = {
  id: 'pr-1',
  pr_number: 'PR-2026-0001',
  requester: 'u-1',
  requester_name: 'Ada Lovelace',
  department: 'd-1',
  department_name: 'Engineering',
  title: 'Standing desks',
  description: 'Six adjustable desks',
  delivery_location: null,
  required_delivery_date: '2026-09-01',
  currency: 'USD',
  status: 'DRAFT',
  total_estimated_amount: '4200.00',
  lines: [],
  attachments: [],
  submitted_at: null,
  approved_at: null,
  created_at: '2026-07-01T09:00:00Z',
};

const submitted: PurchaseRequisition = {
  ...draft,
  id: 'pr-2',
  pr_number: 'PR-2026-0002',
  title: 'Server rack',
  status: 'SUBMITTED',
  total_estimated_amount: '15750.50',
};

let submitCalls: string[] = [];

beforeEach(() => {
  submitCalls = [];
  localStorage.clear();
  api.defaults.adapter = (config: AxiosRequestConfig) => {
    const url = config.url ?? '';
    if (config.method?.toUpperCase() === 'POST' && url.includes('/submit/')) {
      submitCalls.push(url);
      return Promise.resolve({
        data: { ...draft, status: 'SUBMITTED' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      } as AxiosResponse);
    }
    return Promise.resolve({
      data: { count: 2, next: null, previous: null, results: [draft, submitted] },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    } as AxiosResponse);
  };
});

describe('RequisitionListPage', () => {
  it('renders the snake_case fields the API actually returns', async () => {
    renderWithProviders(<RequisitionListPage />);

    expect(await screen.findByText('PR-2026-0001')).toBeInTheDocument();
    expect(screen.getByText('Standing desks')).toBeInTheDocument();
    expect(screen.getAllByText('Engineering').length).toBeGreaterThan(0);
  });

  it('formats total_estimated_amount, which arrives as a decimal string', async () => {
    renderWithProviders(<RequisitionListPage />);

    expect(await screen.findByText('$4,200.00')).toBeInTheDocument();
    expect(screen.getByText('$15,750.50')).toBeInTheDocument();
  });

  it('offers draft-only actions on drafts and hides them otherwise', async () => {
    renderWithProviders(<RequisitionListPage />);

    const draftRow = (await screen.findByText('PR-2026-0001')).closest('tr')!;
    const submittedRow = screen.getByText('PR-2026-0002').closest('tr')!;

    expect(within(draftRow).getByRole('button', { name: /submit/i })).toBeInTheDocument();
    expect(within(draftRow).getByRole('button', { name: /edit/i })).toBeInTheDocument();
    expect(within(submittedRow).queryByRole('button', { name: /submit/i })).toBeNull();
    expect(within(submittedRow).queryByRole('button', { name: /edit/i })).toBeNull();
  });

  it('filters by status', async () => {
    renderWithProviders(<RequisitionListPage />);
    await screen.findByText('PR-2026-0001');

    await userEvent.selectOptions(screen.getByLabelText('Status'), 'SUBMITTED');

    expect(screen.queryByText('PR-2026-0001')).toBeNull();
    expect(screen.getByText('PR-2026-0002')).toBeInTheDocument();
  });

  it('searches on title and PR number', async () => {
    renderWithProviders(<RequisitionListPage />);
    await screen.findByText('PR-2026-0001');

    await userEvent.type(screen.getByLabelText('Search'), 'rack');

    expect(screen.queryByText('PR-2026-0001')).toBeNull();
    expect(screen.getByText('Server rack')).toBeInTheDocument();
  });

  it('submits a draft through the requisition submit endpoint', async () => {
    renderWithProviders(<RequisitionListPage />);

    const draftRow = (await screen.findByText('PR-2026-0001')).closest('tr')!;
    await userEvent.click(within(draftRow).getByRole('button', { name: /submit/i }));

    await waitFor(() => expect(submitCalls).toEqual(['/requisitions/pr-1/submit/']));
    expect(await screen.findByText(/submitted for approval/i)).toBeInTheDocument();
  });

  it('asks for confirmation before deleting', async () => {
    renderWithProviders(<RequisitionListPage />);

    const draftRow = (await screen.findByText('PR-2026-0001')).closest('tr')!;
    await userEvent.click(
      within(draftRow).getByRole('button', { name: /delete PR-2026-0001/i }),
    );

    expect(await screen.findByRole('dialog', { name: /delete requisition/i })).toBeInTheDocument();
  });

  it('surfaces a retry affordance when the list fails to load', async () => {
    api.defaults.adapter = vi.fn(() => Promise.reject(new Error('network down')));

    renderWithProviders(<RequisitionListPage />);

    expect(await screen.findByText(/could not load your requisitions/i)).toBeInTheDocument();
  });
});
