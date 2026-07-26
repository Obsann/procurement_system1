import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import api from '../../lib/api';
import { renderWithProviders } from '../../test/renderWithProviders';
import { DecisionPanel } from './DecisionPanel';

let posted: { url: string; data: unknown }[] = [];
let failNext = false;

beforeEach(() => {
  posted = [];
  failNext = false;
  localStorage.clear();
  api.defaults.adapter = (config: AxiosRequestConfig) => {
    if (config.method?.toUpperCase() === 'POST') {
      const data = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
      posted.push({ url: config.url ?? '', data });
      if (failNext) {
        return Promise.reject({
          response: { status: 400, data: { error: 'Cannot approve in this state.' } },
        });
      }
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

const renderPanel = () =>
  renderWithProviders(<DecisionPanel entityType="PR" entityId="pr-1" />);

describe('DecisionPanel', () => {
  it('approves through the approvals endpoint after confirmation', async () => {
    renderPanel();

    await userEvent.click(screen.getByRole('button', { name: /^approve$/i }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: /^approve$/i }));

    await waitFor(() => expect(posted).toHaveLength(1));
    expect(posted[0].url).toBe('/approvals/approve/');
    expect(posted[0].data).toMatchObject({ entity_type: 'PR', entity_id: 'pr-1' });
  });

  it('refuses to return a record without explaining why', async () => {
    renderPanel();

    await userEvent.click(screen.getByRole('button', { name: /return for correction/i }));

    expect(await screen.findByText(/comment is required/i)).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(posted).toHaveLength(0);
  });

  it('sends the comment along with a rejection', async () => {
    renderPanel();

    await userEvent.type(screen.getByLabelText(/comment/i), 'Over budget for this quarter.');
    await userEvent.click(screen.getByRole('button', { name: /^reject$/i }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: /^reject$/i }));

    await waitFor(() => expect(posted).toHaveLength(1));
    expect(posted[0].url).toBe('/approvals/reject/');
    expect(posted[0].data).toMatchObject({ comment: 'Over budget for this quarter.' });
  });

  it('surfaces the backend reason when a transition is refused', async () => {
    failNext = true;
    renderPanel();

    await userEvent.click(screen.getByRole('button', { name: /^approve$/i }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: /^approve$/i }));

    expect(await screen.findByText(/cannot approve in this state/i)).toBeInTheDocument();
  });
});
