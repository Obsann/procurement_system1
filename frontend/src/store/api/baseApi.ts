import { createApi, BaseQueryFn } from '@reduxjs/toolkit/query/react';
import { AxiosRequestConfig, AxiosError } from 'axios';
import api from '../../lib/api';

const axiosBaseQuery =
  (): BaseQueryFn<
    {
      url: string;
      method?: AxiosRequestConfig['method'];
      data?: AxiosRequestConfig['data'];
      params?: AxiosRequestConfig['params'];
      headers?: AxiosRequestConfig['headers'];
    },
    unknown,
    unknown
  > =>
  async ({ url, method = 'GET', data, params, headers }) => {
    try {
      const result = await api({
        url,
        method,
        data,
        params,
        headers,
      });
      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError as AxiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };

export const baseApi = createApi({
  baseQuery: axiosBaseQuery(),
  endpoints: () => ({}),
  tagTypes: ['User', 'Requisition', 'RFQ', 'Order', 'Supplier', 'Audit', 'Notification'],
});
