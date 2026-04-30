import { Link } from "react-router-dom";
import {
  useGetFeaturedProductsQuery,
  useGetPublicCategoriesQuery,
} from "../../features/api/storeApiSlice";
import { ArrowRight, Truck, Clock, Shield, Tag } from "lucide-react";
import ProductCard from "../../components/ProductCard";
import CategoryCard from "../../components/CategoryCard";
import SectionHeader from "../../components/SectionHeader";

const Home = () => {
  const {
    data: featuredProducts,
    isLoading: featuredLoading,
    isError: featuredError,
  } = useGetFeaturedProductsQuery();
  const { data: categories, isLoading: catLoading } =
    useGetPublicCategoriesQuery();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-freshblue to-freshblue-dark text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Tag className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Fresh produce delivered daily
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 font-heading">
                Fresh Groceries Delivered to Your Door
              </h1>
              <p className="text-lg md:text-xl text-blue-50 mb-8">
                Shop from our wide selection of fresh produce, dairy, meats, and
                more. Get everything you need in one convenient place.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 bg-white text-freshblue px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors"
                >
                  Shop Now
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/categories"
                  className="inline-flex items-center gap-2 border border-white text-white px-6 py-3 rounded-lg font-bold hover:bg-white/10 transition-colors"
                >
                  Browse Categories
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop"
                alt="Fresh groceries"
                className="rounded-2xl shadow-2xl"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-lg shrink-0">
                <Truck className="w-6 h-6 text-freshblue" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Free Delivery
                </h3>
                <p className="text-sm text-gray-600">On orders over Rs. 5000</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-lg shrink-0">
                <Clock className="w-6 h-6 text-freshblue" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  2-Hour Delivery
                </h3>
                <p className="text-sm text-gray-600">Fast and convenient</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-lg shrink-0">
                <Shield className="w-6 h-6 text-freshblue" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  100% Fresh Guarantee
                </h3>
                <p className="text-sm text-gray-600">Quality you can trust</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Shop by Category"
            subtitle="Browse our wide selection of fresh products"
            actionText="View All"
            actionTo="/categories"
          />

          {catLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-gray-200 animate-pulse rounded-xl"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories?.data?.slice(0, 6).map((category) => (
                <CategoryCard key={category._id} category={category} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Today's Best Deals"
            subtitle="Don't miss out on these special offers"
            actionText="View All Deals"
            actionTo="/shop"
          />

          {featuredLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-80 bg-gray-200 animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : featuredError ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                Unable to load products. Please try again later.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts?.data?.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gradient-to-r from-freshblue to-freshblue-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4 font-heading">
            Get Exclusive Offers
          </h2>
          <p className="text-blue-50 mb-8">
            Subscribe to our newsletter and get 10% off your first order
          </p>

          {/* Google Forms hidden iframe hack to prevent redirect */}
          <iframe
            name="hidden_iframe"
            id="hidden_iframe"
            style={{ display: "none" }}
          ></iframe>

          <form
            action="https://docs.google.com/forms/d/e/1FAIpQLSdeoGubrdaZvQdMD-k2mXoZS0dnrmFhbF_f-eDSimAbDxxKUg/formResponse"
            method="POST"
            target="hidden_iframe"
            onSubmit={() => {
              // We'll trust the submit works since it goes to the iframe
              setTimeout(() => {
                alert("Thank you for subscribing!"); // Simple fallback or use toast.success() if imported
              }, 500);
            }}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              name="entry.1115850298"
              placeholder="Enter your email"
              required
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button
              type="submit"
              className="bg-white text-freshblue px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors"
            >
              Subscribe
            </button>
          </form>
          <p className="text-xs text-blue-200 mt-3"></p>
        </div>
      </section>
    </div>
  );
};

export default Home;
