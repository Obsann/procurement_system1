import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { DashboardPage } from './DashboardPage';
import authReducer from '../../store/slices/authSlice';
import uiReducer from '../../store/slices/uiSlice';

function renderWithProviders(ui: React.ReactElement) {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      ui: uiReducer,
    },
  });
  return render(
    <Provider store={store}>
      {ui}
    </Provider>
  );
}

describe('DashboardPage Component', () => {
  it('renders dashboard metrics cards', () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText(/total requisitions/i)).toBeInTheDocument();
    expect(screen.getByText(/pending approvals/i)).toBeInTheDocument();
    expect(screen.getByText(/completed pos/i)).toBeInTheDocument();
  });
});
