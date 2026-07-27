import { baseApi } from './baseApi';

export interface DashboardStats {
  total_requisitions: number;
  pending_approvals: number;
  approved_requisitions: number;
  total_purchase_orders: number;
  po_pending_review: number;
  po_approved: number;
  goods_received: number;
  total_goods_receipts: number;
  unread_notifications: number;
  recent_requisitions: {
    id: string;
    pr_number: string;
    title: string;
    status: string;
    created_at: string;
  }[];
  recent_purchase_orders: {
    id: string;
    po_number: string;
    status: string;
    total_amount: string;
    created_at: string;
  }[];
}

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => ({ url: '/dashboard/stats/', method: 'GET' }),
      providesTags: ['Requisition', 'Order', 'Notification'],
    }),
  }),
});

export const { useGetDashboardStatsQuery } = dashboardApi;
