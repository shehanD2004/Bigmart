import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useGetPublicProductsQuery } from "../../features/api/storeApiSlice";
import { Search, Filter } from "lucide-react";
import ProductCard from "../../components/ProductCard";

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryId = searchParams.get("category") || "";
  const initialSearch = searchParams.get("search") || "";

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      if (searchTerm) {
        searchParams.set("search", searchTerm);
      } else {
        searchParams.delete("search");
      }
      setSearchParams(searchParams);
    }, 500);
    return () => clearTimeout(t);
  }, [searchTerm, searchParams, setSearchParams]);

  const {
    data: productsData,
    isLoading,
    isError,
  } = useGetPublicProductsQuery({
    category: categoryId,
    search: debouncedSearch,
  });

  const products = productsData?.data || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 font-heading">
            All Products
          </h1>
          <p className="text-gray-600">
            Showing {products.length} product{products.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-freshblue/30 focus:border-freshblue transition-all text-sm"
            />
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                <div className="aspect-square bg-gray-200 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-gray-200 animate-pulse rounded w-1/3" />
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
                  <div className="h-5 bg-gray-200 animate-pulse rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">
              Something went wrong loading products.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-freshblue text-white px-4 py-2 rounded-lg font-medium hover:bg-freshblue-dark transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Filter className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600 mb-4">Try adjusting your search</p>
            <button
              onClick={() => {
                setSearchTerm("");
                searchParams.delete("search");
                searchParams.delete("category");
                setSearchParams(searchParams);
              }}
              className="bg-freshblue text-white px-4 py-2 rounded-lg font-medium hover:bg-freshblue-dark transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
