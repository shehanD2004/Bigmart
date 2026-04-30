import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useGetProductBySlugQuery } from "../../features/api/storeApiSlice";
import { addToCart } from "../../features/cart/cartSlice";
import { toast } from "react-toastify";
import {
  ShoppingCart,
  ArrowLeft,
  Zap,
  Package,
  Truck,
  Shield,
} from "lucide-react";
import QuantitySelector from "../../components/QuantitySelector";

export default function ProductDetail() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    data: productData,
    isLoading,
    isError,
  } = useGetProductBySlugQuery(slug);
  const product = productData?.data;
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      setQuantity(product.sellingType === "weight" ? 0.25 : 1);
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-8 w-20 bg-gray-200 animate-pulse rounded mb-6" />
          <div className="bg-white rounded-lg overflow-hidden shadow-sm">
            <div className="grid md:grid-cols-2 gap-8 p-6 md:p-8">
              <div className="aspect-square bg-gray-200 animate-pulse rounded-lg" />
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 animate-pulse rounded w-1/4" />
                <div className="h-10 bg-gray-200 animate-pulse rounded w-3/4" />
                <div className="h-8 bg-gray-200 animate-pulse rounded w-1/3" />
                <div className="h-24 bg-gray-200 animate-pulse rounded w-full" />
                <div className="h-12 bg-gray-200 animate-pulse rounded w-1/2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The product you're looking for doesn't exist.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-freshblue text-white px-4 py-2 rounded-lg font-medium hover:bg-freshblue-dark transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const hasDiscount = product.compareAtPrice > product.pricePerUnit;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.compareAtPrice - product.pricePerUnit) /
          product.compareAtPrice) *
          100,
      )
    : 0;
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, selectedQuantity: quantity }));
    toast.success("Item is added to cart", {
      position: "bottom-right",
      autoClose: 2000,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Product Detail Card */}
        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
          <div className="grid md:grid-cols-2 gap-8 p-6 md:p-8">
            {/* Product Image */}
            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              {product.images?.[0]?.url ? (
                <img
                  src={product.images[0].url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  No Image
                </div>
              )}
              {hasDiscount && (
                <span className="absolute top-4 left-4 bg-red-500 text-white text-lg px-3 py-1 rounded font-bold">
                  {discountPercent}% OFF
                </span>
              )}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="bg-white text-gray-900 px-4 py-2 rounded-full font-medium">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <div className="flex-1">
                <span className="inline-block border border-gray-200 text-gray-600 text-xs font-medium px-2 py-1 rounded mb-3">
                  {product.category?.name}
                </span>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 font-heading">
                  {product.name}
                </h1>

                {/* Price */}
                <div className="mb-6">
                  {hasDiscount ? (
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl font-bold text-freshblue">
                        Rs. {product.pricePerUnit?.toFixed(2)}{" "}
                        <span className="text-lg text-gray-500 font-normal">
                          / {product.unit || "pack"}
                        </span>
                      </span>
                      <span className="text-2xl text-gray-400 line-through">
                        Rs. {product.compareAtPrice?.toFixed(2)}
                      </span>
                      <span className="bg-red-100 text-red-700 text-sm font-medium px-2 py-0.5 rounded">
                        Save Rs.{" "}
                        {(
                          product.compareAtPrice - product.pricePerUnit
                        ).toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-4xl font-bold text-freshblue">
                      Rs. {product.pricePerUnit?.toFixed(2)}{" "}
                      <span className="text-lg text-gray-500 font-normal">
                        / {product.unit || "pack"}
                      </span>
                    </span>
                  )}
                  {quantity > (product.sellingType === "weight" ? 0.25 : 1) && (
                    <div className="mt-2 text-gray-600 font-medium">
                      Total: Rs. {(product.pricePerUnit * quantity).toFixed(2)}
                    </div>
                  )}
                </div>

                <p className="text-gray-700 mb-6 leading-relaxed">
                  {product.description}
                </p>

                {/* Features */}
                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center gap-3 text-sm">
                    <Package className="w-5 h-5 text-freshblue" />
                    <span className="text-gray-700">
                      Fresh and high quality
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Truck className="w-5 h-5 text-freshblue" />
                    <span className="text-gray-700">
                      Free delivery on orders over Rs. 5000
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Shield className="w-5 h-5 text-freshblue" />
                    <span className="text-gray-700">
                      100% satisfaction guarantee
                    </span>
                  </div>
                </div>
              </div>

              {/* Add to Cart Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">
                    Quantity:
                  </span>
                  <QuantitySelector
                    quantity={quantity}
                    onIncrease={() => {
                      const step = product?.sellingType === "weight" ? 0.25 : 1;
                      setQuantity(quantity + step);
                    }}
                    onDecrease={() => {
                      const step = product?.sellingType === "weight" ? 0.25 : 1;
                      const min = product?.sellingType === "weight" ? 0.25 : 1;
                      setQuantity(Math.max(min, quantity - step));
                    }}
                    onChange={(val) => setQuantity(val)}
                    disabled={isOutOfStock}
                    step={product?.sellingType === "weight" ? 0.25 : 1}
                    min={product?.sellingType === "weight" ? 0.25 : 1}
                    unit={product?.unit || "pack"}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-freshblue hover:bg-freshblue-dark text-white py-3.5 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => {
                      handleAddToCart();
                      navigate("/checkout", {
                        state: { directBuy: { ...product, cartQuantity: quantity } },
                      });
                    }}
                    disabled={isOutOfStock}
                    className="flex-1 inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-3.5 rounded-lg font-bold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Zap className="w-5 h-5" />
                    Buy Now
                  </button>
                </div>

                {isOutOfStock && (
                  <p className="text-sm text-red-600 text-center">
                    This product is currently out of stock
                  </p>
                )}
              </div>

              {/* Attributes */}
              {product.attributes?.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-4">
                    Specifications
                  </h3>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {product.attributes.map((attr, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 px-4 py-3 rounded-lg"
                      >
                        <dt className="text-xs text-gray-500 uppercase font-bold">
                          {attr.name}
                        </dt>
                        <dd className="font-medium text-gray-900">
                          {attr.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
