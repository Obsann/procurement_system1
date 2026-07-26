import { baseApi } from './baseApi';
import { type Notification, type PaginatedResponse } from '../../types';

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<PaginatedResponse<Notification>, Record<string, any>>({
      query: (params) => ({
        url: '/notifications/',
        method: 'GET',
        params,
      }),
      providesTags: ['Notification'],
    }),
    markRead: builder.mutation<void, string>({
      query: (id) => ({
        url: `/notifications/${id}/mark-read/`,
        method: 'POST',
      }),
      invalidatesTags: ['Notification'],
    }),
    markAllRead: builder.mutation<void, void>({
      query: () => ({
        url: '/notifications/mark-all-read/',
        method: 'POST',
      }),
      invalidatesTags: ['Notification'],
    }),
    // Only the paginated total is needed, so ask for the smallest page possible.
    getUnreadCount: builder.query<number, void>({
      query: () => ({
        url: '/notifications/',
        method: 'GET',
        params: { is_read: false, page_size: 1 },
      }),
      transformResponse: (response: PaginatedResponse<Notification>) => response.count,
      providesTags: ['Notification'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkReadMutation,
  useMarkAllReadMutation,
  useGetUnreadCountQuery,
} = notificationsApi;
