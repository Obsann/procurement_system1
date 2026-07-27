import { baseApi } from './baseApi';
import { type RFQ, type RFQInput, type PaginatedResponse } from '../../types';

// Every path keeps its trailing slash. Django's APPEND_SLASH turns a slashless
// POST into a redirect that drops the request body.
export const rfqApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRFQs: builder.query<PaginatedResponse<RFQ>, Record<string, unknown> | void>({
      query: (params) => ({ url: '/rfqs/', method: 'GET', params: params ?? undefined }),
      providesTags: ['RFQ'],
    }),
    getRFQById: builder.query<RFQ, string>({
      query: (id) => ({ url: `/rfqs/${id}/`, method: 'GET' }),
      providesTags: (_result, _error, id) => [{ type: 'RFQ', id }],
    }),
    createRFQ: builder.mutation<RFQ, RFQInput>({
      query: (data) => ({ url: '/rfqs/', method: 'POST', data }),
      invalidatesTags: ['RFQ'],
    }),
    sendRFQ: builder.mutation<{ status: string; message: string }, string>({
      query: (id) => ({ url: `/rfqs/${id}/send/`, method: 'POST' }),
      invalidatesTags: (_result, _error, id) => [{ type: 'RFQ', id }, 'RFQ'],
    }),
    closeRFQ: builder.mutation<{ status: string; message: string }, string>({
      query: (id) => ({ url: `/rfqs/${id}/close/`, method: 'POST' }),
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
