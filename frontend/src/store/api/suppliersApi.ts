import { baseApi } from './baseApi';
import { Supplier, PaginatedResponse } from '../../types';

export const suppliersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSuppliers: builder.query<PaginatedResponse<Supplier>, Record<string, any>>({
      query: (params) => ({
        url: '/suppliers',
        method: 'GET',
        params,
      }),
      providesTags: ['Supplier'],
    }),
    getSupplierById: builder.query<Supplier, string>({
      query: (id) => ({
        url: `/suppliers/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Supplier', id }],
    }),
    createSupplier: builder.mutation<Supplier, Partial<Supplier>>({
      query: (body) => ({
        url: '/suppliers',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Supplier'],
    }),
    updateSupplier: builder.mutation<Supplier, { id: string; data: Partial<Supplier> }>({
      query: ({ id, data }) => ({
        url: `/suppliers/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Supplier', id }, 'Supplier'],
    }),
  }),
});

export const {
  useGetSuppliersQuery,
  useGetSupplierByIdQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
} = suppliersApi;
