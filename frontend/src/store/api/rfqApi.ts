import { baseApi } from './baseApi';
import { RFQ, PaginatedResponse } from '../../types';

export const rfqApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRFQs: builder.query<PaginatedResponse<RFQ>, Record<string, any>>({
      query: (params) => ({
        url: '/rfqs',
        method: 'GET',
        params,
      }),
      providesTags: ['RFQ'],
    }),
    getRFQById: builder.query<RFQ, string>({
      query: (id) => ({
        url: `/rfqs/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'RFQ', id }],
    }),
    createRFQ: builder.mutation<RFQ, Partial<RFQ>>({
      query: (body) => ({
        url: '/rfqs',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['RFQ'],
    }),
    sendRFQ: builder.mutation<RFQ, string>({
      query: (id) => ({
        url: `/rfqs/${id}/send`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'RFQ', id }, 'RFQ'],
    }),
    closeRFQ: builder.mutation<RFQ, string>({
      query: (id) => ({
        url: `/rfqs/${id}/close`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'RFQ', id }, 'RFQ'],
    }),
  }),
});

export const {
  useGetRFQsQuery,
  useGetRFQByIdQuery,
  useCreateRFQMutation,
  useSendRFQMutation,
  useCloseRFQMutation,
} = rfqApi;
