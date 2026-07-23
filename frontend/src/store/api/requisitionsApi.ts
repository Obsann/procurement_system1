import { baseApi } from './baseApi';
import { type PurchaseRequisition, type PaginatedResponse } from '../../types';

export const requisitionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRequisitions: builder.query<PaginatedResponse<PurchaseRequisition>, Record<string, any>>({
      query: (params) => ({
        url: '/requisitions',
        method: 'GET',
        params,
      }),
      providesTags: ['Requisition'],
    }),
    getRequisitionById: builder.query<PurchaseRequisition, string>({
      query: (id) => ({
        url: `/requisitions/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Requisition', id }],
    }),
    createRequisition: builder.mutation<PurchaseRequisition, Partial<PurchaseRequisition>>({
      query: (body) => ({
        url: '/requisitions',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Requisition'],
    }),
    updateRequisition: builder.mutation<PurchaseRequisition, { id: string; data: Partial<PurchaseRequisition> }>({
      query: ({ id, data }) => ({
        url: `/requisitions/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Requisition', id }, 'Requisition'],
    }),
    deleteRequisition: builder.mutation<void, string>({
      query: (id) => ({
        url: `/requisitions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Requisition'],
    }),
    submitRequisition: builder.mutation<PurchaseRequisition, string>({
      query: (id) => ({
        url: `/requisitions/${id}/submit`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Requisition', id }, 'Requisition'],
    }),
  }),
});

export const {
  useGetRequisitionsQuery,
  useGetRequisitionByIdQuery,
  useCreateRequisitionMutation,
  useUpdateRequisitionMutation,
  useDeleteRequisitionMutation,
  useSubmitRequisitionMutation,
} = requisitionsApi;
