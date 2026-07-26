import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable, type Column } from './DataTable';

interface Row {
  id: string;
  name: string;
  amount: string;
}

const columns: Column<Row>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'amount', label: 'Amount', sortable: true },
];

const rows: Row[] = [
  { id: '1', name: 'Beta', amount: '90.00' },
  { id: '2', name: 'Alpha', amount: '1000.00' },
  { id: '3', name: 'Gamma', amount: '250.00' },
];

const bodyCells = (columnIndex: number) =>
  screen
    .getAllByRole('row')
    .slice(1)
    .map((row) => row.querySelectorAll('td')[columnIndex]?.textContent);

describe('DataTable', () => {
  it('renders a row per record', () => {
    render(<DataTable columns={columns} data={rows} />);
    expect(screen.getAllByRole('row')).toHaveLength(rows.length + 1);
  });

  it('sorts text ascending then descending', async () => {
    render(<DataTable columns={columns} data={rows} />);

    await userEvent.click(screen.getByText('Name'));
    expect(bodyCells(0)).toEqual(['Alpha', 'Beta', 'Gamma']);

    await userEvent.click(screen.getByText('Name'));
    expect(bodyCells(0)).toEqual(['Gamma', 'Beta', 'Alpha']);
  });

  it('sorts decimal strings numerically rather than lexicographically', async () => {
    render(<DataTable columns={columns} data={rows} />);

    await userEvent.click(screen.getByText('Amount'));

    // Lexicographic ordering would put '1000.00' before '250.00'.
    expect(bodyCells(1)).toEqual(['90.00', '250.00', '1000.00']);
  });

  it('paginates and reports the visible range', async () => {
    const many = Array.from({ length: 12 }, (_, i) => ({
      id: String(i),
      name: `Row ${i}`,
      amount: String(i),
    }));
    render(<DataTable columns={columns} data={many} pageSize={10} />);

    expect(screen.getByText('Showing 1–10 of 12')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByText('Showing 11–12 of 12')).toBeInTheDocument();
  });

  it('shows the empty message with no data', () => {
    render(<DataTable columns={columns} data={[]} emptyMessage="Nothing here yet" />);
    expect(screen.getByText('Nothing here yet')).toBeInTheDocument();
  });

  it('prefers a loading skeleton over the empty state while fetching', () => {
    render(<DataTable columns={columns} data={[]} loading emptyMessage="Nothing here yet" />);
    expect(screen.queryByText('Nothing here yet')).toBeNull();
  });

  it('invokes onRowClick with the clicked record', async () => {
    const onRowClick = vi.fn();
    render(<DataTable columns={columns} data={rows} onRowClick={onRowClick} />);

    await userEvent.click(screen.getByText('Beta'));

    expect(onRowClick).toHaveBeenCalledWith(rows[0]);
  });
});
