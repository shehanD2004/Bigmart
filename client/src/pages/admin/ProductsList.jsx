import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  useGetAdminProductsQuery,
  useToggleProductStatusMutation,
  useDeleteProductMutation,
} from "../../features/api/adminApiSlice";
import {
  Plus,
  Search,
  Pencil,
  Ban,
  CheckCircle,
  Package,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  Trash2,
} from "lucide-react";

const ProductsList = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading, isError, error } = useGetAdminProductsQuery({
    page,
    search: debouncedSearch,
  });

  const [toggleStatus] = useToggleProductStatusMutation();

  const handleToggleStatus = async (product) => {
    const action = product.isActive ? "deactivate" : "activate";
    if (window.confirm(`Are you sure you want to ${action} this product?`)) {
      try {
        await toggleStatus(product._id).unwrap();
      } catch (err) {
        console.error("Failed to toggle status", err);
        alert("Failed to toggle product status.");
      }
    }
  };

  const [deleteProduct] = useDeleteProductMutation();

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this product? This action cannot be undone.",
      )
    ) {
      try {
        await deleteProduct(id).unwrap();
      } catch (err) {
        console.error("Failed to delete product", err);
        alert("Failed to delete product.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin text-electric w-12 h-12" />
        <span className="ml-4 text-slate-500 font-medium text-lg">
          Loading products...
        </span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 bg-white rounded-2xl shadow-sm border border-rose-100 flex flex-col items-center justify-center h-64">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Failed to load products
        </h2>
        <p className="text-slate-500">
          {error?.data?.message || "Something went wrong. Please try again."}
        </p>
      </div>
    );
  }

  const products = data?.data || data?.products || [];
  const pagination = data?.pagination || {
    page: data?.page || 1,
    pages: data?.pages || 1,
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
            Products
          </h1>
          <p className="text-slate-500 mt-1">
            Manage your catalog, pricing, and inventory.
          </p>
        </div>

        <Link
          to="/admin/products/new"
          className="bg-electric hover:bg-electric-dark text-white px-5 py-2.5 rounded-xl font-semibold flex items-center transition-colors shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Product
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric transition-all text-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {products.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <Package className="w-16 h-16 text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                No products found
              </h3>
              <p className="text-slate-500 mb-6">
                We couldn't find any products matching your criteria.
              </p>
              <Link
                to="/admin/products/new"
                className="text-electric font-semibold hover:text-electric-dark"
              >
                + Add a new product
              </Link>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                  <th className="p-4 px-6 w-16">Image</th>
                  <th className="p-4 px-6">Product details</th>
                  <th className="p-4 px-6">SKU</th>
                  <th className="p-4 px-6 text-right">Price</th>
                  <th className="p-4 px-6 text-center">Status</th>
                  <th className="p-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                  <tr
                    key={product._id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="p-4 px-6">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                        {product.images?.[0]?.url ? (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-slate-300" />
                        )}
                      </div>
                    </td>
                    <td className="p-4 px-6">
                      <div className="font-bold text-slate-900 leading-tight">
                        {product.name}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {product.category?.name || "Uncategorized"}
                      </div>
                    </td>
                    <td className="p-4 px-6 font-mono text-sm text-slate-500">
                      {product.sku}
                    </td>
                    <td className="p-4 px-6 text-right font-medium text-slate-900">
                      Rs. {product.pricePerUnit?.toFixed(2)} / {product.unit || 'pack'}
                    </td>
                    <td className="p-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold leading-none ${
                          product.isActive
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          to={`/admin/products/${product._id}/edit`}
                          className="p-2 text-slate-400 hover:text-electric hover:bg-electric/10 rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(product)}
                          className={`p-2 rounded-lg transition-colors ${
                            product.isActive
                              ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                          }`}
                          title={
                            product.isActive
                              ? "Deactivate Product"
                              : "Activate Product"
                          }
                        >
                          {product.isActive ? (
                            <Ban className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
            <span className="text-sm text-slate-500 font-medium">
              Page <span className="text-slate-900">{pagination.page}</span> of{" "}
              <span className="text-slate-900">{pagination.pages}</span>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setPage((p) => Math.min(pagination.pages, p + 1))
                }
                disabled={page === pagination.pages}
                className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsList;
