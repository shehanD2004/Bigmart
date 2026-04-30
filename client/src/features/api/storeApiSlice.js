import { apiSlice } from './apiSlice';

export const storeApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getPublicProducts: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page);
        if (params?.category) queryParams.append('category', params.category);
        if (params?.search) queryParams.append('search', params.search);
        if (params?.sort) queryParams.append('sort', params.sort);
        return `/store/products?${queryParams.toString()}`;
      },
      providesTags: (result) => result ? [...result.data.map(({ id }) => ({ type: 'Product', id })), 'Product'] : ['Product'],
    }),
    getProductBySlug: builder.query({
      query: (slug) => `/store/products/${slug}`,
      providesTags: (result, error, arg) => [{ type: 'Product', id: arg }],
    }),
    getPublicCategories: builder.query({
      query: () => `/store/categories`,
      providesTags: ['Category'],
    }),
    getFeaturedProducts: builder.query({
      query: () => `/store/featured`,
      providesTags: ['Product'],
    }),
    createOrder: builder.mutation({
      query: (orderData) => ({
        url: '/orders',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Product', 'Order'], // Invalidate products to refresh stock
    }),
    getMyOrders: builder.query({
      query: () => '/orders/my',
      providesTags: ['Order'],
    }),
    getMyReturns: builder.query({
      query: () => '/returns/my',
      providesTags: ['Return'],
    }),
    trackOrder: builder.query({
      query: (orderNumber) => `/orders/track/${orderNumber}`,
    }),
  }),
});

export const {
  useGetPublicProductsQuery,
  useGetProductBySlugQuery,
  useGetPublicCategoriesQuery,
  useGetFeaturedProductsQuery,
  useCreateOrderMutation,
  useGetMyOrdersQuery,
  useGetMyReturnsQuery,
  useTrackOrderQuery
} = storeApiSlice;
