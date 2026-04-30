import { useGetPublicCategoriesQuery } from "../../features/api/storeApiSlice";
import CategoryCard from "../../components/CategoryCard";

const Categories = () => {
  const { data: categories, isLoading, isError } = useGetPublicCategoriesQuery();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-heading mb-2">
            All Categories
          </h1>
          <p className="text-gray-600">Browse our wide selection of products</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-gray-200 animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">
              Unable to load categories. Please try again later.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-freshblue text-white px-4 py-2 rounded-lg font-medium hover:bg-freshblue-dark transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : categories?.data?.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              No categories found. Check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories?.data?.map((category) => (
              <CategoryCard key={category._id} category={category} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
