import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { baseApi } from '../store/api/baseApi';
import authReducer from '../store/slices/authSlice';
import uiReducer from '../store/slices/uiSlice';
import { ToastProvider } from '../components/ui';

export const makeStore = () =>
  configureStore({
    reducer: { auth: authReducer, ui: uiReducer, [baseApi.reducerPath]: baseApi.reducer },
    middleware: (gdm) => gdm().concat(baseApi.middleware),
  });

interface Options extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
  store?: ReturnType<typeof makeStore>;
}

export function renderWithProviders(
  ui: React.ReactElement,
  { route = '/', store = makeStore(), ...options }: Options = {},
) {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <ToastProvider>{children}</ToastProvider>
      </MemoryRouter>
    </Provider>
  );

  return { store, ...render(ui, { wrapper: Wrapper, ...options }) };
}
