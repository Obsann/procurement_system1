import { baseApi } from './baseApi';
import { type PaginatedResponse } from '../../types';

export interface FinancialReviewRecord {
  id: string;
  purchase_order: string;
  po_number?: string;
  reviewer: string;
  reviewer_name?: string;
  decision: 'APPROVED' | 'RETURNED';
  comments: string | null;
  previous_status: string | null;
  new_status: string | null;
  reviewed_at: string;
}

export interface FinancialReviewRequest {
  purchase_order: string;
  decision: 'APPROVED' | 'RETURNED';
  comments?: string;
}

export const financialReviewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFinancialReviews: builder.query<PaginatedResponse<FinancialReviewRecord>, Record<string, any>>({
      query: (params) => ({ url: '/financial-reviews/', method: 'GET', params }),
      providesTags: ['FinancialReview'],
    }),
    submitFinancialReview: builder.mutation<unknown, FinancialReviewRequest>({
      query: (body) => ({ url: '/financial-reviews/review/', method: 'POST', data: body }),
      invalidatesTags: ['FinancialReview', 'Order'],
    }),
  }),
});

export const { useGetFinancialReviewsQuery, useSubmitFinancialReviewMutation } = financialReviewsApi;
