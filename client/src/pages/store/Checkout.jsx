import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { useCreateOrderMutation } from "../../features/api/storeApiSlice";
import {
  clearCart,
  selectCartItems,
  selectCartTotalAmount,
} from "../../features/cart/cartSlice";
import { selectCurrentUser } from "../../features/auth/authSlice";
import { useGetAddressesQuery } from "../../features/auth/authApiSlice";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Package,
  CreditCard,
  MapPin,
  CheckCircle,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

// --- STRIPE IMPORTS ---
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axios from "axios";

const stripePromise = loadStripe(
  "pk_test_51TEvFI0jwEIRhX4IeeZ8MN3yghOR30W9iMp77Bq9hIG5t4yH1Jy4PSjQT5LxtyGu95y18clhyVgLpnKb1Qp9WwWe00usSFjBni",
);

// --- 1. STRIPE FORM COMPONENT ---
const StripePaymentForm = ({
  total,
  onPaymentSuccess,
  isProcessing,
  setIsProcessing,
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const handlePayClick = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/orders/create-payment-intent",
        { amount: total },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        },
      );

      const result = await stripe.confirmCardPayment(
        response.data.clientSecret,
        {
          payment_method: { card: elements.getElement(CardElement) },
        },
      );

      if (result.error) {
        toast.error(result.error.message);
        setIsProcessing(false);
      } else if (result.paymentIntent.status === "succeeded") {
        onPaymentSuccess("card");
      }
    } catch (err) {
      console.error("Axios Error:", err);
      toast.error("Stripe Connection Failed! Please check server logs.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500 mt-6">
      <div className="p-6 border-4 border-blue-600/10 rounded-[2rem] bg-slate-50 shadow-inner transition-all focus-within:border-blue-600/30">
        <label className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-4 block italic">
          Secure Card Entry
        </label>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#0f172a",
                fontSmoothing: "antialiased",
                "::placeholder": { color: "#94a3b8" },
              },
            },
          }}
        />
      </div>

      <button
        onClick={handlePayClick}
        disabled={isProcessing}
        className="w-full bg-blue-900 hover:bg-black text-white py-6 rounded-[2.5rem] font-black text-sm tracking-widest uppercase shadow-2xl transition-all flex items-center justify-center gap-3 group"
      >
        {isProcessing
          ? "PROCESSING PAYMENT..."
          : `PAY LKR ${total.toLocaleString()} & PLACE ORDER`}
        <ShieldCheck
          className={`w-5 h-5 ${isProcessing ? "animate-pulse" : "group-hover:scale-110"}`}
        />
      </button>
    </div>
  );
};

