import { baseApi } from './baseApi';
import { type Bid, type BidInput, type PaginatedResponse } from '../../types';

export const bidsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBids: builder.query<PaginatedResponse<Bid>, Record<string, unknown> | void>({
      query: (params) => ({ url: '/bids/', method: 'GET', params: params ?? undefined }),
      providesTags: ['Bid'],
    }),
    createBid: builder.mutation<Bid, BidInput>({
      query: (data) => ({ url: '/bids/', method: 'POST', data }),
      invalidatesTags: ['Bid', 'RFQ'],
    }),
    selectWinner: builder.mutation<{ message: string; bid: Bid }, string>({
      query: (id) => ({ url: `/bids/${id}/select_winner/`, method: 'POST' }),
      // Awarding closes the RFQ and unseats any previous winner.
      invalidatesTags: ['Bid', 'RFQ'],
    }),
  }),
});

export const { useGetBidsQuery, useCreateBidMutation, useSelectWinnerMutation } = bidsApi;
