import { Outlet, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, logOut } from "../features/auth/authSlice";
import { selectCartTotalQuantity } from "../features/cart/cartSlice";
import {
  ShoppingCart,
  User as UserIcon,
  LogOut as LogOutIcon,
  Menu,
  X,
  Search,
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  MessageCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getTotals } from "../features/cart/cartSlice";
import logo from "../assets/logo.png";

const StorefrontLayout = () => {
  const user = useSelector(selectCurrentUser);
  const cartTotalQuantity = useSelector(selectCartTotalQuantity);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  useEffect(() => {
    dispatch(getTotals());
  }, [dispatch]);

  return (
    <div className="min-h-screen flex flex-col font-body">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Bar */}
          <div className="flex items-center justify-end py-2 border-b border-gray-100 text-sm">
            <div className="hidden md:flex items-center gap-4 text-sm">
              <Link
                to="/track-order"
                className="hover:text-freshblue transition-colors"
              >
                Track Order
              </Link>
              <Link
                to="/help-center"
                className="hover:text-freshblue transition-colors"
              >
                Help
              </Link>
              {user ? (
                <div className="flex items-center gap-3">
                  <Link
                    to="/account"
                    className="flex items-center gap-1 hover:text-freshblue transition-colors"
                  >
                    <UserIcon className="w-4 h-4" />
                    {user.name}
                  </Link>
                  {user.role !== "customer" && (
                    <Link
                      to="/admin"
                      className="text-xs font-bold bg-gray-900 text-white px-2 py-0.5 rounded hover:bg-gray-800 transition-colors"
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => dispatch(logOut())}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                    aria-label="Log out"
                  >
                    <LogOutIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="flex items-center gap-1 hover:text-freshblue transition-colors"
                  >
                    <UserIcon className="w-4 h-4" />
                    Sign In
                  </Link>
                  <span className="text-gray-300">|</span>
                  <Link
                    to="/register"
                    className="hover:text-freshblue transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Main Header */}
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img src={logo} alt="Bigmart Logo" className="h-20 w-auto" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 leading-tight">
                  Onako Bigmart
                </h1>
                <p className="text-xs text-gray-500">Grocery Delivered</p>
              </div>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex items-center flex-1 max-w-xl mx-8">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products..."
                  className="pl-10 pr-4 py-2.5 w-full border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-freshblue/30 focus:border-freshblue transition-all text-sm"
                />
              </form>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>

              {/* Desktop Nav */}
              <nav className="hidden lg:flex items-center gap-6">
                <Link
                  to="/"
                  className="text-sm font-medium hover:text-freshblue transition-colors"
                >
                  Home
                </Link>
                <Link
                  to="/shop"
                  className="text-sm font-medium hover:text-freshblue transition-colors"
                >
                  Shop
                </Link>
                <Link
                  to="/categories"
                  className="text-sm font-medium hover:text-freshblue transition-colors"
                >
                  Categories
                </Link>
              </nav>

              {/* Cart Button */}
              <Link
                to="/cart"
                className="relative p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                aria-label="Shopping cart"
              >
                <ShoppingCart className="w-5 h-5 text-gray-700" />
                {cartTotalQuantity > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-freshblue text-white text-[10px] font-bold rounded-full">
                    {cartTotalQuantity}
                  </span>
                )}
              </Link>

              {/* Auth - mobile only sign in/up */}
              {!user && (
                <div className="hidden sm:flex md:hidden items-center gap-3 text-sm font-medium">
                  <Link
                    to="/login"
                    className="text-freshblue hover:text-freshblue-dark transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="text-gray-600 hover:text-freshblue transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="pl-10 pr-4 py-2.5 w-full border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-freshblue/30 focus:border-freshblue transition-all text-sm"
              />
            </form>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1">
            <Link
              to="/"
              className="block px-4 py-3 text-lg font-medium hover:text-freshblue hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/shop"
              className="block px-4 py-3 text-lg font-medium hover:text-freshblue hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Shop
            </Link>
            <Link
              to="/categories"
              className="block px-4 py-3 text-lg font-medium hover:text-freshblue hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Categories
            </Link>
            {user ? (
              <>
                <Link
                  to="/account"
                  className="block px-4 py-3 text-lg font-medium hover:text-freshblue hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Account
                </Link>
                {user.role !== "customer" && (
                  <Link
                    to="/admin"
                    className="block px-4 py-3 text-lg font-medium hover:text-freshblue hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    dispatch(logOut());
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-3 text-lg font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-4 py-3 text-lg font-medium hover:text-freshblue hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-3 text-lg font-medium hover:text-freshblue hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </header>

      <main className="flex-grow bg-gray-50">
        <Outlet />
      </main>

      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img
                  src={logo}
                  alt="Bigmart Logo"
                  className="h-8 w-auto brightness-0 invert"
                />
                <span className="text-white font-semibold">Onako Bigmart</span>
              </div>
              <p className="text-sm mb-4">
                Your trusted online grocery store delivering fresh produce and
                quality products to your doorstep.
              </p>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="hover:text-freshblue transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="hover:text-freshblue transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="hover:text-freshblue transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/"
                    className="hover:text-freshblue transition-colors"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/shop"
                    className="hover:text-freshblue transition-colors"
                  >
                    Shop
                  </Link>
                </li>
                <li>
                  <Link
                    to="/categories"
                    className="hover:text-freshblue transition-colors"
                  >
                    Categories
                  </Link>
                </li>
                <li>
                  <Link
                    to="/cart"
                    className="hover:text-freshblue transition-colors"
                  >
                    Cart
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h3 className="text-white font-semibold mb-4">
                Customer Service
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/help-center"
                    className="hover:text-freshblue transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    to="/track-order"
                    className="hover:text-freshblue transition-colors"
                  >
                    Track Order
                  </Link>
                </li>
                <li>
                  <Link
                    to="/shipping"
                    className="hover:text-freshblue transition-colors"
                  >
                    Shipping Info
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-1 shrink-0" />
                  <span>857 3A, Malabe 10115</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 shrink-0" />
                  <span>+94787689821</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 shrink-0" />
                  <span>support@onakobigmart.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
            <p>
              &copy; {new Date().getFullYear()} Onako Bigmart. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Live Support Button */}
      <a
        href="https://wa.me/94787689821?text=Hello%20Bigmart%20Support"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-full shadow-lg shadow-emerald-500/30 transition-transform hover:scale-110 z-50 flex items-center justify-center group"
        aria-label="Live Chat"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity -top-10 right-0 whitespace-nowrap pointer-events-none">
          Live Chat
        </span>
      </a>
    </div>
  );
};

export default StorefrontLayout;
