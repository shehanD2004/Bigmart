import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { ShoppingBag, ArrowLeft, Trash2 } from "lucide-react";
import {
  addToCart,
  clearCart,
  decreaseCart,
  getTotals,
  removeFromCart,
  selectCartItems,
  selectCartTotalAmount,
  updateQuantity,
} from "../../features/cart/cartSlice";
import QuantitySelector from "../../components/QuantitySelector";

export default function Cart() {
  const cart = useSelector(selectCartItems);
  const cartTotalAmount = useSelector(selectCartTotalAmount);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getTotals());
  }, [cart, dispatch]);

  const deliveryFee = cartTotalAmount > 5000 ? 0 : 250;
  const finalTotal = cartTotalAmount + deliveryFee;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 font-heading">
          Shopping Cart
        </h1>

        {cart.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center shadow-sm flex flex-col items-center">
            <ShoppingBag className="w-24 h-24 text-gray-300 mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Your cart is empty
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Add items to get started
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-freshblue hover:bg-freshblue-dark text-white px-6 py-3 rounded-lg font-bold transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="w-full lg:w-2/3">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {cart.length} item{cart.length !== 1 ? "s" : ""} in cart
                  </h2>
                  <button
                    onClick={() => dispatch(clearCart())}
                    className="text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Clear All
                  </button>
                </div>

                <div className="divide-y divide-gray-100">
                  {cart.map((cartItem) => (
                    <div
                      key={cartItem._id}
                      className="flex gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <Link
                        to={`/shop/${cartItem.slug}`}
                        className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0"
                      >
                        <img
                          src={
                            cartItem.images?.[0]?.url ||
                            "https://placehold.co/150"
                          }
                          alt={cartItem.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </Link>

                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/shop/${cartItem.slug}`}
                          className="font-medium text-sm text-gray-900 hover:text-freshblue transition-colors line-clamp-2"
                        >
                          {cartItem.name}
                        </Link>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Rs. {cartItem.pricePerUnit?.toFixed(2)} / {cartItem.unit || 'pack'}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          <QuantitySelector
                            quantity={cartItem.cartQuantity}
                            onIncrease={() => dispatch(addToCart(cartItem))}
                            onDecrease={() => dispatch(decreaseCart(cartItem))}
                            onChange={(val) => dispatch(updateQuantity({ _id: cartItem._id, quantity: val }))}
                            step={cartItem.sellingType === "weight" ? 0.25 : 1}
                            min={cartItem.sellingType === "weight" ? 0.25 : 1}
                            unit={cartItem.unit || 'pack'}
                          />

                          <div className="flex items-center gap-3">
                            <div className="flex flex-col items-end">
                              <span className="font-semibold text-freshblue text-base">
                                Rs. {(cartItem.pricePerUnit * cartItem.cartQuantity).toFixed(2)}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                Rs. {cartItem.pricePerUnit?.toFixed(2)} x {cartItem.cartQuantity}{cartItem.unit || 'pack'}
                              </span>
                            </div>
                            <button
                              onClick={() =>
                                dispatch(removeFromCart(cartItem))
                              }
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              aria-label={`Remove ${cartItem.name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <Link
                    to="/shop"
                    className="text-sm font-medium text-freshblue hover:underline inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-1/3">
              <div className="bg-white rounded-lg p-6 shadow-sm sticky top-24">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-4 border-b border-gray-100">
                  Order Summary
                </h2>

                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">
                      Rs. {cartTotalAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium">
                      {deliveryFee === 0 ? (
                        <span className="text-freshblue">FREE</span>
                      ) : (
                        `Rs. ${deliveryFee.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  {deliveryFee > 0 && (
                    <p className="text-xs text-gray-500">
                      Free delivery on orders over Rs. 5,000
                    </p>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold text-freshblue">
                      Rs. {finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  className="block w-full bg-freshblue hover:bg-freshblue-dark text-white py-3.5 rounded-lg font-bold text-center transition-colors"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
