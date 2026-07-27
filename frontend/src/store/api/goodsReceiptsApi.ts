import { baseApi } from './baseApi';
import { type PaginatedResponse } from '../../types';

export interface GoodsReceiptRecord {
  id: string;
  purchase_order: string;
  po_number: string;
  grn_number: string;
  received_by: string;
  received_by_name: string;
  received_date: string;
  status: 'PARTIAL' | 'COMPLETE';
  notes: string;
  lines: GoodsReceiptLineRecord[];
  created_at: string;
}

export interface GoodsReceiptLineRecord {
  id: string;
  goods_receipt: string;
  po_line: string;
  expected_quantity: string;
  received_quantity: string;
  notes: string;
}

export interface GoodsReceiptInput {
  purchase_order: string;
  received_date: string;
  status: 'PARTIAL' | 'COMPLETE';
  notes?: string;
  lines: {
    po_line: string;
    expected_quantity: string;
    received_quantity: string;
    notes?: string;
  }[];
}

export const goodsReceiptsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGoodsReceipts: builder.query<PaginatedResponse<GoodsReceiptRecord>, Record<string, any>>({
      query: (params) => ({ url: '/goods-receipts/', method: 'GET', params }),
      providesTags: ['GoodsReceipt'],
    }),
    getGoodsReceiptById: builder.query<GoodsReceiptRecord, string>({
      query: (id) => ({ url: `/goods-receipts/${id}/`, method: 'GET' }),
      providesTags: (_r, _e, id) => [{ type: 'GoodsReceipt', id }],
    }),
    createGoodsReceipt: builder.mutation<GoodsReceiptRecord, GoodsReceiptInput>({
      query: (body) => ({ url: '/goods-receipts/', method: 'POST', data: body }),
      invalidatesTags: ['GoodsReceipt', 'Order'],
    }),
  }),
});

export const { useGetGoodsReceiptsQuery, useGetGoodsReceiptByIdQuery, useCreateGoodsReceiptMutation } = goodsReceiptsApi;
