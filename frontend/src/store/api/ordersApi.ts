import { baseApi } from './baseApi';
import { type PurchaseOrder, type PaginatedResponse } from '../../types';

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
    generateOrderFromBid: builder.mutation<PurchaseOrder, string>({
      query: (bidId) => ({
        url: '/purchase-orders/generate-from-bid/',
        method: 'POST',
        data: { bid_id: bidId },
      }),
      invalidatesTags: ['Order', 'Bid', 'RFQ'],
    }),
    submitForReview: builder.mutation<{ status: string; message: string }, string>({
      query: (id) => ({
        url: `/purchase-orders/${id}/submit-for-review/`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Order', id }, 'Order'],
    }),
    submitForFinalApproval: builder.mutation<{ status: string; message: string }, string>({
      query: (id) => ({
        url: `/purchase-orders/${id}/submit-final/`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Order', id }, 'Order'],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useGenerateOrderFromBidMutation,
  useSubmitForReviewMutation,
  useSubmitForFinalApprovalMutation,
} = ordersApi;
