import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale } from 'lucide-react';
import {
  Button,
  DataTable,
  EmptyState,
  PageHeader,
  type Column,
} from '../../components/ui';
import { useGetBidsQuery } from '../../store/api/bidsApi';
import { useGetRFQsQuery } from '../../store/api/rfqApi';
import { formatDate, formatMoney } from '../../lib/format';
import { type Bid } from '../../types';

/** Every quotation across all RFQs; evaluation itself happens on the RFQ. */
export const BidListPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useGetBidsQuery();
  const { data: rfqData } = useGetRFQsQuery();

  const bids = data?.results ?? [];
  const rfqNumberFor = (rfqId: string) =>
    rfqData?.results.find((rfq) => rfq.id === rfqId)?.rfq_number ?? '—';

  const columns: Column<Bid>[] = [
    { key: 'supplier_name', label: 'Supplier', sortable: true },
    {
      key: 'rfq',
      label: 'RFQ',
      render: (row) => (
        <span className="font-medium text-accent-indigo">{rfqNumberFor(row.rfq)}</span>
      ),
    },
    {
      key: 'grand_total',
      label: 'Grand total',
      sortable: true,
      render: (row) => formatMoney(row.grand_total),
    },
    {
      key: 'lead_time_days',
      label: 'Lead time',
      render: (row) => (row.lead_time_days != null ? `${row.lead_time_days} days` : '—'),
    },
    { key: 'bid_date', label: 'Received', render: (row) => formatDate(row.bid_date) },
    {
      key: 'is_winner',
      label: 'Outcome',
      render: (row) =>
        row.is_winner ? (
          <span className="text-sm font-medium text-success">Awarded</span>
        ) : (
          <span className="text-sm text-text-muted">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bids"
        description="Supplier quotations received across every request for quotation"
      />

      {!isLoading && bids.length === 0 ? (
        <EmptyState
          icon={<Scale className="h-8 w-8" />}
          title="No quotations yet"
          description="Quotations appear here once suppliers respond to an RFQ."
          action={<Button onClick={() => navigate('/rfqs')}>Go to RFQs</Button>}
        />
      ) : (
        <DataTable
          columns={columns}
          data={bids}
          loading={isLoading}
          onRowClick={(row) => navigate(`/rfqs/${row.rfq}`)}
          emptyMessage="No quotations recorded."
        />
      )}
    </div>
  );
};
