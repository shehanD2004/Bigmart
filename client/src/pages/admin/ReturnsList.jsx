import { useState, useEffect } from "react";
import {
  useGetReturnsQuery,
  useUpdateReturnStatusMutation,
} from "../../features/api/adminApiSlice";
import {
  Search,
  Clock,
  CheckCircle,
  Package,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Filter,
  RotateCcw,
} from "lucide-react";

const ReturnsList = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading, isError, error } = useGetReturnsQuery({
    page,
    status: statusFilter,
  });

  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateReturnStatusMutation();

  const handleStatusUpdate = async (returnId, newStatus) => {
    let refundAmount = 0;
    let refundMethod = "";

    if (newStatus === "approved") {
      const amountStr = window.prompt(
        `Enter approved refund amount ($):`,
        "0.00",
      );
      if (amountStr === null) return;
      refundAmount = Number(amountStr) || 0;
      refundMethod =
        window.prompt(
          `Enter refund method (e.g. Original Payment, Store Credit):`,
          "Original Payment",
        ) || "Store Credit";
    }

    const note = window.prompt(
      `Enter a note for status update to "${newStatus}":`,
      `Status updated to ${newStatus}`,
    );
    if (note !== null) {
      try {
        await updateStatus({
          id: returnId,
          status: newStatus,
          notes: note,
          refundAmount,
          refundMethod,
        }).unwrap();
      } catch (err) {
        console.error("Failed to update status", err);
        alert(err.data?.message || "Failed to update return status.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin text-electric w-12 h-12" />
        <span className="ml-4 text-slate-500 font-medium text-lg">
          Loading return requests...
        </span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 bg-white rounded-2xl shadow-sm border border-rose-100 flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Failed to load returns
        </h2>
        <p className="text-slate-500 max-w-md">
          {error?.data?.message ||
            "Something went wrong. Please check your connection and try again."}
        </p>
      </div>
    );
  }

  const returns = data?.data || [];
  const pagination = { page: data?.page || 1, pages: data?.pages || 1 };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "reviewing":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "approved":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "rejected":
        return "bg-rose-100 text-rose-700 border-rose-200";
      case "completed":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const statusOptions = [
    "pending",
    "reviewing",
    "approved",
    "rejected",
    "completed",
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
          Returns
        </h1>
        <p className="text-slate-500 mt-1">
          Manage customer return requests and refunds.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Filters */}
        <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-50">
          <div className="flex-1"></div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <Filter className="text-slate-400 w-5 h-5 hidden sm:block" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full lg:w-48 p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 text-sm"
            >
              <option value="">All Statuses</option>
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt.charAt(0).toUpperCase() +
                    opt.slice(1).replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {returns.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <RotateCcw className="w-16 h-16 text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                No return requests found
              </h3>
              <p className="text-slate-500">
                Either there are no returns yet or none match your filters.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                  <th className="p-4 px-6">Return Details</th>
                  <th className="p-4 px-6">Customer</th>
                  <th className="p-4 px-6">Reason & Items</th>
                  <th className="p-4 px-6 text-center">Refund</th>
                  <th className="p-4 px-6">Status</th>
                  <th className="p-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {returns.map((ret) => (
                  <tr
                    key={ret._id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="p-4 px-6">
                      <div className="font-bold text-slate-900 text-sm">
                        {ret.order?.orderNumber || "Unknown Order"}
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(ret.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4 px-6">
                      <div className="text-sm font-medium text-slate-800">
                        {ret.customer?.name || "Guest User"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {ret.customer?.email}
                      </div>
                    </td>
                    <td className="p-4 px-6">
                      <div className="text-sm text-slate-800 font-medium truncate max-w-xs">
                        {ret.reason}
                      </div>
                      <div className="text-xs text-slate-500">
                        {ret.items?.length || 0}{" "}
                        {ret.items?.length === 1 ? "item" : "items"}
                      </div>
                    </td>
                    <td className="p-4 px-6 text-center">
                      <div className="font-bold text-slate-900">
                        {ret.refundAmount > 0
                          ? `Rs. ${ret.refundAmount.toFixed(2)}`
                          : "-"}
                      </div>
                    </td>
                    <td className="p-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold leading-none border ${getStatusColor(ret.status)}`}
                      >
                        {ret.status.charAt(0).toUpperCase() +
                          ret.status.slice(1).replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="p-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="relative group/actions inline-block pt-1">
                          <button
                            className="p-2 text-slate-400 hover:text-electric hover:bg-electric/10 rounded-lg transition-colors"
                            title="Update Status"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          <div className="absolute right-0 mt-0 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-20 hidden group-hover/actions:block py-2 animate-in fade-in zoom-in-95 duration-200">
                            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">
                              Set Status
                            </div>
                            {statusOptions.map((status) => (
                              <button
                                key={status}
                                onClick={() =>
                                  handleStatusUpdate(ret._id, status)
                                }
                                className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 ${ret.status === status ? "text-electric" : "text-slate-600"}`}
                              >
                                {ret.status === status && (
                                  <CheckCircle className="w-3 h-3" />
                                )}
                                {status.charAt(0).toUpperCase() +
                                  status.slice(1).replace(/_/g, " ")}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
            <span className="text-sm text-slate-500 font-medium">
              Page <span className="text-slate-900">{pagination.page}</span> of{" "}
              <span className="text-slate-900">{pagination.pages}</span>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setPage((p) => Math.min(pagination.pages, p + 1))
                }
                disabled={page === pagination.pages}
                className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReturnsList;
