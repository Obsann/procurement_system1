import { baseApi } from './baseApi';
import { type PurchaseOrder, type PaginatedResponse } from '../../types';

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<PaginatedResponse<PurchaseOrder>, Record<string, any>>({
      query: (params) => ({
        url: '/orders',
        method: 'GET',
        params,
      }),
      providesTags: ['Order'],
    }),
    getOrderById: builder.query<PurchaseOrder, string>({
      query: (id) => ({
        url: `/orders/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Order', id }],
    }),
    submitForReview: builder.mutation<PurchaseOrder, string>({
      query: (id) => ({
        url: `/orders/${id}/submit-review`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Order', id }, 'Order'],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useSubmitForReviewMutation,
} = ordersApi;
