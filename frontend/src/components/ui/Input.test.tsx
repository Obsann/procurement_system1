import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input Component', () => {
  it('renders input with label', () => {
    render(<Input label="Email Address" id="email" />);
    expect(screen.getByText(/email address/i)).toBeInTheDocument();
  });

  it('allows user text entry', async () => {
    render(<Input placeholder="Enter username" />);
    const input = screen.getByPlaceholderText(/enter username/i);
    await userEvent.type(input, 'obsan');
    expect(input).toHaveValue('obsan');
  });

  it('displays error message when error prop is provided', () => {
    render(<Input error="Field is required" />);
    expect(screen.getByText(/field is required/i)).toBeInTheDocument();
  });
});
