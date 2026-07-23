import { baseApi } from './baseApi';
import { Notification, PaginatedResponse } from '../../types';

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<PaginatedResponse<Notification>, Record<string, any>>({
      query: (params) => ({
        url: '/notifications',
        method: 'GET',
        params,
      }),
      providesTags: ['Notification'],
    }),
    markRead: builder.mutation<void, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'POST',
      }),
      invalidatesTags: ['Notification'],
    }),
    markAllRead: builder.mutation<void, void>({
      query: () => ({
        url: '/notifications/read-all',
        method: 'POST',
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkReadMutation,
  useMarkAllReadMutation,
} = notificationsApi;
