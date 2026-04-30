import { Outlet, Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, logOut } from "../features/auth/authSlice";
import {
  LayoutDashboard,
  Box,
  Tags,
  ShoppingCart,
  RotateCcw,
  Truck,
  ClipboardList,
  Wallet,
  Users,
  Truck as TruckIcon,
  UserCircle,
  LogOut,
  PackageCheck,
  FileText,
} from "lucide-react";
import logo from "../assets/logo.png";

const AdminLayout = () => {
  const user = useSelector(selectCurrentUser);
  const location = useLocation();
  const dispatch = useDispatch();

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Products", path: "/admin/products", icon: Box },
    { name: "Categories", path: "/admin/categories", icon: Tags },
    { name: "Orders", path: "/admin/orders", icon: ShoppingCart },
    { name: "Returns", path: "/admin/returns", icon: RotateCcw },
    { name: "Procurement", path: "/admin/suppliers", icon: Truck },
    { name: "Warehouses", path: "/admin/warehouses", icon: Box },
    { name: "Stock Movements", path: "/admin/stock-movements", icon: ClipboardList },
    { name: "Fleet & Staff", path: "/admin/fleet", icon: TruckIcon },
    { name: "Users", path: "/admin/users", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex font-body">
      {/* Sidebar */}
      <aside className="w-64 bg-navy-900 text-slate-300 flex-shrink-0 border-r border-slate-800">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={logo}
              alt="Bigmart Logo"
              className="h-8 w-auto brightness-0 invert"
            />
            <span className="text-xs bg-electric text-white px-2 py-0.5 rounded-full font-sans tracking-normal font-bold">
              Admin
            </span>
          </Link>
        </div>
        <div className="p-4 space-y-1">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 px-2 mt-4">
            Management
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/admin" &&
                location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium ${
                  isActive
                    ? "bg-electric text-white shadow-md shadow-blue-900/20"
                    : "hover:bg-navy-800 hover:text-white"
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-end px-8 shadow-sm z-10">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-electric text-white rounded-full flex items-center justify-center font-bold font-heading">
                {user?.name?.charAt(0) || "A"}
              </div>
              <div className="leading-tight">
                <div className="font-bold text-sm text-slate-800">
                  {user?.name}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {user?.role}
                </div>
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200 mx-2"></div>
            <button
              onClick={() => dispatch(logOut())}
              className="text-slate-500 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-slate-100"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default AdminLayout;
