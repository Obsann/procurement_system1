import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge Component', () => {
  it('renders DRAFT status badge', () => {
    render(<StatusBadge status="DRAFT" />);
    expect(screen.getByText('DRAFT')).toBeInTheDocument();
  });

  it('replaces underscores with spaces for label', () => {
    render(<StatusBadge status="FINANCIAL_REVIEW" />);
    expect(screen.getByText('FINANCIAL REVIEW')).toBeInTheDocument();
  });

  it('handles GOODS_RECEIVED status', () => {
    render(<StatusBadge status="GOODS_RECEIVED" />);
    expect(screen.getByText('GOODS RECEIVED')).toBeInTheDocument();
  });
});
