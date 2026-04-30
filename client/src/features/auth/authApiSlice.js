import { apiSlice } from '../api/apiSlice';

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    login: builder.mutation({
      query: credentials => ({
        url: '/auth/login',
        method: 'POST',
        body: { ...credentials },
      }),
    }),
    register: builder.mutation({
      query: userData => ({
        url: '/auth/register',
        method: 'POST',
        body: { ...userData },
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),
    verifyEmail: builder.query({
      query: (token) => `/auth/verify-email/${token}`,
    }),
    getMe: builder.query({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation({
      query: (data) => ({
        url: '/auth/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    updatePassword: builder.mutation({
      query: (data) => ({
        url: '/auth/password',
        method: 'PUT',
        body: data,
      }),
    }),
    getAddresses: builder.query({
      query: () => '/auth/addresses',
      providesTags: ['Address'],
    }),
    addAddress: builder.mutation({
      query: (data) => ({
        url: '/auth/addresses',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Address'],
    }),
    deleteAddress: builder.mutation({
      query: (id) => ({
        url: `/auth/addresses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Address'],
    }),
    setDefaultAddress: builder.mutation({
      query: (id) => ({
        url: `/auth/addresses/${id}/default`,
        method: 'PUT',
      }),
      invalidatesTags: ['Address'],
    }),
  }),
});

export const { 
  useLoginMutation, 
  useRegisterMutation, 
  useLogoutMutation, 
  useGetMeQuery,
  useUpdateProfileMutation,
  useUpdatePasswordMutation,
  useGetAddressesQuery,
  useAddAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
  useVerifyEmailQuery
} = authApiSlice;
