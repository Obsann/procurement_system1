import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card, CardHeader, CardTitle, CardContent } from './Card';

describe('Card Component', () => {
  it('renders card structure with header, title, and content', () => {
    render(
      <Card data-testid="card-root">
        <CardHeader>
          <CardTitle>Card Title Text</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Card body content</p>
        </CardContent>
      </Card>
    );

    expect(screen.getByTestId('card-root')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /card title text/i })).toBeInTheDocument();
    expect(screen.getByText(/card body content/i)).toBeInTheDocument();
  });
});
