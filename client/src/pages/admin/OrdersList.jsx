import { useState, useEffect, useMemo } from "react";
import {
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
} from "../../features/api/adminApiSlice";
import {
  Search,
  Clock,
  CheckCircle,
  Truck,
  Package,
  AlertCircle,
  Loader2,
  MapPin,
  ShoppingCart,
  ChevronRight,
  ChevronLeft,
  Gift,
  Filter,
  RotateCcw,
  Inbox,
  TrendingUp,
  XCircle,
} from "lucide-react";

/* ── STATUS CONFIG ── */
const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    bg: "bg-amber-100",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  processing: {
    label: "Processing",
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    bg: "bg-purple-100",
    text: "text-purple-700",
    border: "border-purple-200",
    dot: "bg-purple-500",
  },
  delivered: {
    label: "Delivered",
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
  },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text} ${cfg.border} border`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

/* ── SKELETON ── */
const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="p-4 px-6">
      <div className="h-4 w-32 bg-slate-200 rounded" />
    </td>
    <td className="p-4 px-6">
      <div className="h-4 w-24 bg-slate-100 rounded" />
    </td>
    <td className="p-4 px-6">
      <div className="h-5 w-20 bg-slate-200 rounded-full" />
    </td>
    <td className="p-4 px-6">
      <div className="h-4 w-16 bg-slate-100 rounded" />
    </td>
    <td className="p-4 px-6 text-right">
      <div className="h-4 w-20 bg-slate-200 rounded ml-auto" />
    </td>
  </tr>
);

/* ── MAIN COMPONENT ── */
const OrdersList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [localPackedItems, setLocalPackedItems] = useState({});
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, debouncedSearch]);

  const { data, isLoading, isError, refetch } = useGetOrdersQuery({
    search: debouncedSearch,
    status: statusFilter || undefined,
    page: currentPage,
  });

  const [updateStatus] = useUpdateOrderStatusMutation();

  const allOrders = data?.data || [];
  const pagination = data?.pagination || null;
  const totalPages =
    pagination?.totalPages || Math.ceil((allOrders?.length || 0) / 10) || 1;

  const stats = useMemo(() => {
    const orders = allOrders || [];
    return {
      total: orders.length,
      pending: orders.filter((o) => o?.orderStatus === "pending").length,
      processing: orders.filter((o) => o?.orderStatus === "processing").length,
      outForDelivery: orders.filter(
        (o) => o?.orderStatus === "out_for_delivery",
      ).length,
      delivered: orders.filter((o) => o?.orderStatus === "delivered").length,
      revenue: orders.reduce((sum, o) => sum + (o?.pricing?.total || 0), 0),
    };
  }, [allOrders]);

  const activeShipments = useMemo(
    () =>
      (allOrders || []).filter(
        (order) =>
          order?.orderStatus !== "delivered" &&
          order?.orderStatus !== "cancelled",
      ),
    [allOrders],
  );

  useEffect(() => {
    if (activeShipments.length > 0 && !selectedOrderId) {
      setSelectedOrderId(activeShipments[0]?._id);
    }
  }, [activeShipments]);

  const currentOrder = allOrders.find((o) => o?._id === selectedOrderId);

  // Packing checklist
  const togglePacked = (orderId, itemIdx) => {
    setLocalPackedItems((prev) => ({
      ...prev,
      [`${orderId}-${itemIdx}`]: !prev[`${orderId}-${itemIdx}`],
    }));
  };
  const isItemPacked = (orderId, itemIdx) =>
    !!localPackedItems[`${orderId}-${itemIdx}`];
  const allItemsPacked = currentOrder?.items?.every((_, idx) =>
    isItemPacked(currentOrder._id, idx),
  );

  // Status update
  const statuses = ["pending", "processing", "out_for_delivery", "delivered"];
  const currentStatusIdx = statuses.indexOf(currentOrder?.orderStatus);

  const handleStatusUpdate = async (dummyId, newStatus) => {
    if (!currentOrder) return;
    const targetIdx = statuses.indexOf(newStatus);
    if (targetIdx > 1 && !allItemsPacked) {
      alert("Please complete the Packing Checklist before dispatching!");
      return;
    }
    try {
      await updateStatus({
        id: currentOrder._id,
        status: newStatus,
        note: `Status updated to ${newStatus}`,
      }).unwrap();
    } catch (err) {
      console.error("Update Error:", err);
      alert(
        `Update Failed! ${err?.data?.message || err?.message || "Make sure you have Admin permissions."}`,
      );
    }
  };

  /* ── LOADING ── */
  if (isLoading) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-64 bg-slate-100 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 border border-slate-100 animate-pulse"
            >
              <div className="h-3 w-14 bg-slate-200 rounded mb-3" />
              <div className="h-6 w-10 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full">
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  /* ── ERROR ── */
  if (isError) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
        <div className="p-8 bg-white rounded-2xl shadow-sm border border-rose-100 flex flex-col items-center justify-center h-64">
          <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Failed to load orders
          </h2>
          <p className="text-slate-500 mb-6">
            Something went wrong. Please check your connection and try again.
          </p>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 bg-electric hover:bg-electric-dark text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm hover:shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
            Orders
          </h1>
          <p className="text-slate-500 mt-1">
            Manage orders, track deliveries, and update shipment status.
          </p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {[
          {
            label: "Total",
            value: stats.total,
            icon: ShoppingCart,
            color: "bg-slate-700",
          },
          {
            label: "Pending",
            value: stats.pending,
            icon: Clock,
            color: "bg-amber-500",
          },
          {
            label: "Processing",
            value: stats.processing,
            icon: Package,
            color: "bg-blue-500",
          },
          {
            label: "In Transit",
            value: stats.outForDelivery,
            icon: Truck,
            color: "bg-purple-500",
          },
          {
            label: "Delivered",
            value: stats.delivered,
            icon: CheckCircle,
            color: "bg-emerald-500",
          },
          {
            label: "Revenue",
            value: `LKR ${stats.revenue.toLocaleString()}`,
            icon: TrendingUp,
            color: "bg-indigo-500",
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color} shadow-lg`}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-slate-500 text-sm font-medium mb-0.5">
                {card.label}
              </div>
              <div className="text-xl font-bold font-heading text-slate-900">
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* MAIN PANEL */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by Order ID or Customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric transition-all text-sm"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric transition-all cursor-pointer min-w-[180px]"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 rotate-90 pointer-events-none" />
          </div>
        </div>

        {allOrders.length === 0 ? (
          /* EMPTY STATE */
          <div className="p-12 text-center flex flex-col items-center">
            <Inbox className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              No orders found
            </h3>
            <p className="text-slate-500 mb-6 max-w-md">
              {statusFilter
                ? `No orders with status "${STATUS_CONFIG[statusFilter]?.label || statusFilter}".`
                : debouncedSearch
                  ? `No orders match "${debouncedSearch}".`
                  : "Orders will appear here once customers place them."}
            </p>
            {(statusFilter || debouncedSearch) && (
              <button
                onClick={() => {
                  setStatusFilter("");
                  setSearchTerm("");
                }}
                className="text-electric font-semibold hover:text-electric-dark text-sm inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row">
            {/* ORDER TABLE */}
            <div
              className={`w-full ${selectedOrderId ? "lg:w-1/2 xl:w-3/5" : ""} overflow-x-auto border-r border-slate-100`}
            >
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                    <th className="p-3 px-5">Order</th>
                    <th className="p-3 px-5">Customer</th>
                    <th className="p-3 px-5">Status</th>
                    <th className="p-3 px-5">Items</th>
                    <th className="p-3 px-5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allOrders.map((order) => (
                    <tr
                      key={order?._id}
                      onClick={() => setSelectedOrderId(order?._id)}
                      className={`cursor-pointer transition-colors group ${
                        selectedOrderId === order?._id
                          ? "bg-blue-50/60 border-l-4 border-l-electric"
                          : "hover:bg-slate-50/80 border-l-4 border-l-transparent"
                      }`}
                    >
                      <td className="p-3 px-5">
                        <span className="font-bold text-sm text-slate-900">
                          {order?.orderNumber ?? "—"}
                        </span>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {order?.paymentMethod ?? "—"}
                        </div>
                      </td>
                      <td className="p-3 px-5">
                        <span className="text-sm text-slate-700">
                          {order?.customer?.name ?? "Guest"}
                        </span>
                      </td>
                      <td className="p-3 px-5">
                        <StatusBadge status={order?.orderStatus} />
                      </td>
                      <td className="p-3 px-5 text-sm text-slate-500">
                        {order?.items?.length ?? 0}
                      </td>
                      <td className="p-3 px-5 text-right font-medium text-sm text-slate-900">
                        LKR {(order?.pricing?.total ?? 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
                  <span className="text-sm text-slate-500 font-medium">
                    Page <span className="text-slate-900">{currentPage}</span>{" "}
                    of <span className="text-slate-900">{totalPages}</span>
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage >= totalPages}
                      className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ORDER DETAIL PANEL */}
            {selectedOrderId && currentOrder && (
              <div className="w-full lg:w-1/2 xl:w-2/5 overflow-y-auto border-t lg:border-t-0 bg-slate-50/50 max-h-[75vh]">
                <div className="p-6 animate-in fade-in duration-300">
                  {/* Status Stepper */}
                  <div className="mb-6 p-5 bg-white rounded-2xl border border-slate-100">
                    <div className="flex justify-between relative">
                      <div className="absolute top-4 left-8 right-8 h-0.5 bg-slate-200 -z-0" />
                      <div
                        className="absolute top-4 left-8 h-0.5 bg-electric transition-all duration-700 -z-0"
                        style={{
                          width: `${(currentStatusIdx / (statuses.length - 1)) * 85}%`,
                        }}
                      />
                      {statuses.map((s, i) => (
                        <div
                          key={s}
                          className="flex flex-col items-center relative z-10"
                        >
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                              i <= currentStatusIdx
                                ? "bg-electric text-white shadow-md"
                                : "bg-white border-2 border-slate-200 text-slate-300"
                            }`}
                          >
                            {i === 0 && <Clock className="w-4 h-4" />}
                            {i === 1 && <Package className="w-4 h-4" />}
                            {i === 2 && <Truck className="w-4 h-4" />}
                            {i === 3 && <CheckCircle className="w-4 h-4" />}
                          </div>
                          <span
                            className={`text-[10px] font-semibold mt-1.5 capitalize ${
                              i <= currentStatusIdx
                                ? "text-electric"
                                : "text-slate-400"
                            }`}
                          >
                            {s.replace(/_/g, " ")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Info */}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight">
                        {currentOrder?.orderNumber ?? "—"}
                      </h2>
                      <div className="flex gap-2 mt-2">
                        <StatusBadge status={currentOrder?.orderStatus} />
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          {currentOrder?.paymentMethod ?? "—"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500 font-medium mb-1">
                        Total
                      </div>
                      <div className="text-2xl font-bold font-heading text-slate-900">
                        LKR{" "}
                        {(currentOrder?.pricing?.total ?? 0).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Customer Card */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-100 mb-4">
                    <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3">
                      Customer
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-electric flex items-center justify-center text-white font-bold text-lg shadow-sm">
                        {currentOrder?.customer?.name?.[0] || "G"}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">
                          {currentOrder?.customer?.name || "Guest"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {currentOrder?.customer?.phone || "—"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-slate-600 pt-3 border-t border-slate-50">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span>
                        {currentOrder?.shippingAddress?.street ?? "—"},{" "}
                        {currentOrder?.shippingAddress?.city ?? "—"}
                      </span>
                    </div>
                  </div>

                  {/* Packing Checklist */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-100 mb-4">
                    <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Gift className="w-3.5 h-3.5" /> Packing Checklist (
                      {currentOrder?.items?.length ?? 0})
                    </div>
                    <div className="space-y-2">
                      {currentOrder?.items?.map((item, i) => {
                        const packed = isItemPacked(currentOrder._id, i);
                        return (
                          <div
                            key={i}
                            onClick={() => togglePacked(currentOrder._id, i)}
                            className={`p-3 rounded-xl border cursor-pointer flex justify-between items-center transition-all ${
                              packed
                                ? "bg-emerald-50 border-emerald-200 opacity-70"
                                : "bg-slate-50 border-slate-100 hover:border-electric/40 hover:shadow-sm"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${
                                  packed
                                    ? "bg-emerald-500 border-emerald-500 text-white"
                                    : "bg-white border-slate-200 text-transparent"
                                }`}
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                              </div>
                              <span
                                className={`text-sm font-medium ${packed ? "text-slate-400 line-through" : "text-slate-800"}`}
                              >
                                {item?.name ?? "Unknown Item"}
                              </span>
                            </div>
                            <span className="text-xs font-medium text-slate-400">
                              Qty: {item?.quantity ?? 0}
                            </span>
                          </div>
                        );
                      }) ?? (
                        <p className="text-sm text-slate-400 text-center">
                          No items.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status Control */}
                  {currentStatusIdx < statuses.length - 1 && (
                    <button
                      onClick={() =>
                        handleStatusUpdate(
                          currentOrder._id,
                          statuses[currentStatusIdx + 1],
                        )
                      }
                      className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                        currentOrder?.orderStatus === "processing" &&
                        !allItemsPacked
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-dashed border-slate-200"
                          : "bg-electric hover:bg-electric-dark text-white shadow-sm hover:shadow-md"
                      }`}
                    >
                      {currentOrder?.orderStatus === "processing" &&
                      !allItemsPacked
                        ? "Complete Checklist First"
                        : `Advance to ${statuses[currentStatusIdx + 1].replace(/_/g, " ")}`}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersList;