// --- 2. MAIN CHECKOUT COMPONENT ---
export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector(selectCurrentUser);

  const [payMethod, setPayMethod] = useState("cod");
  const [isStripeProcessing, setIsStripeProcessing] = useState(false);

  const directBuyItem = location.state?.directBuy;
  const cartItems = useSelector(selectCartItems);
  const cartTotalAmount = useSelector(selectCartTotalAmount);

  const orderItems = directBuyItem ? [directBuyItem] : cartItems;

  const subtotal = directBuyItem
    ? directBuyItem.pricePerUnit * (directBuyItem.cartQuantity || 1)
    : cartTotalAmount;
  const shippingCost = 300;
  const finalTotal = subtotal + shippingCost;

  const [createOrder, { isLoading }] = useCreateOrderMutation();

  // Fetch saved addresses from the API (same as Account page)
  const { data: addressesData } = useGetAddressesQuery(undefined, { skip: !user });
  const addresses = addressesData?.data || [];
  const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0] || {};

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    reset,
  } = useForm({
    defaultValues: {
      street: "",
      city: "",
      phone: "",
    },
  });

  // Autofill form when user data / addresses load
  useEffect(() => {
    if (defaultAddress?.street || user?.phone) {
      reset({
        street: defaultAddress?.street || "",
        city: defaultAddress?.city || "",
        phone: user?.phone || "",
      });
    }
  }, [addresses, user, reset]);

  useEffect(() => {
    if (!user) {
      toast.info("Please log in to proceed.");
      navigate("/login", { state: { from: "/checkout" } });
    }
  }, [user, navigate]);

  const processFinalOrder = async (method) => {
    try {
      const shippingData = getValues();
      const payload = {
        items: orderItems.map((item) => ({
          product: item._id,
          sellingType: item.sellingType || "pack",
          unit: item.unit || "pack",
          quantity: item.cartQuantity || 1,
          pricePerUnit: item.pricePerUnit,
          name: item.name,
          subtotal: item.pricePerUnit * (item.cartQuantity || 1),
        })),
        shippingAddress: shippingData,
        pricing: { total: finalTotal, subtotal, tax: 0, shippingCost },
        paymentMethod: method,
        paymentStatus: method === "card" ? "paid" : "pending",
        orderStatus: "pending",
      };

      const result = await createOrder(payload).unwrap();
      if (result) {
        toast.success("Transaction Successful! Dispatching soon.");
        if (!directBuyItem) dispatch(clearCart());
        navigate("/track-order");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Order Sync Failed!");
    } finally {
      setIsStripeProcessing(false);
    }
  };

  const onFormSubmit = (data) => {
    if (payMethod === "cod") {
      processFinalOrder("cod");
    } else {
      // Card payment එකක් නම් අපි form එක validate කරන්න විතරයි handleSubmit පාවිච්චි කරන්නේ
      // ඇත්තම පේමන්ට් එක වෙන්නේ StripePaymentForm එක ඇතුළේ
      toast.info("Please complete the card details below to finish.");
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-16 font-sans">
      <div className="max-w-7xl mx-auto px-6">
        <header className="mb-12">
          <h1 className="text-5xl font-black text-navy-900 italic tracking-tighter uppercase mb-2">
            Checkout
          </h1>
          <p className="text-slate-400 font-bold text-[10px] tracking-[0.3em] uppercase italic">
            Onako Logistics • Sri Lanka
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-12">
          <div className="w-full lg:w-2/3">
            <form
              id="checkout-form"
              onSubmit={handleSubmit(onFormSubmit)}
              className="bg-white rounded-[3.5rem] p-12 shadow-sm border border-slate-100"
            >
              <div className="flex items-center gap-4 mb-10 border-l-8 border-blue-600 pl-6">
                <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter italic">
                  Metadata
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <div className="relative">
                    <input
                      {...register("street", {
                        required: "Street address is required",
                      })}
                      placeholder="HOUSE NO / STREET NAME"
                      className={`w-full p-6 bg-slate-50 rounded-2xl border ${errors.street ? "border-red-500" : "border-slate-100"} outline-none focus:ring-4 focus:ring-blue-100 transition-all font-black text-xs uppercase tracking-widest`}
                    />
                    {errors.street && (
                      <span className="absolute -bottom-5 left-2 text-[9px] text-red-600 font-bold uppercase italic">
                        {errors.street.message}
                      </span>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <input
                    {...register("city", { required: "City is required" })}
                    placeholder="CITY"
                    className={`w-full p-6 bg-slate-50 rounded-2xl border ${errors.city ? "border-red-500" : "border-slate-100"} outline-none focus:ring-4 focus:ring-blue-100 font-black text-xs uppercase tracking-widest`}
                  />
                  {errors.city && (
                    <span className="absolute -bottom-5 left-2 text-[9px] text-red-600 font-bold uppercase italic">
                      {errors.city.message}
                    </span>
                  )}
                </div>

                <div className="relative">
                  {/* PHONE VALIDATION: අංක 10ක් විය යුතු අතර 0න් පටන් ගත යුතුය */}
                  <input
                    {...register("phone", {
                      required: "Phone number is required",
                      pattern: {
                        value: /^(07[0-9]{8}|0[1-9][0-9]{8})$/,
                        message:
                          "Invalid Sri Lankan Phone Number (e.g. 07XXXXXXXX)",
                      },
                    })}
                    placeholder="CONTACT NUMBER (07XXXXXXXX)"
                    className={`w-full p-6 bg-slate-50 rounded-2xl border ${errors.phone ? "border-red-500" : "border-slate-100"} outline-none focus:ring-4 focus:ring-blue-100 font-black text-xs uppercase tracking-widest`}
                  />
                  {errors.phone && (
                    <div className="absolute -bottom-5 left-2 flex items-center gap-1">
                      <AlertCircle className="w-2.5 h-2.5 text-red-600" />
                      <span className="text-[9px] text-red-600 font-bold uppercase italic">
                        {errors.phone.message}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-16 pt-16 border-t border-slate-50">
                <div className="flex items-center gap-4 mb-10 border-l-8 border-blue-600 pl-6">
                  <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter italic">
                    Payment Protocol
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div
                    onClick={() => setPayMethod("cod")}
                    className={`p-8 rounded-[2.5rem] border-4 cursor-pointer transition-all flex items-center justify-between ${payMethod === "cod" ? "border-blue-600 bg-blue-50/50 shadow-xl" : "border-slate-50 opacity-30 hover:opacity-100"}`}
                  >
                    <span className="font-black text-xs uppercase italic text-slate-900 tracking-widest">
                      Cash on Delivery
                    </span>
                    {payMethod === "cod" && (
                      <CheckCircle className="w-6 h-6 text-blue-600" />
                    )}
                  </div>

                  <div
                    onClick={() => setPayMethod("card")}
                    className={`p-8 rounded-[2.5rem] border-4 cursor-pointer transition-all flex items-center justify-between ${payMethod === "card" ? "border-blue-600 bg-blue-50/50 shadow-xl" : "border-slate-50 opacity-30 hover:opacity-100"}`}
                  >
                    <span className="font-black text-xs uppercase italic text-slate-900 tracking-widest">
                      Card Transaction
                    </span>
                    {payMethod === "card" && (
                      <CheckCircle className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                </div>

                {payMethod === "card" && (
                  <Elements stripe={stripePromise}>
                    <StripePaymentForm
                      total={finalTotal}
                      onPaymentSuccess={processFinalOrder}
                      isProcessing={isStripeProcessing}
                      setIsProcessing={setIsStripeProcessing}
                    />
                  </Elements>
                )}
              </div>
            </form>
          </div>

          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-[3.5rem] p-12 shadow-2xl shadow-blue-900/5 border border-slate-100 sticky top-10">
              <h2 className="text-2xl font-black text-navy-900 mb-10 uppercase italic tracking-tighter border-b pb-8">
                Summary
              </h2>

              <div className="space-y-6 mb-12">
                <div className="flex justify-between text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase italic">
                  <span>Subtotal</span>
                  <span className="text-slate-900">
                    LKR {subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase italic">
                  <span>Delivery Fee</span>
                  <span className="text-slate-900">
                    LKR {shippingCost.toLocaleString()}
                  </span>
                </div>
                <div className="mt-8 pt-8 border-t-4 border-slate-50 flex justify-between items-end">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest italic">
                    Net Payable
                  </span>
                  <span className="text-5xl font-black text-navy-900 italic tracking-tighter">
                    LKR {finalTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {payMethod === "cod" && (
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-[2.5rem] font-black text-sm tracking-widest uppercase shadow-2xl shadow-blue-200 transition-all transform hover:scale-[1.02]"
                >
                  {isLoading ? "SYNCING..." : "PLACE COD ORDER"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
