import { useGetDashboardStatsQuery } from "../../features/api/adminApiSlice";
import {
  Package,
  ShoppingBag,
  AlertTriangle,
  Truck,
  DollarSign,
  RotateCcw,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const AdminDashboard = () => {
  const { data: stats, isLoading } = useGetDashboardStatsQuery();

  if (isLoading)
    return (
      <div className="animate-pulse bg-white h-screen rounded-2xl p-8">
        Loading dashboard...
      </div>
    );

  const dashboardData = stats?.data;

  const statCards = [
    {
      label: "Orders Today",
      value: dashboardData?.ordersToday || 0,
      icon: ShoppingBag,
      color: "bg-electric text-white",
    },
    {
      label: "Revenue Today",
      value: `Rs. ${dashboardData?.revenueToday?.toFixed(2) || "0.00"}`,
      icon: DollarSign,
      color: "bg-emerald-500 text-white",
    },
    {
      label: "Low Stock Alerts",
      value: dashboardData?.lowStockAlerts || 0,
      icon: AlertTriangle,
      color: "bg-orange-500 text-white",
    },
    {
      label: "Active Deliveries",
      value: dashboardData?.activeDeliveries || 0,
      icon: Truck,
      color: "bg-purple-500 text-white",
    },
    {
      label: "Pending Returns",
      value: dashboardData?.pendingReturns || 0,
      icon: RotateCcw,
      color: "bg-rose-500 text-white",
    },
    {
      label: "Vehicles Available",
      value: dashboardData?.availableVehicles || 0,
      icon: Package,
      color: "bg-sky-500 text-white",
    },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-heading font-extrabold text-slate-900 mb-8 tracking-tight">
        Dashboard Overview
      </h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${card.color} shadow-lg`}
              >
                <Icon size={24} />
              </div>
              <div className="text-slate-500 text-sm font-medium mb-1">
                {card.label}
              </div>
              <div className="text-2xl font-bold font-heading text-slate-900">
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-xl font-bold font-heading text-slate-900 mb-6">
            Revenue (Last 30 Days)
          </h2>
          <div className="h-80">
            {dashboardData?.revenueChart?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboardData.revenueChart}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E2E8F0"
                  />
                  <XAxis
                    dataKey="_id"
                    stroke="#94A3B8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `Rs. ${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B82F6"
                    strokeWidth={4}
                    dot={{
                      r: 4,
                      fill: "#3B82F6",
                      strokeWidth: 2,
                      stroke: "#FFF",
                    }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 font-medium bg-slate-50 rounded-xl">
                Not enough data to graph
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders List */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold font-heading text-slate-900">
              Recent Orders
            </h2>
          </div>
          <div className="space-y-4">
            {dashboardData?.recentOrders?.slice(0, 5).map((order) => (
              <div
                key={order._id}
                className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100"
              >
                <div>
                  <div className="font-bold text-slate-800 text-sm">
                    {order.orderNumber}
                  </div>
                  <div className="text-xs text-slate-500">
                    {order.customer?.name}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm text-slate-900">
                    Rs. {order.pricing.total.toFixed(2)}
                  </div>
                  <div
                    className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1 max-w-max ml-auto ${
                      order.orderStatus === "delivered"
                        ? "bg-emerald-100 text-emerald-700"
                        : order.orderStatus === "pending"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {order.orderStatus}
                  </div>
                </div>
              </div>
            ))}
            {!dashboardData?.recentOrders?.length && (
              <div className="text-center text-slate-400 py-8 bg-slate-50 rounded-xl">
                No recent orders
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
