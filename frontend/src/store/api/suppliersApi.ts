import { baseApi } from './baseApi';
import { type PaginatedResponse } from '../../types';

export interface SupplierContact {
  id: string;
  supplier: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  is_primary: boolean;
}

export interface Supplier {
  id: string;
  supplier_code: string;
  legal_name: string;
  display_name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  tax_id: string;
  status: string;
  categories: string;
  notes: string;
  contacts: SupplierContact[];
  created_at: string;
}

export const suppliersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSuppliers: builder.query<PaginatedResponse<Supplier>, Record<string, unknown> | void>({
      query: (params) => ({ url: '/suppliers/', method: 'GET', params: params ?? undefined }),
      providesTags: ['Supplier'],
    }),
    getSupplierById: builder.query<Supplier, string>({
      query: (id) => ({ url: `/suppliers/${id}/`, method: 'GET' }),
      providesTags: (_result, _error, id) => [{ type: 'Supplier', id }],
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
    updateSupplier: builder.mutation<Supplier, { id: string; data: Partial<Supplier> }>({
      query: ({ id, data }) => ({
        url: `/suppliers/${id}/`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Supplier', id }, 'Supplier'],
    }),
    deleteSupplier: builder.mutation<void, string>({
      query: (id) => ({
        url: `/suppliers/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Supplier'],
    }),
  }),
});

export const {
  useGetSuppliersQuery,
  useGetSupplierByIdQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} = suppliersApi;
