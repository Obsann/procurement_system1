import { baseApi } from './baseApi';
import { type PaginatedResponse } from '../../types';

export interface Supplier {
  id: string;
  supplier_code: string;
  legal_name: string;
  tax_id?: string;
  status: string;
  city?: string;
  country?: string;
}

export const suppliersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSuppliers: builder.query<PaginatedResponse<Supplier>, void>({
      query: () => ({ url: '/suppliers/', method: 'GET' }),
      providesTags: ['Supplier'],
    }),
    createSupplier: builder.mutation<Supplier, Partial<Supplier>>({
      query: (newSupplier) => ({
        url: '/suppliers/',
        method: 'POST',
        // The axios base query reads `data`; `body` would send an empty payload.
        data: newSupplier,
      }),
      invalidatesTags: ['Supplier'],
    }),
  }),
});

export const { useGetSuppliersQuery, useCreateSupplierMutation } = suppliersApi;
