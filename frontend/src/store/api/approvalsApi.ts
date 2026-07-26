import { baseApi } from './baseApi';
import { type PaginatedResponse } from '../../types';

export type ApprovalEntityType = 'PR' | 'PO';
export type ApprovalAction = 'APPROVE' | 'REJECT' | 'RETURN';

export interface Approval {
  id: string;
  entity_type: ApprovalEntityType;
  entity_id: string;
  approver: string;
  approver_name: string;
  role: string;
  action: ApprovalAction;
  comment: string;
  previous_status: string;
  new_status: string;
  created_at: string;
}

interface DecisionRequest {
  entity_type: ApprovalEntityType;
  entity_id: string;
  comment?: string;
}

const decision = (action: 'approve' | 'return-entity' | 'reject') => (body: DecisionRequest) => ({
  url: `/approvals/${action}/`,
  method: 'POST' as const,
  data: body,
});

export const approvalsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getApprovals: builder.query<
      PaginatedResponse<Approval>,
      { entity_type?: ApprovalEntityType; entity_id?: string } | void
    >({
      query: (params) => ({ url: '/approvals/', method: 'GET', params: params ?? undefined }),
      providesTags: ['Approval'],
    }),
    approveEntity: builder.mutation<unknown, DecisionRequest>({
      query: decision('approve'),
      invalidatesTags: ['Approval', 'Requisition', 'Order'],
    }),
    returnEntity: builder.mutation<unknown, DecisionRequest>({
      query: decision('return-entity'),
      invalidatesTags: ['Approval', 'Requisition', 'Order'],
    }),
    rejectEntity: builder.mutation<unknown, DecisionRequest>({
      query: decision('reject'),
      invalidatesTags: ['Approval', 'Requisition', 'Order'],
    }),
  }),
});

export const {
  useGetApprovalsQuery,
  useApproveEntityMutation,
  useReturnEntityMutation,
  useRejectEntityMutation,
} = approvalsApi;
