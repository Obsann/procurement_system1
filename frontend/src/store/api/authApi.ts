import { baseApi } from './baseApi';
import { LoginRequest, User } from '../../types';

export interface TokenPair { access: string; refresh: string; }

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<TokenPair, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login/',
        method: 'POST',
        data: credentials,
      }),
    }),
    getProfile: builder.query<User, void>({
      query: () => ({
        url: '/auth/profile/',
        method: 'GET',
      }),
      providesTags: ['User'],
    }),
  }),
});

export const { useLoginMutation, useGetProfileQuery } = authApi;
