import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { addToCart, decreaseCart, updateQuantity, selectCartItems } from "../features/cart/cartSlice";
import { toast } from "react-toastify";
import QuantitySelector from "./QuantitySelector";

export default function ProductCard({ product }) {
  const cartItems = useSelector(selectCartItems);
  const cartItem = cartItems.find((item) => item._id === product._id);
  const isWeight = product.sellingType === "weight";
  const step = isWeight ? 0.25 : 1;
  const min = isWeight ? 0.25 : 1;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart({ ...product, selectedQuantity: min }));
    toast.success("Item is added to cart", {
      position: "bottom-right",
      autoClose: 2000,
    });
  };

  const hasDiscount = product.compareAtPrice > product.pricePerUnit;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice - product.pricePerUnit) / product.compareAtPrice) * 100)
    : 0;

  return (
    <Link
      to={`/shop/${product.slug}`}
      className="group bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden block"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {product.images?.[0]?.url ? (
          <img
            src={product.images[0].url}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
            No Image
          </div>
        )}
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            {discountPercent}% OFF
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="text-xs text-freshblue font-bold uppercase tracking-wider mb-1">
          {product.category?.name}
        </div>
        <h3 className="font-medium text-gray-900 line-clamp-2 min-h-[2.5rem] leading-tight">
          {product.name}
        </h3>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex flex-col">
            {hasDiscount ? (
              <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-freshblue">
                    Rs. {product.pricePerUnit?.toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-400 line-through">
                    Rs. {product.compareAtPrice?.toFixed(2)}
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 font-medium">/ {product.unit || 'pack'}</span>
              </div>
            ) : (
              <div className="flex flex-col">
                <span className="text-lg font-bold text-freshblue">
                  Rs. {product.pricePerUnit?.toFixed(2)}
                </span>
                <span className="text-[10px] text-gray-500 font-medium">/ {product.unit || 'pack'}</span>
              </div>
            )}
          </div>

          <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
            {cartItem ? (
              <div className="scale-90 origin-right">
                <QuantitySelector
                  quantity={cartItem.cartQuantity}
                  onIncrease={() => dispatch(addToCart(product))}
                  onDecrease={() => dispatch(decreaseCart(product))}
                  onChange={(val) => dispatch(updateQuantity({ _id: product._id, quantity: val }))}
                  step={step}
                  min={min}
                  unit={isWeight ? 'kg' : ''}
                />
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-10 h-10 rounded-lg bg-white border border-freshblue text-freshblue hover:bg-freshblue hover:text-white flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                aria-label={`Add ${product.name} to cart`}
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
