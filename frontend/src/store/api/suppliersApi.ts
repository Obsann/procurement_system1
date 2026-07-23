import { baseApi } from './baseApi';

// Match the shape of Obsan's PaginatedResponse
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

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
    // Use PaginatedResponse<Supplier> as the return type
    // To this:
    getSuppliers: builder.query<PaginatedResponse<Supplier>, void>({
      query: () => {
        return { url: '/suppliers/' };
      },
    }),
    createSupplier: builder.mutation<Supplier, Partial<Supplier>>({
      query: (newSupplier) => ({
        url: '/suppliers/',
        method: 'POST',
        body: newSupplier,
      }),
    }),
  }),
});

export const { useGetSuppliersQuery, useCreateSupplierMutation } = suppliersApi;