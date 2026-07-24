import { baseApi } from './baseApi';
import { PurchaseOrder, PaginatedResponse } from '../../types';

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<PaginatedResponse<PurchaseOrder>, Record<string, any>>({
      query: (params) => ({
        url: '/purchase-orders/',
        method: 'GET',
        params,
      }),
      providesTags: ['Order'],
    }),
    getOrderById: builder.query<PurchaseOrder, string>({
      query: (id) => ({
        url: `/purchase-orders/${id}/`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Order', id }],
    }),
    submitForReview: builder.mutation<PurchaseOrder, string>({
      query: (id) => ({
        url: `/purchase-orders/${id}/submit-for-review/`,
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
