import { apiSlice } from './apiSlice';

export const adminApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getDashboardStats: builder.query({
      query: () => '/dashboard/stats',
      providesTags: ['Product', 'Order', 'User', 'Warehouse', 'Supplier', 'Vehicle'],
    }),
    getOrders: builder.query({
      query: (params) => {
         const q = new URLSearchParams();
         if(params?.page) q.append('page', params.page);
         if(params?.status) q.append('orderStatus', params.status);
         if(params?.paymentStatus) q.append('paymentStatus', params.paymentStatus);
         if(params?.search) q.append('search', params.search);
         if(params?.customer) q.append('customer', params.customer);
         return `/orders?${q.toString()}`;
      },
      providesTags: ['Order'],
    }),
    createOrder: builder.mutation({
      query: (orderData) => ({
        url: '/orders',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Order', 'Product'],
    }),
    updateOrderStatus: builder.mutation({
      query: ({id, status, note}) => ({
        url: `/orders/${id}/status`,
        method: 'PUT',
        body: {status, note},
      }),
      invalidatesTags: ['Order'],
    }),
    getAdminProducts: builder.query({
      query: ({ page = 1, search = '', limit = 100 }) => `/products?page=${page}&search=${search}&limit=${limit}`,
      providesTags: (result) =>
        result && result.data
          ? [
              ...result.data.map(({ _id }) => ({
                type: 'Product',
                id: _id,
              })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),
    createProduct: builder.mutation({
      query: (data) => ({
        url: '/products',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),
    updateProduct: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),
    toggleProductStatus: builder.mutation({
      query: (id) => ({
        url: `/products/${id}/status`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),
    getCategories: builder.query({
      query: () => '/categories/flat',
      providesTags: ['Category'],
    }),
    getProductById: builder.query({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
    createCategory: builder.mutation({
      query: (data) => ({
        url: '/categories',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Category'],
    }),
    updateCategory: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Category', id }, 'Category'],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),
    getReturns: builder.query({
      query: (params) => {
         const q = new URLSearchParams();
         if(params?.page) q.append('page', params.page);
         if(params?.status) q.append('status', params.status);
         return `/returns?${q.toString()}`;
      },
      providesTags: ['Order'], // Using Order tag or creating a new Return tag; using Order since it's related
    }),
    updateReturnStatus: builder.mutation({
      query: ({id, status, notes, refundAmount, refundMethod}) => ({
        url: `/returns/${id}`,
        method: 'PUT',
        body: { status, notes, refundAmount, refundMethod },
      }),
      invalidatesTags: ['Order'],
    }),

    // ========== SUPPLIER ENDPOINTS ==========
    getSuppliers: builder.query({
      query: (params) => {
        const q = new URLSearchParams();
        if (params?.page) q.append('page', params.page);
        if (params?.search) q.append('search', params.search);
        if (params?.isActive !== undefined) q.append('isActive', params.isActive);
        return `/suppliers?${q.toString()}`;
      },
      providesTags: ['Supplier'],
    }),
    getSupplier: builder.query({
      query: (id) => `/suppliers/${id}`,
      providesTags: (r, e, id) => [{ type: 'Supplier', id }],
    }),
    createSupplier: builder.mutation({
      query: (data) => ({ url: '/suppliers', method: 'POST', body: data }),
      invalidatesTags: ['Supplier'],
    }),
    updateSupplier: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/suppliers/${id}`, method: 'PUT', body: data }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Supplier', id }, 'Supplier'],
    }),
    toggleSupplierStatus: builder.mutation({
      query: (id) => ({ url: `/suppliers/${id}/status`, method: 'PATCH' }),
      invalidatesTags: (r, e, id) => [{ type: 'Supplier', id }, 'Supplier'],
    }),
    deleteSupplier: builder.mutation({
      query: (id) => ({ url: `/suppliers/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Supplier'],
    }),
    getSupplierPerformance: builder.query({
      query: (id) => `/suppliers/${id}/performance`,
      providesTags: (r, e, id) => [{ type: 'Supplier', id }],
    }),

    // ========== SUPPLIER-PRODUCT ENDPOINTS ==========
    getSupplierProducts: builder.query({
      query: (supplierId) => `/supplier-products/supplier/${supplierId}`,
      providesTags: ['Supplier'],
    }),
    getProductSuppliers: builder.query({
      query: (productId) => `/supplier-products/product/${productId}`,
      providesTags: ['Supplier'],
    }),
    upsertSupplierProduct: builder.mutation({
      query: (data) => ({ url: '/supplier-products', method: 'POST', body: data }),
      invalidatesTags: ['Supplier'],
    }),
    updateSupplierProduct: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/supplier-products/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Supplier'],
    }),
    deleteSupplierProduct: builder.mutation({
      query: (id) => ({ url: `/supplier-products/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Supplier'],
    }),
    getBestSupplier: builder.query({
      query: (productId) => `/supplier-products/best/${productId}`,
    }),

    // ========== WAREHOUSE ENDPOINTS ==========
    getWarehouses: builder.query({
      query: () => '/warehouses',
      providesTags: ['Warehouse'],
    }),
    getWarehouse: builder.query({
      query: (id) => `/warehouses/${id}`,
      providesTags: (r, e, id) => [{ type: 'Warehouse', id }],
    }),
    createWarehouse: builder.mutation({
      query: (data) => ({ url: '/warehouses', method: 'POST', body: data }),
      invalidatesTags: ['Warehouse'],
    }),
    updateWarehouse: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/warehouses/${id}`, method: 'PUT', body: data }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Warehouse', id }, 'Warehouse'],
    }),

    // ========== STOCK MOVEMENT ENDPOINTS ==========
    getStockMovements: builder.query({
      query: (params) => {
        const q = new URLSearchParams();
        if (params?.page) q.append('page', params.page);
        if (params?.search) q.append('search', params.search);
        if (params?.type) q.append('type', params.type);
        if (params?.warehouse) q.append('warehouse', params.warehouse);
        if (params?.product) q.append('product', params.product);
        return `/stock-movements?${q.toString()}`;
      },
      providesTags: ['StockMovement'],
    }),
    createStockMovement: builder.mutation({
      query: (data) => ({ url: '/stock-movements', method: 'POST', body: data }),
      invalidatesTags: ['StockMovement', 'Product', 'Warehouse'],
    }),

    // ========== PURCHASE ORDER ENDPOINTS ==========
    getPurchaseOrders: builder.query({
      query: (params) => {
        const q = new URLSearchParams();
        if (params?.page) q.append('page', params.page);
        if (params?.status) q.append('status', params.status);
        if (params?.supplier) q.append('supplier', params.supplier);
        if (params?.search) q.append('search', params.search);
        return `/purchase-orders?${q.toString()}`;
      },
      providesTags: ['Supplier'],
    }),
    getPurchaseOrder: builder.query({
      query: (id) => `/purchase-orders/${id}`,
      providesTags: (r, e, id) => [{ type: 'Supplier', id }],
    }),
    createPurchaseOrder: builder.mutation({
      query: (data) => ({ url: '/purchase-orders', method: 'POST', body: data }),
      invalidatesTags: ['Supplier'],
    }),
    updatePurchaseOrder: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/purchase-orders/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Supplier'],
    }),
    updatePOStatus: builder.mutation({
      query: ({ id, status, note, receivedItems }) => ({
        url: `/purchase-orders/${id}/status`,
        method: 'PUT',
        body: { status, note, receivedItems },
      }),
      invalidatesTags: ['Supplier', 'Product', 'Warehouse'],
    }),
    autoGeneratePOs: builder.mutation({
      query: () => ({ url: '/purchase-orders/auto-generate', method: 'POST' }),
      invalidatesTags: ['Supplier'],
    }),

    // ========== SUPPLIER DELIVERY ENDPOINTS ==========
    getSupplierDeliveries: builder.query({
      query: (params) => {
        const q = new URLSearchParams();
        if (params?.page) q.append('page', params.page);
        if (params?.supplier) q.append('supplier', params.supplier);
        if (params?.status) q.append('status', params.status);
        if (params?.purchaseOrder) q.append('purchaseOrder', params.purchaseOrder);
        return `/supplier-deliveries?${q.toString()}`;
      },
      providesTags: ['Delivery'],
    }),
    getSupplierDelivery: builder.query({
      query: (id) => `/supplier-deliveries/${id}`,
      providesTags: (r, e, id) => [{ type: 'Delivery', id }],
    }),
    createSupplierDelivery: builder.mutation({
      query: (data) => ({ url: '/supplier-deliveries', method: 'POST', body: data }),
      invalidatesTags: ['Delivery', 'Supplier', 'Product'],
    }),
    updateSupplierDelivery: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/supplier-deliveries/${id}`, method: 'PUT', body: data }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Delivery', id }, 'Delivery'],
    }),
    deleteSupplierDelivery: builder.mutation({
      query: (id) => ({ url: `/supplier-deliveries/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Delivery'],
    }),

    // ========== SUPPLIER INVOICE ENDPOINTS ==========
    getSupplierInvoices: builder.query({
      query: (params) => {
        const q = new URLSearchParams();
        if (params?.page) q.append('page', params.page);
        if (params?.supplier) q.append('supplier', params.supplier);
        if (params?.status) q.append('status', params.status);
        if (params?.purchaseOrder) q.append('purchaseOrder', params.purchaseOrder);
        return `/supplier-invoices?${q.toString()}`;
      },
      providesTags: ['Invoice'],
    }),
    getSupplierInvoice: builder.query({
      query: (id) => `/supplier-invoices/${id}`,
      providesTags: (r, e, id) => [{ type: 'Invoice', id }],
    }),
    createSupplierInvoice: builder.mutation({
      query: (data) => ({ url: '/supplier-invoices', method: 'POST', body: data }),
      invalidatesTags: ['Invoice'],
    }),
    updateSupplierInvoice: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/supplier-invoices/${id}`, method: 'PUT', body: data }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Invoice', id }, 'Invoice'],
    }),
    updateInvoiceStatus: builder.mutation({
      query: ({ id, status, paymentMethod, paidDate }) => ({
        url: `/supplier-invoices/${id}/status`,
        method: 'PATCH',
        body: { status, paymentMethod, paidDate },
      }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Invoice', id }, 'Invoice'],
    }),
    deleteSupplierInvoice: builder.mutation({
      query: (id) => ({ url: `/supplier-invoices/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Invoice'],
    }),

    // ========== FLEET & STAFF ENDPOINTS ==========
    getVehicles: builder.query({
      query: (params) => {
        const q = new URLSearchParams();
        if (params?.page) q.append('page', params.page);
        if (params?.status) q.append('status', params.status);
        if (params?.search) q.append('search', params.search);
        return `/vehicles?${q.toString()}`;
      },
      providesTags: ['Vehicle'],
    }),
    getStaff: builder.query({
      query: (params) => {
        const q = new URLSearchParams();
        if (params?.page) q.append('page', params.page);
        if (params?.role) q.append('role', params.role);
        if (params?.search) q.append('search', params.search);
        return `/staff?${q.toString()}`;
      },
      providesTags: ['Staff'],
    }),
    getVehicleAssignments: builder.query({
      query: () => '/vehicle-assignments',
      providesTags: ['VehicleAssignment'],
    }),
    getDeliveryTrips: builder.query({
      query: () => '/delivery-trips',
      providesTags: ['DeliveryTrip'],
    }),
    getMaintenanceLogs: builder.query({
      query: () => '/maintenance-logs',
      providesTags: ['MaintenanceLog'],
    }),
    getAttendanceLogs: builder.query({
      query: () => '/attendance',
      providesTags: ['Attendance'],
    }),
    createVehicle: builder.mutation({
      query: (data) => ({ url: '/vehicles', method: 'POST', body: data }),
      invalidatesTags: ['Vehicle'],
    }),
    updateVehicle: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/vehicles/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Vehicle'],
    }),
    deleteVehicle: builder.mutation({
      query: (id) => ({ url: `/vehicles/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Vehicle'],
    }),
    createStaff: builder.mutation({
      query: (data) => ({ url: '/staff', method: 'POST', body: data }),
      invalidatesTags: ['Staff'],
    }),
    updateStaff: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/staff/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Staff'],
    }),
    deleteStaff: builder.mutation({
      query: (id) => ({ url: `/staff/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Staff'],
    }),
    createVehicleAssignment: builder.mutation({
      query: (data) => ({ url: '/vehicle-assignments', method: 'POST', body: data }),
      invalidatesTags: ['VehicleAssignment'],
    }),
    updateVehicleAssignment: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/vehicle-assignments/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['VehicleAssignment'],
    }),
    deleteVehicleAssignment: builder.mutation({
      query: (id) => ({ url: `/vehicle-assignments/${id}`, method: 'DELETE' }),
      invalidatesTags: ['VehicleAssignment'],
    }),
    createDeliveryTrip: builder.mutation({
      query: (data) => ({ url: '/delivery-trips', method: 'POST', body: data }),
      invalidatesTags: ['DeliveryTrip'],
    }),
    updateDeliveryTrip: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/delivery-trips/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['DeliveryTrip'],
    }),
    deleteDeliveryTrip: builder.mutation({
      query: (id) => ({ url: `/delivery-trips/${id}`, method: 'DELETE' }),
      invalidatesTags: ['DeliveryTrip'],
    }),
    createMaintenanceLog: builder.mutation({
      query: (data) => ({ url: '/maintenance-logs', method: 'POST', body: data }),
      invalidatesTags: ['MaintenanceLog'],
    }),
    updateMaintenanceLog: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/maintenance-logs/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['MaintenanceLog'],
    }),
    deleteMaintenanceLog: builder.mutation({
      query: (id) => ({ url: `/maintenance-logs/${id}`, method: 'DELETE' }),
      invalidatesTags: ['MaintenanceLog'],
    }),
    createAttendanceLog: builder.mutation({
      query: (data) => ({ url: '/attendance', method: 'POST', body: data }),
      invalidatesTags: ['Attendance'],
    }),
    updateAttendanceLog: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/attendance/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Attendance'],
    }),
    deleteAttendanceLog: builder.mutation({
      query: (id) => ({ url: `/attendance/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Attendance'],
    }),

    // ========== USERS MANAGEMENT ENDPOINTS ==========
    getUsers: builder.query({
      query: (params) => {
        const q = new URLSearchParams();
        if (params?.page) q.append('page', params.page);
        if (params?.search) q.append('search', params.search);
        if (params?.role) q.append('role', params.role);
        if (params?.isActive !== undefined) q.append('isActive', params.isActive);
        return `/users?${q.toString()}`;
      },
      providesTags: ['User'],
    }),
    createUser: builder.mutation({
      query: (data) => ({ url: '/users', method: 'POST', body: data }),
      invalidatesTags: ['User'],
    }),
    updateUser: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/users/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['User'],
    }),
    toggleUserStatus: builder.mutation({
      query: ({ id, isActive }) => ({
        url: `/users/${id}/status`,
        method: 'PATCH',
        body: { isActive },
      }),
      invalidatesTags: ['User'],
    }),
    resetUserPassword: builder.mutation({
      query: ({ id, newPassword }) => ({
        url: `/users/${id}/reset-password`,
        method: 'PATCH',
        body: { newPassword },
      }),
      // no need to invalidate tags since this doesn't change queryable user data
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetOrdersQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
  useGetAdminProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useToggleProductStatusMutation,
  useDeleteProductMutation,
  useGetCategoriesQuery,
  useGetProductByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetReturnsQuery,
  useUpdateReturnStatusMutation,
  // Supplier
  useGetSuppliersQuery,
  useGetSupplierQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useToggleSupplierStatusMutation,
  useDeleteSupplierMutation,
  useGetSupplierPerformanceQuery,
  // Supplier-Product
  useGetSupplierProductsQuery,
  useGetProductSuppliersQuery,
  useUpsertSupplierProductMutation,
  useUpdateSupplierProductMutation,
  useDeleteSupplierProductMutation,
  useGetBestSupplierQuery,
  // Purchase Orders
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrderQuery,
  useCreatePurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
  useUpdatePOStatusMutation,
  useAutoGeneratePOsMutation,
  // Warehouse
  useGetWarehousesQuery,
  useGetWarehouseQuery,
  useCreateWarehouseMutation,
  useUpdateWarehouseMutation,
  // Stock Movements
  useGetStockMovementsQuery,
  useCreateStockMovementMutation,
  // Supplier Deliveries
  useGetSupplierDeliveriesQuery,
  useGetSupplierDeliveryQuery,
  useCreateSupplierDeliveryMutation,
  useUpdateSupplierDeliveryMutation,
  useDeleteSupplierDeliveryMutation,
  // Supplier Invoices
  useGetSupplierInvoicesQuery,
  useGetSupplierInvoiceQuery,
  useCreateSupplierInvoiceMutation,
  useUpdateSupplierInvoiceMutation,
  useUpdateInvoiceStatusMutation,
  useDeleteSupplierInvoiceMutation,
  // Fleet & Staff Queries
  useGetVehiclesQuery,
  useGetStaffQuery,
  useGetVehicleAssignmentsQuery,
  useGetDeliveryTripsQuery,
  useGetMaintenanceLogsQuery,
  useGetAttendanceLogsQuery,
  
  // Fleet & Staff Mutations
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
  useDeleteVehicleMutation,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
  useCreateVehicleAssignmentMutation,
  useUpdateVehicleAssignmentMutation,
  useDeleteVehicleAssignmentMutation,
  useCreateDeliveryTripMutation,
  useUpdateDeliveryTripMutation,
  useDeleteDeliveryTripMutation,
  useCreateMaintenanceLogMutation,
  useUpdateMaintenanceLogMutation,
  useDeleteMaintenanceLogMutation,
  useCreateAttendanceLogMutation,
  useUpdateAttendanceLogMutation,
  useDeleteAttendanceLogMutation,
  // Users
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useToggleUserStatusMutation,
  useResetUserPasswordMutation,
} = adminApiSlice;
