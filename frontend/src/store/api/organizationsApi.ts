import { baseApi } from './baseApi';
import { type PaginatedResponse } from '../../types';

export interface Department {
  id: string;
  name: string;
  code: string;
  organization: string;
}

export interface Location {
  id: string;
  name: string;
  code?: string;
}

export const organizationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDepartments: builder.query<PaginatedResponse<Department>, void>({
      query: () => ({ url: '/organizations/departments/', method: 'GET' }),
    }),
    getLocations: builder.query<PaginatedResponse<Location>, void>({
      query: () => ({ url: '/organizations/locations/', method: 'GET' }),
    }),
  }),
});

export const { useGetDepartmentsQuery, useGetLocationsQuery } = organizationsApi;
