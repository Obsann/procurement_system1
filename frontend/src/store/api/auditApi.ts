import { baseApi } from './baseApi';
import { AuditLog, PaginatedResponse } from '../../types';

export const auditApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query<PaginatedResponse<AuditLog>, Record<string, any>>({
      query: (params) => ({
        url: '/audit-logs/',
        method: 'GET',
        params,
      }),
      providesTags: ['Audit'],
    }),
  }),
});

export const { useGetAuditLogsQuery } = auditApi;
